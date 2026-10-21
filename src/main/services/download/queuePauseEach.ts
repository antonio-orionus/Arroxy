import log from 'electron-log/main.js'
import {createAppError, unknownToMessage} from '@main/utils/errorFactory.js'
import type {Result} from '@shared/result.js'
import {QUEUE_STATUS, type QueueItemStatus} from '@shared/schemas.js'
import type {QueueSchedulerCommandFailure} from '@shared/types.js'

const logger = log.scope('queue')

interface PauseEachDeps {
	pause: (itemId: string) => Promise<Result<void>>
	statusOf: (itemId: string) => QueueItemStatus | undefined
}

// Pause-all's per-item pass: pauses each item in turn and sorts it into done
// or failed, keeping that item's own error. One failure, returned or thrown,
// never stops the rest.
export async function pauseEach(itemIds: readonly string[], {pause, statusOf}: PauseEachDeps): Promise<{done: string[]; failed: QueueSchedulerCommandFailure[]}> {
	const done: string[] = []
	const failed: QueueSchedulerCommandFailure[] = []
	for (const itemId of itemIds) {
		try {
			const result = await pause(itemId)
			const status = statusOf(itemId)
			if (result.ok && status === QUEUE_STATUS.pausedActive) {
				done.push(itemId)
				continue
			}
			// pause() also succeeds without pausing when the download has no live
			// job left (it just ended) or the row moved on while it waited.
			const error = result.ok ? createAppError('validation', `queue item ${itemId} was not paused (status ${status ?? 'removed'})`) : result.error
			logger.warn('pauseAll: failed to pause item', {itemId, error: error.message})
			failed.push({itemId, error})
		} catch (err) {
			const error = createAppError('unknown', unknownToMessage(err))
			logger.warn('pauseAll: unexpected error pausing item', {itemId, error: error.message})
			failed.push({itemId, error})
		}
	}
	return {done, failed}
}
