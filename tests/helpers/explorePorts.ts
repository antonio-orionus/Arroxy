import {vi} from 'vite-plus/test'
import type {ExploreGateDecision} from '@main/services/exploreEscalation.js'
import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {ExploreGateRefusal} from '@shared/escalationSchemas.js'
import type {ExploreSignInState} from '@shared/schemas.js'

// The Explore ports a PhaseContext needs. Signed out by default, so an
// anonymous job never escalates and an escalated one is refused, unless a test
// opts in. A refused gate gives `refusal` as its reason.
export function explorePorts(opts: {signedIn?: boolean; refusal?: ExploreGateRefusal; verified?: ExploreSignInState} = {}) {
	const decision: ExploreGateDecision = opts.signedIn === true ? {allowed: true} : {allowed: false, reason: opts.refusal ?? 'noCookiesForHost'}
	const canEscalate = vi.fn((_scope: ExploreCookieScope): Promise<ExploreGateDecision> => Promise.resolve(decision))
	const verifySignedIn = vi.fn((_scope: ExploreCookieScope): Promise<ExploreSignInState> => Promise.resolve(opts.verified ?? 'signedOut'))
	return {exploreGate: {canEscalate}, exploreSession: {verifySignedIn}}
}
