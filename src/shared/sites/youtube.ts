// YouTube-specific Site adapter. Owns every quirk that previously lived as a
// scattered `isYouTubeExtractor()` / hostname check throughout the codebase:
// PoT token, SponsorBlock, auto-caption rolling-cue dedupe, `-orig` filter,
// browse-id playlist hints, nested container detection.
//
// Browse-id prefixes (UC, VL*, MPRE, MPSPPL, …) are stable YouTube/InnerTube
// identifiers; see refs/yt-dlp/yt_dlp/extractor/youtube/_video.py for the
// full taxonomy. When yt-dlp adds new id types, update both predicates below.

import type {ListKind} from '../schemas.js'
import type {ExploreCookie, PlaylistEntryHint, Site} from './types.js'
import {isYouTubeHostname} from './youtubeHost.js'
import {youtubeListKind} from './youtubeListKind.js'

const LIST_KIND_HINT: Record<ListKind, string> = {playlist: 'Playlist', mix: 'Mix', album: 'Album', uploads: 'Uploads', 'watch-later': 'Watch later', liked: 'Liked'}

// Returns a category-prefixed display label for an entry whose title is
// missing. Mirrors the pre-seam `youtubeIdHint` logic exactly so the playlist
// picker shows the same fallback strings it did before.
function youtubeHintForId(id: string): string | null {
	if (!id) return null
	if (id.startsWith('UC') && id.length === 24) return `Channel · ${id}`
	if (id.startsWith('VL')) return `${LIST_KIND_HINT[youtubeListKind(id.slice(2))]} · ${id.slice(2)}`
	if (id.startsWith('MPRE')) return `Album · ${id}`
	if (id.startsWith('MPSPPL')) return `Search playlist · ${id}`
	if (id.startsWith('MPLAUC') || id.startsWith('MPSP')) return `Section · ${id}`
	return null
}

// True if this id names a YouTube container (channel/playlist/album/mix)
// rather than an actual video.
//
// Exported because two layers need the same answer from different inputs: the
// flat-playlist filter below reads it off a probe entry, and `urlIntent` reads
// it off a `/browse/<id>` URL — the one container shape with no other tell, and
// the shape a bulk row would otherwise carry all the way into the queue.
export function isYouTubeContainerId(id: string): boolean {
	if (!id) return false
	if (id.startsWith('UC') && id.length === 24) return true // channel
	if (id.startsWith('VL')) return true // playlist / mix / radio
	if (id.startsWith('MPRE')) return true // album / release
	if (id.startsWith('MPSPPL') || id.startsWith('MPSP') || id.startsWith('MPLAUC')) return true // sections
	return false
}

// A show page (`/show/VL<playlist id>`) is a playlist under another address,
// and yt-dlp reads that address badly: a playlist titled "show", with no
// channel and videos missing. Its `sbp` only records the video the link was
// opened from. Null for any other URL, including shows with other id types.
export function youtubeShowPlaylistUrl(url: string): string | null {
	let parsed: URL
	try {
		parsed = new URL(url)
	} catch {
		return null
	}
	const host = parsed.hostname.toLowerCase()
	if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) return null
	const [prefix, id, ...rest] = parsed.pathname.split('/').filter(Boolean)
	if (prefix !== 'show' || rest.length > 0 || !id?.startsWith('VL') || id.length === 2) return null
	const playlist = new URL('https://www.youtube.com/playlist')
	playlist.searchParams.set('list', id.slice(2))
	return playlist.toString()
}

// A video address that carries a list (`/shorts/<id>?list=…`, `/live/…`,
// `/embed/…`, `/v/…`, `/e/…`, a nocookie embed) goes to yt-dlp's playlist
// extractor, which drops the video: --no-playlist then still loads the list, so
// "this video" could not be taken. Its watch address keeps both, and
// --no-playlist / --yes-playlist each work on it. Null for any other URL.
const VIDEO_IN_LIST_PREFIXES = new Set(['shorts', 'live', 'embed', 'v', 'e'])
const VIDEO_ID_RE = /^[0-9A-Za-z_-]{11}$/

