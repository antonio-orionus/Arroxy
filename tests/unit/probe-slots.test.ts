// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {ProbeSlots, type ProbeSlotCooldowns, type ProbeSlotOutcome} from '@main/services/ProbeSlots.js'
import type {HeldProbe} from '@shared/types.js'
import type {ProbeKind} from '@shared/schemas.js'

// Probe slots: how many probes main runs at once, which waiting probe goes
// next, and how a background probe waits out its site's cooldown.

function deferred<T>(): {promise: Promise<T>; resolve: (value: T) => void; reject: (error: unknown) => void} {
	let resolve!: (value: T) => void
	let reject!: (error: unknown) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return {promise, resolve, reject}
}

async function settle(): Promise<void> {
	for (let i = 0; i < 20; i++) await Promise.resolve()
}

// A cooldown per site, ended by time or early (a "Try now" the site answered).
function fakeCooldowns(): ProbeSlotCooldowns & {cool: (site: string, ms: number) => void; endEarly: (site: string) => void; tryNow: (site: string) => void; spendPass: (site: string) => void; listeners: () => number} {
	const until = new Map<string, number>()
	const passes = new Set<string>()
	const listeners = new Set<() => void>()
	const rateLimitedUntil = (site: string): number | null => {
		const end = until.get(site)
		return end !== undefined && Date.now() < end ? end : null
	}
	return {
		rateLimitedUntil,
		wouldAdmit: site => rateLimitedUntil(site) === null || passes.has(site),
		// This fake's passes never run out: a pass waits until a run spends it.
		holdPass: vi.fn(),
		releasePass: vi.fn(),
		tryNow: site => {
			passes.add(site)
			for (const listener of listeners) listener()
		},
		spendPass: site => {
			passes.delete(site)
		},
		onChange: listener => {
			const wrapped = (): void => listener([])
			listeners.add(wrapped)
			return () => listeners.delete(wrapped)
		},
		cool: (site, ms) => {
			until.set(site, Date.now() + ms)
			for (const listener of listeners) listener()
		},
		endEarly: site => {
			until.delete(site)
			for (const listener of listeners) listener()
		},
		listeners: () => listeners.size
	}
}

// One probe the test drives: which ones started, in order, and their outcome.
function harness(options: {limit?: number; cooldown?: ProbeSlotCooldowns} = {}) {
	const slots = new ProbeSlots({backgroundLimit: options.limit ?? 2, ...(options.cooldown ? {cooldown: options.cooldown} : {})})
	const started: string[] = []
	const tasks = new Map<string, ReturnType<typeof deferred<string>>>()
	const runs = new Map<string, Promise<ProbeSlotOutcome<string>>>()
	const controllers = new Map<string, AbortController>()
	const start = (name: string, kind: ProbeKind, site = 'youtube', isHeld?: (value: string) => string | null): Promise<ProbeSlotOutcome<string>> => {
		const controller = new AbortController()
		controllers.set(name, controller)
		const run = slots.run(
			{kind, site},
			controller.signal,
			() => {
				started.push(name)
				const task = deferred<string>()
				tasks.set(name, task)
				return task.promise
			},
			isHeld ? {isHeld} : {}
		)
		runs.set(name, run)
		return run
	}
	const finish = async (name: string, value = `${name}:done`): Promise<void> => {
		const task = tasks.get(name)
		if (!task) throw new Error(`${name} never started`)
		tasks.delete(name)
		task.resolve(value)
		await settle()
	}
	const abort = async (name: string): Promise<void> => {
		controllers.get(name)?.abort()
		await settle()
	}
	return {slots, started, start, finish, abort, runs, tasks}
}

beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2026-10-22T12:00:00Z'))
})

afterEach(() => {
	vi.useRealTimers()
})

