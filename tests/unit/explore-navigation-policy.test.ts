import {describe, expect, it} from 'vite-plus/test'
import {decideNavigation, type NavigationDecision} from '@main/services/explore/exploreNavigationPolicy.js'
import {youtubeSite} from '@shared/sites/youtube.js'

const hosts = youtubeSite.explore?.navigationHosts ?? []

type Case = [label: string, input: {url: string; userGesture: boolean; isRedirect: boolean; mainFrame: boolean; extraAllowedOrigin?: string}, expected: NavigationDecision]

const click = (url: string): Case[1] => ({url, userGesture: true, isRedirect: false, mainFrame: true})
const scripted = (url: string): Case[1] => ({url, userGesture: false, isRedirect: false, mainFrame: true})
const redirect = (url: string): Case[1] => ({url, userGesture: true, isRedirect: true, mainFrame: true})
const subframe = (url: string, userGesture = true): Case[1] => ({url, userGesture, isRedirect: false, mainFrame: false})

const ALLOW: NavigationDecision = {kind: 'allow'}

describe('decideNavigation', () => {
	it('is fed the YouTube allowlist', () => expect(hosts.length).toBeGreaterThan(0))

	it.each<Case>([
		// Allowlisted hosts load in the view, however the navigation started.
		['youtube.com', scripted('https://www.youtube.com/watch?v=abc'), ALLOW],
		['bare youtube.com', scripted('https://youtube.com/'), ALLOW],
		['music subdomain', click('https://music.youtube.com/'), ALLOW],
		['http youtube (upgraded by the site)', scripted('http://www.youtube.com/'), ALLOW],
		['youtu.be short link', click('https://youtu.be/abc'), ALLOW],
		['youtu.be as a redirect target', redirect('https://youtu.be/abc'), ALLOW],
		['accounts.google.com', redirect('https://accounts.google.com/ServiceLogin?continue=x'), ALLOW],
		['accounts.youtube.com', redirect('https://accounts.youtube.com/accounts/SetSID'), ALLOW],
		['country sign-in hop co.in', redirect('https://accounts.google.co.in/accounts/SetSID?ssdc=1'), ALLOW],
		['country sign-in hop .de', redirect('https://accounts.google.de/accounts/SetSID'), ALLOW],
		['country sign-in hop com.br', redirect('https://accounts.google.com.br/accounts/SetSID'), ALLOW],
		['consent.youtube.com', redirect('https://consent.youtube.com/m?continue=x'), ALLOW],
		['consent.google.com', redirect('https://consent.google.com/ml?continue=x'), ALLOW],
		['host case and trailing dot', click('https://WWW.YOUTUBE.COM./'), ALLOW],

		// Off-allowlist: a user's click opens the system browser, nothing else does.
		['click to example.com', click('https://example.com/page?a=1'), {kind: 'openExternal', url: 'https://example.com/page?a=1'}],
		['click to plain http', click('http://example.com/'), {kind: 'openExternal', url: 'http://example.com/'}],
		['click to google.com at large', click('https://www.google.com/search?q=x'), {kind: 'openExternal', url: 'https://www.google.com/search?q=x'}],
		['redirect to example.com', redirect('https://example.com/landing?sidt=secret'), {kind: 'block', host: 'example.com'}],
		['script navigation to example.com', scripted('https://example.com/'), {kind: 'block', host: 'example.com'}],
		['redirect to a lookalike', redirect('https://youtube.com.evil.example/'), {kind: 'block', host: 'youtube.com.evil.example'}],
		['redirect to a generic-TLD Google host', redirect('https://accounts.google.xyz/'), {kind: 'block', host: 'accounts.google.xyz'}],
		['redirect to myaccount.google.com', redirect('https://myaccount.google.com/'), {kind: 'block', host: 'myaccount.google.com'}],

		// Never a non-web scheme, not even on a click.
		['javascript: URL', click('javascript:alert(1)'), {kind: 'block', host: ''}],
		['file: URL', click('file:///etc/passwd'), {kind: 'block', host: ''}],
		['data: URL', click('data:text/html,<p>x</p>'), {kind: 'block', host: ''}],
		['blob: URL', click('blob:https://www.youtube.com/uuid'), {kind: 'block', host: ''}],
		['custom protocol', click('mailto:someone@example.com'), {kind: 'block', host: ''}],
		['ftp URL', click('ftp://example.com/file'), {kind: 'block', host: 'example.com'}],
		['unparsable URL', click('not a url'), {kind: 'block', host: ''}],
		['empty URL', click(''), {kind: 'block', host: ''}],

		// Subframes never reach the system browser.
		['subframe on the allowlist', subframe('https://www.youtube.com/embed/abc'), ALLOW],
		['subframe off the allowlist, even on a click', subframe('https://example.com/'), {kind: 'block', host: 'example.com'}],
		['subframe javascript: URL', subframe('javascript:void(0)'), {kind: 'block', host: ''}]
	])('%s', (_label, input, expected) => {
		expect(decideNavigation({...input, hosts})).toEqual(expected)
	})

	describe('extraAllowedOrigin (E2E home override)', () => {
		const extraAllowedOrigin = 'http://127.0.0.1:4567'

		it('allows the exact origin', () => {
			expect(decideNavigation({...scripted('http://127.0.0.1:4567/explore/home?x=1'), hosts, extraAllowedOrigin})).toEqual(ALLOW)
			expect(decideNavigation({...redirect('http://127.0.0.1:4567/next'), hosts, extraAllowedOrigin})).toEqual(ALLOW)
		})

		it('does not widen to another port, scheme or host', () => {
			expect(decideNavigation({...redirect('http://127.0.0.1:4568/'), hosts, extraAllowedOrigin})).toEqual({kind: 'block', host: '127.0.0.1'})
			expect(decideNavigation({...redirect('https://127.0.0.1:4567/'), hosts, extraAllowedOrigin})).toEqual({kind: 'block', host: '127.0.0.1'})
			expect(decideNavigation({...redirect('http://localhost:4567/'), hosts, extraAllowedOrigin})).toEqual({kind: 'block', host: 'localhost'})
		})

		it('is not allowed without the override', () => {
			expect(decideNavigation({...redirect('http://127.0.0.1:4567/'), hosts})).toEqual({kind: 'block', host: '127.0.0.1'})
		})
	})

	it('never hands a non-web URL to the system browser, whatever the flags', () => {
		for (const url of ['javascript:alert(1)', 'file:///tmp/x', 'data:text/plain,x', 'ms-settings:', 'smb://host/share']) {
			for (const userGesture of [true, false]) {
				for (const isRedirect of [true, false]) {
					for (const mainFrame of [true, false]) {
						expect(decideNavigation({url, userGesture, isRedirect, mainFrame, hosts}).kind).toBe('block')
					}
				}
			}
		}
	})
})
