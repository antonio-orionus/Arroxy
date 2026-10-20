// Parses yt-dlp output lines into status events + progress events. Keeps the
// regex set, percent extraction, and post-process state machine isolated from
// DownloadService's orchestration code.
//
// Mutates ActiveDownload's `currentFileKind`, `subtitlePaths`, `mediaPath`,
// and `postProcEmitted` — those fields are shared lifecycle state (PhaseExecutor
// + finalize() also read them), not parser state, so they live on
// ActiveDownload rather than inside this class.

import {isAbsolute, resolve} from 'node:path'
import log from 'electron-log/main.js'
import {isSubtitleFile} from '@shared/subtitlePath.js'
import {STATUS_KEY} from '@shared/schemas.js'
import type {LocalizedError, ProgressEvent, QueueArtifactEvent, QueueResumeContext, StatusEvent, StatusKey} from '@shared/types.js'
import {artifactKindForPath} from '@shared/queueArtifacts.js'
import type {ActiveDownload} from '../phases/types.js'
import {nowIso} from '@main/utils/clock.js'
import {QueueResumeLifecycle} from './QueueResumeLifecycle.js'
import {parseYtDlpOutputLine, YtDlpDownloadProgressTracker, type YtDlpOutputEvent, type YtDlpPostprocessPhase} from 'yt-dlp-bridge/parsers'
import {splitOutputLines} from 'yt-dlp-bridge/runner'

const logger = log.scope('downloads')

export type StatusEmit = (jobId: string, stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError, resumeContext?: QueueResumeContext) => void
export type ProgressEmit = (event: ProgressEvent) => void
export type ArtifactEmit = (event: QueueArtifactEvent) => void

// Stands in for a percent yt-dlp cannot report, so such a file is logged once.
const UNKNOWN_PROGRESS_STEP = -1

// yt-dlp redraws its progress line several times a second, and logging every
// redraw pushed the lines that explain a failure out of a rotated log. Keep the
// first line of each 10% step (100% is its own step) for the current file.
function takeProgressLogStep(active: ActiveDownload, percent: number | undefined): boolean {
	const step = percent === undefined ? UNKNOWN_PROGRESS_STEP : Math.floor(Math.min(percent, 100) / 10)
	if (step === active.lastLoggedProgressStep) return false
	active.lastLoggedProgressStep = step
	return true
}

// A Part of video download is ffmpeg's, which redraws `frame=… size=… time=…`
// twice a second. Start-up is where most failures show, so every line of the
// first 30 s of its `elapsed=` is kept, then the first of each 10 s. The final
// summary reads `Lsize=`, so it is not a status line and is always logged.
const FFMPEG_STATUS_LINE = /^(?:frame=\s*\d+\s.*?)?\bsize=.*\btime=/
const FFMPEG_ELAPSED = /\belapsed=(\d+):(\d{2}):(\d{2}(?:\.\d+)?)/
const FFMPEG_LOG_ALL_SECONDS = 30
const FFMPEG_LOG_STEP_SECONDS = 10

function takeFfmpegLogStep(active: ActiveDownload, line: string): boolean {
	const elapsed = FFMPEG_ELAPSED.exec(line)
	const seconds = elapsed ? Number(elapsed[1]) * 3600 + Number(elapsed[2]) * 60 + Number(elapsed[3]) : null
	const step = seconds === null ? UNKNOWN_PROGRESS_STEP : Math.floor(seconds / FFMPEG_LOG_STEP_SECONDS)
	const isNewStep = step !== active.lastLoggedFfmpegStep
	active.lastLoggedFfmpegStep = step
	return isNewStep || (seconds !== null && seconds < FFMPEG_LOG_ALL_SECONDS)
}

