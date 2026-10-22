// The YouTube URL contract: Arroxy's reading of a YouTube link (cleanUrl, then
// classifyUrlIntent and the list kinds) against what yt-dlp does with it, for
// every URL in yt-dlp's own YouTube test cases, every shape a video can be shared
// in with a list, and every list id yt-dlp accepts. The snapshot records one
// yt-dlp release (`bun run youtube:url-contract` regenerates it; a weekly job
// does so for each new release and opens a PR). Which extractor yt-dlp hands a
// link to decides what --no-playlist and --yes-playlist can do with it, so a
// disagreement is a button that downloads the wrong thing.

import {readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {z} from 'zod'
import type {ListKind} from '@shared/schemas.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import {rewriteYouTubeChannelRoot} from '@shared/intake/urlIntake.js'
import {youtubeListKind} from '@shared/sites/youtubeListKind.js'
import {classifyUrlIntent, type UrlIntent} from '@shared/urlIntent.js'

const claimSchema = z.strictObject({url: z.string(), extractor: z.string().nullable()})
const snapshot = z
	.strictObject({ytDlp: z.strictObject({version: z.string(), sha256: z.string()}), urls: z.array(claimSchema), shapes: z.array(claimSchema), listIds: z.strictObject({pattern: z.string(), prefixes: z.array(z.string()), exact: z.array(z.string())})})
	.parse(JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../fixtures/youtube-url-contract/yt-dlp.json'), 'utf8')))

type Claim = z.infer<typeof claimSchema>
type Reading = 'single' | 'video-in-list' | 'list' | 'search' | 'any'

// The address Arroxy probes: every way a link comes in passes cleanUrl, and the
// window's entry points also rewrite a bare channel root.
function arroxyReads(url: string): {cleaned: string; intent: UrlIntent} {
	const cleaned = rewriteYouTubeChannelRoot(cleanUrl(url.trim()))
	return {cleaned, intent: classifyUrlIntent(cleaned)}
}

function query(url: string): URLSearchParams {
	try {
		return new URL(url).searchParams
	} catch {
		return new URLSearchParams()
	}
}

// What yt-dlp makes of a link, from the extractor it goes to.
function ytDlpReads({url, extractor}: Claim): Reading {
	const params = query(url)
	switch (extractor) {
		case 'YoutubeYtBe':
			return 'video-in-list'
		case 'Youtube':
		case 'YoutubeClip':
		case 'YoutubeLivestreamEmbed':
			return 'single'
		case 'YoutubeTab':
			// The tab extractor takes a watch link with both ids and honours --no-playlist.
			return params.get('v') && params.get('list') && new URL(url).pathname === '/watch' ? 'video-in-list' : 'list'
		case 'YoutubePlaylist':
			return 'list'
		case 'YoutubeSearchURL':
		case 'YoutubeMusicSearchURL':
			return 'search'
		default:
			return 'any' // truncated, redirect, consent and other non-YouTube readings
	}
}

function arroxyReading(intent: UrlIntent): Reading | 'unknown' {
	switch (intent.kind) {
		case 'obvious-single':
			return 'single'
		case 'mixed':
			return 'video-in-list'
		case 'obvious-collection':
			return intent.collection === 'search' ? 'search' : 'list'
		case 'unknown':
			return 'unknown'
	}
}

// Links Arroxy leaves to yt-dlp ("unknown": no flag, and a list it loads asks on
// its row). Each is a deliberate, safe fallback; a new kind of link yt-dlp adds
// fails the contract until it is read or listed here, with its reason.
const FALLBACKS: readonly {reason: string; matches: (url: URL) => boolean}[] = [
	{reason: 'not a YouTube host Arroxy treats as YouTube (Invidious, youtubekids.com, mirrors)', matches: url => !/(^|\.)youtube(-nocookie)?\.com$|^youtu\.be$/.test(url.hostname)},
	{reason: 'the home page or a feed (/feed/…): yt-dlp loads it as a list, and a list asks on its row', matches: url => url.pathname === '/' || url.pathname.startsWith('/feed/')},
	{reason: 'a legacy channel shortcut (/<name>, /<name>/<tab>), a hashtag, news or course page', matches: url => /^\/(?!watch|playlist|shorts|live|embed|v\/|e\/|clip|results|@|channel|c\/|user|browse)[^/]+(\/[^/]+)?\/?$/.test(url.pathname)},
	{reason: 'a popup or audio-pivot page around a video', matches: url => url.pathname === '/watch_popup' || url.pathname.startsWith('/source/')},
	{reason: 'an HTML-escaped query (`&amp;`) as found in page source, not a link a user copies', matches: url => url.search.includes('&amp;')}
]

// A playlist page that names a video: yt-dlp's tab extractor treats it as a video
// in a list; Arroxy takes the page as a list, which loads the list it shows.
function isPlaylistPageWithVideo(url: URL): boolean {
	return url.pathname === '/playlist' && url.searchParams.has('v')
}

// The shape every video-in-a-list link is probed as. cleanUrl rewrites the
// others (`/shorts/<id>?list=`, `/embed/…`…) to it, since yt-dlp's playlist
// extractor drops the video from them.
const WATCH_SHAPE = snapshot.shapes.find(shape => {
	const url = new URL(shape.url)
	return url.pathname === '/watch' && url.hostname === 'www.youtube.com' && url.searchParams.has('v') && url.searchParams.has('list')
})

function agrees(claim: Claim): {ok: boolean; detail: string} {
	const {cleaned, intent} = arroxyReads(claim.url)
	// Arroxy probes the cleaned address, so that is what yt-dlp must read the same way.
	const expected = cleaned !== claim.url && honoursNoPlaylist(cleaned) && WATCH_SHAPE ? ytDlpReads(WATCH_SHAPE) : ytDlpReads(claim)
	const actual = arroxyReading(intent)
	const detail = `yt-dlp ${claim.extractor ?? 'none'} reads ${expected}; Arroxy reads ${actual} (${cleaned})`
	if (expected === 'any') return {ok: true, detail}
	if (actual === expected) return {ok: true, detail}
	const parsed = new URL(claim.url)
	if (actual === 'unknown' && FALLBACKS.some(fallback => fallback.matches(parsed))) return {ok: true, detail}
	if (expected === 'video-in-list' && actual === 'list' && isPlaylistPageWithVideo(parsed)) return {ok: true, detail}
	return {ok: false, detail}
}

// This video downloads with --no-playlist, which only the watch address (and
// youtu.be, which yt-dlp rewrites to it) honours: any other address carrying a
// list goes to yt-dlp's playlist extractor, which drops the video.
function honoursNoPlaylist(cleaned: string): boolean {
	const url = new URL(cleaned)
	if (url.hostname === 'youtu.be') return url.searchParams.has('list')
	return url.pathname === '/watch' && url.searchParams.has('v') && url.searchParams.has('list')
}

describe(`YouTube URL contract (yt-dlp ${snapshot.ytDlp.version})`, () => {
	it('yt-dlp still takes the watch address of a video in a list as a video it can single out', () => {
		expect(WATCH_SHAPE?.extractor).toBe('YoutubeTab')
	})

	it.each([...snapshot.urls, ...snapshot.shapes].map(claim => [claim.url, claim] as const))('reads %s as yt-dlp does', (_url, claim) => {
		const {ok, detail} = agrees(claim)
		expect(ok, detail).toBe(true)
	})

	it.each([...snapshot.urls, ...snapshot.shapes].map(claim => claim.url))('offers This video on %s only where --no-playlist can take it', url => {
		const {cleaned, intent} = arroxyReads(url)
		if (intent.kind === 'mixed') expect(honoursNoPlaylist(cleaned), cleaned).toBe(true)
	})
})

// Every list id yt-dlp accepts has a kind Arroxy names it by. A prefix yt-dlp
// adds fails here until it is given one.
const LIST_KINDS: Readonly<Record<string, ListKind>> = {PL: 'playlist', LL: 'liked', EC: 'playlist', UU: 'uploads', FL: 'playlist', RD: 'mix', UL: 'playlist', TL: 'playlist', PU: 'uploads', OLAK5uy_: 'album', RDMM: 'mix', WL: 'watch-later', LM: 'liked'}

describe('YouTube list ids', () => {
	it('knows every list id prefix and exact id yt-dlp accepts', () => {
		expect([...snapshot.listIds.prefixes, ...snapshot.listIds.exact].filter(id => !(id in LIST_KINDS))).toEqual([])
	})

	it.each(snapshot.listIds.prefixes)('names a %s… list', prefix => {
		// `LL` + an id is a channel's liked list from before liked lists were one exact id.
		const expected = prefix === 'LL' ? 'playlist' : LIST_KINDS[prefix]
		expect(youtubeListKind(`${prefix}abcdefghijklmnop`)).toBe(expected)
	})

	it.each(snapshot.listIds.exact)('names the %s list', id => {
		expect(youtubeListKind(id)).toBe(LIST_KINDS[id])
	})
})
