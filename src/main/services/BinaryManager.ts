import {execFile} from 'node:child_process'
import {constants as fsConstants} from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {promisify} from 'node:util'
import {app} from 'electron'
import got from 'got'
import log from 'electron-log/main.js'

const execFileAsync = promisify(execFile)

import {trackMain} from '@main/services/analytics.js'
import {FAILURE_CODE, type BinaryOverrides, type DependencyAttempt, type DependencyDiagnostic, type DependencyFailure, type DependencyId, type DependencySource, type StatusKey} from '@shared/types.js'
import {probeArgs, probeBinary, probeTimeoutMs, whereOnPath, classifyProbeError, cancelError, fallbackPathCandidates} from './binary/BinaryProbe.js'
import {
	classifyDownloadError,
	downloadErrorDetails,
	downloadFile,
	downloadText,
	parseShaLine,
	parseStandaloneSha256,
	parsePowerShellFileHash,
	parseTagFromLocation,
	sha256ForFile,
	wrapDownloadProgressEmitter,
	parseContentRangeStart,
	resolvePartialResponseMode,
	HTTP_HEADERS,
	HTTP_RETRY,
	HTTP_TIMEOUT,
	type DownloadProgressCallback,
	type ProgressEmitter
} from './binary/BinaryDownloader.js'
import {installYtDlpWithHomebrew} from './binary/HomebrewRepair.js'
import {ManagedSetupError, managedSetupCause, managedSetupStep, sourceTelemetry, withManagedSetupStep} from './binary/ManagedSetup.js'
import {installYtDlpWithWinget} from './binary/WingetRepair.js'
import {currentDenoTarget, denoExecutableName, denoManagedSourcePlans, DENO_SOURCES, fetchDenoLandLatestVersion, unsupportedDenoFailure} from './binary/DenoBinarySource.js'
import {fetchSourceForgeLatestYtDlpVersion, YT_DLP_SOURCES, ytDlpManagedSourcePlans, ytDlpAssetName} from './binary/YtDlpBinarySource.js'
import type {ManagedSourcePlan, ManagedVersionCheck} from './binary/ManagedSourcePlan.js'
import {ZippedBinaryInstaller} from './binary/ZippedBinaryInstaller.js'

function stringifyHeader(header: string | string[] | undefined): string | null {
	if (!header) return null
	return Array.isArray(header) ? (header[0] ?? null) : header
}

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void

type RemoteVersionLookup = {tag: string; reason: null} | {tag: null; reason: string}

type YtDlpVersionCheck = {state: 'up-to-date'; local: string} | {state: 'outdated'; local: string; remote: string} | {state: 'unknown'; local: string; reason: string} | {state: 'unusable'}

interface ResolveOptions {
	overrides?: BinaryOverrides
	onStatus?: StatusReporter
	onProgress?: ProgressEmitter
	signal?: AbortSignal
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err)
}

function makeAttempt(source: DependencySource, failure?: DependencyFailure): DependencyAttempt {
	return failure ? {source, failure} : {source}
}

function runnableDiagnostic(id: DependencyId, source: DependencySource, resolvedPath: string, attempts: DependencyAttempt[], versionOutput?: string): DependencyDiagnostic {
	return {id, state: 'runnable', source, resolvedPath, versionOutput, attempts}
}

function failedDiagnostic(id: DependencyId, attempts: DependencyAttempt[]): DependencyDiagnostic {
	const last = attempts.length > 0 ? attempts[attempts.length - 1] : undefined
	return {id, state: 'failed', source: last?.source ?? null, resolvedPath: null, failure: last?.failure, attempts}
}

function makeDownloadProgress(id: DependencyId, source: DependencySource, onProgress: ProgressEmitter | undefined): DownloadProgressCallback | undefined {
	if (!onProgress) return undefined
	return (downloaded, total): void => {
		onProgress({binary: id, phase: 'downloading', bytesDownloaded: downloaded, totalBytes: total, source})
	}
}

const logger = log.scope('binary')
// Keep slow-probe analytics aligned with BinaryProbe's global probe timeout.
const SLOW_BINARY_PROBE_ANALYTICS_THRESHOLD_MS = 30_000

function binaryTelemetryId(id: DependencyId): string {
	return id === 'yt-dlp' ? 'ytdlp' : id
}

