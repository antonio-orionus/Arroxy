import {describe, expect, it} from 'vite-plus/test'
import {classifyExploreAddress, EXPLORE_ADDRESS_MAX, exploreAddressScope, isExploreAddress} from '@shared/sites/exploreAddress.js'
import type {SiteExplore} from '@shared/sites/types.js'
import {youtubeSite} from '@shared/sites/youtube.js'

// What Enter in Explore's address bar does with the text. Any web link loads in
// the view (a YouTube one in YouTube's own form), plain text searches YouTube,
// and anything else is refused.

function siteExplore(): SiteExplore {
	if (!youtubeSite.explore) throw new Error('youtube has no Explore capability')
	return youtubeSite.explore
}
const explore = siteExplore()
const scope = exploreAddressScope(explore)

function classify(input: string) {
	return classifyExploreAddress(input, explore, scope)
}

describe('classifyExploreAddress', () => {
	it.each([
		['https://www.youtube.com/watch?v=abc123', 'https://www.youtube.com/watch?v=abc123'],
		['  https://www.youtube.com/@channel  ', 'https://www.youtube.com/@channel'],
		['youtube.com/watch?v=abc123', 'https://youtube.com/watch?v=abc123'],
		['www.youtube.com/playlist?list=PL1', 'https://www.youtube.com/playlist?list=PL1'],
		['http://www.youtube.com/watch?v=abc123', 'https://www.youtube.com/watch?v=abc123'],
		['HTTPS://WWW.YOUTUBE.COM/watch?v=abc123', 'https://www.youtube.com/watch?v=abc123'],
		['https://m.youtube.com/watch?v=abc123', 'https://m.youtube.com/watch?v=abc123'],
		// A bare YouTube host needs no path or scheme to be a link.
		['youtube.com', 'https://youtube.com/'],
		['m.youtube.com', 'https://m.youtube.com/'],
		['www.youtube.com', 'https://www.youtube.com/'],
		// music.youtube.com is on the site's navigation allowlist (youtube.com and its subdomains).
		['https://music.youtube.com/watch?v=abc123', 'https://music.youtube.com/watch?v=abc123']
	])('%s is a YouTube link', (input, url) => {
		expect(classify(input)).toEqual({kind: 'link', url})
	})

	it.each([
		['https://youtu.be/abc123', 'https://www.youtube.com/watch?v=abc123'],
		['youtu.be/abc123?si=tracking', 'https://www.youtube.com/watch?v=abc123'],
		['https://youtu.be/abc123?t=42&si=x&list=PL9', 'https://www.youtube.com/watch?v=abc123&t=42&list=PL9'],
		['https://youtu.be/', 'https://www.youtube.com/'],
		['youtu.be', 'https://www.youtube.com/']
	])('the short link %s opens as a watch page', (input, url) => {
		expect(classify(input)).toEqual({kind: 'link', url})
	})

	it.each([
		['lofi beats', 'https://www.youtube.com/results?search_query=lofi+beats'],
		['cats', 'https://www.youtube.com/results?search_query=cats'],
		['c++ tutorial & tips', 'https://www.youtube.com/results?search_query=c%2B%2B+tutorial+%26+tips'],
		['lofi:beats', 'https://www.youtube.com/results?search_query=lofi%3Abeats'],
		['3.5 mm jack', 'https://www.youtube.com/results?search_query=3.5+mm+jack'],
		// A dotted single token with no scheme, no www. and no path is a search,
		// unless it is a YouTube host (above).
		['node.js', 'https://www.youtube.com/results?search_query=node.js'],
		['vue.js', 'https://www.youtube.com/results?search_query=vue.js'],
		['e.g.', 'https://www.youtube.com/results?search_query=e.g.'],
		['v1.2', 'https://www.youtube.com/results?search_query=v1.2'],
		['example.com', 'https://www.youtube.com/results?search_query=example.com'],
		['example.com:8080', 'https://www.youtube.com/results?search_query=example.com%3A8080']
	])('plain text %j searches YouTube', (input, url) => {
		expect(classify(input)).toEqual({kind: 'search', url})
	})

	it.each([
		['https://vimeo.com/123', 'https://vimeo.com/123'],
		['example.com/video', 'https://example.com/video'],
		['vimeo.com/123', 'https://vimeo.com/123'],
		['www.example.com', 'https://www.example.com/'],
		['node.js/docs', 'https://node.js/docs'],
		['http://example.com/', 'http://example.com/'],
		['http://127.0.0.1:4567/next', 'http://127.0.0.1:4567/next'],
		['https://www.example.com:8443/a', 'https://www.example.com:8443/a'],
		// A site host on another port is loaded as typed, never rewritten.
		['https://www.youtube.com:8443/watch?v=a', 'https://www.youtube.com:8443/watch?v=a'],
		['https://youtube.com.evil.example/watch', 'https://youtube.com.evil.example/watch']
	])('%s is a link on another site, loaded as typed', (input, url) => {
		expect(classify(input)).toEqual({kind: 'link', url})
	})

	it.each([['javascript:alert(1)'], ['JavaScript:alert(document.cookie)'], ['data:text/html,<script>alert(1)</script>'], ['file:///etc/passwd'], ['about:blank'], ['https://user:pass@www.youtube.com/'], ['https://user@youtube.com/watch?v=a'], ['https://user:pass@example.com/'], ['http://']])('%s is refused', input => {
		expect(classify(input)).toEqual({kind: 'refused'})
	})

	// Sign-in and account pages stay reachable by clicking on pages (a site's
	// own Sign in button); typed, they are refused.
	it.each(['https://accounts.google.com/ServiceLogin', 'accounts.google.com/signin', 'https://accounts.google.co.uk/', 'https://accounts.google.com.br/x', 'https://myaccount.google.com/', 'myaccount.google.com/security', 'https://accounts.youtube.com/accounts/CheckConnection', 'http://accounts.google.com/'])(
		'refuses the sign-in or account page %s',
		input => {
			expect(classify(input)).toEqual({kind: 'refused'})
		}
	)

	it('refuses a link over the length cap, and says a search over it is too long', () => {
		expect(classify(`https://www.youtube.com/watch?v=${'a'.repeat(EXPLORE_ADDRESS_MAX)}`)).toEqual({kind: 'refused'})
		expect(classify('a '.repeat(EXPLORE_ADDRESS_MAX))).toEqual({kind: 'search-too-long'})
		// Within the cap as typed, over it once encoded.
		expect(classify('ж'.repeat(400))).toEqual({kind: 'search-too-long'})
	})

	// Consent pages are hops on the way to the site, reached by the site itself; never typed.
	it.each(['https://consent.youtube.com/m?continue=x', 'consent.youtube.com/ml', 'https://consent.google.com/', 'https://consent.google.co.uk/x', 'https://consent.google.com.br/x', 'https://consent.google.de/'])('refuses the consent page %s', input => {
		expect(classify(input)).toEqual({kind: 'refused'})
	})
})

describe('isExploreAddress (main enforcement)', () => {
	it.each(['https://www.youtube.com/', 'https://youtube.com/watch?v=a', 'https://youtu.be/abc', 'https://music.youtube.com/', 'http://www.youtube.com/', 'https://example.com/', 'http://example.com/page?a=1', 'https://vimeo.com/123', 'https://www.example.com:8443/', 'http://127.0.0.1:4567/next'])('accepts %s', url => {
		expect(isExploreAddress(url, scope)).toBe(true)
	})

	it.each([
		'https://accounts.google.com/ServiceLogin',
		'https://accounts.google.co.uk/',
		'https://myaccount.google.com/',
		'https://accounts.youtube.com/',
		'https://consent.google.com/',
		'https://consent.youtube.com/',
		'https://consent.google.de/',
		'https://user:pass@www.youtube.com/',
		'https://user@example.com/',
		'javascript:alert(1)',
		'data:text/html,x',
		'file:///etc/passwd',
		'ftp://example.com/file',
		'not a url',
		'',
		`https://example.com/${'a'.repeat(EXPLORE_ADDRESS_MAX)}`
	])('rejects %j', url => {
		expect(isExploreAddress(url, scope)).toBe(false)
	})
})
