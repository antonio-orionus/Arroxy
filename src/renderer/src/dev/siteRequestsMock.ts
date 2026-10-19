// Browser-mock stand-in for main's rate-limit cooldowns (SiteRequestState): a
// rate-limited mock probe starts a 60 s cooldown for its site, and "Try now"
// lets the next probe there through cleanly, which ends it.

import {requestSiteFor} from '@shared/sites/index.js'
import type {AppApi} from '@shared/api.js'
import type {RateLimitEvidence, SiteCooldown} from '@shared/types.js'

const MOCK_COOLDOWN_MS = 60_000

export interface SiteRequestsMock {
	api: AppApi['siteRequests']
	// A mock probe saw a rate limit for `url`.
	rateLimited(url: string, evidence?: RateLimitEvidence): void
	// Whether a "Try now" pass lets this probe through; spends the pass and ends the cooldown.
	passesTryNow(url: string): boolean
}

export function createSiteRequestsMock(): SiteRequestsMock {
	let cooldowns: SiteCooldown[] = []
	const passes = new Set<string>()
	const listeners = new Set<(cooldowns: SiteCooldown[]) => void>()
	const publish = (next: SiteCooldown[]): void => {
		cooldowns = next
		for (const listener of listeners) listener(cooldowns)
	}

	return {
		api: {
			getCooldowns: () => Promise.resolve({ok: true, data: cooldowns}),
			tryNow: site => {
				passes.add(site)
				return Promise.resolve({ok: true, data: undefined})
			},
			onCooldownsChanged: listener => {
				listeners.add(listener)
				return () => listeners.delete(listener)
			}
		},
		rateLimited: (url, evidence = 'rateLimited') => {
			const site = requestSiteFor(url)
			publish([...cooldowns.filter(entry => entry.site !== site), {site, until: new Date(Date.now() + MOCK_COOLDOWN_MS).toISOString(), evidence}])
		},
		passesTryNow: url => {
			const site = requestSiteFor(url)
			if (!passes.delete(site)) return false
			publish(cooldowns.filter(entry => entry.site !== site))
			return true
		}
	}
}
