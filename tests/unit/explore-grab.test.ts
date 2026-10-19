import {describe, expect, it} from 'vite-plus/test'
import {isExploreGrabbable} from '@shared/exploreGrab.js'

describe('isExploreGrabbable', () => {
	it.each(['https://www.youtube.com/watch?v=abc12345678', 'https://www.youtube.com/watch?v=abc12345678&list=PL1', 'https://www.youtube.com/playlist?list=PL1', 'https://www.youtube.com/@channel', 'https://youtu.be/abc12345678'])('takes the YouTube page %s', url => {
		expect(isExploreGrabbable(url)).toBe(true)
	})

	it.each(['https://www.youtube.com/', 'https://www.youtube.com/results?search_query=cats'])('names nothing on the YouTube page %s', url => {
		expect(isExploreGrabbable(url)).toBe(false)
	})

	// yt-dlp decides what another site's page holds: Explore cannot tell a video page from the rest.
	it.each(['https://vimeo.com/123', 'https://example.com/', 'http://example.com/article', 'http://127.0.0.1:4567/explore/home'])('takes the page %s on another site', url => {
		expect(isExploreGrabbable(url)).toBe(true)
	})

	it.each(['', 'about:blank', 'javascript:alert(1)', 'file:///etc/passwd', 'not a url'])('takes nothing from %j', url => {
		expect(isExploreGrabbable(url)).toBe(false)
	})
})
