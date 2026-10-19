// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {ExploreSpawnGate} from '@main/services/exploreSpawnGate.js'

function deferred<T>(): {promise: Promise<T>; resolve: (value: T) => void} {
	let resolve!: (value: T) => void
	const promise = new Promise<T>(r => {
		resolve = r
	})
	return {promise, resolve}
}

// Lets every queued microtask (and the gate's internal awaits) settle.
async function settle(): Promise<void> {
	for (let i = 0; i < 10; i++) await Promise.resolve()
}

describe('ExploreSpawnGate', () => {
	it('defaults to two concurrent spawns, 5 s spacing and six spawns per job attempt', async () => {
		const sleep = vi.fn((_ms: number) => Promise.resolve())
		const gate = new ExploreSpawnGate({now: () => 0, sleep})
		for (let i = 0; i < 6; i++) expect(await gate.run('job', () => Promise.resolve('ok'))).toBe('ok')
		expect(await gate.run('job', () => Promise.resolve('ok'))).toEqual({kind: 'cap-exceeded'})
		expect(sleep.mock.calls.map(call => call[0])).toEqual([5000, 10000, 15000, 20000, 25000])
	})

	it('runs at most two escalated spawns at once', async () => {
		const gate = new ExploreSpawnGate({minSpacingMs: 0})
		const runs = [deferred<string>(), deferred<string>(), deferred<string>()]
		const started: number[] = []
		const results = runs.map((d, i) =>
			gate.run(`job-${i}`, () => {
				started.push(i)
				return d.promise
			})
		)
		await settle()
		expect(started).toEqual([0, 1])

		runs[0].resolve('first')
		await settle()
		expect(started).toEqual([0, 1, 2])

		runs[1].resolve('second')
		runs[2].resolve('third')
		expect(await Promise.all(results)).toEqual(['first', 'second', 'third'])
	})

	it('spaces escalated spawn starts by at least 5 s', async () => {
		let clock = 1_000
		const sleep = vi.fn((ms: number) => {
			clock += ms
			return Promise.resolve()
		})
		const gate = new ExploreSpawnGate({now: () => clock, sleep})
		const startedAt: number[] = []
		const spawn = (): Promise<void> => {
			startedAt.push(clock)
			return Promise.resolve()
		}

		await gate.run('a', spawn)
		await gate.run('b', spawn)
		clock += 12_000
		await gate.run('c', spawn)

		expect(startedAt).toEqual([1_000, 6_000, 18_000])
		expect(sleep).toHaveBeenCalledOnce()
		expect(sleep).toHaveBeenCalledWith(5_000, undefined)
	})

	it('staggers two spawns that acquire slots at the same moment', async () => {
		const sleep = vi.fn((_ms: number) => Promise.resolve())
		const gate = new ExploreSpawnGate({now: () => 0, sleep})
		await Promise.all([gate.run('a', () => Promise.resolve()), gate.run('b', () => Promise.resolve())])
		expect(sleep.mock.calls.map(call => call[0])).toEqual([5_000])
	})

	it('refuses the seventh signed-in spawn of one job attempt', async () => {
		const gate = new ExploreSpawnGate({minSpacingMs: 0})
		const fn = vi.fn(() => Promise.resolve('ok'))
		for (let i = 0; i < 6; i++) expect(await gate.run('job-1', fn)).toBe('ok')

		expect(await gate.run('job-1', fn)).toEqual({kind: 'cap-exceeded'})
		expect(fn).toHaveBeenCalledTimes(6)
		// The budget is per job: another job is unaffected.
		expect(await gate.run('job-2', fn)).toBe('ok')

		gate.resetJob('job-1')
		expect(await gate.run('job-1', fn)).toBe('ok')
	})

	it('releases the slot when the spawn throws', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 1, minSpacingMs: 0})
		await expect(gate.run('a', () => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
		expect(await gate.run('b', () => Promise.resolve('ok'))).toBe('ok')
	})

	it('drops a waiting spawn whose job is cancelled, without running it', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 1, minSpacingMs: 0})
		const holder = deferred<string>()
		const first = gate.run('a', () => holder.promise)
		const controller = new AbortController()
		const fn = vi.fn(() => Promise.resolve('never'))
		const waiting = gate.run('b', fn, controller.signal)
		await settle()

		controller.abort()
		expect(await waiting).toEqual({kind: 'cancelled'})

		holder.resolve('held')
		expect(await first).toBe('held')
		expect(fn).not.toHaveBeenCalled()
		// The dropped waiter took no slot with it.
		expect(await gate.run('c', () => Promise.resolve('next'))).toBe('next')
	})

	it('refunds the job budget of a spawn cancelled while it waited', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 1, minSpacingMs: 0, perJobCap: 1})
		const holder = deferred<string>()
		const first = gate.run('a', () => holder.promise)
		const controller = new AbortController()
		const waiting = gate.run('b', () => Promise.resolve('never'), controller.signal)
		await settle()
		controller.abort()
		expect(await waiting).toEqual({kind: 'cancelled'})
		holder.resolve('held')
		await first

		// The cancelled wait never spawned, so job b still has its one spawn.
		expect(await gate.run('b', () => Promise.resolve('ok'))).toBe('ok')
	})

	it('refunds the job budget of a spawn cancelled during its spacing wait', async () => {
		const controller = new AbortController()
		const gate = new ExploreSpawnGate({now: () => 0, perJobCap: 1, sleep: () => Promise.resolve(controller.abort())})
		await gate.run('a', () => Promise.resolve())
		expect(await gate.run('b', () => Promise.resolve('never'), controller.signal)).toEqual({kind: 'cancelled'})
		expect(await gate.run('b', () => Promise.resolve('ok'))).toBe('ok')
	})

	it('cuts the default spacing wait short when the job is cancelled', async () => {
		const controller = new AbortController()
		const gate = new ExploreSpawnGate({minSpacingMs: 60_000})
		await gate.run('a', () => Promise.resolve())
		const fn = vi.fn(() => Promise.resolve('never'))
		const waiting = gate.run('b', fn, controller.signal)
		setTimeout(() => controller.abort(), 20)

		expect(await waiting).toEqual({kind: 'cancelled'})
		expect(fn).not.toHaveBeenCalled()
	})

	it('returns cancelled at once for a job that is already cancelled', async () => {
		const gate = new ExploreSpawnGate({minSpacingMs: 0})
		const fn = vi.fn(() => Promise.resolve('never'))
		expect(await gate.run('a', fn, AbortSignal.abort())).toEqual({kind: 'cancelled'})
		expect(fn).not.toHaveBeenCalled()
	})
})
