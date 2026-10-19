import {describe, expect, it} from 'vite-plus/test'
import {decideNavigation, type NavigationDecision} from '@main/services/explore/exploreNavigationPolicy.js'

const ALLOW: NavigationDecision = {kind: 'allow'}

describe('decideNavigation', () => {
	it.each<[label: string, url: string, expected: NavigationDecision]>([
		// Any web page loads in the view: Explore browses the open web.
		['youtube.com', 'https://www.youtube.com/watch?v=abc', ALLOW],
		['http youtube (upgraded by the site)', 'http://www.youtube.com/', ALLOW],
		['youtu.be short link', 'https://youtu.be/abc', ALLOW],
		['accounts.google.com', 'https://accounts.google.com/ServiceLogin?continue=x', ALLOW],
		['country sign-in hop co.in', 'https://accounts.google.co.in/accounts/SetSID?ssdc=1', ALLOW],
		['consent.google.com', 'https://consent.google.com/ml?continue=x', ALLOW],
		['another site', 'https://example.com/page?a=1', ALLOW],
		['plain http', 'http://example.com/', ALLOW],
		['google.com at large', 'https://www.google.com/search?q=x', ALLOW],
		['another sign-in provider', 'https://login.microsoftonline.com/common/oauth2', ALLOW],
		['a port', 'http://127.0.0.1:4567/explore/home?x=1', ALLOW],

		// Never a non-web scheme.
		['javascript: URL', 'javascript:alert(1)', {kind: 'block', host: ''}],
		['file: URL', 'file:///etc/passwd', {kind: 'block', host: ''}],
		['data: URL', 'data:text/html,<p>x</p>', {kind: 'block', host: ''}],
		['blob: URL', 'blob:https://www.youtube.com/uuid', {kind: 'block', host: ''}],
		['custom protocol', 'mailto:someone@example.com', {kind: 'block', host: ''}],
		['app protocol', 'zoommtg://zoom.us/join?confno=1', {kind: 'block', host: 'zoom.us'}],
		['ftp URL', 'ftp://example.com/file', {kind: 'block', host: 'example.com'}],
		['unparsable URL', 'not a url', {kind: 'block', host: ''}],
		['empty URL', '', {kind: 'block', host: ''}]
	])('%s', (_label, url, expected) => {
		expect(decideNavigation(url)).toEqual(expected)
	})
})
