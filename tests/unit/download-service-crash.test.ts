import {afterEach, describe, expect, it, vi} from 'vitest'
import type {BinaryManager} from '@main/services/BinaryManager.js'
import type {TokenService} from '@main/services/TokenService.js'
import type {RecentJobsStore} from '@main/stores/RecentJobsStore.js'
import {createHangingProcess, createTranscriptProcess} from '../helpers/processTranscript.js'

// Must be top-level (Vitest hoists vi.mock calls)
vi.mock('@main/utils/process')

import {spawnYtDlp} from '@main/utils/process.js'
import {DownloadService} from '@main/services/DownloadService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const DEFAULT_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'x', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}

function makeStubs() {
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue(null), ensureDeno: vi.fn().mockResolvedValue('/fake/deno'), ensureFFprobe: vi.fn().mockResolvedValue(null)} as unknown as BinaryManager
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: 'tok', visitorData: 'vd'}), invalidateCache: vi.fn()} as unknown as TokenService
	const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)} as unknown as RecentJobsStore
	const settingsStore = {get: vi.fn().mockResolvedValue({})} as never
	const ytDlp = new YtDlp(binaryManager, tokenService, settingsStore)
	return {binaryManager, tokenService, recentJobsStore, settingsStore, ytDlp}
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('DownloadService stdout/stderr crash safety', () => {
	it('stdout data handler swallows exceptions from consumeProgress', async () => {
		const stubs = makeStubs()
		const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore)

		const fakeProc = createHangingProcess()
		vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as never)
		vi.spyOn(svc as any, 'consumeProgress').mockImplementation(() => {
			throw new Error('disk full')
		})

		// start() registers handlers synchronously in spawnProcess, then returns
		await svc.start({url: 'https://youtube.com/watch?v=test', outputDir: '/tmp', job: DEFAULT_JOB})

		expect(() => {
			fakeProc.stdout.emit('data', Buffer.from('[download] 50% of 10MiB'))
		}).not.toThrow()
	})

	it('stderr data handler swallows exceptions from consumeProgress', async () => {
		const stubs = makeStubs()
		const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore)

		const fakeProc = createHangingProcess()
		vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as never)
		vi.spyOn(svc as any, 'consumeProgress').mockImplementation(() => {
			throw new Error('disk full')
		})

		await svc.start({url: 'https://youtube.com/watch?v=test', outputDir: '/tmp', job: DEFAULT_JOB})

		expect(() => {
			fakeProc.stderr.emit('data', Buffer.from('ERROR: some yt-dlp error line'))
		}).not.toThrow()
	})

	it('active job count is still correct after a crash in the stdout handler', async () => {
		const stubs = makeStubs()
		const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore)

		const fakeProc = createHangingProcess()
		vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as never)
		vi.spyOn(svc as any, 'consumeProgress').mockImplementation(() => {
			throw new Error('write error')
		})

		const result = await svc.start({url: 'https://youtube.com/watch?v=test', outputDir: '/tmp', job: DEFAULT_JOB})
		expect(result.ok).toBe(true)
		expect(svc.activeCount).toBe(1)

		// Crash in handler — job should still be tracked
		fakeProc.stdout.emit('data', Buffer.from('some line'))
		expect(svc.activeCount).toBe(1)
	})
})

describe('DownloadService error surfacing', () => {
	it('preserves the raw yt-dlp ERROR line on status and finalized job payloads', async () => {
		const stderr = 'ERROR: [youtube] abc: Video unavailable. The uploader has not made this video available in your country.'
		vi.mocked(spawnYtDlp).mockReturnValue(createTranscriptProcess([{stream: 'stderr', data: stderr}, {close: 1}]) as never)

		const stubs = makeStubs()
		const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore)
		const statusErrors: {kind: string; raw: string}[] = []
		svc.on('status', event => {
			if (event.error) statusErrors.push(event.error)
		})

		await svc.start({url: 'https://youtube.com/watch?v=test', outputDir: '/tmp', job: DEFAULT_JOB})
		await vi.waitFor(() => expect(stubs.recentJobsStore.push).toHaveBeenCalledOnce())

		expect(statusErrors[0]?.raw).toContain('Video unavailable')
		const finalized = vi.mocked(stubs.recentJobsStore.push).mock.calls[0]?.[0]
		expect(finalized?.error?.raw).toContain('Video unavailable')
	})
})
