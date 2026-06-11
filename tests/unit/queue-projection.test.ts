import {describe, expect, it, vi} from 'vitest'
import {applyQueueProjectionBatch, bindQueueProjection, projectQueueSnapshot, type QueueProjectionBindings} from '@renderer/store/queueProjection.js'
import {QUICK_DOWNLOAD_FEEDBACK_INITIAL, resetQuickDownloadFeedback, type QuickDownloadFeedbackState} from '@renderer/store/wizard/quickDownloadFeedback.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

function state(queue: QueueItem[] = []): QuickDownloadFeedbackState & {queue: QueueItem[]} {
	return {queue, ...QUICK_DOWNLOAD_FEEDBACK_INITIAL}
}

describe('QueueProjection', () => {
	it('projects snapshots and reconciles quick-download feedback', () => {
		const patch = projectQueueSnapshot({...state(), quickDownloadStatus: 'queued', quickDownloadQueueIds: ['q1']}, [makeItem({id: 'q1', status: 'done'})])

		expect(patch).toEqual({queue: [expect.objectContaining({id: 'q1', status: 'done'})], ...resetQuickDownloadFeedback()})
	})

	it('applies remove, add, then update in a single batch and counts completed transitions', () => {
		const q1 = makeItem({id: 'q1', status: 'running'})
		const q2 = makeItem({id: 'q2', status: 'pending'})
		const q3 = makeItem({id: 'q3', status: 'pending'})

		const result = applyQueueProjectionBatch({...state([q1, q2]), quickDownloadStatus: 'queued', quickDownloadQueueIds: ['q1']}, {removes: new Set(['q2']), adds: [{items: [q3], atIdx: 9}], updates: new Map([['q1', {...q1, status: 'done', progressPercent: 100}]])})

		expect(result.doneIncrements).toBe(1)
		expect(result.queue.map(item => [item.id, item.status])).toEqual([
			['q1', 'done'],
			['q3', 'pending']
		])
		expect(result.patch).toMatchObject({queue: result.queue, quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadQueueIds: []})
	})

	it('binds queue events through the scheduler and reports done increments with the previous milestone count', () => {
		const listeners: Partial<{snapshot: (items: QueueItem[]) => void; added: (event: {items: QueueItem[]; atIdx: number}) => void; updated: (event: {item: QueueItem}) => void; removed: (event: {itemId: string}) => void}> = {}
		const events: QueueProjectionBindings = {
			onSnapshot: listener => {
				listeners.snapshot = listener
				return vi.fn()
			},
			onAdded: listener => {
				listeners.added = listener
				return vi.fn()
			},
			onUpdated: listener => {
				listeners.updated = listener
				return vi.fn()
			},
			onRemoved: listener => {
				listeners.removed = listener
				return vi.fn()
			}
		}
		let current = {...state([makeItem({id: 'q1', status: 'running'})]), settings: {common: {successfulDownloadCount: 2}}}
		const scheduled: (() => void)[] = []
		const onDoneIncrements = vi.fn()

		bindQueueProjection({
			events,
			get: () => current,
			set: patcher => {
				current = {...current, ...patcher(current)}
			},
			schedule: callback => scheduled.push(callback),
			readSuccessfulDownloadCount: () => current.settings.common.successfulDownloadCount,
			onDoneIncrements
		})

		listeners.updated?.({item: {...current.queue[0], status: 'done', progressPercent: 100}})
		expect(scheduled).toHaveLength(1)
		scheduled[0]()

		expect(current.queue[0].status).toBe('done')
		expect(onDoneIncrements).toHaveBeenCalledWith(1, 2)
	})
})
