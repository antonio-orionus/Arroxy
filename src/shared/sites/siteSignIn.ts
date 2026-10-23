// Whether a site starts downloads signed in, and whether the Explore session
// is signed in to it (ADR 0022). Signed in means the site's own sign-in cookie
// is present, non-empty, unexpired, and sent to the site's own host: browsing a
// site signed out leaves other cookies behind. Presence only: the site may
// still refuse it (a suspect sign-in).

import type {SignInPolicy} from '../schemas.js'
import {knownSiteSignIn} from './siteKeys.js'
import type {ExploreCookie} from './types.js'

export function siteSignInPolicy(siteKey: string): SignInPolicy {
	return knownSiteSignIn(siteKey)?.policy ?? 'whenNeeded'
}

// The site's sign-in cookie among the session's, or null. `nowSeconds`: Unix
// seconds, as cookie expiry dates are.
export function siteSignInCookie(cookies: readonly ExploreCookie[], siteKey: string, nowSeconds: number): ExploreCookie | null {
	const signIn = knownSiteSignIn(siteKey)
	if (!signIn) return null
	return cookies.find(cookie => signIn.cookies.includes(cookie.name) && cookie.value !== '' && (cookie.session || cookie.expirationDate === undefined || cookie.expirationDate > nowSeconds) && sentTo(cookie, signIn.host)) ?? null
}

// Whether a cookie would be sent to the host (RFC 6265 domain matching).
function sentTo(cookie: ExploreCookie, host: string): boolean {
	const domain = cookie.domain.replace(/^\./, '').toLowerCase()
	return cookie.hostOnly ? host === domain : host === domain || host.endsWith(`.${domain}`)
}
