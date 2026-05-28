// QueueService — authoritative queue-of-record on main. Renderer is a
// read-only projection: it sends commands and receives snapshot + diff
// events. All mutations route through the pure transition() function from
// @shared/queueTransition.
//
// Concurrency policy (lane-aware):
//   - lane='normal' items respect NORMAL_LANE_CAP (1) and the inter-job
//     sleep window, so back-to-back normal jobs give YouTube's rate-limit
//     window a chance to roll over.
//   - lane='priority' items bypass the cap and the sleep window — user
//     intent is "skip the queue, pull now alongside the active job".
//     Priority spawns are still gated by MAX_CONCURRENT_DOWNLOADS to
//     protect the machine and avoid bot-detection escalation.
//
// Mutation pipeline: every state change flows through commit() — one
// internal seam that runs apply → persist → emit → recomputeSchedule. No
// caller decides when to schedule; it always happens.

import { EventEmitter } from 'node:events';
import { stat } from 'node:fs/promises';
import log from 'electron-log/main.js';
import { fail, ok, type Result } from '@shared/result.js';
import { createAppError } from '@main/utils/errorFactory.js';
import { nowIso } from '@main/utils/clock.js';
import { QUEUE_STATUS, STATUS_KEY, type QueueItemStatus, type QueueLane, type StatusKey } from '@shared/schemas.js';
import { transition, illegalTransition, type QueueEvent } from '@shared/queueTransition.js';
import { ProgressFormatter, nextMonotonicPercent } from '@shared/progressFormat.js';
import { INTER_JOB_SLEEP_MS, MAX_CONCURRENT_DOWNLOADS, NORMAL_LANE_CAP } from '@shared/constants.js';
import type { ProgressEvent, QueueItem, StatusEvent } from '@shared/types.js';
import type { QueueStore } from '@main/stores/QueueStore.js';
import type { PlaylistManifestStore } from '@main/stores/PlaylistManifestStore.js';
import type { PlaylistManifest } from '@shared/playlistManifest.js';
import type { DownloadService } from './DownloadService.js';

const logger = log.scope('queue');

function isTerminalStatus(s: QueueItemStatus): boolean {
  return s === QUEUE_STATUS.done || s === QUEUE_STATUS.error || s === QUEUE_STATUS.cancelled;
}

// Discriminated union covering every shape a mutation can take. commit()
// is the only writer; new mutation kinds add a case here (compile-checked
// in commit's exhaustive switch) instead of inventing a new helper.
type Mutation = { kind: 'add'; items: QueueItem[] } | { kind: 'event'; itemId: string; evt: QueueEvent } | { kind: 'patch'; itemId: string; patcher: (item: QueueItem) => QueueItem; reason: string } | { kind: 'remove'; itemId: string };

export class QueueService extends EventEmitter {
  private items: QueueItem[] = [];
  // Items currently mid-spawn (downloadService.start awaiting). recomputeSchedule
  // counts these toward activeCount so a re-fire during the await window
  // doesn't double-spawn the same item.
  private readonly spawning = new Set<string>();
  // Earliest time the next normal-lane spawn is allowed. Cleared on cancel-all
  // or when no normal job remains. Priority spawns ignore this.
  private sleepUntil = 0;
  private sleepTimer: NodeJS.Timeout | null = null;
  // Global "queue paused" flag — qBittorrent-style. When true, the auto-
  // scheduler is fully suspended: no pending items spawn, no priority items
  // spawn, no sleep timer fires anything new. Per-item explicit actions
  // (`start(itemId)`, `resume(itemId)`) still spawn directly because the user
  // asked for that specific item; only the implicit "next pending" loop is
  // halted. Cleared by `resumeAll()` or `cancel(null)`. Session-only — does
  // not survive app restart.
  private schedulerPaused = false;
  // One ProgressFormatter per running jobId — preserves throttle / spike-suppress
  // state across consecutive progress lines for that job.
  private readonly progressFormatters = new Map<string, ProgressFormatter>();
  // Progress-event coalescing seam. yt-dlp emits many progress lines per second
  // per job; un-throttled, the renderer queue projection (290+ items) cannot
  // keep up with the IPC fan-out. Progress is lossy (latest wins per item),
  // transitions (started/completed/failed/phase patch) are not — they bypass
  // the buffer via emitImmediate and drop any in-flight progress for that item.
  private pendingProgress = new Map<string, QueueItem>();
  private flushTimer: NodeJS.Timeout | null = null;
  private static readonly PROGRESS_FLUSH_MS = 100;
  // Bulk-mutation guard: when true, per-commit persist() is suppressed so a
  // bulk operation (cancelAll, clearCompleted) writes queue.json once at the
  // end instead of N times. JSON.stringify on a 290-item queue is ~5ms each;
  // 500+ writes back-to-back blocks the main thread for seconds.
  private inBulk = false;

