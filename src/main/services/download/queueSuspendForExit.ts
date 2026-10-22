import log from 'electron-log/main.js'
import type {Result} from '@shared/result.js'
import {QUEUE_STATUS, type QueueItemStatus} from '@shared/schemas.js'
import type {QueueItem} from '@shared/types.js'
import {pauseEach} from './queuePauseEach.js'

const logger = log.scope('queue')

interface SuspendForExitDeps {
	items: () => readonly QueueItem[]
	// Running rows and rows still starting, as pause-all takes them.
	activeIds: () => string[]
	// Stops every new spawn (an inter-job sleep or a retry timer that fires
	// starts nothing) without telling the renderer. Retry times are saved and
	// re-armed at boot.
	holdScheduler: () => void
	pause: (itemId: string) => Promise<Result<void>>
	// Rows the queue file shows as pending (see queueForNextLaunch).
	requeued: Set<string>
	// Writes the queue with the pause flag the user set, never the hold.
	save: () => Promise<void>
	summary: () => Record<string, number>
}

// Quitting keeps the queue. Running and starting rows stop the way a pause
// stops them, so their partial files stay, then go back to pending with their
// temp folder: the next launch continues them on its own, as it does rows a
// crash left running. Nothing is cancelled, and the file keeps the pause flag
// the user set.
export async function suspendQueueForExit(deps: SuspendForExitDeps): Promise<void> {
	deps.holdScheduler()
	const statusOf = (itemId: string): QueueItemStatus | undefined => deps.items().find(i => i.id === itemId)?.status
	const active = deps.activeIds()
	logger.info('suspendForExit', {activeCount: active.length, snapshot: deps.summary()})
	// Marked before they stop, so each write a pause makes already shows them
	// pending: a stop that outlasts the quit budget must not leave earlier rows
	// paused in the file. A started row parks as paused-active, a row still
	// starting as paused-held; queueForNextLaunch shows either as pending.
	for (const itemId of active) deps.requeued.add(itemId)
	await pauseEach(active, {pause: deps.pause, statusOf})
	await deps.save()
	logger.info('suspendForExit done', {snapshot: deps.summary()})
}

// What the queue file holds once quitting has stopped rows: each stays paused
// in memory, so a start or an event still in flight sees a paused row, but the
// file shows it pending with its temp folder, as resumeAll would leave it, so
// the next launch continues it. A row that finished meanwhile keeps its status.
export function queueForNextLaunch(items: QueueItem[], requeued: ReadonlySet<string>): QueueItem[] {
	if (requeued.size === 0) return items
	return items.map(item => (requeued.has(item.id) && (item.status === QUEUE_STATUS.pausedActive || item.status === QUEUE_STATUS.pausedHeld) ? {...item, status: QUEUE_STATUS.pending, progressDetail: null} : item))
}
