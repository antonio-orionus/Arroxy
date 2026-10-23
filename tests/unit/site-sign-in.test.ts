// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import {siteSignInCookie, siteSignInPolicy} from '@shared/sites/siteSignIn.js'
import type {ExploreCookie} from '@shared/sites/types.js'

const NOW = Date.UTC(2026, 9, 23) / 1000

function cookie(overrides: Partial<ExploreCookie>): ExploreCookie {
	return {name: 'sessionid', value: 'v', domain: '.instagram.com', hostOnly: false, path: '/', secure: true, httpOnly: true, session: false, expirationDate: NOW + 3600, ...overrides}
}

describe('siteSignInPolicy', () => {
	it('starts Instagram and X signed in, and every other site when needed', () => {
		expect(siteSignInPolicy('instagram')).toBe('first')
		expect(siteSignInPolicy('x')).toBe('first')
		expect(siteSignInPolicy('youtube')).toBe('whenNeeded')
		expect(siteSignInPolicy('vimeo.com')).toBe('whenNeeded')
	})
})

describe('siteSignInCookie: the site’s own sign-in cookie, present', () => {
	it('finds Instagram’s session cookie', () => {
		expect(siteSignInCookie([cookie({})], 'instagram', NOW)?.name).toBe('sessionid')
	})

	it('finds X’s cookie when it is sent to the API host, whatever the link was', () => {
		expect(siteSignInCookie([cookie({name: 'auth_token', domain: '.x.com'})], 'x', NOW)?.name).toBe('auth_token')
		expect(siteSignInCookie([cookie({name: 'auth_token', domain: 'x.com', hostOnly: true})], 'x', NOW)).toBeNull()
	})

	it('ignores other cookies, an empty value, an expired one, and one for another host', () => {
		expect(siteSignInCookie([cookie({name: 'csrftoken'})], 'instagram', NOW)).toBeNull()
		expect(siteSignInCookie([cookie({value: ''})], 'instagram', NOW)).toBeNull()
		expect(siteSignInCookie([cookie({expirationDate: NOW - 1})], 'instagram', NOW)).toBeNull()
		expect(siteSignInCookie([cookie({domain: '.notinstagram.com'})], 'instagram', NOW)).toBeNull()
	})

	it('counts a session cookie, which has no expiry', () => {
		expect(siteSignInCookie([cookie({session: true, expirationDate: undefined})], 'instagram', NOW)?.name).toBe('sessionid')
	})

	it('has no sign-in cookie for a site without a row', () => {
		expect(siteSignInCookie([cookie({domain: '.vimeo.com', name: 'vimeo'})], 'vimeo.com', NOW)).toBeNull()
	})
})
