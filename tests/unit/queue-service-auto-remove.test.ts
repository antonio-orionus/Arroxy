// @vitest-environment node

import {describe, expect, it, vi, beforeEach, afterEach} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import {AUTO_REMOVE_COMPLETED_DELAY_MS} from '@shared/constants.js'
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

function doneEvent(jobId: string) {
	return {jobId, stage: 'done' as const, statusKey: 'complete' as const, at: new Date().toISOString()}
}

function failEvent(jobId: string, kind: YtDlpErrorKind) {
	return {jobId, stage: 'error' as const, statusKey: 'failed' as const, at: new Date().toISOString(), error: {kind, raw: 'boom'}}
}

async function flush() {
	await Promise.resolve()
	await Promise.resolve()
	await Promise.resolve()
}

describe('QueueService — remove completed downloads automatically', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	async function startRunningItem(autoRemove: boolean) {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.setAutoRemoveCompleted(autoRemove)
		ds.start.mockResolvedValue(jobResult())
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		return {qs, ds}
	}

	it('keeps a finished download when the setting is off', async () => {
		const {qs, ds} = await startRunningItem(false)
		ds.emit('status', doneEvent('job-1'))
		await flush()
		await vi.advanceTimersByTimeAsync(AUTO_REMOVE_COMPLETED_DELAY_MS * 10)

		expect(qs.snapshot().map(item => item.status)).toEqual(['done'])
	})

	it('shows the finished row for a short while, then removes it', async () => {
		const {qs, ds} = await startRunningItem(true)
		const removed = vi.fn()
		qs.on('removed', removed)
		ds.emit('status', doneEvent('job-1'))
		await flush()

		expect(qs.snapshot().map(item => item.status)).toEqual(['done'])
		await vi.advanceTimersByTimeAsync(AUTO_REMOVE_COMPLETED_DELAY_MS - 1)
		expect(qs.snapshot()).toHaveLength(1)

		await vi.advanceTimersByTimeAsync(1)
		await flush()
		expect(qs.snapshot()).toHaveLength(0)
		expect(removed).toHaveBeenCalledWith({itemId: 'a'})
	})

	it('leaves a failed download in the list', async () => {
		const {qs, ds} = await startRunningItem(true)
		ds.emit('status', failEvent('job-1', 'unavailable'))
		await flush()
		await vi.advanceTimersByTimeAsync(AUTO_REMOVE_COMPLETED_DELAY_MS * 10)

		expect(qs.snapshot().map(item => item.status)).toEqual(['error'])
	})

	it('cancels a pending removal when the setting is turned off', async () => {
		const {qs, ds} = await startRunningItem(true)
		ds.emit('status', doneEvent('job-1'))
		await flush()
		qs.setAutoRemoveCompleted(false)
		await vi.advanceTimersByTimeAsync(AUTO_REMOVE_COMPLETED_DELAY_MS * 10)

		expect(qs.snapshot().map(item => item.status)).toEqual(['done'])
	})

	it('does not sweep rows that were already finished when the setting is turned on', async () => {
		const {qs, ds} = await startRunningItem(false)
		ds.emit('status', doneEvent('job-1'))
		await flush()
		qs.setAutoRemoveCompleted(true)
		await vi.advanceTimersByTimeAsync(AUTO_REMOVE_COMPLETED_DELAY_MS * 10)

		expect(qs.snapshot().map(item => item.status)).toEqual(['done'])
	})

	it('survives the row being removed by hand before the timer fires', async () => {
		const {qs, ds} = await startRunningItem(true)
		ds.emit('status', doneEvent('job-1'))
		await flush()
		await qs.remove('a')

		await expect(vi.advanceTimersByTimeAsync(AUTO_REMOVE_COMPLETED_DELAY_MS)).resolves.not.toThrow()
		expect(qs.snapshot()).toHaveLength(0)
	})
})
