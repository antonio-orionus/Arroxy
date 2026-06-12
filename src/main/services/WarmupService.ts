import type {BrowserWindow} from 'electron'
import log from 'electron-log/main.js'

import {ok, type Result} from '@shared/result.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {blockingDependencyFailures} from '@shared/dependencyPolicy.js'
import {DEPENDENCY_IDS, type DependencyDiagnostic, type DependencyId, type WarmUpOutput, type WarmupProgressEvent} from '@shared/types.js'
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
		const promise = this.executeRun(controller.signal)
		this.currentRun = promise
		promise
			.then(result => {
				this.lastResult = result
			})
			.catch(() => {
				/* lastResult stays as previous; currentRun cleared below */
			})
			.finally(() => {
				if (this.currentRun === promise) this.currentRun = null
				if (this.currentController === controller) this.currentController = null
			})
		return promise
	}

	private async executeRun(userSignal: AbortSignal): Promise<Result<WarmUpOutput>> {
		const {binaryManager, tokenService, window, onResolved} = this.deps

		const sendNow = (event: WarmupProgressEvent): void => {
			if (!window || window.isDestroyed()) return
			window.webContents.send(IPC_CHANNELS.warmupProgress, event)
		}

		interface Slot {
			pending: WarmupProgressEvent | null
			timer: NodeJS.Timeout | null
		}
		const slots = new Map<DependencyId, Slot>()
		const slotFor = (id: DependencyId): Slot => {
			const existing = slots.get(id)
			if (existing) return existing
			const slot: Slot = {pending: null, timer: null}
			slots.set(id, slot)
			return slot
		}
		const flush = (slot: Slot): void => {
			if (slot.timer) {
				clearTimeout(slot.timer)
				slot.timer = null
			}
			if (slot.pending) {
				const ev = slot.pending
				slot.pending = null
				sendNow(ev)
			}
		}
		const flushAll = (): void => {
			for (const slot of slots.values()) flush(slot)
		}

		const emit = (event: WarmupProgressEvent): void => {
			const slot = slotFor(event.binary)
			if (event.phase === 'downloading') {
				slot.pending = event
				slot.timer ??= setTimeout(() => {
					slot.timer = null
					const ev = slot.pending
					slot.pending = null
					if (ev) sendNow(ev)
				}, DOWNLOAD_PROGRESS_THROTTLE_MS)
				return
			}
			// Phase transition — flush any buffered downloading event so the bar
			// reaches its final captured value, then send this transition.
			flush(slot)
			sendNow(event)
		}

		// Per-binary budget combined with user-initiated cancel. AbortSignal.any
		// resolves with whichever fires first.
		const budgetSignal = (): AbortSignal => AbortSignal.any([userSignal, AbortSignal.timeout(PER_BINARY_BUDGET_MS)])

		const [ytDlpDiag, ffmpegPair, tokenStatus] = await Promise.all([
			binaryManager.resolveYtDlp({onProgress: emit, signal: budgetSignal()}),
			binaryManager.resolveFFmpegPair({onProgress: emit, signal: budgetSignal()}),
			// Plumb userSignal so cancel() interrupts the HiddenWindow scrape and
			// mint round-trip — without this, cancelling a slow probe/scrape leaves
			// the token warmup running until natural completion.
			tokenService.warmUp(userSignal).catch(err => {
				const reason = err instanceof Error ? err.message : String(err)
				logger.warn('Token warmup threw', {error: reason})
				return {ready: false, reason} as const
			})
		])
		if (!tokenStatus.ready) {
			// Surface in a single info line so log review reveals "all binaries
			// resolved but PoT didn't pre-warm — slow probes expected on YT".
			logger.info('Token service did not pre-warm; first YT probe will mint on demand', {reason: tokenStatus.reason})
		}
		flushAll()

		const dependencies: Record<DependencyId, DependencyDiagnostic> = {'yt-dlp': ytDlpDiag, ffmpeg: ffmpegPair.ffmpeg, ffprobe: ffmpegPair.ffprobe}

		const blockingFailures = blockingDependencyFailures(dependencies)
		const cancelled = userSignal.aborted

		if (cancelled) {
			logger.info('Warmup cancelled', {blockingFailures})
		} else if (blockingFailures.length > 0) {
			logger.warn('Warmup completed with blocking failures', {blockingFailures})
		} else {
			logger.info('Warmup completed')
		}

		onResolved?.()

		// Acknowledge full DEPENDENCY_IDS list to keep linter / future maintainers
		// honest if a new dep id is added without updating the result map.
		const completed = !cancelled && blockingFailures.length === 0
		const result: WarmUpOutput = {completed, dependencies, blockingFailures: [...blockingFailures], cancelled}
		void DEPENDENCY_IDS
		return ok(result)
	}
}
