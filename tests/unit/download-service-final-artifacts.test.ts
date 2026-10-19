// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'

// A size read on a hung mount never settles. Only the downloaded file's path
// hangs; everything else reads the real filesystem.
vi.mock('node:fs/promises', async importOriginal => {
	const actual = await importOriginal<typeof import('node:fs/promises')>()
	return {...actual, stat: vi.fn((path: string, ...rest: []) => (path.endsWith('hung-video.mp4') ? new Promise(() => undefined) : actual.stat(path, ...rest)))}
})
vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn(), spawnFFmpeg: vi.fn()}
})
vi.mock('@main/utils/diskSpace', () => ({checkDiskSpace: vi.fn().mockResolvedValue({ok: true, freeBytes: 1e12, requiredBytes: 0})}))

import {DownloadService} from '@main/services/DownloadService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import {spawnYtDlp} from '@main/utils/process.js'
import type {QueueArtifactEvent} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import {createTranscriptProcess} from '../helpers/processTranscript.js'
import {writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

const HUNG_PATH = join(tmpdir(), 'hung-video.mp4')

const JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

function makeService() {
	const tokenService = {getToken: vi.fn().mockResolvedValue({token: 'mock-token', visitorData: 'mock-visitor'}), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)}
	const ytDlp = new YtDlp(binaryManager as never, tokenService as never, {get: vi.fn().mockResolvedValue({})})
	return {service: new DownloadService(ytDlp, recentJobsStore as never, false), recentJobsStore}
}

describe('DownloadService — final artifact sizes', () => {
	it('finalizes and reports the media file without waiting on a size read that never settles', async () => {
		vi.mocked(spawnYtDlp).mockImplementation((() => createTranscriptProcess([{stream: 'stderr', data: `[download] Destination: ${HUNG_PATH}\n`}, {close: 0}])) as never)
		const {service, recentJobsStore} = makeService()
		const artifacts: QueueArtifactEvent[] = []
		service.on('artifact', event => artifacts.push(event))

		await service.start({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: tmpdir(), job: JOB})

		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce())
		expect(recentJobsStore.push.mock.calls[0][0].status).toBe('completed')
		expect(artifacts).toEqual([expect.objectContaining({path: HUNG_PATH, kind: 'media'})])
		expect(artifacts[0].sizeBytes).toBeUndefined()
	})

	it('does not raise an unhandled rejection when an artifact listener throws on the sized event', async () => {
		const unhandled = vi.fn()
		process.on('unhandledRejection', unhandled)
		try {
			const videoPath = join(tmpdir(), 'listener-video.mp4')
			vi.mocked(spawnYtDlp).mockImplementation((() => createTranscriptProcess([{stream: 'stderr', data: `[download] Destination: ${videoPath}\n`}, {close: 0}], {beforeStart: () => writeFileSync(videoPath, 'v'.repeat(8))})) as never)
			const {service, recentJobsStore} = makeService()
			service.on('artifact', event => {
				if (event.sizeBytes !== undefined) throw new Error('listener failed')
			})

			await service.start({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: tmpdir(), job: JOB})
			await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce())
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(unhandled).not.toHaveBeenCalled()
		} finally {
			process.off('unhandledRejection', unhandled)
		}
	})
})
