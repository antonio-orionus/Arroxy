import {execFile} from 'node:child_process'
import {constants as fsConstants} from 'node:fs'
import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {promisify} from 'node:util'
import {app} from 'electron'
import extractZip from 'extract-zip'
import got from 'got'
import log from 'electron-log/main.js'

const execFileAsync = promisify(execFile)

import {trackMain} from '@main/services/analytics.js'
import {FAILURE_CODE, type BinaryOverrides, type DependencyAttempt, type DependencyDiagnostic, type DependencyFailure, type DependencyId, type DependencySource, type StatusKey} from '@shared/types.js'
import {probeArgs, probeBinary, whereOnPath, classifyProbeError, cancelError, fallbackPathCandidates, PROBE_TIMEOUT_MS} from './binary/BinaryProbe.js'
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
import {BINARY_SOURCES, denoAssetName, denoAssetTarget, denoExecutableName, ytDlpAssetName} from './binary/BinaryAssets.js'

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
// Bound recursion so a malicious archive (deep tree or symlink cycle) cannot
// stall extraction. Used by deno's zip extractor.
const ARCHIVE_TREE_MAX_DEPTH = 8

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
		const startedAt = Date.now()
		const probe = await probeBinary(candidatePath, args, PROBE_TIMEOUT_MS, signal)
		const elapsedMs = Date.now() - startedAt
		if (probe.ok) {
			attempts.push(makeAttempt(source))
			this.resolved[id] = candidatePath
			onProgress?.({binary: id, phase: 'done', source})
			const diag = runnableDiagnostic(id, source, candidatePath, attempts, probe.output)
			this.lastDiagnostics[id] = diag
			logger.info(`${id} probe ok`, {source, path: candidatePath, args, elapsedMs, version: probe.output.split('\n')[0]})
			return diag
		}
		attempts.push(makeAttempt(source, probe.failure))
		onProgress?.({binary: id, phase: 'failed', source, failureKind: probe.failure.kind})
		logger.warn(`${id} probe failed`, {source, path: candidatePath, args, timeoutMs: PROBE_TIMEOUT_MS, elapsedMs, failureKind: probe.failure.kind, message: probe.failure.message})
		return null
	}

	// Attempt one managed yt-dlp channel (nightly or stable): build path + URL,
	// call tryManagedDownload, then probe-and-accept. Returns the diagnostic on
	// success or null to fall through.
	private async tryManagedYtDlpChannel(
		id: DependencyId,
		channel: 'nightly' | 'stable',
		channelSource: {download: string; latest: string},
		binaryFilename: string,
		assetName: string,
		attempts: DependencyAttempt[],
		opts: ResolveOptions,
		onProgress: ProgressEmitter | undefined,
		signal: AbortSignal | undefined
	): Promise<DependencyDiagnostic | null> {
		const destinationPath = path.join(this.cacheDir, binaryFilename)
		const downloadUrl = `${channelSource.download}/${assetName}`
		const source: DependencySource = {kind: 'managed', channel, url: downloadUrl}
		const downloadOk = await this.tryManagedDownload(id, attempts, source, onProgress, () =>
			this.ensureBinary({
				name: 'yt-dlp',
				destinationPath,
				downloadUrl,
				expectedSha256: async () => {
					return parseShaLine(await downloadText(`${channelSource.download}/SHA2-256SUMS`, signal), assetName)
				},
				onStatus: opts.onStatus,
				onDownloadProgress: makeDownloadProgress(id, source, onProgress),
				requiredChecksum: true,
				isUpToDate: () => this.isYtDlpUpToDate(destinationPath, channelSource.latest, signal),
				signal
			})
		)
		if (!downloadOk) {
			if (await this.isUsableBinary(destinationPath)) {
				logger.warn('Using existing yt-dlp after managed update failed', {channel, path: destinationPath})
				return this.probeAndAccept(id, source, destinationPath, attempts, onProgress, signal)
			}
			return null
		}
		return this.probeAndAccept(id, source, destinationPath, attempts, onProgress, signal)
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

		const assetName = ytDlpAssetName()
		if (assetName) {
			const nightlyDiag = await this.tryManagedYtDlpChannel(id, 'nightly', BINARY_SOURCES.ytDlpNightly, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp', assetName, attempts, opts, onProgress, signal)
			if (nightlyDiag) return nightlyDiag

			onProgress?.({binary: id, phase: 'fallback'})
			const stableDiag = await this.tryManagedYtDlpChannel(id, 'stable', BINARY_SOURCES.ytDlpStable, process.platform === 'win32' ? 'yt-dlp-stable.exe' : 'yt-dlp-stable', assetName, attempts, opts, onProgress, signal)
			if (stableDiag) return stableDiag
		}

		// System PATH — last resort. Picks up brew/pipx/distro-package installs
		// when managed download is unreachable (firewalled, rate-limited, etc.).
		onProgress?.({binary: id, phase: 'fallback'})
		const pathBinaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
		const candidates = await whereOnPath(pathBinaryName, signal)
		for (const candidate of candidates) {
			const source: DependencySource = {kind: 'systemPath', path: candidate}
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

			const failed = failedDiagnostic(id, attempts)
			this.lastDiagnostics[id] = failed
			return failed
		}

		const [ffmpeg, ffprobe] = await Promise.all([resolveOne('ffmpeg', overrides?.ffmpeg, 'ARROXY_FFMPEG_PATH'), resolveOne('ffprobe', overrides?.ffprobe, 'ARROXY_FFPROBE_PATH')])
		return {ffmpeg, ffprobe}
	}

	// Single-binary resolve helper: manual override → env override → managed
	// download. Used by resolveDeno.
	private async resolveSingleBinary(id: DependencyId, manualPath: string | undefined, envPath: string | undefined, envVar: string, doManaged: (source: DependencySource, attempts: DependencyAttempt[]) => Promise<string | null>, managedSource: DependencySource, opts: ResolveOptions): Promise<DependencyDiagnostic> {
		const attempts: DependencyAttempt[] = []
		const onProgress = opts.onProgress
		const signal = opts.signal
		onProgress?.({binary: id, phase: 'starting'})

		if (manualPath) {
			const source: DependencySource = {kind: 'manualOverride', path: manualPath}
			const diag = await this.probeAndAccept(id, source, manualPath, attempts, onProgress, signal)
			if (diag) return diag
		}

		if (envPath) {
			const source: DependencySource = {kind: 'envOverride', path: envPath, envVar}
			const diag = await this.probeAndAccept(id, source, envPath, attempts, onProgress, signal)
			if (diag) return diag
		}

		const managedPath = await doManaged(managedSource, attempts)
		if (managedPath) {
			const diag = await this.probeAndAccept(id, managedSource, managedPath, attempts, onProgress, signal)
			if (diag) return diag
		}

		const diag = failedDiagnostic(id, attempts)
		this.lastDiagnostics[id] = diag
		return diag
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
	// client. Without it, yt-dlp silently drops every JS-needing client and
	// falls back to android_vr — which our PoT (bound to web.gvs) can't help.
	// Returns null when:
	//   - the platform/arch has no upstream deno build (Windows ARM64), or
	//   - download/extraction failed for any reason.
	// The caller (YtDlp) treats null as "skip --js-runtimes" rather than failing
	// the download. Bot-block fallbacks still cover us.
	async resolveDeno(opts: ResolveOptions = {}): Promise<DependencyDiagnostic> {
		const id: DependencyId = 'deno'
		const overrides = opts.overrides ?? this.overridesProvider()
		const onProgress = opts.onProgress
		const signal = opts.signal

		const assetName = denoAssetName()
		if (!assetName) {
			const diag: DependencyDiagnostic = {id, state: 'failed', source: null, resolvedPath: null, attempts: [], failure: {kind: 'spawn_failed', message: 'No deno build for this platform/arch'}}
			this.lastDiagnostics[id] = diag
			onProgress?.({binary: id, phase: 'skipped'})
			return diag
		}

		return this.resolveSingleBinary(
			id,
			overrides?.deno,
			process.env.ARROXY_DENO_PATH,
			'ARROXY_DENO_PATH',
			async (source, attempts) => {
				const targetPath = path.join(this.cacheDir, denoExecutableName())
				if (await this.isUsableBinary(targetPath)) return targetPath
				const downloadUrl = `${BINARY_SOURCES.deno.download}/${assetName}`
				const checksumUrl = `${downloadUrl}.sha256sum`
				const downloadOk = await this.tryManagedDownload(id, attempts, source, onProgress, () =>
					this.ensureZippedBinary({
						name: 'deno',
						downloadUrl,
						zipFileName: assetName,
						innerExecutableName: denoExecutableName(),
						destinationPath: targetPath,
						onDownloadProgress: makeDownloadProgress(id, source, onProgress),
						signal,
						expectedSha256: async () => {
							try {
								const checksumText = await downloadText(checksumUrl, signal)
								return parseShaLine(checksumText, assetName) ?? parseStandaloneSha256(checksumText) ?? parsePowerShellFileHash(checksumText)
							} catch {
								return null
							}
						},
						onStatus: opts.onStatus
					})
				)
				return downloadOk ? targetPath : null
			},
			{kind: 'managed', channel: 'default', url: `${BINARY_SOURCES.deno.download}/${assetName}`},
			opts
		)
	}

	async ensureDeno(onStatus?: StatusReporter, onDownloadProgress?: DownloadProgressCallback): Promise<string | null> {
		if (this.resolved.deno) return this.resolved.deno
		const onProgress = wrapDownloadProgressEmitter(onDownloadProgress)
		const diag = await this.resolveDeno({onStatus, onProgress})
		return diag.resolvedPath
	}

	private async ensureZippedBinary(config: {
		name: string
		downloadUrl: string
		zipFileName: string
		innerExecutableName: string
		destinationPath: string
		expectedSha256: () => Promise<string | null>
		requiredChecksum?: boolean
		onStatus?: StatusReporter
		onDownloadProgress?: DownloadProgressCallback
		signal?: AbortSignal
	}): Promise<void> {
		const {destinationPath, name, onStatus, onDownloadProgress, signal} = config

		const existing = this.inProgress.get(destinationPath)
		if (existing) return existing

		const promise = (async (): Promise<void> => {
			const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), `arroxy-${name}-`))
			await using _cleanup = {[Symbol.asyncDispose]: () => fsPromises.rm(tempDir, {recursive: true, force: true})}
			const zipPath = path.join(tempDir, config.zipFileName)

			onStatus?.('downloadingBinary', {name})
			logger.info(`Downloading ${name}`, {downloadUrl: config.downloadUrl, destinationPath})

			await downloadFile(config.downloadUrl, zipPath, onDownloadProgress, true, signal)

			const expected = await config.expectedSha256()
			if (expected) {
				const actual = await sha256ForFile(zipPath)
				if (actual !== expected) {
					throw new Error(`${name} checksum mismatch. Expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...`)
				}
			} else if (config.requiredChecksum) {
				throw new Error(`Checksum source unavailable for ${name}. Refusing to use unverified archive.`)
			} else {
				logger.warn(`Checksum unavailable for ${name}, proceeding without verification`)
			}

			const extractDir = path.join(tempDir, 'unpacked')
			await fsPromises.mkdir(extractDir, {recursive: true})
			await extractZip(zipPath, {dir: extractDir})

			const innerPath = await this.findExecutableInTree(extractDir, config.innerExecutableName)
			if (!innerPath) {
				throw new Error(`${name} archive did not contain ${config.innerExecutableName}`)
			}

			await fsPromises.mkdir(path.dirname(destinationPath), {recursive: true})
			// copyFile (rather than rename) handles cross-device temp dirs.
			await fsPromises.copyFile(innerPath, destinationPath)
			if (process.platform !== 'win32') {
				await fsPromises.chmod(destinationPath, 0o755)
			}
		})().finally(() => {
			this.inProgress.delete(destinationPath)
		})

		this.inProgress.set(destinationPath, promise)
		return promise
	}

	private async findExecutableInTree(root: string, name: string, depth = 0): Promise<string | null> {
		if (depth > ARCHIVE_TREE_MAX_DEPTH) return null
		const entries = await fsPromises.readdir(root, {withFileTypes: true})
		for (const entry of entries) {
			if (entry.isSymbolicLink()) continue
			const full = path.join(root, entry.name)
			if (entry.isDirectory()) {
				const nested = await this.findExecutableInTree(full, name, depth + 1)
				if (nested) return nested
			} else if (entry.isFile() && entry.name === name) {
				return full
			}
		}
		return null
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

	private async checkYtDlpVersion(binaryPath: string, releaseLatestUrl: string, signal?: AbortSignal): Promise<YtDlpVersionCheck> {
		const [local, remote] = await Promise.all([this.getLocalYtDlpVersion(binaryPath, signal), this.getRemoteYtDlpVersion(releaseLatestUrl, signal)])
		if (!local) return {state: 'unusable'}
		if (remote.tag === null) return {state: 'unknown', local, reason: remote.reason}
		if (local !== remote.tag) return {state: 'outdated', local, remote: remote.tag}
		return {state: 'up-to-date', local}
	}

	private async getLocalYtDlpVersion(binaryPath: string, signal?: AbortSignal): Promise<string | null> {
		try {
			const {stdout} = await execFileAsync(binaryPath, ['--version'], {timeout: PROBE_TIMEOUT_MS, signal})
			return stdout.trim()
		} catch (err) {
			logger.warn('yt-dlp local version check failed', {path: binaryPath, timeoutMs: PROBE_TIMEOUT_MS, error: errorMessage(err)})
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

export const binaryInternals = {
	parseShaLine,
	parseStandaloneSha256,
	parsePowerShellFileHash,
	parseContentRangeStart,
	resolvePartialResponseMode,
	ytDlpAssetName,
	denoAssetName,
	denoAssetTarget,
	denoExecutableName,
	sha256ForFile,
	classifyProbeError,
	classifyDownloadError,
	whereOnPath,
	fallbackPathCandidates,
	bundledBinaryPath
}
