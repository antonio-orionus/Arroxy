// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {RATE_LIMIT_BASE_MS, RATE_LIMIT_CAP_MS, SESSION_RATE_LIMIT_MS, TRY_NOW_PASS_MS, SiteRequestState, rateLimitCooldownMs, type SiteAdmission, type SiteRequestRun} from '@main/services/SiteRequestState.js'

const MINUTE = 60_000

function fakeClock(start = 1_000_000): {now: () => number; advance: (ms: number) => void} {
	let current = start
	return {now: () => current, advance: ms => (current += ms)}
}

function state(opts: {random?: number; route?: () => string} = {}) {
	const clock = fakeClock()
	const siteRequests = new SiteRequestState({now: clock.now, random: () => opts.random ?? 1, route: opts.route ?? (() => 'direct')})
	return {clock, siteRequests}
}

const WEBPAGE_429 = 'WARNING: [youtube] test: Unable to download webpage: HTTP Error 429: Too Many Requests'
const SESSION_LIMIT = "ERROR: [youtube] test: This content isn't available, try again later. The current session has been rate-limited by YouTube for up to an hour."

function launched(admission: SiteAdmission): SiteRequestRun {
	if (admission.kind !== 'launch') throw new Error(`expected a launch, got a wait until ${admission.until}`)
	return admission.run
}

function admitted(admission: SiteAdmission): {bypassed: boolean} {
	return {bypassed: launched(admission).bypassed}
}

describe('rateLimitCooldownMs', () => {
	it('starts at 60 s', () => {
		expect(rateLimitCooldownMs('rateLimited', 0, () => 0)).toBe(RATE_LIMIT_BASE_MS)
		expect(rateLimitCooldownMs('rateLimited', 0, () => 1)).toBe(RATE_LIMIT_BASE_MS)
	})

	it('doubles the ceiling on each repeat, with full jitter above the 60 s floor', () => {
		expect(rateLimitCooldownMs('rateLimited', 1, () => 1)).toBe(2 * MINUTE)
		expect(rateLimitCooldownMs('rateLimited', 1, () => 0)).toBe(MINUTE)
		expect(rateLimitCooldownMs('rateLimited', 2, () => 1)).toBe(4 * MINUTE)
		expect(rateLimitCooldownMs('rateLimited', 2, () => 0.5)).toBe(2.5 * MINUTE)
		expect(rateLimitCooldownMs('rateLimited', 3, () => 1)).toBe(8 * MINUTE)
	})

	it('caps at 15 minutes however many repeats', () => {
		expect(rateLimitCooldownMs('rateLimited', 4, () => 1)).toBe(RATE_LIMIT_CAP_MS)
		expect(rateLimitCooldownMs('rateLimited', 40, () => 1)).toBe(RATE_LIMIT_CAP_MS)
		expect(RATE_LIMIT_CAP_MS).toBe(15 * MINUTE)
	})

	it('waits 30 minutes on the session rate limit, which YouTube holds for up to an hour', () => {
		expect(rateLimitCooldownMs('sessionRateLimited', 0, () => 0)).toBe(SESSION_RATE_LIMIT_MS)
		expect(SESSION_RATE_LIMIT_MS).toBe(30 * MINUTE)
	})
})

