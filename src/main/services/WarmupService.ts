import type {BrowserWindow} from 'electron'
import log from 'electron-log/main.js'

import {ok, fail, type Result} from '@shared/result.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {blockingDependencyFailures} from '@shared/dependencyPolicy.js'
import type {DependencyDiagnostic, DependencyId, WarmUpOutput, WarmupProgressEvent} from '@shared/types.js'
import {createAppError, unknownToMessage} from '@main/utils/errorFactory.js'
import {throttleByKey} from '@main/utils/throttleByKey.js'
import type {BinaryManager} from './BinaryManager.js'
import type {TokenService} from './TokenService.js'

const logger = log.scope('warmup')

// Stop a binary resolve only once it goes quiet for this long. Any progress
// event — a downloaded chunk or a phase change — restarts the clock. A
// wall-clock cap (90s, later 30 minutes) killed transfers that were still
// progressing: both binaries download at once, so below ~0.3 Mbit/s they could
// not finish in 30 minutes however often the user retried. The downloader
// already gives up after 60s without bytes per attempt; this is the backstop for
// a hang its own timers miss, so the splash can never wait forever.
const BRANCH_IDLE_LIMIT_MS = 10 * 60 * 1000

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

// The two awaited resolver branches that gate completion, plus the token branch
// that is warmed alongside them but never gates: a missing token is soft, and
// the first YouTube probe mints on demand.
type WarmupBranch = 'ytDlp' | 'ffmpeg' | 'token'

// Watches one warmup run: every progress event as it happens (before the IPC
// throttle), then the result. The warmup report is built on it.
export interface WarmupRunObservation {
	progress(event: WarmupProgressEvent): void
	settled(result: Result<WarmUpOutput>): Promise<void>
}

export interface WarmupRunObserver {
	runStarted(): WarmupRunObservation
}

