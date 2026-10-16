import type {AppSettings, CookiesBrowser, JobAuth} from '@shared/types.js'
import type {SiteId} from '@shared/sites/types.js'
import {getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {nonEmpty} from '@shared/format.js'
import {siteById} from '@shared/sites/index.js'

export type ResolvedCookies = {kind: 'file'; path: string} | {kind: 'browser'; browser: CookiesBrowser} | {kind: 'session'; siteId: SiteId}

// The selected mode is the single identity source: a job never mixes two.
export function resolveCookies(settings: AppSettings, auth: JobAuth, siteId: SiteId): ResolvedCookies | null {
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
			return auth === 'exploreSession' && siteById(siteId).explore ? {kind: 'session', siteId} : null
	}
}
