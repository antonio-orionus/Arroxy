// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import type {NavigationEntry} from 'electron'
import {buildIdleUnloadSnapshot, idleUnloadKeepReason, IDLE_UNLOAD_MAX_BYTES, IDLE_UNLOAD_MAX_ENTRIES, type IdleUnloadPage, type IdleUnloadRule} from '@main/services/explore/exploreIdleUnload.js'
import type {LastPageScope} from '@main/services/explore/exploreLastPage.js'

// Idle unload: which page may be released while the Explore tab is away, and
// the history that brings it back. Only the site's home and search results
// qualify; everything else holds state a reload could lose.

const SITE: LastPageScope = {kind: 'site', hosts: [{kind: 'suffix', domain: 'youtube.com'}]}
const RULE: IdleUnloadRule = {scope: SITE, paths: ['/', '/results']}
const FIXTURE_RULE: IdleUnloadRule = {scope: {kind: 'origin', origin: 'http://127.0.0.1:4567'}, paths: ['/', '/results']}

const HOME = 'https://www.youtube.com/'
const SEARCH = 'https://www.youtube.com/results?search_query=cats'
const WATCH = 'https://www.youtube.com/watch?v=abc'

function page(url: string, patch: Partial<IdleUnloadPage> = {}): IdleUnloadPage {
	return {url, loading: false, error: false, proxyRefused: false, mediaPlaying: false, ...patch}
}

function entry(url: string, pageState = `state:${url}`): NavigationEntry {
	return {url, title: url, pageState}
}

describe('idleUnloadKeepReason', () => {
	it.each([HOME, 'https://www.youtube.com/?themeRefresh=1', SEARCH, 'https://m.youtube.com/results?search_query=x'])('lets %s go', url => {
		expect(idleUnloadKeepReason(page(url), RULE)).toBeNull()
	})

	it.each([
		['a watch page', WATCH],
		['a Short', 'https://www.youtube.com/shorts/abc'],
		['a channel', 'https://www.youtube.com/@channel/videos'],
		['a playlist', 'https://www.youtube.com/playlist?list=PL1'],
		['a community post', 'https://www.youtube.com/post/abc'],
		['the consent page', 'https://consent.youtube.com/m?continue=https://www.youtube.com/'],
		['a sign-in page', 'https://accounts.google.com/ServiceLogin'],
		['the outbound-link interstitial', 'https://www.youtube.com/redirect?q=https%3A%2F%2Fexample.com'],
		['another site', 'https://example.com/'],
		['a blank page', 'about:blank'],
		['nothing', '']
	])('keeps %s', (_name, url) => {
		expect(idleUnloadKeepReason(page(url), RULE)).toBe('route')
	})

	it('keeps a page still loading, showing an error, blanked by a refused proxy, or playing media', () => {
		expect(idleUnloadKeepReason(page(HOME, {loading: true}), RULE)).toBe('loading')
		expect(idleUnloadKeepReason(page(HOME, {error: true}), RULE)).toBe('error')
		expect(idleUnloadKeepReason(page(HOME, {proxyRefused: true}), RULE)).toBe('proxy')
		expect(idleUnloadKeepReason(page(HOME, {mediaPlaying: true}), RULE)).toBe('media')
	})

	it("under the E2E override, the same paths on the fixture's origin qualify, and nothing else", () => {
		expect(idleUnloadKeepReason(page('http://127.0.0.1:4567/results?search_query=x'), FIXTURE_RULE)).toBeNull()
		expect(idleUnloadKeepReason(page('http://127.0.0.1:4567/watch?v=x'), FIXTURE_RULE)).toBe('route')
		expect(idleUnloadKeepReason(page(HOME), FIXTURE_RULE)).toBe('route')
	})
})

describe('buildIdleUnloadSnapshot', () => {
	it('keeps the history as it is when every entry is a site page', () => {
		const entries = [entry(HOME), entry(SEARCH), entry(WATCH)]
		expect(buildIdleUnloadSnapshot(entries, 1, SITE)).toEqual({kind: 'ok', snapshot: {entries, index: 1}, dropped: 0})
	})

	it('drops sign-in, consent, interstitial and blank entries, and moves the active index with them', () => {
		const entries = [entry('https://consent.youtube.com/m?continue=x'), entry(HOME), entry('about:blank'), entry('https://accounts.google.com/ServiceLogin?sidt=secret'), entry(SEARCH), entry('https://www.youtube.com/redirect?q=x'), entry(WATCH)]
		const result = buildIdleUnloadSnapshot(entries, 4, SITE)
		expect(result).toEqual({kind: 'ok', snapshot: {entries: [entry(HOME), entry(SEARCH), entry(WATCH)], index: 1}, dropped: 4})
	})

	it('passes each kept page state through untouched', () => {
		const opaque = 'AAAA//8=' + 'x'.repeat(1000)
		const result = buildIdleUnloadSnapshot([entry(HOME, opaque)], 0, SITE)
		expect(result.kind === 'ok' && result.snapshot.entries[0]?.pageState).toBe(opaque)
	})

	it('refuses a history whose active entry may not come back', () => {
		expect(buildIdleUnloadSnapshot([entry(HOME), entry('https://accounts.google.com/x')], 1, SITE)).toEqual({kind: 'keep', reason: 'route'})
	})

	it('refuses an active index outside the history', () => {
		expect(buildIdleUnloadSnapshot([entry(HOME)], 1, SITE)).toEqual({kind: 'keep', reason: 'route'})
		expect(buildIdleUnloadSnapshot([entry(HOME)], -1, SITE)).toEqual({kind: 'keep', reason: 'route'})
		expect(buildIdleUnloadSnapshot([], 0, SITE)).toEqual({kind: 'keep', reason: 'route'})
	})

	it(`keeps at most ${IDLE_UNLOAD_MAX_ENTRIES} entries, those nearest the active one`, () => {
		const entries = Array.from({length: 70}, (_v, i) => entry(`https://www.youtube.com/results?search_query=${i}`))
		const result = buildIdleUnloadSnapshot(entries, 60, SITE)
		if (result.kind !== 'ok') throw new Error('expected a snapshot')
		expect(result.snapshot.entries).toHaveLength(IDLE_UNLOAD_MAX_ENTRIES)
		expect(result.snapshot.entries[result.snapshot.index]?.url).toBe(entries[60]?.url)
		// 25 behind, 24 ahead (only 9 exist), so the window shifts back.
		expect(result.snapshot.entries[0]?.url).toBe(entries[20]?.url)
		expect(result.snapshot.entries.at(-1)?.url).toBe(entries[69]?.url)
	})

	it('refuses a history over the size limit rather than cutting a page state', () => {
		const big = 'x'.repeat(IDLE_UNLOAD_MAX_BYTES)
		expect(buildIdleUnloadSnapshot([entry(HOME, big)], 0, SITE)).toEqual({kind: 'keep', reason: 'too-large'})
	})
})
