import {describe, expect, it, vi} from 'vite-plus/test'
import {applyQueueProjectionBatch, bindQueueProjection, projectQueueSnapshot, type QueueProjectionBindings} from '@renderer/store/queueProjection.js'
import {QUICK_DOWNLOAD_FEEDBACK_INITIAL, resetQuickDownloadFeedback, type QuickDownloadFeedbackState} from '@renderer/store/wizard/quickDownloadFeedback.js'
import type {QueueItem, QueueSchedulerEventPayload, QueueSnapshotPayload} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

function state(queue: QueueItem[] = []): QuickDownloadFeedbackState & {queue: QueueItem[]; schedulerPaused: boolean} {
	return {queue, schedulerPaused: false, ...QUICK_DOWNLOAD_FEEDBACK_INITIAL}
}

describe('QueueProjection', () => {
	it('projects snapshots and reconciles quick-download feedback', () => {
		const patch = projectQueueSnapshot({...state(), quickDownloadStatus: 'queued', quickDownloadQueueIds: ['q1']}, {items: [makeItem({id: 'q1', status: 'done'})], schedulerPaused: false})

		expect(patch).toEqual({queue: [expect.objectContaining({id: 'q1', status: 'done'})], schedulerPaused: false, ...resetQuickDownloadFeedback()})
	})

	it('projects the scheduler-paused flag into state', () => {
		const patch = projectQueueSnapshot(state(), {items: [makeItem({id: 'q1', status: 'pending'})], schedulerPaused: true})

		expect(patch.schedulerPaused).toBe(true)
		expect(patch.queue).toHaveLength(1)
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
		const listeners: Partial<{snapshot: (event: QueueSnapshotPayload) => void; added: (event: {items: QueueItem[]; atIdx: number}) => void; updated: (event: {item: QueueItem}) => void; removed: (event: {itemId: string}) => void; scheduler: (event: QueueSchedulerEventPayload) => void}> = {}
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
			},
			onScheduler: listener => {
				listeners.scheduler = listener
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

	// Auto-remove takes a finished row out five seconds after it completes; a
	// hidden window holds the flush back longer than that, so the done update and
	// the removal reach one batch and the removal discards the update.
	it('still counts a download that finished and was removed before the batch flushed', () => {
		const listeners: Partial<{updated: (event: {item: QueueItem}) => void; removed: (event: {itemId: string}) => void}> = {}
		const events: QueueProjectionBindings = {
			onSnapshot: () => vi.fn(),
			onAdded: () => vi.fn(),
			onUpdated: listener => {
				listeners.updated = listener
				return vi.fn()
			},
			onRemoved: listener => {
				listeners.removed = listener
				return vi.fn()
			},
			onScheduler: () => vi.fn()
		}
		let current = {...state([makeItem({id: 'q1', status: 'running'}), makeItem({id: 'q2', status: 'done'})]), settings: {common: {successfulDownloadCount: 2}}}
		const scheduled: (() => void)[] = []
		const onDoneIncrements = vi.fn()

		bindQueueProjection({events, get: () => current, set: patcher => (current = {...current, ...patcher(current)}), schedule: callback => scheduled.push(callback), readSuccessfulDownloadCount: () => current.settings.common.successfulDownloadCount, onDoneIncrements})

		listeners.updated?.({item: {...current.queue[0], status: 'done', progressPercent: 100}})
		listeners.removed?.({itemId: 'q1'})
		// A row that was already done when it left is not a new success.
		listeners.removed?.({itemId: 'q2'})
		scheduled[0]()

		expect(current.queue).toHaveLength(0)
		expect(onDoneIncrements).toHaveBeenCalledOnce()
		expect(onDoneIncrements).toHaveBeenCalledWith(1, 2)
	})

	it('binds scheduler events to the schedulerPaused state field', () => {
		const listeners: Partial<{scheduler: (event: QueueSchedulerEventPayload) => void}> = {}
		const events: QueueProjectionBindings = {
			onSnapshot: () => vi.fn(),
			onAdded: () => vi.fn(),
			onUpdated: () => vi.fn(),
			onRemoved: () => vi.fn(),
			onScheduler: listener => {
				listeners.scheduler = listener
				return vi.fn()
			}
		}
		let current = {...state([makeItem({id: 'q1', status: 'pending'})]), settings: {common: {successfulDownloadCount: 0}}}

		bindQueueProjection({
			events,
			get: () => current,
			set: patcher => {
				current = {...current, ...patcher(current)}
			},
			schedule: callback => callback(),
			readSuccessfulDownloadCount: () => current.settings.common.successfulDownloadCount,
			onDoneIncrements: vi.fn()
		})

		listeners.scheduler?.({paused: true})
		expect(current.schedulerPaused).toBe(true)

		listeners.scheduler?.({paused: false})
		expect(current.schedulerPaused).toBe(false)
	})

	// A placeholder swap re-adds the row under the same id; with the window
	// hidden (background throttling) its first progress lands in the same batch.
	it('keeps an update for a row removed and re-added in the same batch', () => {
		const placeholder = makeItem({id: 'x', status: 'probing', job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'video'})
		const swapped = makeItem({id: 'x', status: 'pending'})

		const result = applyQueueProjectionBatch(state([placeholder]), {removes: new Set(['x']), adds: [{items: [swapped], atIdx: 0}], updates: new Map([['x', {...swapped, status: 'done', progressPercent: 100}]])})

		expect(result.queue.map(item => [item.id, item.status])).toEqual([['x', 'done']])
	})

	it('still drops an update for a row removed for good', () => {
		const q1 = makeItem({id: 'q1', status: 'pending'})
		const result = applyQueueProjectionBatch(state([q1]), {removes: new Set(['q1']), adds: [], updates: new Map([['q1', {...q1, status: 'running'}]])})
		expect(result.queue).toEqual([])
	})

	it('orders removed, added, then updated events of one id within a flush', () => {
		const listeners: Partial<{added: (event: {items: QueueItem[]; atIdx: number}) => void; updated: (event: {item: QueueItem}) => void; removed: (event: {itemId: string}) => void}> = {}
		const events: QueueProjectionBindings = {
			onSnapshot: () => vi.fn(),
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
			},
			onScheduler: () => vi.fn()
		}
		const placeholder = makeItem({id: 'x', status: 'probing', job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'video'})
		let current = {...state([placeholder]), settings: {common: {successfulDownloadCount: 0}}}
		const scheduled: (() => void)[] = []
		bindQueueProjection({events, get: () => current, set: patcher => (current = {...current, ...patcher(current)}), schedule: callback => scheduled.push(callback), readSuccessfulDownloadCount: () => 0, onDoneIncrements: vi.fn()})

		// A stale update before the swap must not outlive it.
		listeners.updated?.({item: {...placeholder, title: 'stale'}})
		listeners.removed?.({itemId: 'x'})
		const swapped = makeItem({id: 'x', status: 'pending', title: 'Swapped'})
		listeners.added?.({items: [swapped], atIdx: 0})
		listeners.updated?.({item: {...swapped, status: 'running', progressPercent: 40}})
		for (const flush of scheduled) flush()

		expect(current.queue.map(item => [item.id, item.status, item.title, item.progressPercent])).toEqual([['x', 'running', 'Swapped', 40]])
	})

	it('drops a row added and removed within one flush', () => {
		const listeners: Partial<{added: (event: {items: QueueItem[]; atIdx: number}) => void; removed: (event: {itemId: string}) => void}> = {}
		const events: QueueProjectionBindings = {
			onSnapshot: () => vi.fn(),
			onAdded: listener => {
				listeners.added = listener
				return vi.fn()
			},
			onUpdated: () => vi.fn(),
			onRemoved: listener => {
				listeners.removed = listener
				return vi.fn()
			},
			onScheduler: () => vi.fn()
		}
		let current = {...state([]), settings: {common: {successfulDownloadCount: 0}}}
		const scheduled: (() => void)[] = []
		bindQueueProjection({events, get: () => current, set: patcher => (current = {...current, ...patcher(current)}), schedule: callback => scheduled.push(callback), readSuccessfulDownloadCount: () => 0, onDoneIncrements: vi.fn()})

		listeners.added?.({items: [makeItem({id: 'gone', status: 'probing', job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'video'})], atIdx: 0})
		listeners.removed?.({itemId: 'gone'})
		for (const flush of scheduled) flush()

		expect(current.queue).toEqual([])
	})
})
