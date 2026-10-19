// Where plain text typed in Explore's address bar is searched. The engine id
// comes from settings (the settings schema checks it on every write) and the
// results page is built here from that id and the text alone; main then
// checks the page like any typed address.

import type {ExploreSearchEngine} from '../schemas.js'

interface SearchEngine {
	// The engine's own name, shown untranslated.
	name: string
	// Its results page, and the query parameter that carries the text.
	page: string
	param: string
}

const ENGINES: Record<ExploreSearchEngine, SearchEngine> = {
	duckduckgo: {name: 'DuckDuckGo', page: 'https://duckduckgo.com/', param: 'q'},
	brave: {name: 'Brave', page: 'https://search.brave.com/search', param: 'q'},
	google: {name: 'Google', page: 'https://www.google.com/search', param: 'q'},
	bing: {name: 'Bing', page: 'https://www.bing.com/search', param: 'q'},
	youtube: {name: 'YouTube', page: 'https://www.youtube.com/results', param: 'search_query'}
}

export function exploreSearchEngineOf(common: {readonly exploreSearchEngine?: ExploreSearchEngine | undefined}): ExploreSearchEngine {
	return common.exploreSearchEngine ?? 'duckduckgo'
}

export function exploreSearchEngineName(engine: ExploreSearchEngine): string {
	return ENGINES[engine].name
}

export function exploreSearchUrl(engine: ExploreSearchEngine, query: string): string {
	const {page, param} = ENGINES[engine]
	const url = new URL(page)
	url.searchParams.set(param, query)
	return url.href
}
