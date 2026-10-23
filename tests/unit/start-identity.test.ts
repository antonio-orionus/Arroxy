// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import {decideStartIdentity, type StartIdentityInputs} from '@main/services/startIdentity.js'

function inputs(overrides: Partial<StartIdentityInputs> = {}): StartIdentityInputs {
	return {cookiesMode: 'explore', exploreEnabled: true, signedIn: () => true, suspect: () => false, ...overrides}
}

describe('decideStartIdentity', () => {
	it('starts a link on a site whose policy is first signed in, by the site’s default', () => {
		expect(decideStartIdentity('https://www.instagram.com/reel/a', inputs())).toEqual({site: 'instagram', auth: 'exploreSession', basis: 'siteDefault'})
		expect(decideStartIdentity('https://twitter.com/u/status/1', inputs())).toEqual({site: 'x', auth: 'exploreSession', basis: 'siteDefault'})
	})

	it('keeps YouTube and sites with no row anonymous first', () => {
		expect(decideStartIdentity('https://www.youtube.com/watch?v=a', inputs())).toEqual({site: 'youtube', auth: 'anonymous', reason: 'notSignInFirst'})
		expect(decideStartIdentity('https://vimeo.com/1', inputs())).toEqual({site: 'vimeo.com', auth: 'anonymous', reason: 'notSignInFirst'})
	})

	it('says why a first site starts anonymous', () => {
		const url = 'https://www.instagram.com/reel/a'
		expect(decideStartIdentity(url, inputs({cookiesMode: 'off'}))).toMatchObject({auth: 'anonymous', reason: 'notExploreMode'})
		expect(decideStartIdentity(url, inputs({cookiesMode: 'browser'}))).toMatchObject({auth: 'anonymous', reason: 'notExploreMode'})
		expect(decideStartIdentity(url, inputs({exploreEnabled: false}))).toMatchObject({auth: 'anonymous', reason: 'exploreDisabled'})
		expect(decideStartIdentity(url, inputs({signedIn: () => false}))).toMatchObject({auth: 'anonymous', reason: 'noSignInCookie'})
		expect(decideStartIdentity(url, inputs({suspect: site => site === 'instagram'}))).toMatchObject({auth: 'anonymous', reason: 'signInSuspect'})
	})

	it('asks about the site the link belongs to', () => {
		const asked: string[] = []
		decideStartIdentity('https://t.co/abc', inputs({signedIn: site => (asked.push(site), true)}))
		expect(asked).toEqual(['x'])
	})

	it('starts anything that is not a web link anonymous', () => {
		expect(decideStartIdentity('not a url', inputs())).toMatchObject({auth: 'anonymous', reason: 'notSignInFirst'})
	})
})
