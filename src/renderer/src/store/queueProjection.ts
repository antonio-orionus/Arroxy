import type {QueueItem, QueueSchedulerEventPayload, QueueSnapshotPayload} from '@shared/types.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {reconcileQuickDownloadFeedback, type QuickDownloadFeedbackState} from './wizard/quickDownloadFeedback.js'

type QueueProjectionState = Pick<
	QuickDownloadFeedbackState,
	'quickDownloadStatus' | 'quickDownloadFailure' | 'quickDownloadQueueIds' | 'quickDownloadProgressPhase' | 'quickDownloadProgressTotal' | 'quickDownloadProgressCompleted' | 'quickDownloadProgressFailed' | 'quickDownloadProgressCurrent' | 'quickDownloadProgressTitle' | 'quickDownloadProgressRunId'
> & {queue: QueueItem[]; schedulerPaused: boolean}

interface QueueProjectionBatch {
	adds: {items: QueueItem[]; atIdx: number}[]
	updates: Map<string, QueueItem>
	removes: Set<string>
}

export interface QueueProjectionResult {
	queue: QueueItem[]
	doneIncrements: number
	patch: Partial<QueueProjectionState>
}

export function projectQueueSnapshot(state: QueueProjectionState, snapshot: QueueSnapshotPayload): Partial<QueueProjectionState> {
	return {queue: snapshot.items, schedulerPaused: snapshot.schedulerPaused, ...reconcileQuickDownloadFeedback(state, snapshot.items)}
}

export function applyQueueProjectionBatch(state: QueueProjectionState, batch: QueueProjectionBatch): QueueProjectionResult {
	const updates = new Map(batch.updates)
	const removes = new Set(batch.removes)
	const adds = [...batch.adds]

	for (const id of removes) updates.delete(id)

	const prevById = new Map<string, QueueItem>()
	for (const item of state.queue) prevById.set(item.id, item)

	let doneIncrements = 0
	for (const [id, item] of updates) {
		const prev = prevById.get(id)
		if (prev && prev.status !== QUEUE_STATUS.done && item.status === QUEUE_STATUS.done) {
			doneIncrements++
		}
	}

	let next = state.queue
	if (removes.size > 0) next = next.filter(item => !removes.has(item.id))
	if (adds.length > 0) {
		next = [...next]
		for (const {items, atIdx} of adds) {
			const idx = Math.min(atIdx, next.length)
			next.splice(idx, 0, ...items)
		}
	}
	if (updates.size > 0) next = next.map(item => updates.get(item.id) ?? item)

	const quickPatch = reconcileQuickDownloadFeedback(state, next)
	const patch = next === state.queue ? quickPatch : {queue: next, ...quickPatch}
	return {queue: next, doneIncrements, patch}
}

export interface QueueProjectionBindings {
	onSnapshot(listener: (event: QueueSnapshotPayload) => void): () => void
	onAdded(listener: (event: {items: QueueItem[]; atIdx: number}) => void): () => void
	onUpdated(listener: (event: {item: QueueItem}) => void): () => void
	onRemoved(listener: (event: {itemId: string}) => void): () => void
	onScheduler(listener: (event: QueueSchedulerEventPayload) => void): () => void
}

export interface BindQueueProjectionInput<State extends QueueProjectionState> {
	events: QueueProjectionBindings
	get: () => State
	set: (patcher: (state: State) => Partial<State>) => void
	schedule: (callback: () => void) => void
	readSuccessfulDownloadCount: () => number
	onDoneIncrements: (doneIncrements: number, previousSuccessfulDownloadCount: number) => void
}

export function bindQueueProjection<State extends QueueProjectionState>({events, get, set, schedule, readSuccessfulDownloadCount, onDoneIncrements}: BindQueueProjectionInput<State>): () => void {
	let active = true
	let pendingQueueUpdates = new Map<string, QueueItem>()
	let pendingQueueAdded: {items: QueueItem[]; atIdx: number}[] = []
	let pendingQueueRemoved = new Set<string>()
	let queueFlushScheduled = false

	const scheduleFlush = (): void => {
		if (queueFlushScheduled) return
		queueFlushScheduled = true
		schedule(flushQueueUpdates)
	}

	const flushQueueUpdates = (): void => {
		queueFlushScheduled = false
		if (!active) return
		const updates = pendingQueueUpdates
		const adds = pendingQueueAdded
		const removes = pendingQueueRemoved
		if (updates.size === 0 && adds.length === 0 && removes.size === 0) return
		pendingQueueUpdates = new Map()
		pendingQueueAdded = []
		pendingQueueRemoved = new Set()
		const previousSuccessfulDownloadCount = readSuccessfulDownloadCount()
		const result = applyQueueProjectionBatch(get(), {updates, adds, removes})
		set(() => result.patch as Partial<State>)
		if (result.doneIncrements > 0) {
			onDoneIncrements(result.doneIncrements, previousSuccessfulDownloadCount)
		}
	}

	const unbindSnapshot = events.onSnapshot(snapshot => {
		if (!active) return
		set(state => projectQueueSnapshot(state, snapshot) as Partial<State>)
	})
	const unbindScheduler = events.onScheduler(({paused}) => {
		if (!active || get().schedulerPaused === paused) return
		set(() => ({schedulerPaused: paused}) as Partial<State>)
	})
	const unbindAdded = events.onAdded(evt => {
		pendingQueueAdded.push(evt)
		scheduleFlush()
	})
	const unbindUpdated = events.onUpdated(({item}) => {
		pendingQueueUpdates.set(item.id, item)
		scheduleFlush()
	})
	const unbindRemoved = events.onRemoved(({itemId}) => {
		pendingQueueRemoved.add(itemId)
		scheduleFlush()
	})

	return () => {
		active = false
		unbindSnapshot()
		unbindAdded()
		unbindUpdated()
		unbindRemoved()
		unbindScheduler()
	}
}