// ffmpeg opens every HLS segment with a line carrying the full signed URL (the
// user's IP and signature included). The time between opens is what shows a
// slow stream, so each is kept as its segment number and host only.
const FFMPEG_SEGMENT_OPEN = /^(\[[\w#/]+ @ 0x[0-9a-f]+\]) Opening '(.*)' for reading$/
const SEGMENT_NUMBER = /[/?&](?:go)?sq[/=](\d+)/

function shortSegmentOpen(line: string): string | null {
	const match = FFMPEG_SEGMENT_OPEN.exec(line)
	if (!match) return null
	const [, source, url] = match
	let host: string
	try {
		host = new URL(url ?? '').host
	} catch {
		host = 'an unparsable URL'
	}
	const segment = SEGMENT_NUMBER.exec(url ?? '')?.[1]
	return `${source} Opening ${segment === undefined ? '' : `segment ${segment} on `}${host}`
}

function logOutputLine(active: ActiveDownload, line: string, event: YtDlpOutputEvent | null, percent: number | undefined): void {
	const meta = {jobId: active.job.id, source: 'yt-dlp-progress'}
	if (line.startsWith('WARNING:') || line.startsWith('ERROR:')) {
		logger.warn(line, meta)
	} else if (event?.kind === 'download-progress') {
		if (takeProgressLogStep(active, percent)) logger.debug(line, meta)
	} else if (FFMPEG_STATUS_LINE.test(line)) {
		if (takeFfmpegLogStep(active, line)) logger.debug(line, meta)
	} else {
		const segmentOpen = shortSegmentOpen(line)
		if (segmentOpen !== null) logger.debug(segmentOpen, meta)
		else logger.info(line, meta)
	}
}

// yt-dlp prints a path as argv gave it, so relative to the folder the run
// executes in when its plan names one.
function runPath(active: ActiveDownload, path: string): string {
	return active.ytDlpCwd === undefined || isAbsolute(path) ? path : resolve(active.ytDlpCwd, path)
}

// The event with every path it names made absolute.
function withRunPaths(active: ActiveDownload, event: YtDlpOutputEvent): YtDlpOutputEvent {
	switch (event.kind) {
		case 'destination':
		case 'already-downloaded':
		case 'artifact':
			return {...event, path: runPath(active, event.path)}
		case 'merge':
		case 'postprocess':
			return event.path === undefined ? event : {...event, path: runPath(active, event.path)}
		case 'move':
			return {...event, from: runPath(active, event.from), to: runPath(active, event.to)}
		default:
			return event
	}
}

function rememberSubtitlePath(active: ActiveDownload, path: string): void {
	if (!active.subtitlePaths.includes(path)) active.subtitlePaths.push(path)
}

function replacePath(paths: string[] | undefined, from: string, to: string): string[] | undefined {
	if (!paths?.includes(from)) return paths
	return paths.map(path => (path === from ? to : path))
}

export class ProgressParser {
	// One per running job: yt-dlp prints the streams it is about to download,
	// then progress for each in turn, and the tracker turns that into one percent.
	private readonly trackers = new WeakMap<ActiveDownload, YtDlpDownloadProgressTracker>()

	constructor(
		private readonly emitStatus: StatusEmit,
		private readonly emitProgress: ProgressEmit,
		private readonly emitArtifact?: ArtifactEmit
	) {}

	consume(active: ActiveDownload, text: string): void {
		const jobId = active.job.id
		for (const line of splitOutputLines(text)) {
			const parsed = parseYtDlpOutputLine(line)
			const event = parsed && withRunPaths(active, parsed)
			const combined = event?.kind === 'download-progress' ? this.trackerFor(active).update(event.progress) : undefined
			logOutputLine(active, line, event, combined?.percent)
			if (!event) continue

			if (event.kind === 'requested-formats') {
				this.trackerFor(active).setRequestedFormats(event.formats)
				continue
			}

			if (event.kind === 'download-progress') {
				const {percent, speedBps, etaSeconds} = combined ?? {}
				// A sidecar subtitle is fetched after the media, and its own 0–100%
				// would rewind the bar. A subtitle-only job has nothing else to show.
				const shownPercent = active.currentFileKind === 'subtitle' && active.input.job.kind !== 'subtitle-only' ? undefined : percent
				this.emitProgress({jobId, line, at: nowIso(), ...(shownPercent === undefined ? {} : {percent: shownPercent}), ...(speedBps === undefined ? {} : {speedBps}), ...(etaSeconds === undefined ? {} : {etaSeconds})})
				continue
			}

			if (event.kind === 'destination') {
				const path = event.path
				const kind = isSubtitleFile(path) ? 'subtitle' : 'media'
				active.currentFileKind = kind
				active.lastLoggedProgressStep = undefined
				active.lastLoggedFfmpegStep = undefined
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
				active.sidecarPaths = replacePath(active.sidecarPaths, event.from, event.to)
				this.emitArtifact?.({jobId, path: event.to, kind: artifactKindForPath(event.to), fromPath: event.from, at: nowIso()})
				this.emitPostProcStatus(active, 'movingFiles')
				continue
			}

			if (event.kind === 'artifact') {
				// Sidecars are reported once the job completes, and only if still on
				// disk: an embedded thumbnail is written here, then deleted by yt-dlp.
				if (active.input.probeInfoJsonPath === event.path) this.emitArtifact?.({jobId, path: event.path, kind: artifactKindForPath(event.path), at: nowIso(), internal: true})
				else if (!active.sidecarPaths?.includes(event.path)) active.sidecarPaths = [...(active.sidecarPaths ?? []), event.path]
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

			if (event.kind === 'transfer-retry') {
				// Status, not progress: the progress formatter has no shape for this
				// line and drops it, which is what made a multi-minute retry loop
				// look like a download frozen at 0%. The host is logged above but
				// deliberately kept out of the status params — the user can act on
				// "we are retrying", not on a CDN hostname.
				this.emitStatus(jobId, 'download', STATUS_KEY.retryingTransfer, {attempt: event.attempt, total: event.total})
				continue
			}

			if (event.kind === 'postprocess') {
				if (event.path) active.mediaPath = event.path
				this.emitPostProcStatus(active, event.phase)
				continue
			}

			this.emitProgress({jobId, line: event.raw, at: nowIso()})
		}
	}

	private trackerFor(active: ActiveDownload): YtDlpDownloadProgressTracker {
		let tracker = this.trackers.get(active)
		if (!tracker) {
			tracker = new YtDlpDownloadProgressTracker()
			this.trackers.set(active, tracker)
		}
		return tracker
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