  constructor(
    private readonly queueStore: QueueStore,
    private readonly downloadService: DownloadService,
    private readonly normalCap = NORMAL_LANE_CAP,
    private readonly maxConcurrent = MAX_CONCURRENT_DOWNLOADS,
    private readonly playlist?: {
      manifestStore: PlaylistManifestStore;
      writeM3u: (manifest: PlaylistManifest) => Promise<void>;
    }
  ) {
    super();
    this.downloadService.on('status', (event: StatusEvent) => this.consumeStatusEvent(event));
    this.downloadService.on('progress', (event: ProgressEvent) => this.consumeProgressEvent(event));
  }

  async init(): Promise<void> {
    const result = await this.queueStore.load();
    if (!result.ok) {
      logger.error('Queue load failed — starting empty', { error: result.error.message });
      this.items = [];
      return;
    }
    this.items = result.data.items;
    this.schedulerPaused = result.data.schedulerPaused;
    logger.info('Queue loaded', { count: this.items.length, schedulerPaused: this.schedulerPaused });
    // Boot-time spawn pass: respects maxConcurrent so persisted priority
    // items never trigger a storm. Anything beyond the ceiling stays pending.
    // Skipped if the user quit with the queue paused (flag persisted).
    this.recomputeSchedule();
  }

  snapshot(): QueueItem[] {
    return [...this.items];
  }

  // commands ---------------------------------------------------------------

  add(toAdd: QueueItem[]): Result<{ ids: string[] }> {
    if (toAdd.length === 0) return ok({ ids: [] });
    this.commit({ kind: 'add', items: toAdd });
    return ok({ ids: toAdd.map((i) => i.id) });
  }

