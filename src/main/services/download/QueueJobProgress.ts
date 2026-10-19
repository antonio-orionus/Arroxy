// Turns a running job's raw yt-dlp progress lines into the queue item's
// progress fields. Owns one formatter and one normalizer per job, so throttle,
// spike suppression and yt-dlp's percent quirks carry across consecutive
// lines without reaching the queue state machine.

import {STATUS_KEY, type StatusKey} from '@shared/schemas.js'
import {ProgressFormatter} from '@shared/progressFormat.js'
import {ProgressNormalizer} from '@shared/progressNormalizer.js'
import type {ProgressEvent, QueueItem} from '@shared/types.js'

// Post-download phase keys. yt-dlp can emit a straggler `[download] X%`
// line AFTER the Merger/Metadata/MoveFiles status events due to stdout
// buffering. Without this gate, the late progress event would re-populate
// `progressDetail` and the UI would flip from "Merging formats…" back to
// "downloading at X MB/s" — visible regression on every fast job.
const POST_DOWNLOAD_PHASES: ReadonlySet<StatusKey> = new Set([STATUS_KEY.mergingFormats, STATUS_KEY.extractingAudio, STATUS_KEY.convertingVideo, STATUS_KEY.embeddingMetadata, STATUS_KEY.movingFiles])

export interface QueueJobProgressUpdate {
	percent: number
	detail?: string
}

export class QueueJobProgress {
	private readonly formatters = new Map<string, ProgressFormatter>()
	private readonly normalizers = new Map<string, ProgressNormalizer>()

	// null: the line arrived after the item entered a post-download phase and
	// must be dropped.
	read(item: QueueItem, event: ProgressEvent): QueueJobProgressUpdate | null {
		const lastKey = item.lastStatus?.key
		if (lastKey && POST_DOWNLOAD_PHASES.has(lastKey)) return null
		let formatter = this.formatters.get(event.jobId)
		if (!formatter) {
			formatter = new ProgressFormatter()
			this.formatters.set(event.jobId, formatter)
		}
		let normalizer = this.normalizers.get(event.jobId)
		if (!normalizer) {
			normalizer = new ProgressNormalizer()
			this.normalizers.set(event.jobId, normalizer)
		}
		const detail = formatter.update(event.line)
		return {percent: normalizer.nextRunningPercent(item.progressPercent, event), ...(detail !== null ? {detail} : {})}
	}

	forget(jobId: string): void {
		this.formatters.delete(jobId)
		this.normalizers.delete(jobId)
	}
}
