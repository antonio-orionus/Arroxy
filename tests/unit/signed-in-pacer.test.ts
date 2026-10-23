// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {SignedInPacer, type SignedInRunOptions} from '@main/services/SignedInPacer.js'
import type {SignedInPacing} from '@shared/sites/siteKeys.js'

const MINUTE = 60_000

function deferred<T>(): {promise: Promise<T>; resolve: (value: T) => void} {
	let resolve!: (value: T) => void
	const promise = new Promise<T>(r => {
		resolve = r
	})
	return {promise, resolve}
}

// Lets every queued microtask (and the pacer's internal awaits) settle.
async function settle(): Promise<void> {
	for (let i = 0; i < 10; i++) await Promise.resolve()
}

function pacing(overrides: Partial<SignedInPacing> = {}): () => SignedInPacing {
	return () => ({atOnce: 2, spacingMs: 0, jitterMs: 0, windowMs: 60 * MINUTE, perWindow: 1000, entriesPerLaunch: 10, ...overrides})
}

// A clock the pacer's sleeps move forward.
function clocked(overrides: Partial<SignedInPacing>, perJobCap?: number) {
	let clock = 1_000
	const sleep = vi.fn((ms: number) => {
		clock += ms
		return Promise.resolve()
	})
	const pacer = new SignedInPacer({pacing: pacing(overrides), now: () => clock, sleep, random: () => 0.5, ...(perJobCap === undefined ? {} : {perJobCap})})
	const startedAt: number[] = []
	const run = (site: string, jobKey: string, options: SignedInRunOptions = {}) =>
		pacer.run(
			site,
			jobKey,
			() => {
				startedAt.push(clock)
				return Promise.resolve('ok')
			},
			options
		)
	return {pacer, sleep, startedAt, run, advance: (ms: number) => (clock += ms), now: () => clock}
}

