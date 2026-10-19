import {describe, expect, it} from 'vite-plus/test'
import {EXPLORE_SEARCH_ENGINES, updateSettingsSchema} from '@shared/schemas.js'
import {exploreSearchEngineName, exploreSearchEngineOf, exploreSearchUrl} from '@shared/sites/exploreSearch.js'

// Where plain text typed in Explore's address bar is searched: the engine
// picked in settings, DuckDuckGo when none is.
describe('exploreSearchUrl', () => {
	it.each([
		['duckduckgo', 'https://duckduckgo.com/?q=cats'],
		['brave', 'https://search.brave.com/search?q=cats'],
		['google', 'https://www.google.com/search?q=cats'],
		['bing', 'https://www.bing.com/search?q=cats'],
		['youtube', 'https://www.youtube.com/results?search_query=cats']
	] as const)('searches %s for the text', (engine, url) => {
		expect(exploreSearchUrl(engine, 'cats')).toBe(url)
	})

	it.each(EXPLORE_SEARCH_ENGINES)('encodes the text as one query value on %s', engine => {
		const url = new URL(exploreSearchUrl(engine, 'c++ & tips?#x'))
		expect(url.protocol).toBe('https:')
		expect(url.hash).toBe('')
		expect([...url.searchParams.values()]).toEqual(['c++ & tips?#x'])
	})

	it('offers exactly the five engines', () => {
		expect([...EXPLORE_SEARCH_ENGINES].sort()).toEqual(['bing', 'brave', 'duckduckgo', 'google', 'youtube'])
	})
})

describe('exploreSearchEngineOf', () => {
	it('is DuckDuckGo when the setting is unset', () => {
		expect(exploreSearchEngineOf({})).toBe('duckduckgo')
		expect(exploreSearchEngineOf({exploreSearchEngine: undefined})).toBe('duckduckgo')
	})

	it.each(EXPLORE_SEARCH_ENGINES)('is %s when that is picked', engine => {
		expect(exploreSearchEngineOf({exploreSearchEngine: engine})).toBe(engine)
	})
})

describe('exploreSearchEngineName', () => {
	it.each([
		['duckduckgo', 'DuckDuckGo'],
		['brave', 'Brave'],
		['google', 'Google'],
		['bing', 'Bing'],
		['youtube', 'YouTube']
	] as const)('names %s %s', (engine, name) => {
		expect(exploreSearchEngineName(engine)).toBe(name)
	})
})

describe('the exploreSearchEngine setting', () => {
	it.each(EXPLORE_SEARCH_ENGINES)('accepts %s from the renderer', engine => {
		expect(updateSettingsSchema.safeParse({common: {exploreSearchEngine: engine}}).success).toBe(true)
	})

	it.each(['yahoo', 'DuckDuckGo', 'https://evil.example/?q=', ''])('refuses %j', engine => {
		expect(updateSettingsSchema.safeParse({common: {exploreSearchEngine: engine}}).success).toBe(false)
	})
})
