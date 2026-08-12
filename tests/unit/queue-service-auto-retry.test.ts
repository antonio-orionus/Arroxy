// @vitest-environment node

import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import {AUTO_RETRY_BACKOFF_MS} from '@shared/autoRetry.js'
import type {QueueItem, YtDlpErrorKind} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
	setMaxConcurrent = vi.fn()
}

function fakeStore(items: QueueItem[] = []): QueueStore {
	return {load: vi.fn().mockResolvedValue(ok({items, schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
}

function jobResult(jobId = 'job-1') {
	return ok({job: {id: jobId, url: '', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}})
}

function failEvent(jobId: string, kind: YtDlpErrorKind) {
	return {jobId, stage: 'error' as const, statusKey: 'failed' as const, at: new Date().toISOString(), error: {kind, raw: 'boom'}}
}

async function flush() {
	await Promise.resolve()
	await Promise.resolve()
	await Promise.resolve()
}

describe('QueueService — automatic retry', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	async function startFailingItem(attempts: number) {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.setAutoRetryAttempts(attempts)
		ds.start.mockResolvedValue(jobResult())
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		return {qs, ds}
	}

	it('leaves a failure alone when auto-retry is off', async () => {
		const {qs, ds} = await startFailingItem(0)
		ds.emit('status', failEvent('job-1', 'network'))
		await flush()

		const item = qs.snapshot()[0]
		expect(item.status).toBe('error')
		expect(item.retryAt).toBeUndefined()
		expect(item.retryCount).toBe(0)
	})

	it('schedules a retry for a transient failure and respawns after the backoff', async () => {
		const {qs, ds} = await startFailingItem(3)
		ds.emit('status', failEvent('job-1', 'network'))
		await flush()

		const scheduled = qs.snapshot()[0]
		expect(scheduled.status).toBe('error')
		expect(scheduled.retryCount).toBe(1)
		expect(scheduled.retryAt).toBeTruthy()

		await vi.advanceTimersByTimeAsync(AUTO_RETRY_BACKOFF_MS[0])
		await flush()

		expect(qs.snapshot()[0].retryAt).toBeUndefined()
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))
	})

	it('does not schedule a retry for a bot wall', async () => {
		const {qs, ds} = await startFailingItem(3)
		ds.emit('status', failEvent('job-1', 'botBlock'))
		await flush()

		expect(qs.snapshot()[0].retryAt).toBeUndefined()
		expect(qs.snapshot()[0].retryCount).toBe(0)
	})

	it('gives up once the configured attempts are exhausted', async () => {
		const {qs, ds} = await startFailingItem(1)
		ds.emit('status', failEvent('job-1', 'network'))
		await flush()
		expect(qs.snapshot()[0].retryCount).toBe(1)

		await vi.advanceTimersByTimeAsync(AUTO_RETRY_BACKOFF_MS[0])
		await flush()
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))

		ds.emit('status', failEvent('job-1', 'network'))
		await flush()

		const item = qs.snapshot()[0]
		expect(item.status).toBe('error')
		expect(item.retryAt).toBeUndefined()
		expect(item.retryCount).toBe(1)
	})

	it('cancelling a waiting item stops its pending retry', async () => {
		const {qs, ds} = await startFailingItem(3)
		ds.emit('status', failEvent('job-1', 'network'))
		await flush()
		expect(qs.snapshot()[0].retryAt).toBeTruthy()

		await qs.cancel('a')
		await vi.advanceTimersByTimeAsync(AUTO_RETRY_BACKOFF_MS[0] * 2)
		await flush()

		expect(qs.snapshot()[0].status).toBe('cancelled')
		expect(ds.start).toHaveBeenCalledOnce()
	})

	it('a manual retry clears the schedule and restores the full budget', async () => {
		const {qs, ds} = await startFailingItem(3)
		ds.emit('status', failEvent('job-1', 'network'))
		await flush()
		expect(qs.snapshot()[0].retryCount).toBe(1)

		await qs.retry('a')
		await flush()

		const item = qs.snapshot()[0]
		expect(item.retryCount).toBe(0)
		expect(item.retryAt).toBeUndefined()
	})

	it('re-arms a retry that was pending when the app quit', async () => {
		const ds = new FakeDownloadService()
		const persisted = makeItem({id: 'a', status: 'error'})
		persisted.retryCount = 1
		persisted.retryAt = new Date(Date.now() - 1_000).toISOString()
		const qs = new QueueService(fakeStore([persisted]), ds as unknown as DownloadService)
		qs.setAutoRetryAttempts(3)
		ds.start.mockResolvedValue(jobResult())

		await qs.init()
		await vi.advanceTimersByTimeAsync(0)
		await flush()

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
	})
})
