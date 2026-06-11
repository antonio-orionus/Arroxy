import type {BulkUrlKind} from './schemas.js'

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
	return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be'
}

function youtubePathSegments(parsed: URL): string[] {
	return parsed.pathname.split('/').filter(Boolean)
}

function isYouTubeVideoPath(host: string, segments: string[], searchParams: URLSearchParams): boolean {
	return (host === 'youtu.be' && segments.length === 1 && !!segments[0]) || (segments[0] === 'watch' && !!searchParams.get('v')) || (segments[0] === 'shorts' && segments.length === 2 && !!segments[1])
}

function isYouTubeChannelPath(segments: string[]): boolean {
	return segments[0]?.startsWith('@') === true || segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user'
}

export function classifyUrlIntent(url: string): UrlIntent {
	const parsed = parseUrl(url)
	if (!parsed || !isYouTubeHost(parsed.hostname)) return {kind: 'unknown', url}

	const host = parsed.hostname.toLowerCase()
	const segments = youtubePathSegments(parsed)
	const hasList = parsed.searchParams.has('list')
	const hasConcreteVideo = isYouTubeVideoPath(host, segments, parsed.searchParams)

	if (hasConcreteVideo && hasList) return {kind: 'mixed', url, reason: 'youtube-video-with-list'}
	if (segments[0] === 'results' && parsed.searchParams.has('search_query')) return {kind: 'obvious-collection', url, collection: 'search'}
	if (isYouTubeChannelPath(segments)) return {kind: 'obvious-collection', url, collection: 'channel'}
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

export function extractUrlIntentYouTubeVideoId(intent: UrlIntent): string | null {
	if (intent.kind !== 'obvious-single' || intent.site !== 'youtube') return null
	const parsed = parseUrl(intent.url)
	if (!parsed || !isYouTubeHost(parsed.hostname)) return null

	const host = parsed.hostname.toLowerCase()
	const segments = youtubePathSegments(parsed)
	if (host === 'youtu.be') return segments[0] ?? null
	if (segments[0] === 'watch') return parsed.searchParams.get('v')
	if (segments[0] === 'shorts') return segments[1] ?? null
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
