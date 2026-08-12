// @vitest-environment node

import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import {InterJobSleep} from '@main/services/download/InterJobSleep.js'
import {INTER_JOB_SLEEP_MS} from '@shared/constants.js'

describe('InterJobSleep', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('blocks until the window elapses', () => {
		const sleep = new InterJobSleep()
		sleep.arm()
		expect(sleep.blocksAt(Date.now())).toBe(true)
		expect(sleep.blocksAt(Date.now() + INTER_JOB_SLEEP_MS)).toBe(false)
	})

	it('clear() drops the window and the timer', () => {
		const sleep = new InterJobSleep()
		const onWake = vi.fn()
		sleep.arm()
		sleep.sync(true, Date.now(), onWake)
		sleep.clear()

		expect(sleep.blocksAt(Date.now())).toBe(false)
		vi.advanceTimersByTime(INTER_JOB_SLEEP_MS * 2)
		expect(onWake).not.toHaveBeenCalled()
	})

	it('wakes the scheduler once the armed window expires', () => {
		const sleep = new InterJobSleep()
		const onWake = vi.fn()
		sleep.arm()
		sleep.sync(true, Date.now(), onWake)

		vi.advanceTimersByTime(INTER_JOB_SLEEP_MS)
		expect(onWake).toHaveBeenCalledOnce()
		expect(sleep.blocksAt(Date.now())).toBe(false)
	})

	// Regression: with a user-raised concurrency limit two normal-lane jobs can
	// settle at staggered times. A re-arm used to extend the deadline while
	// leaving the older timer live, so it fired early and released a waiting
	// item before the newer window had elapsed.
	it('re-arming mid-window does not let the older timer fire early', () => {
		const sleep = new InterJobSleep()
		const onWake = vi.fn()

		sleep.arm()
		sleep.sync(true, Date.now(), onWake)

		// Second normal-lane job settles part-way through the first window.
		vi.advanceTimersByTime(INTER_JOB_SLEEP_MS / 2)
		sleep.arm()

		// The original timer's deadline passes — it must not wake anything.
		vi.advanceTimersByTime(INTER_JOB_SLEEP_MS / 2)
		expect(onWake).not.toHaveBeenCalled()
		expect(sleep.blocksAt(Date.now())).toBe(true)

		// The scheduler's next pass arms a timer for the newer deadline.
		sleep.sync(true, Date.now(), onWake)
		vi.advanceTimersByTime(INTER_JOB_SLEEP_MS / 2)
		expect(onWake).toHaveBeenCalledOnce()
		expect(sleep.blocksAt(Date.now())).toBe(false)
	})

	it('drops a stale timer when nothing is waiting anymore', () => {
		const sleep = new InterJobSleep()
		const onWake = vi.fn()
		sleep.arm()
		sleep.sync(true, Date.now(), onWake)

		// Window has elapsed and no item is waiting on it.
		const afterWindow = Date.now() + INTER_JOB_SLEEP_MS
		sleep.sync(false, afterWindow, onWake)
		vi.advanceTimersByTime(INTER_JOB_SLEEP_MS * 2)

		expect(onWake).not.toHaveBeenCalled()
	})
})