describe('SignedInPacer: launches at once', () => {
	it('runs at most a site’s limit of signed-in launches at once', async () => {
		const pacer = new SignedInPacer({pacing: pacing({atOnce: 2})})
		const runs = [deferred<string>(), deferred<string>(), deferred<string>()]
		const started: number[] = []
		const results = runs.map((d, i) =>
			pacer.run('instagram', `job-${i}`, () => {
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
		expect(await Promise.all(results)).toEqual([{ran: 'first'}, {ran: 'second'}, {ran: 'third'}])
	})

	it('never makes one site wait on another', async () => {
		const pacer = new SignedInPacer({pacing: pacing({atOnce: 1})})
		const holder = deferred<string>()
		void pacer.run('instagram', 'a', () => holder.promise)
		await settle()

		expect(await pacer.run('youtube', 'b', () => Promise.resolve('ok'))).toEqual({ran: 'ok'})
		holder.resolve('done')
	})

	it('reports a wait for a full site', async () => {
		const pacer = new SignedInPacer({pacing: pacing({atOnce: 1})})
		const holder = deferred<string>()
		void pacer.run('x', 'a', () => holder.promise)
		await settle()
		const onWait = vi.fn()
		const waiting = pacer.run('x', 'b', () => Promise.resolve('ok'), {onWait})
		await settle()

		expect(onWait).toHaveBeenCalledWith({reason: 'signedInLimit'})
		holder.resolve('done')
		expect(await waiting).toEqual({ran: 'ok'})
	})

	it('releases the slot when the launch throws', async () => {
		const pacer = new SignedInPacer({pacing: pacing({atOnce: 1})})
		await expect(pacer.run('x', 'a', () => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
		expect(await pacer.run('x', 'b', () => Promise.resolve('ok'))).toEqual({ran: 'ok'})
	})
})

describe('SignedInPacer: spacing', () => {
	it('spaces starts on one site, and not across sites', async () => {
		const {run, startedAt, advance} = clocked({spacingMs: 5000})
		await run('x', 'a')
		await run('x', 'b')
		await run('instagram', 'c')
		advance(12_000)
		await run('x', 'd')

		expect(startedAt).toEqual([1_000, 6_000, 6_000, 18_000])
	})

	it('draws the spacing within its jitter', async () => {
		let clock = 0
		const sleep = vi.fn((ms: number) => {
			clock += ms
			return Promise.resolve()
		})
		const pacer = new SignedInPacer({pacing: pacing({spacingMs: 5000, jitterMs: 2000}), now: () => clock, sleep, random: () => 0})
		await pacer.run('x', 'a', () => Promise.resolve())
		await pacer.run('x', 'b', () => Promise.resolve())
		expect(sleep.mock.calls.map(call => call[0])).toEqual([3000])
	})

	it('reports a spacing wait with its length', async () => {
		const {run} = clocked({spacingMs: 5000})
		const onWait = vi.fn()
		await run('x', 'a')
		await run('x', 'b', {onWait})
		expect(onWait).toHaveBeenCalledWith({reason: 'signedInSpacing', waitMs: 5000})
	})

	it('gives back the spacing of a launch cancelled while it waited for it', async () => {
		let clock = 0
		const controllers = [new AbortController(), new AbortController(), new AbortController()]
		let cancelling = 0
		const sleep = vi.fn(() => {
			controllers[cancelling]?.abort()
			cancelling += 1
			return Promise.resolve()
		})
		const pacer = new SignedInPacer({pacing: pacing({spacingMs: 5000}), now: () => clock, sleep})
		await pacer.run('x', 'a', () => Promise.resolve())
		for (const controller of controllers) expect(await pacer.run('x', 'b', () => Promise.resolve('never'), {signal: controller.signal})).toEqual({kind: 'cancelled'})

		const onWait = vi.fn()
		await pacer.run('x', 'c', () => Promise.resolve(), {onWait})
		expect(onWait).toHaveBeenCalledWith({reason: 'signedInSpacing', waitMs: 5000})
	})
})

describe('SignedInPacer: the budget over a sliding window', () => {
	it('holds a launch past the window’s allowance until the oldest launch leaves it', async () => {
		const {run, startedAt} = clocked({windowMs: 10 * MINUTE, perWindow: 2})
		const onWait = vi.fn()
		await run('instagram', 'a')
		await run('instagram', 'b')
		await run('instagram', 'c', {onWait})

		expect(startedAt).toEqual([1_000, 1_000, 1_000 + 10 * MINUTE])
		expect(onWait).toHaveBeenCalledWith({reason: 'signedInBudget', waitMs: 10 * MINUTE})
	})

	it('keeps each site’s budget apart', async () => {
		const {run, startedAt} = clocked({perWindow: 1})
		await run('instagram', 'a')
		await run('x', 'b')
		expect(startedAt).toEqual([1_000, 1_000])
	})

	it('charges a listing’s entries against the window, as debt', async () => {
		const {pacer, run, startedAt} = clocked({windowMs: 10 * MINUTE, perWindow: 5, entriesPerLaunch: 10})
		await run('instagram', 'a')
		pacer.charge('instagram', 40)
		await run('instagram', 'b')

		expect(startedAt).toEqual([1_000, 1_000 + 10 * MINUTE])
	})

	it('lets an explicit action skip the spacing and the budget, and still counts it', async () => {
		const {run, startedAt} = clocked({spacingMs: 5000, windowMs: 10 * MINUTE, perWindow: 1})
		await run('x', 'a')
		await run('x', 'b', {explicit: true})
		await run('x', 'c')

		expect(startedAt).toEqual([1_000, 1_000, 1_000 + 10 * MINUTE])
	})
})

describe('SignedInPacer: when a launch may start', () => {
	it('answers now, a time, or full', async () => {
		const {pacer, run, now} = clocked({atOnce: 1, spacingMs: 5000})
		expect(pacer.startsAt('x')).toBeNull()

		await run('x', 'a')
		expect(pacer.startsAt('x')).toBe(now() + 5000)
		expect(pacer.startsAt('x', {explicit: true})).toBeNull()
		expect(pacer.startsAt('instagram')).toBeNull()

		const holder = deferred<string>()
		void pacer.run('instagram', 'b', () => holder.promise)
		await settle()
		expect(pacer.startsAt('instagram')).toBe('full')
		holder.resolve('done')
	})

	it('tells listeners when a slot frees', async () => {
		const pacer = new SignedInPacer({pacing: pacing({atOnce: 1})})
		const listener = vi.fn()
		pacer.onChange(listener)
		await pacer.run('x', 'a', () => Promise.resolve())
		expect(listener).toHaveBeenCalled()
	})
})

describe('SignedInPacer: the per-job budget', () => {
	it('refuses the seventh signed-in launch of one job attempt, whatever the site', async () => {
		const pacer = new SignedInPacer({pacing: pacing()})
		const fn = vi.fn(() => Promise.resolve('ok'))
		for (let i = 0; i < 6; i++) expect(await pacer.run(i % 2 ? 'x' : 't.example', 'job-1', fn)).toEqual({ran: 'ok'})

		expect(await pacer.run('x', 'job-1', fn)).toEqual({kind: 'cap-exceeded'})
		expect(fn).toHaveBeenCalledTimes(6)
		expect(await pacer.run('x', 'job-2', fn)).toEqual({ran: 'ok'})

		pacer.resetJob('job-1')
		expect(await pacer.run('x', 'job-1', fn)).toEqual({ran: 'ok'})
	})

	it('drops a waiting launch whose job is cancelled, without running it or spending its budget', async () => {
		const pacer = new SignedInPacer({pacing: pacing({atOnce: 1}), perJobCap: 1})
		const holder = deferred<string>()
		const first = pacer.run('x', 'a', () => holder.promise)
		const controller = new AbortController()
		const fn = vi.fn(() => Promise.resolve('never'))
		const waiting = pacer.run('x', 'b', fn, {signal: controller.signal})
		await settle()

		controller.abort()
		expect(await waiting).toEqual({kind: 'cancelled'})
		holder.resolve('held')
		expect(await first).toEqual({ran: 'held'})
		expect(fn).not.toHaveBeenCalled()
		expect(await pacer.run('x', 'b', () => Promise.resolve('ok'))).toEqual({ran: 'ok'})
	})

	it('cuts a real spacing wait short when the job is cancelled', async () => {
		const pacer = new SignedInPacer({pacing: pacing({spacingMs: 60_000})})
		const controller = new AbortController()
		await pacer.run('x', 'a', () => Promise.resolve())
		const fn = vi.fn(() => Promise.resolve('never'))
		const waiting = pacer.run('x', 'b', fn, {signal: controller.signal})
		setTimeout(() => controller.abort(), 20)

		expect(await waiting).toEqual({kind: 'cancelled'})
		expect(fn).not.toHaveBeenCalled()
	})

	it('returns cancelled at once for a job that is already cancelled', async () => {
		const pacer = new SignedInPacer({pacing: pacing()})
		const fn = vi.fn(() => Promise.resolve('never'))
		expect(await pacer.run('x', 'a', fn, {signal: AbortSignal.abort()})).toEqual({kind: 'cancelled'})
		expect(fn).not.toHaveBeenCalled()
	})
})
