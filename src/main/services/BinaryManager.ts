import {constants as fsConstants} from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {app} from 'electron'
import log from 'electron-log/main.js'

import {isEnvironmentFatalFailure} from '@shared/dependencyPolicy.js'
import {type BinaryOverrides, type DependencyAttempt, type DependencyDiagnostic, type DependencyFailure, type DependencyId, type DependencySource, type FfmpegPackageEntry, type RuntimeBinaryManifestEntry, type StatusKey} from '@shared/types.js'
import {probeArgs, probeBinary, probeTimeoutMs, whereOnPath, classifyProbeError, fallbackPathCandidates, type ProbeBudget} from './binary/BinaryProbe.js'
import {ProbeVerdictCache, type ProbeVerdictStore} from './binary/ProbeVerdictCache.js'
import {classifyDownloadError, parseShaLine, parseStandaloneSha256, parsePowerShellFileHash, sha256ForFile, wrapDownloadProgressEmitter, parseContentRangeStart, resolvePartialResponseMode, type DownloadProgressCallback, type ProgressEmitter} from './binary/BinaryDownloader.js'
import {installFfmpegWithHomebrew, installYtDlpWithHomebrew} from './binary/HomebrewRepair.js'
import {installFfmpegWithWinget, installYtDlpWithWinget} from './binary/WingetRepair.js'
import type {FfmpegPairPaths} from './binary/ffmpegPairOnPath.js'
import {ffmpegPackageCacheKey, normalizeRuntimeExecutablePath, runtimeBinaryArchFor, runtimeBinaryPlatformFor, validateFfmpegPackageEntry, validateRuntimeBinaryManifestEntry} from '@shared/runtimeBinaryManifest.js'
import {ArtifactMaterializeError, artifactErrorToDependencyFailureKind, type ArtifactErrorCode} from './binary/ArtifactInstall.js'
import {RuntimeBinaryMaterializer, runtimeBinaryCacheKeyHash, runtimeBinaryManifestHash} from './binary/RuntimeBinaryMaterializer.js'
import {RuntimeBinaryIndexService, type RuntimeBinaryIndexProvider} from './binary/RuntimeBinaryIndexService.js'
import {FfmpegPackageMaterializer, type FfmpegPackageInstall} from './binary/FfmpegPackageMaterializer.js'

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

// What one caller wants to hear about a resolution it is sharing with others.
interface ResolveListener {
	onProgress?: ProgressEmitter
	onStatus?: StatusReporter
}

interface RunEntry<T> {
	promise: Promise<T>
	controller: AbortController
	listeners: Set<ResolveListener>
}

// One in-flight resolution, fanned out to every caller that asks for the same
// dependency while it is running. Typed per dependency shape (a diagnostic for
// yt-dlp, a pair for ffmpeg) instead of erased into a shared map, so joining a
// run never needs a cast back to the type the run actually produces.
class SharedRun<T> {
	private entry: RunEntry<T> | null = null

	// Fans one running resolution out to every caller that asks for the same
	// dependency while it is in flight.
	share(opts: ResolveOptions, cancelledValue: () => T, run: (shared: ResolveOptions) => Promise<T>): Promise<T> {
		// An explicit override asks a different question than the shared run is
		// answering, so it gets its own pass.
		if (opts.overrides) return run(opts)

		const existing = this.entry
		if (existing) return this.join(existing, opts, cancelledValue)

		const listeners = new Set<ResolveListener>()
		const controller = new AbortController()
		// Registered before run() is invoked: the chain emits its 'starting'
		// event synchronously, before this function's first await, so the
		// caller that begins the run must already be in the fan-out set.
		const starter: ResolveListener = {onProgress: opts.onProgress, onStatus: opts.onStatus}
		listeners.add(starter)
		const promise = run({
			signal: controller.signal,
			onProgress: event => {
				for (const listener of listeners) listener.onProgress?.(event)
			},
			onStatus: (statusKey, params) => {
				for (const listener of listeners) listener.onStatus?.(statusKey, params)
			}
		})
		const entry: RunEntry<T> = {promise, controller, listeners}
		this.entry = entry
		// Only if it is still ours: reset() may have dropped it in favour of a
		// fresh run we must not evict.
		void promise.finally(() => {
			if (this.entry === entry) this.entry = null
		})
		return this.wait(entry, starter, opts, cancelledValue)
	}

