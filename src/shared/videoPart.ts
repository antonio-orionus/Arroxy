// Part of video: one time range of a single video, downloaded on its own.
// Pure rules shared by the Format screen (fields, validation, sizes) and the
// job (filename suffix, the yt-dlp section). Whole seconds throughout: the
// probe rounds the duration, and keyframe cuts are coarser than a second.
import type {VideoPart} from './preparedJob.js'

// `[[H:]M:]S`, or plain seconds. Minutes and seconds after a colon stay below 60.
const PART_TIME = /^(?:(?:(\d+):)?(\d+):)?(\d+)$/

export function parsePartTime(text: string): number | null {
	const match = PART_TIME.exec(text.trim())
	if (!match) return null
	const [, hoursText, minutesText, secondsText] = match
	const hours = hoursText === undefined ? 0 : Number(hoursText)
	const minutes = minutesText === undefined ? 0 : Number(minutesText)
	const seconds = Number(secondsText)
	if (minutesText !== undefined && seconds >= 60) return null
	if (hoursText !== undefined && minutes >= 60) return null
	return hours * 3600 + minutes * 60 + seconds
}

export function formatPartTime(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const pad = (value: number): string => String(value).padStart(2, '0')
	return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

// YouTube's `t` forms: `754`, `754s`, `12m34s`, `1h2m3s`, and any subset of
// the units in that order.
const URL_START_TIME = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/

/**
 * The start time a shared link carries in `t`, or null. Only ever offered to
 * the user: a `t` in a shared link is often just where someone paused.
 */
export function urlStartSeconds(url: string): number | null {
	let value: string | null
	try {
		value = new URL(url).searchParams.get('t')
	} catch {
		return null
	}
	if (value === null) return null
	const match = URL_START_TIME.exec(value)
	if (!match) return null
	const [, hours, minutes, seconds] = match
	const total = Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0)
	return total > 0 ? total : null
}

export interface VideoPartFields {
	start: string
	end: string
	exactCut: boolean
}

export type VideoPartError = 'durationUnknown' | 'startInvalid' | 'endInvalid' | 'startNotBeforeEnd' | 'endBeyondDuration'

export type VideoPartValidation = {ok: true; part: VideoPart} | {ok: false; error: VideoPartError}

export function validateVideoPart(fields: VideoPartFields, durationSeconds: number | undefined): VideoPartValidation {
	if (durationSeconds === undefined || durationSeconds <= 0) return {ok: false, error: 'durationUnknown'}
	const startSeconds = parsePartTime(fields.start)
	if (startSeconds === null) return {ok: false, error: 'startInvalid'}
	const endSeconds = parsePartTime(fields.end)
	if (endSeconds === null) return {ok: false, error: 'endInvalid'}
	if (endSeconds > durationSeconds) return {ok: false, error: 'endBeyondDuration'}
	if (startSeconds >= endSeconds) return {ok: false, error: 'startNotBeforeEnd'}
	return {ok: true, part: {startSeconds, endSeconds, exactCut: fields.exactCut}}
}

function compactTime(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const text = `${hours > 0 ? `${hours}h` : ''}${minutes > 0 ? `${minutes}m` : ''}${seconds > 0 ? `${seconds}s` : ''}`
	return text === '' ? '0s' : text
}

/** `[3m40s-7m15s]`: the range a part's file name carries. */
export function videoPartSuffix(part: VideoPart): string {
	return `[${compactTime(part.startSeconds)}-${compactTime(part.endSeconds)}]`
}

/** yt-dlp `--download-sections` value: `*` makes it a time range, not a chapter regex. */
export function downloadSection(part: VideoPart): string {
	return `*${part.startSeconds}-${part.endSeconds}`
}

/** A size estimate for the part, assuming an even bitrate. */
export function scaleBytesToPart(bytes: number | undefined, part: VideoPart | null, durationSeconds: number | undefined): number | undefined {
	if (bytes === undefined || part === null || durationSeconds === undefined || durationSeconds <= 0) return bytes
	return Math.round((bytes * (part.endSeconds - part.startSeconds)) / durationSeconds)
}
