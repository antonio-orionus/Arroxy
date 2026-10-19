import {describe, expect, it} from 'vite-plus/test'
import {resolveCookies} from '@main/services/cookiesResolver.js'
import {defaultAppSettings} from '@shared/constants.js'
import {COOKIES_MODES, JOB_AUTHS} from '@shared/schemas.js'
import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {AppSettings} from '@shared/types.js'

const YOUTUBE: ExploreCookieScope = {kind: 'site', siteId: 'youtube'}
const VIMEO: ExploreCookieScope = {kind: 'web', host: 'vimeo.com'}

function settings(common: Partial<AppSettings['common']>): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, rememberLastOutputDir: true, clipboardWatchEnabled: false, ...common}}
}

describe('resolveCookies', () => {
	it('returns null when mode is off', () => {
		expect(resolveCookies(settings({cookiesMode: 'off', cookiesPath: '/x.txt', cookiesBrowser: 'firefox'}), 'anonymous', YOUTUBE)).toBeNull()
	})

	it('returns null when mode is undefined', () => {
		expect(resolveCookies(settings({cookiesPath: '/x.txt'}), 'anonymous', YOUTUBE)).toBeNull()
	})

	it('returns file variant when mode=file and path is non-empty', () => {
		expect(resolveCookies(settings({cookiesMode: 'file', cookiesPath: '/x.txt'}), 'anonymous', YOUTUBE)).toEqual({kind: 'file', path: '/x.txt'})
	})

	it('returns null when mode=file but path is empty', () => {
		expect(resolveCookies(settings({cookiesMode: 'file', cookiesPath: ''}), 'anonymous', YOUTUBE)).toBeNull()
		expect(resolveCookies(settings({cookiesMode: 'file'}), 'anonymous', YOUTUBE)).toBeNull()
	})

	it('returns browser variant when mode=browser and browser is set', () => {
		expect(resolveCookies(settings({cookiesMode: 'browser', cookiesBrowser: 'firefox'}), 'anonymous', YOUTUBE)).toEqual({kind: 'browser', browser: 'firefox'})
	})

	it('returns null when mode=browser but browser is unset', () => {
		expect(resolveCookies(settings({cookiesMode: 'browser'}), 'anonymous', YOUTUBE)).toBeNull()
	})

	it('ignores path when mode=browser', () => {
		expect(resolveCookies(settings({cookiesMode: 'browser', cookiesBrowser: 'chrome', cookiesPath: '/x.txt'}), 'anonymous', YOUTUBE)).toEqual({kind: 'browser', browser: 'chrome'})
	})
})

describe('resolveCookies under explore mode', () => {
	it('is anonymous for an anonymous job', () => {
		expect(resolveCookies(settings({cookiesMode: 'explore'}), 'anonymous', YOUTUBE)).toBeNull()
	})

	it('uses the Explore session for an escalated job', () => {
		expect(resolveCookies(settings({cookiesMode: 'explore'}), 'exploreSession', YOUTUBE)).toEqual({kind: 'session', scope: YOUTUBE})
	})

	it('never falls through to --cookies-from-browser for a leftover browser setting', () => {
		expect(resolveCookies(settings({cookiesMode: 'explore', cookiesBrowser: 'firefox'}), 'anonymous', YOUTUBE)).toBeNull()
	})

	it('ignores an escalated job once the mode is no longer explore', () => {
		expect(resolveCookies(settings({cookiesMode: 'off'}), 'exploreSession', YOUTUBE)).toBeNull()
		expect(resolveCookies(settings({cookiesMode: 'file', cookiesPath: '/c.txt'}), 'exploreSession', YOUTUBE)).toEqual({kind: 'file', path: '/c.txt'})
	})

	it('uses the Explore session for an escalated job on another site', () => {
		expect(resolveCookies(settings({cookiesMode: 'explore'}), 'exploreSession', VIMEO)).toEqual({kind: 'session', scope: VIMEO})
	})

	it('never escalates a URL with no cookie scope', () => {
		expect(resolveCookies(settings({cookiesMode: 'explore'}), 'exploreSession', null)).toBeNull()
	})
})

describe('cookie identity enums', () => {
	it('lists every cookie mode and job auth the resolver switches over', () => {
		expect(COOKIES_MODES).toEqual(['off', 'file', 'browser', 'explore'])
		expect(JOB_AUTHS).toEqual(['anonymous', 'exploreSession'])
	})
})
