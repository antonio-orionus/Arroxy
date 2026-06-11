import type {ProbeError, ProbePlaylistMode, QueueItem, QuickDownloadProgressPhase, QuickDownloadStatus} from '@shared/types.js'
import {QUEUE_STATUS, type QueueItemStatus} from '@shared/schemas.js'

export type QuickDownloadFailureMessageKey = 'wizard.url.quickProbeFailed' | 'wizard.url.quickPrepareFailed' | 'wizard.url.quickBulkAllFailed'
export type QuickDownloadRetryPlaylistMode = Extract<ProbePlaylistMode, 'video' | 'playlist'>

interface QuickDownloadRetryContext {
	retryPlaylistMode?: QuickDownloadRetryPlaylistMode
}

export type QuickDownloadFailure =
	| ({kind: 'probe'; error: ProbeError} & QuickDownloadRetryContext)
	| {kind: 'bulk-probe'; error: ProbeError; urls: string[]; failedCount: number}
	| ({kind: 'prepare'; messageKey: QuickDownloadFailureMessageKey} & QuickDownloadRetryContext)
	| ({kind: 'queue' | 'exception'; message: string} & QuickDownloadRetryContext)

export interface QuickDownloadFeedbackState {
	quickDownloadStatus: QuickDownloadStatus
	quickDownloadFailure: QuickDownloadFailure | null
	quickDownloadQueueIds: string[]
	quickDownloadProgressPhase: QuickDownloadProgressPhase
	quickDownloadProgressTotal: number
	quickDownloadProgressCompleted: number
	quickDownloadProgressFailed: number
	quickDownloadProgressCurrent: string | null
	quickDownloadProgressTitle: string | null
	quickDownloadProgressRunId: number | null
}

export type QuickDownloadFeedbackPatch = Partial<QuickDownloadFeedbackState>

export const QUICK_DOWNLOAD_FEEDBACK_INITIAL = {
	quickDownloadStatus: 'idle',
	quickDownloadFailure: null,
	quickDownloadQueueIds: [] as string[],
	quickDownloadProgressPhase: 'probing',
	quickDownloadProgressTotal: 0,
	quickDownloadProgressCompleted: 0,
	quickDownloadProgressFailed: 0,
	quickDownloadProgressCurrent: null,
	quickDownloadProgressTitle: null,
	quickDownloadProgressRunId: null
} satisfies QuickDownloadFeedbackState

const QUICK_DOWNLOAD_OPEN_STATUSES = new Set<QueueItemStatus>([QUEUE_STATUS.pending, QUEUE_STATUS.running, QUEUE_STATUS.pausedHeld, QUEUE_STATUS.pausedActive])

export function resetQuickDownloadFeedback(): QuickDownloadFeedbackPatch {
	return {...QUICK_DOWNLOAD_FEEDBACK_INITIAL}
}

export function preparingQuickDownloadFeedback({current, runId, total}: {current: string | null; runId: number; total: number}): QuickDownloadFeedbackPatch {
	return {
		quickDownloadStatus: 'preparing',
		quickDownloadFailure: null,
		quickDownloadQueueIds: [],
		quickDownloadProgressPhase: 'probing',
		quickDownloadProgressTotal: total,
		quickDownloadProgressCompleted: 0,
		quickDownloadProgressFailed: 0,
		quickDownloadProgressCurrent: current,
		quickDownloadProgressTitle: null,
		quickDownloadProgressRunId: runId
	}
}

export function quickDownloadProgressPatch(patch: Partial<Pick<QuickDownloadFeedbackState, 'quickDownloadProgressPhase' | 'quickDownloadProgressTotal' | 'quickDownloadProgressCompleted' | 'quickDownloadProgressFailed' | 'quickDownloadProgressCurrent' | 'quickDownloadProgressTitle'>>): QuickDownloadFeedbackPatch {
	return patch
}

export function queuedQuickDownloadFeedback(queueIds: string[], failedCount = 0): QuickDownloadFeedbackPatch {
	return {quickDownloadStatus: 'queued', quickDownloadFailure: null, quickDownloadQueueIds: queueIds, quickDownloadProgressRunId: null, quickDownloadProgressFailed: failedCount}
}

export function failedQuickDownloadFeedback(failure: QuickDownloadFailure): QuickDownloadFeedbackPatch {
	return {quickDownloadStatus: 'error', quickDownloadFailure: failure, quickDownloadQueueIds: [], quickDownloadProgressRunId: null}
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