function trackBinaryProbeAnomaly(id: DependencyId, source: DependencySource, outcome: 'failed' | 'slow_success', elapsedMs: number, timeoutMs: number, failure?: DependencyFailure): void {
	const props: Record<string, string | number | boolean> = {binary: binaryTelemetryId(id), outcome, ...sourceTelemetry(source), elapsed_ms: elapsedMs, timeout_ms: timeoutMs}
	if (failure) {
		props.failure_kind = failure.kind
		props.code = FAILURE_CODE[failure.kind]
	}
	trackMain('binary_probe_anomaly', props)
}

// Resolve absolute path to a build-time-embedded ffmpeg/ffprobe binary.
//
// Production: binaries ship via electron-builder `extraResources`, so they
// land in `process.resourcesPath` (Mac: Arroxy.app/Contents/Resources, Win:
// <install>/resources, Linux AppImage: /tmp/.mount_*/resources).
//
// Development: scripts/build/fetch-embedded.sh populates
// build/embedded/<platform>-<arch>/ once before `bun run dev`, so the
// dev branch reads from there to mirror the production layout.
function bundledBinaryPath(name: 'ffmpeg' | 'ffprobe'): string {
	const ext = process.platform === 'win32' ? '.exe' : ''
	const fileName = `${name}${ext}`
	if (app.isPackaged) {
		return path.join(process.resourcesPath, fileName)
	}
	const arch = process.arch === 'arm64' ? 'arm64' : 'x64'
	// import.meta.dirname in dev points at the electron-vite-compiled main
	// bundle (out/main). Resolve up to repo root, then into build/embedded/.
	return path.join(import.meta.dirname, '..', '..', 'build', 'embedded', `${process.platform}-${arch}`, fileName)
}

// Directory containing the embedded ffmpeg/ffprobe pair. Used by
// spawnYtDlp + spawnFFmpeg to set LD_LIBRARY_PATH (Linux) so BtbN's
// shared libav*.so.* siblings resolve.
interface EnsureBinaryConfig {
	name: string
	destinationPath: string
	downloadUrl: string
	expectedSha256?: () => Promise<string | null>
	onStatus?: StatusReporter
	onDownloadProgress?: DownloadProgressCallback
	requiredChecksum?: boolean
	isUpToDate?: () => Promise<boolean>
	signal?: AbortSignal
}

export class BinaryManager {
	private readonly cacheDir: string

	private readonly retryDelays: [number, number]

	private readonly inProgress = new Map<string, Promise<void>>()

	private readonly zippedInstaller = new ZippedBinaryInstaller()

	private readonly overridesProvider: () => BinaryOverrides | undefined

	private resolved: Partial<Record<DependencyId, string>> = {}

	private lastDiagnostics: Partial<Record<DependencyId, DependencyDiagnostic>> = {}

	constructor(userDataPath: string, options?: {retryDelays?: [number, number]; overridesProvider?: () => BinaryOverrides | undefined}) {
		this.cacheDir = path.join(userDataPath, 'runtime-cache', 'binaries')
		this.retryDelays = options?.retryDelays ?? [2000, 8000]
		this.overridesProvider = options?.overridesProvider ?? ((): BinaryOverrides | undefined => undefined)
	}

	getRuntimeCacheDir(): string {
		return this.cacheDir
	}

	getResolvedPath(id: DependencyId): string | null {
		return this.resolved[id] ?? null
	}

	getLastDiagnostic(id: DependencyId): DependencyDiagnostic | null {
		return this.lastDiagnostics[id] ?? null
	}

	invalidateResolved(): void {
		this.resolved = {}
		this.lastDiagnostics = {}
	}

	getYtDlpPath(): string {
		return this.resolved['yt-dlp'] ?? process.env.ARROXY_YT_DLP_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')
	}

	getFfmpegPath(): string {
		return this.resolved.ffmpeg ?? process.env.ARROXY_FFMPEG_PATH ?? bundledBinaryPath('ffmpeg')
	}

	getDenoPath(): string {
		return this.resolved.deno ?? process.env.ARROXY_DENO_PATH ?? path.join(this.cacheDir, denoExecutableName())
	}

