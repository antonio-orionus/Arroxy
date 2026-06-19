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
import {isSubtitleFile} from '@shared/subtitlePath.js'
import {STATUS_KEY} from '@shared/schemas.js'
import type {LocalizedError, ProgressEvent, QueueArtifactEvent, QueueResumeContext, StatusEvent, StatusKey} from '@shared/types.js'
import {artifactKindForPath} from '@shared/queueArtifacts.js'
import type {ActiveDownload} from '../phases/types.js'
import {nowIso} from '@main/utils/clock.js'
import {QueueResumeLifecycle} from './QueueResumeLifecycle.js'
import {parseYtDlpOutputLine, type YtDlpPostprocessPhase} from 'yt-dlp-bridge/parsers'

const logger = log.scope('downloads')

export type StatusEmit = (jobId: string, stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError, resumeContext?: QueueResumeContext) => void
export type ProgressEmit = (event: ProgressEvent) => void
export type ArtifactEmit = (event: QueueArtifactEvent) => void

function rememberSubtitlePath(active: ActiveDownload, path: string): void {
	if (!active.subtitlePaths.includes(path)) active.subtitlePaths.push(path)
}

function replacePath(paths: string[] | undefined, from: string, to: string): string[] | undefined {
	if (!paths?.includes(from)) return paths
	return paths.map(path => (path === from ? to : path))
}

export class ProgressParser {
	constructor(
		private readonly emitStatus: StatusEmit,
		private readonly emitProgress: ProgressEmit,
		private readonly emitArtifact?: ArtifactEmit
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

			const event = parseYtDlpOutputLine(line)
			if (!event) continue

			if (event.kind === 'destination') {
				const path = event.path
				const kind = isSubtitleFile(path) ? 'subtitle' : 'media'
				active.currentFileKind = kind
				if (kind === 'subtitle') {
					rememberSubtitlePath(active, path)
				} else {
					QueueResumeLifecycle.rememberMediaComponent(active, path)
				}
				this.emitStatus(jobId, 'download', kind === 'subtitle' ? STATUS_KEY.fetchingSubtitles : STATUS_KEY.downloadingMedia)
				continue
			}

			if (event.kind === 'merge') {
				if (event.path) active.mediaPath = event.path
				this.emitStatus(jobId, 'download', STATUS_KEY.mergingFormats)
				continue
			}

			if (event.kind === 'already-downloaded') {
				if (isSubtitleFile(event.path)) rememberSubtitlePath(active, event.path)
				else QueueResumeLifecycle.rememberMediaComponent(active, event.path)
				continue
			}

			if (event.kind === 'move') {
				if (active.mediaPath === event.from) active.mediaPath = event.to
				active.mediaComponentPaths = replacePath(active.mediaComponentPaths, event.from, event.to)
				active.subtitlePaths = replacePath(active.subtitlePaths, event.from, event.to) ?? active.subtitlePaths
				this.emitArtifact?.({jobId, path: event.to, kind: artifactKindForPath(event.to), fromPath: event.from, at: nowIso()})
				this.emitPostProcStatus(active, 'movingFiles')
				continue
			}

			if (event.kind === 'artifact') {
				this.emitArtifact?.({jobId, path: event.path, kind: artifactKindForPath(event.path), at: nowIso(), ...(active.input.probeInfoJsonPath === event.path ? {internal: true} : {})})
				continue
			}

			if (event.kind === 'sleep') {
				this.emitStatus(jobId, 'download', STATUS_KEY.sleepingBetweenRequests, {seconds: event.seconds})
				continue
			}

			if (event.kind === 'sponsorblock-fetch') {
				this.emitStatus(jobId, 'download', STATUS_KEY.fetchingSponsorBlock)
				continue
			}

			if (event.kind === 'sponsorblock-retry') {
				this.emitStatus(jobId, 'download', STATUS_KEY.retryingSponsorBlock, {attempt: event.attempt, total: event.total})
				continue
			}

			if (event.kind === 'postprocess') {
				if (event.path) active.mediaPath = event.path
				this.emitPostProcStatus(active, event.phase)
				continue
			}

			this.emitProgress({jobId, line: event.raw, at: nowIso(), percent: active.currentFileKind === 'subtitle' && active.input.job.kind !== 'subtitle-only' ? undefined : event.percent})
		}
	}

	// Idempotent per phase — once a postprocess phase has emitted its status
	// for a given job, subsequent matching lines (yt-dlp emits multiple) are
	// suppressed via active.postProcEmitted.
	private emitPostProcStatus(active: ActiveDownload, key: YtDlpPostprocessPhase): void {
		const emitted = (active.postProcEmitted ??= {})
		if (emitted[key]) return
		QueueResumeLifecycle.markMediaPostprocessStarted(active)
		emitted[key] = true
		this.emitStatus(active.job.id, 'download', STATUS_KEY[key])
	}
}
