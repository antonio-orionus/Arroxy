import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {QueueProgressCoalescer} from '@main/services/download/QueueProgressCoalescer.js'
import type {QueueItem} from '@shared/types.js'

const item = (id: string, progressPercent: number): QueueItem => ({id, progressPercent}) as QueueItem

describe('QueueProgressCoalescer', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('emits only the latest progress per item, once per flush window', () => {
		const emitted: QueueItem[] = []
		const coalescer = new QueueProgressCoalescer(next => emitted.push(next), 100)

		coalescer.enqueue(item('a', 10))
		coalescer.enqueue(item('a', 20))
		coalescer.enqueue(item('b', 5))
		expect(emitted).toEqual([])

		vi.advanceTimersByTime(100)
		expect(emitted.map(next => [next.id, next.progressPercent])).toEqual([
			['a', 20],
			['b', 5]
		])
	})

	it('drops queued progress that a newer state superseded', () => {
		const emitted: QueueItem[] = []
		const coalescer = new QueueProgressCoalescer(next => emitted.push(next), 100)

		coalescer.enqueue(item('a', 10))
		coalescer.drop('a')
		vi.advanceTimersByTime(100)

		expect(emitted).toEqual([])
	})

	it('flushes synchronously on demand and cancels the pending timer', () => {
		const emitted: QueueItem[] = []
		const coalescer = new QueueProgressCoalescer(next => emitted.push(next), 100)

		coalescer.enqueue(item('a', 30))
		coalescer.flushNow()
		vi.advanceTimersByTime(100)

		expect(emitted.map(next => next.id)).toEqual(['a'])
	})
})
