// Signals that YouTube limited which formats a download could choose from.
//
// When YouTube lists formats for a player client but withholds their download
// URLs, yt-dlp drops them and prints a "missing a URL" warning; format rules
// then fall back to what is left, typically the 360p progressive format. The
// warning alone does not say why (yt-dlp guesses a SABR-only experiment on the
// account), so callers word the notice around the signed-in session rather than
// a cause. Shared by the queued download path and the download smoke.
import {z} from 'zod'
import type {MediaIntent} from '@shared/schemas.js'

const SABR_SKIPPED = /Some (\S+) client https formats have been skipped as they are missing a URL/
const INFO_JSON_WRITTEN = /^\[info\] Writing video metadata as JSON to: /

// Format rules fall back to 360p progressive when URLs are withheld, so a
// result under 720p is the symptom worth flagging; a cap below 720p lowers it.
const EXPECTED_MIN_HEIGHT = 720

export function sabrSkippedClient(line: string): string | null {
	return SABR_SKIPPED.exec(line)?.[1] ?? null
}

// yt-dlp prints this line before it writes the file, so the info-json is only
// complete once a later line arrives.
export function isInfoJsonWriteLine(line: string): boolean {
	return INFO_JSON_WRITTEN.test(line)
}

export interface SelectedFormat {
	formatId: string
	height: number | null
	vcodec: string | null
	acodec: string | null
}

const formatFieldsSchema = z.object({format_id: z.string(), height: z.number().nullish(), vcodec: z.string().nullish(), acodec: z.string().nullish()})
const infoJsonSelectionSchema = formatFieldsSchema.extend({requested_formats: z.array(formatFieldsSchema).optional()})

function toSelected(f: z.infer<typeof formatFieldsSchema>): SelectedFormat {
	return {formatId: f.format_id, height: f.height ?? null, vcodec: f.vcodec ?? null, acodec: f.acodec ?? null}
}

// The info-json is yt-dlp output read back from disk, so it is parsed rather
// than trusted: a merged selection lists its parts in requested_formats, a
// single-file one carries the format on the top level.
export function parseSelectedFormats(infoJsonText: string): SelectedFormat[] | null {
	let raw: unknown
	try {
		raw = JSON.parse(infoJsonText)
	} catch {
		return null
	}
	const parsed = infoJsonSelectionSchema.safeParse(raw)
	if (!parsed.success) return null
	return parsed.data.requested_formats?.length ? parsed.data.requested_formats.map(toSelected) : [toSelected(parsed.data)]
}

export function selectedMaxHeight(formats: readonly SelectedFormat[] | null): number | null {
	const heights = (formats ?? []).flatMap(f => (f.height === null ? [] : [f.height]))
	return heights.length > 0 ? Math.max(...heights) : null
}

const availableFormatsSchema = z.object({formats: z.array(z.object({height: z.number().nullish(), vcodec: z.string().nullish()})).optional()})

// The tallest video format an info-json offers. Withheld formats are already
// missing from the list, so for a probe info-json this is the best a download
// that loads it can select.
export function availableMaxHeight(infoJsonText: string): number | null {
	let raw: unknown
	try {
		raw = JSON.parse(infoJsonText)
	} catch {
		return null
	}
	const parsed = availableFormatsSchema.safeParse(raw)
	if (!parsed.success) return null
	const heights = (parsed.data.formats ?? []).flatMap(f => (f.vcodec !== 'none' && typeof f.height === 'number' ? [f.height] : []))
	return heights.length > 0 ? Math.max(...heights) : null
}

function requestedCap(intent: MediaIntent): number | null {
	if (intent.kind === 'audio-only') return null
	const numeric = intent.tiers.flatMap(tier => (tier === 'best' ? [] : [Number(tier)]))
	return intent.tiers.includes('best') || numeric.length === 0 ? Number.POSITIVE_INFINITY : Math.max(...numeric)
}

export interface QualityLimit {
	height: number
}

export function assessQualityLimit(input: {sabrSkipped: boolean; selectedHeight: number | null; intent: MediaIntent}): QualityLimit | null {
	if (!input.sabrSkipped || input.selectedHeight === null) return null
	const cap = requestedCap(input.intent)
	if (cap === null) return null
	return input.selectedHeight < Math.min(cap, EXPECTED_MIN_HEIGHT) ? {height: input.selectedHeight} : null
}

// Availability values that tell a video can't be fetched signed out, so dropping
// cookies would only trade low quality for a failure.
const SIGN_IN_AVAILABILITY = new Set(['needs_auth', 'premium_only', 'subscriber_only'])
const accessFieldsSchema = z.object({age_limit: z.number().nullish(), availability: z.string().nullish()})

export function requiresSignIn(infoJsonText: string): boolean {
	let raw: unknown
	try {
		raw = JSON.parse(infoJsonText)
	} catch {
		return false
	}
	const parsed = accessFieldsSchema.safeParse(raw)
	if (!parsed.success) return false
	return (parsed.data.age_limit ?? 0) > 0 || SIGN_IN_AVAILABILITY.has(parsed.data.availability ?? '')
}
