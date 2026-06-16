import {describe, expect, it} from 'vitest'
import {collectionKindForWizard, collectionKindForWizardUrls} from '@renderer/store/wizard/collectionKind.js'

describe('collectionKindForWizard', () => {
	it.each([
		['https://www.youtube.com/@arroxy', 'channel'],
		['https://www.youtube.com/channel/UC123/videos', 'channel']
	] as const)('returns channel for %s', (url, expected) => {
		expect(collectionKindForWizard(url)).toBe(expected)
	})

	it('returns search for YouTube search results', () => {
		expect(collectionKindForWizard('https://www.youtube.com/results?search_query=arroxy')).toBe('search')
	})

	it('returns playlist for explicit playlist URLs', () => {
		expect(collectionKindForWizard('https://www.youtube.com/playlist?list=PLtest')).toBe('playlist')
	})

	it('keeps the original channel intent when yt-dlp reports a playlist webpage URL', () => {
		expect(collectionKindForWizardUrls('https://www.youtube.com/@arroxy/videos', 'https://www.youtube.com/playlist?list=PLtest')).toBe('channel')
	})

	it.each(['https://vimeo.com/123', 'not a url', ''] as const)('returns null for non-YouTube or unknown URL: %s', url => {
		expect(collectionKindForWizard(url)).toBeNull()
	})
})
