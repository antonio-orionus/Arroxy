import type {GetState, SetState, SiteCooldownSlice} from './types.js'

let unbindSiteCooldowns: (() => void) | null = null
let siteCooldownBinding = 0

// Mirrors main's rate-limit cooldowns (SiteRequestState): main decides when a
// site may be asked again; the renderer only shows it and asks for "Try now".
export function createSiteCooldownSlice(set: SetState, _get: GetState): SiteCooldownSlice {
	return {
		siteCooldowns: [],

		bindSiteCooldowns: () => {
			unbindSiteCooldowns?.()
			const binding = ++siteCooldownBinding
			let pushed = false
			unbindSiteCooldowns = window.appApi.siteRequests.onCooldownsChanged(cooldowns => {
				pushed = true
				set({siteCooldowns: cooldowns})
			})
			// A pushed list always wins over the initial read, which may answer late.
			window.appApi.siteRequests.getCooldowns().then(
				result => {
					if (result.ok && binding === siteCooldownBinding && !pushed) set({siteCooldowns: result.data})
				},
				(err: unknown) => console.warn('[site-requests] initial cooldown read failed', err)
			)
		},

		tryRateLimitedSiteNow: async site => {
			const result = await window.appApi.siteRequests.tryNow(site)
			if (!result.ok) console.warn('[site-requests] try now failed', result.error)
		}
	}
}
