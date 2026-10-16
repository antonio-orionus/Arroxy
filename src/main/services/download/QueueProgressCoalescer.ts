import type {QueueItem} from '@shared/types.js'

// Progress-event coalescing seam. yt-dlp emits many progress lines per second
// per job; un-throttled, the renderer queue projection (290+ items) cannot
// keep up with the IPC fan-out. Progress is lossy (latest wins per item),
// transitions (started/completed/failed/phase patch) are not — they bypass
// the buffer and drop any in-flight progress for that item.
export class QueueProgressCoalescer {
	private pending = new Map<string, QueueItem>()
	private timer: NodeJS.Timeout | null = null

	constructor(
		private readonly emit: (item: QueueItem) => void,
		private readonly flushMs: number
	) {}

	// Latest-wins per itemId, flushed after flushMs. setTimeout (not
	// setImmediate) so the renderer event loop can drain between bursts.
	enqueue(item: QueueItem): void {
		this.pending.set(item.id, item)
		if (this.timer) return
		this.timer = setTimeout(() => {
			this.timer = null
			this.drain()
		}, this.flushMs)
	}

	// A newer state for the item supersedes its queued progress.
	drop(itemId: string): void {
		this.pending.delete(itemId)
	}

	// Synchronously emits everything queued; the timer flushes naturally otherwise.
	flushNow(): void {
		if (this.timer) {
			clearTimeout(this.timer)
			this.timer = null
		}
		this.drain()
	}

	private drain(): void {
		const batch = this.pending
		this.pending = new Map()
		for (const item of batch.values()) this.emit(item)
	}
}
