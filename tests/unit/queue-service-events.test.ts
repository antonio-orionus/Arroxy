// @vitest-environment node

import {describe, it, expect, vi} from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import {QueueStore} from '@main/stores/QueueStore.js'
import {QueueResumeLifecycle} from '@main/services/download/QueueResumeLifecycle.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueResumeContext, StatusEvent, ProgressEvent} from '@shared/types.js'
import {ok, fail} from '@shared/result.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {makeItem} from '../shared/fixtures.js'
import log from 'electron-log/main.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function fakeStore(): QueueStore {
	return {load: vi.fn().mockResolvedValue({ok: true, data: {items: [], schedulerPaused: false}}), save: vi.fn().mockResolvedValue({ok: true, data: undefined})} as unknown as QueueStore
}

function makeService() {
	const ds = new FakeDownloadService()
	const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
	return {qs, ds}
}

function doneStatus(jobId: string): StatusEvent {
	return {jobId, stage: 'done', statusKey: 'complete', at: new Date().toISOString()}
}

function errorStatus(jobId: string): StatusEvent {
	return {jobId, stage: 'error', statusKey: 'ytdlpProcessError', at: new Date().toISOString(), error: {kind: 'unknown', raw: 'yt-dlp exited 1'}}
}

const RESUME_CONTEXT: QueueResumeContext = {kind: 'media-retry', tempDir: '/tmp/.arroxy-temp/resume', reason: 'media-transfer', failureKind: 'network'}

function progressEvent(jobId: string, percent: number): ProgressEvent {
	return {jobId, percent, line: `${percent}%`, at: new Date().toISOString()}
}

describe('QueueService — downloadService listener path', () => {
	it('resolves a persisted probe info-json ref before starting a queued item', async () => {
		const ds = new FakeDownloadService()
		ds.start.mockResolvedValue(ok({job: {id: 'job-ref', url: '', outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: ''}}))
		const cache = {resolve: vi.fn().mockResolvedValue('/cache/probe.info.json'), delete: vi.fn()}
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 0, 1, undefined, cache as never)
		const ref = {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'}
		qs.add([makeItem({id: 'with-ref', status: 'pending', probeInfoJsonRef: ref})])
		vi.mocked(log.info).mockClear()

		await qs.start('with-ref')

		expect(cache.resolve).toHaveBeenCalledWith(ref)
		expect(log.info).toHaveBeenCalledWith('probe info-json resolved', {itemId: 'with-ref', probeInfoJsonRef: ref, probeInfoJsonPath: '/cache/probe.info.json'})
		expect(ds.start).toHaveBeenCalledWith(expect.objectContaining({probeInfoJsonPath: '/cache/probe.info.json'}))
	})

	it('downloadService emitting status done → item status=done, progressPercent=100', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])

		ds.emit('status', doneStatus('job-1'))

		const [item] = qs.snapshot()
		expect(item.status).toBe('done')
		expect(item.progressPercent).toBe(100)
	})

	it('completion deletes the probe info-json cache entry and clears the queue ref', async () => {
		const ds = new FakeDownloadService()
		const cache = {resolve: vi.fn(), delete: vi.fn().mockResolvedValue(undefined)}
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 1, 1, undefined, cache as never)
		const ref = {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'}
		qs.add([makeItem({id: 'q-complete-ref', status: 'running', lastJobId: 'job-complete-ref', probeInfoJsonRef: ref})])

		ds.emit('status', doneStatus('job-complete-ref'))
		await expect.poll(() => cache.delete.mock.calls.length).toBe(1)

		expect(cache.delete).toHaveBeenCalledWith(ref)
		await expect.poll(() => qs.snapshot()[0]?.probeInfoJsonRef).toBeUndefined()
	})

	it('downloadService emitting status error → item status=error', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-2', status: 'running', lastJobId: 'job-2'})])

		ds.emit('status', errorStatus('job-2'))

		const [item] = qs.snapshot()
		expect(item.status).toBe('error')
		expect(item.error).not.toBeNull()
	})

	it('downloadService emitting resumable media error stores resume context on the failed item', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-resume', status: 'running', lastJobId: 'job-resume'})])

		ds.emit('status', {...errorStatus('job-resume'), error: {kind: 'network', raw: 'read reset'}, resumeContext: RESUME_CONTEXT} satisfies StatusEvent)

		const [item] = qs.snapshot()
		expect(item.status).toBe('error')
		expect(item.resumeContext).toEqual(RESUME_CONTEXT)
	})

	it('downloadService emitting progress → item progressPercent updated', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-3', status: 'running', lastJobId: 'job-3'})])

		ds.emit('progress', progressEvent('job-3', 67))

		const [item] = qs.snapshot()
		expect(item.progressPercent).toBe(67)
	})

	it('cancel-all removes a running item from persisted restart state', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-service-'))
		const store = new QueueStore(dir)
		const ds = new FakeDownloadService()
		ds.cancel.mockResolvedValue({ok: true, data: {cancelled: true}})
		const qs = new QueueService(store, ds as unknown as DownloadService)

		qs.add([makeItem({id: 'q-cancel', status: 'running', lastJobId: 'job-cancel'})])

		const result = await qs.cancel(null)

		expect(result.ok).toBe(true)
		const reloaded = await store.load()
		expect(reloaded.ok).toBe(true)
		if (!reloaded.ok) return
		expect(reloaded.data.items).toEqual([])
	})
})

