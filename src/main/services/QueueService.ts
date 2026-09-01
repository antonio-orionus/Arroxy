// QueueService — authoritative queue-of-record on main. Renderer is a
// read-only projection: it sends commands and receives snapshot + diff
// events. All mutations route through the pure transition() function from
// @shared/queueTransition.
//
// Concurrency policy (lane-aware):
//   - lane='normal' items respect the normal-lane cap and the inter-job sleep
//     window, so back-to-back normal jobs give YouTube's rate-limit window a
//     chance to roll over. The cap defaults to NORMAL_LANE_CAP (1) and is
//     user-configurable via setConcurrentDownloads().
//   - lane='priority' items bypass the cap and the sleep window — user
//     intent is "skip the queue, pull now alongside the active job".
//     Priority spawns are still gated by the ceiling, which keeps
//     PRIORITY_LANE_HEADROOM slots above the normal cap so "pull now" works
//     even with the normal lane saturated.
//
// Adjacent concerns live in ./download: InterJobSleep (the pacing window),
// QueueAutoRetry (automatic retry budget + timers), QueuePlaylistM3u
// (serialized .m3u writes).
//
// Mutation pipeline: every state change flows through commit() — one
// internal seam that runs apply → persist → emit → recomputeSchedule. No
// caller decides when to schedule; it always happens.

import {EventEmitter} from 'node:events'
import log from 'electron-log/main.js'
import {fail, ok, type Result} from '@shared/result.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {nowIso} from '@main/utils/clock.js'
import {QUEUE_STATUS, STATUS_KEY, type QueueLane, type StatusKey} from '@shared/schemas.js'
import {transition, illegalTransition} from '@shared/queueTransition.js'
import {ProgressFormatter} from '@shared/progressFormat.js'
import {ProgressNormalizer} from '@shared/progressNormalizer.js'
import {moveQueueArtifactPath, queueArtifactFromPath, upsertQueueArtifact} from '@shared/queueArtifacts.js'
import {MAX_CONCURRENT_DOWNLOADS, NORMAL_LANE_CAP, PRIORITY_LANE_HEADROOM} from '@shared/constants.js'
import {InterJobSleep} from './download/InterJobSleep.js'
import {QueueAutoRetry} from './download/QueueAutoRetry.js'
import {QueuePlaylistM3u} from './download/QueuePlaylistM3u.js'
import {findInadmissibleQueueItem, findLiveDuplicate} from './download/queueAdmission.js'
import {QueueProbeLifecycle} from './download/QueueProbeLifecycle.js'
import {describeMutation, statusSummary, type Mutation} from './download/queueMutation.js'
import type {ProgressEvent, QueueArtifactEvent, QueueItem, QueueOutputTargetChangeResult, QueueSelectionAction, QueueSelectionCommandResult, QueueSnapshotPayload, StatusEvent, LocalizedError} from '@shared/types.js'

import type {QueueStore} from '@main/stores/QueueStore.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import type {PlaylistManifest} from '@shared/playlistManifest.js'
import type {DownloadService} from './DownloadService.js'
import {QueueResumeLifecycle} from './download/QueueResumeLifecycle.js'
import {FinalArtifactTargets} from './finalArtifactTargets.js'
import type {ProbeInfoJsonCache} from './ProbeInfoJsonCache.js'
import {changeQueueOutputTarget} from './queueOutputTargetMove.js'
import {QueueArtifactCleanup} from './download/queueArtifactCleanup.js'
import {applyQueueSelectionAction} from './queueSelectionActionApply.js'

const logger = log.scope('queue')

export class QueueService extends EventEmitter {
	private items: QueueItem[] = []
	// Items currently mid-spawn (downloadService.start awaiting). recomputeSchedule
	// counts these toward activeCount so a re-fire during the await window
	// doesn't double-spawn the same item.
	private readonly spawning = new Set<string>()
	// Earliest time the next normal-lane spawn is allowed. Cleared on cancel-all
	// or when no normal job remains. Priority spawns ignore this.
	private readonly sleep = new InterJobSleep()
	// Global "queue paused" flag — qBittorrent-style: while true the auto-scheduler is fully
	// suspended; explicit per-item start/resume still spawn directly. Restored in init(); emits `scheduler`.
	private schedulerPaused = false
	// Renderer-reported pause state (last non-silent emit or boot snapshot).
	private rendererSchedulerPaused = false

