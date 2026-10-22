import path from 'node:path'
import catalog from './fixture-media-catalog.json' with {type: 'json'}

export type FixtureMediaKind = 'generated-muxed' | 'generated-split-video' | 'generated-split-audio'

export interface FixtureFormatDescriptor {
	id: string
	note: string
	ext: string
	contentType: string
	mediaKind: FixtureMediaKind
	width?: number
	height?: number
	fps?: number
	tbr?: number
	abr?: number
	filesize: number
	vcodec: string
	acodec: string
}

function requireFormat(formatId: string): FixtureFormatDescriptor {
	for (const formats of Object.values(catalog.formatSets)) {
		const format = formats.find(candidate => candidate.id === formatId)
		if (format) return format as FixtureFormatDescriptor
	}
	throw new Error(`Unknown fixture format id: ${formatId}`)
}

/**
 * A catalog entry that overrides its generated title.
 *
 * An empty string counts as no override, matching the extractor's
 * `video.get('title') or <generated>` — otherwise the two sides would disagree
 * about which videos are ordinary.
 */
function titleOverride(video: (typeof catalog.videos)[number]): string | undefined {
	const title = (video as {title?: string}).title
	return title === undefined || title === '' ? undefined : title
}

/** Formats the extractor withholds and warnings it prints for this entry. */
function sessionLimits(video: (typeof catalog.videos)[number]): {withheldFormatIds: string[]; warnings: string[]; withCookiesOnly: boolean} {
	const limited = video as {withheldFormatIds?: string[]; warnings?: string[]; limitedWithCookiesOnly?: boolean}
	return {withheldFormatIds: limited.withheldFormatIds ?? [], warnings: limited.warnings ?? [], withCookiesOnly: limited.limitedWithCookiesOnly === true}
}

/** Extraction refuses anonymous runs, as YouTube does for an age-restricted video. */
function requiresSignIn(video: (typeof catalog.videos)[number]): boolean {
	return (video as {requiresSignIn?: boolean}).requiresSignIn === true
}

function hasChapters(video: (typeof catalog.videos)[number]): boolean {
	return ((video as {chapters?: unknown[]}).chapters?.length ?? 0) > 0
}

function hasMediaTags(video: (typeof catalog.videos)[number]): boolean {
	return (video as {mediaTags?: unknown}).mediaTags !== undefined
}

function isSessionLimited(video: (typeof catalog.videos)[number]): boolean {
	const limits = sessionLimits(video)
	return limits.withheldFormatIds.length > 0 || limits.warnings.length > 0
}

export const FIXTURE_MEDIA_CATALOG_PATH = path.join(process.cwd(), 'tests', 'e2e', 'fixture-media-catalog.json')
// Ordinary fixture videos only. A video carrying an awkward title is addressed
// through its own export, so tests that just need "some video" never draw one.
export const FIXTURE_VIDEO_IDS = catalog.videos.filter(video => video.formatSet === 'muxed' && titleOverride(video) === undefined && !isSessionLimited(video) && !requiresSignIn(video) && !hasChapters(video) && !hasMediaTags(video)).map(video => video.id)
const splitMediaVideo = catalog.videos.find(video => video.formatSet === 'split')
if (!splitMediaVideo) throw new Error('fixture-media-catalog.json must define a split fixture video')
export const SPLIT_MEDIA_VIDEO_ID = splitMediaVideo.id

