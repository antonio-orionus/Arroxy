// Public projections of queue rows, intakes and profiles. They are built
// field by field, never spread from internal types, so a new internal field
// can never leak: no temp dirs, job options, raw stderr or output folders.

import type {IntakeView, ProfileMediaKind, ProfileView, QueueItemOrigin, QueueItemStatus, QueueItemView} from 'arroxy-control'
import {errorKindMetadata, type YtDlpErrorKind} from 'ytdlp-errors'
import {downloadProfileRefFor} from '@shared/downloadProfiles.js'
import {requestSiteFor} from '@shared/sites/index.js'
import type {QueueItemStatus as InternalStatus} from '@shared/schemas.js'
import type {DownloadProfile, QueueItem} from '@shared/types.js'
import type {IntakeRecord} from './IntakeRegistry.js'

export interface ItemProjection {
	// The label the user gave a client when allowing it; null once removed.
	clientLabel(clientId: string): string | null
	// A yt-dlp failure in the user's words, in English.
	errorText(kind: YtDlpErrorKind): string
	// The caller holds paths.read: artifacts carry their paths.
	pathsRead: boolean
}

const STATUS: Record<InternalStatus, QueueItemStatus> = {probing: 'probing', 'needs-choice': 'needsYourChoice', pending: 'pending', running: 'running', 'paused-held': 'paused', 'paused-active': 'paused', done: 'done', error: 'failed', cancelled: 'cancelled'}

const PROFILE_KIND: Record<DownloadProfile['media']['kind'], ProfileMediaKind> = {'video-audio': 'videoAudio', 'video-only': 'videoOnly', 'audio-only': 'audioOnly', 'subtitles-only': 'subtitlesOnly'}

// The window shows "See the raw output below" here; a client gets no raw output.
const UNKNOWN_FAILURE = 'The download failed.'

export function queueItemView(item: QueueItem, projection: ItemProjection): QueueItemView {
	const view: QueueItemView = {
		id: item.id,
		// A placeholder is labelled with its link until the probe knows the title.
		title: item.title.length === 0 || item.title === item.url ? null : item.title,
		site: siteOf(item.url),
		status: STATUS[item.status],
		progress: progressOf(item),
		lane: item.lane,
		origin: originOf(item, projection),
		intakeId: item.origin?.intakeId ?? null,
		error: errorOf(item, projection)
	}
	if (projection.pathsRead) view.artifacts = item.artifacts.flatMap(artifact => (artifact.internal || artifact.missing ? [] : [{kind: artifact.kind, path: artifact.path}]))
	return view
}

// The intake's client stays inside: a caller sees the intake, not who started it.
export function intakeView(record: IntakeRecord): IntakeView {
	return {intakeId: record.intakeId, placeholderId: record.placeholderId, state: record.state, updatedAt: record.updatedAt}
}

export function profileView(profile: DownloadProfile, label: string): ProfileView {
	return {ref: downloadProfileRefFor(profile, undefined), label, kind: PROFILE_KIND[profile.media.kind]}
}

// Named the way status.cooldowns names sites, so a client can match the two.
function siteOf(url: string): string | null {
	const site = requestSiteFor(url)
	return site === 'unknown' ? null : site
}

// A row carries only its percentage; the rest of a download's progress is
// formatted text, which a client gets as nulls rather than parsed guesses.
function progressOf(item: QueueItem): QueueItemView['progress'] {
	if (item.job.kind === 'unresolved') return null
	return {percent: Math.min(100, Math.max(0, item.progressPercent)), downloadedBytes: null, totalBytes: null, speedBytesPerSecond: null, etaSeconds: null}
}

function originOf(item: QueueItem, projection: ItemProjection): QueueItemOrigin {
	if (item.origin?.kind !== 'localClient') return {kind: 'app'}
	const label = projection.clientLabel(item.origin.clientId)
	return {kind: 'localClient', clientId: item.origin.clientId, ...(label ? {label} : {})}
}

function errorOf(item: QueueItem, projection: ItemProjection): QueueItemView['error'] {
	if (item.status !== 'error' || !item.error) return null
	const {kind} = item.error
	return {ytdlpKind: kind, message: kind === 'unknown' ? UNKNOWN_FAILURE : projection.errorText(kind), retryable: errorKindMetadata(kind).recoverable}
}
