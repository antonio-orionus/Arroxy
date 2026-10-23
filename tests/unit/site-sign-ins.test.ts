// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'

const logger = vi.hoisted(() => ({debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}))
vi.mock('electron-log/main.js', () => ({default: {...logger, scope: () => logger}}))

import {SiteSignIns} from '@main/services/SiteSignIns.js'
import {parseSuspectSignInMarks} from '@main/stores/SuspectSignInStore.js'
import type {ExploreCookie} from '@shared/sites/types.js'

function cookie(name: string, value: string, domain: string): ExploreCookie {
	return {name, value, domain, hostOnly: false, path: '/', secure: true, httpOnly: true, session: true}
}

describe('SiteSignIns: which listed sites the Explore session is signed in to', () => {
	it('reads each site’s sign-in cookie and keeps only a fingerprint (hash) of it', async () => {
		let jar = [cookie('sessionid', 'secret-1', '.instagram.com'), cookie('csrftoken', 'x', '.x.com')]
		const signIns = new SiteSignIns({readCookies: () => Promise.resolve(jar)})
		await signIns.refresh()

		expect(signIns.signedIn('instagram')).toBe(true)
		expect(signIns.signedIn('x')).toBe(false)
		const fingerprint = signIns.cookieFingerprint('instagram')
		expect(fingerprint).toMatch(/^[0-9a-f]{16}$/)
		expect(fingerprint).not.toContain('secret')

		jar = [cookie('sessionid', 'secret-2', '.instagram.com')]
		await signIns.refresh()
		expect(signIns.cookieFingerprint('instagram')).not.toBe(fingerprint)
	})

	it('tells listeners which site’s sign-in changed', async () => {
		let jar = [cookie('sessionid', 'a', '.instagram.com')]
		const signIns = new SiteSignIns({readCookies: () => Promise.resolve(jar)})
		await signIns.refresh()
		const listener = vi.fn()
		signIns.onChange(listener)

		jar = [cookie('sessionid', 'b', '.instagram.com'), cookie('auth_token', 't', '.x.com')]
		await signIns.refresh()
		expect(listener.mock.calls.map(call => String(call[0])).sort((a, b) => a.localeCompare(b))).toEqual(['instagram', 'x'])
		await signIns.refresh()
		expect(listener).toHaveBeenCalledTimes(2)
	})

	it('counts as signed out when the cookies cannot be read', async () => {
		const signIns = new SiteSignIns({readCookies: () => Promise.reject(new Error('no session'))})
		await signIns.refresh()
		expect(signIns.signedIn('instagram')).toBe(false)
	})
})

describe('parseSuspectSignInMarks', () => {
	it('keeps well-formed marks and drops the rest', () => {
		const good = {site: 'x', cookieFingerprint: 'abc', since: '2026-10-23T00:00:00.000Z', evidence: 'accountWall'}
		expect(parseSuspectSignInMarks([good, {site: 'y'}, 'junk'])).toEqual([good])
		expect(parseSuspectSignInMarks('junk')).toEqual([])
	})
})
