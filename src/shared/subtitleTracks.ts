// Which subtitle tracks a job fetches: one rule for every job kind. A job asks
// for languages and a subtitle source (profiles, batches, Quick Download) or
// for the tracks picked on the Format screen; planning that request over a
// video's subtitle maps names the exact tracks, and everything yt-dlp is told
// (the flags, the request keys) is read off the plan.

import {z} from 'zod'
import {downloadProfileSubtitleSourceSchema, type DownloadProfileSubtitleSource} from './schemas.js'

// A track picked on the Format screen, by its key in the video's maps.
const pickedTrackSchema = z.object({key: z.string().min(1), auto: z.boolean()})
export type PickedTrack = z.infer<typeof pickedTrackSchema>

export const subtitleRequestSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('languages'), languages: z.array(z.string().min(1)), source: downloadProfileSubtitleSourceSchema}), z.object({kind: z.literal('tracks'), tracks: z.array(pickedTrackSchema)})])
export type SubtitleRequest = z.infer<typeof subtitleRequestSchema>

// What a request names: its language codes, or the keys of its tracks.
export function requestedSubtitles(request: SubtitleRequest): string[] {
	return request.kind === 'languages' ? [...request.languages] : request.tracks.map(track => track.key)
}

// Whether a request can fetch an automatic caption.
export function requestFetchesAuto(request: SubtitleRequest): boolean {
	return request.kind === 'languages' ? request.source !== 'manual-only' : request.tracks.some(track => track.auto)
}

// A video's subtitle maps by track key; planning reads only the keys. Sanitized
// (see `sanitizeSubtitleMap`): on YouTube, machine translations are never
// candidates.
type TrackMap = Readonly<Record<string, unknown>>
export interface SubtitleMaps {
	subtitles: TrackMap
	automaticCaptions: TrackMap
}

export interface PlannedTrack {
	// The track's key in the video's maps, as the Format screen lists it (`en-orig`).
	key: string
	// The exact key yt-dlp is asked for (see `requestKeyFor`).
	requestKey: string
	auto: boolean
	// The base language (`en` for `en-orig`).
	language: string
}

export interface SubtitlePlan {
	tracks: PlannedTrack[]
	// Requested languages the video has no track for.
	missing: string[]
}

// Download profiles store base language codes (`de`), but the tracks a URL
// offers are often regional variants (`de-DE`, `pt-BR`, `es-419`, `zh-Hans`).
// A profile asking for `de` should get those too — but not `de-en`, which is
// German auto-translated from English. Region and script subtags are
// capitalised or numeric, while a translation source is a lowercase language
// code, so letter case is what tells them apart.
const REGIONAL_SUFFIX = /^-(?:[A-Z]{2}|[A-Z][a-z]{3}|\d{3})$/

// Languages with two codes in use: YouTube serves Hebrew as `iw`, Norwegian
// Bokmål as `no` and Yiddish as `ji`, where other sites and the app's own
// language list say `he`, `nb` and `yi`. Either spelling finds the other.
const SAME_LANGUAGE_CODES: readonly (readonly string[])[] = [
	['he', 'iw'],
	['nb', 'no'],
	['yi', 'ji']
]

// Every spelling of a code, its region or script kept: `he-IL` is also `iw-IL`.
function sameLanguageCodes(code: string): readonly string[] {
	const lower = code.toLowerCase()
	const dash = lower.indexOf('-')
	const language = dash === -1 ? lower : lower.slice(0, dash)
	const rest = dash === -1 ? '' : lower.slice(dash)
	const spellings = SAME_LANGUAGE_CODES.find(codes => codes.includes(language)) ?? [language]
	return spellings.map(spelling => spelling + rest)
}

// One spelling per language, so `he` and `iw` tracks count as the same one.
function oneSpelling(trackKey: string): string {
	return sameLanguageCodes(trackKey)[0] ?? trackKey.toLowerCase()
}

