import type {QueueActionSkippedItem, QueueItem, QueueItemStatus, QueueSelectionAction} from './types.js'

export type QueueOutputTargetAction = 'change-output-target'
export type QueuePlannableAction = QueueSelectionAction | QueueOutputTargetAction

const VALID_STATUSES: Record<QueueSelectionAction, ReadonlySet<QueueItemStatus>> = {
	pause: new Set(['pending', 'running']),
	resume: new Set(['paused-held', 'paused-active']),
	// A placeholder row is live — cancelling it aborts its probe and removes it.
	cancel: new Set(['probing', 'needs-choice', 'pending', 'running', 'paused-held', 'paused-active']),
	retry: new Set(['error', 'cancelled']),
	remove: new Set(['probing', 'needs-choice', 'pending', 'paused-held', 'paused-active', 'done', 'error', 'cancelled']),
	'pull-now': new Set(['pending'])
}

const TERMINAL_STATUSES: ReadonlySet<QueueItemStatus> = new Set(['done', 'error', 'cancelled'])

export function isLiveQueueItem(item: QueueItem): boolean {
	return !TERMINAL_STATUSES.has(item.status)
}

// What a batch adds to the queue: each video once, and none already live.
// Rows whose video is live in `existing` are left out and counted; a video
// repeated within the batch is queued once, and the repeat is not counted,
// since nothing about it was already queued. A batch with only already-live
// rows is refused, naming the first of them.
export type LiveAdmission = {ok: true; admitted: QueueItem[]; skippedAlreadyQueued: number} | {ok: false; duplicate: QueueItem}

export function admitAgainstLive(items: readonly QueueItem[], existing: readonly QueueItem[]): LiveAdmission {
	const liveUrls = new Set(existing.filter(isLiveQueueItem).map(item => item.url))
	const batchUrls = new Set<string>()
	const admitted: QueueItem[] = []
	let duplicate: QueueItem | undefined
	let skippedAlreadyQueued = 0
	for (const item of items) {
		if (liveUrls.has(item.url)) {
			duplicate ??= item
			skippedAlreadyQueued += 1
			continue
		}
		if (isLiveQueueItem(item)) {
			if (batchUrls.has(item.url)) continue
			batchUrls.add(item.url)
		}
		admitted.push(item)
	}
	if (duplicate && admitted.length === 0) return {ok: false, duplicate}
	return {ok: true, admitted, skippedAlreadyQueued}
}

export interface QueueActionPlan {
	action: QueuePlannableAction
	applicableIds: string[]
	skipped: QueueActionSkippedItem[]
}

export function canApplyQueueAction(action: QueueSelectionAction, status: QueueItemStatus): boolean {
	return VALID_STATUSES[action].has(status)
}

export function isNeverStartedPendingItem(item: QueueItem): boolean {
	return item.status === 'pending' && !item.lastJobId && !item.tempDir && !item.resumeContext && item.progressPercent === 0
}

export function canApplyQueueActionToItem(action: QueuePlannableAction, item: QueueItem): boolean {
	if (action === 'change-output-target') return isNeverStartedPendingItem(item)
	if (action === 'retry' && item.job.kind === 'unresolved') return false
	return canApplyQueueAction(action, item.status)
}

export function planQueueAction(action: QueuePlannableAction, items: readonly QueueItem[]): QueueActionPlan {
	const applicableIds: string[] = []
	const skipped: QueueActionPlan['skipped'] = []
	for (const item of items) {
		if (canApplyQueueActionToItem(action, item)) applicableIds.push(item.id)
		else skipped.push({itemId: item.id, status: item.status, reason: 'invalid-status'})
	}
	return {action, applicableIds, skipped}
}
