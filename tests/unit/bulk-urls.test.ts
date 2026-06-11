import {describe, expect, it} from 'vitest'
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
	it('accepts watch, short, and youtu.be URLs without playlist params', () => {
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/watch?v=abc123')).toBe(true)
		expect(isClearlyIndividualYouTubeUrl('https://www.youtube.com/shorts/abc123')).toBe(true)
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
		['https://www.youtube.com/watch?v=abc123&list=PLtest', 'mixed'],
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

	it('derives a host/path label for non-YouTube URLs without query strings', () => {
		expect(deriveBulkUrlLabel('https://example.com/a/b?token=secret')).toBe('example.com/a/b')
	})
})
