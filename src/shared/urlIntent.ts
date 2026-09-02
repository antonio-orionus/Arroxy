import type {BulkUrlKind} from './schemas.js'
import {isYouTubeContainerId} from './sites/youtube.js'

export type UrlIntent = {kind: 'obvious-single'; url: string; site: 'youtube' | 'other'} | {kind: 'obvious-collection'; url: string; collection: 'playlist' | 'channel' | 'search'} | {kind: 'mixed'; url: string; reason: 'youtube-video-with-list'} | {kind: 'unknown'; url: string}

export type UrlIntentHomeLabel = 'Single URL' | 'Playlist URL' | 'Channel URL' | 'Search URL' | 'Mixed URL' | 'URL'

function parseUrl(url: string): URL | null {
	try {
		return new URL(url)
	} catch {
		return null
	}
}

function isYouTubeHost(hostname: string): boolean {
	const host = hostname.toLowerCase()
	return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be' || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')
}

function youtubePathSegments(parsed: URL): string[] {
	return parsed.pathname.split('/').filter(Boolean)
}

// Two-segment paths that address exactly one video. `/embed/` is the current
// embed player; `/v/` and `/e/` are its legacy Flash-era equivalents, both of
// which yt-dlp still resolves.
const YOUTUBE_VIDEO_PATH_PREFIXES = new Set(['shorts', 'live', 'clip', 'embed', 'v', 'e'])

// `/embed/videoseries?list=…` wears the same shape as a video embed but plays a
// playlist — there is no video behind it, so it must not read as a single.
const EMBED_PLAYLIST_SEGMENT = 'videoseries'

function isYouTubeVideoSegmentPath(segments: string[]): boolean {
	const [prefix, id] = segments
	if (segments.length !== 2 || !prefix || !id) return false
	if (!YOUTUBE_VIDEO_PATH_PREFIXES.has(prefix)) return false
	return !(prefix === 'embed' && id === EMBED_PLAYLIST_SEGMENT)
}

function isYouTubeVideoPath(host: string, segments: string[], searchParams: URLSearchParams): boolean {
	return (host === 'youtu.be' && segments.length === 1 && !!segments[0]) || (segments[0] === 'watch' && !!searchParams.get('v')) || isYouTubeVideoSegmentPath(segments)
}

function isYouTubeChannelPath(segments: string[]): boolean {
	return segments[0]?.startsWith('@') === true || segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user'
}

// `music.youtube.com/browse/MPREb…` is an album and `/browse/VLPL…` a playlist,
// but a browse URL carries no `list=` param and no recognisable path segment —
// nothing in its shape says "collection". Left unclassified it reads as a plain
// URL all the way to the queue, where yt-dlp expands the whole release under
// the single filename the job carries. The id prefix is the only tell.
function isYouTubeBrowseCollectionPath(segments: string[]): boolean {
	return segments.length === 2 && segments[0] === 'browse' && isYouTubeContainerId(segments[1] ?? '')
}

// A radio/mix list (`RD…`, or any list reached via `start_radio`) is generated
// on the fly, is personalised, and has different membership every session — so
// "download the playlist" names nothing stable and yt-dlp would expand it to an
// arbitrary slice. The `v=` is the only thing such a URL actually addresses.
// Nothing on YouTube's page or in the copied link tells a human that they are
// on a radio rather than a plain video, so the ambiguity is ours to resolve,
// not theirs to be asked about.
function isYouTubeRadioList(searchParams: URLSearchParams): boolean {
	if (searchParams.has('start_radio')) return true
	return searchParams.get('list')?.startsWith('RD') === true
}