describe('ProbeSlots — limits', () => {
	it('never runs more background probes than the limit', async () => {
		const h = harness({limit: 2})
		for (const name of ['a', 'b', 'c', 'd']) void h.start(name, 'intake')
		await settle()
		expect(h.started).toEqual(['a', 'b'])
		expect(h.slots.snapshot().running).toEqual({interactive: 0, intake: 2, backfill: 0})
		expect(h.slots.snapshot().waiting).toEqual([
			{kind: 'intake', site: 'youtube'},
			{kind: 'intake', site: 'youtube'}
		])
	})

	it('frees the slot when the task resolves', async () => {
		const h = harness({limit: 1})
		const a = h.start('a', 'intake')
		void h.start('b', 'intake')
		await settle()
		await h.finish('a')
		expect(await a).toEqual({kind: 'ran', value: 'a:done'})
		expect(h.started).toEqual(['a', 'b'])
	})

	it('frees the slot when the task throws, and passes the error on', async () => {
		const h = harness({limit: 1})
		const a = h.start('a', 'intake')
		void h.start('b', 'intake')
		await settle()
		h.tasks.get('a')?.reject(new Error('boom'))
		await expect(a).rejects.toThrow('boom')
		await settle()
		expect(h.started).toEqual(['a', 'b'])
		expect(h.slots.snapshot().running.intake).toBe(1)
	})

	it('lets an interactive probe use the headroom above the limit, up to the limit plus two', async () => {
		const h = harness({limit: 2})
		void h.start('bg1', 'intake')
		void h.start('bg2', 'intake')
		for (const name of ['i1', 'i2', 'i3']) void h.start(name, 'interactive')
		await settle()
		expect(h.started).toEqual(['bg1', 'bg2', 'i1', 'i2'])
		expect(h.slots.snapshot().running).toEqual({interactive: 2, intake: 2, backfill: 0})
	})

	it('still runs background probes while interactive probes hold three slots', async () => {
		const h = harness({limit: 2})
		for (const name of ['i1', 'i2', 'i3']) void h.start(name, 'interactive')
		void h.start('bg1', 'intake')
		void h.start('bg2', 'intake')
		await settle()
		// The ceiling is 4: one background probe fits beside the three interactive ones.
		expect(h.started).toEqual(['i1', 'i2', 'i3', 'bg1'])
		await h.finish('i1')
		expect(h.started).toEqual(['i1', 'i2', 'i3', 'bg1', 'bg2'])
	})

	it('applies a lower limit set at runtime to the next decision, and a higher one at once', async () => {
		const h = harness({limit: 3})
		for (const name of ['a', 'b', 'c', 'd', 'e']) void h.start(name, 'intake')
		await settle()
		expect(h.started).toEqual(['a', 'b', 'c'])
		h.slots.setBackgroundLimit(1)
		await h.finish('a')
		await h.finish('b')
		expect(h.started).toEqual(['a', 'b', 'c'])
		await h.finish('c')
		expect(h.started).toEqual(['a', 'b', 'c', 'd'])
		h.slots.setBackgroundLimit(2)
		await settle()
		expect(h.started).toEqual(['a', 'b', 'c', 'd', 'e'])
	})
})

describe('ProbeSlots — headroom', () => {
	it("keeps the window's own headroom after the limit is lowered below the background probes running", async () => {
		const h = harness({limit: 4})
		for (const name of ['a', 'b', 'c', 'd']) void h.start(name, 'intake')
		await settle()
		h.slots.setBackgroundLimit(1)
		void h.start('i1', 'interactive')
		void h.start('i2', 'interactive')
		void h.start('i3', 'interactive')
		await settle()
		expect(h.started).toEqual(['a', 'b', 'c', 'd', 'i1', 'i2'])
	})
})