describe('resume — cross-restart path', () => {
	it('passes tempDir from QueueItem to downloadService.start() when no in-memory paused job exists', async () => {
		const {qs, ds} = makeService()
		const savedTempDir = '/tmp/arroxy-test/072a2c22'

		qs.add([makeItem({id: 'r-1', status: 'paused-active', lastJobId: 'old-job-id', tempDir: savedTempDir})])

		// Simulate cross-restart: DownloadService has no memory of the old job.
		ds.resume.mockResolvedValue(ok({resumed: false}))
		ds.start.mockResolvedValue(ok({job: {id: 'new-job-id', url: '', outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: ''}}))

		await qs.resume('r-1')

		expect(ds.start).toHaveBeenCalledOnce()
		const callArg = ds.start.mock.calls[0][0] as {tempDir?: string}
		expect(callArg.tempDir).toBe(savedTempDir)
	})

	it('does not pass tempDir when QueueItem has none (paused-active without tempDir)', async () => {
		const {qs, ds} = makeService()

		qs.add([makeItem({id: 'r-2', status: 'paused-active', lastJobId: 'old-job-id-2'})])

		ds.resume.mockResolvedValue(ok({resumed: false}))
		ds.start.mockResolvedValue(ok({job: {id: 'new-job-id-2', url: '', outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: ''}}))

		await qs.resume('r-2')

		expect(ds.start).toHaveBeenCalledOnce()
		const callArg = ds.start.mock.calls[0][0] as {tempDir?: string}
		expect(callArg.tempDir).toBeUndefined()
	})
})

describe('pauseAll', () => {
	it('pauses all running items', async () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'a', status: 'running', lastJobId: 'job-a'}), makeItem({id: 'b', status: 'running', lastJobId: 'job-b'}), makeItem({id: 'c', status: 'pending'})])

		ds.pause.mockResolvedValue(ok({paused: true, tempDir: '/tmp/x'}))
		await qs.pauseAll()

		expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('paused-active')
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('paused-active')
		expect(qs.snapshot().find(i => i.id === 'c')?.status).toBe('pending') // untouched
	})

	it('continues pausing remaining items when one fails', async () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'a', status: 'running', lastJobId: 'job-a'}), makeItem({id: 'b', status: 'running', lastJobId: 'job-b'})])

		let callCount = 0
		ds.pause = vi.fn().mockImplementation(() => {
			callCount++
			if (callCount === 1) return Promise.resolve(fail(createAppError('unknown', 'pause failed')))
			return Promise.resolve(ok({paused: true, tempDir: '/tmp/y'}))
		})

		await qs.pauseAll()

		expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running') // failed, stays running
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('paused-active')
	})

	it('continues pausing remaining items when one throws', async () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'a', status: 'running', lastJobId: 'job-a'}), makeItem({id: 'b', status: 'running', lastJobId: 'job-b'})])

		let callCount = 0
		ds.pause = vi.fn().mockImplementation(() => {
			callCount++
			if (callCount === 1) return Promise.reject(new Error('unexpected throw'))
			return Promise.resolve(ok({paused: true, tempDir: '/tmp/z'}))
		})

		await qs.pauseAll()

		expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('running')
		expect(qs.snapshot().find(i => i.id === 'b')?.status).toBe('paused-active')
	})
})

