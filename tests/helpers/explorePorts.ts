import {vi} from 'vite-plus/test'
import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {ExploreSignInState} from '@shared/schemas.js'

// The Explore ports a PhaseContext needs. Signed out by default, so an
// anonymous job never escalates and an escalated one is refused, unless a test opts in.
export function explorePorts(opts: {signedIn?: boolean; verified?: ExploreSignInState} = {}) {
	const canEscalate = vi.fn((_scope: ExploreCookieScope) => Promise.resolve(opts.signedIn ?? false))
	const verifySignedIn = vi.fn((_scope: ExploreCookieScope): Promise<ExploreSignInState> => Promise.resolve(opts.verified ?? 'signedOut'))
	return {exploreGate: {canEscalate}, exploreSession: {verifySignedIn}}
}
