// What Enter in Explore's address bar does with the text (P2-R45). Pure: the
// renderer uses it to normalise and route what was typed, and main enforces
// the same site rule (isExploreSiteAddress) before the view loads anything.

import {hostMatches} from './hostRules.js'
import type {HostRule, SiteExplore} from './types.js'

// The longest address (and search text) the bar sends; anything longer is refused.
export const EXPLORE_ADDRESS_MAX = 2048

// Where a typed address may load: the site's content hosts over https, never
// a blocked (sign-in or account) host, plus the E2E home override's origin as it is.
export interface ExploreSiteScope {
	hosts: readonly HostRule[]
	blockedHosts?: readonly HostRule[]
	extraAllowedOrigin?: string
}

// The scope for a site: its content hosts; its sign-in, account and consent hosts blocked.
export function exploreAddressScope(explore: Pick<SiteExplore, 'contentHosts' | 'signInHosts' | 'consentHosts'>, extraAllowedOrigin?: string): ExploreSiteScope {
	return {hosts: explore.contentHosts, blockedHosts: [...explore.signInHosts, ...explore.consentHosts], ...(extraAllowedOrigin === undefined ? {} : {extraAllowedOrigin})}
}

// `site`: load it in the view. `search`: the site's search for the text.
// `offsite`: a web address elsewhere (Explore does not go there; it can be
// downloaded). `refused`: nothing to do with it (another scheme, credentials,
// a sign-in, account or consent page, a link over the cap).
// `search-too-long`: search text whose search page would be over the cap.
export type ExploreAddress = {kind: 'site'; url: string} | {kind: 'search'; url: string} | {kind: 'offsite'; url: string} | {kind: 'refused'} | {kind: 'search-too-long'}

const WEB_PROTOCOLS = new Set(['http:', 'https:'])
// `scheme://…`, or a scheme a browser would run or open without one.
const SCHEMED = /^[a-z][a-z0-9+.-]*:\/\//i
const NON_WEB_SCHEME = /^(?:javascript|vbscript|data|file|blob|about|view-source|filesystem|chrome|devtools|mailto|tel):/i
// A bare host with a path (`vimeo.com/123`), or a bare host alone (a link
// only when it is one of the site's hosts: `node.js` or `example.com` alone is
// search text). The last label is letters only, so `v1.2` never matches.
const BARE_HOST_WITH_PATH = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?::\d+)?[/?#]\S*$/i
const BARE_HOST_ALONE = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i
// How a link starts: a scheme, `www.`, or a host followed by a path.
const LINK_START = /^(?:[a-z][a-z0-9+.-]*:\/\/|www\.|[^\s/?#]+\.[a-z]{2,}[/?#])/i
// `www.` names a web host whatever follows.
const WWW_HOST = /^www\.[^\s/?#]+\.[^\s/?#]+(?:[/?#]\S*)?$/i

function parse(raw: string): URL | null {
	try {
		return new URL(raw)
	} catch {
		return null
	}
}

function blocked(host: string, scope: ExploreSiteScope): boolean {
	return scope.blockedHosts !== undefined && hostMatches(host, scope.blockedHosts)
}

// Main's rule for a typed address: within the cap, no credentials, and either
// the E2E origin or https on a site content host (never a blocked one) with
// the default port.
export function isExploreSiteAddress(raw: string, scope: ExploreSiteScope): boolean {
	if (raw.length > EXPLORE_ADDRESS_MAX) return false
	const url = parse(raw)
	if (!url || url.username !== '' || url.password !== '') return false
	if (scope.extraAllowedOrigin !== undefined && url.origin === scope.extraAllowedOrigin) return true
	return url.protocol === 'https:' && url.port === '' && hostMatches(url.hostname, scope.hosts) && !blocked(url.hostname, scope)
}

// A link: a scheme, `www.`, a bare host with a path, or one of the site's own
// hosts alone. Anything else (a dotted word included) is search text.
function linkFor(text: string, scope: ExploreSiteScope): URL | null | 'search' {
	if (NON_WEB_SCHEME.test(text)) return null
	if (SCHEMED.test(text)) return parse(text)
	if (WWW_HOST.test(text) || BARE_HOST_WITH_PATH.test(text) || (BARE_HOST_ALONE.test(text) && hostMatches(text, scope.hosts))) return parse(`https://${text}`)
	return 'search'
}

export function classifyExploreAddress(input: string, explore: Pick<SiteExplore, 'searchUrl' | 'canonicalAddress'>, scope: ExploreSiteScope): ExploreAddress {
	const text = input.trim()
	if (text === '') return {kind: 'refused'}
	// Over the cap, only the start is read (no full-length pattern match on a huge paste).
	if (text.length > EXPLORE_ADDRESS_MAX) return LINK_START.test(text.slice(0, 256)) || NON_WEB_SCHEME.test(text) ? {kind: 'refused'} : {kind: 'search-too-long'}
	const link = linkFor(text, scope)
	if (link === 'search') {
		const url = explore.searchUrl(text)
		return url.length > EXPLORE_ADDRESS_MAX ? {kind: 'search-too-long'} : {kind: 'search', url}
	}
	if (!link || !WEB_PROTOCOLS.has(link.protocol) || link.username !== '' || link.password !== '' || blocked(link.hostname, scope)) return {kind: 'refused'}
	if (scope.extraAllowedOrigin !== undefined && link.origin === scope.extraAllowedOrigin) return {kind: 'site', url: link.href}
	let url = link
	// A site host is always loaded over https, in the site's own form.
	if (link.port === '' && hostMatches(link.hostname, scope.hosts)) {
		url = new URL(link.href)
		url.protocol = 'https:'
		url = explore.canonicalAddress?.(url) ?? url
	}
	if (url.href.length > EXPLORE_ADDRESS_MAX) return {kind: 'refused'}
	return isExploreSiteAddress(url.href, scope) ? {kind: 'site', url: url.href} : {kind: 'offsite', url: url.href}
}
