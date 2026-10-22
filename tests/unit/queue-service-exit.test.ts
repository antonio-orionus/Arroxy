// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn((jobId: string) => Promise.resolve(ok({paused: true, tempDir: `/out/.arroxy-temp/${jobId}`, jobId})))
	resume = vi.fn()
}

function makeService(items: QueueItem[], schedulerPaused = false) {
	const ds = new FakeDownloadService()
	const save = vi.fn((_items: QueueItem[], _paused?: boolean) => Promise.resolve())
	const store = {load: vi.fn().mockResolvedValue(ok({items, schedulerPaused})), save} as unknown as QueueStore
	const qs = new QueueService(store, ds as unknown as DownloadService)
	return {qs, ds, save}
}

function lastSave(save: ReturnType<typeof makeService>['save']) {
	const call = save.mock.calls.at(-1)
	if (!call) throw new Error('queue was never saved')
	return {items: call[0], schedulerPaused: call[1]}
}

describe('QueueService.suspendForExit', () => {
	it('keeps every unfinished row, and stops running rows so the next launch continues them', async () => {
		const {qs, ds, save} = makeService([makeItem({id: 'run', status: 'running', lastJobId: 'job1abcd'}), makeItem({id: 'wait-1', status: 'pending'}), makeItem({id: 'wait-2', status: 'pending'}), makeItem({id: 'done', status: 'done', progressPercent: 100})])
		await qs.init()

		await qs.suspendForExit()

		expect(ds.pause).toHaveBeenCalledWith('job1abcd')
		expect(ds.cancel).not.toHaveBeenCalled()
		const saved = lastSave(save)
		expect(saved.items.map(i => [i.id, i.status])).toEqual([
			['run', 'pending'],
			['wait-1', 'pending'],
			['wait-2', 'pending'],
			['done', 'done']
		])
		// The partial download stays claimed, so the next start continues it.
		expect(saved.items.find(i => i.id === 'run')?.tempDir).toBe('/out/.arroxy-temp/job1abcd')
		expect(saved.schedulerPaused).toBe(false)
	})

	it('starts nothing new while it stops the running rows', async () => {
		const {qs, ds} = makeService([makeItem({id: 'run', status: 'running', lastJobId: 'job1abcd'}), makeItem({id: 'wait', status: 'pending'})])
		await qs.init()

		await qs.suspendForExit()
		await Promise.resolve()

		expect(ds.start).not.toHaveBeenCalled()
	})

	it('saves the queue as paused only when the user had paused it', async () => {
		const {qs, save} = makeService([makeItem({id: 'held', status: 'paused-held'})], true)
		await qs.init()

		await qs.suspendForExit()

		expect(lastSave(save).schedulerPaused).toBe(true)
		expect(lastSave(save).items[0].status).toBe('paused-held')
	})

	it('leaves a row the user paused paused', async () => {
		const {qs, ds, save} = makeService([makeItem({id: 'parked', status: 'paused-active', lastJobId: 'job2abcd', tempDir: '/out/.arroxy-temp/job2abcd'})])
		await qs.init()

		await qs.suspendForExit()

		expect(ds.pause).not.toHaveBeenCalled()
		expect(lastSave(save).items[0].status).toBe('paused-active')
	})

	it('still keeps a running row whose pause fails, to start over next launch', async () => {
		const {qs, ds, save} = makeService([makeItem({id: 'run', status: 'running', lastJobId: 'job1abcd'})])
		ds.pause.mockRejectedValueOnce(new Error('gone'))
		await qs.init()

		await qs.suspendForExit()

		const row = lastSave(save).items[0]
		expect(row.id).toBe('run')
		expect(row.status).not.toBe('cancelled')
	})

	it('stops a row still starting, and the next launch starts it again', async () => {
		const {qs, ds, save} = makeService([makeItem({id: 'starting', status: 'pending'})])
		// The start never returns: the row stays pending and spawning.
		ds.start.mockReturnValue(new Promise(() => undefined))
		await qs.init()
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())

		await qs.suspendForExit()

		// In memory the row is held, so its start parks the job when it returns.
		expect(qs.snapshot()[0].status).toBe('paused-held')
		expect(lastSave(save).items[0].status).toBe('pending')
	})

	it("keeps the user's pause flag and the stopped rows pending in every later write", async () => {
		const {qs, save} = makeService([makeItem({id: 'run', status: 'running', lastJobId: 'job1abcd'})])
		await qs.init()
		await qs.suspendForExit()

		// A write after the exit save, such as a probe finishing while the app closes.
		qs.add([makeItem({id: 'late', status: 'done', progressPercent: 100})])

		const saved = lastSave(save)
		expect(saved.schedulerPaused).toBe(false)
		expect(saved.items.find(i => i.id === 'run')?.status).toBe('pending')
		expect(qs.snapshot().find(i => i.id === 'run')?.status).toBe('paused-active')
	})

	it("saves a row it stopped as pending even when a later row's stop never returns", async () => {
		const {qs, ds, save} = makeService([makeItem({id: 'first', status: 'running', lastJobId: 'job1abcd'}), makeItem({id: 'second', status: 'running', lastJobId: 'job2abcd'})])
		// The second pause hangs, as a stuck stop would until the quit budget runs out.
		ds.pause.mockImplementation((jobId: string) => (jobId === 'job2abcd' ? new Promise(() => undefined) : Promise.resolve(ok({paused: true, tempDir: `/out/.arroxy-temp/${jobId}`, jobId}))))
		await qs.init()

		void qs.suspendForExit()
		await vi.waitFor(() => expect(ds.pause).toHaveBeenCalledWith('job2abcd'))

		expect(lastSave(save).items.find(i => i.id === 'first')?.status).toBe('pending')
	})
})
