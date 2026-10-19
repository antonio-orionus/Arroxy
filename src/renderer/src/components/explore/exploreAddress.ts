import type {TFunction} from 'i18next'
import {classifyExploreAddress, exploreAddressScope} from '@shared/sites/exploreAddress.js'
import {siteById} from '@shared/sites/index.js'
import type {ExploreSearchEngine} from '@shared/schemas.js'
import type {ExploreAddressHint} from '../../store/types.js'

// The site whose links Explore writes in its own form, as in main.
const EXPLORE = siteById('youtube').explore

// `failed`: navigation broke for a reason that says nothing about the
// address (IPC, an error in main): logged, and nothing shown.
export type ExploreAddressOutcome = {kind: 'navigated'} | {kind: 'hint'; hint: ExploreAddressHint} | {kind: 'failed'}

// Enter in the address bar. A link, or a search on the chosen engine, goes to
// main, which checks it again before the view loads it; a refusal there (a validation failure)
// shows the hint. What is refused here (another scheme, credentials, a
// sign-in, account or consent page, over the cap) is never sent.
export async function submitExploreAddress(text: string, engine: ExploreSearchEngine): Promise<ExploreAddressOutcome> {
	const address = EXPLORE ? classifyExploreAddress(text, EXPLORE, exploreAddressScope(EXPLORE), engine) : ({kind: 'refused'} as const)
	if (address.kind === 'refused' || address.kind === 'search-too-long') return {kind: 'hint', hint: {kind: address.kind}}
	const result = await window.appApi.explore.navigate({kind: 'address', url: address.url})
	if (result.ok) return {kind: 'navigated'}
	if (result.error.code !== 'validation') {
		console.warn('[explore] address navigation failed', result.error.code)
		return {kind: 'failed'}
	}
	return {kind: 'hint', hint: {kind: 'refused'}}
}

// What the hint says (and the live region announces).
export function exploreAddressHintText(hint: ExploreAddressHint, t: TFunction): string {
	switch (hint.kind) {
		case 'refused':
			return t('explore.toolbar.refusedHint')
		case 'search-too-long':
			return t('explore.toolbar.searchTooLong')
	}
}
