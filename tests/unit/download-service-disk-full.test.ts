import {describe, expect, it, vi, beforeEach} from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {DownloadService} from '@main/services/DownloadService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import type {YtDlpResult} from '@main/services/YtDlp.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const DEFAULT_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}

vi.mock('@main/utils/diskSpace', () => ({checkDiskSpace: vi.fn()}))

import {checkDiskSpace} from '@main/utils/diskSpace.js'

beforeEach(() => {
	vi.resetAllMocks()
})

/**
 * Why we spy on `ytDlp.run()` rather than mocking `spawnYtDlp`:
 *
 * The naive approach — mock `spawnYtDlp`, return a fake EventEmitter, fire
 * `proc.emit('close', 1)` after `setTimeout(10)` — is CI-fragile. The timer
 * starts at construction time, but `proc.on('close', ...)` is not registered
 * until after multiple async hops inside `invokeOnce` (prepare → preflight
 * checkDiskSpace → mintTokenForUrl → spawn → attach listeners). Under Bun's
 * JavaScriptCore runtime (the CI execution environment) something in the
 * outOfDiskSpace reclassification code path (`ok: false` from the second
 * checkDiskSpace call, triggering logger.info inside classifyYtDlpFailure)
 * causes `runPhases` to never settle; the `void .catch()` guard swallows the
 * rejection silently, so `recentJobsStore.push` is never called.
 *
 * Spying on `ytDlp.run()` skips the process lifecycle entirely. The phase
 * pipeline (PreflightPhase → VideoPhase → classifyYtDlpFailure → handleOutcome
 * → finalize) still runs in full; only the yt-dlp subprocess is replaced by a
 * resolved promise. Results are deterministic regardless of runtime or load.
 *
 * `errorKind` drives classifyYtDlpFailure's branching; `rawError` must satisfy
 * `isPostprocessFailure()` for the outOfDiskSpace upgrade path to trigger.
 */
const POSTPROCESS_RESULT: Extract<YtDlpResult, {kind: 'exit-error'}> = {kind: 'exit-error', exitCode: 1, errorKind: 'postprocessFailure', rawError: 'ERROR: Postprocessing: Conversion failed!', stdout: '', stderr: 'ERROR: Postprocessing: Conversion failed!'}

const IP_BLOCK_RESULT: Extract<YtDlpResult, {kind: 'exit-error'}> = {
	kind: 'exit-error',
	exitCode: 1,
	errorKind: 'ipBlock',
	rawError: 'ERROR: [youtube] All player responses are invalid. Your IP is likely being blocked by Youtube',
	stdout: '',
	stderr: 'ERROR: [youtube] All player responses are invalid. Your IP is likely being blocked by Youtube'
}

const NETWORK_RESULT: Extract<YtDlpResult, {kind: 'exit-error'}> = {kind: 'exit-error', exitCode: 1, errorKind: 'network', rawError: 'ERROR: unable to download video data: HTTP Error 503', stdout: '', stderr: 'ERROR: unable to download video data: HTTP Error 503'}

function makeService() {
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: 'tok', visitorData: 'vd'}), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)}
	const settingsStore = {get: vi.fn().mockResolvedValue({})}

	const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
	const service = new DownloadService(ytDlp, recentJobsStore as never)

	return {service, recentJobsStore, ytDlp}
}

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

