import type {AppSettings, CookiesBrowser, JobAuth} from '@shared/types.js'
import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import {getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {nonEmpty} from '@shared/format.js'

export type ResolvedCookies = {kind: 'file'; path: string} | {kind: 'browser'; browser: CookiesBrowser} | {kind: 'session'; scope: ExploreCookieScope}

// The selected mode is the single identity source: a job never mixes two.
// `scope` is the run URL's Explore cookie scope, null when it has none.
export function resolveCookies(settings: AppSettings, auth: JobAuth, scope: ExploreCookieScope | null): ResolvedCookies | null {
	const common = settings.common
	if (getIncompleteCookiesConfigIssue(common)) return null
	const mode = common?.cookiesMode ?? 'off'
	switch (mode) {
		case 'off':
			return null
		case 'file': {
			const path = nonEmpty(common?.cookiesPath?.trim())
			return path ? {kind: 'file', path} : null
		}
		case 'browser': {
			const browser = common?.cookiesBrowser
			return browser ? {kind: 'browser', browser} : null
		}
		case 'explore':
			return auth === 'exploreSession' && scope ? {kind: 'session', scope} : null
	}
}
