import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {JobAuth} from '@shared/types.js'
import type {ExploreSessionService} from './ExploreSessionService.js'
import type {RunIdentity, SettingsSource} from './YtDlp.js'

// Whether a failed run may be retried with the user's Explore session. Every
// condition is read live, so signing out, leaving explore mode or flipping the
// kill switch takes effect on the next decision without a restart.
export interface ExploreGate {
	canEscalate(scope: ExploreCookieScope): Promise<boolean>
}

export function createExploreGate(deps: {settings: SettingsSource; session: Pick<ExploreSessionService, 'hasAuthCookies'>}): ExploreGate {
	return {
		async canEscalate(scope) {
			const {common} = await deps.settings.get()
			if (common.cookiesMode !== 'explore' || common.exploreEnabled === false) return false
			return deps.session.hasAuthCookies(scope)
		}
	}
}

// The run identity a job's auth asks for: a signed-in job uses the Explore
// session wherever an anonymous one would use the configured cookie mode.
export function identityFor(auth: JobAuth | undefined): RunIdentity {
	return auth === 'exploreSession' ? 'exploreSession' : 'configured'
}
