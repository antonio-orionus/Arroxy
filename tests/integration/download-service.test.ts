import {afterEach, describe, expect, it, vi} from 'vitest'
import {mkdir, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {DownloadService} from '@main/services/DownloadService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import type {DownloadJob} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'

const DEFAULT_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

function makeService() {
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/tmp/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/tmp/ffmpeg'), ensureDeno: vi.fn().mockResolvedValue(null), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: 'mock-token', visitorData: 'mock-visitor'})}
	const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)}
	const settingsStore = {get: vi.fn().mockResolvedValue({})}
	const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
	// Use maxConcurrent=4 to exercise the legacy multi-job assumptions in this
	// integration suite (concurrent start, multi-job cancel-by-id). QueueService
	// applies the cap=1 policy in production.
	const service = new DownloadService(ytDlp, recentJobsStore as never, true, 4)
	return {service, recentJobsStore}
}

afterEach(() => {
	vi.useRealTimers()
})

async function finishMockDownloadTimers(): Promise<void> {
	await vi.advanceTimersByTimeAsync(2_500)
	await Promise.resolve()
}

describe('DownloadService (mock mode)', () => {
	it('starts and emits lifecycle events', async () => {
		vi.useFakeTimers()
		const {service, recentJobsStore} = makeService()
		const statuses: string[] = []
		service.on('status', event => statuses.push(event.stage))

		const result = await service.start({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: '/tmp', job: DEFAULT_JOB})

		expect(result.ok).toBe(true)
		await finishMockDownloadTimers()
		expect(statuses).toContain('setup')
		expect(statuses).toContain('token')
		expect(statuses).toContain('download')
		expect(statuses).toContain('done')
		expect(recentJobsStore.push).toHaveBeenCalledOnce()
	})

	it('cancels an active mock download and calls cleanupPartFiles', async () => {
		const {service} = makeService()
		const cleanupSpy = vi.spyOn(service, 'cleanupPartFiles').mockResolvedValue()

		const startResult = await service.start({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: '/tmp/downloads', job: DEFAULT_JOB})
		expect(startResult.ok).toBe(true)

		const cancelResult = await service.cancel()
		expect(cancelResult.ok).toBe(true)
		if (cancelResult.ok) expect(cancelResult.data.cancelled).toBe(true)
		expect(cleanupSpy).toHaveBeenCalledWith('/tmp/downloads')
	})

	it('allows two downloads to start concurrently', async () => {
		vi.useFakeTimers()
		const {service, recentJobsStore} = makeService()

		const [r1, r2] = await Promise.all([service.start({url: 'https://youtube.com/watch?v=1', outputDir: '/tmp', job: DEFAULT_JOB}), service.start({url: 'https://youtube.com/watch?v=2', outputDir: '/tmp', job: DEFAULT_JOB})])

		expect(r1.ok).toBe(true)
		expect(r2.ok).toBe(true)

		await finishMockDownloadTimers()
		expect(recentJobsStore.push).toHaveBeenCalledTimes(2)
	})

	it('cancel(jobId) cancels only the specified job, not others', async () => {
		vi.useFakeTimers()
		const {service, recentJobsStore} = makeService()

		const [r1, r2] = await Promise.all([service.start({url: 'https://youtube.com/watch?v=1', outputDir: '/tmp', job: DEFAULT_JOB}), service.start({url: 'https://youtube.com/watch?v=2', outputDir: '/tmp', job: DEFAULT_JOB})])

		expect(r1.ok).toBe(true)
		expect(r2.ok).toBe(true)

		const jobId1 = r1.ok ? r1.data.job.id : ''
		const cancelResult = await service.cancel(jobId1)
		expect(cancelResult.ok).toBe(true)
		if (cancelResult.ok) expect(cancelResult.data.cancelled).toBe(true)

		await finishMockDownloadTimers()

		const statuses = recentJobsStore.push.mock.calls.map(c => c[0].status)
		expect(statuses).toContain('cancelled')
		expect(statuses).toContain('completed')
	})

	it('pause() pauses mock download and moves job to pausedJobs', async () => {
		const {service} = makeService()

		const startResult = await service.start({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: '/tmp', job: DEFAULT_JOB})
		expect(startResult.ok).toBe(true)
		const jobId = startResult.ok ? startResult.data.job.id : ''

		const pauseResult = await service.pause(jobId)
		expect(pauseResult.ok).toBe(true)
		if (pauseResult.ok) expect(pauseResult.data.paused).toBe(true)

		const pausedJobs = (service as unknown as {pausedJobs: Map<string, unknown>}).pausedJobs
		expect(pausedJobs.has(jobId)).toBe(true)
	})

	it('cancel() of a paused job cleans up .part files and removes from pausedJobs', async () => {
		const {service} = makeService()
		const cleanupSpy = vi.spyOn(service, 'cleanupPartFiles').mockResolvedValue()

		// Manually inject a paused job to simulate the pause flow.
		const pausedJob: DownloadJob = {id: 'paused-job-id', url: 'https://youtube.com/watch?v=xyz', outputDir: '/tmp/paused-downloads', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
		interface PausedDownload {
			job: DownloadJob
			input: {url: string; outputDir: string}
		}
		;(service as unknown as {pausedJobs: Map<string, PausedDownload>}).pausedJobs.set(pausedJob.id, {job: pausedJob, input: {url: pausedJob.url, outputDir: pausedJob.outputDir}})

		const cancelResult = await service.cancel(pausedJob.id)
		expect(cancelResult.ok).toBe(true)
		if (cancelResult.ok) expect(cancelResult.data.cancelled).toBe(true)
		expect(cleanupSpy).toHaveBeenCalledWith('/tmp/paused-downloads')

		const pausedJobs = (service as unknown as {pausedJobs: Map<string, PausedDownload>}).pausedJobs
		expect(pausedJobs.has(pausedJob.id)).toBe(false)
	})

	it('resume() re-runs a paused mock job under the same id', async () => {
		vi.useFakeTimers()
		const {service} = makeService()

		const startResult = await service.start({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: '/tmp', job: DEFAULT_JOB})
		const jobId = startResult.ok ? startResult.data.job.id : ''
		await service.pause(jobId)

		const resumeResult = await service.resume(jobId)
		expect(resumeResult.ok).toBe(true)
		if (resumeResult.ok) {
			expect(resumeResult.data.resumed).toBe(true)
			expect(resumeResult.data.job?.id).toBe(jobId)
		}

		const pausedJobs = (service as unknown as {pausedJobs: Map<string, unknown>}).pausedJobs
		expect(pausedJobs.has(jobId)).toBe(false)
		await finishMockDownloadTimers()
	})

	it('resume() restores tempDir from PausedDownload onto the new ActiveDownload when dir still exists', async () => {
		vi.useFakeTimers()
		const {service} = makeService()

		// Resume validates the preserved tempDir exists on disk; create one in
		// the OS temp tree so the stat() check succeeds.
		const outputDir = await mkdir(join(tmpdir(), `arroxy-resume-${Date.now()}`), {recursive: true}).then(p => p ?? join(tmpdir(), `arroxy-resume-${Date.now()}`))
		const tempDir = join(outputDir, '.arroxy-temp', 'paused-w')
		await mkdir(tempDir, {recursive: true})

		const pausedJob: DownloadJob = {id: 'paused-with-tempdir', url: 'https://youtube.com/watch?v=tdir', outputDir, status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
		interface PausedDownload {
			job: DownloadJob
			input: {url: string; outputDir: string; job: PreparedJob}
			tempDir?: string
		}
		interface ActiveDownload {
			job: DownloadJob
			tempDir?: string
		}
		;(service as unknown as {pausedJobs: Map<string, PausedDownload>}).pausedJobs.set(pausedJob.id, {job: pausedJob, input: {url: pausedJob.url, outputDir: pausedJob.outputDir, job: DEFAULT_JOB}, tempDir})

		try {
			const resumeResult = await service.resume(pausedJob.id)
			expect(resumeResult.ok).toBe(true)

			const activeJobs = (service as unknown as {activeJobs: Map<string, ActiveDownload>}).activeJobs
			const active = activeJobs.get(pausedJob.id)
			expect(active?.tempDir).toBe(tempDir)
			await finishMockDownloadTimers()
		} finally {
			await rm(outputDir, {recursive: true, force: true})
		}
	})

	it('resume() drops tempDir when the preserved path no longer exists', async () => {
		vi.useFakeTimers()
		const {service} = makeService()

		const pausedJob: DownloadJob = {id: 'paused-missing-tempdir', url: 'https://youtube.com/watch?v=mtd', outputDir: '/tmp/mtd-out', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
		const ghostTempDir = '/tmp/mtd-out/.arroxy-temp/never-existed'
		interface PausedDownload {
			job: DownloadJob
			input: {url: string; outputDir: string; job: PreparedJob}
			tempDir?: string
		}
		interface ActiveDownload {
			job: DownloadJob
			tempDir?: string
		}
		;(service as unknown as {pausedJobs: Map<string, PausedDownload>}).pausedJobs.set(pausedJob.id, {job: pausedJob, input: {url: pausedJob.url, outputDir: pausedJob.outputDir, job: DEFAULT_JOB}, tempDir: ghostTempDir})

		const resumeResult = await service.resume(pausedJob.id)
		expect(resumeResult.ok).toBe(true)

		const activeJobs = (service as unknown as {activeJobs: Map<string, ActiveDownload>}).activeJobs
		const active = activeJobs.get(pausedJob.id)
		expect(active?.tempDir).toBeUndefined()
		await finishMockDownloadTimers()
	})

	it('resume() returns { resumed: false } for unknown jobId (renderer falls back to start)', async () => {
		const {service} = makeService()
		const result = await service.resume('does-not-exist')
		expect(result.ok).toBe(true)
		if (result.ok) expect(result.data.resumed).toBe(false)
	})

	it('resume() returns ok({resumed:false}) when cancel arrives before binaries finish', async () => {
		// ensureYtDlp resolves only after we explicitly release it, so we can flip
		// cancelRequested during the await window between activeJobs.set and the
		// post-binaries cancel check.
		let releaseBinaries: () => void = () => undefined
		const binaryGate = new Promise<string>(resolve => {
			releaseBinaries = () => resolve('/tmp/yt-dlp')
		})
		const binaryManager = {ensureYtDlp: vi.fn().mockReturnValue(binaryGate), ensureFFmpeg: vi.fn().mockResolvedValue('/tmp/ffmpeg'), ensureDeno: vi.fn().mockResolvedValue(null), ensureFFprobe: vi.fn().mockResolvedValue(null)}
		const tokenService = {mintTokenForUrl: vi.fn()}
		const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)}
		const settingsStore = {get: vi.fn().mockResolvedValue({})}
		const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
		const service = new DownloadService(ytDlp, recentJobsStore as never, true)
		vi.spyOn(service, 'cleanupPartFiles').mockResolvedValue()

		// Seed a paused job directly so resume() takes the within-session branch.
		const pausedJob: DownloadJob = {id: 'paused-cancel-race', url: 'https://youtube.com/watch?v=race', outputDir: '/tmp/race', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
		interface PausedDownload {
			job: DownloadJob
			input: {url: string; outputDir: string}
		}
		;(service as unknown as {pausedJobs: Map<string, PausedDownload>}).pausedJobs.set(pausedJob.id, {job: pausedJob, input: {url: pausedJob.url, outputDir: pausedJob.outputDir}})

		const resumePromise = service.resume(pausedJob.id)
		// resume() is now awaiting ensureYtDlp; fire cancel which will mark
		// cancelRequested on the active entry.
		await service.cancel(pausedJob.id)
		releaseBinaries()

		const result = await resumePromise
		expect(result.ok).toBe(true)
		if (result.ok) expect(result.data.resumed).toBe(false)

		const recentCalls = recentJobsStore.push.mock.calls.map(c => c[0].status)
		expect(recentCalls).toContain('cancelled')
	})
})
