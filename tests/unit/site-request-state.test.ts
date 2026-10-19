// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {RATE_LIMIT_BASE_MS, RATE_LIMIT_CAP_MS, SESSION_RATE_LIMIT_MS, TRY_NOW_PASS_MS, SiteRequestState, rateLimitCooldownMs} from '@main/services/SiteRequestState.js'

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
		expect(siteRequests.admit('youtube')).toEqual({kind: 'launch', bypassed: false})
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
		expect(siteRequests.admit('youtube')).toEqual({kind: 'launch', bypassed: false})
	})

	it('keeps sites apart', () => {
		const {siteRequests} = state()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(siteRequests.admit('vimeo.com')).toEqual({kind: 'launch', bypassed: false})
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
		expect(siteRequests.admit('youtube')).toEqual({kind: 'launch', bypassed: true})
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
		siteRequests.recordCleanBypass('youtube')
		expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
		expect(siteRequests.snapshot()).toEqual([])
	})

	it('tells listeners when a cooldown starts, changes or ends early', () => {
		const {siteRequests} = state()
		const listener = vi.fn()
		const off = siteRequests.onChange(listener)
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		siteRequests.recordCleanBypass('youtube')
		expect(listener).toHaveBeenCalledTimes(2)
		expect(listener).toHaveBeenLastCalledWith([])
		off()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		expect(listener).toHaveBeenCalledTimes(2)
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
