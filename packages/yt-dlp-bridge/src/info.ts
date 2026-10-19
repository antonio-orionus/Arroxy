// Spec port of yt-dlp's info_dict shape.
// Mirrors yt_dlp/extractor/common.py:105-540 — the documented public contract
// for what `--dump-single-json` returns.
//
// Discriminated on `_type`. yt-dlp omits `_type` for plain videos (treat as
// 'video' default per spec line 117). Playlists/multi-video/url/url-transparent
// always include it.

import {z} from 'zod'

const nullToUndef = (v: unknown): unknown => (v === null ? undefined : v)
const optStr = z.preprocess(nullToUndef, z.string().optional())
const optNum = z.preprocess(nullToUndef, z.number().optional())
const optBool = z.preprocess(nullToUndef, z.boolean().optional())
// Free-form string lists (tags, categories): a stray non-string entry is
// dropped rather than failing the whole dict.
const optStrList = z.preprocess(v => (Array.isArray(v) ? v.filter((entry): entry is string => typeof entry === 'string') : nullToUndef(v)), z.array(z.string()).optional())

// Per-format shape. Brings into the typed schema every field consumers read;
// everything else passes through unchecked because yt-dlp's format dict is huge.
export const ytDlpFormatSchema = z
	.object({
		format_id: optStr,
		ext: optStr,
		url: optStr,
		resolution: optStr,
		format_note: optStr,
		width: optNum,
		height: optNum,
		fps: optNum,
		tbr: optNum,
		vbr: optNum,
		abr: optNum,
		asr: optNum,
		audio_channels: optNum,
		filesize: optNum,
		filesize_approx: optNum,
		vcodec: optStr,
		acodec: optStr,
		dynamic_range: optStr,
		protocol: optStr,
		language: optStr,
		language_preference: optNum,
		preference: optNum,
		quality: optNum,
		http_headers: z.preprocess(nullToUndef, z.record(z.string(), z.string()).optional())
	})
	.loose()

export type YtDlpFormat = z.infer<typeof ytDlpFormatSchema>

// Per yt-dlp spec: a subtitle track is `{ url } | { data }` plus optional ext/name.
// The url-xor-data invariant is not enforced because some extractors emit
// neither (the entry is still useful — yt-dlp will refetch).
export const ytDlpSubtitleTrackSchema = z.object({ext: optStr, name: optStr, url: optStr, data: optStr}).loose()

export type YtDlpSubtitleTrack = z.infer<typeof ytDlpSubtitleTrackSchema>

// Some extractors (NicoVideo, others) emit `null` URLs for placeholder
// thumbnail entries — yt-dlp keeps the entry around so its array index lines
// up with original ordering. The null is tolerated here; consumers skip
// entries lacking a usable URL.
const thumbnailObjectSchema = z.object({url: optStr, width: optNum, height: optNum, id: optStr}).loose()

const subtitleMapSchema = z.preprocess(nullToUndef, z.record(z.string(), z.array(ytDlpSubtitleTrackSchema)).optional())

// Video shape. Lots of optional fields — yt-dlp emits a sparse dict per
// extractor. The schema stays permissive (`.loose()`) and only validates the
// fields consumers read.
//
// Per common.py spec, `has_drm` can be True / False / None / 'maybe'. This
// normalizes 'maybe' (and any other truthy non-bool) to `undefined` so consumers
// reading `info.has_drm === true` still get the right answer for hard DRM,
// without rejecting the probe just because an extractor emitted 'maybe'.
const optBoolLenient = z.preprocess(v => {
	if (v === null || v === undefined) return undefined
	if (typeof v === 'boolean') return v
	return undefined
}, z.boolean().optional())

