// Turns a running job's progress events into the queue item's progress fields.
// Owns one formatter per job, so throttle and spike suppression carry across
// consecutive events without reaching the queue state machine.

import {STATUS_KEY, type StatusKey} from '@shared/schemas.js'
import {ProgressFormatter} from '@shared/progressFormat.js'
import {ffmpegPartPercent, nextRunningPercent} from '@shared/progressNormalizer.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {ProgressEvent, QueueItem} from '@shared/types.js'

// Post-download phase keys. yt-dlp can emit a straggler progress
// line AFTER the Merger/Metadata/MoveFiles status events due to stdout
// buffering. Without this gate, the late progress event would re-populate
// `progressDetail` and the UI would flip from "Merging formats…" back to
// "downloading at X MB/s" — visible regression on every fast job.
const POST_DOWNLOAD_PHASES: ReadonlySet<StatusKey> = new Set([STATUS_KEY.mergingFormats, STATUS_KEY.extractingAudio, STATUS_KEY.convertingVideo, STATUS_KEY.embeddingMetadata, STATUS_KEY.movingFiles])

function partSeconds(job: PreparedJob): number | null {
	if (job.kind !== 'single-format' && job.kind !== 'audio-convert') return null
	return job.videoPart ? job.videoPart.endSeconds - job.videoPart.startSeconds : null
}

export interface QueueJobProgressUpdate {
	percent: number
	detail?: string
}

export class QueueJobProgress {
	private readonly formatters = new Map<string, ProgressFormatter>()

	// null: the line arrived after the item entered a post-download phase and
	// must be dropped.
	read(item: QueueItem, event: ProgressEvent): QueueJobProgressUpdate | null {
		const lastKey = item.lastStatus?.key
		if (lastKey && POST_DOWNLOAD_PHASES.has(lastKey)) return null
		const seconds = partSeconds(item.job)
		let formatter = this.formatters.get(event.jobId)
		if (!formatter) {
			formatter = new ProgressFormatter(seconds)
			this.formatters.set(event.jobId, formatter)
		}
		const detail = formatter.update(event)
		const incoming = event.percent === undefined && seconds !== null ? ffmpegPartPercent(event.line, seconds) : event.percent
		return {percent: nextRunningPercent(item.progressPercent, incoming), ...(detail !== null ? {detail} : {})}
	}

	forget(jobId: string): void {
		this.formatters.delete(jobId)
	}
}
