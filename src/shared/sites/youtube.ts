// YouTube-specific Site adapter. Owns every quirk that previously lived as a
// scattered `isYouTubeExtractor()` / hostname check throughout the codebase:
// PoT token, SponsorBlock, auto-caption rolling-cue dedupe, `-orig` filter,
// browse-id playlist hints, nested container detection.
//
// Browse-id prefixes (UC, VL*, MPRE, MPSPPL, …) are stable YouTube/InnerTube
// identifiers; see refs/yt-dlp/yt_dlp/extractor/youtube/_video.py for the
// full taxonomy. When yt-dlp adds new id types, update both predicates below.

import type {ExploreCookie, PlaylistEntryHint, Site} from './types.js'

// The one answer to "is this a YouTube host?" for URLs. yt-dlp's YoutubeIE
// accepts youtube-nocookie.com embeds, so they get every YouTube behavior too.
// Cookie domains are a different question (see onYouTube below).
export function isYouTubeHostname(hostname: string): boolean {
	const host = hostname.toLowerCase()
	return host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')
}

// Returns a category-prefixed display label for an entry whose title is
// missing. Mirrors the pre-seam `youtubeIdHint` logic exactly so the playlist
// picker shows the same fallback strings it did before.
function youtubeHintForId(id: string): string | null {
	if (!id) return null
	if (id.startsWith('UC') && id.length === 24) return `Channel · ${id}`
	if (id.startsWith('VLPL') || id.startsWith('VLOLAK')) return `Playlist · ${id.slice(2)}`
	if (id.startsWith('VLRD')) return `Mix · ${id.slice(2)}`
	if (id.startsWith('VL')) return `Playlist · ${id.slice(2)}`
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

function youtubeSearchUrl(query: string): string {
	const url = new URL('https://www.youtube.com/results')
	url.searchParams.set('search_query', query)
	return url.href
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
		isSignedIn: youtubeIsSignedIn,
		searchUrl: youtubeSearchUrl,
		// Home and search results: a search box whose query is in the URL. Watch
		// pages (comments, the player), channels and posts stay.
		idleUnloadPaths: ['/', '/results'],
		canonicalAddress: youtubeCanonicalAddress
	}
}