export function classifyUrlIntent(url: string): UrlIntent {
	const parsed = parseUrl(url)
	if (!parsed || !isYouTubeHost(parsed.hostname)) return {kind: 'unknown', url}

	const host = parsed.hostname.toLowerCase()
	const segments = youtubePathSegments(parsed)
	const hasList = parsed.searchParams.has('list')
	const hasConcreteVideo = isYouTubeVideoPath(host, segments, parsed.searchParams)

	if (hasConcreteVideo && hasList) return isYouTubeRadioList(parsed.searchParams) ? {kind: 'obvious-single', url, site: 'youtube'} : {kind: 'mixed', url, reason: 'youtube-video-with-list'}
	if (segments[0] === 'results' && parsed.searchParams.has('search_query')) return {kind: 'obvious-collection', url, collection: 'search'}
	if (isYouTubeChannelPath(segments)) return {kind: 'obvious-collection', url, collection: 'channel'}
	if (isYouTubeBrowseCollectionPath(segments)) return {kind: 'obvious-collection', url, collection: 'playlist'}
	if (hasList) return {kind: 'obvious-collection', url, collection: 'playlist'}
	if (hasConcreteVideo) return {kind: 'obvious-single', url, site: 'youtube'}
	return {kind: 'unknown', url}
}

export function isObviousSingleUrlIntent(intent: UrlIntent): intent is Extract<UrlIntent, {kind: 'obvious-single'}> {
	return intent.kind === 'obvious-single'
}

export function isMixedUrlIntent(intent: UrlIntent): intent is Extract<UrlIntent, {kind: 'mixed'}> {
	return intent.kind === 'mixed'
}

/**
 * Whether this URL addresses a set of videos rather than one video.
 *
 * A download job always runs with `--no-playlist`, but yt-dlp defines that flag
 * as "download only the video, if the URL refers to a video *and* a playlist" —
 * so on a bare `/playlist?list=…`, `@channel` or `/results?search_query=…` it is
 * inert and yt-dlp fetches every entry under the one filename the job carries.
 * A video-with-list URL is deliberately excluded: there `--no-playlist` does
 * exactly what it says.
 *
 * This is a lower bound, not a decision procedure. It reads URL shape only, so
 * containers with no distinguishing shape (`music.youtube.com/browse/MPRE…`) read
 * as `unknown` and pass. Those are caught at probe time instead, by id prefix.
 */
export function isCollectionUrl(url: string): boolean {
	return classifyUrlIntent(url).kind === 'obvious-collection'
}

export function urlIntentHomeLabel(intent: UrlIntent): UrlIntentHomeLabel {
	if (intent.kind === 'obvious-single') return 'Single URL'
	if (intent.kind === 'mixed') return 'Mixed URL'
	if (intent.kind === 'obvious-collection') {
		if (intent.collection === 'playlist') return 'Playlist URL'
		if (intent.collection === 'channel') return 'Channel URL'
		return 'Search URL'
	}
	return 'URL'
}

export function urlIntentBulkLabel(intent: UrlIntent): BulkUrlKind {
	if (intent.kind === 'obvious-single') return 'single'
	if (intent.kind === 'mixed') return 'mixed'
	if (intent.kind === 'obvious-collection') return intent.collection
	return 'unknown'
}

// Every video path shape above except `/clip/`, whose slug identifies the clip
// rather than the video — the real id only arrives with the probe metadata.
// Returning null keeps a clip slug out of `{id}` filenames and `[videoId]` file
// matching instead of seeding them with something that was never a video id.
const YOUTUBE_ID_BEARING_PREFIXES = new Set(['shorts', 'live', 'embed', 'v', 'e'])

export function extractUrlIntentYouTubeVideoId(intent: UrlIntent): string | null {
	if (intent.kind !== 'obvious-single' || intent.site !== 'youtube') return null
	const parsed = parseUrl(intent.url)
	if (!parsed || !isYouTubeHost(parsed.hostname)) return null

	const host = parsed.hostname.toLowerCase()
	const segments = youtubePathSegments(parsed)
	if (host === 'youtu.be') return segments[0] ?? null
	if (segments[0] === 'watch') return parsed.searchParams.get('v')
	if (YOUTUBE_ID_BEARING_PREFIXES.has(segments[0] ?? '')) return segments[1] ?? null
	return null
}

export function deriveUrlIntentLabel(url: string): string | null {
	const parsed = parseUrl(url)
	if (!parsed) return null

	const videoId = extractUrlIntentYouTubeVideoId(classifyUrlIntent(url))
	if (videoId) return `YouTube ${videoId}`

	const path = parsed.pathname.replace(/\/+$/g, '').split('/').filter(Boolean).slice(-2).join('/')
	return path ? `${parsed.hostname}/${path}` : parsed.hostname
}