function matchesCode(code: string, trackKey: string): boolean {
	if (trackKey.slice(0, code.length).toLowerCase() !== code) return false
	const suffix = trackKey.slice(code.length)
	return suffix === '' || REGIONAL_SUFFIX.test(suffix)
}

export function matchesSubtitleLanguage(code: string, trackKey: string): boolean {
	return sameLanguageCodes(code).some(spelling => matchesCode(spelling, trackKey))
}

// YouTube's real automatic captions carry this suffix once the subtitle map is
// sanitized (see `sanitizeSubtitleMap`); the language is the part before it.
const AUTO_CAPTION_SUFFIX = '-orig'

export function baseLanguage(trackKey: string): string {
	return trackKey.endsWith(AUTO_CAPTION_SUFFIX) ? trackKey.slice(0, -AUTO_CAPTION_SUFFIX.length) : trackKey
}

function matchingKeys(code: string, map: TrackMap): string[] {
	return Object.keys(map).filter(key => matchesSubtitleLanguage(code, baseLanguage(key)))
}

// A picked key is the uploaded track when the manual subtitles hold it: the
// picker lists a key both maps hold once, as manual.
export function pickedTrack(key: string, maps: Pick<SubtitleMaps, 'subtitles'>): PickedTrack {
	return {key, auto: !Object.hasOwn(maps.subtitles, key)}
}

// The tracks a source picks for some language codes. Manual tracks win per
// track, not per language: an auto-generated regional variant the manual
// tracks lack is still picked, as yt-dlp does. `manual-and-auto` keeps the
// automatic caption beside the manual track.
function pickLanguages(languages: readonly string[], source: DownloadProfileSubtitleSource, maps: SubtitleMaps): {picked: PickedTrack[]; missing: string[]} {
	const picked: PickedTrack[] = []
	const missing: string[] = []
	for (const code of languages) {
		const manual = source === 'auto-only' ? [] : matchingKeys(code, maps.subtitles)
		const manualBases = new Set(manual.map(key => oneSpelling(baseLanguage(key))))
		const candidates = source === 'manual-only' ? [] : matchingKeys(code, maps.automaticCaptions)
		const auto = source === 'manual-and-auto' ? candidates : candidates.filter(key => !manualBases.has(oneSpelling(baseLanguage(key))))
		const tracks = [...manual.map(key => ({key, auto: false})), ...auto.map(key => ({key, auto: true}))]
		if (tracks.length === 0) missing.push(code)
		for (const track of tracks) if (!picked.some(p => p.key === track.key)) picked.push(track)
	}
	return {picked, missing}
}

// The key to ask yt-dlp for a picked track. An original-language caption
// (`ja-orig`) goes by its bare twin (`ja`): yt-dlp lists it under both keys
// with the same URL, and the bare one names the file `….ja.srt` and the
// embedded track `jpn`, as for any other track. It keeps `-orig` only when the
// job fetches manual tracks and the video has one under the bare key: yt-dlp
// fills a key with the manual track first, so the bare key would fetch that
// one instead of the caption.
function requestKeyFor(key: string, opts: {subtitles: TrackMap; fetchesManual: boolean}): string {
	const bare = baseLanguage(key)
	return bare !== key && (!opts.fetchesManual || !Object.hasOwn(opts.subtitles, bare)) ? bare : key
}

export function planSubtitleTracks(request: SubtitleRequest, maps: SubtitleMaps): SubtitlePlan {
	const {picked, missing} = request.kind === 'languages' ? pickLanguages(request.languages, request.source, maps) : {picked: [...request.tracks], missing: []}
	const fetchesManual = picked.some(track => !track.auto)
	const tracks = picked.map(({key, auto}) => ({key, requestKey: requestKeyFor(key, {subtitles: maps.subtitles, fetchesManual}), auto, language: baseLanguage(key)}))
	return {tracks, missing}
}