interface WarmupServiceDeps {
	binaryManager: BinaryManager
	tokenService: TokenService
	window?: BrowserWindow
	onResolved?: () => void
	observer?: WarmupRunObserver
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
		const observation = this.observe()
		const promise = this.settleRun(controller, this.executeRun(controller.signal, observation), observation)
		this.currentRun = promise
		return promise
	}

	// Bookkeeping has to happen inside the returned promise, not in a `.finally()`
	// chained onto it. A chained handler settles a microtask *after* the caller's
	// `await` resumes, so a caller that runs again the moment warmup finishes was
	// handed back the run that had just completed instead of a fresh one.
	private async settleRun(controller: AbortController, work: Promise<Result<WarmUpOutput>>, observation: WarmupRunObservation | null): Promise<Result<WarmUpOutput>> {
		try {
			const result = await work
			this.lastResult = result
			// Not awaited: an observer may go to the network, and the splash must not wait for it.
			void observation?.settled(result).catch((err: unknown) => logger.warn('Warmup observer failed', {error: unknownToMessage(err)}))
			return result
		} finally {
			// A force-run that started meanwhile owns these now; only clear our own.
			if (this.currentController === controller) {
				this.currentRun = null
				this.currentController = null
			}
		}
	}

	// An observer that throws loses its run, never the warmup.
	private observe(): WarmupRunObservation | null {
		try {
			return this.deps.observer?.runStarted() ?? null
		} catch (err) {
			logger.warn('Warmup observer failed', {error: unknownToMessage(err)})
			return null
		}
	}

	private async executeRun(userSignal: AbortSignal, observation: WarmupRunObservation | null): Promise<Result<WarmUpOutput>> {
		const {binaryManager, tokenService, window, onResolved} = this.deps

		const sendNow = (event: WarmupProgressEvent): void => {
			if (!window || window.isDestroyed()) return
			window.webContents.send(IPC_CHANNELS.warmupProgress, event)
		}

		const throttle = throttleByKey<DependencyId, WarmupProgressEvent>(sendNow, DOWNLOAD_PROGRESS_THROTTLE_MS)

		const emit = (event: WarmupProgressEvent): void => {
			try {
				observation?.progress(event)
			} catch (err) {
				logger.warn('Warmup observer failed', {error: unknownToMessage(err)})
			}
			if (event.phase === 'downloading') {
				throttle.push(event.binary, event)
				return
			}
			// Phase transition — flush any buffered downloading event so the bar
			// reaches its final captured value, then send this transition.
			throttle.flush(event.binary)
			sendNow(event)
		}

		// Runs one resolver branch under the idle limit, combined with the user's
		// cancel. Each progress event the branch reports re-arms the limit.
		const watchBranch = async <T>(branch: WarmupBranch, work: (opts: {signal: AbortSignal; onProgress: (event: WarmupProgressEvent) => void}) => Promise<T>): Promise<T> => {
			const idle = new AbortController()
			let timer: NodeJS.Timeout | undefined
			const rearm = (): void => {
				clearTimeout(timer)
				timer = setTimeout(() => {
					logger.warn('Warmup branch made no progress, stopping it', {branch, idleLimitMs: BRANCH_IDLE_LIMIT_MS})
					idle.abort(new Error(`No ${branch} setup progress for ${BRANCH_IDLE_LIMIT_MS}ms`))
				}, BRANCH_IDLE_LIMIT_MS)
			}
			rearm()
			try {
				return await work({
					signal: AbortSignal.any([userSignal, idle.signal]),
					onProgress: event => {
						rearm()
						emit(event)
					}
				})
			} finally {
				clearTimeout(timer)
			}
		}

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

		try {
			// Deliberately not awaited. A missing token is already soft — the first
			// YouTube probe mints on demand — so blocking the splash on it buys nothing
			// and risks tens of seconds of dead splash when YouTube is slow or
			// unreachable. userSignal is still plumbed so cancel() interrupts the
			// HiddenWindow scrape and mint round-trip.
			//
			// The trailing .catch is not about the token warm-up itself — that path
			// already swallows its own rejection above — it is about `timed`'s own
			// finally-block logging. A throw there would otherwise surface as an
			// unhandled rejection with no caller left to observe it.
			void timed(
				'token',
				tokenService.warmUp(AbortSignal.any([userSignal, AbortSignal.timeout(TOKEN_WARMUP_BUDGET_MS)])).catch(err => {
					const reason = err instanceof Error ? err.message : String(err)
					logger.warn('Token warmup threw', {error: reason})
					return {ready: false, reason} as const
				})
			)
				.then(tokenStatus => {
					// Surface in a single info line so log review reveals "all binaries
					// resolved but PoT didn't pre-warm — slow probes expected on YT".
					if (!tokenStatus.ready) logger.info('Token service did not pre-warm; first YT probe will mint on demand', {reason: tokenStatus.reason})
				})
				.catch(err => logger.warn('Token warmup branch bookkeeping failed', {error: unknownToMessage(err)}))

			const [ytDlpDiag, ffmpegPair] = await Promise.all([
				timed(
					'ytDlp',
					watchBranch('ytDlp', opts => binaryManager.resolveYtDlp(opts))
				),
				timed(
					'ffmpeg',
					watchBranch('ffmpeg', opts => binaryManager.resolveFFmpegPair(opts))
				)
			])

			// The record type is the enforcement: a DependencyId with no entry here
			// is a compile error, not a missing splash row.
			const dependencies: Record<DependencyId, DependencyDiagnostic> = {'yt-dlp': ytDlpDiag, ffmpeg: ffmpegPair.ffmpeg, ffprobe: ffmpegPair.ffprobe}

			const blockingFailures = blockingDependencyFailures(dependencies)
			const cancelled = userSignal.aborted

			// Only two branches are awaited, so the larger elapsed is by definition the
			// one that held the Promise.all open.
			const gatedBy = elapsed.ytDlp >= elapsed.ffmpeg ? 'ytDlp' : 'ffmpeg'
			// token is excluded here: it is never awaited, so at this point it is
			// almost always still 0 and would misreport as instant rather than
			// pending — see the per-branch 'Warmup branch settled' log for its
			// actual duration once it lands.
			const timings = {totalMs: Date.now() - startedAt, gatedBy, branches: {ytDlp: elapsed.ytDlp, ffmpeg: elapsed.ffmpeg}}

			if (cancelled) {
				logger.info('Warmup cancelled', {blockingFailures, ...timings})
			} else if (blockingFailures.length > 0) {
				logger.warn('Warmup completed with blocking failures', {blockingFailures, ...timings})
			} else {
				logger.info('Warmup completed', timings)
			}

			const completed = !cancelled && blockingFailures.length === 0
			return ok({completed, dependencies, blockingFailures: [...blockingFailures], cancelled})
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
