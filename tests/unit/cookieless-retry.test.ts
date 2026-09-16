import {describe, expect, it} from 'vitest'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'

describe('CookielessRetry', () => {
	it('stops a limited cookie run until the session has a verdict', () => {
		const retry = new CookielessRetry()
		expect(retry.stopLimitedRun()).toBe(true)
		expect(retry.startWithoutCookies()).toBe(false)
	})

	it('starts later downloads without cookies once that gave full quality', () => {
		const retry = new CookielessRetry()
		retry.record('full-quality')
		expect(retry.startWithoutCookies()).toBe(true)
		expect(retry.stopLimitedRun()).toBe(false)
	})

	it.each(['still-limited', 'failed'] as const)('gives up for the session after a %s cookieless run', outcome => {
		const retry = new CookielessRetry()
		retry.record('full-quality')
		retry.record(outcome)
		expect(retry.current).toBe('no-help')
		expect(retry.startWithoutCookies()).toBe(false)
		expect(retry.stopLimitedRun()).toBe(false)
	})
})
