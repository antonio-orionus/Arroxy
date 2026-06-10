// @vitest-environment node

import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import {EventEmitter} from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function fakeStore(): QueueStore {
	return {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
}

function makeService() {
	const ds = new FakeDownloadService()
	const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
	return {qs, ds}
}

function jobResult(jobId = 'job-1') {
	return ok({job: {id: jobId, url: '', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}})
}

function doneEvent(jobId: string) {
	return {jobId, stage: 'done' as const, statusKey: 'complete' as const, at: new Date().toISOString()}
}

// Flush pending promise continuations (does not advance fake timers).
// Needed because maybeStartNext() uses `void this.start()` which is async.
async function flushMicrotasks() {
	await Promise.resolve()
	await Promise.resolve()
	await Promise.resolve()
}

describe('QueueService — auto-start on add', () => {
	it('adds a pending item → auto-starts it', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())

		qs.add([makeItem({id: 'a', status: 'pending'})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		expect(qs.snapshot()[0].status).toBe('running')
	})

	it('does not start when cap=1 already running', async () => {
		const {qs, ds} = makeService()

		qs.add([makeItem({id: 'a', status: 'running', lastJobId: 'job-0'})])
		qs.add([makeItem({id: 'b', status: 'pending'})])

		await flushMicrotasks()
		expect(ds.start).not.toHaveBeenCalled()
	})

	it('does not start more than cap=1 items simultaneously', async () => {
		const {qs, ds} = makeService()

		// Make the first start hang so the second add races against it.
		let resolveFirst: (() => void) | null = null
		ds.start.mockImplementationOnce(
			() =>
				new Promise<ReturnType<typeof jobResult>>(res => {
					resolveFirst = () => res(jobResult('job-1'))
				})
		)
		ds.start.mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])

		await flushMicrotasks()

		// First item has claimed the scheduler slot even before start resolves
		// (scheduler is set synchronously at the top of start()).
		expect(ds.start).toHaveBeenCalledOnce()

		resolveFirst!()
		await flushMicrotasks()
		// b starts after a's start resolves and the scheduler is updated
	})
})

describe('QueueService — inter-job sleep', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('does not start next item immediately on done — waits for the short sleep timer', async () => {
		const {qs, ds} = makeService()

		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])

		// Flush the auto-start of item a (void this.start() is async).
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledOnce()

		// Emit done for job-1 → scheduleNext() fires, sets sleep timer.
		ds.emit('status', doneEvent('job-1'))

		// b still pending — timer not yet fired.
		expect(ds.start).toHaveBeenCalledOnce()
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('pending')

		// Advance past the 500ms inter-job sleep.
		await vi.advanceTimersByTimeAsync(600)
		await flushMicrotasks()

		expect(ds.start).toHaveBeenCalledTimes(2)
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('running')
	})

	it('cancel-all clears the sleep timer so no job starts after cancel', async () => {
		const {qs, ds} = makeService()

		ds.cancel.mockResolvedValue(ok({cancelled: true}))
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])

		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledOnce()

		// Emit done → sleep timer starts.
		ds.emit('status', doneEvent('job-1'))

		// Cancel all before timer fires.
		await qs.cancel(null)

		// Advance well past sleep.
		await vi.advanceTimersByTimeAsync(1000)
		await flushMicrotasks()

		// No second start — cancel cleared the timer and item b is cancelled.
		expect(ds.start).toHaveBeenCalledOnce()
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('cancelled')
	})
})

