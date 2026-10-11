import {describe, expect, it} from 'vitest'
import {resolveUpdateFeed} from '@main/updateFeed.js'

const GITHUB = {provider: 'github', owner: 'antonio-orionus', repo: 'Arroxy', channel: 'latest'}

describe('resolveUpdateFeed', () => {
	it('uses the GitHub feed when no override is set', () => {
		expect(resolveUpdateFeed({}, 'latest')).toEqual({kind: 'github', feed: GITHUB})
	})

	it('passes the release channel through to the GitHub feed', () => {
		expect(resolveUpdateFeed({}, 'beta')).toEqual({kind: 'github', feed: {...GITHUB, channel: 'beta'}})
	})

	it('treats an empty override as unset', () => {
		expect(resolveUpdateFeed({ARROXY_UPDATE_FEED_URL: ''}, 'latest')).toEqual({kind: 'github', feed: GITHUB})
	})

	it.each(['http://127.0.0.1:8765/', 'http://localhost:8765/feed/', 'http://[::1]:8765/', 'https://127.0.0.1/'])('accepts loopback override %s', url => {
		expect(resolveUpdateFeed({ARROXY_UPDATE_FEED_URL: url}, 'latest')).toEqual({kind: 'override', feed: {provider: 'generic', url, channel: 'latest'}})
	})

	it.each([
		['remote host', 'https://example.com/feed/'],
		['private LAN address', 'http://192.168.1.10:8765/'],
		['loopback lookalike', 'http://127.0.0.1.example.com/'],
		['credentials smuggling a host', 'http://127.0.0.1@example.com/'],
		['file scheme', 'file:///tmp/feed/'],
		['not a URL', 'not a url']
	])('rejects %s and falls back to GitHub', (_label, url) => {
		const resolved = resolveUpdateFeed({ARROXY_UPDATE_FEED_URL: url}, 'latest')
		expect(resolved).toEqual({kind: 'rejected', feed: GITHUB})
	})
})
