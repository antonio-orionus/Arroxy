// Which identity a job's first launch uses (ADR 0022): the Explore session when
// the link's site starts signed in and the session is signed in to it, else
// anonymous with the reason. Decided before the first probe, and again for the
// site a redirect leads to. What follows the first launch (escalation, the
// safety launch) is decided elsewhere.

import type {CookiesMode} from '@shared/schemas.js'
import type {AuthBasis} from '@shared/signInSchemas.js'
import type {StartAnonymousReason} from '@shared/escalationSchemas.js'
import {requestSiteFor} from '@shared/sites/index.js'
import {siteSignInPolicy, type SignInRowFor} from '@shared/sites/siteSignIn.js'

export interface StartIdentityInputs {
	cookiesMode: CookiesMode | undefined
	exploreEnabled: boolean
	// Whether the Explore session holds the site's own sign-in cookie.
	signedIn: (site: string) => boolean
	// Whether downloads marked the site's sign-in as not working.
	suspect: (site: string) => boolean
	// The sites' sign-in rows; the known sites' when absent.
	rowFor?: SignInRowFor
}

export type StartDecision = {site: string; auth: 'exploreSession'; basis: Extract<AuthBasis, 'siteDefault'>} | {site: string; auth: 'anonymous'; reason: StartAnonymousReason}

export function decideStartIdentity(url: string, inputs: StartIdentityInputs): StartDecision {
	const site = requestSiteFor(url)
	const anonymous = (reason: StartAnonymousReason): StartDecision => ({site, auth: 'anonymous', reason})
	if (siteSignInPolicy(site, inputs.rowFor) !== 'first') return anonymous('notSignInFirst')
	if (inputs.cookiesMode !== 'explore') return anonymous('notExploreMode')
	if (!inputs.exploreEnabled) return anonymous('exploreDisabled')
	if (inputs.suspect(site)) return anonymous('signInSuspect')
	if (!inputs.signedIn(site)) return anonymous('noSignInCookie')
	return {site, auth: 'exploreSession', basis: 'siteDefault'}
}