describe('QueueService — pause frees scheduler slot', () => {
	it('pausing a running item starts the next pending immediately', async () => {
		const {qs, ds} = makeService()

		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		// Let 'a' go through the natural start cycle so scheduler state is set.
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running'))

		// Add 'b' — scheduler occupied, stays pending.
		qs.add([makeItem({id: 'b', status: 'pending'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledOnce()

		// Pause 'a' — frees the scheduler slot, triggers maybeStartNext → starts 'b'.
		await qs.pause('a')

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('running')
	})
})

describe('QueueService — state invariants', () => {
	it('snapshot never has more than one running item (cap=1)', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())

		const running = qs.snapshot().filter(i => i.status === 'running')
		expect(running.length).toBeLessThanOrEqual(1)
	})

	it('cancel(null) transitions all non-terminal items to cancelled', async () => {
		const {qs, ds} = makeService()
		ds.cancel.mockResolvedValue(ok({cancelled: true}))

		qs.add([makeItem({id: 'a', status: 'running', lastJobId: 'job-a'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'paused-held'}), makeItem({id: 'd', status: 'done', progressPercent: 100})])

		await qs.cancel(null)

		const snap = qs.snapshot()
		expect(snap.find(i => i.id === 'a')?.status).toBe('cancelled')
		expect(snap.find(i => i.id === 'b')?.status).toBe('cancelled')
		expect(snap.find(i => i.id === 'c')?.status).toBe('cancelled')
		expect(snap.find(i => i.id === 'd')?.status).toBe('done')
	})

	it('cancel pending item by id — no IPC call needed', async () => {
		const {qs, ds} = makeService()

		qs.add([makeItem({id: 'a', status: 'pending'})])
		await qs.cancel('a')

		expect(ds.cancel).not.toHaveBeenCalled()
		expect(qs.snapshot()[0].status).toBe('cancelled')
	})

	it('paused-held resume → pending → auto-starts', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())

		qs.add([makeItem({id: 'a', status: 'paused-held'})])
		await qs.resume('a')

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		expect(qs.snapshot()[0].status).toBe('running')
	})
})

describe('QueueService — priority lane', () => {
	it('priority pending spawns alongside a running normal item (bypasses cap=1)', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'a', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running')

		qs.add([makeItem({id: 'b', status: 'pending', lane: 'priority'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))
		const snap = qs.snapshot()
		expect(snap.find(i => i.id === 'a')?.status).toBe('running')
		expect(snap.find(i => i.id === 'b')?.status).toBe('running')
	})

	it('setLane(priority) on a pending item promotes it past a running normal', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'a', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running'))

		qs.add([makeItem({id: 'b', status: 'pending', lane: 'normal'})])
		expect(ds.start).toHaveBeenCalledOnce()

		await qs.setLane('b', 'priority')
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))
		expect(qs.snapshot().find(i => i.id === 'b')?.lane).toBe('priority')
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('running')
	})

	it('maxConcurrent ceiling caps total active spawns even for priority items', async () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 1, 2)
		let jobNo = 0
		ds.start.mockImplementation(() => Promise.resolve(jobResult(`job-${++jobNo}`)))

		qs.add([makeItem({id: 'a', status: 'pending', lane: 'priority'}), makeItem({id: 'b', status: 'pending', lane: 'priority'}), makeItem({id: 'c', status: 'pending', lane: 'priority'})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))
		const snap = qs.snapshot()
		expect(snap.filter(i => i.status === 'running')).toHaveLength(2)
		expect(snap.find(i => i.id === 'c')?.status).toBe('pending')
	})

	it('setLane on a terminal item is a validation error', async () => {
		const {qs} = makeService()
		qs.add([makeItem({id: 'a', status: 'done', progressPercent: 100})])
		const result = await qs.setLane('a', 'priority')
		expect(result.ok).toBe(false)
	})

	it('setLane to the same lane is a no-op (no extra emit, no respawn)', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())
		qs.add([makeItem({id: 'a', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(qs.snapshot()[0].status).toBe('running'))
		const updates = vi.fn()
		qs.on('updated', updates)
		const result = await qs.setLane('a', 'normal')
		expect(result.ok).toBe(true)
		expect(updates).not.toHaveBeenCalled()
	})

	it('setLane on running item flips lane without respawning', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult('job-1'))
		qs.add([makeItem({id: 'a', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		await qs.setLane('a', 'priority')
		expect(ds.start).toHaveBeenCalledOnce()
		expect(qs.snapshot()[0].lane).toBe('priority')
	})

	it('setLane on a missing itemId returns a validation error', async () => {
		const {qs} = makeService()
		const result = await qs.setLane('nope', 'priority')
		expect(result.ok).toBe(false)
	})

	it('downloadService.start failure transitions item to error and clears spawning', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce({ok: false, error: {code: 'download', message: 'boom'}}).mockResolvedValue(jobResult('job-2'))
		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('error'))
		// After a fails, b is a normal-lane pending — armSleepWindow was called on
		// the failure so b must wait for the inter-job sleep to elapse.
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('pending')
	})
})

