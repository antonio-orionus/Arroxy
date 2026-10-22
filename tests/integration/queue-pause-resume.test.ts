// @vitest-environment node
//
// Pause All / Resume All across the real seam between QueueService and
// DownloadService (mock mode: no yt-dlp process, a timer stands in for the
// transfer). The queue store is faked; the job bookkeeping (activeJobs,
// pausedJobs) is the real one, so a test can see whether a parked job is
// resumed or left behind.

import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {QueueService} from '@main/services/QueueService.js'
import {DownloadService} from '@main/services/DownloadService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import type {ActiveDownload, PausedDownload} from '@main/services/phases/index.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'

function deferred(): {promise: Promise<void>; resolve: () => void} {
	let resolve: () => void = () => undefined
	const promise = new Promise<void>(res => {
		resolve = res
	})
	return {promise, resolve}
}

function fakeStore(): QueueStore {
	return {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
}

// `binariesReady` holds every job in "Preparing" (binary setup) until it resolves.
function makeServices(binariesReady: Promise<void> = Promise.resolve()) {
	const binaryManager = {ensureYtDlp: vi.fn(() => binariesReady.then(() => '/tmp/yt-dlp')), ensureFFmpeg: vi.fn().mockResolvedValue('/tmp/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const tokenService = {getToken: vi.fn().mockResolvedValue({token: 'mock-token', visitorData: 'mock-visitor'})}
	const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)}
	const ytDlp = new YtDlp(binaryManager as never, tokenService as never, {get: vi.fn().mockResolvedValue({})})
	const downloads = new DownloadService(ytDlp, recentJobsStore as never, true)
	const queue = new QueueService(fakeStore(), downloads)
	const internals = downloads as unknown as {activeJobs: Map<string, ActiveDownload>; pausedJobs: Map<string, PausedDownload>}
	return {queue, downloads, binaryManager, internals}
}

let outputDir: string | undefined

afterEach(async () => {
	vi.useRealTimers()
	if (outputDir) await rm(outputDir, {recursive: true, force: true, maxRetries: 5, retryDelay: 100})
	outputDir = undefined
})

async function itemIn(id: string) {
	outputDir = await mkdtemp(join(tmpdir(), 'arroxy-queue-pause-'))
	return makeItem({id, status: 'pending', outputDir})
}

describe('Pause All while a download is still starting', () => {
	it('pauses the starting download instead of letting it run once its start finishes', async () => {
		const binaries = deferred()
		const {queue, downloads, binaryManager} = makeServices(binaries.promise)
		queue.add([await itemIn('a')])
		await vi.waitFor(() => expect(binaryManager.ensureYtDlp).toHaveBeenCalledOnce())
		expect(queue.snapshot()[0]?.status).toBe('pending')

		const result = await queue.pauseAll()
		expect(result.done).toEqual(['a'])

		vi.useFakeTimers()
		binaries.resolve()
		await vi.waitFor(() => expect(downloads.pausedCount).toBe(1))
		const row = queue.snapshot()[0]
		expect(row?.status).toBe('paused-active')
		expect(downloads.runningJobCount).toBe(0)

		await queue.cancel(null)
	})

	it('parks a single download paused while it is still starting', async () => {
		const binaries = deferred()
		const {queue, downloads, binaryManager} = makeServices(binaries.promise)
		queue.add([await itemIn('a')])
		await vi.waitFor(() => expect(binaryManager.ensureYtDlp).toHaveBeenCalledOnce())

		expect((await queue.pause('a')).ok).toBe(true)
		expect(queue.snapshot()[0]?.status).toBe('paused-held')

		vi.useFakeTimers()
		binaries.resolve()
		await vi.waitFor(() => expect(downloads.pausedCount).toBe(1))
		expect(queue.snapshot()[0]?.status).toBe('paused-active')
		expect(downloads.runningJobCount).toBe(0)
		await queue.cancel(null)
	})
})

describe('Resume All', () => {
	it('resumes the parked job, keeping its limited-quality state, instead of starting a new one', async () => {
		vi.useFakeTimers()
		const {queue, downloads, internals} = makeServices()
		queue.add([await itemIn('a')])
		await vi.waitFor(() => expect(queue.snapshot()[0]?.status).toBe('running'))
		const jobId = queue.snapshot()[0]?.lastJobId
		expect(jobId).toBeDefined()

		await queue.pauseAll()
		expect(queue.snapshot()[0]?.status).toBe('paused-active')
		// A download limited to a lower quality (it needed sign-in) parks with that limit.
		const parked = internals.pausedJobs.get(jobId ?? '')
		expect(parked).toBeDefined()
		if (parked) internals.pausedJobs.set(parked.job.id, {...parked, qualityLimit: {height: 360}, formatsWithheld: true})

		const start = vi.spyOn(downloads, 'start')
		await queue.resumeAll()
		await vi.waitFor(() => expect(queue.snapshot()[0]?.status).toBe('running'))

		expect(start).not.toHaveBeenCalled()
		expect(downloads.pausedCount).toBe(0)
		expect(queue.snapshot()[0]?.lastJobId).toBe(jobId)
		const active = internals.activeJobs.get(jobId ?? '')
		expect(active?.qualityLimit).toEqual({height: 360})
		expect(active?.formatsWithheld).toBe(true)
		await queue.cancel(null)
	})

	it('resumes a download Pause All caught while it was starting', async () => {
		const binaries = deferred()
		const {queue, downloads, binaryManager} = makeServices(binaries.promise)
		queue.add([await itemIn('a')])
		await vi.waitFor(() => expect(binaryManager.ensureYtDlp).toHaveBeenCalledOnce())
		await queue.pauseAll()
		vi.useFakeTimers()
		binaries.resolve()
		await vi.waitFor(() => expect(downloads.pausedCount).toBe(1))
		const jobId = queue.snapshot()[0]?.lastJobId

		const start = vi.spyOn(downloads, 'start')
		await queue.resumeAll()
		await vi.waitFor(() => expect(queue.snapshot()[0]?.status).toBe('running'))
		expect(start).not.toHaveBeenCalled()
		expect(queue.snapshot()[0]?.lastJobId).toBe(jobId)
		expect(downloads.pausedCount).toBe(0)
		await queue.cancel(null)
	})

	it('leaves no parked job behind for a row paused, cancelled or removed while it waits for a slot', async () => {
		vi.useFakeTimers()
		const {queue, downloads} = makeServices()
		outputDir = await mkdtemp(join(tmpdir(), 'arroxy-queue-pause-'))
		const dir = outputDir
		queue.add(['a', 'b', 'c', 'd'].map(id => makeItem({id, status: 'pending', outputDir: dir, lane: 'priority'})))
		await vi.waitFor(() => expect(queue.snapshot().filter(i => i.status === 'running')).toHaveLength(4))
		await queue.pauseAll()
		expect(downloads.pausedCount).toBe(4)
		const jobB = queue.snapshot().find(i => i.id === 'b')?.lastJobId

		// Only one slot: a resumes, b, c and d wait as pending rows naming their parked jobs.
		queue.setConcurrentDownloads(1)
		const start = vi.spyOn(downloads, 'start')
		await queue.setLane('b', 'normal')
		await queue.setLane('c', 'normal')
		await queue.setLane('d', 'normal')
		await queue.setLane('a', 'normal')
		await queue.resumeAll()
		await vi.waitFor(() => expect(queue.snapshot().find(i => i.id === 'a')?.status).toBe('running'))
		expect(
			queue
				.snapshot()
				.filter(i => i.status === 'pending')
				.map(i => i.id)
		).toEqual(['b', 'c', 'd'])

		await queue.pause('b')
		expect(queue.snapshot().find(i => i.id === 'b')).toMatchObject({status: 'paused-active', lastJobId: jobB})
		await queue.cancel('c')
		await queue.remove('d')
		expect(downloads.pausedCount).toBe(1)

		await queue.resume('b')
		await vi.waitFor(() => expect(queue.snapshot().find(i => i.id === 'b')?.status).toBe('running'))
		expect(queue.snapshot().find(i => i.id === 'b')?.lastJobId).toBe(jobB)
		expect(downloads.pausedCount).toBe(0)
		expect(start).not.toHaveBeenCalled()
		await queue.cancel(null)
	})
})