const awkwardTitleVideo = catalog.videos.find(video => titleOverride(video) !== undefined)
if (!awkwardTitleVideo) throw new Error('fixture-media-catalog.json must define a video with an awkward title')
export const AWKWARD_TITLE_VIDEO_ID = awkwardTitleVideo.id
/** The raw title, before any sanitizing or shortening Arroxy applies. */
export const AWKWARD_TITLE = titleOverride(awkwardTitleVideo) ?? ''
// A title yt-dlp would expand if it reached its argv as plain text: a leading
// `~`, a set variable and an output-template field.
const expandingTitleVideo = catalog.videos.find(video => titleOverride(video)?.includes('$') === true)
if (!expandingTitleVideo) throw new Error('fixture-media-catalog.json must define a video whose title names a variable')
export const EXPANDING_TITLE_VIDEO_ID = expandingTitleVideo.id
export const EXPANDING_TITLE = titleOverride(expandingTitleVideo) ?? ''
// A long title in plain ASCII, so it measures the same in bytes and in UTF-16
// units: a deep folder shortens it by the same amount on every platform.
const longPlainTitleVideo = catalog.videos.find(video => /^[ -~]{150,}$/.test(titleOverride(video) ?? ''))
if (!longPlainTitleVideo) throw new Error('fixture-media-catalog.json must define a video with a long plain title')
export const LONG_PLAIN_TITLE_VIDEO_ID = longPlainTitleVideo.id
export const LONG_PLAIN_TITLE = titleOverride(longPlainTitleVideo) ?? ''
// Mimics a signed-in session YouTube limited: the 720p format comes back without
// a URL and yt-dlp prints its SABR warning, leaving only the 360p fallback.
const isSabrLimited = (video: (typeof catalog.videos)[number]): boolean => sessionLimits(video).warnings.some(warning => warning.includes('missing a URL'))
const sabrLimitedVideo = catalog.videos.find(video => isSabrLimited(video) && !sessionLimits(video).withCookiesOnly)
if (!sabrLimitedVideo) throw new Error('fixture-media-catalog.json must define a SABR-limited fixture video')
export const SABR_LIMITED_VIDEO_ID = sabrLimitedVideo.id
// Limited the same way, but only for a signed-in session: without cookies the
// 720p format comes back with its URL.
const cookieLimitedVideo = catalog.videos.find(video => isSabrLimited(video) && sessionLimits(video).withCookiesOnly)
if (!cookieLimitedVideo) throw new Error('fixture-media-catalog.json must define a fixture video limited only with cookies')
export const COOKIE_LIMITED_VIDEO_ID = cookieLimitedVideo.id
// Downloads only when the Explore session's fixture marker cookie reaches yt-dlp.
const signInVideo = catalog.videos.find(requiresSignIn)
if (!signInVideo) throw new Error('fixture-media-catalog.json must define a video that requires sign-in')
export const SIGN_IN_VIDEO_ID = signInVideo.id
// States its real 8-second length and three chapters, for part-of-video downloads.
const chapteredVideo = catalog.videos.find(hasChapters)
if (!chapteredVideo) throw new Error('fixture-media-catalog.json must define a chaptered fixture video')
export const CHAPTERED_VIDEO_ID = chapteredVideo.id
// Dated, categorised and credited like a music video, for the media filename tokens.
const taggedVideo = catalog.videos.find(hasMediaTags)
if (!taggedVideo) throw new Error('fixture-media-catalog.json must define a video with media tags')
export const MEDIA_TAGGED_VIDEO_ID = taggedVideo.id

export const FIXTURE_PLAYLIST_ID = catalog.playlist.id
export const FIXTURE_PLAYLIST_VIDEO_IDS = catalog.playlist.videoIds
// A playlist that lists one video at two positions, as a mix or a long playlist can.
export const FIXTURE_REPEATED_PLAYLIST_ID = catalog.repeatedPlaylist.id
export const FIXTURE_REPEATED_PLAYLIST_TITLE = catalog.repeatedPlaylist.title
export const FIXTURE_REPEATED_PLAYLIST_VIDEO_IDS = catalog.repeatedPlaylist.videoIds
export const FIXTURE_REPEATED_PLAYLIST_UNIQUE_VIDEO_IDS = [...new Set(FIXTURE_REPEATED_PLAYLIST_VIDEO_IDS)]
// A playlist that shares its first two videos with `playlist` and adds one new one.
export const FIXTURE_OVERLAP_PLAYLIST_ID = catalog.overlapPlaylist.id
export const FIXTURE_OVERLAP_PLAYLIST_TITLE = catalog.overlapPlaylist.title
export const FIXTURE_OVERLAP_PLAYLIST_VIDEO_IDS = catalog.overlapPlaylist.videoIds
// A Mix (`RD` + the video it started from), as YouTube names one.
export const FIXTURE_MIX_ID = catalog.mixPlaylist.id
export const FIXTURE_MIX_VIDEO_IDS = catalog.mixPlaylist.videoIds
// A YouTube Music playlist: an `RDCLAK…` id, a stable playlist, not a Mix.
export const FIXTURE_MUSIC_PLAYLIST_ID = catalog.musicPlaylist.id
export const FIXTURE_MEDIA_FORMAT_IDS = Object.values(catalog.formatSets).flatMap(formatSet => formatSet.map(format => format.id))

export function fixtureMediaPathExtension(formatId: string): string {
	return requireFormat(formatId).ext
}

export function fixtureMediaContentType(formatId: string): string {
	return requireFormat(formatId).contentType
}

export function fixtureMediaFileSize(formatId: string): number {
	return requireFormat(formatId).filesize
}

export function fixtureMediaKind(formatId: string): FixtureMediaKind {
	return requireFormat(formatId).mediaKind
}
