import {isHighValueDownload} from '@shared/queueItem.js'
import type {QueueItem} from '@shared/types.js'

const TALL_ROW_CONTENT = 76
const SHORT_ROW_CONTENT = 48
export const QUEUE_ROW_GAP = 6
export const QUEUE_ROW_OVERSCAN = 5
const TALL_ROW_STRIDE = TALL_ROW_CONTENT + QUEUE_ROW_GAP
const SHORT_ROW_STRIDE = SHORT_ROW_CONTENT + QUEUE_ROW_GAP

export interface QueueDrawerViewOptions {
	shareHighValueBannerDismissed: boolean
}

export interface QueueDrawerView {
	activeCount: number
	aggregatePercent: number
	hasCompleted: boolean
	hasDownloading: boolean
	hasHighValueCompletion: boolean
	hasInFlight: boolean
	hasPaused: boolean
	headerProgress: number
	orderedQueue: QueueItem[]
	running: QueueItem[]
	showShareBanner: boolean
	totalCount: number
}

export function rowStride(item: QueueItem): number {
	const status = item.status
	if (status === 'running' || status === 'paused-active') return TALL_ROW_STRIDE
	if (status === 'error') return TALL_ROW_STRIDE
	if (status === 'done' && item.lastStatus?.key === 'subtitlesFailed') return TALL_ROW_STRIDE
	return SHORT_ROW_STRIDE
}

export function buildQueueDrawerView(queue: QueueItem[], options: QueueDrawerViewOptions): QueueDrawerView {
	const active: QueueItem[] = []
	const done: QueueItem[] = []
	const running: QueueItem[] = []
	let hasCompleted = false
	let hasPaused = false
	let hasInFlight = false
	let hasHighValueCompletion = false
	let progressSum = 0

	for (const item of queue) {
		const status = item.status
		const finished = status === 'done' || status === 'cancelled'
		if (finished) done.push(item)
		else active.push(item)
		if (status === 'running') {
			running.push(item)
			progressSum += item.progressPercent
		}
		if (status === 'done' || status === 'cancelled' || status === 'error') hasCompleted = true
		if (status === 'paused-active' || status === 'paused-held') hasPaused = true
		if (status === 'running' || status === 'paused-active' || status === 'paused-held' || status === 'pending') hasInFlight = true
		if (status === 'done' && isHighValueDownload(item)) hasHighValueCompletion = true
	}

	const activeCount = running.length
	const aggregatePercent = activeCount === 0 ? 0 : progressSum / activeCount
	const headerProgress = activeCount === 1 ? (running[0]?.progressPercent ?? 0) : aggregatePercent

	return {activeCount, aggregatePercent, hasCompleted, hasDownloading: activeCount > 0, hasHighValueCompletion, hasInFlight, hasPaused, headerProgress, orderedQueue: active.concat(done), running, showShareBanner: hasHighValueCompletion && !options.shareHighValueBannerDismissed, totalCount: queue.length}
}
