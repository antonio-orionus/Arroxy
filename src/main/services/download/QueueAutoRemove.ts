// Takes a finished download out of the queue a short while after it completes,
// when the user turned that on. Extracted from QueueService (same pattern as
// QueueAutoRetry) so the scheduler keeps its single responsibility. It only
// schedules; the removal itself goes through the queue's own remove path.
import log from 'electron-log/main.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {AUTO_REMOVE_COMPLETED_DELAY_MS} from '@shared/constants.js'
import type {QueueItem} from '@shared/types.js'

const logger = log.scope('queue')

export interface QueueAutoRemoveDeps {
	findItem: (itemId: string) => QueueItem | undefined
	remove: (itemId: string) => Promise<unknown>
}

export class QueueAutoRemove {
	private enabled = false
	private readonly timers = new Map<string, NodeJS.Timeout>()

	constructor(private readonly deps: QueueAutoRemoveDeps) {}

	// Turning it off drops removals already scheduled, so a row the user just
	// chose to keep is not taken from under them. Turning it on does not sweep
	// rows that finished earlier: only downloads that finish from now on go.
	setEnabled(value: boolean): void {
		this.enabled = value
		logger.info('Auto-remove completed changed', {autoRemoveCompleted: value})
		if (!value) this.clearAll()
	}

	schedule(itemId: string): void {
		if (!this.enabled) return
		this.clear(itemId)
		const timer = setTimeout(() => {
			this.timers.delete(itemId)
			this.fire(itemId)
		}, AUTO_REMOVE_COMPLETED_DELAY_MS)
		timer.unref?.()
		this.timers.set(itemId, timer)
	}

	clear(itemId: string): void {
		const timer = this.timers.get(itemId)
		if (!timer) return
		clearTimeout(timer)
		this.timers.delete(itemId)
	}

	clearAll(): void {
		for (const timer of this.timers.values()) clearTimeout(timer)
		this.timers.clear()
	}

	private fire(itemId: string): void {
		// The user may have removed it, or retried it into a new run, meanwhile.
		if (this.deps.findItem(itemId)?.status !== QUEUE_STATUS.done) return
		logger.info('Auto-removing completed download', {itemId})
		this.deps.remove(itemId).catch((error: unknown) => {
			logger.warn('Auto-remove failed', {itemId, error: error instanceof Error ? error.message : String(error)})
		})
	}
}