	getFfprobePath(): string {
		return this.resolved.ffprobe ?? process.env.ARROXY_FFPROBE_PATH ?? bundledBinaryPath('ffprobe')
	}

	// Probe-and-record helper used by every resolve chain. Runs the binary's
	// version probe; on success records the path in `resolved` and emits a
	// 'done' progress event. On failure records the failure on the last
	// attempt and emits a 'failed' progress event. The resolve chain decides
	// whether to fall through to the next attempt.
	private async probeAndAccept(id: DependencyId, source: DependencySource, candidatePath: string, attempts: DependencyAttempt[], onProgress?: ProgressEmitter, signal?: AbortSignal): Promise<DependencyDiagnostic | null> {
		onProgress?.({binary: id, phase: 'probing', source})
		const args = probeArgs(id)
		const timeoutMs = probeTimeoutMs(id)
		const startedAt = Date.now()
		const probe = await probeBinary(candidatePath, args, timeoutMs, signal)
		const elapsedMs = Date.now() - startedAt
		if (probe.ok) {
			attempts.push(makeAttempt(source))
			this.resolved[id] = candidatePath
			onProgress?.({binary: id, phase: 'done', source})
			const diag = runnableDiagnostic(id, source, candidatePath, attempts, probe.output)
			this.lastDiagnostics[id] = diag
			logger.info(`${id} probe ok`, {source, path: candidatePath, args, elapsedMs, version: probe.output.split('\n')[0]})
			if (elapsedMs > SLOW_BINARY_PROBE_ANALYTICS_THRESHOLD_MS) {
				trackBinaryProbeAnomaly(id, source, 'slow_success', elapsedMs, timeoutMs)
			}
			return diag
		}
		attempts.push(makeAttempt(source, probe.failure))
		onProgress?.({binary: id, phase: 'failed', source, failureKind: probe.failure.kind})
		logger.warn(`${id} probe failed`, {source, path: candidatePath, args, timeoutMs, elapsedMs, failureKind: probe.failure.kind, message: probe.failure.message})
		trackBinaryProbeAnomaly(id, source, 'failed', elapsedMs, timeoutMs, probe.failure)
		return null
	}

	async resolveYtDlp(opts: ResolveOptions = {}): Promise<DependencyDiagnostic> {
		const id: DependencyId = 'yt-dlp'
		const attempts: DependencyAttempt[] = []
		const overrides = opts.overrides ?? this.overridesProvider()
		const onProgress = opts.onProgress
		const signal = opts.signal
		onProgress?.({binary: id, phase: 'starting'})

		if (overrides?.ytDlp) {
			const source: DependencySource = {kind: 'manualOverride', path: overrides.ytDlp}
			const diag = await this.probeAndAccept(id, source, overrides.ytDlp, attempts, onProgress, signal)
			if (diag) return diag
		}

		const envPath = process.env.ARROXY_YT_DLP_PATH
		if (envPath) {
			const source: DependencySource = {kind: 'envOverride', path: envPath, envVar: 'ARROXY_YT_DLP_PATH'}
			const diag = await this.probeAndAccept(id, source, envPath, attempts, onProgress, signal)
			if (diag) return diag
		}

		if (ytDlpAssetName()) {
			for (const plan of ytDlpManagedSourcePlans(this.cacheDir, {sourceForgeVersion: null})) {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- managed sources are tried in fallback order
				const diag = await this.tryManagedSourcePlan(plan, attempts, opts, onProgress, signal)
				if (diag) return diag
				onProgress?.({binary: id, phase: 'fallback'})
			}

			const sourceForgeVersion = await this.getSourceForgeLatestYtDlpVersion(signal)
			if (sourceForgeVersion) {
				const sourceForgePlan = ytDlpManagedSourcePlans(this.cacheDir, {sourceForgeVersion}).find(plan => plan.source.provider === 'sourceforge')
				if (sourceForgePlan) {
					const diag = await this.tryManagedSourcePlan(sourceForgePlan, attempts, opts, onProgress, signal)
					if (diag) return diag
				}
			} else {
				const source: DependencySource = {kind: 'managed', channel: 'stable', provider: YT_DLP_SOURCES.stableSourceForge.provider, url: YT_DLP_SOURCES.stableSourceForge.rss}
				this.recordManagedFailure(id, attempts, source, onProgress, new Error('Could not determine latest yt-dlp SourceForge mirror version'), 0)
			}
		}

		// System PATH — last resort. Picks up brew/pipx/distro-package installs
		// when managed download is unreachable (firewalled, rate-limited, etc.).
		onProgress?.({binary: id, phase: 'fallback'})
		const pathBinaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
		const candidates = await whereOnPath(pathBinaryName, signal)
		for (const candidate of candidates) {
			const source: DependencySource = {kind: 'systemPath', path: candidate}
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- PATH candidates are accepted in PATH order
			const diag = await this.probeAndAccept(id, source, candidate, attempts, onProgress, signal)
			if (diag) return diag
		}

		const diag = failedDiagnostic(id, attempts)
		this.lastDiagnostics[id] = diag
		return diag
	}

