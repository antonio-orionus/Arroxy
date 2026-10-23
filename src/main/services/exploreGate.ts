import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {JobAuth} from '@shared/types.js'
import type {ExploreSessionService} from './ExploreSessionService.js'
import type {ExploreGateDecision} from './exploreEscalation.js'
import type {RunIdentity, SettingsSource} from './YtDlp.js'

// Whether a failed run may be retried with the user's Explore session. Every
// condition is read live, so signing out, leaving explore mode or flipping the
// kill switch takes effect on the next decision without a restart. A refusal
// names its reason, for the log.
export interface ExploreGate {
	canEscalate(scope: ExploreCookieScope): Promise<ExploreGateDecision>
}

export function createExploreGate(deps: {settings: SettingsSource; session: Pick<ExploreSessionService, 'hasAuthCookies'>}): ExploreGate {
	return {
		async canEscalate(scope) {
			const {common} = await deps.settings.get()
			if (common.cookiesMode !== 'explore') return {allowed: false, reason: 'notExploreMode'}
			if (common.exploreEnabled === false) return {allowed: false, reason: 'exploreDisabled'}
			return (await deps.session.hasAuthCookies(scope)) ? {allowed: true} : {allowed: false, reason: 'noCookiesForHost'}
		}
	}
}

// The run identity a job's auth asks for: a signed-in job uses the Explore
// session wherever an anonymous one would use the configured cookie mode.
export function identityFor(auth: JobAuth | undefined): RunIdentity {
	return auth === 'exploreSession' ? 'exploreSession' : 'configured'
}