describe('QueueService — POST_DOWNLOAD_PHASES progress gate', () => {
	// Helper: build a phase-patch status event (downloadingMedia / mergingFormats / etc.)
	// Mirrors consumeStatusEvent's non-terminal `stage` path that hits the
	// `commit({kind:'patch'})` branch in QueueService.
	function phaseStatus(jobId: string, statusKey: 'mergingFormats' | 'embeddingMetadata' | 'movingFiles' | 'extractingAudio' | 'convertingVideo' | 'downloadingMedia'): StatusEvent {
		return {jobId, stage: 'download', statusKey, at: new Date().toISOString()}
	}

	it('drops progress arriving while item is in mergingFormats phase', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])

		// Bring item into a download phase first, then transition to merging.
		ds.emit('status', phaseStatus('job-1', 'downloadingMedia'))
		ds.emit('progress', progressEvent('job-1', 50)) // accepted
		qs.flushPendingProgressForTests()
		expect(qs.snapshot()[0].progressPercent).toBeCloseTo(50, 1)

		ds.emit('status', phaseStatus('job-1', 'mergingFormats'))
		expect(qs.snapshot()[0].lastStatus?.key).toBe('mergingFormats')

		// Stale [download] line yt-dlp may emit after Merger — must NOT overwrite
		// lastStatus or repopulate progressDetail. progressPercent monotonic so
		// the new percent is also irrelevant; the key invariant is that the merge
		// label survives.
		ds.emit('progress', progressEvent('job-1', 60))
		qs.flushPendingProgressForTests()
		expect(qs.snapshot()[0].lastStatus?.key).toBe('mergingFormats')
		expect(qs.snapshot()[0].progressDetail).toBeNull()
	})

	it('drops progress in every post-download phase (embeddingMetadata, movingFiles, extractingAudio, convertingVideo)', () => {
		for (const phase of ['embeddingMetadata', 'movingFiles', 'extractingAudio', 'convertingVideo'] as const) {
			const {qs, ds} = makeService()
			qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])
			ds.emit('status', phaseStatus('job-1', phase))
			ds.emit('progress', progressEvent('job-1', 70))
			qs.flushPendingProgressForTests()
			expect(qs.snapshot()[0].lastStatus?.key, `phase=${phase}`).toBe(phase)
		}
	})

	it('allows progress during downloadingMedia phase (sanity)', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])
		ds.emit('status', phaseStatus('job-1', 'downloadingMedia'))
		ds.emit('progress', progressEvent('job-1', 30))
		qs.flushPendingProgressForTests()
		expect(qs.snapshot()[0].progressPercent).toBeCloseTo(30, 1)
	})

	it('ignores bogus HLS bootstrap 100% and accepts later fragment progress', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])
		ds.emit('status', phaseStatus('job-1', 'downloadingMedia'))

		ds.emit('progress', {jobId: 'job-1', percent: 100, line: '[download] 100.0% of ~   1.00KiB at    1.25KiB/s ETA Unknown (frag 0/128)', at: new Date().toISOString()} satisfies ProgressEvent)
		qs.flushPendingProgressForTests()
		expect(qs.snapshot()[0].progressPercent).toBe(0)

		ds.emit('progress', {jobId: 'job-1', percent: 1.6, line: '[download]   1.6% of ~ 127.88MiB at    1.94MiB/s ETA Unknown (frag 1/128)', at: new Date().toISOString()} satisfies ProgressEvent)
		qs.flushPendingProgressForTests()

		expect(qs.snapshot()[0].progressPercent).toBeCloseTo(1.6, 1)
	})

	it('does not display 100% from progress while the item is still running', () => {
		const {qs, ds} = makeService()
		qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])
		ds.emit('status', phaseStatus('job-1', 'downloadingMedia'))

		ds.emit('progress', {jobId: 'job-1', percent: 100, line: '[download] 100.0% of 240.00MiB in 00:52', at: new Date().toISOString()} satisfies ProgressEvent)
		qs.flushPendingProgressForTests()

		const [running] = qs.snapshot()
		expect(running.status).toBe('running')
		expect(running.progressPercent).toBeLessThan(100)

		ds.emit('status', doneStatus('job-1'))
		const [done] = qs.snapshot()
		expect(done.status).toBe('done')
		expect(done.progressPercent).toBe(100)
	})
})