	// Wraps a managed-download attempt, recording download/extract/hash failures
	// as attempts on the chain. Returns true if the file is on disk after the
	// call (probe still has to run separately).
	private recordManagedFailure(id: DependencyId, attempts: DependencyAttempt[], source: DependencySource, onProgress: ProgressEmitter | undefined, err: unknown, elapsedMs: number): void {
		const cause = managedSetupCause(err)
		const failure: DependencyFailure = {kind: classifyDownloadError(cause), message: errorMessage(cause)}
		attempts.push(makeAttempt(source, failure))
		onProgress?.({binary: id, phase: 'failed', source, failureKind: failure.kind})
		const tracked = id === 'yt-dlp' ? 'ytdlp' : id
		trackMain('binary_setup_failed', {binary: tracked, phase: failure.kind, code: FAILURE_CODE[failure.kind], operation: 'managed-download', setup_step: managedSetupStep(err), ...sourceTelemetry(source), elapsed_ms: elapsedMs, ...downloadErrorDetails(cause)})
		logger.warn(`${id} managed download failed`, {source, setupStep: managedSetupStep(err), elapsedMs, error: failure.message})
	}

	private async tryManagedDownload(id: DependencyId, attempts: DependencyAttempt[], source: DependencySource, onProgress: ProgressEmitter | undefined, run: () => Promise<void>): Promise<boolean> {
		onProgress?.({binary: id, phase: 'downloading', source})
		const startedAt = Date.now()
		try {
			await run()
			onProgress?.({binary: id, phase: 'extracting', source})
			return true
		} catch (err) {
			this.recordManagedFailure(id, attempts, source, onProgress, err, Date.now() - startedAt)
			return false
		}
	}

	private async tryManagedSourcePlan(plan: ManagedSourcePlan, attempts: DependencyAttempt[], opts: ResolveOptions, onProgress: ProgressEmitter | undefined, signal: AbortSignal | undefined): Promise<DependencyDiagnostic | null> {
		const downloadOk = await this.tryManagedDownload(plan.id, attempts, plan.source, onProgress, () => this.ensureManagedSourcePlan(plan, opts, onProgress, signal))
		if (!downloadOk) {
			if (await this.isUsableBinary(plan.destinationPath)) {
				logger.warn(`Using existing ${plan.name} after managed update failed`, {source: plan.source, path: plan.destinationPath})
				return this.probeAndAccept(plan.id, plan.source, plan.destinationPath, attempts, onProgress, signal)
			}
			return null
		}
		return this.probeAndAccept(plan.id, plan.source, plan.destinationPath, attempts, onProgress, signal)
	}