describe('ProbeSlots — admission at grant time', () => {
	it('runs nothing and frees the slot when the caller declines once the slot is granted', async () => {
		const slots = new ProbeSlots({backgroundLimit: 1})
		const first = deferred<string>()
		void slots.run({kind: 'intake', site: 'youtube'}, new AbortController().signal, () => first.promise)
		let downloading = false
		const task = vi.fn(async () => 'ran')
		const backfill = slots.run({kind: 'backfill', site: 'youtube'}, new AbortController().signal, task, {admit: () => !downloading})
		const next = vi.fn(async () => 'next')
		const behind = slots.run({kind: 'backfill', site: 'youtube'}, new AbortController().signal, next)
		await settle()
		// A download started while the backfill waited for its slot.
		downloading = true
		first.resolve('first')
		await settle()

		expect(await backfill).toEqual({kind: 'deferred'})
		expect(task).not.toHaveBeenCalled()
		expect(await behind).toEqual({kind: 'ran', value: 'next'})
		expect(slots.snapshot().running.backfill).toBe(0)
	})

	it('runs the task when the caller still agrees at grant time', async () => {
		const slots = new ProbeSlots({backgroundLimit: 1})
		const admit = vi.fn(() => true)
		expect(await slots.run({kind: 'backfill', site: 'youtube'}, new AbortController().signal, async () => 'ran', {admit})).toEqual({kind: 'ran', value: 'ran'})
		expect(admit).toHaveBeenCalledOnce()
	})
})

describe('ProbeSlots — order', () => {
	it('starts intake waiters in arrival order, and backfill only when no intake waits', async () => {
		const h = harness({limit: 1})
		void h.start('first', 'intake')
		await settle()
		void h.start('fill1', 'backfill')
		void h.start('in1', 'intake')
		void h.start('fill2', 'backfill')
		void h.start('in2', 'intake')
		await settle()
		await h.finish('first')
		await h.finish('in1')
		await h.finish('in2')
		await h.finish('fill1')
		expect(h.started).toEqual(['first', 'in1', 'in2', 'fill1', 'fill2'])
	})

	it('starts a waiting interactive probe before any background one', async () => {
		const h = harness({limit: 1})
		for (const name of ['i1', 'i2', 'i3']) void h.start(name, 'interactive')
		void h.start('bg1', 'intake')
		void h.start('bg2', 'intake')
		void h.start('i4', 'interactive')
		void h.start('i5', 'interactive')
		await settle()
		// Ceiling 3: three interactive probes run, the rest wait.
		expect(h.started).toEqual(['i1', 'i2', 'i3'])
		await h.finish('i1')
		expect(h.started).toEqual(['i1', 'i2', 'i3', 'i4'])
		await h.finish('i2')
		expect(h.started).toEqual(['i1', 'i2', 'i3', 'i4', 'i5'])
		await h.finish('i3')
		expect(h.started).toEqual(['i1', 'i2', 'i3', 'i4', 'i5', 'bg1'])
	})
})

describe('ProbeSlots — cancellation', () => {
	it('removes an aborted waiter: it never runs, and the others keep their order', async () => {
		const h = harness({limit: 1})
		void h.start('a', 'intake')
		const b = h.start('b', 'intake')
		void h.start('c', 'intake')
		void h.start('d', 'intake')
		await settle()
		await h.abort('b')
		expect(await b).toEqual({kind: 'cancelled'})
		expect(h.slots.snapshot().waiting).toHaveLength(2)
		await h.finish('a')
		await h.finish('c')
		expect(h.started).toEqual(['a', 'c', 'd'])
	})

	it('returns cancelled at once for a signal already aborted', async () => {
		const slots = new ProbeSlots({backgroundLimit: 2})
		const task = vi.fn(async () => 'ran')
		const controller = new AbortController()
		controller.abort()
		expect(await slots.run({kind: 'interactive', site: 'youtube'}, controller.signal, task)).toEqual({kind: 'cancelled'})
		expect(task).not.toHaveBeenCalled()
		expect(slots.snapshot()).toEqual({running: {interactive: 0, intake: 0, backfill: 0}, waiting: []})
	})

	it('releases a running probe slot once when it is aborted and its task settles', async () => {
		const h = harness({limit: 1})
		const a = h.start('a', 'intake')
		void h.start('b', 'intake')
		await settle()
		await h.abort('a')
		// The slot stays taken until the aborted probe has really stopped.
		expect(h.started).toEqual(['a'])
		await h.finish('a', 'a:cancelled')
		expect(await a).toEqual({kind: 'ran', value: 'a:cancelled'})
		expect(h.started).toEqual(['a', 'b'])
		expect(h.slots.snapshot().running.intake).toBe(1)
	})
})

