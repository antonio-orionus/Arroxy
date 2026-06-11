import {describe, expect, it} from 'vitest'
import {classifyUrlIntent, isMixedUrlIntent, isObviousSingleUrlIntent, urlIntentBulkLabel, urlIntentHomeLabel} from '@shared/urlIntent.js'

describe('classifyUrlIntent', () => {
	it.each([
		['https://www.youtube.com/watch?v=ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://youtu.be/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}],
		['https://www.youtube.com/shorts/ScsahA7OzVo', {kind: 'obvious-single', site: 'youtube'}]
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

	it.each(['https://www.youtube.com/watch?v=abc123&list=PLtest', 'https://www.youtube.com/watch?v=abc123&list=RDabc', 'https://m.youtube.com/watch?list=PLtest&v=abc123'])('%s -> mixed', url => {
		expect(classifyUrlIntent(url)).toEqual({kind: 'mixed', reason: 'youtube-video-with-list', url})
	})

	it.each(['https://vimeo.com/123', 'https://example.com/watch?v=abc&list=PLxyz', 'not a url', ''])('%s -> unknown', url => {
		expect(classifyUrlIntent(url)).toEqual({kind: 'unknown', url})
	})

	it('exposes narrow predicates and display labels from the same model', () => {
		const single = classifyUrlIntent('https://youtu.be/abc123')
		const mixed = classifyUrlIntent('https://www.youtube.com/watch?v=abc123&list=PLtest')
		const playlist = classifyUrlIntent('https://www.youtube.com/playlist?list=PLtest')
		const unknown = classifyUrlIntent('https://vimeo.com/123')

		expect(isObviousSingleUrlIntent(single)).toBe(true)
		expect(isMixedUrlIntent(mixed)).toBe(true)
		expect(urlIntentHomeLabel(playlist)).toBe('Playlist URL')
		expect(urlIntentHomeLabel(mixed)).toBe('Mixed URL')
		expect(urlIntentBulkLabel(single)).toBe('single')
		expect(urlIntentBulkLabel(playlist)).toBe('playlist')
		expect(urlIntentBulkLabel(mixed)).toBe('mixed')
		expect(urlIntentBulkLabel(unknown)).toBe('unknown')
	})
})
