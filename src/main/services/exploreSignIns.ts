// The composition of ADR 0022's sign-in parts for the main process: which
// listed sites the Explore session is signed in to, which of those downloads
// marked as not working, and the start identity both give a link.

import type {CommonSettings} from '@shared/types.js'
import {SuspectSignInStore} from '@main/stores/SuspectSignInStore.js'
import type {ExploreSessionService} from './ExploreSessionService.js'
import {SiteSignIns} from './SiteSignIns.js'
import {decideStartIdentity, type StartDecision} from './startIdentity.js'
import {SuspectSignIns, type SignInEvidence} from './SuspectSignIns.js'

// Explore's cookies change on most page loads; one read after they settle.
const COOKIE_SETTLE_MS = 1000

export interface ExploreSignIns {
	suspects: SuspectSignIns
	decideStart: (url: string) => StartDecision
	recordEvidence: (site: string, evidence: SignInEvidence) => void
}

export async function createExploreSignIns(deps: {userDataPath: string; session: Pick<ExploreSessionService, 'readCookies' | 'onCookiesChanged'>; settings: () => Pick<CommonSettings, 'cookiesMode' | 'exploreEnabled'>}): Promise<ExploreSignIns> {
	// A web scope reads every cookie a download from another site may get.
	const signIns = new SiteSignIns({readCookies: () => deps.session.readCookies({kind: 'web', host: 'sign-ins.invalid'})})
	const suspects = new SuspectSignIns({store: new SuspectSignInStore(deps.userDataPath), cookieFingerprint: site => signIns.cookieFingerprint(site)})
	signIns.onChange(site => suspects.cookieChanged(site))
	await signIns.refresh()
	let timer: NodeJS.Timeout | undefined
	deps.session.onCookiesChanged(() => {
		clearTimeout(timer)
		timer = setTimeout(() => void signIns.refresh(), COOKIE_SETTLE_MS)
		timer.unref?.()
	})
	return {
		suspects,
		decideStart: url => {
			const {cookiesMode, exploreEnabled} = deps.settings()
			return decideStartIdentity(url, {cookiesMode, exploreEnabled: exploreEnabled !== false, signedIn: site => signIns.signedIn(site), suspect: site => suspects.isSuspect(site)})
		},
		recordEvidence: (site, evidence) => suspects.record(site, evidence)
	}
}