describe('ProbeSlots — cooldown', () => {
	it("gives a cooling site's waiter no slot while another site's waiter starts", async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 1, cooldown})
		void h.start('first', 'intake', 'vimeo.com')
		await settle()
		cooldown.cool('youtube', 60_000)
		void h.start('yt', 'intake', 'youtube')
		void h.start('vimeo', 'intake', 'vimeo.com')
		await settle()
		await h.finish('first')
		expect(h.started).toEqual(['first', 'vimeo'])
		expect(h.slots.snapshot().waiting).toEqual([{kind: 'intake', site: 'youtube'}])
	})

	it('wakes when the cooldown ends, with one timer, cleared once nothing waits', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 2, cooldown})
		cooldown.cool('youtube', 60_000)
		void h.start('a', 'intake')
		void h.start('b', 'backfill')
		await settle()
		expect(h.started).toEqual([])
		expect(vi.getTimerCount()).toBe(1)
		await vi.advanceTimersByTimeAsync(59_999)
		expect(h.started).toEqual([])
		await vi.advanceTimersByTimeAsync(1)
		await settle()
		expect(h.started).toEqual(['a', 'b'])
		expect(vi.getTimerCount()).toBe(0)
	})

	it('wakes when the cooldown ends early', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 2, cooldown})
		cooldown.cool('youtube', 600_000)
		void h.start('a', 'intake')
		await settle()
		expect(h.started).toEqual([])
		cooldown.endEarly('youtube')
		await settle()
		expect(h.started).toEqual(['a'])
		expect(vi.getTimerCount()).toBe(0)
	})

	it('clears the timer when the last cooling waiter is cancelled', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 2, cooldown})
		cooldown.cool('youtube', 60_000)
		void h.start('a', 'intake')
		await settle()
		expect(vi.getTimerCount()).toBe(1)
		await h.abort('a')
		expect(vi.getTimerCount()).toBe(0)
	})

	it('lets a background waiter through at once when Try now grants its site a pass', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 2, cooldown})
		cooldown.cool('youtube', 600_000)
		void h.start('retry', 'intake')
		await settle()
		expect(h.started).toEqual([])
		cooldown.tryNow('youtube')
		await settle()
		expect(h.started).toEqual(['retry'])
	})

	it('waits again on the cooldown when another waiter spent the pass', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 2, cooldown})
		const isHeld = (value: string): string | null => (value === 'held' ? 'youtube' : null)
		cooldown.cool('youtube', 600_000)
		void h.start('a', 'intake', 'youtube', isHeld)
		void h.start('b', 'intake', 'youtube', isHeld)
		cooldown.tryNow('youtube')
		await settle()
		expect(h.started).toEqual(['a', 'b'])
		// `a`'s run spent the pass; YtDlp held `b`'s, which goes back to wait.
		cooldown.spendPass('youtube')
		await h.finish('b', 'held')
		expect(h.slots.snapshot().waiting).toEqual([{kind: 'intake', site: 'youtube'}])
		expect(h.started).toEqual(['a', 'b'])
	})

	it('puts a background probe its site’s signed-in pacing held back to wait, without its slot, until its time', async () => {
		vi.useFakeTimers()
		try {
			const slots = new ProbeSlots({backgroundLimit: 1})
			const started: string[] = []
			let pacedOnce = true
			const paced = slots.run(
				{kind: 'intake', site: 'instagram'},
				new AbortController().signal,
				() => {
					started.push('a')
					const value = pacedOnce ? 'paced' : 'a:done'
					pacedOnce = false
					return Promise.resolve(value)
				},
				{pacedUntil: value => (value === 'paced' ? Date.now() + 60_000 : null)}
			)
			await vi.advanceTimersByTimeAsync(0)
			const other = slots.run({kind: 'intake', site: 'vimeo.com'}, new AbortController().signal, () => {
				started.push('b')
				return Promise.resolve('b:done')
			})
			expect(await other).toEqual({kind: 'ran', value: 'b:done'})
			expect(started).toEqual(['a', 'b'])

			await vi.advanceTimersByTimeAsync(60_000)
			expect(await paced).toEqual({kind: 'ran', value: 'a:done'})
			expect(started).toEqual(['a', 'b', 'a'])
		} finally {
			vi.useRealTimers()
		}
	})

	it('lets an interactive probe through a cooldown', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 2, cooldown})
		cooldown.cool('youtube', 60_000)
		void h.start('i', 'interactive')
		await settle()
		expect(h.started).toEqual(['i'])
	})

	it('puts a background probe held by the cooldown back in its place, and runs it again after the cooldown', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 1, cooldown})
		const isHeld = (value: string): string | null => (value === 'held' ? 'youtube' : null)
		const a = h.start('a', 'intake', 'youtube', isHeld)
		void h.start('b', 'intake', 'youtube', isHeld)
		await settle()
		// A cooldown began after the slot was given (nothing spawned): the run comes back held.
		cooldown.cool('youtube', 60_000)
		await h.finish('a', 'held')
		expect(h.slots.snapshot().waiting).toEqual([
			{kind: 'intake', site: 'youtube'},
			{kind: 'intake', site: 'youtube'}
		])
		expect(h.slots.snapshot().running.intake).toBe(0)
		await vi.advanceTimersByTimeAsync(60_000)
		await settle()
		// `a` arrived first, so it goes first again.
		expect(h.started).toEqual(['a', 'a'])
		await h.finish('a')
		expect(await a).toEqual({kind: 'ran', value: 'a:done'})
		expect(h.started).toEqual(['a', 'a', 'b'])
	})

	it('waits on the cooldown of the site that held it, which a redirect may have changed', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 1, cooldown})
		const a = h.start('a', 'intake', 'short.example', value => (value === 'held' ? 'youtube' : null))
		await settle()
		// The link redirected to YouTube, which began cooling: YtDlp held the YouTube run.
		cooldown.cool('youtube', 60_000)
		await h.finish('a', 'held')
		expect(h.slots.snapshot().waiting).toEqual([{kind: 'intake', site: 'youtube'}])
		await vi.advanceTimersByTimeAsync(60_000)
		await settle()
		expect(h.started).toEqual(['a', 'a'])
		await h.finish('a')
		expect(await a).toEqual({kind: 'ran', value: 'a:done'})
	})

	it('returns a held interactive result as it is', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 1, cooldown})
		const i = h.start('i', 'interactive', 'youtube', value => (value === 'held' ? 'youtube' : null))
		await settle()
		cooldown.cool('youtube', 60_000)
		await h.finish('i', 'held')
		expect(await i).toEqual({kind: 'ran', value: 'held'})
	})

	it('returns a held result whose site is not cooling as it is, never looping', async () => {
		const cooldown = fakeCooldowns()
		const h = harness({limit: 1, cooldown})
		const a = h.start('a', 'intake', 'youtube', value => (value === 'held' ? 'youtube' : null))
		await settle()
		await h.finish('a', 'held')
		expect(await a).toEqual({kind: 'ran', value: 'held'})
	})
})

