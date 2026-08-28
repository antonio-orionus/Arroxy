import {constants as fsConstants} from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {app} from 'electron'
import log from 'electron-log/main.js'

import {trackMain} from '@main/services/analytics.js'
import {isEnvironmentFatalFailure} from '@shared/dependencyPolicy.js'
import {FAILURE_CODE, type BinaryOverrides, type DependencyAttempt, type DependencyDiagnostic, type DependencyFailure, type DependencyId, type DependencySource, type RuntimeBinaryManifestEntry, type StatusKey} from '@shared/types.js'
import {probeArgs, probeBinary, probeTimeoutMs, whereOnPath, classifyProbeError, fallbackPathCandidates, type ProbeBudget} from './binary/BinaryProbe.js'
import {ProbeVerdictCache, type ProbeVerdictStore} from './binary/ProbeVerdictCache.js'
import {classifyDownloadError, downloadErrorDetails, parseShaLine, parseStandaloneSha256, parsePowerShellFileHash, sha256ForFile, wrapDownloadProgressEmitter, parseContentRangeStart, resolvePartialResponseMode, type DownloadProgressCallback, type ProgressEmitter} from './binary/BinaryDownloader.js'
import {installYtDlpWithHomebrew} from './binary/HomebrewRepair.js'
import {installYtDlpWithWinget} from './binary/WingetRepair.js'
import {normalizeRuntimeExecutablePath, runtimeBinaryArchFor, runtimeBinaryPlatformFor, validateRuntimeBinaryManifestEntry} from '@shared/runtimeBinaryManifest.js'
import {ArtifactMaterializeError, artifactErrorToDependencyFailureKind, type ArtifactErrorCode, RuntimeBinaryMaterializer, runtimeBinaryCacheKeyHash, runtimeBinaryManifestHash} from './binary/RuntimeBinaryMaterializer.js'
import {RuntimeBinaryIndexService, type RuntimeBinaryIndexProvider} from './binary/RuntimeBinaryIndexService.js'

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void

// What a single candidate attempt tells the chain to do next.
//   accepted         — done, this is the binary.
//   rejected         — this candidate is wrong; the next one may still work.
//   environmentFatal — the machine refused to run it; another candidate will hit
//                      the same wall, so stop paying downloads to find out.
//   cancelled        — the user or a forced re-run aborted; unwind immediately.
export type ProbeOutcome = {kind: 'accepted'; diagnostic: DependencyDiagnostic} | {kind: 'rejected'} | {kind: 'environmentFatal'} | {kind: 'cancelled'}

interface ResolveOptions {
	overrides?: BinaryOverrides
	onStatus?: StatusReporter
	onProgress?: ProgressEmitter
	signal?: AbortSignal
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err)
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
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
// Deliberately independent of the probe timeout. Pinning the two together meant
// a probe had to outlast its own deadline to be reported slow, so 'slow_success'
// could never fire and the 30s macOS probes stayed invisible until a user
// reported the app looping.
const SLOW_BINARY_PROBE_ANALYTICS_THRESHOLD_MS = 5_000
export type RuntimeBinaryMaterializerPort = Pick<RuntimeBinaryMaterializer, 'materialize'>

function binaryTelemetryId(id: DependencyId): string {
	return id === 'yt-dlp' ? 'ytdlp' : id
}

