import type {QueueActionSkippedItem, QueueItem, QueueItemStatus, QueueSelectionAction} from './types.js'

const VALID_STATUSES: Record<QueueSelectionAction, ReadonlySet<QueueItemStatus>> = {
	pause: new Set(['pending', 'running']),
	resume: new Set(['paused-held', 'paused-active']),
	cancel: new Set(['pending', 'running', 'paused-held', 'paused-active']),
	retry: new Set(['error', 'cancelled']),
	remove: new Set(['pending', 'paused-held', 'paused-active', 'done', 'error', 'cancelled']),
	'change-output-target': new Set(['pending']),
	'pull-now': new Set(['pending'])
}

export interface QueueActionPlan {
	action: QueueSelectionAction
	applicableIds: string[]
	skipped: QueueActionSkippedItem[]
}

export function canApplyQueueAction(action: QueueSelectionAction, status: QueueItemStatus): boolean {
	return VALID_STATUSES[action].has(status)
}

export function isNeverStartedPendingItem(item: QueueItem): boolean {
	return item.status === 'pending' && !item.lastJobId && !item.tempDir && !item.resumeContext && item.progressPercent === 0
}

export function canApplyQueueActionToItem(action: QueueSelectionAction, item: QueueItem): boolean {
	if (action === 'change-output-target') return isNeverStartedPendingItem(item)
	return canApplyQueueAction(action, item.status)
}

export function planQueueAction(action: QueueSelectionAction, items: readonly QueueItem[]): QueueActionPlan {
	const applicableIds: string[] = []
	const skipped: QueueActionPlan['skipped'] = []
	for (const item of items) {
		if (canApplyQueueActionToItem(action, item)) applicableIds.push(item.id)
		else skipped.push({itemId: item.id, status: item.status, reason: 'invalid-status'})
	}
	return {action, applicableIds, skipped}
}