export function youtubeVideoInListWatchUrl(url: string): string | null {
	let parsed: URL
	try {
		parsed = new URL(url)
	} catch {
		return null
	}
	if (!isYouTubeHostname(parsed.hostname) || !parsed.searchParams.get('list')) return null
	const [prefix, id, ...rest] = parsed.pathname.split('/').filter(Boolean)
	// `embed/videoseries` is a playlist embed whose segment happens to be 11 characters.
	if (!prefix || !VIDEO_IN_LIST_PREFIXES.has(prefix) || !id || id === 'videoseries' || !VIDEO_ID_RE.test(id) || rest.length > 0) return null
	const watch = new URL('https://www.youtube.com/watch')
	watch.searchParams.set('v', id)
	for (const [key, value] of parsed.searchParams) watch.searchParams.append(key, value)
	return watch.toString()
}

// Used to filter heterogeneous flat-playlist results so the wizard's
// "pick videos" model isn't broken by nested entries.
function youtubeIsNested(entry: PlaylistEntryHint): boolean {
	return isYouTubeContainerId(entry.id ?? '')
}

const YOUTUBE_AUTH_PAIR = ['SAPISID', '__Secure-1PAPISID', '__Secure-3PAPISID'] as const

// Auth cookies live on youtube.com only; youtu.be and nocookie set none.
function onYouTube(cookie: ExploreCookie): boolean {
	const host = cookie.domain.replace(/^\./, '').toLowerCase()
	return host === 'youtube.com' || host.endsWith('.youtube.com')
}

// yt-dlp's own rule (_has_auth_cookies): LOGIN_INFO plus one SAPISID-family cookie.
function youtubeIsSignedIn(cookies: readonly ExploreCookie[]): boolean {
	const names = new Set(cookies.filter(onYouTube).map(c => c.name))
	return names.has('LOGIN_INFO') && YOUTUBE_AUTH_PAIR.some(name => names.has(name))
}

// youtu.be/<id> is the watch page; its start time and list come along, its
// share-tracking `si` does not.
const SHORT_LINK_KEPT_PARAMS = ['t', 'list'] as const

function youtubeCanonicalAddress(url: URL): URL {
	if (url.hostname !== 'youtu.be') return url
	const id = url.pathname.split('/').find(Boolean)
	if (!id) return new URL('https://www.youtube.com/')
	const watch = new URL('https://www.youtube.com/watch')
	watch.searchParams.set('v', id)
	for (const name of SHORT_LINK_KEPT_PARAMS) {
		const value = url.searchParams.get(name)
		if (value !== null) watch.searchParams.set(name, value)
	}
	return watch
}

export const youtubeSite: Site = {
	id: 'youtube',
	needsPotToken: true,
	supportsSponsorBlock: true,
	needsAutoCaptionDedupe: true,
	autoCaptionRequiresOrigSuffix: true,
	probeListsSubtitleTracks: true,
	hintForPlaylistId: youtubeHintForId,
	isNestedContainer: youtubeIsNested,
	explore: {
		homeUrl: 'https://www.youtube.com/',
		cookieDomains: ['youtube.com'],
		accountCookieHosts: [
			{kind: 'suffix', domain: 'youtube.com'},
			{kind: 'suffix', domain: 'google.com'},
			{kind: 'pattern', pattern: 'google-cctld'}
		],
		contentHosts: [
			{kind: 'suffix', domain: 'youtube.com'},
			{kind: 'exact', host: 'youtu.be'}
		],
		consentHosts: [
			{kind: 'exact', host: 'consent.youtube.com'},
			{kind: 'exact', host: 'consent.google.com'},
			{kind: 'pattern', pattern: 'google-consent-cctld'}
		],
		signInHosts: [
			{kind: 'exact', host: 'accounts.google.com'},
			{kind: 'pattern', pattern: 'google-accounts-cctld'},
			{kind: 'exact', host: 'accounts.youtube.com'},
			{kind: 'exact', host: 'myaccount.google.com'}
		],
		// After one watch page has run the lists' YouTube scriptlets, every
		// result and grid loses its view count and upload date; the pre-roll
		// plays either way.
		scriptletFreeDomains: ['youtube.com'],
		isSignedIn: youtubeIsSignedIn,
		// Home and search results: a search box whose query is in the URL. Watch
		// pages (comments, the player), channels and posts stay.
		idleUnloadPaths: ['/', '/results'],
		canonicalAddress: youtubeCanonicalAddress
	}
}