describe('SiteRequestState', () => {
	it('lets every request through until a rate limit is seen', () => {
		const {siteRequests} = state()
		expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
		expect(admitted(siteRequests.admit('youtube'))).toEqual({bypassed: false})
	})

	it('holds new requests to the site for the cooldown, then releases them', () => {
		const {clock, siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		const until = clock.now() + RATE_LIMIT_BASE_MS
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(until)
		expect(siteRequests.admit('youtube')).toEqual({kind: 'wait', until})
		clock.advance(RATE_LIMIT_BASE_MS - 1)
		expect(siteRequests.admit('youtube').kind).toBe('wait')
		clock.advance(1)
		expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
		expect(admitted(siteRequests.admit('youtube'))).toEqual({bypassed: false})
	})

	it('keeps sites apart', () => {
		const {siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(admitted(siteRequests.admit('vimeo.com'))).toEqual({bypassed: false})
	})

	it('keeps network routes apart: a limit seen through one proxy does not hold another', () => {
		let route = 'direct'
		const {siteRequests} = state({route: () => route})
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		route = 'socks5://10.0.0.1:1080'
		expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
		route = 'direct'
		expect(siteRequests.rateLimitedUntil('youtube')).not.toBeNull()
	})

	it('treats more limits during the same cooldown as one burst', () => {
		const {clock, siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		clock.advance(10_000)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		// Still the first cooldown's length, now counted from the latest limit.
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(clock.now() + RATE_LIMIT_BASE_MS)
	})

	it('doubles on a repeat within the window after the cooldown ends', () => {
		const {clock, siteRequests} = state({random: 1})
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		clock.advance(RATE_LIMIT_BASE_MS + 5_000)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(clock.now() + 2 * MINUTE)
		clock.advance(2 * MINUTE + 5_000)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(clock.now() + 4 * MINUTE)
	})

	it('starts over at 60 s once a quiet window has passed', () => {
		const {clock, siteRequests} = state({random: 1})
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		clock.advance(RATE_LIMIT_BASE_MS + 5_000)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		clock.advance(2 * MINUTE + RATE_LIMIT_CAP_MS)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(clock.now() + RATE_LIMIT_BASE_MS)
	})

	it('never shortens a running cooldown', () => {
		const {clock, siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'sessionRateLimited')
		const until = clock.now() + SESSION_RATE_LIMIT_MS
		clock.advance(MINUTE)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(until)
		expect(siteRequests.snapshot()).toEqual([{site: 'youtube', until: new Date(until).toISOString(), evidence: 'sessionRateLimited'}])
	})

	it('"Try now" lets exactly one request through the cooldown', () => {
		const {siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.allowOnce('youtube')
		expect(admitted(siteRequests.admit('youtube'))).toEqual({bypassed: true})
		expect(siteRequests.admit('youtube').kind).toBe('wait')
	})

	it('drops an unused "Try now" pass after a short while', () => {
		const {clock, siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.allowOnce('youtube')
		clock.advance(TRY_NOW_PASS_MS + 1)
		expect(siteRequests.admit('youtube').kind).toBe('wait')
	})

	it('ends the cooldown when the request let through comes back clean', () => {
		const {siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.allowOnce('youtube')
		launched(siteRequests.admit('youtube')).finish('', true)
		expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
		expect(siteRequests.snapshot()).toEqual([])
	})

	it('ends no cooldown on a clean answer to a request the cooldown did not hold', () => {
		const {clock, siteRequests} = state()
		const run = launched(siteRequests.admit('youtube'))
		clock.advance(1_000)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		run.finish('', true)
		expect(siteRequests.rateLimitedUntil('youtube')).not.toBeNull()
	})

	// A long "Try now" download can come back clean after another request met
	// a new limit; that newer limit stands.
	it('a "Try now" request that comes back clean does not end a newer cooldown', () => {
		const {clock, siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.allowOnce('youtube')
		const run = launched(siteRequests.admit('youtube'))
		clock.advance(1_000)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		run.finish('', true)
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(clock.now() + RATE_LIMIT_BASE_MS)
	})

	it('tells listeners when a cooldown starts, Try now grants a pass, or the cooldown ends early', () => {
		const {siteRequests} = state()
		const listener = vi.fn()
		const off = siteRequests.onChange(listener)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.allowOnce('youtube')
		launched(siteRequests.admit('youtube')).finish('', true)
		expect(listener).toHaveBeenCalledTimes(3)
		expect(listener).toHaveBeenLastCalledWith([])
		off()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(listener).toHaveBeenCalledTimes(3)
	})

	it('tells listeners the new route’s cooldowns when the route changes', () => {
		let route = 'direct'
		const {siteRequests} = state({route: () => route})
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		const listener = vi.fn()
		siteRequests.onChange(listener)
		route = 'http://proxy:8080'
		siteRequests.routeChanged()
		expect(listener).toHaveBeenCalledWith([])
	})

	it('lists only the current route’s running cooldowns', () => {
		let route = 'direct'
		const {clock, siteRequests} = state({route: () => route})
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		route = 'http://proxy:8080'
		siteRequests.recordRateLimit('vimeo.com', 'rateLimited')
		expect(siteRequests.snapshot().map(entry => entry.site)).toEqual(['vimeo.com'])
		clock.advance(RATE_LIMIT_BASE_MS)
		expect(siteRequests.snapshot()).toEqual([])
	})
})

// One admitted run, from admission to its exit.
describe('SiteRequestRun', () => {
	it('starts the cooldown at the first rate-limit line, before the run ends', () => {
		const {clock, siteRequests} = state()
		const listener = vi.fn()
		siteRequests.onChange(listener)
		const run = launched(siteRequests.admit('youtube'))

		run.observe(WEBPAGE_429)
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(clock.now() + RATE_LIMIT_BASE_MS)
		run.observe(WEBPAGE_429)
		run.finish(WEBPAGE_429, true)
		expect(listener).toHaveBeenCalledOnce()
	})

	it('upgrades to the session limit when it shows later in the same run', () => {
		const {clock, siteRequests} = state()
		const run = launched(siteRequests.admit('youtube'))
		run.observe(WEBPAGE_429)
		run.finish(`${WEBPAGE_429}\n${SESSION_LIMIT}`, false)
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(clock.now() + SESSION_RATE_LIMIT_MS)
	})

	it('records the limit against the route the run went out on', () => {
		let route = 'direct'
		const {siteRequests} = state({route: () => route})
		const run = launched(siteRequests.admit('youtube'))
		route = 'http://proxy:8080'
		run.finish(WEBPAGE_429, true)
		expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
		route = 'direct'
		expect(siteRequests.rateLimitedUntil('youtube')).not.toBeNull()
	})

	describe('the check right before the spawn', () => {
		it('holds a run admitted before a cooldown started', () => {
			const {clock, siteRequests} = state()
			const run = launched(siteRequests.admit('youtube'))
			siteRequests.recordRateLimit('youtube', 'rateLimited')
			expect(run.recheck('direct')).toBe(clock.now() + RATE_LIMIT_BASE_MS)
		})

		it('does not spend a "Try now" pass meant for another request', () => {
			const {siteRequests} = state()
			const run = launched(siteRequests.admit('youtube'))
			siteRequests.recordRateLimit('youtube', 'rateLimited')
			siteRequests.allowOnce('youtube')
			expect(run.recheck('direct')).not.toBeNull()
			expect(admitted(siteRequests.admit('youtube'))).toEqual({bypassed: true})
		})

		it('lets the "Try now" request through, whatever started meanwhile', () => {
			const {siteRequests} = state()
			siteRequests.recordRateLimit('youtube', 'rateLimited')
			siteRequests.allowOnce('youtube')
			const run = launched(siteRequests.admit('youtube'))
			siteRequests.recordRateLimit('youtube', 'sessionRateLimited')
			expect(run.recheck('direct')).toBeNull()
		})

		it('reads the cooldown of the route the process goes out on', () => {
			let route = 'direct'
			const {siteRequests} = state({route: () => route})
			route = 'http://proxy:8080'
			siteRequests.recordRateLimit('youtube', 'rateLimited')
			route = 'direct'
			const run = launched(siteRequests.admit('youtube'))
			expect(run.recheck('http://proxy:8080')).not.toBeNull()
		})

		// The proxy setting can change after the run read it for its arguments;
		// the run's limit belongs to the proxy it actually used.
		it('records the limit against the route the process went out on, not the current setting', () => {
			let route = 'direct'
			const {siteRequests} = state({route: () => route})
			const run = launched(siteRequests.admit('youtube'))
			route = 'http://proxy:8080'
			expect(run.recheck('direct')).toBeNull()
			run.finish(WEBPAGE_429, true)
			expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
			route = 'direct'
			expect(siteRequests.rateLimitedUntil('youtube')).not.toBeNull()
		})

		it('lets a run that ignores the cooldown through', () => {
			const {siteRequests} = state()
			const run = launched(siteRequests.admit('youtube', {honorCooldown: false}))
			siteRequests.recordRateLimit('youtube', 'rateLimited')
			expect(run.recheck('direct')).toBeNull()
		})
	})
})

// Probe slots ask before they hand a waiting probe a slot, without spending
// the pass: the pass is spent where the run is admitted (YtDlp.run).
describe('SiteRequestState — wouldAdmit', () => {
	it('says yes outside a cooldown, no inside one, and yes again once it ends', () => {
		const {clock, siteRequests} = state()
		expect(siteRequests.wouldAdmit('youtube')).toBe(true)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(siteRequests.wouldAdmit('youtube')).toBe(false)
		expect(siteRequests.wouldAdmit('vimeo.com')).toBe(true)
		clock.advance(RATE_LIMIT_BASE_MS)
		expect(siteRequests.wouldAdmit('youtube')).toBe(true)
	})

	it('says yes while a Try now pass waits, and leaves the pass for the run', () => {
		const {clock, siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.allowOnce('youtube')
		expect(siteRequests.wouldAdmit('youtube')).toBe(true)
		expect(siteRequests.wouldAdmit('youtube')).toBe(true)
		expect(admitted(siteRequests.admit('youtube'))).toEqual({bypassed: true})
		expect(siteRequests.wouldAdmit('youtube')).toBe(false)
		siteRequests.allowOnce('youtube')
		clock.advance(TRY_NOW_PASS_MS)
		expect(siteRequests.wouldAdmit('youtube')).toBe(false)
	})
})