describe('QueueService — priority lane interactions with sleep window', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('priority pending bypasses the inter-job sleep window left by a finished normal', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'a', status: 'pending', lane: 'normal'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledOnce()

		// Normal completes → sleep window armed.
		ds.emit('status', doneEvent('job-1'))
		await flushMicrotasks()

		// Add a priority pending. It must spawn immediately, ignoring the sleep window.
		qs.add([makeItem({id: 'b', status: 'pending', lane: 'priority'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(2)
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('running')
	})

	it('normal pending waits for sleep window even while a priority item is running', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValueOnce(jobResult('job-2')).mockResolvedValue(jobResult('job-3'))

		// Start normal, then priority spawns alongside, then complete normal so the
		// sleep window arms while priority keeps running.
		qs.add([makeItem({id: 'n1', status: 'pending', lane: 'normal'}), makeItem({id: 'p1', status: 'pending', lane: 'priority'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(2)

		ds.emit('status', doneEvent('job-1'))
		await flushMicrotasks()

		// Now add a new normal pending. Sleep window blocks it even though
		// total activeCount is just 1 (the priority p1).
		qs.add([makeItem({id: 'n2', status: 'pending', lane: 'normal'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(2)
		expect(qs.snapshot().find(i => i.id === 'n2')?.status).toBe('pending')

		// After the sleep window expires, the normal lane unblocks.
		await vi.advanceTimersByTimeAsync(600)
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(3)
		expect(qs.snapshot().find(i => i.id === 'n2')?.status).toBe('running')
	})

	it('priority completion does NOT arm the inter-job sleep window for the normal lane', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'p', status: 'pending', lane: 'priority'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledOnce()

		ds.emit('status', doneEvent('job-1'))
		await flushMicrotasks()

		// Normal pending arrives right after — must spawn without delay because
		// the priority completion didn't arm any sleep window.
		qs.add([makeItem({id: 'n', status: 'pending', lane: 'normal'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(2)
		expect(qs.snapshot().find(i => i.id === 'n')?.status).toBe('running')
	})

	it('cancel-all clears the sleep window and does not spawn after timer expiry', async () => {
		const {qs, ds} = makeService()
		ds.cancel.mockResolvedValue(ok({cancelled: true}))
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))

		qs.add([makeItem({id: 'a', status: 'pending', lane: 'normal'}), makeItem({id: 'b', status: 'pending', lane: 'normal'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledOnce()

		ds.emit('status', doneEvent('job-1'))
		await flushMicrotasks()
		await qs.cancel(null)

		await vi.advanceTimersByTimeAsync(1000)
		await flushMicrotasks()

		expect(ds.start).toHaveBeenCalledOnce()
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('cancelled')
	})
})

describe('QueueService — boot-time scheduling', () => {
	it('init() spawns persisted pending items up to the ceiling but no further', async () => {
		const ds = new FakeDownloadService()
		let jobNo = 0
		ds.start.mockImplementation(() => Promise.resolve(jobResult(`job-${++jobNo}`)))

		const persisted = [makeItem({id: 'p1', status: 'pending', lane: 'priority'}), makeItem({id: 'p2', status: 'pending', lane: 'priority'}), makeItem({id: 'p3', status: 'pending', lane: 'priority'})]
		const store: QueueStore = {load: vi.fn().mockResolvedValue(ok({items: persisted, schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore

		const qs = new QueueService(store, ds as unknown as DownloadService, 1, 2)
		await qs.init()
		// init() calls recomputeSchedule once; spawnings are kicked off via void.
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))
		const snap = qs.snapshot()
		expect(snap.filter(i => i.status === 'running')).toHaveLength(2)
		expect(snap.find(i => i.id === 'p3')?.status).toBe('pending')
	})

	it('regression: persisted schedulerPaused=true keeps the queue paused after restart', async () => {
		const ds = new FakeDownloadService()
		ds.start.mockResolvedValue(jobResult())

		const persisted = [makeItem({id: 'a', status: 'paused-active', lane: 'normal', tempDir: '/tmp/x', lastJobId: 'old-job'}), makeItem({id: 'b', status: 'pending', lane: 'normal'}), makeItem({id: 'c', status: 'pending', lane: 'normal'})]
		const store: QueueStore = {load: vi.fn().mockResolvedValue(ok({items: persisted, schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore

		const qs = new QueueService(store, ds as unknown as DownloadService)
		await qs.init()
		await flushMicrotasks()

		expect(qs.schedulerIsPaused()).toBe(true)
		// Nothing auto-spawns on boot when the user quit with pauseAll.
		expect(ds.start).not.toHaveBeenCalled()
		expect(qs.snapshot().filter(i => i.status === 'pending')).toHaveLength(2)
		expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('paused-active')
	})
})

describe('QueueService — global pause/resume', () => {
	it('pauseAll() suspends the scheduler — paused items do not trigger auto-spawn of next pending', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult('job-1'))
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running'))

		await qs.pauseAll()
		expect(ds.start).toHaveBeenCalledOnce()
		expect(qs.schedulerIsPaused()).toBe(true)
		const snap = qs.snapshot()
		expect(snap.find(i => i.id === 'a')?.status).toBe('paused-active')
		expect(snap.find(i => i.id === 'b')?.status).toBe('pending')
		expect(snap.find(i => i.id === 'c')?.status).toBe('pending')
	})

	it('add() while scheduler is paused leaves new items pending, never spawns', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult('job-1'))
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot()[0].status).toBe('running'))
		await qs.pauseAll()

		qs.add([makeItem({id: 'new', status: 'pending'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledOnce()
		expect(qs.snapshot().find(i => i.id === 'new')?.status).toBe('pending')
	})

	it('resumeAll() clears the flag and the queue keeps going', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValueOnce(jobResult('job-2')).mockResolvedValue(jobResult('job-3'))
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))
		ds.resume.mockResolvedValue(ok({resumed: true}))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running'))
		await qs.pauseAll()
		expect(qs.schedulerIsPaused()).toBe(true)

		await qs.resumeAll()
		expect(qs.schedulerIsPaused()).toBe(false)
		// 'a' resumes via downloadService.resume, 'b' picked up by recomputeSchedule
		// (but cap=1 holds 'b' as pending until 'a' finishes).
		expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running')
	})

	it('per-item start(itemId) still spawns even while scheduler is paused (explicit user action)', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult('job-1'))
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running'))
		await qs.pauseAll()

		// User explicitly clicks "start" on b — bypass the global pause.
		const result = await qs.start('b')
		expect(result.ok).toBe(true)
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('running')
		expect(qs.schedulerIsPaused()).toBe(true)
	})

	it('cancel(null) hard-resets queue state including the global pause flag (fresh-slate semantics)', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValueOnce(jobResult('job-1')).mockResolvedValue(jobResult('job-2'))
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))
		ds.cancel.mockResolvedValue(ok({cancelled: true}))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running'))
		await qs.pauseAll()
		expect(qs.schedulerIsPaused()).toBe(true)

		await qs.cancel(null)
		expect(qs.schedulerIsPaused()).toBe(false)
		const snap = qs.snapshot()
		expect(snap.find(i => i.id === 'a')?.status).toBe('cancelled')
		expect(snap.find(i => i.id === 'b')?.status).toBe('cancelled')

		// After fresh slate, a new add auto-spawns.
		qs.add([makeItem({id: 'fresh', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'fresh')?.status).toBe('running'))
	})
})

describe('QueueService — retry preserves lane', () => {
	it('retrying a priority error item keeps lane=priority on respawn', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult('job-1'))
		qs.add([makeItem({id: 'a', status: 'error', lane: 'priority', error: {kind: 'unknown', raw: 'x'}})])
		await qs.retry('a')
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		const item = qs.snapshot()[0]
		expect(item.lane).toBe('priority')
		expect(item.status).toBe('running')
	})

	it('retrying a resumable error item reuses existing resume temp dir and clears context after start', async () => {
		const {qs, ds} = makeService()
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-resume-retry-'))
		try {
			ds.start.mockResolvedValue(jobResult('job-resume'))
			qs.add([makeItem({id: 'a', status: 'error', error: {kind: 'network', raw: 'read reset'}, resumeContext: {kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: 'network'}})])

			await qs.retry('a')
			await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())

			expect(ds.start.mock.calls[0]?.[0]).toMatchObject({tempDir})
			expect(qs.snapshot()[0].status).toBe('running')
			expect(qs.snapshot()[0].resumeContext).toBeUndefined()
		} finally {
			await fs.rm(tempDir, {recursive: true, force: true})
		}
	})

	it('retrying with missing resume temp dir clears context and starts fresh', async () => {
		const {qs, ds} = makeService()
		const tempDir = path.join(os.tmpdir(), `arroxy-missing-${Date.now()}`)
		await fs.rm(tempDir, {recursive: true, force: true})
		ds.start.mockResolvedValue(jobResult('job-fresh'))
		qs.add([makeItem({id: 'a', status: 'error', error: {kind: 'network', raw: 'read reset'}, resumeContext: {kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: 'network'}})])

		await qs.retry('a')
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())

		expect(ds.start.mock.calls[0]?.[0].tempDir).toBeUndefined()
		expect(qs.snapshot()[0].status).toBe('running')
		expect(qs.snapshot()[0].resumeContext).toBeUndefined()
	})

	it('preserves resume context when retry start fails before DownloadService takes ownership', async () => {
		const {qs, ds} = makeService()
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-resume-start-fail-'))
		await fs.writeFile(path.join(tempDir, 'video.part'), 'partial')
		const resumeContext = {kind: 'media-retry' as const, tempDir, reason: 'media-transfer' as const, failureKind: 'network' as const}
		ds.start.mockResolvedValueOnce({ok: false, error: {code: 'download', message: 'preflight failed'}})
		qs.add([makeItem({id: 'a', status: 'error', error: {kind: 'network', raw: 'read reset'}, resumeContext})])

		await qs.retry('a')
		await vi.waitFor(() => expect(qs.snapshot()[0].status).toBe('error'))

		expect(ds.start).toHaveBeenCalledOnce()
		expect(qs.snapshot()[0].resumeContext).toEqual(resumeContext)
		await expect(fs.access(tempDir)).resolves.toBeUndefined()
		await fs.rm(tempDir, {recursive: true, force: true})
	})
})

describe('QueueService — illegal mutations are skipped without crashing', () => {
	it('cancel on a non-existent id is a no-op success', async () => {
		const {qs} = makeService()
		const result = await qs.cancel('nope')
		expect(result.ok).toBe(true)
	})

	it('remove on a running item fails (must cancel first)', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult('job-1'))
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot()[0].status).toBe('running'))
		const result = await qs.remove('a')
		expect(result.ok).toBe(false)
	})

	it('pausing a pending item transitions it to paused-held without invoking downloadService.pause', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())
		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		// b is still pending (cap=1 holds it). Holding it must not touch the
		// download IPC — paused-held items never spawned a job.
		const result = await qs.pause('b')
		expect(result.ok).toBe(true)
		expect(ds.pause).not.toHaveBeenCalled()
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('paused-held')
	})
})

// Heavier scenarios: many items, both lanes coexisting, pause/resume across
// the priority bypass and the ceiling. These lock down the cross-product of
// the new policy so future tweaks can't silently regress one corner.
describe('QueueService — two-lane heavy scenarios', () => {
	function makeServiceCeiling(normalCap: number, ceiling: number) {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, normalCap, ceiling)
		return {qs, ds}
	}
	function jobMock(ds: FakeDownloadService) {
		let n = 0
		ds.start.mockImplementation(() => Promise.resolve(jobResult(`job-${++n}`)))
	}

	it('10 mixed items + cap=1, ceiling=4: priorities saturate ceiling, normal fills the rest', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)

		// Order: 4 priority, then 6 normal. Priorities spawn 4 immediately,
		// ceiling reached, no normal yet.
		const items = [
			makeItem({id: 'p1', status: 'pending', lane: 'priority'}),
			makeItem({id: 'p2', status: 'pending', lane: 'priority'}),
			makeItem({id: 'p3', status: 'pending', lane: 'priority'}),
			makeItem({id: 'p4', status: 'pending', lane: 'priority'}),
			makeItem({id: 'n1', status: 'pending', lane: 'normal'}),
			makeItem({id: 'n2', status: 'pending', lane: 'normal'}),
			makeItem({id: 'n3', status: 'pending', lane: 'normal'}),
			makeItem({id: 'n4', status: 'pending', lane: 'normal'}),
			makeItem({id: 'n5', status: 'pending', lane: 'normal'}),
			makeItem({id: 'n6', status: 'pending', lane: 'normal'})
		]
		qs.add(items)
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(4))
		const snap = qs.snapshot()
		expect(snap.filter(i => i.status === 'running')).toHaveLength(4)
		expect(snap.filter(i => i.lane === 'priority' && i.status === 'running')).toHaveLength(4)
		expect(snap.filter(i => i.lane === 'normal' && i.status === 'running')).toHaveLength(0)
	})

	it('interleaved adds (p,n,p,n,p,n,p,n,n,n) + cap=1, ceiling=4: 1 normal + 3 priority run, ceiling enforced', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)

		const items = [
			makeItem({id: 'p1', status: 'pending', lane: 'priority'}),
			makeItem({id: 'n1', status: 'pending', lane: 'normal'}),
			makeItem({id: 'p2', status: 'pending', lane: 'priority'}),
			makeItem({id: 'n2', status: 'pending', lane: 'normal'}),
			makeItem({id: 'p3', status: 'pending', lane: 'priority'}),
			makeItem({id: 'n3', status: 'pending', lane: 'normal'}),
			makeItem({id: 'p4', status: 'pending', lane: 'priority'}),
			makeItem({id: 'n4', status: 'pending', lane: 'normal'}),
			makeItem({id: 'n5', status: 'pending', lane: 'normal'}),
			makeItem({id: 'n6', status: 'pending', lane: 'normal'})
		]
		qs.add(items)
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(4))
		const snap = qs.snapshot()
		expect(snap.filter(i => i.status === 'running')).toHaveLength(4)
		// Ordering: p1 (1), n1 (2, normalRunning=1), p2 (3), p3 (4, ceiling).
		expect(snap.find(i => i.id === 'p1')?.status).toBe('running')
		expect(snap.find(i => i.id === 'n1')?.status).toBe('running')
		expect(snap.find(i => i.id === 'p2')?.status).toBe('running')
		expect(snap.find(i => i.id === 'p3')?.status).toBe('running')
		expect(snap.find(i => i.id === 'p4')?.status).toBe('pending')
		expect(snap.find(i => i.id === 'n2')?.status).toBe('pending')
	})

	it('pauseAll with mixed running (1 normal + 2 priority) suspends all three, leaves pending untouched', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'n', status: 'pending', lane: 'normal'}), makeItem({id: 'p1', status: 'pending', lane: 'priority'}), makeItem({id: 'p2', status: 'pending', lane: 'priority'}), makeItem({id: 'rest', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(3))

		await qs.pauseAll()
		expect(qs.schedulerIsPaused()).toBe(true)
		const snap = qs.snapshot()
		expect(snap.filter(i => i.status === 'paused-active')).toHaveLength(3)
		expect(snap.find(i => i.id === 'rest')?.status).toBe('pending')
		// Pending stays pending; no further spawn.
		expect(ds.start).toHaveBeenCalledTimes(3)
	})

	it('priority pending added while paused stays pending — global pause beats priority bypass', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		await qs.pauseAll()

		qs.add([makeItem({id: 'urgent', status: 'pending', lane: 'priority'})])
		await flushMicrotasks()
		expect(qs.snapshot().find(i => i.id === 'urgent')?.status).toBe('pending')
		expect(ds.start).toHaveBeenCalledOnce()
	})

	it('setLane(priority) on a pending item while paused flips the lane but does NOT spawn', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		await qs.pauseAll()

		await qs.setLane('b', 'priority')
		expect(qs.snapshot().find(i => i.id === 'b')?.lane).toBe('priority')
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('pending')
		expect(ds.start).toHaveBeenCalledOnce()
	})

	it('resumeAll restores the queue: held → pending, paused-active → running, ceiling honored on restart', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))
		ds.resume.mockResolvedValue(ok({resumed: true}))

		qs.add([makeItem({id: 'p1', status: 'pending', lane: 'priority'}), makeItem({id: 'p2', status: 'pending', lane: 'priority'}), makeItem({id: 'p3', status: 'pending', lane: 'priority'}), makeItem({id: 'p4', status: 'pending', lane: 'priority'}), makeItem({id: 'p5', status: 'pending', lane: 'priority'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(4))
		await qs.pauseAll()
		expect(qs.snapshot().filter(i => i.status === 'paused-active')).toHaveLength(4)

		await qs.resumeAll()
		expect(qs.schedulerIsPaused()).toBe(false)
		// 4 paused-active resume; p5 still pending until one of them finishes.
		const snap = qs.snapshot()
		expect(snap.filter(i => i.status === 'running')).toHaveLength(4)
		expect(snap.find(i => i.id === 'p5')?.status).toBe('pending')
	})

	it('resumeAll on an already-running queue is a safe no-op (clears flag, no extra spawns)', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())

		await qs.resumeAll()
		expect(qs.schedulerIsPaused()).toBe(false)
		expect(ds.start).toHaveBeenCalledOnce()
	})

	it('pauseAll() is idempotent — calling twice does not double-pause anything', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot()[0].status).toBe('running'))

		await qs.pauseAll()
		await qs.pauseAll()
		expect(ds.pause).toHaveBeenCalledTimes(1)
		expect(qs.snapshot()[0].status).toBe('paused-active')
	})

	it('regression: cancel(null) during mixed lanes does NOT spawn a fresh item mid-sweep', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.cancel.mockResolvedValue(ok({cancelled: true}))

		qs.add([makeItem({id: 'n1', status: 'pending', lane: 'normal'}), makeItem({id: 'n2', status: 'pending', lane: 'normal'}), makeItem({id: 'p1', status: 'pending', lane: 'priority'}), makeItem({id: 'n3', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))
		const startCallsBeforeCancel = ds.start.mock.calls.length

		await qs.cancel(null)
		await flushMicrotasks()

		// Critical assertion: ds.start was NOT called again during the cancel
		// sweep. Pre-fix the first per-item commit fired recomputeSchedule and
		// spawned a fresh item from the pending list.
		expect(ds.start).toHaveBeenCalledTimes(startCallsBeforeCancel)
		expect(qs.snapshot().every(i => i.status === 'cancelled')).toBe(true)
	})

	it('regression: 10 normal items, 1 running before pauseAll — resumeAll respects cap=1, NOT 10 parallel spawns', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		const items = Array.from({length: 10}, (_, i) => makeItem({id: `n${i + 1}`, status: 'pending', lane: 'normal'}))
		qs.add(items)
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'n1')?.status).toBe('running'))
		expect(ds.start).toHaveBeenCalledTimes(1)

		await qs.pauseAll()
		expect(qs.snapshot().filter(i => i.status === 'paused-active')).toHaveLength(1)
		expect(qs.snapshot().filter(i => i.status === 'pending')).toHaveLength(9)

		await qs.resumeAll()
		await flushMicrotasks()
		// Cap=1: paused-active gets re-spawned, others stay pending. Total
		// ds.start calls = 1 (initial) + 1 (after resume) = 2.
		expect(ds.start).toHaveBeenCalledTimes(2)
		expect(qs.snapshot().filter(i => i.status === 'running')).toHaveLength(1)
		expect(qs.snapshot().filter(i => i.status === 'pending')).toHaveLength(9)
	})

	it('regression: resumeAll re-spawn uses the persisted tempDir so .part files are picked up', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/resume-here'}))

		qs.add([makeItem({id: 'a', status: 'pending', lane: 'normal'})])
		await vi.waitFor(() => expect(qs.snapshot()[0].status).toBe('running'))
		await qs.pauseAll()
		expect(qs.snapshot()[0].tempDir).toBe('/tmp/resume-here')

		ds.start.mockClear()
		await qs.resumeAll()
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(1)
		expect(ds.start.mock.calls[0]?.[0]).toMatchObject({tempDir: '/tmp/resume-here'})
	})

	it('cancel single pending item while paused does NOT unpause the queue', async () => {
		const {qs, ds} = makeServiceCeiling(1, 4)
		jobMock(ds)
		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		await qs.pauseAll()

		await qs.cancel('b')
		expect(qs.schedulerIsPaused()).toBe(true)
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('cancelled')
	})
})

