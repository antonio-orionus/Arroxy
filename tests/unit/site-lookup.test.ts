import {describe, expect, it} from 'vitest'
import {siteForExtractor, siteForJob, siteForUrl} from '@shared/sites/index.js'

const YT_URL = 'https://www.youtube.com/watch?v=k1qBgIw8fAQ'

describe('siteForJob', () => {
	it('prefers the extractor when it names a YouTube family member', () => {
		expect(siteForJob('youtube:tab', 'https://vimeo.com/12345').id).toBe('youtube')
	})

	// The reason this helper exists: a renderer-supplied extractor can be empty
	// (a mixed bulk batch resolves to ''), which used to degrade straight to the
	// generic adapter and silently disable every YouTube-only behavior.
	it.each(['', undefined, null])('falls back to the URL when the extractor is %o', extractor => {
		expect(siteForJob(extractor, YT_URL).id).toBe('youtube')
		expect(siteForExtractor(extractor).id).toBe('generic')
	})

	// yt-dlp's verdict on what produced the media outranks a hostname that a
	// redirect or stale metadata made disagree.
	it('keeps a present non-YouTube extractor authoritative over the URL', () => {
		expect(siteForJob('vimeo', YT_URL).id).toBe('generic')
		expect(siteForJob('   ', YT_URL).id).toBe('youtube')
	})

	it('stays generic when neither extractor nor URL is YouTube', () => {
		expect(siteForJob('vimeo', 'https://vimeo.com/12345').id).toBe('generic')
		expect(siteForJob('', 'not a url').id).toBe('generic')
	})

	it('agrees with siteForUrl on the fallback path', () => {
		expect(siteForJob('', 'https://youtu.be/k1qBgIw8fAQ')).toBe(siteForUrl('https://youtu.be/k1qBgIw8fAQ'))
	})
})