	private join(entry: RunEntry<T>, opts: ResolveOptions, cancelledValue: () => T): Promise<T> {
		const listener: ResolveListener = {onProgress: opts.onProgress, onStatus: opts.onStatus}
		entry.listeners.add(listener)
		return this.wait(entry, listener, opts, cancelledValue)
	}

	private wait(entry: RunEntry<T>, listener: ResolveListener, opts: ResolveOptions, cancelledValue: () => T): Promise<T> {
		let left = false
		const leave = (): void => {
			if (left) return
			left = true
			entry.listeners.delete(listener)
		}

		// A caller with no signal can never withdraw, so the run outlives everyone
		// else's cancel. That is exactly the queue respawn: dismissing the splash
		// must not kill a download the queue is still waiting on.
		if (!opts.signal) return entry.promise.finally(leave)

		const signal = opts.signal
		return new Promise<T>((resolve, reject) => {
			const onAbort = (): void => {
				leave()
				if (entry.listeners.size > 0) {
					// Other callers are still waiting on the shared run; hand this one
					// the same empty failed diagnostic the chain has always returned on
					// cancel.
					resolve(cancelledValue())
					return
				}
				// Last caller withdrawing stops the run itself. Await its real outcome
				// instead of fabricating one — the chain unwinds through its own
				// fail() with whatever attempts it actually accumulated, which is what
				// the repair panel needs after a user-initiated cancel.
				entry.controller.abort()
				// The run is now doomed; drop it immediately instead of waiting for its
				// unwind to settle, or a caller arriving mid-unwind joins a run that can
				// only fail instead of starting a fresh resolution.
				if (this.entry === entry) this.entry = null
				entry.promise.then(resolve, (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))))
			}
			if (signal.aborted) {
				onAbort()
				return
			}
			signal.addEventListener('abort', onAbort, {once: true})
			entry.promise.then(
				value => {
					signal.removeEventListener('abort', onAbort)
					leave()
					resolve(value)
				},
				(err: unknown) => {
					signal.removeEventListener('abort', onAbort)
					leave()
					reject(err instanceof Error ? err : new Error(String(err)))
				}
			)
		})
	}

	// A force-check must not be answered by a resolution that started before it
	// was asked for. Dropping the entry makes the next caller open a fresh run;
	// the old one ends on its own once its own callers withdraw.
	reset(): void {
		this.entry = null
	}
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

// The signed manifest states every artifact's exact size, so progress keeps a
// total even when a proxy or mirror strips Content-Length; without one the
// splash could show neither a bar nor a byte count.
function makeDownloadProgress(id: DependencyId, source: DependencySource, onProgress: ProgressEmitter | undefined, expectedSize: number): DownloadProgressCallback | undefined {
	if (!onProgress) return undefined
	return (downloaded, total): void => {
		onProgress({binary: id, phase: 'downloading', bytesDownloaded: downloaded, totalBytes: total ?? expectedSize, source})
	}
}

const logger = log.scope('binary')
export type RuntimeBinaryMaterializerPort = Pick<RuntimeBinaryMaterializer, 'materialize'>

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

// Development builds use the copies scripts/build/fetch-embedded.sh puts in
// build/embedded/<platform>-<arch>/, so `bun run dev` and the fixture E2E
// suites never download a package. Release builds ship no FFmpeg at all.
function devEmbeddedBinaryPath(name: 'ffmpeg' | 'ffprobe'): string | null {
	if (app.isPackaged) return null
	const fileName = process.platform === 'win32' ? `${name}.exe` : name
	const arch = process.arch === 'arm64' ? 'arm64' : 'x64'
	// import.meta.dirname in dev points at the electron-vite-compiled main
	// bundle (out/main). Resolve up to repo root, then into build/embedded/.
	return path.join(import.meta.dirname, '..', '..', 'build', 'embedded', `${process.platform}-${arch}`, fileName)
}

