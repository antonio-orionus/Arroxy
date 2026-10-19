import {describe, expect, it} from 'vite-plus/test'
import {requestSiteFor, siteById, siteForExtractor, siteForJob, siteForUrl} from '@shared/sites/index.js'
import {youtubeSite} from '@shared/sites/youtube.js'
import type {ExploreCookie} from '@shared/sites/types.js'

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

const cookie = (name: string, domain = '.youtube.com'): ExploreCookie => ({name, value: 'v', domain, hostOnly: false, path: '/', secure: true, httpOnly: true, session: false})

describe('siteById', () => {
	it('returns the adapter for a site id', () => {
		expect(siteById('youtube')).toBe(youtubeSite)
		expect(siteById('generic').id).toBe('generic')
		expect(siteById('generic').explore).toBeUndefined()
	})
})

describe('youtubeSite.explore', () => {
	it('limits jars to youtube.com', () => {
		expect(youtubeSite.explore?.cookieDomains).toEqual(['youtube.com'])
	})

	it('needs LOGIN_INFO plus a SAPISID-family cookie, as yt-dlp does', () => {
		const signedIn = youtubeSite.explore!.isSignedIn
		expect(signedIn([cookie('LOGIN_INFO'), cookie('SAPISID')])).toBe(true)
		expect(signedIn([cookie('LOGIN_INFO'), cookie('__Secure-3PAPISID')])).toBe(true)
		expect(signedIn([cookie('SAPISID')])).toBe(false)
		expect(signedIn([cookie('LOGIN_INFO')])).toBe(false)
		expect(signedIn([cookie('LOGIN_INFO', '.google.com'), cookie('SAPISID', '.google.com')])).toBe(false)
	})
})

describe('requestSiteFor', () => {
	it('keeps one rate-limit cooldown for all of YouTube', () => {
		expect(requestSiteFor(YT_URL)).toBe('youtube')
		expect(requestSiteFor('https://youtu.be/k1qBgIw8fAQ')).toBe('youtube')
		expect(requestSiteFor('https://music.youtube.com/watch?v=k1qBgIw8fAQ')).toBe('youtube')
	})

	it('keeps any other site apart by its hostname', () => {
		expect(requestSiteFor('https://www.vimeo.com/12345')).toBe('vimeo.com')
		expect(requestSiteFor('https://player.vimeo.com/video/1')).toBe('player.vimeo.com')
		expect(requestSiteFor('not a url')).toBe('unknown')
	})
})
