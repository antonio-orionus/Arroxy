import {describe, expect, it} from 'vite-plus/test'
import {exploreCookieScopeFor, exploreScopeSignedIn, inExploreCookieScope, type ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {ExploreCookie} from '@shared/sites/types.js'

function cookie(domain: string, name = 'sid', extra: Partial<ExploreCookie> = {}): ExploreCookie {
	return {name, value: 'v', domain, hostOnly: !domain.startsWith('.'), path: '/', secure: true, httpOnly: true, session: false, ...extra}
}

const YOUTUBE: ExploreCookieScope = {kind: 'site', siteId: 'youtube'}

describe('exploreCookieScopeFor', () => {
	it.each(['https://www.youtube.com/watch?v=abc', 'https://youtu.be/abc', 'https://music.youtube.com/'])('gives the YouTube page %s the site scope', url => {
		expect(exploreCookieScopeFor(url)).toEqual(YOUTUBE)
	})

	it.each([
		['https://vimeo.com/123', 'vimeo.com'],
		['https://WWW.Example.com./a', 'www.example.com'],
		['http://127.0.0.1:4567/x', '127.0.0.1']
	])('gives the page %s on another site the web scope of its host', (url, host) => {
		expect(exploreCookieScopeFor(url)).toEqual({kind: 'web', host})
	})

	it.each(['', 'not a url', 'file:///etc/passwd', 'javascript:alert(1)', 'ftp://example.com/x'])('gives %j no scope', url => {
		expect(exploreCookieScopeFor(url)).toBeNull()
	})
})

describe('inExploreCookieScope', () => {
	it('keeps only youtube.com cookies in the YouTube scope', () => {
		expect(inExploreCookieScope(cookie('.youtube.com'), YOUTUBE)).toBe(true)
		expect(inExploreCookieScope(cookie('accounts.youtube.com'), YOUTUBE)).toBe(true)
		expect(inExploreCookieScope(cookie('.google.com'), YOUTUBE)).toBe(false)
		expect(inExploreCookieScope(cookie('.vimeo.com'), YOUTUBE)).toBe(false)
	})

	// Google's and YouTube's account cookies carry the whole Google account: never in another site's jar.
	it.each(['.google.com', 'accounts.google.com', '.google.co.uk', '.google.com.br', '.google.de', '.youtube.com', 'www.youtube.com'])('leaves the account cookie on %s out of the web scope', domain => {
		expect(inExploreCookieScope(cookie(domain), {kind: 'web', host: 'vimeo.com'})).toBe(false)
	})

	it.each(['.vimeo.com', 'vimeo.com', '.vimeocdn.com', '.x.com', 'api.example.org', '.googleusercontent.com', '.notgoogle.com'])('keeps the cookie on %s in the web scope', domain => {
		expect(inExploreCookieScope(cookie(domain), {kind: 'web', host: 'vimeo.com'})).toBe(true)
	})
})

describe('exploreScopeSignedIn', () => {
	it('asks the site in the YouTube scope', () => {
		expect(exploreScopeSignedIn([cookie('.youtube.com', 'LOGIN_INFO'), cookie('.youtube.com', 'SAPISID')], YOUTUBE)).toBe(true)
		expect(exploreScopeSignedIn([cookie('.youtube.com', 'PREF')], YOUTUBE)).toBe(false)
		expect(exploreScopeSignedIn([cookie('.google.com', 'LOGIN_INFO'), cookie('.google.com', 'SAPISID')], YOUTUBE)).toBe(false)
	})

	it('counts the web scope signed in when the session holds a cookie the host would be sent', () => {
		const vimeo = {kind: 'web', host: 'vimeo.com'} as const
		expect(exploreScopeSignedIn([cookie('.vimeo.com')], vimeo)).toBe(true)
		expect(exploreScopeSignedIn([cookie('vimeo.com')], vimeo)).toBe(true)
		expect(exploreScopeSignedIn([cookie('.vimeo.com')], {kind: 'web', host: 'player.vimeo.com'})).toBe(true)
		// A host-only cookie is sent to its own host alone.
		expect(exploreScopeSignedIn([cookie('vimeo.com')], {kind: 'web', host: 'player.vimeo.com'})).toBe(false)
		expect(exploreScopeSignedIn([cookie('player.vimeo.com')], vimeo)).toBe(false)
		expect(exploreScopeSignedIn([cookie('.othervimeo.com')], vimeo)).toBe(false)
		expect(exploreScopeSignedIn([], vimeo)).toBe(false)
	})

	it('never counts a Google page signed in from Google cookies, which stay out of its jar', () => {
		expect(exploreScopeSignedIn([cookie('.google.com')], {kind: 'web', host: 'drive.google.com'})).toBe(false)
	})
})