	// Single owner of the pause transition: emits `scheduler` only on a real change;
	// `opts.silent` suppresses it for the cancel-all sweep. Boot restore assigns directly.
	private setSchedulerPaused(paused: boolean, opts?: {silent?: boolean}): void {
		if (this.schedulerPaused === paused) return
		this.schedulerPaused = paused
		if (!opts?.silent) this.rendererSchedulerPaused = paused
		if (!opts?.silent) this.emit('scheduler', {paused})
	}
	// One ProgressFormatter per running jobId — preserves throttle / spike-suppress
	// state across consecutive progress lines for that job.
	private readonly progressFormatters = new Map<string, ProgressFormatter>()
	// One ProgressNormalizer per running jobId — keeps yt-dlp percent quirks out
	// of the queue state machine.
	private readonly progressNormalizers = new Map<string, ProgressNormalizer>()
	// Progress-event coalescing seam. yt-dlp emits many progress lines per second
	// per job; un-throttled, the renderer queue projection (290+ items) cannot
	// keep up with the IPC fan-out. Progress is lossy (latest wins per item),
	// transitions (started/completed/failed/phase patch) are not — they bypass
	// the buffer via emitImmediate and drop any in-flight progress for that item.
	private pendingProgress = new Map<string, QueueItem>()
	private flushTimer: NodeJS.Timeout | null = null
	private static readonly PROGRESS_FLUSH_MS = 100
	// Bulk-mutation guard: when true, per-commit persist() and scheduler recompute
	// are suppressed so a bulk operation writes queue.json once and cannot spawn
	// replacement downloads midway through a multi-item command.
	private inBulk = false
	private readonly finalArtifactTargets = new FinalArtifactTargets()
	// Owns the automatic-retry budget and timers. Writes only through commit().
	private readonly autoRetry = new QueueAutoRetry({findItem: itemId => this.findItem(itemId), patch: (itemId, reason, patcher) => this.commit({kind: 'patch', itemId, reason, patcher}), retryReset: itemId => this.commit({kind: 'event', itemId, evt: {kind: 'retry-reset'}})})
	private probeAbortHook: (itemId: string) => void = () => undefined
	private readonly probeLifecycle = new QueueProbeLifecycle({
		findItem: itemId => this.findItem(itemId),
		patch: (itemId, reason, patcher) => this.commit({kind: 'patch', itemId, reason, patcher}),
		commitEvent: (itemId, evt) => this.commit({kind: 'event', itemId, evt}),
		commitRemove: itemId => this.commit({kind: 'remove', itemId}),
		commitAdd: items => this.commit({kind: 'add', items})
	})
	onProbeAbort(hook: (itemId: string) => void): void {
		this.probeAbortHook = hook
	}

	// Assigned in the constructor, not here: a field initializer cannot safely
	// read `this.playlist`, whose assignment order relative to field
	// initializers depends on the parameter-property emit.
	private readonly playlistM3u: QueuePlaylistM3u

	constructor(
		private readonly queueStore: QueueStore,
		private readonly downloadService: DownloadService,
		private normalCap = NORMAL_LANE_CAP,
		private maxConcurrent = MAX_CONCURRENT_DOWNLOADS,
		private readonly playlist?: {manifestStore: PlaylistManifestStore; writeM3u: (manifest: PlaylistManifest) => Promise<void>},
		private readonly probeInfoJsonCache?: ProbeInfoJsonCache
	) {
		super()
		this.artifactCleanup = new QueueArtifactCleanup(probeInfoJsonCache)
		this.playlistM3u = new QueuePlaylistM3u(this.playlist)
		this.downloadService.on('status', (event: StatusEvent) => this.consumeStatusEvent(event))
		this.downloadService.on('progress', (event: ProgressEvent) => this.consumeProgressEvent(event))
		this.downloadService.on('artifact', (event: QueueArtifactEvent) => this.consumeArtifactEvent(event))
	}

	async init(): Promise<void> {
		const result = await this.queueStore.load()
		if (!result.ok) {
			logger.error('Queue load failed — starting empty', {error: result.error.message})
			this.items = []
			return
		}
		this.items = result.data.items
		// Direct assignment: bridge not attached yet — the renderer hydrates the flag from the boot snapshot.
		this.schedulerPaused = result.data.schedulerPaused
		this.rendererSchedulerPaused = result.data.schedulerPaused
		logger.info('Queue loaded', {count: this.items.length, schedulerPaused: this.schedulerPaused})
		this.probeLifecycle.promoteStaleProbes(this.items)
		this.autoRetry.rearmPersisted(this.items)
		// Boot-time spawn pass: respects maxConcurrent so persisted priority
		// items never trigger a storm. Anything beyond the ceiling stays pending.
		// Skipped if the user quit with the queue paused (flag persisted).
		this.recomputeSchedule()
	}

	snapshot(): QueueItem[] {
		return [...this.items]
	}

	// Single construction point for both snapshot hydration surfaces — the
	// getSnapshot IPC handler and the bridge's attach-time snapshot event.
	snapshotPayload(): QueueSnapshotPayload {
		return {items: this.snapshot(), schedulerPaused: this.schedulerPaused}
	}

	// Terminal state for a probe: the item's probe finished without a job.
	// The renderer reports it after its hotkey probe fails; only a probing
	// item accepts the transition (guarded by illegalTransition).
	probeFailed(itemId: string, error: LocalizedError): Result<void> {
		if (!this.findItem(itemId)) return fail(createAppError('validation', `queue item ${itemId} not found`))
		if (!this.probeLifecycle.probeFailed(itemId, error)) {
			return fail(createAppError('validation', `probeFailed is a stale signal for item ${itemId}`))
		}
		return ok(undefined)
	}

