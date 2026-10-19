// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'
import type {QueueItem} from '@shared/types.js'

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const REAL_JOB: QueueItem['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

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
	return makeItem({id, status: 'probing', url, title: url, job: UNRESOLVED, probeMode: 'video'})
}

function choiceItem(id: string, url = `https://youtube.com/playlist?list=${id}`): QueueItem {
	return makeItem({id, status: 'needs-choice', url, title: 'Playlist', job: UNRESOLVED, probeMode: 'video', choice: {kind: 'playlist-cap', loaded: 100}})
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

	// A batch naming one video twice queues it once; the repeat is not a video
	// "already in the queue", so it is not counted as one.
	it('queues a video repeated within one batch once, without counting the repeat', () => {
		const {qs} = makeService()
		const result = qs.add([probingItem('p1', 'https://youtube.com/watch?v=same'), probingItem('p2', 'https://youtube.com/watch?v=same')])

		expect(result).toEqual({ok: true, data: {ids: ['p1'], skippedAlreadyQueued: 0}})
		expect(qs.snapshot().map(item => item.id)).toEqual(['p1'])
	})

	// The renderer's queue can lag main's: a batch that overlaps rows main
	// already holds still queues its new videos, and says how many it skipped.
	it('add admits the new rows of a batch that overlaps live rows and counts the rest', () => {
		const {qs} = makeService()
		qs.add([probingItem('live', 'https://youtube.com/watch?v=shared')])

		const result = qs.add([probingItem('dup', 'https://youtube.com/watch?v=shared'), probingItem('new', 'https://youtube.com/watch?v=new')])

		expect(result).toEqual({ok: true, data: {ids: ['new'], skippedAlreadyQueued: 1}})
		expect(qs.snapshot().map(item => item.id)).toEqual(['live', 'new'])
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

	// Who the failed probe ran as: the row's guidance never asks for a sign-in it already had.
	it('probeFailed records a signed-in failure on the row, and a later anonymous one clears it', () => {
		const {qs} = makeService()
		qs.add([probingItem('p1')])
		expect(qs.probeFailed('p1', {kind: 'loginRequired', raw: 'You need to log in'}, 'exploreSession').ok).toBe(true)
		expect(qs.snapshot().find(i => i.id === 'p1')?.auth).toBe('exploreSession')

		expect(qs.reprobe('p1').ok).toBe(true)
		expect(qs.probeFailed('p1', {kind: 'network', raw: 'offline'}).ok).toBe(true)
		expect(qs.snapshot().find(i => i.id === 'p1')).not.toHaveProperty('auth')
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

	it('replaceProbing keeps the placeholder when its canonical URL is already live', async () => {
		const {qs, ds} = makeService()
		// Keep the already-live item's auto-spawn in flight so the scheduler pass
		// at the probe-swap bulk exit remains idempotent.
		ds.start.mockReturnValue(new Promise(() => undefined))
		const canonicalUrl = 'https://youtube.com/watch?v=canonical'
		qs.add([probingItem('p1', 'https://youtu.be/canonical'), makeItem({id: 'live', status: 'pending', url: canonicalUrl, job: REAL_JOB})])

		const result = await qs.replaceProbing('p1', [makeItem({id: 'resolved', status: 'pending', url: canonicalUrl, job: REAL_JOB})])

		expect(result.ok).toBe(false)
		if (!result.ok) expect(result.error.code).toBe('conflict')
		expect(qs.snapshot().map(item => item.id)).toEqual(['p1', 'live'])
		expect(ds.start).toHaveBeenCalledOnce()
	})

	// Two overlapping playlists prepared at once: the second swap meets entries
	// the first one just queued. Only those are left out; the rest are queued,
	// and the first queued row keeps the placeholder's id.
	it('replaceProbing admits the new entries of a batch that overlaps live rows and counts the rest', async () => {
		const {qs, ds} = makeService()
		ds.start.mockReturnValue(new Promise(() => undefined))
		const shared = 'https://youtube.com/watch?v=shared'
		qs.add([probingItem('p1', 'https://youtube.com/playlist?list=B'), makeItem({id: 'live', status: 'pending', url: shared, job: REAL_JOB})])

		const result = await qs.replaceProbing('p1', [makeItem({id: 'p1', status: 'pending', url: shared, job: REAL_JOB}), makeItem({id: 'n1', status: 'pending', url: 'https://youtube.com/watch?v=new1', job: REAL_JOB}), makeItem({id: 'n2', status: 'pending', url: 'https://youtube.com/watch?v=new2', job: REAL_JOB})])

		expect(result).toEqual({ok: true, data: {ids: ['p1', 'n2'], skippedAlreadyQueued: 1}})
		expect(qs.snapshot().map(item => [item.id, item.url])).toEqual([
			['live', shared],
			['p1', 'https://youtube.com/watch?v=new1'],
			['n2', 'https://youtube.com/watch?v=new2']
		])
	})

	it('replaceProbing queues a video repeated within the batch once, without counting the repeat', async () => {
		const {qs, ds} = makeService()
		ds.start.mockReturnValue(new Promise(() => undefined))
		qs.add([probingItem('p1', 'https://youtube.com/playlist?list=R')])
		const repeated = 'https://youtube.com/watch?v=twice'

		const result = await qs.replaceProbing('p1', [makeItem({id: 'p1', status: 'pending', url: repeated, job: REAL_JOB}), makeItem({id: 'r2', status: 'pending', url: repeated, job: REAL_JOB}), makeItem({id: 'r3', status: 'pending', url: 'https://youtube.com/watch?v=once', job: REAL_JOB})])

		expect(result).toEqual({ok: true, data: {ids: ['p1', 'r3'], skippedAlreadyQueued: 0}})
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

	// A placeholder is not a download yet: cancelling it aborts its probe and
	// removes the row rather than leaving a cancelled ghost behind.
	it('cancel aborts the probe and removes the placeholder', async () => {
		const {qs} = makeService()
		const onProbeAbort = vi.fn()
		qs.onProbeAbort(onProbeAbort)
		qs.add([probingItem('p1')])
		const result = await qs.cancel('p1')
		expect(result.ok).toBe(true)
		expect(onProbeAbort).toHaveBeenCalledWith('p1')
		expect(qs.snapshot().find(i => i.id === 'p1')).toBeUndefined()
	})

	it('cancel(null) removes placeholders, aborts their probes, and cancels downloads', async () => {
		const {qs} = makeService()
		const onProbeAbort = vi.fn()
		qs.onProbeAbort(onProbeAbort)
		qs.add([probingItem('p1'), choiceItem('c1'), makeItem({id: 'a', status: 'pending'})])
		await qs.cancel(null)
		expect(onProbeAbort).toHaveBeenCalledWith('p1')
		expect(onProbeAbort).not.toHaveBeenCalledWith('c1')
		expect(qs.snapshot().map(i => [i.id, i.status])).toEqual([['a', 'cancelled']])
	})

	it('cancel removes a needs-choice row without touching any probe', async () => {
		const {qs} = makeService()
		const onProbeAbort = vi.fn()
		qs.onProbeAbort(onProbeAbort)
		qs.add([choiceItem('c1')])
		expect((await qs.cancel('c1')).ok).toBe(true)
		expect(onProbeAbort).not.toHaveBeenCalled()
		expect(qs.snapshot()).toEqual([])
	})

	it('needsChoice parks a probing row with its choice and title', () => {
		const {qs} = makeService()
		qs.add([probingItem('p1')])
		const result = qs.needsChoice('p1', {kind: 'playlist-cap', loaded: 100}, 'Road trip mix')
		expect(result.ok).toBe(true)
		expect(qs.snapshot()[0]).toMatchObject({status: 'needs-choice', choice: {kind: 'playlist-cap', loaded: 100}, title: 'Road trip mix'})
	})

	it('needsChoice is a stale signal once the placeholder is gone', async () => {
		const {qs} = makeService()
		qs.add([probingItem('p1')])
		await qs.cancel('p1')
		expect(qs.needsChoice('p1', {kind: 'playlist-review', count: 3}, 'x').ok).toBe(false)
	})

	it('reprobe returns a probe-error row to probing, and a needs-choice row too', () => {
		const {qs} = makeService()
		qs.add([probingItem('p1'), choiceItem('c1')])
		qs.probeFailed('p1', {kind: 'network', raw: 'offline'})
		expect(qs.reprobe('p1').ok).toBe(true)
		expect(qs.reprobe('c1').ok).toBe(true)
		expect(qs.snapshot().map(i => [i.id, i.status, i.error])).toEqual([
			['p1', 'probing', null],
			['c1', 'probing', null]
		])
	})

	it('reprobe refuses a row that has a real job or is already probing', () => {
		const {qs} = makeService()
		qs.add([probingItem('p1'), makeItem({id: 'e', status: 'error', error: {kind: 'network', raw: 'x'}, job: REAL_JOB})])
		expect(qs.reprobe('p1').ok).toBe(false)
		expect(qs.reprobe('e').ok).toBe(false)
		expect(qs.reprobe('missing').ok).toBe(false)
	})

	it('replaceProbing resolves a needs-choice row once the user chose', async () => {
		const {qs, ds} = makeService()
		ds.start.mockReturnValue(new Promise(() => undefined))
		qs.add([choiceItem('c1')])
		const result = await qs.replaceProbing('c1', [makeItem({id: 'r1', status: 'pending', job: REAL_JOB})])
		expect(result.ok).toBe(true)
		expect(qs.snapshot().map(i => i.id)).toEqual(['r1'])
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

	// Decision: a choice survives a restart. It needs no live probe, and its
	// actions re-probe when the renderer no longer holds the probe result.
	it('keeps a needs-choice row as it is on boot', async () => {
		const store = fakeStore()
		store.load = vi.fn().mockResolvedValue(ok({items: [choiceItem('kept')], schedulerPaused: false}))
		const qs = new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
		await qs.init()
		expect(qs.snapshot()[0]).toMatchObject({id: 'kept', status: 'needs-choice', choice: {kind: 'playlist-cap', loaded: 100}})
	})
})
