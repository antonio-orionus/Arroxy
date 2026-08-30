import type {BrowserWindow} from 'electron'
import log from 'electron-log/main.js'

import {ok, fail, type Result} from '@shared/result.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {blockingDependencyFailures} from '@shared/dependencyPolicy.js'
import {DEPENDENCY_IDS, type DependencyDiagnostic, type DependencyId, type TokenWarmupStatus, type WarmUpOutput, type WarmupProgressEvent} from '@shared/types.js'
import {createAppError, unknownToMessage} from '@main/utils/errorFactory.js'
import {throttleByKey} from '@main/utils/throttleByKey.js'
import type {BinaryManager} from './BinaryManager.js'
import type {TokenService} from './TokenService.js'

const logger = log.scope('warmup')

// Cap any single binary resolve at this. Unbounded network retries on a slow
// CDN can otherwise hang the splash for a very long time — the user has no
// out without a Cancel button. We allow a long budget because large Windows
// ffmpeg archives can take several minutes on slow links, and aborting a
// still-progressing transfer at 90s proved too aggressive in production.
const PER_BINARY_BUDGET_MS = 30 * 60 * 1000

// The binary downloader reports progress per network chunk — hundreds of events per
// second on a fast pipe. Without throttling, the IPC fire-hose plus per-event
// Zustand replacement plus React re-render queue overwhelms the renderer, and
// the splash bar visibly lags real progress for tens of seconds after the
// download has actually finished. 100 ms is imperceptible to the eye and
// reduces event volume by ~3 orders of magnitude.
const DOWNLOAD_PROGRESS_THROTTLE_MS = 100

// The token branch is not awaited, but it must still be bounded: its internal
// stages are a 20s poll plus a 10x1s mint retry, and the hidden window's
// loadURL has no timer at all, so nothing else stops it from living forever.
const TOKEN_WARMUP_BUDGET_MS = 30 * 1000

// Every awaited resolver branch, and which dependencies it is responsible for.
// One branch can own several ids: resolveFFmpegPair returns ffmpeg and ffprobe
// from a single pass.
//
// This is the only place that maps the two vocabularies onto each other. Typed
// as a total Record<DependencyId, …>, so a fourth dependency cannot be added to
// DEPENDENCY_IDS without warmup naming the branch that resolves it — the job a
// bare `void DEPENDENCY_IDS` statement used to pretend to do.
const DEPENDENCY_BRANCH = {'yt-dlp': 'ytDlp', ffmpeg: 'ffmpeg', ffprobe: 'ffmpeg'} as const satisfies Record<DependencyId, string>

type GatingBranch = (typeof DEPENDENCY_BRANCH)[DependencyId]

// Derived, so a dependency routed to a new branch gates completion by
// construction rather than by someone remembering to extend a second list.
const GATING_BRANCHES: readonly GatingBranch[] = [...new Set(DEPENDENCY_IDS.map(id => DEPENDENCY_BRANCH[id]))]

// The token is warmed alongside the binaries but never gates: a missing token is
// soft, and the first YouTube probe mints on demand.
type WarmupBranch = GatingBranch | 'token'

interface WarmupServiceDeps {
	binaryManager: BinaryManager
	tokenService: TokenService
	window?: BrowserWindow
	onResolved?: () => void
}

export class WarmupService {
	private currentRun: Promise<Result<WarmUpOutput>> | null = null

	private lastResult: Result<WarmUpOutput> | null = null

	private currentController: AbortController | null = null

	constructor(private readonly deps: WarmupServiceDeps) {}

	getLastResult(): Result<WarmUpOutput> | null {
		return this.lastResult
	}

	cancel(): void {
		this.currentController?.abort()
	}

	run(opts?: {force?: boolean}): Promise<Result<WarmUpOutput>> {
		if (this.currentRun && !opts?.force) return this.currentRun
		if (opts?.force) {
			this.deps.binaryManager.invalidateResolved()
			// A force-run while another is in flight cancels the in-flight one so
			// its diagnostics aren't overwritten mid-completion by the new run.
			this.currentController?.abort()
		}
		const controller = new AbortController()
		this.currentController = controller
		const promise = this.settleRun(controller, this.executeRun(controller.signal))
		this.currentRun = promise
		return promise
	}

	// Bookkeeping has to happen inside the returned promise, not in a `.finally()`
	// chained onto it. A chained handler settles a microtask *after* the caller's
	// `await` resumes, so a caller that runs again the moment warmup finishes was
	// handed back the run that had just completed instead of a fresh one.
	private async settleRun(controller: AbortController, work: Promise<Result<WarmUpOutput>>): Promise<Result<WarmUpOutput>> {
		try {
			const result = await work
			this.lastResult = result
			return result
		} finally {
			// A force-run that started meanwhile owns these now; only clear our own.
			if (this.currentController === controller) {
				this.currentRun = null
				this.currentController = null
			}
		}
	}

