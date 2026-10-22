import {describe, expect, it} from 'vite-plus/test'
import {classifyBulkUrlIntent, classifyUrlIntent, deriveUrlIntentLabel, extractUrlIntentYouTubeVideoId, isMixedUrlIntent, isObviousSingleUrlIntent, urlIntentBulkLabel, urlIntentHomeLabel, videoListKind} from '@shared/urlIntent.js'

describe('classifyUrlIntent', () => {
	it.each([
		['https://www.youtube.com/watch?v=ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://youtu.be/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube.com/shorts/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube.com/live/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://m.youtube.com/live/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube.com/clip/Ugkx_1234567890abcdef', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube.com/embed/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube-nocookie.com/embed/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://youtube-nocookie.com/embed/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube.com/v/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube.com/e/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}]
	] as const)('%s -> obvious single', (url, expected) => {
		expect(classifyUrlIntent(url)).toMatchObject({...expected, url})
	})

	it.each([
		['https://www.youtube.com/playlist?list=PLtest', 'playlist'],
		['https://www.youtube.com/@arroxy', 'channel'],
		['https://www.youtube.com/channel/UC123/videos', 'channel'],
		['https://www.youtube.com/results?search_query=arroxy', 'search'],
		['https://www.youtube.com/results/?search_query=arroxy', 'search'],
		// yt-dlp's search extractors also take `q=`, `/search` and YouTube Music's search (#638).
		['https://www.youtube.com/results?q=arroxy', 'search'],
		['https://www.youtube.com/search?q=arroxy', 'search'],
		['https://music.youtube.com/search?q=arroxy', 'search']
	] as const)('%s -> obvious collection', (url, collection) => {
		expect(classifyUrlIntent(url)).toMatchObject({kind: 'obvious-collection', collection, url})
	})

	it.each(['https://www.youtube.com/watch?v=abc123&list=PLtest', 'https://m.youtube.com/watch?list=PLtest&v=abc123', 'https://www.youtube.com/live/ScsahA7OzVo?list=PLtest'])('%s -> mixed', url => {
		expect(classifyUrlIntent(url)).toEqual({kind: 'mixed', reason: 'youtube-video-with-list', url})
	})

	// yt-dlp's clip extractor takes a clip link and ignores its list, so the list
	// cannot be offered from it.
	it('reads a clip link as the clip, list or not', () => {
		const url = 'https://www.youtube.com/clip/UgkxU2HSeGL_NvmDJ-nQJrlLwllwMDBdGZFs?list=PLtest'
		expect(classifyUrlIntent(url)).toEqual({kind: 'obvious-single', site: 'youtube', url})
		expect(videoListKind(url)).toBeNull()
	})

	// A link that names a video and a list is ambiguous whatever the list: a Mix
	// (`RD…`; `start_radio` says nothing yt-dlp reads) and a YouTube Music
	// playlist (`RDCLAK…`) included. Each entry point decides what to do with it.
	it.each([
		['https://www.youtube.com/watch?v=abc123&list=PLtest', 'playlist'],
		['https://www.youtube.com/watch?v=abc123&list=RDabc123', 'mix'],
		['https://www.youtube.com/watch?v=abc123&list=RDMMabc123', 'mix'],
		['https://www.youtube.com/watch?v=abc123&list=RDAMVMabc123', 'mix'],
		['https://music.youtube.com/watch?v=abc123&list=RDCLAK5uy_abc', 'playlist'],
		['https://music.youtube.com/watch?v=abc123&list=OLAK5uy_abc', 'album'],
		['https://www.youtube.com/watch?v=abc123&list=UUabc', 'uploads'],
		['https://www.youtube.com/watch?v=abc123&list=WL&index=2', 'watch-later'],
		['https://www.youtube.com/watch?v=abc123&list=LL', 'liked'],
		['https://www.youtube.com/watch?v=abc123&list=FLabc', 'playlist'],
		['https://www.youtube.com/watch?v=abc123&list=RDabc123&start_radio=1', 'mix'],
		['https://www.youtube.com/watch?v=abc123&list=PLtest&start_radio=1', 'playlist'],
		['https://www.youtube.com/watch?v=abc123&list=LM', 'liked'],
		['https://www.youtube.com/watch?v=abc123&list=PUabc', 'uploads'],
		['https://youtu.be/abc123?list=RDabc123', 'mix'],
		['https://www.youtube.com/shorts/abc123?list=PLtest', 'playlist']
	] as const)('%s -> mixed, naming a %s', (url, kind) => {
		expect(classifyUrlIntent(url)).toEqual({kind: 'mixed', reason: 'youtube-video-with-list', url})
		expect(videoListKind(url)).toBe(kind)
	})

	it.each(['https://www.youtube.com/watch?v=abc123', 'https://www.youtube.com/playlist?list=PLtest', 'https://www.youtube.com/playlist?list=RDabc123', 'https://www.youtube.com/@arroxy', 'https://vimeo.com/123?list=PLtest', 'https://example.com/watch?v=abc&list=PLxyz', 'not a url', ''])(
		'%s names no video in a list',
		url => {
			expect(videoListKind(url)).toBeNull()
		}
	)

	it('still treats a radio list with no video behind it as a collection', () => {
		expect(classifyUrlIntent('https://www.youtube.com/playlist?list=RDabc123')).toMatchObject({kind: 'obvious-collection', collection: 'playlist'})
	})

	it.each(['https://vimeo.com/123', 'https://example.com/watch?v=abc&list=PLxyz', 'https://www.youtube.com/live', 'https://www.youtube.com/clip', 'https://www.youtube.com/embed/videoseries', 'not a url', ''])('%s -> unknown', url => {
		expect(classifyUrlIntent(url)).toEqual({kind: 'unknown', url})
	})

	it('reads the playlist embed player as a playlist, not as a video called videoseries', () => {
		// `/embed/videoseries?list=…` has the shape of a video embed but no video
		// behind it — treating it as a single would queue a download of nothing.
		expect(classifyUrlIntent('https://www.youtube.com/embed/videoseries?list=PLtest')).toEqual({kind: 'obvious-collection', url: 'https://www.youtube.com/embed/videoseries?list=PLtest', collection: 'playlist'})
	})

	it('extracts video ids across every id-bearing URL shape', () => {
		const id = (url: string): string | null => extractUrlIntentYouTubeVideoId(classifyUrlIntent(url))

		expect(id('https://www.youtube.com/watch?v=ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://youtu.be/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://www.youtube.com/shorts/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://www.youtube.com/live/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://www.youtube.com/embed/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://www.youtube-nocookie.com/embed/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://www.youtube.com/v/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://www.youtube.com/e/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(id('https://www.youtube.com/playlist?list=PLtest')).toBeNull()
		expect(id('https://www.youtube.com/@arroxy')).toBeNull()
	})

	it('does not mistake a clip slug for a video id', () => {
		// A clip is still one downloadable thing, but `Ugkx…` names the clip, not the
		// video — the real id only comes back from the probe.
		const clip = classifyUrlIntent('https://www.youtube.com/clip/Ugkx_1234567890abcdef')

		expect(isObviousSingleUrlIntent(clip)).toBe(true)
		expect(extractUrlIntentYouTubeVideoId(clip)).toBeNull()
	})

	it('derives readable labels with and without a video id', () => {
		expect(deriveUrlIntentLabel('https://www.youtube.com/live/ScsahA7OzVo')).toBe('YouTube ScsahA7OzVo')
		expect(deriveUrlIntentLabel('https://www.youtube.com/clip/Ugkx_123')).toBe('www.youtube.com/clip/Ugkx_123')
	})

	it('exposes narrow predicates and display labels from the same model', () => {
		const single = classifyUrlIntent('https://youtu.be/abc123')
		const live = classifyUrlIntent('https://www.youtube.com/live/ScsahA7OzVo')
		const clip = classifyUrlIntent('https://www.youtube.com/clip/Ugkx_123')
		const mixed = classifyUrlIntent('https://www.youtube.com/watch?v=abc123&list=PLtest')
		const playlist = classifyUrlIntent('https://www.youtube.com/playlist?list=PLtest')
		const unknown = classifyUrlIntent('https://vimeo.com/123')

		expect(isObviousSingleUrlIntent(single)).toBe(true)
		expect(isObviousSingleUrlIntent(live)).toBe(true)
		expect(isObviousSingleUrlIntent(clip)).toBe(true)
		expect(isMixedUrlIntent(mixed)).toBe(true)
		expect(urlIntentHomeLabel(playlist)).toBe('Playlist URL')
		expect(urlIntentHomeLabel(mixed)).toBe('Mixed URL')
		expect(urlIntentBulkLabel(single)).toBe('single')
		expect(urlIntentBulkLabel(live)).toBe('single')
		expect(urlIntentBulkLabel(clip)).toBe('single')
		expect(urlIntentBulkLabel(playlist)).toBe('playlist')
		expect(urlIntentBulkLabel(mixed)).toBe('mixed')
		expect(urlIntentBulkLabel(unknown)).toBe('unknown')
	})
})

// Bulk URLs is out of scope for the video-or-list question: every link that was
// Radio before (`RD…`, `RDCLAK…` included) stays one video
// there, with its id and "YouTube <id>" label, and a plain mixed link keeps
// diverting the batch to the Bulk review.
describe('classifyBulkUrlIntent', () => {
	it.each(['https://www.youtube.com/watch?v=abc123&list=RDabc123', 'https://music.youtube.com/watch?v=abc123&list=RDCLAK5uy_abc', 'https://youtu.be/abc123?list=RDabc123'])('%s stays a single video', url => {
		expect(classifyBulkUrlIntent(url)).toEqual({kind: 'obvious-single', site: 'youtube', url})
		expect(extractUrlIntentYouTubeVideoId(classifyBulkUrlIntent(url))).toBe('abc123')
		expect(deriveUrlIntentLabel(url)).toBe('YouTube abc123')
	})

	it('keeps a plain mixed link mixed, with no id and a path label', () => {
		const url = 'https://www.youtube.com/watch?v=abc123&list=PLtest'
		expect(classifyBulkUrlIntent(url)).toEqual({kind: 'mixed', reason: 'youtube-video-with-list', url})
		expect(extractUrlIntentYouTubeVideoId(classifyBulkUrlIntent(url))).toBeNull()
		expect(deriveUrlIntentLabel(url)).toBe('www.youtube.com/watch')
	})

	it('reads every other link as classifyUrlIntent does', () => {
		for (const url of ['https://www.youtube.com/watch?v=abc123', 'https://www.youtube.com/playlist?list=RDabc123', 'https://vimeo.com/123']) expect(classifyBulkUrlIntent(url)).toEqual(classifyUrlIntent(url))
	})
})
