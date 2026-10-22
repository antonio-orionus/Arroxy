// @vitest-environment node
//
// The scheduler's spawn when a row names a parked job (Resume All) or is paused
// while its start is in flight: the branches the mock-mode integration tests in
// tests/integration/queue-pause-resume.test.ts cannot reach.

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok, type Result} from '@shared/result.js'
import type {StartDownloadOutput} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn().mockResolvedValue(ok({cancelled: true}))
	pause = vi.fn().mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))
	resume = vi.fn()
}

function jobResult(jobId: string): Result<StartDownloadOutput> {
	return ok({job: {id: jobId, url: '', outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: ''}})
}

function makeService() {
	const ds = new FakeDownloadService()
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const qs = new QueueService(store, ds as unknown as DownloadService)
	return {qs, ds}
}

// A row Resume All moved back to pending: it still names the job it parked.
async function parkedRowResumed(qs: QueueService, ds: FakeDownloadService): Promise<void> {
	ds.start.mockResolvedValueOnce(jobResult('job-1'))
	qs.add([makeItem({id: 'a', status: 'pending'})])
	await vi.waitFor(() => expect(qs.snapshot()[0]?.status).toBe('running'))
	await qs.pauseAll()
	expect(qs.snapshot()[0]).toMatchObject({status: 'paused-active', lastJobId: 'job-1'})
	await qs.resumeAll()
}

describe('spawn of a row that names a parked job', () => {
	it('fails the row when resuming its parked job fails, without starting another', async () => {
		const {qs, ds} = makeService()
		ds.resume.mockResolvedValue({ok: false, error: {code: 'download', message: 'boom'}})
		await parkedRowResumed(qs, ds)
		await vi.waitFor(() => expect(qs.snapshot()[0]?.status).toBe('error'))
		expect(ds.start).toHaveBeenCalledOnce()
	})

	it('puts the row back to paused when its job is still pausing, without starting another', async () => {
		const {qs, ds} = makeService()
		ds.resume.mockResolvedValue(ok({resumed: false, jobLive: true}))
		await parkedRowResumed(qs, ds)
		await vi.waitFor(() => expect(qs.snapshot()[0]?.status).toBe('paused-active'))
		expect(qs.snapshot()[0]?.lastJobId).toBe('job-1')
		expect(ds.start).toHaveBeenCalledOnce()

		// The spawn has ended: a later resume runs again.
		ds.resume.mockResolvedValue(ok({resumed: true}))
		expect((await qs.resume('a')).ok).toBe(true)
		expect(qs.snapshot()[0]?.status).toBe('running')
	})

	it('leaves a row cancelled during the resume alone, and starts nothing', async () => {
		const {qs, ds} = makeService()
		let answer: (value: unknown) => void = () => undefined
		ds.resume.mockReturnValue(new Promise(res => (answer = res)))
		await parkedRowResumed(qs, ds)
		await vi.waitFor(() => expect(ds.resume).toHaveBeenCalledOnce())

		await qs.cancel('a')
		expect(ds.cancel).toHaveBeenCalledWith('job-1')
		answer(ok({resumed: false}))
		await vi.waitFor(() => expect(qs.snapshot()[0]?.status).toBe('cancelled'))
		expect(ds.start).toHaveBeenCalledOnce()

		// Its spawn has ended and freed the slot.
		ds.start.mockResolvedValueOnce(jobResult('job-2'))
		qs.add([makeItem({id: 'b', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('running'))
	})
})

describe('spawn of a row paused while it was starting', () => {
	it('keeps tracking the job when it ended before it could be parked', async () => {
		const {qs, ds} = makeService()
		let started: (value: Result<StartDownloadOutput>) => void = () => undefined
		ds.start.mockReturnValueOnce(new Promise(res => (started = res)))
		ds.pause.mockResolvedValue(ok({paused: false}))
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())

		await qs.pause('a')
		started(jobResult('job-1'))
		await vi.waitFor(() => expect(ds.pause).toHaveBeenCalledWith('job-1'))
		// The row names the job, so the job's own end (done or failed) still reaches it.
		expect(qs.snapshot()[0]).toMatchObject({status: 'paused-active', lastJobId: 'job-1'})
		ds.emit('status', {jobId: 'job-1', stage: 'error', statusKey: 'unknownStartupFailure', error: {kind: 'unknown', raw: 'gone'}, at: new Date().toISOString()})
		expect(qs.snapshot()[0]?.status).toBe('error')
	})
})