	private async ensureManagedSourcePlan(plan: ManagedSourcePlan, opts: ResolveOptions, onProgress: ProgressEmitter | undefined, signal: AbortSignal | undefined): Promise<void> {
		if (plan.installKind === 'file') {
			const versionCheck = plan.versionCheck
			return this.ensureBinary({
				name: plan.name,
				destinationPath: plan.destinationPath,
				downloadUrl: plan.downloadUrl,
				expectedSha256: async () => plan.parseChecksum(await downloadText(plan.checksumUrl, signal)),
				onStatus: opts.onStatus,
				onDownloadProgress: makeDownloadProgress(plan.id, plan.source, onProgress),
				requiredChecksum: plan.requiredChecksum,
				isUpToDate: versionCheck ? () => this.isManagedPlanUpToDate(plan.destinationPath, versionCheck, signal) : undefined,
				signal
			})
		}

		const expectedSha256 = await withManagedSetupStep('checksum_lookup', async () => {
			const checksumText = await downloadText(plan.checksumUrl, signal)
			return plan.parseChecksum(checksumText)
		})
		if (!expectedSha256 && plan.requiredChecksum) {
			throw new ManagedSetupError('checksum_lookup', new Error(`Checksum source unavailable for ${plan.name}. Refusing to use unverified archive.`))
		}
		if (!expectedSha256) {
			logger.warn(`Checksum unavailable for ${plan.name}, proceeding without verification`)
		}
		logger.info(`Downloading ${plan.name}`, {downloadUrl: plan.downloadUrl, destinationPath: plan.destinationPath})
		return this.zippedInstaller.ensure({
			name: plan.name,
			downloadUrl: plan.downloadUrl,
			archiveFileName: plan.archiveFileName,
			innerExecutableName: plan.innerExecutableName,
			destinationPath: plan.destinationPath,
			expectedSha256: expectedSha256 ?? undefined,
			onStatus: opts.onStatus,
			onDownloadProgress: makeDownloadProgress(plan.id, plan.source, onProgress),
			signal
		})
	}

	private async isManagedPlanUpToDate(binaryPath: string, versionCheck: ManagedVersionCheck, signal?: AbortSignal): Promise<boolean> {
		switch (versionCheck.kind) {
			case 'githubLatest':
				return this.isYtDlpUpToDate(binaryPath, versionCheck.latestUrl, signal)
			case 'exactTag':
				return this.isYtDlpUpToDateAgainstTag(binaryPath, versionCheck.tag, signal)
		}
	}

	async ensureYtDlp(onStatus?: StatusReporter, onDownloadProgress?: DownloadProgressCallback): Promise<string> {
		if (this.resolved['yt-dlp']) return this.resolved['yt-dlp']
		const onProgress: ProgressEmitter | undefined = onDownloadProgress
			? (event): void => {
					if (event.phase === 'downloading' && typeof event.bytesDownloaded === 'number') {
						onDownloadProgress(event.bytesDownloaded, event.totalBytes)
					}
				}
			: undefined
		const diag = await this.resolveYtDlp({onStatus, onProgress})
		if (diag.state !== 'runnable' || !diag.resolvedPath) {
			throw new Error(diag.failure?.message ?? 'yt-dlp could not be resolved')
		}
		return diag.resolvedPath
	}

	async installYtDlpWithHomebrew(): Promise<string> {
		return installYtDlpWithHomebrew()
	}

	async installYtDlpWithWinget(): Promise<string> {
		return installYtDlpWithWinget()
	}

	// ffmpeg + ffprobe ship via electron-builder extraResources at build time.
	// Resolve order per binary: manualOverride → envOverride → bundled probe.
	// No download/extract/checksum/retry — fetch-embedded.sh did all that during
	// CI build. Pair coherence solved by construction (one matched archive →
	// both binaries land together in process.resourcesPath).
	async resolveFFmpegPair(opts: ResolveOptions = {}): Promise<{ffmpeg: DependencyDiagnostic; ffprobe: DependencyDiagnostic}> {
		const overrides = opts.overrides ?? this.overridesProvider()
		const onProgress = opts.onProgress
		const signal = opts.signal

		const resolveOne = async (id: 'ffmpeg' | 'ffprobe', overridePath: string | undefined, envVar: string): Promise<DependencyDiagnostic> => {
			const attempts: DependencyAttempt[] = []
			onProgress?.({binary: id, phase: 'starting'})

			if (overridePath) {
				const source: DependencySource = {kind: 'manualOverride', path: overridePath}
				const diag = await this.probeAndAccept(id, source, overridePath, attempts, onProgress, signal)
				if (diag) return diag
			}

			const envPath = process.env[envVar]
			if (envPath) {
				const source: DependencySource = {kind: 'envOverride', path: envPath, envVar}
				const diag = await this.probeAndAccept(id, source, envPath, attempts, onProgress, signal)
				if (diag) return diag
			}

			const bundled = bundledBinaryPath(id)
			const source: DependencySource = {kind: 'bundled', path: bundled}
			const diag = await this.probeAndAccept(id, source, bundled, attempts, onProgress, signal)
			if (diag) return diag

			onProgress?.({binary: id, phase: 'fallback'})
			const binaryName = process.platform === 'win32' ? `${id}.exe` : id
			const pathCandidates = await whereOnPath(binaryName, signal)
			for (const candidate of pathCandidates) {
				const pathSource: DependencySource = {kind: 'systemPath', path: candidate}
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- PATH candidates are accepted in PATH order
				const pathDiag = await this.probeAndAccept(id, pathSource, candidate, attempts, onProgress, signal)
				if (pathDiag) return pathDiag
			}

			const failed = failedDiagnostic(id, attempts)
			this.lastDiagnostics[id] = failed
			return failed
		}

		const [ffmpeg, ffprobe] = await Promise.all([resolveOne('ffmpeg', overrides?.ffmpeg, 'ARROXY_FFMPEG_PATH'), resolveOne('ffprobe', overrides?.ffprobe, 'ARROXY_FFPROBE_PATH')])
		return {ffmpeg, ffprobe}
	}

