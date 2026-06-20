import {fail, ok, type Result} from '@shared/result.js'
import {canApplyQueueAction} from '@shared/queueActions.js'
import type {QueueActionSkippedItem, QueueItem, QueueSelectionAction, QueueSelectionCommandResult} from '@shared/types.js'
import {createAppError} from '@main/utils/errorFactory.js'

export interface QueueSelectionActionHost {
	cancel(itemId: string): Promise<Result<void>>
	findItem(itemId: string): QueueItem | undefined
	pause(itemId: string): Promise<Result<void>>
	remove(itemId: string): Promise<Result<void>>
	resume(itemId: string): Promise<Result<void>>
	retry(itemId: string): Promise<Result<void>>
	setLane(itemId: string, lane: 'priority'): Promise<Result<void>>
}

export async function applyQueueSelectionAction(host: QueueSelectionActionHost, action: QueueSelectionAction, itemIds: string[]): Promise<Result<QueueSelectionCommandResult>> {
	if ((action as string) === 'change-output-target') return fail(createAppError('validation', 'change-output-target requires outputDir'))

	const appliedIds: string[] = []
	const skipped: QueueActionSkippedItem[] = []

	for (const itemId of itemIds) {
		const item = host.findItem(itemId)
		if (!item) {
			skipped.push({itemId, reason: 'not-found'})
			continue
		}
		if (!canApplyQueueAction(action, item.status)) {
			skipped.push({itemId, status: item.status, reason: 'invalid-status'})
			continue
		}

		let result: Result<void>
		switch (action) {
			case 'pause':
				result = await host.pause(itemId)
				break
			case 'resume':
				result = await host.resume(itemId)
				break
			case 'cancel':
				result = await host.cancel(itemId)
				break
			case 'retry':
				result = await host.retry(itemId)
				break
			case 'remove':
				result = await host.remove(itemId)
				break
			case 'pull-now':
				result = await host.setLane(itemId, 'priority')
				break
		}

		if (result.ok) appliedIds.push(itemId)
		else skipped.push({itemId, status: item.status, reason: 'failed'})
	}

	return ok({action, appliedIds, skipped})
}