describe('DownloadService — postprocess ENOSPC reclassification', () => {
	it('upgrades unclassified "Postprocessing: Conversion failed!" to outOfDiskSpace when disk probe shows low free', async () => {
		// Preflight at job start: ample free. Post-failure probe: low free.
		vi.mocked(checkDiskSpace)
			.mockResolvedValueOnce({ok: true, freeBytes: 50_000_000_000, requiredBytes: 200 * 1024 * 1024})
			.mockResolvedValueOnce({ok: false, freeBytes: 50_000_000, requiredBytes: 200 * 1024 * 1024})

		const {service, recentJobsStore, ytDlp} = makeService()
		vi.spyOn(ytDlp, 'run').mockResolvedValue(POSTPROCESS_RESULT)

		await service.start({url: YOUTUBE_URL, outputDir: '/tmp', job: DEFAULT_JOB})
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce(), {timeout: 5000})

		const finalized = recentJobsStore.push.mock.calls[0]?.[0]
		expect(finalized?.status).toBe('failed')
		expect(finalized?.error?.kind).toBe('outOfDiskSpace')
		expect(finalized?.error?.raw).toContain('Conversion failed')
	})

	it('keeps kind=postprocessFailure when "Conversion failed" surfaces but disk has plenty of free space', async () => {
		vi.mocked(checkDiskSpace)
			.mockResolvedValueOnce({ok: true, freeBytes: 50_000_000_000, requiredBytes: 200 * 1024 * 1024})
			.mockResolvedValueOnce({ok: true, freeBytes: 50_000_000_000, requiredBytes: 200 * 1024 * 1024})

		const {service, recentJobsStore, ytDlp} = makeService()
		vi.spyOn(ytDlp, 'run').mockResolvedValue(POSTPROCESS_RESULT)

		await service.start({url: YOUTUBE_URL, outputDir: '/tmp', job: DEFAULT_JOB})
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce(), {timeout: 5000})

		const finalized = recentJobsStore.push.mock.calls[0]?.[0]
		expect(finalized?.error?.kind).toBe('postprocessFailure')
	})

	it('does not run the post-failure disk probe for unrelated errors', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValueOnce({ok: true, freeBytes: 50_000_000_000, requiredBytes: 200 * 1024 * 1024})

		const {service, recentJobsStore, ytDlp} = makeService()
		vi.spyOn(ytDlp, 'run').mockResolvedValue(IP_BLOCK_RESULT)

		await service.start({url: YOUTUBE_URL, outputDir: '/tmp', job: DEFAULT_JOB})
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce(), {timeout: 5000})

		// Only the preflight call — no post-failure probe.
		expect(vi.mocked(checkDiskSpace)).toHaveBeenCalledTimes(1)
		const finalized = recentJobsStore.push.mock.calls[0]?.[0]
		expect(finalized?.error?.kind).toBe('ipBlock')
	})
})

describe('DownloadService — retry temp dir ownership', () => {
	it('cleans a supplied retry temp dir when preflight fails before VideoPhase owns it', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-retry-preflight-'))
		await fs.writeFile(path.join(tempDir, 'video.part'), 'partial')
		vi.mocked(checkDiskSpace).mockResolvedValueOnce({ok: false, freeBytes: 50_000_000, requiredBytes: 200 * 1024 * 1024})

		const {service, recentJobsStore, ytDlp} = makeService()
		const runSpy = vi.spyOn(ytDlp, 'run').mockResolvedValue(NETWORK_RESULT)

		await service.start({url: YOUTUBE_URL, outputDir: '/tmp', job: DEFAULT_JOB, tempDir})
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce(), {timeout: 5000})

		expect(runSpy).not.toHaveBeenCalled()
		await expect(fs.access(tempDir)).rejects.toThrow()
	})

	it('preserves a supplied retry temp dir when VideoPhase creates a fresh resume context', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-retry-video-'))
		const mediaPart = path.join(tempDir, 'video.f137.mp4.part')
		await fs.writeFile(mediaPart, 'partial')
		vi.mocked(checkDiskSpace).mockResolvedValueOnce({ok: true, freeBytes: 50_000_000_000, requiredBytes: 200 * 1024 * 1024})

		const {service, recentJobsStore, ytDlp} = makeService()
		vi.spyOn(ytDlp, 'run').mockImplementation(async (_req, signal) => {
			signal?.onStderr?.(`[download] Destination: ${mediaPart}\n`)
			return NETWORK_RESULT
		})

		await service.start({url: YOUTUBE_URL, outputDir: '/tmp', job: DEFAULT_JOB, tempDir})
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce(), {timeout: 5000})

		const finalized = recentJobsStore.push.mock.calls[0]?.[0]
		expect(finalized?.status).toBe('failed')
		expect(finalized?.error?.kind).toBe('network')
		await expect(fs.access(tempDir)).resolves.toBeUndefined()
		await fs.rm(tempDir, {recursive: true, force: true})
	})
})