	private async executeRun(userSignal: AbortSignal): Promise<Result<WarmUpOutput>> {
		const {binaryManager, tokenService, window, onResolved} = this.deps

		const sendNow = (event: WarmupProgressEvent): void => {
			if (!window || window.isDestroyed()) return
			window.webContents.send(IPC_CHANNELS.warmupProgress, event)
		}

		const throttle = throttleByKey<DependencyId, WarmupProgressEvent>(sendNow, DOWNLOAD_PROGRESS_THROTTLE_MS)

		const emit = (event: WarmupProgressEvent): void => {
			if (event.phase === 'downloading') {
				throttle.push(event.binary, event)
				return
			}
			// Phase transition — flush any buffered downloading event so the bar
			// reaches its final captured value, then send this transition.
			throttle.flush(event.binary)
			sendNow(event)
		}

		// Per-binary budget combined with user-initiated cancel. AbortSignal.any
		// resolves with whichever fires first.
		const budgetSignal = (): AbortSignal => AbortSignal.any([userSignal, AbortSignal.timeout(PER_BINARY_BUDGET_MS)])

		const startedAt = Date.now()
		const elapsed: Record<WarmupBranch, number> = {ytDlp: 0, ffmpeg: 0, token: 0}

		// Branches log on settle, not on start. Three parallel branches produce
		// interleaved start/end pairs that are harder to read than the summary
		// below, which already pairs the durations. Completion lines earn their
		// place by surviving a hang: the summary is written at the end and a hang
		// never reaches it, but two settled branches and a missing third names the
		// stuck one.
		const timed = async <T>(branch: WarmupBranch, work: Promise<T>): Promise<T> => {
			try {
				return await work
			} finally {
				elapsed[branch] = Date.now() - startedAt
				logger.info('Warmup branch settled', {branch, elapsedMs: elapsed[branch]})
			}
		}

		// Not awaited, so it is usually still 'pending' when the result is built.
		// Carried anyway: on the slow cold starts where the binaries take minutes,
		// this is the difference between "YouTube was unreachable at startup" being
		// a fact the output states and one only a log reader ever learns.
		let tokenWarmup: TokenWarmupStatus = 'pending'

		try {
			// Deliberately not awaited. A missing token is already soft — the first
			// YouTube probe mints on demand — so blocking the splash on it buys nothing
			// and risks tens of seconds of dead splash when YouTube is slow or
			// unreachable. userSignal is still plumbed so cancel() interrupts the
			// HiddenWindow scrape and mint round-trip.
			void timed(
				'token',
				tokenService.warmUp(AbortSignal.any([userSignal, AbortSignal.timeout(TOKEN_WARMUP_BUDGET_MS)])).catch(err => {
					const reason = err instanceof Error ? err.message : String(err)
					logger.warn('Token warmup threw', {error: reason})
					return {ready: false, reason} as const
				})
			).then(tokenStatus => {
				tokenWarmup = tokenStatus.ready ? 'ready' : 'unavailable'
				// Surface in a single info line so log review reveals "all binaries
				// resolved but PoT didn't pre-warm — slow probes expected on YT".
				if (!tokenStatus.ready) logger.info('Token service did not pre-warm; first YT probe will mint on demand', {reason: tokenStatus.reason})
			})

			const [ytDlpDiag, ffmpegPair] = await Promise.all([timed('ytDlp', binaryManager.resolveYtDlp({onProgress: emit, signal: budgetSignal()})), timed('ffmpeg', binaryManager.resolveFFmpegPair({onProgress: emit, signal: budgetSignal()}))])

			// The record type is the enforcement: a DependencyId with no entry here
			// is a compile error, not a missing splash row.
			const dependencies: Record<DependencyId, DependencyDiagnostic> = {'yt-dlp': ytDlpDiag, ffmpeg: ffmpegPair.ffmpeg, ffprobe: ffmpegPair.ffprobe}

			const blockingFailures = blockingDependencyFailures(dependencies)
			const cancelled = userSignal.aborted

			// Branches share one start, so the largest elapsed is by definition the one
			// that held the Promise.all open.
			const gatedBy = GATING_BRANCHES.reduce((a, b) => (elapsed[a] >= elapsed[b] ? a : b))
			const timings = {totalMs: Date.now() - startedAt, gatedBy, branches: elapsed}

			if (cancelled) {
				logger.info('Warmup cancelled', {blockingFailures, ...timings})
			} else if (blockingFailures.length > 0) {
				logger.warn('Warmup completed with blocking failures', {blockingFailures, ...timings})
			} else {
				logger.info('Warmup completed', timings)
			}

			const completed = !cancelled && blockingFailures.length === 0
			return ok({completed, dependencies, blockingFailures: [...blockingFailures], cancelled, tokenWarmup})
		} catch (err) {
			// A resolver is allowed to reject: an EACCES on the artifact cache
			// directory propagates straight out of the readdir that enumerates it.
			// `handleRaw` does no error wrapping of its own, so a rejection here
			// would otherwise cross the IPC boundary as one — and the renderer only
			// sets `initialized` after `warmUp()` settles, so the startup splash
			// would stay up forever with no error and no way out. Catching here is
			// what makes the Result return type load-bearing rather than ceremony.
			const message = unknownToMessage(err)
			logger.error('Warmup failed before any diagnostics could be produced', {error: message})
			return fail(createAppError('binary', message, undefined, true))
		} finally {
			// Buffered progress is flushed on every exit, including the throwing one:
			// a leaked timer would fire into a destroyed window, and the bar would
			// otherwise freeze at whatever value the throttle happened to be holding.
			throttle.flushAll()
			onResolved?.()
		}
	}
}