	async ensureFFmpeg(onStatus?: StatusReporter, onDownloadProgress?: DownloadProgressCallback): Promise<string | null> {
		if (this.resolved.ffmpeg) return this.resolved.ffmpeg
		const onProgress = wrapDownloadProgressEmitter(onDownloadProgress)
		const pair = await this.resolveFFmpegPair({onStatus, onProgress})
		return pair.ffmpeg.resolvedPath
	}

	async ensureFFprobe(onStatus?: StatusReporter, onDownloadProgress?: DownloadProgressCallback): Promise<string | null> {
		if (this.resolved.ffprobe) return this.resolved.ffprobe
		const onProgress = wrapDownloadProgressEmitter(onDownloadProgress)
		const pair = await this.resolveFFmpegPair({onStatus, onProgress})
		return pair.ffprobe.resolvedPath
	}

	// Deno is the JS runtime yt-dlp uses for nsig/signature decoding on the web
	// client. It is a required Arroxy dependency: resolver failures should
	// surface as blocking diagnostics instead of silently omitting
	// --js-runtimes.
	async resolveDeno(opts: ResolveOptions = {}): Promise<DependencyDiagnostic> {
		const id: DependencyId = 'deno'
		const overrides = opts.overrides ?? this.overridesProvider()
		const onProgress = opts.onProgress
		const signal = opts.signal
		const attempts: DependencyAttempt[] = []
		onProgress?.({binary: id, phase: 'starting'})

		if (overrides?.deno) {
			const source: DependencySource = {kind: 'manualOverride', path: overrides.deno}
			const diag = await this.probeAndAccept(id, source, overrides.deno, attempts, onProgress, signal)
			if (diag) return diag
		}

		const envPath = process.env.ARROXY_DENO_PATH
		if (envPath) {
			const source: DependencySource = {kind: 'envOverride', path: envPath, envVar: 'ARROXY_DENO_PATH'}
			const diag = await this.probeAndAccept(id, source, envPath, attempts, onProgress, signal)
			if (diag) return diag
		}

		const target = currentDenoTarget()
		const targetPath = path.join(this.cacheDir, denoExecutableName(target ?? process.platform))
		if (await this.isUsableBinary(targetPath)) {
			const cacheSource: DependencySource = {kind: 'cache', path: targetPath}
			const cacheDiag = await this.probeAndAccept(id, cacheSource, targetPath, attempts, onProgress, signal)
			if (cacheDiag) return cacheDiag
		}

		if (!target) {
			const failure = unsupportedDenoFailure()
			attempts.push(makeAttempt({kind: 'managed', channel: 'default', provider: DENO_SOURCES.denoGithub.provider, url: DENO_SOURCES.denoGithub.download}, failure))
			const diag = failedDiagnostic(id, attempts)
			this.lastDiagnostics[id] = diag
			onProgress?.({binary: id, phase: 'skipped'})
			return diag
		}

		const denoLandVersion = await this.getDenoLandLatestVersion(signal)
		if (!denoLandVersion) {
			const source: DependencySource = {kind: 'managed', channel: 'default', provider: DENO_SOURCES.denoLand.provider, url: DENO_SOURCES.denoLand.latest}
			this.recordManagedFailure(id, attempts, source, onProgress, new Error('Could not determine latest deno version from dl.deno.land'), 0)
		}
		for (const plan of denoManagedSourcePlans(this.cacheDir, target, {denoLandVersion})) {
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- managed sources are tried in fallback order
			const diag = await this.tryManagedSourcePlan(plan, attempts, opts, onProgress, signal)
			if (diag) return diag
			onProgress?.({binary: id, phase: 'fallback'})
		}

		const diag = failedDiagnostic(id, attempts)
		this.lastDiagnostics[id] = diag
		return diag
	}

