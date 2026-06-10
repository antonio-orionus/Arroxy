import type {QueueItem, QuickDownloadStatus} from '@shared/types.js'
import {QUEUE_STATUS, type QueueItemStatus} from '@shared/schemas.js'

export interface QuickDownloadFeedbackState {
	quickDownloadStatus: QuickDownloadStatus
	quickDownloadError: string | null
	quickDownloadQueueIds: string[]
}

export type QuickDownloadFeedbackPatch = Partial<QuickDownloadFeedbackState>

export const QUICK_DOWNLOAD_FEEDBACK_INITIAL = {quickDownloadStatus: 'idle', quickDownloadError: null, quickDownloadQueueIds: [] as string[]} satisfies QuickDownloadFeedbackState

const QUICK_DOWNLOAD_OPEN_STATUSES = new Set<QueueItemStatus>([QUEUE_STATUS.pending, QUEUE_STATUS.running, QUEUE_STATUS.pausedHeld, QUEUE_STATUS.pausedActive])

export function resetQuickDownloadFeedback(): QuickDownloadFeedbackPatch {
	return {...QUICK_DOWNLOAD_FEEDBACK_INITIAL}
}

export function preparingQuickDownloadFeedback(): QuickDownloadFeedbackPatch {
	return {quickDownloadStatus: 'preparing', quickDownloadError: null, quickDownloadQueueIds: []}
}

export function queuedQuickDownloadFeedback(queueIds: string[]): QuickDownloadFeedbackPatch {
	return {quickDownloadStatus: 'queued', quickDownloadError: null, quickDownloadQueueIds: queueIds}
}

export function failedQuickDownloadFeedback(error: string): QuickDownloadFeedbackPatch {
	return {quickDownloadStatus: 'error', quickDownloadError: error, quickDownloadQueueIds: []}
}

export function queueIdsFromAddResult(addResultIds: string[], items: Pick<QueueItem, 'id'>[]): string[] {
	return addResultIds.length > 0 ? addResultIds : items.map(item => item.id)
}

export function reconcileQuickDownloadFeedback(state: Pick<QuickDownloadFeedbackState, 'quickDownloadStatus' | 'quickDownloadQueueIds'>, queue: QueueItem[]): QuickDownloadFeedbackPatch {
	if (state.quickDownloadStatus !== 'queued') return {}
	const trackedIds = new Set(state.quickDownloadQueueIds)
	if (trackedIds.size === 0) return resetQuickDownloadFeedback()
	const hasOpenTrackedItem = queue.some(item => trackedIds.has(item.id) && QUICK_DOWNLOAD_OPEN_STATUSES.has(item.status))
	return hasOpenTrackedItem ? {} : resetQuickDownloadFeedback()
}
