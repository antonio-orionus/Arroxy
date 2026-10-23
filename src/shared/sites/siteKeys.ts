// Which site a link belongs to, as one key every part of the app shares: the
// rate-limit cooldown, the launch gate, and what the user reads. A known site
// is one key across all its hosts, short links included; any other site is its
// registrable domain (the public suffix list decides, so `news.bbc.co.uk` is
// `bbc.co.uk` and each `*.github.io` owner is a site of its own). A host with
// no registrable domain (an IP address, `localhost`) is itself.

import {getDomain} from 'tldts'
import type {SignInPolicy} from '../signInSchemas.js'
import {isYouTubeHostname} from './youtubeHost.js'

// How launches signed in to the Explore session are paced on one site, before
// the Pacing preset scales it. The numbers are first guesses (ADR 0022), kept
// here to be tuned from logs.
export interface SignedInPacing {
	// Launches running at once.
	atOnce: number
	// Between two starts, plus up to `jitterMs` either way.
	spacingMs: number
	jitterMs: number
	// A sliding window and how many launches it allows. A listing costs one
	// launch per `entriesPerLaunch` entries it returned.
	windowMs: number
	perWindow: number
	entriesPerLaunch: number
}

// How the Explore session is used on a site: its policy, and the cookie that
// shows a sign-in, checked on the host the site sends it to.
export interface SiteSignIn {
	policy: SignInPolicy
	cookies: readonly string[]
	host: string
	// The page Explore opens for the user to sign in again.
	page: string
}

interface KnownSite {
	key: string
	label: string
	matches: (host: string) => boolean
	signedInPacing?: Partial<SignedInPacing>
	signIn?: SiteSignIn
}

function onDomains(domains: readonly string[]): (host: string) => boolean {
	return host => domains.some(domain => host === domain || host.endsWith(`.${domain}`))
}

const KNOWN_SITES: readonly KnownSite[] = [
	{key: 'youtube', label: 'YouTube', matches: isYouTubeHostname},
	{key: 'instagram', label: 'Instagram', matches: onDomains(['instagram.com', 'instagr.am']), signedInPacing: {spacingMs: 8000, windowMs: 11 * 60_000, perWindow: 11, entriesPerLaunch: 12}, signIn: {policy: 'first', cookies: ['sessionid'], host: 'www.instagram.com', page: 'https://www.instagram.com/'}},
	{key: 'x', label: 'X', matches: onDomains(['x.com', 'twitter.com', 't.co']), signedInPacing: {windowMs: 15 * 60_000, perWindow: 30, entriesPerLaunch: 20}, signIn: {policy: 'first', cookies: ['auth_token'], host: 'api.x.com', page: 'https://x.com/'}}
]

export function siteKeyForHost(hostname: string): string {
	const host = hostname.toLowerCase().replace(/\.$/, '')
	if (host === '') return 'unknown'
	const known = KNOWN_SITES.find(site => site.matches(host))
	if (known) return known.key
	return getDomain(host, {allowPrivateDomains: true}) ?? host
}

// A site's own signed-in pacing, where it differs from the defaults.
export function knownSignedInPacing(key: string): Partial<SignedInPacing> {
	return KNOWN_SITES.find(site => site.key === key)?.signedInPacing ?? {}
}

// A site's sign-in row; null for a site that has none (when needed, by ADR 0011).
export function knownSiteSignIn(key: string): SiteSignIn | null {
	return KNOWN_SITES.find(site => site.key === key)?.signIn ?? null
}

// The sites that have a sign-in row.
export function signInSiteKeys(): string[] {
	return KNOWN_SITES.flatMap(site => (site.signIn ? [site.key] : []))
}

// How a site key reads to the user: a known site's name, else the key itself.
export function siteKeyLabel(key: string): string {
	return KNOWN_SITES.find(site => site.key === key)?.label ?? key
}
