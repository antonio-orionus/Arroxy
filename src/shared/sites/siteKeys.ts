// Which site a link belongs to, as one key every part of the app shares: the
// rate-limit cooldown, the launch gate, and what the user reads. A known site
// is one key across all its hosts, short links included; any other site is its
// registrable domain (the public suffix list decides, so `news.bbc.co.uk` is
// `bbc.co.uk` and each `*.github.io` owner is a site of its own). A host with
// no registrable domain (an IP address, `localhost`) is itself.

import {getDomain} from 'tldts'
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

interface KnownSite {
	key: string
	label: string
	matches: (host: string) => boolean
	signedInPacing?: Partial<SignedInPacing>
}

function onDomains(domains: readonly string[]): (host: string) => boolean {
	return host => domains.some(domain => host === domain || host.endsWith(`.${domain}`))
}

const KNOWN_SITES: readonly KnownSite[] = [
	{key: 'youtube', label: 'YouTube', matches: isYouTubeHostname},
	{key: 'instagram', label: 'Instagram', matches: onDomains(['instagram.com', 'instagr.am']), signedInPacing: {spacingMs: 8000, windowMs: 11 * 60_000, perWindow: 11, entriesPerLaunch: 12}},
	{key: 'x', label: 'X', matches: onDomains(['x.com', 'twitter.com', 't.co']), signedInPacing: {windowMs: 15 * 60_000, perWindow: 30, entriesPerLaunch: 20}}
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

// How a site key reads to the user: a known site's name, else the key itself.
export function siteKeyLabel(key: string): string {
	return KNOWN_SITES.find(site => site.key === key)?.label ?? key
}