describe('QueueService — progress coalescing', () => {
	it('multiple progress events flush as a single updated emit', () => {
		vi.useFakeTimers()
		try {
			const {qs, ds} = makeService()
			qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])
			// Drain the synchronous `started` + `add` updated emits before counting.
			const updates: {item: {id: string; progressPercent: number}}[] = []
			qs.on('updated', (e: {item: {id: string; progressPercent: number}}) => updates.push(e))

			ds.emit('progress', progressEvent('job-1', 10))
			ds.emit('progress', progressEvent('job-1', 30))
			ds.emit('progress', progressEvent('job-1', 50))
			ds.emit('progress', progressEvent('job-1', 70))

			// Nothing emitted yet — all four buffered.
			expect(updates).toHaveLength(0)

			vi.advanceTimersByTime(100)

			// One coalesced emit carrying the latest state (highest monotonic percent).
			expect(updates).toHaveLength(1)
			expect(updates[0].item.progressPercent).toBeCloseTo(70, 1)
		} finally {
			vi.useRealTimers()
		}
	})

	it('transition during pending progress drops the stale buffered progress', () => {
		vi.useFakeTimers()
		try {
			const {qs, ds} = makeService()
			qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1'})])
			const updates: {item: {id: string; status: string; progressPercent: number}}[] = []
			qs.on('updated', (e: {item: {id: string; status: string; progressPercent: number}}) => updates.push(e))

			ds.emit('progress', progressEvent('job-1', 47)) // buffered
			// Transition fires immediately and clears the buffer.
			ds.emit('status', {jobId: 'job-1', stage: 'done', statusKey: 'complete', at: new Date().toISOString()})
			expect(updates).toHaveLength(1)
			expect(updates[0].item.status).toBe('done')

			// Pending progress was dropped — no late flush firing the stale 47%.
			vi.advanceTimersByTime(200)
			expect(updates).toHaveLength(1)
		} finally {
			vi.useRealTimers()
		}
	})
})

