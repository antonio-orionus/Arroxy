import log from 'electron-log/main.js'
import {createAppError, unknownToMessage} from '@main/utils/errorFactory.js'
import type {Result} from '@shared/result.js'
import type {QueueSchedulerCommandFailure} from '@shared/types.js'

const logger = log.scope('queue')

// Pause-all's per-item pass: pauses each item in turn and sorts it into done
// or failed, keeping that item's own error. One failure, returned or thrown,
// never stops the rest.
export async function pauseEach(itemIds: readonly string[], pause: (itemId: string) => Promise<Result<void>>): Promise<{done: string[]; failed: QueueSchedulerCommandFailure[]}> {
	const done: string[] = []
	const failed: QueueSchedulerCommandFailure[] = []
	for (const itemId of itemIds) {
		try {
			const result = await pause(itemId)
			if (result.ok) {
				done.push(itemId)
				continue
			}
			logger.warn('pauseAll: failed to pause item', {itemId, error: result.error.message})
			failed.push({itemId, error: result.error})
		} catch (err) {
			const error = createAppError('unknown', unknownToMessage(err))
			logger.warn('pauseAll: unexpected error pausing item', {itemId, error: error.message})
			failed.push({itemId, error})
		}
	}
	return {done, failed}
}
