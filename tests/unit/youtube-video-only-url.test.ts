import {describe, expect, it} from 'vite-plus/test'
import {youtubeVideoOnlyUrl} from '@shared/sites/youtube.js'

describe('youtubeVideoOnlyUrl', () => {
	it.each([
		['https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx&index=3', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
		['https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&t=42', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42'],
		['https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=RDCLAK5uy_x', 'https://music.youtube.com/watch?v=dQw4w9WgXcQ'],
		['https://youtu.be/dQw4w9WgXcQ?list=PLx', 'https://youtu.be/dQw4w9WgXcQ']
	])('drops the list from %s', (url, expected) => {
		expect(youtubeVideoOnlyUrl(url)).toBe(expected)
	})

	it.each(['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://vimeo.com/123?list=x', 'not a url'])('leaves %s as it is', url => {
		expect(youtubeVideoOnlyUrl(url)).toBe(url)
	})
})