type FfmpegId = 'ffmpeg' | 'ffprobe'
type FfmpegPair = Record<FfmpegId, DependencyDiagnostic>
export type FfmpegPackageMaterializerPort = Pick<FfmpegPackageMaterializer, 'materialize' | 'prune' | 'installed'>

// Finds a binary by name on the system PATH, in PATH order.
export type PathLookup = (name: string, signal?: AbortSignal) => Promise<string[]>

export class BinaryManager {
	private readonly cacheDir: string

	private readonly artifactCacheDir: string

	private readonly runtimeBinaryIndex: RuntimeBinaryIndexProvider

	private readonly runtimeBinaryMaterializer: RuntimeBinaryMaterializerPort

	private readonly overridesProvider: () => BinaryOverrides | undefined

	private readonly probeVerdicts: ProbeVerdictStore

	private readonly pathLookup: PathLookup

	private resolved: Partial<Record<DependencyId, string>> = {}

	private lastDiagnostics: Partial<Record<DependencyId, DependencyDiagnostic>> = {}

	private readonly ytDlpRun = new SharedRun<DependencyDiagnostic>()

	private readonly ffmpegPairRun = new SharedRun<FfmpegPair>()

	private readonly ffmpegPackages: FfmpegPackageMaterializerPort

	constructor(
		userDataPath: string,
		options?: {
			retryDelays?: [number, number]
			overridesProvider?: () => BinaryOverrides | undefined
			runtimeBinaryIndex?: RuntimeBinaryIndexProvider
			runtimeBinaryMaterializer?: RuntimeBinaryMaterializerPort
			ffmpegPackageMaterializer?: FfmpegPackageMaterializerPort
			probeVerdicts?: ProbeVerdictStore
			pathLookup?: PathLookup
		}
	) {
		this.cacheDir = path.join(userDataPath, 'runtime-cache', 'binaries')
		this.artifactCacheDir = path.join(userDataPath, 'runtime-cache', 'artifact-cache-v1')
		this.overridesProvider = options?.overridesProvider ?? ((): BinaryOverrides | undefined => undefined)
		this.runtimeBinaryIndex = options?.runtimeBinaryIndex ?? new RuntimeBinaryIndexService(userDataPath)
		this.runtimeBinaryMaterializer = options?.runtimeBinaryMaterializer ?? new RuntimeBinaryMaterializer()
		this.ffmpegPackages = options?.ffmpegPackageMaterializer ?? new FfmpegPackageMaterializer()
		this.probeVerdicts = options?.probeVerdicts ?? new ProbeVerdictCache(path.join(userDataPath, 'runtime-cache'))
		this.pathLookup = options?.pathLookup ?? whereOnPath
	}

	// Where managed yt-dlp builds and FFmpeg packages are installed, which is
	// what the repair panel's "Open dependency folder" shows.
	getDependencyDir(): string {
		return this.artifactCacheDir
	}

	getResolvedPath(id: DependencyId): string | null {
		return this.resolved[id] ?? null
	}

	getLastDiagnostic(id: DependencyId): DependencyDiagnostic | null {
		return this.lastDiagnostics[id] ?? null
	}

	// The memo asserts a binary runs because it once did. A real spawn failure is
	// the moment that assertion is disproved — and the only moment, because a
	// memoized binary never reaches the probe again. Without this the app reports
	// a healthy warmup while every download fails at spawn, and the repair panel
	// that could clear the memo never renders, because nothing is blocking.
	async forgetProbeVerdict(id: DependencyId): Promise<void> {
		const stalePath = this.resolved[id]
		delete this.resolved[id]
		delete this.lastDiagnostics[id]
		if (!stalePath) return
		logger.warn(`${id} spawn failed after a recorded probe verdict — forgetting it`, {path: stalePath})
		await this.probeVerdicts.forget(stalePath)
	}

