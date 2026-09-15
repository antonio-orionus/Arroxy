// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vitest'
import {EventEmitter} from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const REAL_JOB: QueueItem['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

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
	const store = fakeStore()
	const qs = new QueueService(store, ds as unknown as DownloadService)
	return {qs, ds, store}
}

function jobResult(jobId: string) {
	return ok({job: {id: jobId, url: '', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}})
}

const tempDirs: string[] = []

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
})

describe('QueueService — bulk commands', () => {
	it('an overlapping bulk command does not re-enable scheduling under a sweep still in progress', async () => {
		// Default normal-lane cap is 1: the running item blocks every pending one.
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(jobResult('job-next'))
		let releaseCancel: ((value: unknown) => void) | undefined
		ds.cancel.mockResolvedValue(ok(undefined))
		ds.cancel.mockImplementationOnce(() => new Promise(resolve => (releaseCancel = resolve)))
		qs.add([makeItem({id: 'a', status: 'running', lastJobId: 'job-a'}), makeItem({id: 'b', status: 'pending'}), makeItem({id: 'c', status: 'pending'})])
		expect(ds.start).not.toHaveBeenCalled()

		// Sweep 1 parks on cancelling the running item.
		const sweep = qs.applySelectionAction('cancel', ['a', 'b'])
		await vi.waitFor(() => expect(ds.cancel).toHaveBeenCalledWith('job-a'))

		// Sweep 2 starts and finishes while sweep 1 is still parked.
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-bulk-'))
		tempDirs.push(dir)
		const move = await qs.changeOutputTarget(['c'], dir)
		expect(move.ok).toBe(true)

		releaseCancel?.(ok(undefined))
		const result = await sweep
		expect(result.ok).toBe(true)

		// b was slated for cancellation in the same sweep, so it must never start.
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledWith(expect.objectContaining({url: 'https://youtube.com/watch?v=c', outputDir: dir})))
		expect(ds.start).toHaveBeenCalledTimes(1)
		expect(qs.snapshot().find(item => item.id === 'b')?.status).toBe('cancelled')
	})

	it('replaceProbing persists the swap once', async () => {
		const {qs, ds, store} = makeService()
		// Never resolves: keeps the auto-spawn from committing `started` mid-assertion.
		ds.start.mockReturnValue(new Promise(() => undefined))
		qs.add([makeItem({id: 'p1', status: 'probing', job: UNRESOLVED})])
		vi.mocked(store.save).mockClear()

		const result = await qs.replaceProbing('p1', [makeItem({id: 'r1', status: 'pending', job: REAL_JOB})])

		expect(result.ok).toBe(true)
		expect(qs.snapshot().map(item => item.id)).toEqual(['r1'])
		expect(store.save).toHaveBeenCalledTimes(1)
	})
})
