// Which Explore cookies a run on one URL may use, and when the Explore session
// counts as signed in for it. Pure: the session adapter applies it to the
// partition's cookies, and the jar writer applies it again to what it writes.

import {hostMatches} from './hostRules.js'
import {siteById, siteForUrl} from './index.js'
import type {ExploreCookie, HostRule, SiteId} from './types.js'

// `site`: a site with an Explore capability (YouTube): its own cookie domains,
// and its own sign-in rule. `web`: any other site, by the URL's host: every
// cookie in the session but the account cookies of the sites above.
export type ExploreCookieScope = {kind: 'site'; siteId: SiteId} | {kind: 'web'; host: string}

const WEB_PROTOCOLS = new Set(['http:', 'https:'])

// Every site with an Explore capability is one entry here.
const EXPLORE_SITE_IDS: readonly SiteId[] = ['youtube']
const ACCOUNT_COOKIE_HOSTS: readonly HostRule[] = EXPLORE_SITE_IDS.flatMap(id => siteById(id).explore?.accountCookieHosts ?? [])

// The scope for a URL; null for anything that is not a web page.
export function exploreCookieScopeFor(raw: string): ExploreCookieScope | null {
	let url: URL
	try {
		url = new URL(raw)
	} catch {
		return null
	}
	if (!WEB_PROTOCOLS.has(url.protocol) || url.hostname === '') return null
	const site = siteForUrl(url.href)
	if (site.explore) return {kind: 'site', siteId: site.id}
	return {kind: 'web', host: url.hostname.toLowerCase().replace(/\.$/, '')}
}

function cookieHost(cookie: ExploreCookie): string {
	return cookie.domain.replace(/^\./, '').toLowerCase()
}

export function inExploreCookieScope(cookie: ExploreCookie, scope: ExploreCookieScope): boolean {
	const host = cookieHost(cookie)
	if (scope.kind === 'web') return !hostMatches(host, ACCOUNT_COOKIE_HOSTS)
	const domains = siteById(scope.siteId).explore?.cookieDomains ?? []
	return domains.some(domain => host === domain || host.endsWith(`.${domain}`))
}

// Whether a cookie would be sent to the host (RFC 6265 domain matching).
function sentTo(cookie: ExploreCookie, host: string): boolean {
	const domain = cookieHost(cookie)
	return cookie.hostOnly ? host === domain : host === domain || host.endsWith(`.${domain}`)
}

// A presence check, never a validity one. On another site Explore cannot tell
// a sign-in cookie from any other, so any cookie the site would be sent counts.
export function exploreScopeSignedIn(cookies: readonly ExploreCookie[], scope: ExploreCookieScope): boolean {
	const inScope = cookies.filter(cookie => inExploreCookieScope(cookie, scope))
	if (scope.kind === 'web') return inScope.some(cookie => sentTo(cookie, scope.host))
	return siteById(scope.siteId).explore?.isSignedIn(inScope) ?? false
}