	async ensureDeno(onStatus?: StatusReporter, onDownloadProgress?: DownloadProgressCallback): Promise<string> {
		if (this.resolved.deno) return this.resolved.deno
		const onProgress = wrapDownloadProgressEmitter(onDownloadProgress)
		const diag = await this.resolveDeno({onStatus, onProgress})
		if (diag.state !== 'runnable' || !diag.resolvedPath) {
			throw new Error(diag.failure?.message ?? 'deno could not be resolved')
		}
		return diag.resolvedPath
	}

	private async ensureBinary(config: EnsureBinaryConfig): Promise<void> {
		const {destinationPath, name} = config

		if (await this.isUsableBinary(destinationPath)) {
			const upToDate = !config.isUpToDate || (await config.isUpToDate())
			if (upToDate) {
				logger.info(`${name} binary already exists`, {destinationPath})
				return
			}
			logger.info(`${name} binary is outdated, re-downloading`)
		}

		const existing = this.inProgress.get(destinationPath)
		if (existing) return existing

		const promise = this.downloadBinary(config).finally(() => {
			this.inProgress.delete(destinationPath)
		})
		this.inProgress.set(destinationPath, promise)
		return promise
	}

	private async downloadBinary(config: EnsureBinaryConfig): Promise<void> {
		const maxAttempts = 3
		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			if (config.signal?.aborted) throw new ManagedSetupError('preflight', cancelError())
			try {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- retry attempts depend on prior failure and backoff
				await this.attemptDownload(config)
				return
			} catch (err) {
				if (config.signal?.aborted) throw err
				const isChecksumError = err instanceof Error && err.message.toLowerCase().includes('checksum')
				if (isChecksumError || attempt === maxAttempts) throw err
				const delay = attempt === 1 ? this.retryDelays[0] : this.retryDelays[1]
				logger.warn(`${config.name} download failed, retrying in ${delay}ms`, {attempt, error: err instanceof Error ? err.message : String(err)})
				await new Promise(r => setTimeout(r, delay))
			}
		}
	}

	private async attemptDownload(config: EnsureBinaryConfig): Promise<void> {
		const {destinationPath, name, downloadUrl, expectedSha256, onStatus, onDownloadProgress, requiredChecksum = false, signal} = config

		const tempPath = `${destinationPath}.tmp`
		onStatus?.('downloadingBinary', {name})
		logger.info(`Downloading ${name}`, {downloadUrl, destinationPath})

		await withManagedSetupStep('download', () => downloadFile(downloadUrl, tempPath, onDownloadProgress, true, signal))

		if (expectedSha256) {
			const expected = await withManagedSetupStep('checksum_lookup', () => expectedSha256())
			if (!expected && requiredChecksum) {
				await fsPromises.rm(tempPath, {force: true})
				throw new ManagedSetupError('checksum_lookup', new Error(`Checksum source unavailable for ${name}. Refusing to use unverified binary.`))
			}

			if (expected) {
				const actual = await withManagedSetupStep('checksum_verify', () => sha256ForFile(tempPath))
				if (actual !== expected) {
					await fsPromises.rm(tempPath, {force: true})
					throw new ManagedSetupError('checksum_verify', new Error(`${name} checksum mismatch. Expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...`))
				}
			} else {
				logger.warn(`Checksum unavailable for ${name}, proceeding without verification`)
			}
		}

		await withManagedSetupStep('install', async () => {
			await fsPromises.mkdir(path.dirname(destinationPath), {recursive: true})
			await fsPromises.rename(tempPath, destinationPath)

			if (process.platform !== 'win32') {
				await fsPromises.chmod(destinationPath, 0o755)
			}
		})
	}

	private async isYtDlpUpToDate(binaryPath: string, releaseLatestUrl: string, signal?: AbortSignal): Promise<boolean> {
		const result = await this.checkYtDlpVersion(binaryPath, releaseLatestUrl, signal)
		switch (result.state) {
			case 'up-to-date':
				logger.info('yt-dlp is up to date', {version: result.local})
				return true
			case 'outdated':
				logger.info('yt-dlp update available', {local: result.local, remote: result.remote})
				return false
			case 'unknown':
				logger.warn('yt-dlp version check unknown, keeping existing binary', {reason: result.reason})
				return true
			case 'unusable':
				logger.warn('yt-dlp local binary unusable, will re-download')
				return false
		}
	}

	private async isYtDlpUpToDateAgainstTag(binaryPath: string, remoteTag: string, signal?: AbortSignal): Promise<boolean> {
		const local = await this.getLocalYtDlpVersion(binaryPath, signal)
		if (!local) {
			logger.warn('yt-dlp local binary unusable, will re-download')
			return false
		}
		if (local !== remoteTag) {
			logger.info('yt-dlp update available', {local, remote: remoteTag})
			return false
		}
		logger.info('yt-dlp is up to date', {version: local})
		return true
	}

	private async checkYtDlpVersion(binaryPath: string, releaseLatestUrl: string, signal?: AbortSignal): Promise<YtDlpVersionCheck> {
		const [local, remote] = await Promise.all([this.getLocalYtDlpVersion(binaryPath, signal), this.getRemoteYtDlpVersion(releaseLatestUrl, signal)])
		if (!local) return {state: 'unusable'}
		if (remote.tag === null) return {state: 'unknown', local, reason: remote.reason}
		if (local !== remote.tag) return {state: 'outdated', local, remote: remote.tag}
		return {state: 'up-to-date', local}
	}

	private async getLocalYtDlpVersion(binaryPath: string, signal?: AbortSignal): Promise<string | null> {
		const timeoutMs = probeTimeoutMs('yt-dlp')
		try {
			const {stdout} = await execFileAsync(binaryPath, ['--version'], {timeout: timeoutMs, signal})
			return stdout.trim()
		} catch (err) {
			logger.warn('yt-dlp local version check failed', {path: binaryPath, timeoutMs, error: errorMessage(err)})
			return null
		}
	}

	private async getRemoteYtDlpVersion(releaseLatestUrl: string, signal?: AbortSignal): Promise<RemoteVersionLookup> {
		try {
			const res = await got(releaseLatestUrl, {method: 'GET', headers: HTTP_HEADERS, retry: HTTP_RETRY, timeout: HTTP_TIMEOUT, followRedirect: false, throwHttpErrors: false, signal})
			const tag = parseTagFromLocation(res.headers.location)
			if (tag) return {tag, reason: null}
			const reason = `no tag in redirect (status=${res.statusCode}, location=${stringifyHeader(res.headers.location) ?? 'none'})`
			logger.warn('yt-dlp remote version fetch returned no tag', {url: releaseLatestUrl, statusCode: res.statusCode})
			return {tag: null, reason}
		} catch (err) {
			const reason = err instanceof Error ? err.message : String(err)
			logger.warn('yt-dlp remote version fetch failed', {url: releaseLatestUrl, err: reason})
			return {tag: null, reason}
		}
	}

	private async getSourceForgeLatestYtDlpVersion(signal?: AbortSignal): Promise<string | null> {
		return fetchSourceForgeLatestYtDlpVersion(downloadText, signal)
	}

	private async getDenoLandLatestVersion(signal?: AbortSignal): Promise<string | null> {
		return fetchDenoLandLatestVersion(downloadText, signal)
	}

	private async isUsableBinary(binaryPath: string): Promise<boolean> {
		try {
			const mode = process.platform === 'win32' ? fsConstants.F_OK : fsConstants.X_OK
			await fsPromises.access(binaryPath, mode)
			return true
		} catch {
			return false
		}
	}
}

export const binaryInternals = {parseShaLine, parseStandaloneSha256, parsePowerShellFileHash, parseContentRangeStart, resolvePartialResponseMode, sha256ForFile, classifyProbeError, classifyDownloadError, probeTimeoutMs, whereOnPath, fallbackPathCandidates, bundledBinaryPath}
