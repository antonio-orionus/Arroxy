// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {QueueService} from '@main/services/QueueService.js'
import {QueueStore} from '@main/stores/QueueStore.js'
import {queueItemSchema} from '@shared/queueItemSchema.js'
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'
import {DownloadService} from '@main/services/DownloadService.js'
import type {QueueItem} from '@shared/types.js'
import type {YtDlpResult} from '@main/services/YtDlp.js'

vi.mock('@main/utils/diskSpace', () => ({checkDiskSpace: vi.fn().mockResolvedValue({ok: true, freeBytes: 1e12, requiredBytes: 0})}))

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function fakeStore(): QueueStore {
	return {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
}

function jobResult(jobId = 'job-1') {
	return ok({job: {id: jobId, url: '', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}})
}

function startedService() {
	const ds = new FakeDownloadService()
	ds.start.mockResolvedValue(jobResult())
	const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
	return {qs, ds}
}

const REF = {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-10-14T00:00:00.000Z', videoId: 'a'}

describe('QueueService — job auth', () => {
	it('passes the item auth into StartDownloadInput', async () => {
		const {qs, ds} = startedService()

		qs.add([makeItem({id: 'a', status: 'pending', auth: 'exploreSession'})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		expect(ds.start).toHaveBeenCalledWith(expect.objectContaining({auth: 'exploreSession'}))
	})

	it('lets the info-json ref auth win over a missing item auth', async () => {
		const {qs, ds} = startedService()

		qs.add([makeItem({id: 'a', status: 'pending', probeInfoJsonRef: {...REF, auth: 'exploreSession'}})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		expect(ds.start).toHaveBeenCalledWith(expect.objectContaining({auth: 'exploreSession'}))
	})

	it('omits auth for an anonymous item', async () => {
		const {qs, ds} = startedService()

		qs.add([makeItem({id: 'a', status: 'pending', probeInfoJsonRef: REF})])

		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		expect(ds.start.mock.calls[0]?.[0]).not.toHaveProperty('auth')
	})

	it('persists auth across reload', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-service-auth-'))
		const store = new QueueStore(dir)
		const item = makeItem({id: 'a', status: 'paused-held', auth: 'exploreSession', probeInfoJsonRef: {...REF, auth: 'exploreSession'}})

		await store.save([item])
		const reloaded = await store.load()

		expect(reloaded.ok).toBe(true)
		if (!reloaded.ok) return
		expect(reloaded.data.items[0]?.auth).toBe('exploreSession')
		expect(reloaded.data.items[0]?.probeInfoJsonRef?.auth).toBe('exploreSession')
		await fs.rm(dir, {recursive: true, force: true})
	})

	it('rejects an unknown auth value at the schema boundary', () => {
		const item = makeItem({id: 'a', status: 'pending'})
		expect(queueItemSchema.safeParse({...item, auth: 'admin'}).success).toBe(false)
		expect(queueItemSchema.safeParse({...item, probeInfoJsonRef: {...REF, auth: 'admin'}}).success).toBe(false)
	})
})

describe('QueueService — identity of a started job (R17)', () => {
	function serviceWithCache() {
		const ds = new FakeDownloadService()
		ds.start.mockResolvedValue(jobResult())
		const cache = {resolve: vi.fn().mockResolvedValue('/cache/probe.info.json'), delete: vi.fn().mockResolvedValue(undefined)}
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, undefined, undefined, undefined, cache as never)
		return {qs, ds}
	}

	it('never replays an anonymous probe info-json on an escalated item', async () => {
		const {qs, ds} = serviceWithCache()
		qs.add([makeItem({id: 'a', status: 'pending', auth: 'exploreSession', probeInfoJsonRef: {...REF, formatsWithheld: true}})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		const input = ds.start.mock.calls[0]?.[0]
		expect(input).toMatchObject({auth: 'exploreSession'})
		expect(input).not.toHaveProperty('probeInfoJsonPath')
		expect(input).not.toHaveProperty('probeFormatsWithheld')
	})

	it('replays a signed-in probe info-json on an escalated item', async () => {
		const {qs, ds} = serviceWithCache()
		qs.add([makeItem({id: 'a', status: 'pending', auth: 'exploreSession', probeInfoJsonRef: {...REF, auth: 'exploreSession', formatsWithheld: true}})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		expect(ds.start.mock.calls[0]?.[0]).toMatchObject({auth: 'exploreSession', probeInfoJsonPath: '/cache/probe.info.json', probeFormatsWithheld: true})
	})

	it('replays an anonymous probe info-json on an anonymous item', async () => {
		const {qs, ds} = serviceWithCache()
		qs.add([makeItem({id: 'a', status: 'pending', probeInfoJsonRef: REF})])
		await vi.waitFor(() => expect(ds.start).toHaveBeenCalledOnce())
		const input = ds.start.mock.calls[0]?.[0]
		expect(input).toMatchObject({probeInfoJsonPath: '/cache/probe.info.json'})
		expect(input).not.toHaveProperty('auth')
	})
})

describe('QueueService — download-time escalation', () => {
	it('persists auth on signingInWithExplore before the status event returns', async () => {
		const snapshots: QueueItem[][] = []
		const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: false})), save: vi.fn((items: QueueItem[]) => Promise.resolve(void snapshots.push(structuredClone(items))))} as unknown as QueueStore
		const ds = new FakeDownloadService()
		ds.start.mockResolvedValue(jobResult('job-1'))
		const qs = new QueueService(store, ds as unknown as DownloadService)
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.lastJobId).toBe('job-1'))

		qs.consumeStatusEvent({jobId: 'job-1', stage: 'download', statusKey: 'signingInWithExplore', at: new Date().toISOString()})

		// Synchronously committed: no await separates the event from the write.
		expect(snapshots.at(-1)?.find(i => i.id === 'a')?.auth).toBe('exploreSession')
		expect(qs.snapshot().find(i => i.id === 'a')).toMatchObject({auth: 'exploreSession', lastStatus: {key: 'signingInWithExplore'}})
	})

	it('leaves auth alone for other status keys', async () => {
		const {qs} = startedService()
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.lastJobId).toBe('job-1'))

		qs.consumeStatusEvent({jobId: 'job-1', stage: 'download', statusKey: 'downloadingMedia', at: new Date().toISOString()})

		expect(qs.snapshot().find(i => i.id === 'a')?.auth).toBeUndefined()
	})

	it('has the item persisted as signed in before the escalated yt-dlp run starts', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-service-escalation-'))
		const store = new QueueStore(dir)
		const persistedAuthAtEscalatedRun: unknown[] = []
		const loginRequired: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'loginRequired', rawError: 'ERROR: Sign in to confirm your age', stdout: '', stderr: ''}
		const run = vi.fn(async (_req: unknown, _signal: unknown, options?: {identity?: string}) => {
			if (options?.identity !== 'exploreSession') return loginRequired
			const persisted = await store.load()
			persistedAuthAtEscalatedRun.push(persisted.ok ? persisted.data.items[0]?.auth : 'load failed')
			return {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false} satisfies YtDlpResult
		})
		const resetJob = vi.fn()
		const ytDlp = {prepare: vi.fn().mockResolvedValue(undefined), run, usesCookies: vi.fn().mockResolvedValue(false), invalidateTokenSession: vi.fn(), ffmpegPath: null, childEnv: () => ({})}
		const downloads = new DownloadService(ytDlp as never, {push: vi.fn().mockResolvedValue(undefined)} as never, false, undefined, {exploreGate: {canEscalate: () => Promise.resolve(true)}, exploreSession: {verifySignedIn: () => Promise.resolve('signedIn' as const)}, spawnGate: {resetJob}})
		const qs = new QueueService(store, downloads)
		const jobIds = new Set<string>()
		downloads.on('status', (event: {jobId: string}) => jobIds.add(event.jobId))

		qs.add([makeItem({id: 'a', status: 'pending', outputDir: dir})])

		// Two runs plus a queue.json write and reload: slow Windows runners need more than the 1 s default.
		await vi.waitFor(() => expect(qs.snapshot().find(i => i.id === 'a')?.status).toBe('done'), {timeout: 10_000})
		expect(run.mock.calls.map(call => call[2]?.identity)).toEqual(['configured', 'exploreSession'])
		expect(persistedAuthAtEscalatedRun).toEqual(['exploreSession'])
		// The attempt is over, so its signed-in spawn budget is released.
		expect(jobIds.size).toBe(1)
		await vi.waitFor(() => expect(resetJob).toHaveBeenCalledWith([...jobIds][0]))
		await fs.rm(dir, {recursive: true, force: true})
	})
})