	// commands ---------------------------------------------------------------

	add(toAdd: QueueItem[]): Result<{ids: string[]}> {
		if (toAdd.length === 0) return ok({ids: []})
		const rejected = findInadmissibleQueueItem(toAdd)
		if (rejected) return fail(createAppError('validation', rejected.message))
		const duplicate = findLiveDuplicate(toAdd, this.items)
		if (duplicate) return fail(createAppError('conflict', duplicate.message))
		this.commit({kind: 'add', items: toAdd})
		return ok({ids: toAdd.map(i => i.id)})
	}

	// Atomic probe-stage swap; Promise.resolve keeps the IPC contract async.
	replaceProbing(itemId: string, items: QueueItem[]): Promise<Result<{ids: string[]}>> {
		return Promise.resolve(this.probeLifecycle.replaceProbing(itemId, items))
	}

	// Explicit-start IPC entry point. The scheduler auto-spawns pending items
	// on add/resume/retry, so this is rarely needed from the renderer; kept
	// for parity with the existing IPC contract and tests that drive a single
	// item through start() directly.
	async start(itemId: string): Promise<Result<void>> {
		const item = this.findItem(itemId)
		if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`))
		if (item.status !== QUEUE_STATUS.pending) {
			return fail(createAppError('validation', `cannot start item in status ${item.status}`))
		}
		return this.spawnViaStart(itemId, undefined)
	}

	async pause(itemId: string): Promise<Result<void>> {
		const item = this.findItem(itemId)
		if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`))

		if (item.status === QUEUE_STATUS.pending) {
			this.commit({kind: 'event', itemId, evt: {kind: 'paused-held'}})
			return ok(undefined)
		}

		if (item.status !== QUEUE_STATUS.running) {
			return fail(createAppError('validation', `cannot pause item in status ${item.status}`))
		}
		if (!item.lastJobId) return fail(createAppError('validation', 'item has no lastJobId'))

		const pauseResult = await this.downloadService.pause(item.lastJobId)
		if (!pauseResult.ok) return fail(pauseResult.error)
		if (!pauseResult.data.paused) return ok(undefined)

		this.commit({kind: 'event', itemId, evt: {kind: 'paused-active', tempDir: pauseResult.data.tempDir}})
		return ok(undefined)
	}

	async pauseAll(): Promise<void> {
		// Flip the pause flag FIRST so per-item commits below can't re-trigger an
		// auto-spawn of the next pending item (the "pause all → next one starts" bug).
		this.setSchedulerPaused(true)
		this.sleep.clear()
		const running = this.items.filter(i => i.status === QUEUE_STATUS.running)
		logger.info('pauseAll', {runningCount: running.length, total: this.items.length, snapshot: this.statusSummary()})
		for (const item of running) {
			try {
				const result = await this.pause(item.id)
				if (!result.ok) {
					logger.warn('pauseAll: failed to pause item', {itemId: item.id, error: result.error.message})
				}
			} catch (err) {
				logger.warn('pauseAll: unexpected error pausing item', {itemId: item.id, error: err instanceof Error ? err.message : String(err)})
			}
		}
		// Ensure the flag itself reaches disk even if no items needed pausing
		// (e.g. queue had only pending items).
		this.persist()
		logger.info('pauseAll done', {snapshot: this.statusSummary()})
	}

	// Global "resume queue" — counterpart to pauseAll. Clears the scheduler
	// pause flag, transitions every paused-* item back to pending (preserving
	// resume context like tempDir/lastJobId on paused-active rows), then lets
	// recomputeSchedule do the spawning. Critical: must NOT call `resume(id)`
	// per item — that path bypasses the cap (it's the explicit-user path) and
	// would spawn every paused-active in parallel.
	// eslint-disable-next-line @typescript-eslint/require-await -- async for IPC parity
	async resumeAll(): Promise<void> {
		this.setSchedulerPaused(false)
		const held = this.items.filter(i => i.status === QUEUE_STATUS.pausedHeld)
		const pausedActive = this.items.filter(i => i.status === QUEUE_STATUS.pausedActive)
		logger.info('resumeAll', {heldCount: held.length, pausedActiveCount: pausedActive.length, snapshot: this.statusSummary()})
		for (const item of held) {
			this.commit({kind: 'event', itemId: item.id, evt: {kind: 'retry-reset'}})
		}
		for (const item of pausedActive) {
			// Patch (not transition) — keep tempDir + lastJobId so the upcoming
			// spawn picks up the .part files. retry-reset would wipe both. Going
			// through `pending` instead of `running` is critical: it routes the
			// spawn through recomputeSchedule, which enforces the cap. Calling
			// `resume(id)` per item instead bypasses the cap and spawns all
			// paused-active items in parallel — that was the "resume → 10 in
			// parallel" bug.
			this.commit({kind: 'patch', itemId: item.id, reason: 'resumeAll:queueResume', patcher: prev => ({...prev, status: QUEUE_STATUS.pending, progressDetail: null})})
		}
		// Final sweep — picks up the items that the per-item commits left on the
		// table because the cap was already satisfied during their commit.
		this.recomputeSchedule()
		this.persist()
		logger.info('resumeAll done', {snapshot: this.statusSummary()})
	}

	// Live-applied from the settings IPC handler, so a change takes effect on
	// the running queue without a restart. Raising it spawns waiting items
	// immediately; lowering it only stops future spawns — running downloads are
	// never killed, because the user asked for a smaller lane, not for work to
	// be thrown away. The download service's own ceiling moves in lockstep or
	// it would reject the very spawns this scheduler just authorized.
	setConcurrentDownloads(value: number): void {
		const cap = Math.max(1, Math.trunc(value))
		this.normalCap = cap
		this.maxConcurrent = cap + PRIORITY_LANE_HEADROOM
		this.downloadService.setMaxConcurrent(this.maxConcurrent)
		logger.info('Concurrency changed', {normalCap: this.normalCap, ceiling: this.maxConcurrent, snapshot: this.statusSummary()})
		this.recomputeSchedule()
	}

	setAutoRetryAttempts(value: number): void {
		this.autoRetry.setAttempts(value, this.items)
	}

	// Best-effort artifact cleanup — see ./download/queueArtifactCleanup.
	private readonly artifactCleanup: QueueArtifactCleanup

	async resume(itemId: string): Promise<Result<void>> {
		const item = this.findItem(itemId)
		if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`))

		if (item.status === QUEUE_STATUS.pausedHeld) {
			this.commit({kind: 'event', itemId, evt: {kind: 'retry-reset'}})
			return ok(undefined)
		}

		if (item.status !== QUEUE_STATUS.pausedActive) {
			return fail(createAppError('validation', `cannot resume item in status ${item.status}`))
		}

		// Try in-session resume first; if main has no record (cross-restart),
		// fall back to a fresh start with --continue picking up the .part.
		if (item.lastJobId) {
			const resumeResult = await this.downloadService.resume(item.lastJobId)
			if (resumeResult.ok && resumeResult.data.resumed) {
				this.commit({kind: 'event', itemId, evt: {kind: 'resumed'}})
				return ok(undefined)
			}
		}

		const tempDir = await QueueResumeLifecycle.validateTempDir(item.tempDir)
		if (item.tempDir && !tempDir) logger.debug('resume: persisted tempDir missing — restarting fresh', {itemId, tempDir: item.tempDir})
		return this.spawnViaStart(itemId, tempDir)
	}

	async cancel(itemId: string | null): Promise<Result<void>> {
		if (itemId === null) {
			await this.downloadService.cancel()
			const ids = this.items.flatMap(i => (i.status === QUEUE_STATUS.probing || i.status === QUEUE_STATUS.running || i.status === QUEUE_STATUS.pausedActive || i.status === QUEUE_STATUS.pausedHeld || i.status === QUEUE_STATUS.pending ? [i.id] : []))
			logger.info('cancelAll', {ids: ids.length, snapshot: this.statusSummary()})
			// Suppress scheduler during the sweep. Without this guard the FIRST per-item commit fires
			// recomputeSchedule and spawns a fresh download, which the loop then cancels while its
			// yt-dlp child keeps downloading to disk. Silent: the guard is local to the sweep, not a
			// user-facing pause — no renderer flicker.
			this.sleep.clear()
			this.autoRetry.clearAll()
			this.setSchedulerPaused(true, {silent: true})
			this.inBulk = true
			try {
				for (const id of ids) {
					const item = this.findItem(id)
					if (item) await this.artifactCleanup.cleanup(item)
					if (this.findItem(id)?.status === QUEUE_STATUS.probing) this.probeAbortHook(id)
					const jobId = item?.lastJobId
					if (jobId) this.forgetProgressState(jobId)
					this.commit({kind: 'event', itemId: id, evt: {kind: 'cancelled'}})
				}
			} finally {
				this.inBulk = false
			}
			// Restore "fresh slate" — future adds auto-spawn. Emit the unpause only when it
			// undoes a renderer-visible pause (renderer-reported state, not a pre-await snapshot).
			this.setSchedulerPaused(false, {silent: !this.rendererSchedulerPaused})
			this.recomputeSchedule()
			// Single persist for the whole sweep — also flushes schedulerPaused=false.
			this.persist()
			logger.info('cancelAll done', {snapshot: this.statusSummary()})
			return ok(undefined)
		}

		const item = this.findItem(itemId)
		if (!item) return ok(undefined)
		if (this.findItem(itemId)?.status === QUEUE_STATUS.probing) this.probeAbortHook(itemId)
		this.autoRetry.clear(itemId)

		if (item.status === QUEUE_STATUS.pending || item.status === QUEUE_STATUS.pausedHeld) {
			await this.artifactCleanup.cleanup(item)
			this.commit({kind: 'event', itemId, evt: {kind: 'cancelled'}})
			return ok(undefined)
		}

		if (item.lastJobId) {
			await this.downloadService.cancel(item.lastJobId)
			this.forgetProgressState(item.lastJobId)
		}
		await this.artifactCleanup.cleanup(item)
		this.commit({kind: 'event', itemId, evt: {kind: 'cancelled'}})
		return ok(undefined)
	}

	async retry(itemId: string): Promise<Result<void>> {
		const item = this.findItem(itemId)
		if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`))
		if (item.status !== QUEUE_STATUS.error && item.status !== QUEUE_STATUS.cancelled) {
			return fail(createAppError('validation', `cannot retry item in status ${item.status}`))
		}
		// An unresolved probe-error row has no job to run — resetting it to
		// pending would make the scheduler hand an unresolved job to
		// DownloadService.start, which rejects. It stays terminal; the user can
		// remove it and hotkey-press the link again.
		if (item.job.kind === 'unresolved') {
			return fail(createAppError('validation', 'cannot retry a probe-stage item — the link must be submitted again'))
		}
		// A manual retry supersedes any scheduled automatic one and resets the
		// budget: the user intervened, so the item gets a fresh set of attempts
		// rather than inheriting an exhausted count.
		this.autoRetry.reset(itemId)
		const resumeContext = item.status === QUEUE_STATUS.error ? await QueueResumeLifecycle.validResumeContext(item) : undefined
		if (item.resumeContext && !resumeContext) {
			this.commit({kind: 'patch', itemId, reason: 'retry:clearMissingResumeContext', patcher: prev => ({...prev, resumeContext: undefined})})
		}
		this.commit({kind: 'event', itemId, evt: {kind: 'retry-reset'}})
		return ok(undefined)
	}

	// eslint-disable-next-line @typescript-eslint/require-await -- Result API is async
	async setLane(itemId: string, lane: QueueLane): Promise<Result<void>> {
		const item = this.findItem(itemId)
		if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`))
		// Lane is intent. Allow change for pre-terminal items only; flipping a
		// done/cancelled/error item has no effect on scheduling.
		if (item.status === QUEUE_STATUS.done || item.status === QUEUE_STATUS.cancelled || item.status === QUEUE_STATUS.error) {
			return fail(createAppError('validation', `cannot change lane of item in status ${item.status}`))
		}
		if (item.lane === lane) return ok(undefined)
		this.commit({kind: 'patch', itemId, reason: `setLane:${lane}`, patcher: prev => ({...prev, lane})})
		return ok(undefined)
	}

	async clearCompleted(): Promise<Result<void>> {
		const idsToRemove = this.items.flatMap(i => (i.status === QUEUE_STATUS.done || i.status === QUEUE_STATUS.cancelled || i.status === QUEUE_STATUS.error ? [i.id] : []))
		for (const id of idsToRemove) {
			const item = this.findItem(id)
			if (item) await this.artifactCleanup.cleanup(item)
		}
		this.inBulk = true
		try {
			for (const id of idsToRemove) {
				this.commit({kind: 'remove', itemId: id})
			}
		} finally {
			this.inBulk = false
		}
		if (idsToRemove.length > 0) this.persist()
		return ok(undefined)
	}

	async applySelectionAction(action: QueueSelectionAction, itemIds: string[]): Promise<Result<QueueSelectionCommandResult>> {
		this.inBulk = true
		let result: Result<QueueSelectionCommandResult>
		try {
			result = await applyQueueSelectionAction(
				{cancel: itemId => this.cancel(itemId), findItem: itemId => this.findItem(itemId), pause: itemId => this.pause(itemId), remove: itemId => this.remove(itemId), resume: itemId => this.resume(itemId), retry: itemId => this.retry(itemId), setLane: (itemId, lane) => this.setLane(itemId, lane)},
				action,
				itemIds
			)
		} finally {
			this.inBulk = false
		}
		if (result.ok) {
			this.recomputeSchedule()
			if (result.data.appliedIds.length > 0) this.persist()
		}
		return result
	}

	async changeOutputTarget(itemIds: string[], outputDir: string): Promise<Result<QueueOutputTargetChangeResult>> {
		this.inBulk = true
		const result = await changeQueueOutputTarget({findItem: itemId => this.findItem(itemId), patchItem: (itemId, reason, patcher) => this.commit({kind: 'patch', itemId, reason, patcher})}, itemIds, outputDir).finally(() => {
			this.inBulk = false
		})
		if (!result.ok) return result
		this.recomputeSchedule()
		if (result.data.items.length > 0) this.persist()
		return result
	}

	async remove(itemId: string): Promise<Result<void>> {
		const item = this.findItem(itemId)
		if (!item) return ok(undefined)
		if (this.findItem(itemId)?.status === QUEUE_STATUS.probing) this.probeAbortHook(itemId)
		if (item.status === QUEUE_STATUS.running) {
			return fail(createAppError('validation', 'cannot remove a running item — cancel it first'))
		}
		if (item.status === QUEUE_STATUS.pausedActive && item.lastJobId) {
			const cancelResult = await this.downloadService.cancel(item.lastJobId)
			if (!cancelResult.ok) return fail(cancelResult.error)
			this.forgetProgressState(item.lastJobId)
		}
		this.autoRetry.clear(itemId)
		await this.artifactCleanup.cleanup(item)
		this.commit({kind: 'remove', itemId})
		return ok(undefined)
	}

	// event ingestion --------------------------------------------------------

	consumeStatusEvent(event: StatusEvent): void {
		const item = this.findByJobId(event.jobId)
		if (!item) return
		if (event.stage === 'done') {
			this.finalArtifactTargets.remember(event.jobId, item.id)
			this.forgetProgressState(event.jobId)
			void this.artifactCleanup.cleanupProbeInfoJson(item)
			// Inter-job cooldown applies only when a normal-lane job finishes —
			// priority jobs are user-driven bursts, no need to throttle the queue
			// after they wrap.
			if (item.lane === 'normal') this.sleep.arm()
			this.commit({kind: 'event', itemId: item.id, evt: {kind: 'completed', finishedAt: nowIso(), lastStatusKey: event.statusKey, params: event.params}})
			return
		}
		if (event.stage === 'error') {
			this.forgetProgressState(event.jobId)
			// Cancellation arrives as STATUS_KEY.cancelled — already projected via
			// the cancel command path. Skip a redundant transition.
			if (event.statusKey === 'cancelled') return
			if (item.lane === 'normal') this.sleep.arm()
			const error = event.error ?? {kind: 'unknown' as const, raw: ''}
			this.commit({kind: 'event', itemId: item.id, evt: {kind: 'failed', error, resumeContext: event.resumeContext, lastStatusKey: event.statusKey, params: event.params}})
			// Read the post-commit slot: `item` predates the transition, so its
			// retryCount is the pre-failure snapshot.
			const failedItem = this.findItem(item.id)
			if (failedItem) this.autoRetry.schedule(failedItem, error)
			return
		}
		// Phase transition — non-status update for "Merging…", "Embedding…", etc.
		// Skip for terminal states to avoid stale events mutating cancelled/done.
		if (item.status === QUEUE_STATUS.cancelled || item.status === QUEUE_STATUS.done) return
		this.commit({kind: 'patch', itemId: item.id, reason: `phase:${event.statusKey}`, patcher: prev => ({...prev, lastStatus: {key: event.statusKey, params: event.params}, progressDetail: null})})
	}

	private forgetProgressState(jobId: string): void {
		this.progressFormatters.delete(jobId)
		this.progressNormalizers.delete(jobId)
	}

	// Post-download phase keys. yt-dlp can emit a straggler `[download] X%`
	// line AFTER the Merger/Metadata/MoveFiles status events due to stdout
	// buffering. Without this gate, the late progress event would re-populate
	// `progressDetail` and the UI would flip from "Merging formats…" back to
	// "downloading at X MB/s" — visible regression on every fast job.
	private static readonly POST_DOWNLOAD_PHASES: ReadonlySet<StatusKey> = new Set([STATUS_KEY.mergingFormats, STATUS_KEY.extractingAudio, STATUS_KEY.convertingVideo, STATUS_KEY.embeddingMetadata, STATUS_KEY.movingFiles])

	consumeProgressEvent(event: ProgressEvent): void {
		const item = this.findByJobId(event.jobId)
		if (!item) return
		// Drop progress arriving while item is in a post-download phase (see
		// POST_DOWNLOAD_PHASES). Also drop the pending coalesced progress for
		// this item — a phase patch already cleared it via emitImmediate, but a
		// racing progress event could have re-enqueued before this guard ran.
		const lastKey = item.lastStatus?.key
		if (lastKey && QueueService.POST_DOWNLOAD_PHASES.has(lastKey)) {
			this.pendingProgress.delete(item.id)
			return
		}
		let formatter = this.progressFormatters.get(event.jobId)
		if (!formatter) {
			formatter = new ProgressFormatter()
			this.progressFormatters.set(event.jobId, formatter)
		}
		let normalizer = this.progressNormalizers.get(event.jobId)
		if (!normalizer) {
			normalizer = new ProgressNormalizer()
			this.progressNormalizers.set(event.jobId, normalizer)
		}
		const detail = formatter.update(event.line)
		this.commit({kind: 'event', itemId: item.id, evt: {kind: 'progress', percent: normalizer.nextRunningPercent(item.progressPercent, event), ...(detail !== null ? {detail} : {})}})
	}

	consumeArtifactEvent(event: QueueArtifactEvent): void {
		const item = this.findArtifactTargetByJobId(event.jobId)
		if (!item) return
		const artifact = queueArtifactFromPath(event.path, {kind: event.kind, discoveredAt: event.at, internal: event.internal})
		const patcher = (prev: QueueItem): QueueItem => {
			if (!event.fromPath) return {...prev, artifacts: upsertQueueArtifact(prev.artifacts, artifact)}
			if (!prev.artifacts.some(existing => existing.path === event.fromPath)) return {...prev, artifacts: upsertQueueArtifact(prev.artifacts, artifact)}
			return {...prev, artifacts: upsertQueueArtifact(moveQueueArtifactPath(prev.artifacts, event.fromPath, event.path), artifact)}
		}
		this.commit({kind: 'patch', itemId: item.id, reason: `artifact:${event.kind}`, patcher})
	}

	private findArtifactTargetByJobId(jobId: string): QueueItem | undefined {
		const activeItem = this.findByJobId(jobId)
		if (activeItem) return activeItem
		const itemId = this.finalArtifactTargets.get(jobId)
		return itemId ? this.findItem(itemId) : undefined
	}

	// commit pipeline --------------------------------------------------------

	// Transitions, phase patches, and any non-progress update bypass the
	// coalescer. A pending progress emit for the same item is dropped because
	// the transition encodes a newer state; emitting the stale progress after
	// the transition would briefly revert UI from e.g. "merging" to "downloading
	// 47%". Dropping is safe because progress fields ride along on every
	// QueueItem and the transition's `next` already carries the latest values.
	private emitImmediate(item: QueueItem): void {
		this.pendingProgress.delete(item.id)
		this.emit('updated', {item})
	}

	// Latest-wins per itemId, flushed at PROGRESS_FLUSH_MS. setTimeout (not
	// setImmediate) so the renderer event loop can drain between bursts.
	private emitProgress(item: QueueItem): void {
		this.pendingProgress.set(item.id, item)
		if (this.flushTimer) return
		this.flushTimer = setTimeout(() => {
			this.flushTimer = null
			const batch = this.pendingProgress
			this.pendingProgress = new Map()
			for (const it of batch.values()) this.emit('updated', {item: it})
		}, QueueService.PROGRESS_FLUSH_MS)
	}

	// Test seam — synchronously drain pending progress. Production code never
	// calls this; the timer flushes naturally.
	flushPendingProgressForTests(): void {
		if (this.flushTimer) {
			clearTimeout(this.flushTimer)
			this.flushTimer = null
		}
		const batch = this.pendingProgress
		this.pendingProgress = new Map()
		for (const it of batch.values()) this.emit('updated', {item: it})
	}

	private commit(mutation: Mutation): void {
		logger.debug('commit', {mutation: describeMutation(mutation)})
		switch (mutation.kind) {
			case 'add': {
				const atIdx = this.items.length
				this.items.push(...mutation.items)
				this.persist()
				this.emit('added', {items: mutation.items, atIdx})
				break
			}
			case 'event': {
				const idx = this.items.findIndex(i => i.id === mutation.itemId)
				if (idx < 0) return
				const prev = this.items[idx]
				const illegal = illegalTransition(prev, mutation.evt)
				if (illegal) {
					logger.debug('Skipping illegal transition', {itemId: mutation.itemId, evt: mutation.evt.kind, reason: illegal})
					return
				}
				const next = transition(prev, mutation.evt)
				this.items[idx] = next
				this.persist()
				// Write the playlist M3U incrementally after each successful item, not
				// only when the whole group finishes: a crash, a parked (paused) item,
				// or items spread across lanes would otherwise leave no M3U despite
				// completed downloads. buildM3u is idempotent (scans disk, includes
				// only files that exist), so each write grows the playlist; a fully
				// cancelled group never triggers one, so no header-only file.
				if (next.status === QUEUE_STATUS.done && next.playlistGroupId && next.writeM3u !== false) {
					const groupId = next.playlistGroupId
					void this.playlistM3u.write(groupId).catch(err => {
						logger.error('Failed to write playlist M3U', {playlistGroupId: groupId, error: err instanceof Error ? err.message : String(err)})
					})
				}
				if (mutation.evt.kind === 'progress') this.emitProgress(next)
				else this.emitImmediate(next)
				break
			}
			case 'patch': {
				const idx = this.items.findIndex(i => i.id === mutation.itemId)
				if (idx < 0) return
				const next = mutation.patcher(this.items[idx])
				this.items[idx] = next
				this.persist()
				this.emitImmediate(next)
				break
			}
			case 'remove': {
				const idx = this.items.findIndex(i => i.id === mutation.itemId)
				if (idx < 0) return
				this.items.splice(idx, 1)
				this.persist()
				this.pendingProgress.delete(mutation.itemId)
				this.emit('removed', {itemId: mutation.itemId})
				break
			}
		}
		if (!this.inBulk) this.recomputeSchedule()
	}

	// scheduler --------------------------------------------------------------

	private recomputeSchedule(): void {
		// Global pause: scheduler is dormant. Per-item explicit start/resume
		// still spawn directly via spawnViaStart — they don't go through here.
		if (this.schedulerPaused) {
			logger.debug('recomputeSchedule skipped (queue paused)', {snapshot: this.statusSummary()})
			return
		}
		const now = Date.now()
		let activeCount = this.spawning.size + this.items.filter(i => i.status === QUEUE_STATUS.running || i.status === QUEUE_STATUS.pausedActive).length
		let normalRunning = this.items.filter(i => i.status === QUEUE_STATUS.running && i.lane === 'normal').length
		for (const s of this.spawning) {
			const item = this.findItem(s)
			if (item?.lane === 'normal') normalRunning++
		}

		let armSleep = false
		const spawned: string[] = []
		for (const item of this.items) {
			if (item.status !== QUEUE_STATUS.pending) continue
			if (this.spawning.has(item.id)) continue
			if (activeCount >= this.maxConcurrent) break
			if (item.lane === 'priority') {
				this.beginSpawn(item.id)
				spawned.push(item.id)
				activeCount++
				continue
			}
			// Normal lane.
			if (normalRunning >= this.normalCap) continue
			if (this.sleep.blocksAt(now)) {
				armSleep = true
				continue
			}
			this.beginSpawn(item.id)
			spawned.push(item.id)
			activeCount++
			normalRunning++
		}
		if (spawned.length > 0 || armSleep) {
			logger.info('recomputeSchedule', {spawned, activeCount, normalRunning, normalCap: this.normalCap, ceiling: this.maxConcurrent, sleepUntil: this.sleep.deadline, armSleep, snapshot: this.statusSummary()})
		}

		this.sleep.sync(armSleep, now, () => this.recomputeSchedule())
	}

	private beginSpawn(itemId: string): void {
		if (this.spawning.has(itemId)) return
		this.spawning.add(itemId)
		const item = this.findItem(itemId)
		logger.info('beginSpawn', {itemId, lane: item?.lane, hasTempDir: Boolean(item?.tempDir ?? item?.resumeContext?.tempDir), spawningSize: this.spawning.size})
		void this.spawnViaStart(itemId, undefined).catch(err => {
			logger.error('Auto-start failed', {itemId, error: err instanceof Error ? err.message : String(err)})
		})
	}

	private async spawnViaStart(itemId: string, tempDir: string | undefined): Promise<Result<void>> {
		this.spawning.add(itemId)
		const item = this.findItem(itemId)
		if (!item) {
			this.spawning.delete(itemId)
			return fail(createAppError('validation', `queue item ${itemId} not found`))
		}
		const effectiveTempDir = QueueResumeLifecycle.tempDirForQueueStart(item, tempDir)
		const resumeContextForImmediateFailure = item.resumeContext
		const probeInfoJsonPath = item.probeInfoJsonRef && this.probeInfoJsonCache ? await this.probeInfoJsonCache.resolve(item.probeInfoJsonRef) : undefined
		if (item.probeInfoJsonRef) {
			logger.info('probe info-json resolved', {itemId, probeInfoJsonRef: item.probeInfoJsonRef, probeInfoJsonPath: probeInfoJsonPath ?? null})
		}
		try {
			const result = await this.downloadService.start({url: item.url, outputDir: item.outputDir, job: item.job, tempDir: effectiveTempDir, ...(probeInfoJsonPath ? {probeInfoJsonPath} : {})})
			if (!result.ok) {
				this.commit({kind: 'event', itemId, evt: {kind: 'failed', error: {kind: 'unknown', raw: result.error.message}, resumeContext: resumeContextForImmediateFailure}})
				return fail(result.error)
			}
			const currentItem = this.findItem(itemId) // `item` predates the await and commit replaces slots rather than mutating, so `item.status` is the pre-start snapshot. Requiring `pending` here silently cancelled every cross-restart resume, where the item is legitimately still `paused-active`.
			if (!currentItem || currentItem.status !== item.status) {
				await this.downloadService.cancel(result.data.job.id)
				return ok(undefined)
			}
			this.commit({kind: 'event', itemId, evt: {kind: 'started', lastJobId: result.data.job.id}})
			return ok(undefined)
		} finally {
			this.spawning.delete(itemId)
		}
	}

	// helpers ----------------------------------------------------------------

	private findItem(itemId: string): QueueItem | undefined {
		return this.items.find(i => i.id === itemId)
	}

	private findByJobId(jobId: string): QueueItem | undefined {
		return this.items.find(i => i.lastJobId === jobId)
	}

	// Persist gate: short-circuits when a bulk op (cancelAll, clearCompleted)
	// is in flight. Each commit() call site invokes persist() unconditionally
	// for clarity — the guard here is the single chokepoint. If a future bulk
	// path adds items (e.g., import-from-file), the same invariant holds
	// without needing per-case handling.
	private persist(): void {
		if (this.inBulk) return
		void this.queueStore.save(this.items, this.schedulerPaused).catch(err => {
			logger.error('Queue persist failed', {error: err instanceof Error ? err.message : String(err)})
		})
	}

	// Diagnostic helpers — used for logging. Kept inline (not stripped under
	// NODE_ENV) so post-mortem of a user log file is possible without a
	// dedicated dev build.
	private statusSummary(): Record<string, number> {
		return statusSummary(this.items, this.spawning.size, this.schedulerPaused)
	}
}
