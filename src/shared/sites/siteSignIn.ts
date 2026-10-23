// Whether a site starts downloads signed in, and whether the Explore session
// is signed in to it (ADR 0022). Signed in means the site's own sign-in cookie
// is present, non-empty, unexpired, and sent to the site's own host: browsing a
// site signed out leaves other cookies behind. Presence only: the site may
// still refuse it (a suspect sign-in).

import type {SignInPolicy} from '../signInSchemas.js'
import {knownSiteSignIn, type SiteSignIn} from './siteKeys.js'
import type {ExploreCookie} from './types.js'

// Where a site's sign-in row is read from: the known sites unless a caller
// adds its own (the E2E harness's fixture site).
export type SignInRowFor = (siteKey: string) => SiteSignIn | null

export function siteSignInPolicy(siteKey: string, rowFor: SignInRowFor = knownSiteSignIn): SignInPolicy {
	return rowFor(siteKey)?.policy ?? 'whenNeeded'
}

// The site's sign-in cookie among the session's, or null. `nowSeconds`: Unix
// seconds, as cookie expiry dates are.
export function siteSignInCookie(cookies: readonly ExploreCookie[], siteKey: string, nowSeconds: number, rowFor: SignInRowFor = knownSiteSignIn): ExploreCookie | null {
	const signIn = rowFor(siteKey)
	if (!signIn) return null
	return cookies.find(cookie => signIn.cookies.includes(cookie.name) && cookie.value !== '' && (cookie.session || cookie.expirationDate === undefined || cookie.expirationDate > nowSeconds) && sentTo(cookie, signIn.host)) ?? null
}

// Whether a cookie would be sent to the host (RFC 6265 domain matching).
function sentTo(cookie: ExploreCookie, host: string): boolean {
	const domain = cookie.domain.replace(/^\./, '').toLowerCase()
	return cookie.hostOnly ? host === domain : host === domain || host.endsWith(`.${domain}`)
}
