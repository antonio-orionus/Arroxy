// @vitest-environment node

import {EventEmitter} from 'node:events'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {watchInitialGpuInfoUpdate} from '@main/gpuInfoReadiness.js'

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

describe('watchInitialGpuInfoUpdate', () => {
	it('does not start counting until the budget is started', async () => {
		const emitter = new EventEmitter()
		const watch = watchInitialGpuInfoUpdate(emitter)

		// The listener is attached at construction, but nothing is timing yet —
		// this is the whole point: the process may sit here for a while before
		// the app is ready, and that wait must not eat the budget.
		await vi.advanceTimersByTimeAsync(60_000)

		watch.startBudget(2_500)
		emitter.emit('gpu-info-update')

		await expect(watch.whenUpdated).resolves.toBe(true)
	})

	it('resolves true for an update that arrived before the budget started', async () => {
		const emitter = new EventEmitter()
		const watch = watchInitialGpuInfoUpdate(emitter)

		// gpu-info-update can fire before app-ready. Attaching the listener early
		// is what stops that event from being missed.
		emitter.emit('gpu-info-update')
		watch.startBudget(2_500)

		await expect(watch.whenUpdated).resolves.toBe(true)
	})

	it('resolves false once the budget expires', async () => {
		const emitter = new EventEmitter()
		const watch = watchInitialGpuInfoUpdate(emitter)

		watch.startBudget(2_500)
		await vi.advanceTimersByTimeAsync(2_499)
		let resolved: boolean | 'pending' = 'pending'
		void watch.whenUpdated.then(value => {
			resolved = value
		})
		await Promise.resolve()
		expect(resolved).toBe('pending')

		await vi.advanceTimersByTimeAsync(1)
		await expect(watch.whenUpdated).resolves.toBe(false)
	})

	it('detaches the listener and clears the timer once settled', async () => {
		const emitter = new EventEmitter()
		const watch = watchInitialGpuInfoUpdate(emitter)

		watch.startBudget(2_500)
		emitter.emit('gpu-info-update')
		await expect(watch.whenUpdated).resolves.toBe(true)

		expect(emitter.listenerCount('gpu-info-update')).toBe(0)
		expect(vi.getTimerCount()).toBe(0)
	})

	it('ignores a second startBudget call', async () => {
		const emitter = new EventEmitter()
		const watch = watchInitialGpuInfoUpdate(emitter)

		watch.startBudget(2_500)
		await vi.advanceTimersByTimeAsync(2_000)
		watch.startBudget(2_500)
		await vi.advanceTimersByTimeAsync(500)

		await expect(watch.whenUpdated).resolves.toBe(false)
	})
})
