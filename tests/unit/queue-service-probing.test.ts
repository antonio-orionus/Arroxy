// @vitest-environment node

import {describe, expect, it, vi} from 'vitest'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'
import type {QueueItem} from '@shared/types.js'

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const REAL_JOB: QueueItem['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

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

function probingItem(id: string, url = `https://youtube.com/watch?v=${id}`): QueueItem {
	return makeItem({id, status: 'probing', url, title: url, job: UNRESOLVED})
}

describe('QueueService — probing items', () => {
	it('never auto-starts a probing item', async () => {
		const {qs, ds} = makeService()
		qs.add([probingItem('p1')])
		await vi.waitFor(() => expect(qs.snapshot()[0]?.status).toBe('probing'))
		expect(ds.start).not.toHaveBeenCalled()
	})

	it('atomically rejects a duplicate live URL', () => {
		const {qs} = makeService()
		const first = probingItem('p1', 'https://youtube.com/watch?v=same')
		const second = probingItem('p2', 'https://youtube.com/watch?v=same')
		expect(qs.add([first]).ok).toBe(true)
		const duplicate = qs.add([second])
		expect(duplicate.ok).toBe(false)
		if (!duplicate.ok) expect(duplicate.error.code).toBe('conflict')
		expect(qs.snapshot().map(item => item.id)).toEqual(['p1'])
	})

	it('rejects duplicate live URLs within one batch', () => {
		const {qs} = makeService()
		const result = qs.add([probingItem('p1', 'https://youtube.com/watch?v=same'), probingItem('p2', 'https://youtube.com/watch?v=same')])

		expect(result.ok).toBe(false)
		expect(qs.snapshot()).toEqual([])
	})

	it('probeFailed moves probing → error with the probe error', () => {
		const {qs} = makeService()
		qs.add([probingItem('p1')])
		const result = qs.probeFailed('p1', {kind: 'unknown', raw: 'yt-dlp exploded'})
		expect(result.ok).toBe(true)
		const item = qs.snapshot().find(i => i.id === 'p1')
		expect(item?.status).toBe('error')
		expect(item?.error).toEqual({kind: 'unknown', raw: 'yt-dlp exploded'})
	})

	it('probeFailed is a no-op refusal on a non-probing item', () => {
		const {qs} = makeService()
		qs.add([makeItem({id: 'a', status: 'pending'})])
		const result = qs.probeFailed('a', {kind: 'unknown', raw: 'x'})
		expect(result.ok).toBe(false)
		expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('pending')
	})

	it('retry refuses an unresolved probe-error row', async () => {
		// The row has no job to run — resetting it to pending would make the
		// scheduler hand an unresolved job to DownloadService.start, which
		// rejects. It stays a terminal error row the user can remove.
		const {qs} = makeService()
		qs.add([probingItem('p1')])
		expect(qs.probeFailed('p1', {kind: 'unknown', raw: 'yt-dlp exploded'}).ok).toBe(true)
		const result = await qs.retry('p1')
		expect(result.ok).toBe(false)
		expect(qs.snapshot().find(i => i.id === 'p1')?.status).toBe('error')
	})

	it('replaceProbing swaps a probing row for prepared items atomically', async () => {
		const {qs, ds} = makeService()
		ds.start.mockResolvedValue(ok({job: {id: 'j1', url: 'https://youtube.com/watch?v=r1'}}))
		qs.add([probingItem('p1')])
		const prepared = makeItem({id: 'r1', status: 'pending', job: REAL_JOB})
		const result = await qs.replaceProbing('p1', [prepared])
		expect(result.ok).toBe(true)
		const ids = result.ok ? result.data.ids : []
		expect(ids).toEqual(['r1'])
		expect(qs.snapshot().find(i => i.id === 'p1')).toBeUndefined()
		expect(qs.snapshot().find(i => i.id === 'r1')).toBeDefined()
		// The prepared item enters the ordinary pipeline: the scheduler spawns it.
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalled())
	})

	it('replaceProbing refuses and enqueues nothing when the placeholder is gone', async () => {
		const {qs, ds} = makeService()
		qs.add([probingItem('p1')])
		await qs.cancel('p1')
		const prepared = makeItem({id: 'r1', status: 'pending', job: REAL_JOB})
		const result = await qs.replaceProbing('p1', [prepared])
		expect(result.ok).toBe(false)
		expect(qs.snapshot().find(i => i.id === 'r1')).toBeUndefined()
		expect(ds.start).not.toHaveBeenCalled()
	})

	it('remove aborts the probe through the abort hook', async () => {
		const {qs} = makeService()
		const onProbeAbort = vi.fn()
		qs.onProbeAbort(onProbeAbort)
		qs.add([probingItem('p1')])
		await qs.remove('p1')
		expect(onProbeAbort).toHaveBeenCalledWith('p1')
		expect(qs.snapshot().find(i => i.id === 'p1')).toBeUndefined()
	})

	it('cancel aborts the probe through the abort hook', async () => {
		const {qs} = makeService()
		const onProbeAbort = vi.fn()
		qs.onProbeAbort(onProbeAbort)
		qs.add([probingItem('p1')])
		const result = await qs.cancel('p1')
		expect(result.ok).toBe(true)
		expect(onProbeAbort).toHaveBeenCalledWith('p1')
		expect(qs.snapshot().find(i => i.id === 'p1')?.status).toBe('cancelled')
	})

	it('cancel(null) sweeps probing items and aborts their probes', async () => {
		const {qs} = makeService()
		const onProbeAbort = vi.fn()
		qs.onProbeAbort(onProbeAbort)
		qs.add([probingItem('p1'), makeItem({id: 'a', status: 'pending'})])
		await qs.cancel(null)
		expect(onProbeAbort).toHaveBeenCalledWith('p1')
		const p1 = qs.snapshot().find(i => i.id === 'p1')
		const a = qs.snapshot().find(i => i.id === 'a')
		expect(p1?.status).toBe('cancelled')
		expect(a?.status).toBe('cancelled')
	})

	it('remove on a probing item does not call the abort hook for non-probing items', async () => {
		const {qs} = makeService()
		const onProbeAbort = vi.fn()
		qs.onProbeAbort(onProbeAbort)
		qs.add([makeItem({id: 'a', status: 'done', finishedAt: '2026-01-01T00:00:00.000Z', job: REAL_JOB})])
		await qs.remove('a')
		expect(onProbeAbort).not.toHaveBeenCalled()
	})

	it('promotes stale probing items to error on boot', async () => {
		const store = fakeStore()
		store.load = vi.fn().mockResolvedValue(ok({items: [probingItem('stale')], schedulerPaused: false}))
		const ds = new FakeDownloadService()
		const qs = new QueueService(store, ds as unknown as DownloadService)
		await qs.init()
		const stale = qs.snapshot().find(i => i.id === 'stale')
		expect(stale?.status).toBe('error')
		expect(stale?.error?.kind).toBe('unknown')
	})
})
