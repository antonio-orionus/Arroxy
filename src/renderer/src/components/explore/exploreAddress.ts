import type {TFunction} from 'i18next'
import {classifyExploreAddress, exploreAddressScope} from '@shared/sites/exploreAddress.js'
import {siteById} from '@shared/sites/index.js'
import type {ExploreAddressHint} from '../../store/types.js'

// v1 is YouTube-only (spec D5), as in main.
const EXPLORE = siteById('youtube').explore

// `failed`: navigation broke for a reason that says nothing about the
// address (IPC, an error in main): logged, and nothing shown.
export type ExploreAddressOutcome = {kind: 'navigated'} | {kind: 'hint'; hint: ExploreAddressHint} | {kind: 'failed'}

// Enter in the address bar (P2-R45). A link or a search goes to main, which
// alone decides what the view loads: only it knows the E2E home origin, so
// a link on another site is sent too and comes back refused (a validation
// failure). That refusal shows the hint, with Download for a web link on
// another site; what is refused here (another scheme, credentials, a
// sign-in, account or consent page, over the cap) is never sent.
export async function submitExploreAddress(text: string): Promise<ExploreAddressOutcome> {
	const address = EXPLORE ? classifyExploreAddress(text, EXPLORE, exploreAddressScope(EXPLORE)) : ({kind: 'refused'} as const)
	if (address.kind === 'refused' || address.kind === 'search-too-long') return {kind: 'hint', hint: {kind: address.kind}}
	const result = await window.appApi.explore.navigate({kind: 'address', url: address.url})
	if (result.ok) return {kind: 'navigated'}
	if (result.error.code !== 'validation') {
		console.warn('[explore] address navigation failed', result.error.code)
		return {kind: 'failed'}
	}
	return {kind: 'hint', hint: address.kind === 'offsite' ? {kind: 'offsite', downloadUrl: address.url} : {kind: 'refused'}}
}

function hostOf(url: string): string {
	try {
		return new URL(url).hostname
	} catch {
		return url
	}
}

// What the hint says (and the live region announces).
export function exploreAddressHintText(hint: ExploreAddressHint, t: TFunction): string {
	switch (hint.kind) {
		case 'offsite':
			return t('explore.toolbar.offsiteHintHost', {host: hostOf(hint.downloadUrl)})
		case 'refused':
			return t('explore.toolbar.offsiteHint')
		case 'search-too-long':
			return t('explore.toolbar.searchTooLong')
	}
}
