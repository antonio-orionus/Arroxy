import {QUEUE_STATUS} from '@shared/schemas.js'
import type {QueueItem} from '@shared/types.js'

// A quick download whose probe failed: the row has no job yet, so its Retry
// probes again rather than restarting a download.
export function isProbeErrorRow(item: QueueItem): boolean {
	return item.status === QUEUE_STATUS.error && item.job.kind === 'unresolved'
}

// A download that failed after its preparation: its Retry downloads again.
export function isDownloadErrorRow(item: QueueItem): boolean {
	return item.status === QUEUE_STATUS.error && item.job.kind !== 'unresolved'
}

// The rows only the user can move on: a failed preparation, or an open choice.
// The Downloads tab badge counts them.
export function needsAttention(item: QueueItem): boolean {
	return item.status === QUEUE_STATUS.needsChoice || isProbeErrorRow(item)
}