	invalidateResolved(): void {
		this.resolved = {}
		this.lastDiagnostics = {}
		// A force-check must not be answered by a resolution that started before it
		// was asked for. Dropping the entries makes the next caller open a fresh
		// run; the old one ends on its own once its own callers withdraw.
		this.ytDlpRun.reset()
		this.ffmpegPairRun.reset()
		// Reached from WarmupService.run({force: true}) — the repair panel's "check
		// again". Dropping the memo is what makes that button able to notice a
		// binary the OS started blocking after we recorded it as good.
		void this.probeVerdicts.clear()
	}

	getYtDlpPath(): string {
		return this.resolved['yt-dlp'] ?? process.env.ARROXY_YT_DLP_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')
	}

	// Probe-and-record helper used by every resolve chain. Runs the binary's
	// version probe, records the outcome on `attempts`, and tells the caller what
	// the result means for the remaining candidates — see ProbeOutcome.
	//
	// A previously recorded verdict for this exact file short-circuits the spawn.
	// The check is not a shortcut around verification: it is the same verification,
	// remembered, and any change to the file invalidates it.
	private async probeAndAccept(id: DependencyId, source: DependencySource, candidatePath: string, attempts: DependencyAttempt[], onProgress?: ProgressEmitter, signal?: AbortSignal, budget: ProbeBudget = 'full'): Promise<ProbeOutcome> {
		const memoized = await this.probeVerdicts.get(candidatePath)
		// Emitted after the memo read, not before, so the event can say whether a
		// real spawn is about to happen. The read is a local file check.
		onProgress?.({binary: id, phase: 'probing', source, firstCheck: memoized === null})
		if (memoized !== null) {
			logger.info(`${id} probe verdict reused`, {source, path: candidatePath, version: memoized.split('\n')[0]})
			return {kind: 'accepted', diagnostic: this.acceptCandidate(id, source, candidatePath, attempts, memoized, onProgress)}
		}

		const args = probeArgs(id)
		const timeoutMs = probeTimeoutMs(id, budget)
		const startedAt = Date.now()
		const probe = await probeBinary(candidatePath, args, timeoutMs, signal)
		const elapsedMs = Date.now() - startedAt
		if (probe.ok) {
			logger.info(`${id} probe ok`, {source, path: candidatePath, args, elapsedMs, version: probe.output.split('\n')[0]})
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

	// Cold start puts two independent callers into this resolver: the splash's
	// warmup, and QueueService's boot-time respawn pass. `this.resolved` memoizes
	// only *completed* resolutions, so both used to run the whole chain and both
	// used to call materialize(). The artifact lock kept the cache intact, but the
	// second caller sat on that lock emitting nothing — the splash froze — and on
	// a link slow enough to push the first download past the lock timeout, the
	// second was handed a fabricated 'timeout' attempt in the repair panel and
	// fell through to the next mirror, downloading the same binary a second time.
	async resolveYtDlp(opts: ResolveOptions = {}): Promise<DependencyDiagnostic> {
		return this.ytDlpRun.share(
			opts,
			() => failedDiagnostic('yt-dlp', []),
			shared => this.runResolveYtDlp({...opts, ...shared})
		)
	}

	private async runResolveYtDlp(opts: ResolveOptions): Promise<DependencyDiagnostic> {
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
		const candidates = await this.pathLookup(pathBinaryName, signal)
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
		// Announced only once a download really begins: a reused install must not
		// put the splash into setup mode.
		const onDownloadStart = (): void => {
			onProgress?.({binary: entry.id, phase: 'downloading', source})
			opts.onStatus?.('downloadingBinary', {name: entry.id})
		}
		try {
			const result = await this.runtimeBinaryMaterializer.materialize(entry, {cacheRoot: this.artifactCacheDir, onDownloadStart, onDownloadProgress: makeDownloadProgress(entry.id, source, onProgress, entry.size), onExtracting: () => onProgress?.({binary: entry.id, phase: 'extracting', source}), signal})
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

	async installFfmpegWithHomebrew(): Promise<FfmpegPairPaths> {
		return installFfmpegWithHomebrew()
	}

	async installFfmpegWithWinget(): Promise<FfmpegPairPaths> {
		return installFfmpegWithWinget()
	}

	// ffmpeg + ffprobe resolve as a pair. Release builds no longer bundle them:
	// they come from the approved FFmpeg package in the signed runtime index,
	// downloaded once and reused across app updates (ADR 0010). Order per binary:
	// manual override → env override → dev build/embedded copy → managed package
	// → system PATH. One package supplies both binaries, so they always match.
	async resolveFFmpegPair(opts: ResolveOptions = {}): Promise<FfmpegPair> {
		return this.ffmpegPairRun.share(
			opts,
			() => ({ffmpeg: failedDiagnostic('ffmpeg', []), ffprobe: failedDiagnostic('ffprobe', [])}),
			shared => this.runResolveFFmpegPair({...opts, ...shared})
		)
	}

	private async runResolveFFmpegPair(opts: ResolveOptions): Promise<FfmpegPair> {
		const overrides = opts.overrides ?? this.overridesProvider()
		const {onProgress, signal} = opts
		const ids = ['ffmpeg', 'ffprobe'] as const
		const attempts: Record<FfmpegId, DependencyAttempt[]> = {ffmpeg: [], ffprobe: []}
		const budget: Record<FfmpegId, ProbeBudget> = {ffmpeg: 'full', ffprobe: 'full'}
		const resolved: Partial<FfmpegPair> = {}
		let cancelled = false

		// Runs one candidate for one binary and folds the outcome into the shared
		// state. Returns true when the binary needs no further candidates.
		const tryCandidate = async (id: FfmpegId, source: DependencySource, candidatePath: string): Promise<boolean> => {
			const outcome = await this.probeAndAccept(id, source, candidatePath, attempts[id], onProgress, signal, budget[id])
			if (outcome.kind === 'accepted') resolved[id] = outcome.diagnostic
			if (outcome.kind === 'cancelled') cancelled = true
			if (outcome.kind === 'environmentFatal') budget[id] = 'shortLeash'
			return outcome.kind === 'accepted' || outcome.kind === 'cancelled'
		}
		const pending = (): FfmpegId[] => (cancelled ? [] : ids.filter(id => !resolved[id]))

		for (const id of ids) onProgress?.({binary: id, phase: 'starting'})
		await Promise.all(
			ids.map(async id => {
				const overridePath = overrides?.[id]
				if (overridePath && (await tryCandidate(id, {kind: 'manualOverride', path: overridePath}, overridePath))) return
				const envVar = id === 'ffmpeg' ? 'ARROXY_FFMPEG_PATH' : 'ARROXY_FFPROBE_PATH'
				const envPath = process.env[envVar]
				if (envPath && (await tryCandidate(id, {kind: 'envOverride', path: envPath, envVar}, envPath))) return
				const devPath = devEmbeddedBinaryPath(id)
				if (devPath) await tryCandidate(id, {kind: 'bundled', path: devPath}, devPath)
			})
		)

		// A machine that refused to run one binary will refuse a downloaded one too.
		await this.tryManagedFfmpegPackages(() => pending().filter(id => budget[id] === 'full'), tryCandidate, attempts, opts)

		for (const id of pending()) {
			onProgress?.({binary: id, phase: 'fallback'})
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- PATH candidates are accepted in PATH order
			for (const candidate of await this.pathLookup(process.platform === 'win32' ? `${id}.exe` : id, signal)) {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- PATH candidates are accepted in PATH order
				if (await tryCandidate(id, {kind: 'systemPath', path: candidate}, candidate)) break
			}
		}

		const finish = (id: FfmpegId): DependencyDiagnostic => {
			const diag = resolved[id] ?? failedDiagnostic(id, attempts[id])
			this.lastDiagnostics[id] = diag
			return diag
		}
		return {ffmpeg: finish('ffmpeg'), ffprobe: finish('ffprobe')}
	}

	// Approved packages in index order (remote, then last-known-good, then the
	// bundled pin), then any other package still installed. An installed package
	// is reused without network access, so a launch with no connection still
	// resolves from a version the indexes have since moved past.
	private async tryManagedFfmpegPackages(waitingFor: () => FfmpegId[], tryCandidate: (id: FfmpegId, source: DependencySource, candidatePath: string) => Promise<boolean>, attempts: Record<FfmpegId, DependencyAttempt[]>, opts: ResolveOptions): Promise<void> {
		const {onProgress, signal} = opts
		if (waitingFor().length === 0) return
		for (const entry of await this.ffmpegPackageCandidates(signal)) {
			const waiting = waitingFor()
			if (waiting.length === 0) return
			const source: DependencySource = {kind: 'managed', channel: 'default', provider: 'github', url: entry.url}
			const startedAt = Date.now()
			// One package is one download. The splash adds up the bytes of every
			// downloading row, so reporting it on both rows would count it twice:
			// it is reported on the first binary still waiting, normally ffmpeg.
			const carrier = waiting[0]
			let install: FfmpegPackageInstall
			try {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- packages are tried in approved fallback order
				install = await this.ffmpegPackages.materialize(entry, {
					cacheRoot: this.artifactCacheDir,
					signal,
					onDownloadStart: () => {
						onProgress?.({binary: carrier, phase: 'downloading', source})
						opts.onStatus?.('downloadingBinary', {name: 'ffmpeg'})
					},
					onDownloadProgress: makeDownloadProgress(carrier, source, onProgress, entry.size),
					onExtracting: () => {
						onProgress?.({binary: carrier, phase: 'extracting', source})
					}
				})
			} catch (err) {
				if (signal?.aborted) return
				for (const id of waiting) this.recordManagedFailure(id, attempts[id], source, onProgress, err, Date.now() - startedAt)
				continue
			}
			const paths: Record<FfmpegId, string> = {ffmpeg: install.ffmpegPath, ffprobe: install.ffprobePath}
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- both probes belong to this one package
			const settled = await Promise.all(waiting.map(id => tryCandidate(id, source, paths[id])))
			if (settled.every(Boolean) && !signal?.aborted) {
				void this.ffmpegPackages.prune(entry, {cacheRoot: this.artifactCacheDir}).catch((err: unknown) => logger.warn('FFmpeg package cleanup failed', {error: errorMessage(err)}))
				return
			}
		}
	}

	// Installed packages carry no signature, so they pass the same entry rules
	// as an index entry, and must target this machine, before one is tried.
	private async ffmpegPackageCandidates(signal: AbortSignal | undefined): Promise<FfmpegPackageEntry[]> {
		const approved = await this.runtimeBinaryIndex.ffmpegPackageCandidates(signal)
		const seen = new Set(approved.map(ffmpegPackageCacheKey))
		let installed: FfmpegPackageEntry[] = []
		try {
			installed = await this.ffmpegPackages.installed({cacheRoot: this.artifactCacheDir})
		} catch (err) {
			logger.warn('Could not list installed FFmpeg packages', {error: errorMessage(err)})
		}
		const platform = runtimeBinaryPlatformFor()
		const arch = runtimeBinaryArchFor()
		const leftovers = installed.filter(entry => entry.platform === platform && entry.arch === arch && validateFfmpegPackageEntry(entry).ok && !seen.has(ffmpegPackageCacheKey(entry)))
		return [...approved, ...leftovers]
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

export const binaryInternals = {parseShaLine, parseStandaloneSha256, parsePowerShellFileHash, parseContentRangeStart, resolvePartialResponseMode, sha256ForFile, classifyProbeError, classifyDownloadError, probeTimeoutMs, whereOnPath, fallbackPathCandidates, devEmbeddedBinaryPath}
