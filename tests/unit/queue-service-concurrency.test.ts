// @vitest-environment node

import {describe, expect, it, vi} from 'vitest'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import {NORMAL_LANE_CAP, PRIORITY_LANE_HEADROOM} from '@shared/constants.js'
import {makeItem} from '../shared/fixtures.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
	setMaxConcurrent = vi.fn()
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

describe('QueueService — configurable concurrency', () => {
	it('defaults to one normal-lane download at a time', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(NORMAL_LANE_CAP))
	})

	it('spawns up to the configured limit', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())
		qs.setConcurrentDownloads(3)

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'}), makeItem({id: 'd', status: 'pending'})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(3))
	})

	it('raising the limit mid-queue starts waiting items without a restart', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(1))

		qs.setConcurrentDownloads(3)
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(3))
	})

	it('lowering the limit never kills a running download', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())
		qs.setConcurrentDownloads(3)

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(3))

		qs.setConcurrentDownloads(1)
		expect(ds.cancel).not.toHaveBeenCalled()
		expect(qs.snapshot().filter(item => item.status === 'running')).toHaveLength(3)
	})

	it('keeps priority headroom above the configured limit', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult())
		qs.setConcurrentDownloads(2)

		const normals = [makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'})]
		qs.add(normals)
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(2))

		// Priority items bypass the normal-lane cap; headroom is preserved so
		// "pull now" still spawns while the normal lane is saturated.
		qs.add([makeItem({id: 'p1', status: 'pending', lane: 'priority'}), makeItem({id: 'p2', status: 'pending', lane: 'priority'})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledTimes(4))
	})

	it('pushes the matching ceiling down to the download service', () => {
		const {qs, ds} = makeService()
		qs.setConcurrentDownloads(5)
		expect(ds.setMaxConcurrent).toHaveBeenCalledWith(5 + PRIORITY_LANE_HEADROOM)
	})
})
