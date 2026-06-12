import {constants as fsConstants} from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {app} from 'electron'
import log from 'electron-log/main.js'

import {trackMain} from '@main/services/analytics.js'
import {FAILURE_CODE, type BinaryOverrides, type DependencyAttempt, type DependencyDiagnostic, type DependencyFailure, type DependencyId, type DependencySource, type RuntimeBinaryManifestEntry, type StatusKey} from '@shared/types.js'
import {probeArgs, probeBinary, probeTimeoutMs, whereOnPath, classifyProbeError, fallbackPathCandidates} from './binary/BinaryProbe.js'
import {classifyDownloadError, downloadErrorDetails, parseShaLine, parseStandaloneSha256, parsePowerShellFileHash, sha256ForFile, wrapDownloadProgressEmitter, parseContentRangeStart, resolvePartialResponseMode, type DownloadProgressCallback, type ProgressEmitter} from './binary/BinaryDownloader.js'
import {installYtDlpWithHomebrew} from './binary/HomebrewRepair.js'
import {installYtDlpWithWinget} from './binary/WingetRepair.js'
import {currentDenoTarget, denoExecutableName, unsupportedDenoFailure} from './binary/DenoBinarySource.js'
import {ArtifactMaterializeError, artifactErrorToDependencyFailureKind, type ArtifactErrorCode, RuntimeBinaryMaterializer} from './binary/RuntimeBinaryMaterializer.js'
import {RuntimeBinaryIndexService, type RuntimeBinaryIndexProvider} from './binary/RuntimeBinaryIndexService.js'

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void

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

function sourceTelemetry(source: DependencySource): {source_kind: string; source_channel?: string; source_provider?: string} {
	if (source.kind !== 'managed') return {source_kind: source.kind}
	return {source_kind: source.kind, source_channel: source.channel, source_provider: source.provider}
}

function artifactSetupStep(code: ArtifactErrorCode): 'download' | 'checksum_verify' | 'extract' | 'install' | 'unknown' {
	switch (code) {
		case 'NETWORK':
		case 'TIMEOUT':
		case 'CANCELLED':
			return 'download'
		case 'CHECKSUM':
		case 'SIZE_MISMATCH':
			return 'checksum_verify'
		case 'EXTRACTION':
		case 'ARCHIVE_SECURITY':
		case 'EXECUTABLE_MISSING':
			return 'extract'
		case 'PERMISSION':
			return 'install'
		case 'DISK':
		case 'LOCK':
		case 'UNSUPPORTED_PLATFORM':
		case 'INTERNAL':
			return 'unknown'
	}
}

function managedFailureSetupStep(err: unknown): 'download' | 'checksum_verify' | 'extract' | 'install' | 'unknown' {
	return err instanceof ArtifactMaterializeError ? artifactSetupStep(err.code) : 'unknown'
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

export class BinaryManager {
	private readonly cacheDir: string

	private readonly artifactCacheDir: string

	private readonly runtimeBinaryIndex: RuntimeBinaryIndexProvider

	private readonly runtimeBinaryMaterializer: RuntimeBinaryMaterializer

	private readonly overridesProvider: () => BinaryOverrides | undefined

	private resolved: Partial<Record<DependencyId, string>> = {}

	private lastDiagnostics: Partial<Record<DependencyId, DependencyDiagnostic>> = {}

	constructor(userDataPath: string, options?: {retryDelays?: [number, number]; overridesProvider?: () => BinaryOverrides | undefined; runtimeBinaryIndex?: RuntimeBinaryIndexProvider; runtimeBinaryMaterializer?: RuntimeBinaryMaterializer}) {
		this.cacheDir = path.join(userDataPath, 'runtime-cache', 'binaries')
		this.artifactCacheDir = path.join(userDataPath, 'runtime-cache', 'artifact-cache-v1')
		this.overridesProvider = options?.overridesProvider ?? ((): BinaryOverrides | undefined => undefined)
		this.runtimeBinaryIndex = options?.runtimeBinaryIndex ?? new RuntimeBinaryIndexService(userDataPath)
		this.runtimeBinaryMaterializer = options?.runtimeBinaryMaterializer ?? new RuntimeBinaryMaterializer()
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

		for (const entry of await this.runtimeBinaryIndex.candidatesFor('yt-dlp', signal)) {
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- manifest candidates are tried in approved fallback order
			const diag = await this.tryRuntimeManifestEntry(entry, attempts, opts, onProgress, signal)
			if (diag) return diag
			onProgress?.({binary: id, phase: 'fallback'})
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

	// Records download/extract/hash failures from an approved manifest
	// materialization attempt without collapsing the rest of the resolver chain.
	private recordManagedFailure(id: DependencyId, attempts: DependencyAttempt[], source: DependencySource, onProgress: ProgressEmitter | undefined, err: unknown, elapsedMs: number): void {
		const cause = err
		const failureKind = cause instanceof ArtifactMaterializeError ? artifactErrorToDependencyFailureKind(cause) : classifyDownloadError(cause)
		const failure: DependencyFailure = {kind: failureKind, message: errorMessage(cause)}
		const setupStep = managedFailureSetupStep(cause)
		attempts.push(makeAttempt(source, failure))
		onProgress?.({binary: id, phase: 'failed', source, failureKind: failure.kind})
		const tracked = id === 'yt-dlp' ? 'ytdlp' : id
		trackMain('binary_setup_failed', {binary: tracked, phase: failure.kind, code: FAILURE_CODE[failure.kind], operation: 'managed-download', setup_step: setupStep, ...sourceTelemetry(source), elapsed_ms: elapsedMs, ...downloadErrorDetails(cause)})
		logger.warn(`${id} managed download failed`, {source, setupStep, elapsedMs, error: failure.message})
	}

	private sourceFromRuntimeManifest(entry: RuntimeBinaryManifestEntry): Extract<DependencySource, {kind: 'managed'}> {
		return {kind: 'managed', channel: entry.channel, provider: entry.provider, url: entry.url}
	}

	private async tryRuntimeManifestEntry(entry: RuntimeBinaryManifestEntry, attempts: DependencyAttempt[], opts: ResolveOptions, onProgress: ProgressEmitter | undefined, signal: AbortSignal | undefined): Promise<DependencyDiagnostic | null> {
		const source = this.sourceFromRuntimeManifest(entry)
		const startedAt = Date.now()
		onProgress?.({binary: entry.id, phase: 'downloading', source})
		opts.onStatus?.('downloadingBinary', {name: entry.id})
		try {
			const result = await this.runtimeBinaryMaterializer.materialize(entry, {cacheRoot: this.artifactCacheDir, onDownloadProgress: makeDownloadProgress(entry.id, source, onProgress), onExtracting: () => onProgress?.({binary: entry.id, phase: 'extracting', source}), signal})
			return this.probeAndAccept(entry.id, source, result.executablePath, attempts, onProgress, signal)
		} catch (err) {
			this.recordManagedFailure(entry.id, attempts, source, onProgress, err, Date.now() - startedAt)
			return null
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
			attempts.push(makeAttempt({kind: 'managed', channel: 'default', provider: 'deno-land', url: 'runtime-index'}, failure))
			const diag = failedDiagnostic(id, attempts)
			this.lastDiagnostics[id] = diag
			onProgress?.({binary: id, phase: 'skipped'})
			return diag
		}

		for (const entry of await this.runtimeBinaryIndex.candidatesFor('deno', signal)) {
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- manifest candidates are tried in approved fallback order
			const diag = await this.tryRuntimeManifestEntry(entry, attempts, opts, onProgress, signal)
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