  // Explicit-start IPC entry point. The scheduler auto-spawns pending items
  // on add/resume/retry, so this is rarely needed from the renderer; kept
  // for parity with the existing IPC contract and tests that drive a single
  // item through start() directly.
  async start(itemId: string): Promise<Result<void>> {
    const item = this.findItem(itemId);
    if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`));
    if (item.status !== QUEUE_STATUS.pending) {
      return fail(createAppError('validation', `cannot start item in status ${item.status}`));
    }
    return this.spawnViaStart(itemId, undefined);
  }

  async pause(itemId: string): Promise<Result<void>> {
    const item = this.findItem(itemId);
    if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`));

    if (item.status === QUEUE_STATUS.pending) {
      this.commit({ kind: 'event', itemId, evt: { kind: 'paused-held' } });
      return ok(undefined);
    }

    if (item.status !== QUEUE_STATUS.running) {
      return fail(createAppError('validation', `cannot pause item in status ${item.status}`));
    }
    if (!item.lastJobId) return fail(createAppError('validation', 'item has no lastJobId'));

    const pauseResult = await this.downloadService.pause(item.lastJobId);
    if (!pauseResult.ok) return fail(pauseResult.error);
    if (!pauseResult.data.paused) return ok(undefined);

    this.commit({ kind: 'event', itemId, evt: { kind: 'paused-active', tempDir: pauseResult.data.tempDir } });
    return ok(undefined);
  }

  async pauseAll(): Promise<void> {
    // Flip the global pause flag FIRST so the per-item pause commits below
    // can't re-trigger an auto-spawn of the next pending item (the original
    // "pause all → next one starts" bug).
    this.schedulerPaused = true;
    this.clearSleep();
    const running = this.items.filter((i) => i.status === QUEUE_STATUS.running);
    logger.info('pauseAll', { runningCount: running.length, total: this.items.length, snapshot: this.statusSummary() });
    for (const item of running) {
      try {
        const result = await this.pause(item.id);
        if (!result.ok) {
          logger.warn('pauseAll: failed to pause item', { itemId: item.id, error: result.error.message });
        }
      } catch (err) {
        logger.warn('pauseAll: unexpected error pausing item', { itemId: item.id, error: err instanceof Error ? err.message : String(err) });
      }
    }
    // Ensure the flag itself reaches disk even if no items needed pausing
    // (e.g. queue had only pending items).
    this.persist();
    logger.info('pauseAll done', { snapshot: this.statusSummary() });
  }

  // Global "resume queue" — counterpart to pauseAll. Clears the scheduler
  // pause flag, transitions every paused-* item back to pending (preserving
  // resume context like tempDir/lastJobId on paused-active rows), then lets
  // recomputeSchedule do the spawning. Critical: must NOT call `resume(id)`
  // per item — that path bypasses the cap (it's the explicit-user path) and
  // would spawn every paused-active in parallel.
  // eslint-disable-next-line @typescript-eslint/require-await -- async for IPC parity
  async resumeAll(): Promise<void> {
    this.schedulerPaused = false;
    const held = this.items.filter((i) => i.status === QUEUE_STATUS.pausedHeld);
    const pausedActive = this.items.filter((i) => i.status === QUEUE_STATUS.pausedActive);
    logger.info('resumeAll', { heldCount: held.length, pausedActiveCount: pausedActive.length, snapshot: this.statusSummary() });
    for (const item of held) {
      this.commit({ kind: 'event', itemId: item.id, evt: { kind: 'retry-reset' } });
    }
    for (const item of pausedActive) {
      // Patch (not transition) — keep tempDir + lastJobId so the upcoming
      // spawn picks up the .part files. retry-reset would wipe both. Going
      // through `pending` instead of `running` is critical: it routes the
      // spawn through recomputeSchedule, which enforces the cap. Calling
      // `resume(id)` per item instead bypasses the cap and spawns all
      // paused-active items in parallel — that was the "resume → 10 in
      // parallel" bug.
      this.commit({
        kind: 'patch',
        itemId: item.id,
        reason: 'resumeAll:queueResume',
        patcher: (prev) => ({ ...prev, status: QUEUE_STATUS.pending, progressDetail: null })
      });
    }
    // Final sweep — picks up the items that the per-item commits left on the
    // table because the cap was already satisfied during their commit.
    this.recomputeSchedule();
    this.persist();
    logger.info('resumeAll done', { snapshot: this.statusSummary() });
  }

  schedulerIsPaused(): boolean {
    return this.schedulerPaused;
  }

  async resume(itemId: string): Promise<Result<void>> {
    const item = this.findItem(itemId);
    if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`));

    if (item.status === QUEUE_STATUS.pausedHeld) {
      this.commit({ kind: 'event', itemId, evt: { kind: 'retry-reset' } });
      return ok(undefined);
    }

    if (item.status !== QUEUE_STATUS.pausedActive) {
      return fail(createAppError('validation', `cannot resume item in status ${item.status}`));
    }

    // Try in-session resume first; if main has no record (cross-restart),
    // fall back to a fresh start with --continue picking up the .part.
    if (item.lastJobId) {
      const resumeResult = await this.downloadService.resume(item.lastJobId);
      if (resumeResult.ok && resumeResult.data.resumed) {
        this.commit({ kind: 'event', itemId, evt: { kind: 'resumed' } });
        return ok(undefined);
      }
    }

    let tempDir = item.tempDir;
    if (tempDir) {
      try {
        const s = await stat(tempDir);
        if (!s.isDirectory()) tempDir = undefined;
      } catch {
        logger.debug('resume: persisted tempDir missing — restarting fresh', { itemId, tempDir });
        tempDir = undefined;
      }
    }
    return this.spawnViaStart(itemId, tempDir);
  }

  async cancel(itemId: string | null): Promise<Result<void>> {
    if (itemId === null) {
      await this.downloadService.cancel();
      const ids = this.items.filter((i) => i.status === QUEUE_STATUS.running || i.status === QUEUE_STATUS.pausedActive || i.status === QUEUE_STATUS.pausedHeld || i.status === QUEUE_STATUS.pending).map((i) => i.id);
      logger.info('cancelAll', { ids: ids.length, snapshot: this.statusSummary() });
      // Suppress scheduler during the sweep. Without this guard, the FIRST
      // per-item commit fires recomputeSchedule, which sees the still-running
      // priority lane + still-pending normals and spawns a fresh download.
      // The rest of the loop then cancels that brand-new item — but the
      // yt-dlp child process is already alive (downloadService.cancel ran
      // BEFORE the new spawn) and keeps downloading to disk. End state: UI
      // says "cancelled", yt-dlp says "still running".
      this.clearSleep();
      this.schedulerPaused = true;
      this.inBulk = true;
      try {
        for (const id of ids) {
          this.commit({ kind: 'event', itemId: id, evt: { kind: 'cancelled' } });
        }
      } finally {
        this.inBulk = false;
      }
      // Restore "fresh slate" — future adds auto-spawn. Nothing pending
      // survives the sweep, so this last recomputeSchedule is a no-op
      // unless the renderer added a new item mid-flight.
      this.schedulerPaused = false;
      this.recomputeSchedule();
      // Single persist for the whole sweep — also flushes schedulerPaused=false.
      this.persist();
      logger.info('cancelAll done', { snapshot: this.statusSummary() });
      return ok(undefined);
    }

    const item = this.findItem(itemId);
    if (!item) return ok(undefined);

    if (item.status === QUEUE_STATUS.pending || item.status === QUEUE_STATUS.pausedHeld) {
      this.commit({ kind: 'event', itemId, evt: { kind: 'cancelled' } });
      return ok(undefined);
    }

    if (item.lastJobId) {
      await this.downloadService.cancel(item.lastJobId);
    }
    this.commit({ kind: 'event', itemId, evt: { kind: 'cancelled' } });
    return ok(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Result API is async
  async retry(itemId: string): Promise<Result<void>> {
    const item = this.findItem(itemId);
    if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`));
    if (item.status !== QUEUE_STATUS.error && item.status !== QUEUE_STATUS.cancelled) {
      return fail(createAppError('validation', `cannot retry item in status ${item.status}`));
    }
    this.commit({ kind: 'event', itemId, evt: { kind: 'retry-reset' } });
    return ok(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Result API is async
  async setLane(itemId: string, lane: QueueLane): Promise<Result<void>> {
    const item = this.findItem(itemId);
    if (!item) return fail(createAppError('validation', `queue item ${itemId} not found`));
    // Lane is intent. Allow change for pre-terminal items only; flipping a
    // done/cancelled/error item has no effect on scheduling.
    if (item.status === QUEUE_STATUS.done || item.status === QUEUE_STATUS.cancelled || item.status === QUEUE_STATUS.error) {
      return fail(createAppError('validation', `cannot change lane of item in status ${item.status}`));
    }
    if (item.lane === lane) return ok(undefined);
    this.commit({ kind: 'patch', itemId, reason: `setLane:${lane}`, patcher: (prev) => ({ ...prev, lane }) });
    return ok(undefined);
  }

  clearCompleted(): Result<void> {
    const idsToRemove = this.items.filter((i) => i.status === QUEUE_STATUS.done || i.status === QUEUE_STATUS.cancelled || i.status === QUEUE_STATUS.error).map((i) => i.id);
    this.inBulk = true;
    try {
      for (const id of idsToRemove) {
        this.commit({ kind: 'remove', itemId: id });
      }
    } finally {
      this.inBulk = false;
    }
    if (idsToRemove.length > 0) this.persist();
    return ok(undefined);
  }

  remove(itemId: string): Result<void> {
    const item = this.findItem(itemId);
    if (!item) return ok(undefined);
    if (item.status === QUEUE_STATUS.running) {
      return fail(createAppError('validation', 'cannot remove a running item — cancel it first'));
    }
    this.commit({ kind: 'remove', itemId });
    return ok(undefined);
  }

  // event ingestion --------------------------------------------------------

  consumeStatusEvent(event: StatusEvent): void {
    const item = this.findByJobId(event.jobId);
    if (!item) return;
    if (event.stage === 'done') {
      this.progressFormatters.delete(event.jobId);
      // Inter-job cooldown applies only when a normal-lane job finishes —
      // priority jobs are user-driven bursts, no need to throttle the queue
      // after they wrap.
      if (item.lane === 'normal') this.armSleepWindow();
      this.commit({
        kind: 'event',
        itemId: item.id,
        evt: { kind: 'completed', finishedAt: nowIso(), lastStatusKey: event.statusKey, params: event.params }
      });
      return;
    }
    if (event.stage === 'error') {
      this.progressFormatters.delete(event.jobId);
      // Cancellation arrives as STATUS_KEY.cancelled — already projected via
      // the cancel command path. Skip a redundant transition.
      if (event.statusKey === 'cancelled') return;
      if (item.lane === 'normal') this.armSleepWindow();
      this.commit({
        kind: 'event',
        itemId: item.id,
        evt: { kind: 'failed', error: event.error ?? { kind: 'unknown', raw: '' }, lastStatusKey: event.statusKey, params: event.params }
      });
      return;
    }
    // Phase transition — non-status update for "Merging…", "Embedding…", etc.
    // Skip for terminal states to avoid stale events mutating cancelled/done.
    if (item.status === QUEUE_STATUS.cancelled || item.status === QUEUE_STATUS.done) return;
    this.commit({
      kind: 'patch',
      itemId: item.id,
      reason: `phase:${event.statusKey}`,
      patcher: (prev) => ({ ...prev, lastStatus: { key: event.statusKey, params: event.params }, progressDetail: null })
    });
  }

  // Post-download phase keys. yt-dlp can emit a straggler `[download] X%`
  // line AFTER the Merger/Metadata/MoveFiles status events due to stdout
  // buffering. Without this gate, the late progress event would re-populate
  // `progressDetail` and the UI would flip from "Merging formats…" back to
  // "downloading at X MB/s" — visible regression on every fast job.
  private static readonly POST_DOWNLOAD_PHASES: ReadonlySet<StatusKey> = new Set([STATUS_KEY.mergingFormats, STATUS_KEY.extractingAudio, STATUS_KEY.convertingVideo, STATUS_KEY.embeddingMetadata, STATUS_KEY.movingFiles]);

  consumeProgressEvent(event: ProgressEvent): void {
    const item = this.findByJobId(event.jobId);
    if (!item) return;
    // Drop progress arriving while item is in a post-download phase (see
    // POST_DOWNLOAD_PHASES). Also drop the pending coalesced progress for
    // this item — a phase patch already cleared it via emitImmediate, but a
    // racing progress event could have re-enqueued before this guard ran.
    const lastKey = item.lastStatus?.key;
    if (lastKey && QueueService.POST_DOWNLOAD_PHASES.has(lastKey)) {
      this.pendingProgress.delete(item.id);
      return;
    }
    let formatter = this.progressFormatters.get(event.jobId);
    if (!formatter) {
      formatter = new ProgressFormatter();
      this.progressFormatters.set(event.jobId, formatter);
    }
    const detail = formatter.update(event.line);
    this.commit({
      kind: 'event',
      itemId: item.id,
      evt: { kind: 'progress', percent: nextMonotonicPercent(item.progressPercent, event.percent), ...(detail !== null ? { detail } : {}) }
    });
  }

  // commit pipeline --------------------------------------------------------

  // Transitions, phase patches, and any non-progress update bypass the
  // coalescer. A pending progress emit for the same item is dropped because
  // the transition encodes a newer state; emitting the stale progress after
  // the transition would briefly revert UI from e.g. "merging" to "downloading
  // 47%". Dropping is safe because progress fields ride along on every
  // QueueItem and the transition's `next` already carries the latest values.
  private emitImmediate(item: QueueItem): void {
    this.pendingProgress.delete(item.id);
    this.emit('updated', { item });
  }

  // Latest-wins per itemId, flushed at PROGRESS_FLUSH_MS. setTimeout (not
  // setImmediate) so the renderer event loop can drain between bursts.
  private emitProgress(item: QueueItem): void {
    this.pendingProgress.set(item.id, item);
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      const batch = this.pendingProgress;
      this.pendingProgress = new Map();
      for (const it of batch.values()) this.emit('updated', { item: it });
    }, QueueService.PROGRESS_FLUSH_MS);
  }

  // Test seam — synchronously drain pending progress. Production code never
  // calls this; the timer flushes naturally.
  flushPendingProgressForTests(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    const batch = this.pendingProgress;
    this.pendingProgress = new Map();
    for (const it of batch.values()) this.emit('updated', { item: it });
  }

  private commit(mutation: Mutation): void {
    logger.debug('commit', { mutation: this.describeMutation(mutation) });
    switch (mutation.kind) {
      case 'add': {
        const atIdx = this.items.length;
        this.items.push(...mutation.items);
        this.persist();
        this.emit('added', { items: mutation.items, atIdx });
        break;
      }
      case 'event': {
        const idx = this.items.findIndex((i) => i.id === mutation.itemId);
        if (idx < 0) return;
        const prev = this.items[idx];
        const illegal = illegalTransition(prev, mutation.evt);
        if (illegal) {
          logger.debug('Skipping illegal transition', { itemId: mutation.itemId, evt: mutation.evt.kind, reason: illegal });
          return;
        }
        const next = transition(prev, mutation.evt);
        this.items[idx] = next;
        this.persist();
        if (isTerminalStatus(next.status) && next.playlistGroupId) {
          const groupId = next.playlistGroupId;
          void this.maybeWritePlaylistM3u(groupId).catch((err) => {
            logger.error('Failed to write playlist M3U', {
              playlistGroupId: groupId,
              error: err instanceof Error ? err.message : String(err)
            });
          });
        }
        if (mutation.evt.kind === 'progress') this.emitProgress(next);
        else this.emitImmediate(next);
        break;
      }
      case 'patch': {
        const idx = this.items.findIndex((i) => i.id === mutation.itemId);
        if (idx < 0) return;
        const next = mutation.patcher(this.items[idx]);
        this.items[idx] = next;
        this.persist();
        this.emitImmediate(next);
        break;
      }
      case 'remove': {
        const idx = this.items.findIndex((i) => i.id === mutation.itemId);
        if (idx < 0) return;
        this.items.splice(idx, 1);
        this.persist();
        this.pendingProgress.delete(mutation.itemId);
        this.emit('removed', { itemId: mutation.itemId });
        break;
      }
    }
    this.recomputeSchedule();
  }

  // scheduler --------------------------------------------------------------

  private recomputeSchedule(): void {
    // Global pause: scheduler is dormant. Per-item explicit start/resume
    // still spawn directly via spawnViaStart — they don't go through here.
    if (this.schedulerPaused) {
      logger.debug('recomputeSchedule skipped (queue paused)', { snapshot: this.statusSummary() });
      return;
    }
    const now = Date.now();
    let activeCount = this.spawning.size + this.items.filter((i) => i.status === QUEUE_STATUS.running || i.status === QUEUE_STATUS.pausedActive).length;
    let normalRunning = this.items.filter((i) => i.status === QUEUE_STATUS.running && i.lane === 'normal').length;
    for (const s of this.spawning) {
      const item = this.findItem(s);
      if (item?.lane === 'normal') normalRunning++;
    }

    let armSleep = false;
    const spawned: string[] = [];
    for (const item of this.items) {
      if (item.status !== QUEUE_STATUS.pending) continue;
      if (this.spawning.has(item.id)) continue;
      if (activeCount >= this.maxConcurrent) break;
      if (item.lane === 'priority') {
        this.beginSpawn(item.id);
        spawned.push(item.id);
        activeCount++;
        continue;
      }
      // Normal lane.
      if (normalRunning >= this.normalCap) continue;
      if (now < this.sleepUntil) {
        armSleep = true;
        continue;
      }
      this.beginSpawn(item.id);
      spawned.push(item.id);
      activeCount++;
      normalRunning++;
    }
    if (spawned.length > 0 || armSleep) {
      logger.info('recomputeSchedule', { spawned, activeCount, normalRunning, normalCap: this.normalCap, ceiling: this.maxConcurrent, sleepUntil: this.sleepUntil, armSleep, snapshot: this.statusSummary() });
    }

    // Arm/clear the sleep timer based on whether anything is waiting on it.
    if (armSleep && !this.sleepTimer) {
      const delay = Math.max(0, this.sleepUntil - now);
      this.sleepTimer = setTimeout(() => {
        this.sleepTimer = null;
        this.sleepUntil = 0;
        this.recomputeSchedule();
      }, delay);
    } else if (!armSleep && this.sleepTimer && this.sleepUntil <= now) {
      // Sleep window expired and nothing's waiting — drop the timer if it
      // somehow outlived its purpose.
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
  }

  private beginSpawn(itemId: string): void {
    if (this.spawning.has(itemId)) return;
    this.spawning.add(itemId);
    const item = this.findItem(itemId);
    logger.info('beginSpawn', { itemId, lane: item?.lane, hasTempDir: Boolean(item?.tempDir), spawningSize: this.spawning.size });
    void this.spawnViaStart(itemId, undefined).catch((err) => {
      logger.error('Auto-start failed', { itemId, error: err instanceof Error ? err.message : String(err) });
    });
  }

  private async spawnViaStart(itemId: string, tempDir: string | undefined): Promise<Result<void>> {
    this.spawning.add(itemId);
    const item = this.findItem(itemId);
    if (!item) {
      this.spawning.delete(itemId);
      return fail(createAppError('validation', `queue item ${itemId} not found`));
    }
    // Fall back to the item's persisted tempDir so a pending item that came
    // from a paused-active row (via resumeAll's patch) picks up its .part
    // files instead of starting over.
    const effectiveTempDir = tempDir ?? item.tempDir;
    try {
      const result = await this.downloadService.start({ url: item.url, outputDir: item.outputDir, job: item.job, tempDir: effectiveTempDir });
      if (!result.ok) {
        this.commit({ kind: 'event', itemId, evt: { kind: 'failed', error: { kind: 'unknown', raw: result.error.message } } });
        return fail(result.error);
      }
      const currentItem = this.findItem(itemId);
      if (!currentItem || currentItem.status === QUEUE_STATUS.cancelled) {
        await this.downloadService.cancel(result.data.job.id);
        return ok(undefined);
      }
      this.commit({ kind: 'event', itemId, evt: { kind: 'started', lastJobId: result.data.job.id } });
      return ok(undefined);
    } finally {
      this.spawning.delete(itemId);
    }
  }

  private armSleepWindow(): void {
    this.sleepUntil = Date.now() + INTER_JOB_SLEEP_MS;
    // Don't pre-arm the timer here — recomputeSchedule decides whether one
    // is actually needed (no pending items ⇒ no timer).
  }

  private clearSleep(): void {
    this.sleepUntil = 0;
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
  }

  // helpers ----------------------------------------------------------------

  private findItem(itemId: string): QueueItem | undefined {
    return this.items.find((i) => i.id === itemId);
  }

  private findByJobId(jobId: string): QueueItem | undefined {
    return this.items.find((i) => i.lastJobId === jobId);
  }

  private async maybeWritePlaylistM3u(playlistGroupId: string): Promise<void> {
    if (!this.playlist) return;
    const group = this.items.filter((i) => i.playlistGroupId === playlistGroupId);
    const allTerminal = group.every((i) => isTerminalStatus(i.status));
    if (!allTerminal) return;
    const manifest = this.playlist.manifestStore.get(playlistGroupId);
    if (!manifest) return;
    await this.playlist.writeM3u(manifest);
  }

  // Persist gate: short-circuits when a bulk op (cancelAll, clearCompleted)
  // is in flight. Each commit() call site invokes persist() unconditionally
  // for clarity — the guard here is the single chokepoint. If a future bulk
  // path adds items (e.g., import-from-file), the same invariant holds
  // without needing per-case handling.
  private persist(): void {
    if (this.inBulk) return;
    void this.queueStore.save(this.items, this.schedulerPaused).catch((err) => {
      logger.error('Queue persist failed', { error: err instanceof Error ? err.message : String(err) });
    });
  }

  // Diagnostic helpers — used for logging. Kept inline (not stripped under
  // NODE_ENV) so post-mortem of a user log file is possible without a
  // dedicated dev build.
  private statusSummary(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of this.items) {
      const key = `${item.status}:${item.lane}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    counts.spawning = this.spawning.size;
    counts.paused = this.schedulerPaused ? 1 : 0;
    return counts;
  }

  private describeMutation(m: Mutation): string {
    switch (m.kind) {
      case 'add':
        return `add[${m.items.length}]`;
      case 'event':
        return `event[${m.itemId}:${m.evt.kind}]`;
      case 'patch':
        return `patch[${m.itemId}:${m.reason}]`;
      case 'remove':
        return `remove[${m.itemId}]`;
    }
  }
}
