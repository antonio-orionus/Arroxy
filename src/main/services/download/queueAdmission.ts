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
import {admitAgainstLive} from '@shared/queueActions.js'
import {fail, ok, type Result} from '@shared/result.js'
import {createAppError} from '@main/utils/errorFactory.js'

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
	// A quick download's placeholder row may hold a collection link: its job is
	// unresolved, which DownloadService refuses to run, and its probe swaps it
	// for per-video rows that pass through this check again.
	const item = items.find(candidate => candidate.job.kind !== 'unresolved' && isCollectionUrl(candidate.url))
	if (!item) return null
	const message = `queue item ${item.id} URL addresses a collection, not a single video: ${item.url}`
	logger.error('Queue add rejected', {itemId: item.id, url: item.url, batchSize: items.length, reason: message})
	return {item, message}
}

// The queue's duplicate rule (see admitAgainstLive), with main's refusal and
// log lines. Every producer's batch goes through it: add and the probe swap.
export function admitAgainstLiveQueue(items: readonly QueueItem[], existing: readonly QueueItem[]): Result<{admitted: QueueItem[]; skippedAlreadyQueued: number}> {
	const admission = admitAgainstLive(items, existing)
	if (!admission.ok) {
		logger.info('Queue add rejected as duplicate', {itemId: admission.duplicate.id, url: admission.duplicate.url})
		return fail(createAppError('conflict', `queue item URL is already active: ${admission.duplicate.url}`))
	}
	if (admission.skippedAlreadyQueued > 0) logger.info('Queue add skipped rows already live', {skipped: admission.skippedAlreadyQueued, admitted: admission.admitted.length})
	return ok({admitted: admission.admitted, skippedAlreadyQueued: admission.skippedAlreadyQueued})
}
