// @vitest-environment jsdom
import {describe, expect, it} from 'vitest'
import {rewriteYouTubeChannelRoot, isMixedYouTubeUrl} from '@renderer/store/wizard/urlIntake.js'

describe('rewriteYouTubeChannelRoot — appends /videos to bare channel-root URLs', () => {
	it('rewrites /@handle → /@handle/videos', () => {
		expect(rewriteYouTubeChannelRoot('https://www.youtube.com/@bluebellhillcrafts')).toBe('https://www.youtube.com/@bluebellhillcrafts/videos')
	})

	it('rewrites /channel/UC... → /channel/UC.../videos', () => {
		expect(rewriteYouTubeChannelRoot('https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv')).toBe('https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv/videos')
	})

	it('rewrites /c/CustomName → /c/CustomName/videos', () => {
		expect(rewriteYouTubeChannelRoot('https://www.youtube.com/c/CustomName')).toBe('https://www.youtube.com/c/CustomName/videos')
	})

	it('rewrites /user/OldName → /user/OldName/videos', () => {
		expect(rewriteYouTubeChannelRoot('https://www.youtube.com/user/OldName')).toBe('https://www.youtube.com/user/OldName/videos')
	})

	it.each([
		'https://www.youtube.com/@handle/videos',
		'https://www.youtube.com/@handle/shorts',
		'https://www.youtube.com/@handle/streams',
		'https://www.youtube.com/@handle/playlists',
		'https://www.youtube.com/@handle/about',
		'https://www.youtube.com/@handle/community',
		'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv/videos',
		'https://www.youtube.com/c/CustomName/playlists'
	])('leaves %s unchanged (already has explicit tab)', url => {
		expect(rewriteYouTubeChannelRoot(url)).toBe(url)
	})

	it.each(['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/playlist?list=PLabc', 'https://www.youtube.com/results?search_query=python'])('leaves non-channel YouTube URL unchanged: %s', url => {
		expect(rewriteYouTubeChannelRoot(url)).toBe(url)
	})

	it.each(['https://vimeo.com/123', 'https://www.pornhub.com/channels/povd/videos', 'https://music.youtube.com/browse/UCabcdefghijklmnopqrstuv'])('leaves non-YouTube-com host unchanged: %s', url => {
		expect(rewriteYouTubeChannelRoot(url)).toBe(url)
	})

	it('returns malformed URLs unchanged (no throw)', () => {
		expect(rewriteYouTubeChannelRoot('not a url')).toBe('not a url')
		expect(rewriteYouTubeChannelRoot('')).toBe('')
	})
})

describe('isMixedYouTubeUrl — detects ?v= AND ?list= on YouTube hosts', () => {
	it.each(['https://www.youtube.com/watch?v=abc&list=PLxyz', 'https://www.youtube.com/watch?v=abc&list=RDabc', 'https://www.youtube.com/watch?list=PLxyz&v=abc', 'https://m.youtube.com/watch?v=abc&list=PLxyz'])('returns true for mixed URL: %s', url => {
		expect(isMixedYouTubeUrl(url)).toBe(true)
	})

	it.each(['https://www.youtube.com/watch?v=abc', 'https://www.youtube.com/playlist?list=PLxyz', 'https://www.youtube.com/@handle', 'https://www.youtube.com/results?search_query=x'])('returns false for single-param YT URL: %s', url => {
		expect(isMixedYouTubeUrl(url)).toBe(false)
	})

	it('returns false for mixed-shape URL on non-YT host', () => {
		expect(isMixedYouTubeUrl('https://vimeo.com/watch?v=abc&list=PLxyz')).toBe(false)
		expect(isMixedYouTubeUrl('https://example.com/watch?v=abc&list=PLxyz')).toBe(false)
	})

	it('returns false for malformed URL', () => {
		expect(isMixedYouTubeUrl('not a url')).toBe(false)
		expect(isMixedYouTubeUrl('')).toBe(false)
	})
})