// The Downloads rows a cooldown holds, by owner (#664): a probe already
// running is not waiting, and a held result waits on the site it named.
describe('ProbeSlots — held probes', () => {
	it('names the waiters a cooldown holds, not the probes already running', async () => {
		const cooldown = fakeCooldowns()
		const slots = new ProbeSlots({backgroundLimit: 2, cooldown})
		const changes: HeldProbe[][] = []
		slots.onHeldChange(held => changes.push(held))
		const running = deferred<string>()
		void slots.run({kind: 'intake', site: 'youtube', owner: 'row-running'}, new AbortController().signal, () => running.promise)
		await settle()
		cooldown.cool('youtube', 60_000)
		void slots.run({kind: 'intake', site: 'youtube', owner: 'row-held'}, new AbortController().signal, async () => 'ran')
		await settle()
		expect(slots.heldProbes()).toEqual([{owner: 'row-held', site: 'youtube'}])

		await vi.advanceTimersByTimeAsync(60_000)
		await settle()
		expect(slots.heldProbes()).toEqual([])
		expect(changes).toEqual([[{owner: 'row-held', site: 'youtube'}], []])
	})

	it('names the site a held result named, which a redirect may have made another than the link', async () => {
		const cooldown = fakeCooldowns()
		const slots = new ProbeSlots({backgroundLimit: 2, cooldown})
		const task = deferred<string>()
		void slots.run({kind: 'intake', site: 'short.example', owner: 'row'}, new AbortController().signal, () => task.promise, {isHeld: () => 'youtube'})
		await settle()
		cooldown.cool('youtube', 60_000)
		task.resolve('held')
		await settle()
		expect(slots.heldProbes()).toEqual([{owner: 'row', site: 'youtube'}])
	})

	// One request spends a Try now pass: the waiters behind it on that site stay held.
	it('lists every waiter but the one a pass lets through', async () => {
		const cooldown = fakeCooldowns()
		const slots = new ProbeSlots({backgroundLimit: 1, cooldown})
		const busy = deferred<string>()
		void slots.run({kind: 'intake', site: 'vimeo.com'}, new AbortController().signal, () => busy.promise)
		cooldown.cool('youtube', 600_000)
		for (const owner of ['a', 'b', 'c']) void slots.run({kind: 'intake', site: 'youtube', owner}, new AbortController().signal, async () => owner)
		await settle()
		cooldown.tryNow('youtube')
		await settle()
		expect(slots.heldProbes()).toEqual([
			{owner: 'b', site: 'youtube'},
			{owner: 'c', site: 'youtube'}
		])
	})

	it("lets go of a site's pass once no waiter on that site is left behind a full pool", async () => {
		const cooldown = fakeCooldowns()
		const slots = new ProbeSlots({backgroundLimit: 1, cooldown})
		const busy = deferred<string>()
		void slots.run({kind: 'intake', site: 'vimeo.com'}, new AbortController().signal, () => busy.promise)
		cooldown.cool('youtube', 600_000)
		cooldown.tryNow('youtube')
		const retry = new AbortController()
		void slots.run({kind: 'intake', site: 'youtube', owner: 'row'}, retry.signal, async () => 'ran')
		await settle()
		expect(cooldown.holdPass).toHaveBeenCalledWith('youtube')
		expect(cooldown.releasePass).not.toHaveBeenCalled()
		retry.abort()
		await settle()
		expect(cooldown.releasePass).toHaveBeenCalledWith('youtube')
	})

	it('drops a held probe once it is cancelled', async () => {
		const cooldown = fakeCooldowns()
		const slots = new ProbeSlots({backgroundLimit: 2, cooldown})
		cooldown.cool('youtube', 60_000)
		const controller = new AbortController()
		void slots.run({kind: 'intake', site: 'youtube', owner: 'row'}, controller.signal, async () => 'ran')
		await settle()
		expect(slots.heldProbes()).toEqual([{owner: 'row', site: 'youtube'}])
		controller.abort()
		await settle()
		expect(slots.heldProbes()).toEqual([])
	})
})
