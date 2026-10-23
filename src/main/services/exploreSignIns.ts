// The composition of ADR 0022's sign-in parts for the main process: which
// listed sites the Explore session is signed in to, which of those downloads
// marked as not working, and the start identity both give a link.

import type {CommonSettings} from '@shared/types.js'
import {exploreCookieScopeFor} from '@shared/sites/exploreCookieScope.js'
import {knownSiteSignIn, signInSiteKeys, type SiteSignIn} from '@shared/sites/siteKeys.js'
import {SuspectSignInStore} from '@main/stores/SuspectSignInStore.js'
import type {ExploreSessionService} from './ExploreSessionService.js'
import {SiteSignIns} from './SiteSignIns.js'
import {decideStartIdentity, type StartDecision} from './startIdentity.js'
import type {SignInEvidence} from '@shared/signInSchemas.js'
import {SuspectSignIns, type SignInEvidenceSource} from './SuspectSignIns.js'

// Explore's cookies change on most page loads; one read after they settle.
const COOKIE_SETTLE_MS = 1000

export interface ExploreSignIns {
	suspects: SuspectSignIns
	decideStart: (url: string) => StartDecision
	recordEvidence: (site: string, evidence: SignInEvidence, source?: SignInEvidenceSource) => void
	// A site's sign-in cookie or its not-working mark changed, so `decideStart`
	// may answer differently: the queue asks again for the rows it holds.
	onStartChange: (listener: () => void) => () => void
}

// `extraSignIns`: sign-in rows that add to or replace the known sites' (the E2E
// harness makes its fixture site start signed in).
export async function createExploreSignIns(deps: {userDataPath: string; session: Pick<ExploreSessionService, 'readCookies' | 'onCookiesChanged'>; settings: () => Pick<CommonSettings, 'cookiesMode' | 'exploreEnabled'>; extraSignIns?: Readonly<Record<string, SiteSignIn>>}): Promise<ExploreSignIns> {
	const extra = deps.extraSignIns ?? {}
	const rowFor = (site: string): SiteSignIn | null => extra[site] ?? knownSiteSignIn(site)
	const sites = [...new Set([...signInSiteKeys(), ...Object.keys(extra)])]
	// Each site's cookies as a download to it gets them: a site Explore knows
	// (YouTube) keeps its account cookies to its own scope.
	const signIns = new SiteSignIns({
		readCookies: async host => {
			const scope = exploreCookieScopeFor(`https://${host}/`)
			return scope ? deps.session.readCookies(scope) : []
		},
		sites,
		rowFor
	})
	const suspects = new SuspectSignIns({store: new SuspectSignInStore(deps.userDataPath), cookieFingerprint: site => signIns.cookieFingerprint(site)})
	const startListeners = new Set<() => void>()
	const startChanged = (): void => {
		for (const listener of startListeners) listener()
	}
	signIns.onChange(site => {
		suspects.cookieChanged(site)
		startChanged()
	})
	suspects.onChange(startChanged)
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
			return decideStartIdentity(url, {cookiesMode, exploreEnabled: exploreEnabled !== false, signedIn: site => signIns.signedIn(site), suspect: site => suspects.isSuspect(site), rowFor})
		},
		recordEvidence: (site, evidence, source) => suspects.record(site, evidence, source),
		onStartChange: listener => {
			startListeners.add(listener)
			return () => startListeners.delete(listener)
		}
	}
}
