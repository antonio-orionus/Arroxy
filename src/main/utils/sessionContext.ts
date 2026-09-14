import type {AppSettings} from '@shared/types.js'
import type {WarmUpRecord} from '@main/services/TokenService.js'
import {parseProxySetting, proxyForLog} from './proxyUrl.js'

export interface RuntimeFacts {
	appVersion: string
	electronVersion: string
	platform: string
	arch: string
}

// What a reader needs to interpret the log lines that follow: which build is
// running, how it reaches the network, and whether the PO token warm-up worked.
// Written at session start and restated at the top of every rotated log file,
// because a user's log often begins mid-session. Ids and redacted values only.
export function describeSessionContext(runtime: RuntimeFacts, settings: AppSettings | null, lastWarmUp: WarmUpRecord | null): Record<string, unknown> {
	const tokenWarmUp = lastWarmUp ?? 'not-run'
	if (!settings) return {...runtime, settings: 'not-loaded', tokenWarmUp}
	const {common, profiles} = settings
	return {...runtime, cookiesMode: common.cookiesMode, cookiesBrowser: common.cookiesBrowser, proxy: proxyForLog(parseProxySetting(common.proxyUrl)), activeProfile: profiles.active, tokenWarmUp}
}