function sourceTelemetry(source: DependencySource): {source_kind: string; source_channel?: string; source_provider?: string} {
	if (source.kind !== 'managed' && source.kind !== 'managedCache') return {source_kind: source.kind}
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

function trackBinaryProbeAnomaly(id: DependencyId, source: DependencySource, outcome: 'failed' | 'slow_success' | 'environment_fatal', elapsedMs: number, timeoutMs: number, attemptIndex: number, failure?: DependencyFailure): void {
	const props: Record<string, string | number | boolean> = {binary: binaryTelemetryId(id), outcome, ...sourceTelemetry(source), elapsed_ms: elapsedMs, timeout_ms: timeoutMs, attempt_index: attemptIndex}
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

	private readonly runtimeBinaryMaterializer: RuntimeBinaryMaterializerPort

	private readonly overridesProvider: () => BinaryOverrides | undefined

	private readonly probeVerdicts: ProbeVerdictStore

	private resolved: Partial<Record<DependencyId, string>> = {}

	private lastDiagnostics: Partial<Record<DependencyId, DependencyDiagnostic>> = {}

	constructor(userDataPath: string, options?: {retryDelays?: [number, number]; overridesProvider?: () => BinaryOverrides | undefined; runtimeBinaryIndex?: RuntimeBinaryIndexProvider; runtimeBinaryMaterializer?: RuntimeBinaryMaterializerPort; probeVerdicts?: ProbeVerdictStore}) {
		this.cacheDir = path.join(userDataPath, 'runtime-cache', 'binaries')
		this.artifactCacheDir = path.join(userDataPath, 'runtime-cache', 'artifact-cache-v1')
		this.overridesProvider = options?.overridesProvider ?? ((): BinaryOverrides | undefined => undefined)
		this.runtimeBinaryIndex = options?.runtimeBinaryIndex ?? new RuntimeBinaryIndexService(userDataPath)
		this.runtimeBinaryMaterializer = options?.runtimeBinaryMaterializer ?? new RuntimeBinaryMaterializer()
		this.probeVerdicts = options?.probeVerdicts ?? new ProbeVerdictCache(path.join(userDataPath, 'runtime-cache'))
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
		// Reached from WarmupService.run({force: true}) — the repair panel's "check
		// again". Dropping the memo is what makes that button able to notice a
		// binary the OS started blocking after we recorded it as good.
		void this.probeVerdicts.clear()
	}

	getYtDlpPath(): string {
		return this.resolved['yt-dlp'] ?? process.env.ARROXY_YT_DLP_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')
	}

	getFfmpegPath(): string {
		return this.resolved.ffmpeg ?? process.env.ARROXY_FFMPEG_PATH ?? bundledBinaryPath('ffmpeg')
	}

	getFfprobePath(): string {
		return this.resolved.ffprobe ?? process.env.ARROXY_FFPROBE_PATH ?? bundledBinaryPath('ffprobe')
	}

	// Probe-and-record helper used by every resolve chain. Runs the binary's
	// version probe, records the outcome on `attempts`, and tells the caller what
	// the result means for the remaining candidates — see ProbeOutcome.
	//
	// A previously recorded verdict for this exact file short-circuits the spawn.
	// The check is not a shortcut around verification: it is the same verification,
	// remembered, and any change to the file invalidates it.
	private async probeAndAccept(id: DependencyId, source: DependencySource, candidatePath: string, attempts: DependencyAttempt[], onProgress?: ProgressEmitter, signal?: AbortSignal, budget: ProbeBudget = 'full'): Promise<ProbeOutcome> {
		onProgress?.({binary: id, phase: 'probing', source})
		const memoized = await this.probeVerdicts.get(candidatePath)
		if (memoized !== null) {
			logger.info(`${id} probe verdict reused`, {source, path: candidatePath, version: memoized.split('\n')[0]})
			return {kind: 'accepted', diagnostic: this.acceptCandidate(id, source, candidatePath, attempts, memoized, onProgress)}
		}

		const args = probeArgs(id)
		const timeoutMs = probeTimeoutMs(id, budget)
		const startedAt = Date.now()
		const probe = await probeBinary(candidatePath, args, timeoutMs, signal)
		const elapsedMs = Date.now() - startedAt
		const attemptIndex = attempts.length
		if (probe.ok) {
			logger.info(`${id} probe ok`, {source, path: candidatePath, args, elapsedMs, version: probe.output.split('\n')[0]})
			if (elapsedMs > SLOW_BINARY_PROBE_ANALYTICS_THRESHOLD_MS) {
				trackBinaryProbeAnomaly(id, source, 'slow_success', elapsedMs, timeoutMs, attemptIndex)
			}
			await this.probeVerdicts.record(candidatePath, probe.output)
			return {kind: 'accepted', diagnostic: this.acceptCandidate(id, source, candidatePath, attempts, probe.output, onProgress)}
		}

		// A cancellation is not a verdict on this candidate. Recorded as an attempt
		// it reaches the repair panel as kind 'timeout', which renders ARX-008 and
		// tells the user the probe timed out — at the user who just pressed Cancel.
		// Same reason the materialize catch above returns early on abort.
		if (probe.cancelled) {
			logger.info(`${id} probe cancelled`, {source, path: candidatePath, elapsedMs})
			return {kind: 'cancelled'}
		}

		attempts.push(makeAttempt(source, probe.failure))
		onProgress?.({binary: id, phase: 'failed', source, failureKind: probe.failure.kind})
		logger.warn(`${id} probe failed`, {source, path: candidatePath, args, timeoutMs, elapsedMs, budget, failureKind: probe.failure.kind, message: probe.failure.message})
		const environmentFatal = isEnvironmentFatalFailure(probe.failure.kind, source)
		trackBinaryProbeAnomaly(id, source, environmentFatal ? 'environment_fatal' : 'failed', elapsedMs, timeoutMs, attemptIndex, probe.failure)
		return environmentFatal ? {kind: 'environmentFatal'} : {kind: 'rejected'}
	}

	private acceptCandidate(id: DependencyId, source: DependencySource, candidatePath: string, attempts: DependencyAttempt[], versionOutput: string, onProgress?: ProgressEmitter): DependencyDiagnostic {
		attempts.push(makeAttempt(source))
		this.resolved[id] = candidatePath
		onProgress?.({binary: id, phase: 'done', source})
		const diag = runnableDiagnostic(id, source, candidatePath, attempts, versionOutput)
		this.lastDiagnostics[id] = diag
		return diag
	}

	async resolveYtDlp(opts: ResolveOptions = {}): Promise<DependencyDiagnostic> {
		const id: DependencyId = 'yt-dlp'
		const attempts: DependencyAttempt[] = []
		const overrides = opts.overrides ?? this.overridesProvider()
		const onProgress = opts.onProgress
		const signal = opts.signal
		onProgress?.({binary: id, phase: 'starting'})

		// Downgrades to 'shortLeash' the moment a probe proves the environment
		// hostile, and stops the chain from buying any further downloads.
		let budget: ProbeBudget = 'full'
		const fail = (): DependencyDiagnostic => {
			const diag = failedDiagnostic(id, attempts)
			this.lastDiagnostics[id] = diag
			return diag
		}

		if (overrides?.ytDlp) {
			const source: DependencySource = {kind: 'manualOverride', path: overrides.ytDlp}
			const outcome = await this.probeAndAccept(id, source, overrides.ytDlp, attempts, onProgress, signal, budget)
			if (outcome.kind === 'accepted') return outcome.diagnostic
			if (outcome.kind === 'cancelled') return fail()
			if (outcome.kind === 'environmentFatal') budget = 'shortLeash'
		}

		const envPath = process.env.ARROXY_YT_DLP_PATH
		if (envPath) {
			const source: DependencySource = {kind: 'envOverride', path: envPath, envVar: 'ARROXY_YT_DLP_PATH'}
			const outcome = await this.probeAndAccept(id, source, envPath, attempts, onProgress, signal, budget)
			if (outcome.kind === 'accepted') return outcome.diagnostic
			if (outcome.kind === 'cancelled') return fail()
			if (outcome.kind === 'environmentFatal') budget = 'shortLeash'
		}

		// Each manifest entry can cost a fresh download before it is probed. Once
		// the environment has refused one binary it will refuse the next, so this
		// is the loop that has to stop — not slow down.
		if (budget === 'full') {
			for (const entry of await this.runtimeBinaryIndex.candidatesFor('yt-dlp', signal)) {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- manifest candidates are tried in approved fallback order
				const outcome = await this.tryRuntimeManifestEntry(entry, attempts, opts, onProgress, signal, budget)
				if (outcome.kind === 'accepted') return outcome.diagnostic
				if (outcome.kind === 'cancelled') return fail()
				if (outcome.kind === 'environmentFatal') {
					budget = 'shortLeash'
					break
				}
				onProgress?.({binary: id, phase: 'fallback'})
			}
		}

		// Everything below is already on disk, so it costs a probe and nothing
		// else. Worth trying even on a short leash: a Homebrew or pipx yt-dlp is a
		// plain Python entry point and answers instantly on the same machine that
		// just timed out unpacking an onefile bundle.
		const cacheOutcome = await this.tryManagedArtifactCache(id, attempts, onProgress, signal, budget)
		if (cacheOutcome.kind === 'accepted') return cacheOutcome.diagnostic
		if (cacheOutcome.kind === 'cancelled') return fail()
		if (cacheOutcome.kind === 'environmentFatal') budget = 'shortLeash'

		// System PATH — last resort. Picks up brew/pipx/distro-package installs
		// when managed download is unreachable (firewalled, rate-limited, etc.).
		onProgress?.({binary: id, phase: 'fallback'})
		const pathBinaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
		const candidates = await whereOnPath(pathBinaryName, signal)
		for (const candidate of candidates) {
			const source: DependencySource = {kind: 'systemPath', path: candidate}
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- PATH candidates are accepted in PATH order
			const outcome = await this.probeAndAccept(id, source, candidate, attempts, onProgress, signal, budget)
			if (outcome.kind === 'accepted') return outcome.diagnostic
			if (outcome.kind === 'cancelled') return fail()
			if (outcome.kind === 'environmentFatal') budget = 'shortLeash'
		}

		return fail()
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

	private sourceFromManagedCache(entry: RuntimeBinaryManifestEntry, executablePath: string): Extract<DependencySource, {kind: 'managedCache'}> {
		return {kind: 'managedCache', channel: entry.channel, provider: entry.provider, url: entry.url, path: executablePath}
	}

	private async tryRuntimeManifestEntry(entry: RuntimeBinaryManifestEntry, attempts: DependencyAttempt[], opts: ResolveOptions, onProgress: ProgressEmitter | undefined, signal: AbortSignal | undefined, budget: ProbeBudget): Promise<ProbeOutcome> {
		const source = this.sourceFromRuntimeManifest(entry)
		const startedAt = Date.now()
		onProgress?.({binary: entry.id, phase: 'downloading', source})
		opts.onStatus?.('downloadingBinary', {name: entry.id})
		try {
			const result = await this.runtimeBinaryMaterializer.materialize(entry, {cacheRoot: this.artifactCacheDir, onDownloadProgress: makeDownloadProgress(entry.id, source, onProgress), onExtracting: () => onProgress?.({binary: entry.id, phase: 'extracting', source}), signal})
			return await this.probeAndAccept(entry.id, source, result.executablePath, attempts, onProgress, signal, budget)
		} catch (err) {
			// materialize() rejects on abort too. Recording that as a download
			// failure would append a fabricated attempt per remaining entry and keep
			// paying for materializations the user already asked us to stop.
			if (signal?.aborted) return {kind: 'cancelled'}
			// A download/extract failure is about this artifact, not the machine —
			// a different channel or provider may still materialize cleanly.
			this.recordManagedFailure(entry.id, attempts, source, onProgress, err, Date.now() - startedAt)
			return {kind: 'rejected'}
		}
	}

	private async tryManagedArtifactCache(id: 'yt-dlp', attempts: DependencyAttempt[], onProgress: ProgressEmitter | undefined, signal: AbortSignal | undefined, budget: ProbeBudget): Promise<ProbeOutcome> {
		const cached = await this.validManagedArtifactCacheEntries(id)
		let outcome: ProbeOutcome = {kind: 'rejected'}
		for (const candidate of cached) {
			const source = this.sourceFromManagedCache(candidate.manifest, candidate.executablePath)
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- managed cache candidates are probed newest-first
			outcome = await this.probeAndAccept(id, source, candidate.executablePath, attempts, onProgress, signal, budget)
			if (outcome.kind === 'accepted' || outcome.kind === 'cancelled') return outcome
			if (outcome.kind === 'environmentFatal') budget = 'shortLeash'
		}
		return outcome
	}

	private async validManagedArtifactCacheEntries(id: 'yt-dlp'): Promise<Array<{manifest: RuntimeBinaryManifestEntry; executablePath: string; installedAt: string}>> {
		const artifactsDir = path.join(this.artifactCacheDir, 'artifacts')
		let entries: string[]
		try {
			entries = await fsPromises.readdir(artifactsDir)
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
			throw err
		}

		const currentPlatform = runtimeBinaryPlatformFor()
		const currentArch = runtimeBinaryArchFor()
		if (!currentPlatform || !currentArch) return []

		const accepted: Array<{manifest: RuntimeBinaryManifestEntry; executablePath: string; installedAt: string}> = []
		for (const cacheKey of entries) {
			const artifactDir = path.join(artifactsDir, cacheKey)
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- cache entries are small metadata probes
			const candidate = await this.readValidManagedArtifactCacheEntry(id, artifactDir, cacheKey, currentPlatform, currentArch)
			if (candidate) accepted.push(candidate)
		}
		return accepted.sort((a, b) => b.installedAt.localeCompare(a.installedAt))
	}

	private async readValidManagedArtifactCacheEntry(id: 'yt-dlp', artifactDir: string, cacheKey: string, platform: RuntimeBinaryManifestEntry['platform'], arch: RuntimeBinaryManifestEntry['arch']): Promise<{manifest: RuntimeBinaryManifestEntry; executablePath: string; installedAt: string} | null> {
		try {
			const stat = await fsPromises.lstat(artifactDir)
			if (!stat.isDirectory()) return null
			const raw = await fsPromises.readFile(path.join(artifactDir, 'metadata.json'), 'utf8')
			const parsed = JSON.parse(raw) as unknown
			if (!isRecord(parsed)) return null
			const manifestResult = validateRuntimeBinaryManifestEntry(parsed.manifest)
			if (!manifestResult.ok) return null
			const manifest = manifestResult.value
			if (manifest.id !== id || manifest.platform !== platform || manifest.arch !== arch || manifest.format !== 'raw') return null
			if (typeof parsed.cacheKey !== 'string' || parsed.cacheKey !== cacheKey || parsed.cacheKey !== runtimeBinaryCacheKeyHash(manifest)) return null
			if (typeof parsed.manifestHash !== 'string' || parsed.manifestHash !== runtimeBinaryManifestHash(manifest)) return null
			if (typeof parsed.executablePath !== 'string') return null
			const executablePath = normalizeRuntimeExecutablePath(parsed.executablePath)
			if (!executablePath || executablePath !== normalizeRuntimeExecutablePath(manifest.executablePath)) return null
			const resolvedExecutablePath = path.join(artifactDir, executablePath)
			const relative = path.relative(artifactDir, resolvedExecutablePath)
			if (relative.startsWith('..') || path.isAbsolute(relative)) return null
			const [exeStat, actualSha256] = await Promise.all([fsPromises.lstat(resolvedExecutablePath), sha256ForFile(resolvedExecutablePath)])
			if (!exeStat.isFile() || exeStat.size !== manifest.size || actualSha256 !== manifest.sha256) return null
			if (process.platform !== 'win32') await fsPromises.access(resolvedExecutablePath, fsConstants.X_OK)
			return {manifest, executablePath: resolvedExecutablePath, installedAt: typeof parsed.installedAt === 'string' ? parsed.installedAt : ''}
		} catch {
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

			// Mirrors resolveYtDlp: an environment-fatal probe shortens the leash on
			// every remaining candidate instead of writing the binary off.
			let budget: ProbeBudget = 'full'
			const fail = (): DependencyDiagnostic => {
				const diag = failedDiagnostic(id, attempts)
				this.lastDiagnostics[id] = diag
				return diag
			}

			if (overridePath) {
				const source: DependencySource = {kind: 'manualOverride', path: overridePath}
				const outcome = await this.probeAndAccept(id, source, overridePath, attempts, onProgress, signal, budget)
				if (outcome.kind === 'accepted') return outcome.diagnostic
				if (outcome.kind === 'cancelled') return fail()
				if (outcome.kind === 'environmentFatal') budget = 'shortLeash'
			}

			const envPath = process.env[envVar]
			if (envPath) {
				const source: DependencySource = {kind: 'envOverride', path: envPath, envVar}
				const outcome = await this.probeAndAccept(id, source, envPath, attempts, onProgress, signal, budget)
				if (outcome.kind === 'accepted') return outcome.diagnostic
				if (outcome.kind === 'cancelled') return fail()
				if (outcome.kind === 'environmentFatal') budget = 'shortLeash'
			}

			const bundled = bundledBinaryPath(id)
			const source: DependencySource = {kind: 'bundled', path: bundled}
			const bundledOutcome = await this.probeAndAccept(id, source, bundled, attempts, onProgress, signal, budget)
			if (bundledOutcome.kind === 'accepted') return bundledOutcome.diagnostic
			if (bundledOutcome.kind === 'cancelled') return fail()
			if (bundledOutcome.kind === 'environmentFatal') budget = 'shortLeash'

			onProgress?.({binary: id, phase: 'fallback'})
			const binaryName = process.platform === 'win32' ? `${id}.exe` : id
			const pathCandidates = await whereOnPath(binaryName, signal)
			for (const candidate of pathCandidates) {
				const pathSource: DependencySource = {kind: 'systemPath', path: candidate}
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- PATH candidates are accepted in PATH order
				const pathOutcome = await this.probeAndAccept(id, pathSource, candidate, attempts, onProgress, signal, budget)
				if (pathOutcome.kind === 'accepted') return pathOutcome.diagnostic
				if (pathOutcome.kind === 'cancelled') return fail()
				if (pathOutcome.kind === 'environmentFatal') budget = 'shortLeash'
			}

			return fail()
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
}

export const binaryInternals = {parseShaLine, parseStandaloneSha256, parsePowerShellFileHash, parseContentRangeStart, resolvePartialResponseMode, sha256ForFile, classifyProbeError, classifyDownloadError, probeTimeoutMs, whereOnPath, fallbackPathCandidates, bundledBinaryPath}
