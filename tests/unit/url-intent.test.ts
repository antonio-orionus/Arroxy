import {describe, expect, it} from 'vitest'
import {classifyUrlIntent, deriveUrlIntentLabel, extractUrlIntentYouTubeVideoId, isMixedUrlIntent, isObviousSingleUrlIntent, urlIntentBulkLabel, urlIntentHomeLabel} from '@shared/urlIntent.js'

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
		['https://www.youtube.com/results?search_query=arroxy', 'search']
	] as const)('%s -> obvious collection', (url, collection) => {
		expect(classifyUrlIntent(url)).toMatchObject({kind: 'obvious-collection', collection, url})
	})

	it.each(['https://www.youtube.com/watch?v=abc123&list=PLtest', 'https://www.youtube.com/watch?v=abc123&list=RDabc', 'https://m.youtube.com/watch?list=PLtest&v=abc123', 'https://www.youtube.com/live/ScsahA7OzVo?list=PLtest', 'https://www.youtube.com/clip/Ugkx_123?list=PLtest'])('%s -> mixed', url => {
		expect(classifyUrlIntent(url)).toEqual({kind: 'mixed', reason: 'youtube-video-with-list', url})
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
