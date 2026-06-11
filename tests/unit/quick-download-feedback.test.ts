import {describe, expect, it} from 'vitest'
import {failedQuickDownloadFeedback, preparingQuickDownloadFeedback, queuedQuickDownloadFeedback, QUICK_DOWNLOAD_FEEDBACK_INITIAL, queueIdsFromAddResult, reconcileQuickDownloadFeedback, resetQuickDownloadFeedback} from '@renderer/store/wizard/quickDownloadFeedback.js'
import {makeItem} from '../shared/fixtures.js'

describe('QuickDownloadFeedback', () => {
	it('builds lifecycle patches from a small interface', () => {
		expect(resetQuickDownloadFeedback()).toEqual(QUICK_DOWNLOAD_FEEDBACK_INITIAL)
		expect(preparingQuickDownloadFeedback({current: 'https://youtube.com/watch?v=q1', runId: 7, total: 2})).toEqual({...QUICK_DOWNLOAD_FEEDBACK_INITIAL, quickDownloadStatus: 'preparing', quickDownloadProgressCurrent: 'https://youtube.com/watch?v=q1', quickDownloadProgressRunId: 7, quickDownloadProgressTotal: 2})
		expect(queuedQuickDownloadFeedback(['q1'])).toEqual({quickDownloadStatus: 'queued', quickDownloadFailure: null, quickDownloadQueueIds: ['q1'], quickDownloadProgressRunId: null, quickDownloadProgressFailed: 0})
		expect(failedQuickDownloadFeedback({kind: 'probe', error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'sign in'}}})).toEqual({
			quickDownloadStatus: 'error',
			quickDownloadFailure: {kind: 'probe', error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'sign in'}}},
			quickDownloadQueueIds: [],
			quickDownloadProgressRunId: null
		})
		expect(failedQuickDownloadFeedback({kind: 'bulk-probe', error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'sign in'}}, urls: ['https://youtu.be/one', 'https://youtu.be/two'], failedCount: 2})).toEqual({
			quickDownloadStatus: 'error',
			quickDownloadFailure: {kind: 'bulk-probe', error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'sign in'}}, urls: ['https://youtu.be/one', 'https://youtu.be/two'], failedCount: 2},
			quickDownloadQueueIds: [],
			quickDownloadProgressRunId: null
		})
	})

	it('uses QueueService returned ids before falling back to renderer-built item ids', () => {
		expect(queueIdsFromAddResult(['main-id'], [{id: 'renderer-id'}])).toEqual(['main-id'])
		expect(queueIdsFromAddResult([], [{id: 'renderer-id'}])).toEqual(['renderer-id'])
	})

	it('keeps queued feedback while at least one tracked Queue item is still open', () => {
		const patch = reconcileQuickDownloadFeedback({quickDownloadStatus: 'queued', quickDownloadQueueIds: ['q1', 'q2']}, [makeItem({id: 'q1', status: 'done'}), makeItem({id: 'q2', status: 'paused-active'})])

		expect(patch).toEqual({})
	})

	it('clears queued feedback after every tracked Queue item is terminal or gone', () => {
		const patch = reconcileQuickDownloadFeedback({quickDownloadStatus: 'queued', quickDownloadQueueIds: ['q1', 'missing']}, [makeItem({id: 'q1', status: 'done'}), makeItem({id: 'other', status: 'running'})])

		expect(patch).toEqual(QUICK_DOWNLOAD_FEEDBACK_INITIAL)
	})

	it('ignores non-queued feedback', () => {
		expect(reconcileQuickDownloadFeedback({quickDownloadStatus: 'error', quickDownloadQueueIds: ['q1']}, [makeItem({id: 'q1', status: 'done'})])).toEqual({})
	})
})
