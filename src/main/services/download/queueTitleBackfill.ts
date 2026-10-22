// Deferred title backfill (Layer 1) for fabricated playlist row titles
// (`Untitled · #N`). Rows wait in `pending` while a probe resolves their real
// title in the background — no user action, no new IPC.
//
// Load-bearing pacing: concurrency 1, and the loop yields while ANY download
// is running, so a backfill probe never races an active yt-dlp transfer for
// network or rate-limit headroom. A blocked loop re-arms a single retry timer
// until the lane clears. Its probes are background ones (ProbeSlots): each
// waits behind every placeholder row's probe and out of its site's cooldown,
// and asks again when its slot is granted: a download that started meanwhile
// defers the lookup, which goes back to the front and waits for the lane; a
// row removed or titled meanwhile is dropped.
//
// Follows the QueueProbeLifecycle host-interface pattern: no queue state here,
// every read and mutation goes back through the injected deps. ProbeService
// itself is injected as a title-returning function at the composition root so
// this module imports neither QueueService nor ProbeService (no cycles).
//
// Failures are silent best-effort — the row keeps its flag and Layer 2 (the
// artifact backstop) may still cover it at download time.

import log from 'electron-log/main.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {withBackfilledTitle} from '@shared/queueTitle.js'
import type {QueueItem} from '@shared/types.js'

const logger = log.scope('queue')

// What a title lookup came back with. `deferred`: a download started while
// the lookup waited for its probe slot, so nothing ran; `cancelled`: its probe
// was aborted.
export type TitleLookup = {kind: 'found'; title: string} | {kind: 'none'} | {kind: 'cancelled'} | {kind: 'deferred'}

export interface QueueTitleBackfillDeps {
	items: () => readonly QueueItem[]
	patch: (itemId: string, reason: string, patcher: (item: QueueItem) => QueueItem) => void
	// Looks up a video URL's real title (titleBackfillProbe at the composition
	// root). `admit` says whether the lookup may still start when its probe slot
	// is granted. Should not throw; a throw counts as nothing found.
	probeTitle: (url: string, admit: () => boolean) => Promise<TitleLookup>
	retryDelayMs?: number
}

const RETRY_DELAY_MS = 5_000

export class QueueTitleBackfill {
	private readonly pending: {itemId: string; url: string}[] = []
	private pumping = false
	private retryTimer: NodeJS.Timeout | null = null

	constructor(private readonly deps: QueueTitleBackfillDeps) {}

	// Enqueue added rows that still carry the flag. Container rows never reach
	// the queue (every submission seam filters them), and rows without the
	// flag are already resolved — both skip here by construction.
	enqueueForItems(items: readonly QueueItem[]): void {
		let added = false
		for (const item of items) {
			if (item.titleIsPlaceholder !== true) continue
			if (this.pending.some(target => target.itemId === item.id)) continue
			this.pending.push({itemId: item.id, url: item.url})
			added = true
		}
		if (added) void this.pump()
	}

	dispose(): void {
		if (this.retryTimer) {
			clearTimeout(this.retryTimer)
			this.retryTimer = null
		}
		this.pending.length = 0
	}

	private stillUntitled(itemId: string): boolean {
		return this.deps.items().find(item => item.id === itemId)?.titleIsPlaceholder === true
	}

	private hasActiveDownload(): boolean {
		return this.deps.items().some(item => item.status === QUEUE_STATUS.running)
	}

	private scheduleRetry(): void {
		if (this.retryTimer) return
		this.retryTimer = setTimeout(() => {
			this.retryTimer = null
			void this.pump()
		}, this.deps.retryDelayMs ?? RETRY_DELAY_MS)
	}

	private async pump(): Promise<void> {
		if (this.pumping) return
		this.pumping = true
		try {
			while (this.pending.length > 0) {
				if (this.hasActiveDownload()) {
					this.scheduleRetry()
					return
				}
				const target = this.pending.shift()
				if (!target) return
				if (!this.stillUntitled(target.itemId)) continue
				let lookup: TitleLookup = {kind: 'none'}
				try {
					lookup = await this.deps.probeTitle(target.url, () => !this.hasActiveDownload() && this.stillUntitled(target.itemId))
				} catch (err) {
					logger.debug('Title backfill probe failed — leaving row for the artifact backstop', {itemId: target.itemId, error: err instanceof Error ? err.message : String(err)})
				}
				// Declined at its slot: a row gone or titled meanwhile is dropped; one held back by a download waits first in line.
				if (lookup.kind === 'deferred' && !this.stillUntitled(target.itemId)) continue
				if (lookup.kind === 'deferred') {
					this.pending.unshift(target)
					this.scheduleRetry()
					return
				}
				if (lookup.kind === 'cancelled') logger.info('Title backfill lookup cancelled — leaving row for the artifact backstop', {itemId: target.itemId})
				if (lookup.kind !== 'found') continue
				const realTitle = lookup.title
				// Re-check: the artifact backstop may have resolved the row
				// while the probe was in flight — never overwrite a real title.
				if (!this.stillUntitled(target.itemId)) continue
				this.deps.patch(target.itemId, 'title-backfill', prev => (prev.titleIsPlaceholder === true ? withBackfilledTitle(prev, realTitle) : prev))
				logger.info('Title backfilled', {itemId: target.itemId, title: realTitle})
			}
		} finally {
			this.pumping = false
		}
	}
}
