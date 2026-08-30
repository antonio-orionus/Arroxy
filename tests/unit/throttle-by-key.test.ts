import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {throttleByKey} from '@main/utils/throttleByKey.js'

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

describe('throttleByKey', () => {
	it('delivers the newest value per key once per interval, not every push', () => {
		const delivered: string[] = []
		const throttle = throttleByKey<string, string>(v => delivered.push(v), 100)

		throttle.push('a', 'a1')
		throttle.push('a', 'a2')
		throttle.push('a', 'a3')
		expect(delivered).toEqual([])

		vi.advanceTimersByTime(100)
		expect(delivered).toEqual(['a3'])
	})

	it('keys are independent — a busy key never starves a quiet one', () => {
		const delivered: string[] = []
		const throttle = throttleByKey<string, string>(v => delivered.push(v), 100)

		throttle.push('a', 'a1')
		throttle.push('b', 'b1')
		vi.advanceTimersByTime(100)

		expect(delivered.sort()).toEqual(['a1', 'b1'])
	})

	// The ordering guarantee the warmup splash depends on: a phase transition must
	// never be overtaken by a stale progress value, or the bar rewinds.
	it('flush delivers the buffered value immediately and cancels its timer', () => {
		const delivered: string[] = []
		const throttle = throttleByKey<string, string>(v => delivered.push(v), 100)

		throttle.push('a', 'a1')
		throttle.flush('a')
		expect(delivered).toEqual(['a1'])

		vi.advanceTimersByTime(1000)
		expect(delivered).toEqual(['a1'])
	})

	it('flush on an empty or unknown key is a no-op', () => {
		const delivered: string[] = []
		const throttle = throttleByKey<string, string>(v => delivered.push(v), 100)

		throttle.flush('never-pushed')
		throttle.push('a', 'a1')
		throttle.flush('a')
		throttle.flush('a')

		expect(delivered).toEqual(['a1'])
	})

	it('flushAll drains every key so the final progress value is never dropped', () => {
		const delivered: string[] = []
		const throttle = throttleByKey<string, string>(v => delivered.push(v), 100)

		throttle.push('a', 'a1')
		throttle.push('b', 'b1')
		throttle.flushAll()

		expect(delivered.sort()).toEqual(['a1', 'b1'])
		vi.advanceTimersByTime(1000)
		expect(delivered).toHaveLength(2)
	})

	it('re-arms after a delivery so a long-running source keeps reporting', () => {
		const delivered: string[] = []
		const throttle = throttleByKey<string, string>(v => delivered.push(v), 100)

		throttle.push('a', 'a1')
		vi.advanceTimersByTime(100)
		throttle.push('a', 'a2')
		vi.advanceTimersByTime(100)

		expect(delivered).toEqual(['a1', 'a2'])
	})
})
