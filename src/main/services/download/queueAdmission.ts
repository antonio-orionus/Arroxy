// What may enter the queue at all.
//
// The queue boundary is the last place a job's URL is ever examined: past it
// nothing re-classifies the URL, and `--no-playlist` only looks like a guard —
// yt-dlp defines it as "download only the video, if the URL refers to a video
// *and* a playlist", so on a bare collection URL it is inert and the whole set
// downloads under the one filename the item carries.
//
// Every producer funnels through QueueService.add(), which makes this the one
// check that cannot be routed around by a new UI path.

import log from 'electron-log/main.js'
import type {QueueItem} from '@shared/types.js'
import {isCollectionUrl} from '@shared/urlIntent.js'
import {findLiveQueueDuplicate} from '@shared/queueActions.js'

const logger = log.scope('queue')

export interface QueueAdmissionRejection {
	item: QueueItem
	message: string
}

/**
 * First item in the batch that must not be queued, or null if all may enter.
 *
 * Returns the offender rather than a filtered list on purpose: dropping items
 * would report a successful add that quietly lost rows, which is the same class
 * of silent failure this guard exists to end.
 */
export function findInadmissibleQueueItem(items: readonly QueueItem[]): QueueAdmissionRejection | null {
	const item = items.find(candidate => isCollectionUrl(candidate.url))
	if (!item) return null
	const message = `queue item ${item.id} URL addresses a collection, not a single video: ${item.url}`
	logger.error('Queue add rejected', {itemId: item.id, url: item.url, batchSize: items.length, reason: message})
	return {item, message}
}

export function findLiveDuplicate(items: readonly QueueItem[], existing: readonly QueueItem[]): QueueAdmissionRejection | null {
	const item = findLiveQueueDuplicate(items, existing)
	if (!item) return null
	const message = `queue item URL is already active: ${item.url}`
	logger.info('Queue add rejected as duplicate', {itemId: item.id, url: item.url})
	return {item, message}
}
