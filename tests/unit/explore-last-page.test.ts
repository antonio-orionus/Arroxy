// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {LastPageRecorder, restorablePage, startPage, type LastPageScope} from '@main/services/explore/exploreLastPage.js'
import {updateSettingsSchema} from '@shared/schemas.js'

// P2-R34: the Explore view reopens on the last site page it showed. Only the
// site's own pages are kept — never a sign-in or consent hop, never a URL with
// credentials — and a stored page that is no longer one opens home instead.

const SITE: LastPageScope = {kind: 'site', hosts: [{kind: 'suffix', domain: 'youtube.com'}]}
const FIXTURE: LastPageScope = {kind: 'origin', origin: 'http://127.0.0.1:4567'}
const HOME = 'https://www.youtube.com/'

describe('restorablePage', () => {
	it.each(['https://www.youtube.com/', 'https://www.youtube.com/watch?v=abc&t=42', 'https://m.youtube.com/@channel/videos', 'https://youtube.com/playlist?list=PL1', 'https://music.youtube.com/', 'https://www.youtube.com/@redirect', 'https://www.youtube.com/results?search_query=logout'])(
		'keeps the site page %s',
		url => {
			expect(restorablePage(url, SITE)).toBe(url)
		}
	)

	it.each([
		['a Google sign-in page', 'https://accounts.google.com/ServiceLogin?continue=https://www.youtube.com/'],
		['a country sign-in page', 'https://accounts.google.co.uk/AccountChooser'],
		['the YouTube sign-in hop', 'https://accounts.youtube.com/accounts/SetSID?ssdc=1&sidt=secret'],
		['the consent page', 'https://consent.youtube.com/m?continue=https://www.youtube.com/'],
		['a short link host', 'https://youtu.be/abc'],
		['another site', 'https://example.com/watch?v=abc'],
		['a lookalike host', 'https://youtube.com.example.net/'],
		['plain http', 'http://www.youtube.com/'],
		['credentials in the URL', 'https://user:pass@www.youtube.com/'],
		['a username alone', 'https://user@www.youtube.com/'],
		['a blank page', 'about:blank'],
		['nothing', ''],
		['no URL at all', 'not a url'],
		['an overlong URL', `https://www.youtube.com/results?search_query=${'a'.repeat(2100)}`],
		['the outbound-link interstitial', 'https://www.youtube.com/redirect?event=video_description&q=https%3A%2F%2Fexample.com'],
		['the sign-in hop on the site', 'https://www.youtube.com/signin?action_handle_signin=true&next=%2F'],
		['a passive sign-in hop', 'https://www.youtube.com/signin_passive'],
		['the sign-out page', 'https://www.youtube.com/logout'],
		['a sign-out path in capitals', 'https://m.youtube.com/LOGOUT/']
	])('drops %s', (_name, url) => {
		expect(restorablePage(url, SITE)).toBeNull()
	})

	it('under the E2E home override keeps that origin only', () => {
		expect(restorablePage('http://127.0.0.1:4567/next?x=1', FIXTURE)).toBe('http://127.0.0.1:4567/next?x=1')
		expect(restorablePage('http://127.0.0.1:4568/next', FIXTURE)).toBeNull()
		expect(restorablePage('https://www.youtube.com/watch?v=abc', FIXTURE)).toBeNull()
		expect(restorablePage('http://user:pw@127.0.0.1:4567/', FIXTURE)).toBeNull()
	})
})

describe('startPage', () => {
	it('opens the stored page while it is still a site page', () => {
		expect(startPage('https://www.youtube.com/watch?v=abc', SITE, HOME)).toBe('https://www.youtube.com/watch?v=abc')
	})

	it.each([[undefined], [''], ['https://accounts.google.com/'], ['https://example.com/'], ['garbage']])('opens home for %j', stored => {
		expect(startPage(stored, SITE, HOME)).toBe(HOME)
	})

	it('under the E2E home override never opens a real site page', () => {
		expect(startPage('https://www.youtube.com/watch?v=abc', FIXTURE, 'http://127.0.0.1:4567/')).toBe('http://127.0.0.1:4567/')
	})
})

describe('LastPageRecorder', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	function recorder(stored?: string) {
		let value = stored
		const write = vi.fn((url: string | undefined) => {
			value = url
		})
		return {rec: new LastPageRecorder({scope: SITE, read: () => value, write, delayMs: 1000}), write, value: () => value}
	}

	it('writes once per burst of navigations, the last page', () => {
		vi.useFakeTimers()
		const {rec, write, value} = recorder()
		rec.record('https://www.youtube.com/')
		rec.record('https://www.youtube.com/watch?v=a')
		vi.advanceTimersByTime(999)
		rec.record('https://www.youtube.com/watch?v=b')
		vi.advanceTimersByTime(999)
		expect(write).not.toHaveBeenCalled()

		vi.advanceTimersByTime(1)
		expect(write).toHaveBeenCalledTimes(1)
		expect(value()).toBe('https://www.youtube.com/watch?v=b')
	})

	it('ignores pages it may not keep and leaves the last site page stored', () => {
		vi.useFakeTimers()
		const {rec, write} = recorder('https://www.youtube.com/watch?v=a')
		rec.record('https://accounts.google.com/ServiceLogin?sidt=secret')
		vi.runAllTimers()
		expect(write).not.toHaveBeenCalled()
	})

	it('skips a write that changes nothing', () => {
		vi.useFakeTimers()
		const {rec, write} = recorder('https://www.youtube.com/watch?v=a')
		rec.record('https://www.youtube.com/watch?v=a')
		vi.runAllTimers()
		expect(write).not.toHaveBeenCalled()
	})

	it('flush writes a pending page at once', () => {
		vi.useFakeTimers()
		const {rec, write, value} = recorder()
		rec.record('https://www.youtube.com/feed/subscriptions')
		rec.flush()
		expect(value()).toBe('https://www.youtube.com/feed/subscriptions')
		vi.runAllTimers()
		expect(write).toHaveBeenCalledTimes(1)
	})

	it('clear forgets the stored page and drops a pending one', () => {
		vi.useFakeTimers()
		const {rec, value} = recorder('https://www.youtube.com/watch?v=a')
		rec.record('https://www.youtube.com/watch?v=b')
		rec.clear()
		vi.runAllTimers()
		expect(value()).toBeUndefined()
	})
})

describe('the stored last page and the renderer', () => {
	// Main owns it: a settings update from the renderer cannot set it.
	it('is not part of a renderer settings update', () => {
		const parsed = updateSettingsSchema.parse({common: {exploreLastUrl: 'https://www.youtube.com/', exploreEnabled: true}})
		expect(parsed.common).toEqual({exploreEnabled: true})
	})
})