const videoFieldsSchema = z.object({
	id: optStr,
	title: optStr,
	fulltitle: optStr,
	description: optStr,
	thumbnail: optStr,
	thumbnails: z.preprocess(nullToUndef, z.array(thumbnailObjectSchema).optional()),
	duration: optNum,
	duration_string: optStr,
	webpage_url: optStr,
	extractor: optStr,
	extractor_key: optStr,
	formats: z.preprocess(nullToUndef, z.array(ytDlpFormatSchema).optional()),
	url: optStr,
	subtitles: subtitleMapSchema,
	automatic_captions: subtitleMapSchema,
	// Per-info-dict capability flags, read straight off the dict.
	is_live: optBool,
	was_live: optBool,
	live_status: optStr,
	availability: optStr,
	has_drm: optBoolLenient,
	// playable_in_embed is True/False/None/string per spec — it is not typed,
	// and the loose schema lets it pass through unchecked. Removed from the
	// typed surface so a string value (e.g. 'whitelist') doesn't fail validation.
	age_limit: optNum,
	// Attribution fields. Typed rather than left to the loose passthrough
	// because a host may render filename templates that name a *directory*
	// after {uploader} / {date} itself. The four-field chain mirrors the
	// compiled `%(uploader,channel,creator,uploader_id)` output template.
	uploader: optStr,
	channel: optStr,
	creator: optStr,
	uploader_id: optStr,
	channel_id: optStr,
	channel_url: optStr,
	upload_date: optStr,
	categories: optStrList,
	tags: optStrList,
	// Chapter dicts are left to the consumer's own parser; a malformed list
	// must never fail the dict, so it is carried unchecked.
	chapters: z.preprocess(nullToUndef, z.array(z.unknown()).optional()).catch(undefined),
	// Epoch seconds. Sparse on flat playlist entries.
	timestamp: optNum
})

const playlistFieldsSchema = z.object({id: optStr, title: optStr, thumbnail: optStr, thumbnails: z.preprocess(nullToUndef, z.array(thumbnailObjectSchema).optional()), webpage_url: optStr, extractor: optStr, extractor_key: optStr, playlist_id: optStr, playlist_title: optStr, playlist_count: optNum})

// Recursive schema — playlist entries are themselves info_dicts. zod recursion
// requires a thunked z.lazy + an explicit type alias to break the cycle.
export type InfoDict =
	| ({_type?: 'video'} & z.infer<typeof videoFieldsSchema>)
	| ({_type: 'playlist'} & z.infer<typeof playlistFieldsSchema> & {entries: InfoDict[]})
	| ({_type: 'multi_video'} & z.infer<typeof playlistFieldsSchema> & {entries: InfoDict[]})
	| ({_type: 'url'} & z.infer<typeof videoFieldsSchema> & {url: string; ie_key?: string | undefined})
	| ({_type: 'url_transparent'} & z.infer<typeof videoFieldsSchema> & {url: string; ie_key?: string | undefined})

export const infoDictSchema: z.ZodType<InfoDict> = z.lazy(() => {
	const videoArm = videoFieldsSchema.extend({_type: z.preprocess(v => v ?? 'video', z.literal('video'))}).loose()

	const playlistArm = playlistFieldsSchema.extend({_type: z.literal('playlist'), entries: z.array(infoDictSchema)}).loose()

	const multiVideoArm = playlistFieldsSchema.extend({_type: z.literal('multi_video'), entries: z.array(infoDictSchema)}).loose()

	const urlArm = videoFieldsSchema.extend({_type: z.literal('url'), url: z.string(), ie_key: optStr}).loose()

	const urlTransparentArm = videoFieldsSchema.extend({_type: z.literal('url_transparent'), url: z.string(), ie_key: optStr}).loose()

	return z.union([playlistArm, multiVideoArm, urlArm, urlTransparentArm, videoArm])
})

export type VideoInfo = Extract<InfoDict, {_type?: 'video'} & {formats?: unknown}>
export type PlaylistInfo = Extract<InfoDict, {_type: 'playlist'}>
export type MultiVideoInfo = Extract<InfoDict, {_type: 'multi_video'}>
export type UrlRedirectInfo = Extract<InfoDict, {_type: 'url' | 'url_transparent'}>

export function isPlaylistLike(info: InfoDict): info is PlaylistInfo | MultiVideoInfo {
	return info._type === 'playlist' || info._type === 'multi_video'
}

export function isUrlRedirect(info: InfoDict): info is UrlRedirectInfo {
	return info._type === 'url' || info._type === 'url_transparent'
}
