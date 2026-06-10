// Parses yt-dlp output lines into status events + progress events. Keeps the
// regex set, percent extraction, and post-process state machine isolated from
// DownloadService's orchestration code.
//
// Mutates ActiveDownload's `currentFileKind`, `subtitlePaths`, `mediaPath`,
// and `postProcEmitted` — those fields are shared lifecycle state (PhaseExecutor
// + finalize() also read them), not parser state, so they live on
// ActiveDownload rather than inside this class.

import log from 'electron-log/main.js'
import {splitStderrLines} from '@main/utils/process.js'
import {parsePercentFromLine} from '@main/utils/progress.js'
import {isSubtitleFile} from '@shared/subtitlePath.js'
import {STATUS_KEY} from '@shared/schemas.js'
import type {LocalizedError, ProgressEvent, QueueResumeContext, StatusEvent, StatusKey} from '@shared/types.js'
import type {ActiveDownload} from '../phases/types.js'
import {nowIso} from '@main/utils/clock.js'
import {QueueResumeLifecycle} from './QueueResumeLifecycle.js'

const logger = log.scope('downloads')

export type StatusEmit = (jobId: string, stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError, resumeContext?: QueueResumeContext) => void
export type ProgressEmit = (event: ProgressEvent) => void

export class ProgressParser {
	constructor(
		private readonly emitStatus: StatusEmit,
		private readonly emitProgress: ProgressEmit
	) {}

	consume(active: ActiveDownload, text: string): void {
		const jobId = active.job.id
		for (const line of splitStderrLines(text)) {
			if (line.startsWith('WARNING:') || line.startsWith('ERROR:')) {
				logger.warn(line, {jobId, source: 'yt-dlp-progress'})
			} else if (/^\[download\]\s+(?:\d+(?:\.\d+)?|Unknown)% of /.test(line)) {
				logger.debug(line, {jobId, source: 'yt-dlp-progress'})
			} else {
				logger.info(line, {jobId, source: 'yt-dlp-progress'})
			}

			const destMatch = /^\[download\] Destination:\s+(.+)$/.exec(line)
			if (destMatch) {
				const path = destMatch[1]
				const kind = isSubtitleFile(path) ? 'subtitle' : 'media'
				active.currentFileKind = kind
				if (kind === 'subtitle') {
					active.subtitlePaths.push(path)
				} else {
					QueueResumeLifecycle.rememberMediaComponent(active, path)
				}
				this.emitStatus(jobId, 'download', kind === 'subtitle' ? STATUS_KEY.fetchingSubtitles : STATUS_KEY.downloadingMedia)
				continue
			}

			const mergerMatch = /^\[Merger\] Merging formats into "([^"]+)"|^\[Merger\] Merging formats into (.+)$/.exec(line)
			if (mergerMatch) {
				active.mediaPath = mergerMatch[1] ?? mergerMatch[2]
			}

			// yt-dlp emits this when the merged file pre-exists from an earlier run
			// and skips the download entirely. No [download] Destination: or [Merger]
			// line will follow, so this is our only chance to record mediaPath.
			const alreadyMatch = /^\[download\]\s+(.+?)\s+has already been downloaded$/.exec(line)
			if (alreadyMatch && !isSubtitleFile(alreadyMatch[1])) {
				QueueResumeLifecycle.rememberMediaComponent(active, alreadyMatch[1])
				continue
			}

			// [MoveFiles] relocates files from .arroxy-temp/ to the final outputDir
			// after postprocessing. Update mediaPath only when src is the file we're
			// tracking — sidecar moves (.jpg, .description) don't touch mediaPath
			// because their src never matched.
			const moveMatch = /^\[MoveFiles\] Moving file "([^"]+)" to "([^"]+)"$/.exec(line)
			if (moveMatch && active.mediaPath === moveMatch[1]) {
				active.mediaPath = moveMatch[2]
			}

			const sleepMatch = /Sleeping (\d+(?:\.\d+)?) seconds/.exec(line)
			if (sleepMatch) {
				const seconds = Math.round(parseFloat(sleepMatch[1]))
				this.emitStatus(jobId, 'download', STATUS_KEY.sleepingBetweenRequests, {seconds})
				continue
			}

			if (line === '[SponsorBlock] Fetching SponsorBlock segments') {
				this.emitStatus(jobId, 'download', STATUS_KEY.fetchingSponsorBlock)
				continue
			}

			const sbRetryMatch = /Unable to communicate with SponsorBlock API:.+Retrying \((\d+)\/(\d+)\)/.exec(line)
			if (sbRetryMatch) {
				this.emitStatus(jobId, 'download', STATUS_KEY.retryingSponsorBlock, {attempt: Number(sbRetryMatch[1]), total: Number(sbRetryMatch[2])})
				continue
			}

			if (line.startsWith('[Merger]')) {
				this.emitStatus(jobId, 'download', STATUS_KEY.mergingFormats)
				continue
			}

			if (this.emitPostProcStatus(active, line)) continue

			const event: ProgressEvent = {jobId, line, at: nowIso(), percent: active.currentFileKind === 'subtitle' && active.input.job.kind !== 'subtitle-only' ? undefined : parsePercentFromLine(line)}
			this.emitProgress(event)
		}
	}

	// Idempotent per phase — once a postprocess phase has emitted its status
	// for a given job, subsequent matching lines (yt-dlp emits multiple) are
	// suppressed via active.postProcEmitted.
	private emitPostProcStatus(active: ActiveDownload, line: string): boolean {
		let key: 'extractingAudio' | 'convertingVideo' | 'embeddingMetadata' | 'movingFiles' | null = null
		if (line.startsWith('[ExtractAudio]')) key = 'extractingAudio'
		else if (line.startsWith('[VideoConvertor]') || line.startsWith('[VideoRemuxer]')) key = 'convertingVideo'
		else if (line.startsWith('[EmbedThumbnail]') || line.startsWith('[Metadata]') || line.startsWith('[FixupM4a]') || line.startsWith('[FixupM3u8]')) key = 'embeddingMetadata'
		else if (line.startsWith('[MoveFiles]')) key = 'movingFiles'
		if (!key) return false
		const emitted = (active.postProcEmitted ??= {})
		if (emitted[key]) return true
		QueueResumeLifecycle.markMediaPostprocessStarted(active)
		emitted[key] = true
		this.emitStatus(active.job.id, 'download', STATUS_KEY[key])
		return true
	}
}
