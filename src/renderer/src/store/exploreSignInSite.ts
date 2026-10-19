import {EXPLORE_ADDRESS_MAX} from '@shared/sites/exploreAddress.js'
import {siteForUrl} from '@shared/sites/index.js'

// Where "Sign in in Explore" leads for a failed link (ADR 0011). YouTube's
// sign-in is the one Explore reports, so Explore opens wherever it was and a
// retry can wait for it. Any other site's sign-in is on that site: Explore
// opens `address`, and only the user knows when they have signed in there.
export type ExploreSignInSite = {kind: 'youtube'} | {kind: 'web'; host: string; address: string}

const YOUTUBE: ExploreSignInSite = {kind: 'youtube'}
const WEB_PROTOCOLS = new Set(['http:', 'https:'])

// A failure without a link, or with one that is no web page, keeps YouTube's guidance.
export function exploreSignInSiteFor(url: string | null | undefined): ExploreSignInSite {
	let parsed: URL
	try {
		parsed = new URL(url?.trim() ?? '')
	} catch {
		return YOUTUBE
	}
	if (!WEB_PROTOCOLS.has(parsed.protocol) || parsed.hostname === '' || siteForUrl(parsed.href).id === 'youtube') return YOUTUBE
	// The link itself shows the site's own sign-in prompt where it needs one.
	// One the address bar would refuse (credentials, over the cap) opens the site's front page.
	const typeable = parsed.username === '' && parsed.password === '' && parsed.href.length <= EXPLORE_ADDRESS_MAX
	return {kind: 'web', host: parsed.hostname.replace(/^www\./i, ''), address: typeable ? parsed.href : parsed.origin}
}
