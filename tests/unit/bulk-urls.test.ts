import {describe, expect, it} from 'vite-plus/test'
import {classifyBulkUrlKind, deriveBulkUrlLabel, extractYouTubeVideoId, isClearlyIndividualYouTubeUrl, parseBulkUrls} from '@shared/bulkUrls.js'

describe('parseBulkUrls', () => {
	it('parses newline-separated URLs', () => {
		const result = parseBulkUrls('https://example.com/one\nhttps://example.com/two')

		expect(result.accepted.map(item => item.url)).toEqual(['https://example.com/one', 'https://example.com/two'])
		expect(result.rejected).toEqual([])
	})

	it('parses comma, semicolon, pipe, and tab separated URLs', () => {
		const result = parseBulkUrls('https://a.test/1, https://b.test/2; https://c.test/3 | https://d.test/4\thttps://e.test/5')

		expect(result.accepted.map(item => item.url)).toEqual(['https://a.test/1', 'https://b.test/2', 'https://c.test/3', 'https://d.test/4', 'https://e.test/5'])
	})

	it('splits at a comma or semicolon only where the next link starts', () => {
		const result = parseBulkUrls('https://a.test/1,https://b.test/2;https://c.test/3')

		expect(result.accepted.map(item => item.url)).toEqual(['https://a.test/1', 'https://b.test/2', 'https://c.test/3'])
	})

	it('keeps commas and semicolons inside a link', () => {
		const result = parseBulkUrls('https://media.example/clip,part1.mp4\nhttps://media.example/watch?a=1;b=2\nhttps://media.example/video.json;part.mp4')

		expect(result.accepted.map(item => item.url)).toEqual(['https://media.example/clip,part1.mp4', 'https://media.example/watch?a=1;b=2', 'https://media.example/video.json;part.mp4'])
	})

	it('drops a comma or semicolon that ends a link in prose', () => {
		const result = parseBulkUrls('see https://a.test/1, then https://b.test/2; done')

		expect(result.accepted.map(item => item.url)).toEqual(['https://a.test/1', 'https://b.test/2'])
	})

	it('keeps an apostrophe inside a link', () => {
		const result = parseBulkUrls("https://cdn.example/John's-video.mp4")

		expect(result.accepted.map(item => item.url)).toEqual(["https://cdn.example/John's-video.mp4"])
	})

	it('keeps a ! or ? that ends a query value', () => {
		const result = parseBulkUrls('https://example.com/v?token=abc!\nhttps://example.com/watch?q=what?\nsee https://example.com/watch?q=why?.')

		expect(result.accepted.map(item => item.url)).toEqual(['https://example.com/v?token=abc!', 'https://example.com/watch?q=what?', 'https://example.com/watch?q=why?'])
	})

	it('drops a ! or ? that ends a link in prose', () => {
		const result = parseBulkUrls('see https://a.test/1! and https://b.test/2? or https://c.test/3?! then https://d.test/4?b!')

		expect(result.accepted.map(item => item.url)).toEqual(['https://a.test/1', 'https://b.test/2', 'https://c.test/3', 'https://d.test/4?b'])
	})

	// YouTube's ids and values never end in ! or ?, so after a YouTube link they
	// are always the sentence's.
	it('drops a ! or ? after a YouTube link even inside its query', () => {
		const result = parseBulkUrls('can you get https://www.youtube.com/watch?v=dQw4w9WgXcQ? and https://www.youtube.com/playlist?list=PLabcdefghijk!')

		expect(result.accepted.map(item => item.url)).toEqual(['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/playlist?list=PLabcdefghijk'])
	})

	it('drops the quotes around a quoted link', () => {
		const result = parseBulkUrls("'https://a.test/1' and 'https://b.test/watch?q=x!'.")

		expect(result.accepted.map(item => item.url)).toEqual(['https://a.test/1', 'https://b.test/watch?q=x!'])
	})

	it('splits a list of quoted links', () => {
		const result = parseBulkUrls("['https://a.test/1','https://b.test/2', 'https://c.test/3';'https://d.test/4']")

		expect(result.accepted.map(item => item.url)).toEqual(['https://a.test/1', 'https://b.test/2', 'https://c.test/3', 'https://d.test/4'])
	})

	it('ends a link at an apostrophe that opens text after it', () => {
		const result = parseBulkUrls("['https://a.test/1','title'] and check https://b.test/2's review")

		expect(result.accepted.map(item => item.url)).toEqual(['https://a.test/1', 'https://b.test/2'])
	})

	it('ends a YouTube link at an apostrophe, which its ids never hold', () => {
		const result = parseBulkUrls("Watch https://www.youtube.com/watch?v=dQw4w9WgXcQ's intro")

		expect(result.accepted.map(item => item.url)).toEqual(['https://www.youtube.com/watch?v=dQw4w9WgXcQ'])
	})

	it('keeps an apostrophe and a final ? in a YouTube search, which holds free text', () => {
		const result = parseBulkUrls("https://www.youtube.com/results?search_query=don't+stop\nhttps://www.youtube.com/results?search_query=why?")

		expect(result.accepted.map(item => item.url)).toEqual(['https://www.youtube.com/results?search_query=don%27t+stop', 'https://www.youtube.com/results?search_query=why?'])
	})

	// #638: every YouTube search, read by the same test as classifyUrlIntent,
	// holds free text: a trailing slash or YouTube Music's /search is no exception.
	it.each([
		["https://www.youtube.com/results/?search_query=don't+stop", 'https://www.youtube.com/results/?search_query=don%27t+stop'],
		["https://music.youtube.com/search?q=don't+stop", 'https://music.youtube.com/search?q=don%27t+stop'],
		["https://www.youtube.com/results?q=don't+stop", 'https://www.youtube.com/results?q=don%27t+stop'],
		['https://www.youtube.com/results/?search_query=why?', 'https://www.youtube.com/results/?search_query=why?'],
		['https://music.youtube.com/search?q=wow!', 'https://music.youtube.com/search?q=wow!']
	])('keeps the apostrophes and final punctuation of the YouTube search %s', (raw, expected) => {
		expect(parseBulkUrls(raw).accepted.map(item => item.url)).toEqual([expected])
	})

	it("keeps a final 's in a YouTube search's query, and drops it after any other link", () => {
		const result = parseBulkUrls("https://www.youtube.com/results?search_query=it's\nhttps://music.youtube.com/search?q=let's. Then https://www.youtube.com/watch?v=dQw4w9WgXcQ's intro and https://example.com/?q=it's")

		expect(result.accepted.map(item => item.url)).toEqual(['https://www.youtube.com/results?search_query=it%27s', 'https://music.youtube.com/search?q=let%27s', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://example.com/?q=it'])
	})

	it('reads a YouTube search by its whole link, wherever the apostrophe falls', () => {
		const result = parseBulkUrls("https://www.youtube.com/results?utm_campaign=John's+playlist&search_query=cats")

		expect(result.accepted.map(item => item.url)).toEqual(['https://www.youtube.com/results?search_query=cats'])
	})

	it("drops a 's after a search link's closing punctuation", () => {
		const result = parseBulkUrls("(https://www.youtube.com/results?search_query=lofi)'s pick and https://www.youtube.com/results?search_query=jazz.'s")

		expect(result.accepted.map(item => item.url)).toEqual(['https://www.youtube.com/results?search_query=lofi', 'https://www.youtube.com/results?search_query=jazz'])
	})

	// URLSearchParams splits a YouTube search only at `&`: a `;` is query text.
	it("keeps a final 's or ? after a ; in a YouTube search's query", () => {
		const result = parseBulkUrls("https://www.youtube.com/results?search_query=rock;it's https://www.youtube.com/results?search_query=rock;why?")

		expect(result.accepted.map(item => item.url)).toEqual(['https://www.youtube.com/results?search_query=rock;it%27s', 'https://www.youtube.com/results?search_query=rock;why?'])
	})

	it('drops a ! or ? after closing punctuation, even after a query value', () => {
		const result = parseBulkUrls("Seen this (https://vimeo.com/search?q=cats)? and 'https://a.test/?a=b'! and https://b.test/?id=5.!")

		expect(result.accepted.map(item => item.url)).toEqual(['https://vimeo.com/search?q=cats', 'https://a.test/?a=b', 'https://b.test/?id=5'])
	})

	it('dedupes the same link joined by a comma', () => {
		const result = parseBulkUrls('https://vimeo.com/12345,https://vimeo.com/12345')

		expect(result.accepted.map(item => item.url)).toEqual(['https://vimeo.com/12345'])
		expect(result.duplicateCount).toBe(1)
	})

	it('ignores links that do not parse', () => {
		const result = parseBulkUrls('https://:bad\nhttps://vimeo.com/12345\nhttps://?')

		expect(result.accepted.map(item => item.url)).toEqual(['https://vimeo.com/12345'])
		expect(result.invalidCount).toBe(2)
		expect(result.ignoredCount).toBe(2)
	})

	it('extracts URLs from mixed surrounding text', () => {
		const result = parseBulkUrls('first: https://example.com/one (then) paste https://example.com/two.')

		expect(result.accepted.map(item => item.url)).toEqual(['https://example.com/one', 'https://example.com/two'])
	})

	it('dedupes exact cleaned URLs while preserving order', () => {
		const result = parseBulkUrls('https://example.com/one?utm_source=x https://example.com/two https://example.com/one?utm_medium=y')

		expect(result.accepted.map(item => item.url)).toEqual(['https://example.com/one', 'https://example.com/two'])
		expect(result.duplicateCount).toBe(1)
	})

	it('accepts and classifies YouTube playlist, channel, search, and mixed watch URLs', () => {
		const result = parseBulkUrls('https://www.youtube.com/playlist?list=PLtest https://www.youtube.com/@arroxy https://www.youtube.com/results?search_query=arroxy https://www.youtube.com/watch?v=abc123&list=PLtest')

		expect(result.accepted.map(item => item.kind)).toEqual(['playlist', 'channel', 'search', 'mixed'])
		expect(result.rejected).toEqual([])
	})

	it('cleans tracking parameters per URL', () => {
		const result = parseBulkUrls('https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&si=abc')

		expect(result.accepted[0]?.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	})

	it('filters obvious non-media file URLs before probing', () => {
		const result = parseBulkUrls('https://cdn.test/thumb.jpg https://cdn.test/poster.JPEG?size=large https://files.test/report.pdf https://example.com/video https://example.com/video')

		expect(result.accepted.map(item => item.url)).toEqual(['https://example.com/video'])
		expect(result.rejected.map(item => item.reason)).toEqual(['duplicate'])
		expect(result.duplicateCount).toBe(1)
		expect(result.nonMediaCount).toBe(3)
		expect(result.ignoredCount).toBe(4)
	})

	it('keeps direct audio and video file URLs eligible for yt-dlp', () => {
		const result = parseBulkUrls('https://cdn.test/clip.mp4 https://cdn.test/song.mp3 https://stream.test/live.m3u8 https://example.com/images/watch')

		expect(result.accepted.map(item => item.url)).toEqual(['https://cdn.test/clip.mp4', 'https://cdn.test/song.mp3', 'https://stream.test/live.m3u8', 'https://example.com/images/watch'])
		expect(result.nonMediaCount).toBe(0)
	})
})

describe('isClearlyIndividualYouTubeUrl', () => {
	it('accepts watch, short, live, clip, embed, and youtu.be URLs without playlist params', () => {
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/watch?v=abc123')).toBe(true)
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/shorts/abc123')).toBe(true)
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/live/abc123')).toBe(true)
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/clip/clip123')).toBe(true)
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube-nocookie.com/embed/abc123')).toBe(true)
		expect(isClearlyIndividualYouTubeUrl('https://youtu.be/abc123')).toBe(true)
	})

	it('rejects non-YouTube and mixed watch/list URLs as individual YouTube videos', () => {
		expect(isClearlyIndividualYouTubeUrl('https://vimeo.com/123')).toBe(false)
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/watch?v=abc123&list=PLtest')).toBe(false)
	})
})

describe('extractYouTubeVideoId', () => {
	it('derives ids for supported individual YouTube URL shapes', () => {
		expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=abc123')).toBe('abc123')
		expect(extractYouTubeVideoId('https://www.youtube.com/shorts/short123')).toBe('short123')
		expect(extractYouTubeVideoId('https://www.youtube.com/live/live123')).toBe('live123')
		expect(extractYouTubeVideoId('https://www.youtube.com/clip/clip123')).toBeNull()
		expect(extractYouTubeVideoId('https://youtu.be/bee123')).toBe('bee123')
	})

	it('does not derive ids for playlist/channel URLs', () => {
		expect(extractYouTubeVideoId('https://www.youtube.com/playlist?list=PLtest')).toBeNull()
		expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=abc123&list=PLtest')).toBeNull()
		expect(extractYouTubeVideoId('https://www.youtube.com/@arroxy')).toBeNull()
	})
})

describe('classifyBulkUrlKind', () => {
	it.each([
		['https://www.youtube.com/watch?v=abc123', 'single'],
		['https://www.youtube.com/live/abc123', 'single'],
		['https://www.youtube.com/clip/clip123', 'single'],
		['https://www.youtube.com/watch?v=abc123&list=PLtest', 'mixed'],
		// Former Radio links stay single videos in Bulk URLs.
		['https://www.youtube.com/watch?v=abc123&list=RDabc123', 'single'],
		['https://music.youtube.com/watch?v=abc123&list=RDCLAK5uy_abc', 'single'],
		// start_radio is not a tell: with a PL id it is a plain mixed link.
		['https://www.youtube.com/watch?v=abc123&list=PLtest&start_radio=1', 'mixed'],
		['https://www.youtube.com/embed/videoseries?list=PLtest', 'playlist'],
		['https://www.youtube.com/playlist?list=PLtest', 'playlist'],
		['https://www.youtube.com/@arroxy', 'channel'],
		['https://www.youtube.com/results?search_query=arroxy', 'search'],
		['https://vimeo.com/123', 'unknown']
	] as const)('%s -> %s', (url, kind) => {
		expect(classifyBulkUrlKind(url)).toBe(kind)
	})
})

describe('deriveBulkUrlLabel', () => {
	it('uses YouTube video IDs when available', () => {
		expect(deriveBulkUrlLabel('https://www.youtube.com/watch?v=abc123')).toBe('YouTube abc123')
	})

	it('labels a video in a Mix by its id, as before Mix links became ambiguous', () => {
		expect(deriveBulkUrlLabel('https://www.youtube.com/watch?v=abc123&list=RDabc123&start_radio=1')).toBe('YouTube abc123')
		expect(extractYouTubeVideoId('https://music.youtube.com/watch?v=abc123&list=RDCLAK5uy_abc')).toBe('abc123')
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/watch?v=abc123&list=RDabc123')).toBe(true)
	})

	it('derives a host/path label for non-YouTube URLs without query strings', () => {
		expect(deriveBulkUrlLabel('https://example.com/a/b?token=secret')).toBe('example.com/a/b')
	})
})