describe('QueueService — completion + lane cascade', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('when a priority slot frees, the next pending priority spawns immediately (no sleep)', async () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 1, 2)
		let n = 0
		ds.start.mockImplementation(() => Promise.resolve(jobResult(`job-${++n}`)))

		qs.add([makeItem({id: 'p1', status: 'pending', lane: 'priority'}), makeItem({id: 'p2', status: 'pending', lane: 'priority'}), makeItem({id: 'p3', status: 'pending', lane: 'priority'})])
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(2)

		ds.emit('status', doneEvent('job-1'))
		await flushMicrotasks()
		expect(ds.start).toHaveBeenCalledTimes(3)
		expect(qs.snapshot().find(i => i.id === 'p3')?.status).toBe('running')
	})

	it('mixed completion order: normal finishes while priority runs → next normal waits for sleep, priority is unblocked', async () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 1, 3)
		let n = 0
		ds.start.mockImplementation(() => Promise.resolve(jobResult(`job-${++n}`)))

		qs.add([makeItem({id: 'n1', status: 'pending', lane: 'normal'}), makeItem({id: 'p1', status: 'pending', lane: 'priority'}), makeItem({id: 'n2', status: 'pending', lane: 'normal'}), makeItem({id: 'p2', status: 'pending', lane: 'priority'})])
		await flushMicrotasks()
		// n1 (job-1), p1 (job-2), p2 (job-3). normalCap=1 holds n2.
		expect(ds.start).toHaveBeenCalledTimes(3)

		// n1 completes → sleep window armed.
		ds.emit('status', doneEvent('job-1'))
		await flushMicrotasks()
		// n2 must wait for sleep window even though there's room.
		expect(qs.snapshot().find(i => i.id === 'n2')?.status).toBe('pending')
		expect(ds.start).toHaveBeenCalledTimes(3)

		await vi.advanceTimersByTimeAsync(600)
		await flushMicrotasks()
		expect(qs.snapshot().find(i => i.id === 'n2')?.status).toBe('running')
	})
})