describe('QueueService — bulk persist coalescing', () => {
	it('cancelAll persists once regardless of item count', async () => {
		const store = fakeStore()
		const saveSpy = vi.mocked(store.save)
		const ds = new FakeDownloadService()
		const qs = new QueueService(store, ds as unknown as DownloadService)
		const items = Array.from({length: 50}, (_, i) => makeItem({id: `q-${i}`, status: 'pending'}))
		qs.add(items)
		const baselineCalls = saveSpy.mock.calls.length // add() persists once

		await qs.cancel(null)

		// Exactly one persist for the entire sweep — not 50.
		expect(saveSpy.mock.calls.length - baselineCalls).toBe(1)
		// All items cancelled.
		expect(qs.snapshot().every(i => i.status === 'cancelled')).toBe(true)
	})

	it('cancelAll cleans preserved resume temp dirs on pending retried items', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-resume-cancel-all-'))
		await fs.writeFile(path.join(tempDir, 'video.part'), 'partial')
		const pending = makeItem({id: 'pending-resume', status: 'pending', resumeContext: {...RESUME_CONTEXT, tempDir}})
		const store: QueueStore = {load: vi.fn().mockResolvedValue(ok({items: [pending], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
		const ds = new FakeDownloadService()
		ds.cancel.mockResolvedValue(ok({cancelled: false}))
		const qs = new QueueService(store, ds as unknown as DownloadService)
		await qs.init()

		const result = await qs.cancel(null)

		expect(result.ok).toBe(true)
		expect(qs.snapshot()[0].status).toBe('cancelled')
		await expect(fs.access(tempDir)).rejects.toThrow()
	})

	it('clearCompleted persists once regardless of item count', async () => {
		const store = fakeStore()
		const saveSpy = vi.mocked(store.save)
		const ds = new FakeDownloadService()
		const qs = new QueueService(store, ds as unknown as DownloadService)
		const items = Array.from({length: 30}, (_, i) => makeItem({id: `q-${i}`, status: 'done'}))
		qs.add(items)
		const baselineCalls = saveSpy.mock.calls.length

		await qs.clearCompleted()

		expect(saveSpy.mock.calls.length - baselineCalls).toBe(1)
		expect(qs.snapshot()).toHaveLength(0)
	})

	it('clearCompleted with no eligible items does not persist', async () => {
		const store = fakeStore()
		const saveSpy = vi.mocked(store.save)
		const ds = new FakeDownloadService()
		const qs = new QueueService(store, ds as unknown as DownloadService)
		qs.add([makeItem({id: 'q-1', status: 'pending'})])
		const baselineCalls = saveSpy.mock.calls.length

		await qs.clearCompleted()

		expect(saveSpy.mock.calls.length - baselineCalls).toBe(0)
	})

	it('remove cleans preserved resume temp dir', async () => {
		const {qs} = makeService()
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-resume-remove-'))
		await fs.writeFile(path.join(tempDir, 'video.part'), 'partial')
		qs.add([makeItem({id: 'remove-resume', status: 'error', error: {kind: 'network', raw: 'fail'}, resumeContext: {...RESUME_CONTEXT, tempDir}})])

		const result = await qs.remove('remove-resume')

		expect(result.ok).toBe(true)
		await expect(fs.access(tempDir)).rejects.toThrow()
	})

	it('remove still completes when resume temp cleanup fails', async () => {
		const cleanupSpy = vi.spyOn(QueueResumeLifecycle, 'cleanupResumeContext').mockRejectedValueOnce(new Error('cleanup failed'))
		try {
			const {qs} = makeService()
			qs.add([makeItem({id: 'remove-cleanup-fails', status: 'error', error: {kind: 'network', raw: 'fail'}, resumeContext: RESUME_CONTEXT})])

			const result = await qs.remove('remove-cleanup-fails')

			expect(result.ok).toBe(true)
			expect(qs.snapshot()).toHaveLength(0)
		} finally {
			cleanupSpy.mockRestore()
		}
	})

	it('clearCompleted cleans preserved resume temp dirs on failed items', async () => {
		const {qs} = makeService()
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-resume-clear-'))
		await fs.writeFile(path.join(tempDir, 'video.part'), 'partial')
		qs.add([makeItem({id: 'clear-resume', status: 'error', error: {kind: 'network', raw: 'fail'}, resumeContext: {...RESUME_CONTEXT, tempDir}})])

		const result = await qs.clearCompleted()

		expect(result.ok).toBe(true)
		expect(qs.snapshot()).toHaveLength(0)
		await expect(fs.access(tempDir)).rejects.toThrow()
	})
})

describe('QueueService — playlist M3U write gate (writeM3u opt-out)', () => {
	function makePlaylistService() {
		const ds = new FakeDownloadService()
		const writeM3u = vi.fn().mockResolvedValue(undefined)
		const manifestStore = {get: vi.fn().mockReturnValue({playlistGroupId: 'g-1', playlistTitle: 'P', outputDir: '/tmp', items: []})}
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 1, 4, {manifestStore: manifestStore as never, writeM3u})
		return {qs, ds, writeM3u}
	}

	const flush = (): Promise<void> => new Promise(r => setTimeout(r, 0))

	it('playlist item finishing with writeM3u !== false writes the M3U', async () => {
		const {qs, ds, writeM3u} = makePlaylistService()
		qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1', playlistGroupId: 'g-1', writeM3u: true})])

		ds.emit('status', doneStatus('job-1'))
		await flush()

		expect(writeM3u).toHaveBeenCalledTimes(1)
	})

	it('playlist item finishing with writeM3u === false does NOT write the M3U', async () => {
		const {qs, ds, writeM3u} = makePlaylistService()
		qs.add([makeItem({id: 'q-1', status: 'running', lastJobId: 'job-1', playlistGroupId: 'g-1', writeM3u: false})])

		ds.emit('status', doneStatus('job-1'))
		await flush()

		expect(writeM3u).not.toHaveBeenCalled()
	})
})
