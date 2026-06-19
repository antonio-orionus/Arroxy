import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

vi.unmock('node:fs/promises')

import {DownloadService} from '@main/services/DownloadService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import {createHangingProcess, createTranscriptProcess, type TranscriptProcess} from '../helpers/processTranscript.js'

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn(), spawnFFmpeg: vi.fn()}
})

vi.mock('@main/utils/diskSpace', () => ({checkDiskSpace: vi.fn().mockResolvedValue({ok: true, freeBytes: 1e12, requiredBytes: 0})}))

import {spawnYtDlp, spawnFFmpeg} from '@main/utils/process.js'
import type {QueueArtifactEvent, StatusEvent, StatusKey} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'
import type {SubtitleFormat, SubtitleMode} from '@shared/schemas.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

beforeEach(() => {
	vi.clearAllMocks()
})

function makeProcess(exitCode: number, stderr = '') {
	return createTranscriptProcess(stderr ? [{stream: 'stderr', data: stderr}, {close: exitCode}] : [{close: exitCode}])
}

function makeJob(opts: {formatId?: string; subtitles?: {languages: string[]; writeAuto?: boolean; mode?: SubtitleMode; format?: SubtitleFormat}} = {}): PreparedJob {
	if (!opts.formatId && opts.subtitles) {
		return {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: opts.subtitles.languages, mode: opts.subtitles.mode ?? 'sidecar', format: opts.subtitles.format ?? 'srt', writeAuto: opts.subtitles.writeAuto ?? false}}
	}
	return {
		kind: 'single-format',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		formatId: opts.formatId ?? '137+251',
		preset: 'custom',
		sponsorBlock: SB_OFF,
		embed: EMBED_OFF,
		subtitles: opts.subtitles ? {languages: opts.subtitles.languages, mode: opts.subtitles.mode ?? 'sidecar', format: opts.subtitles.format ?? 'srt', writeAuto: opts.subtitles.writeAuto ?? false} : undefined
	}
}

function captureStatuses(service: {on: (e: 'status', cb: (e: StatusEvent) => void) => void}): StatusEvent[] {
	const events: StatusEvent[] = []
	service.on('status', e => events.push(e))
	return events
}

function statusKeys(events: StatusEvent[]): StatusKey[] {
	return events.map(e => e.statusKey)
}

function makeService() {
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: 'mock-token', visitorData: 'mock-visitor'}), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)}
	const settingsStore = {get: vi.fn().mockResolvedValue({})}
	const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
	const service = new DownloadService(ytDlp, recentJobsStore as never, false)
	return {service, recentJobsStore}
}

describe('DownloadService — subtitle soft-fail finalization', () => {
	it('emits final media and subtitle artifacts when a job completes', async () => {
		const videoPath = '/tmp/video.mkv'
		const subPath = '/tmp/video.en.srt'
		let callIndex = 0
		vi.mocked(spawnYtDlp).mockImplementation(() => {
			const stderr = callIndex === 0 ? `[download] Destination: ${videoPath}\n` : `[download] Destination: ${subPath}\n`
			callIndex++
			return makeProcess(0, stderr) as never
		})
		const {service, recentJobsStore} = makeService()
		const artifacts: QueueArtifactEvent[] = []
		service.on('artifact', event => artifacts.push(event))

		await service.start({url: YOUTUBE_URL, outputDir: '/tmp', job: makeJob({formatId: '137+251', subtitles: {languages: ['en']}})})
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce())

		expect(artifacts.map(({path, kind}) => ({path, kind}))).toEqual([
			{path: videoPath, kind: 'media'},
			{path: subPath, kind: 'subtitle'}
		])
	})

	it('emits subtitlesFailed and records the job as completed when sidecar subtitle fetch fails', async () => {
		let callIndex = 0
		vi.mocked(spawnYtDlp).mockImplementation(() => {
			const exitCode = callIndex === 0 ? 0 : 1
			callIndex++
			return makeProcess(exitCode) as never
		})

		const {service, recentJobsStore} = makeService()
		const events = captureStatuses(service)

		await service.start({url: YOUTUBE_URL, outputDir: '/tmp', job: makeJob({formatId: '137+251', subtitles: {languages: ['en']}})})
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce())

		const final = events[events.length - 1]
		expect(final.statusKey).toBe('subtitlesFailed')
		expect(final.stage).toBe('done')
		expect(statusKeys(events)).not.toContain('complete')
		expect(recentJobsStore.push.mock.calls[0][0].status).toBe('completed')
	})
})

describe('DownloadService — sidecar mux after Merger + MoveFiles regressions', () => {
	let workDir: string

	beforeEach(() => {
		workDir = mkdtempSync(join(tmpdir(), 'arroxy-merger-move-'))
	})

	afterEach(() => {
		rmSync(workDir, {recursive: true, force: true})
	})

	function makeMergerMoveSpawn(tempVideoPath: string, finalVideoPath: string, subPath: string, subContent: string) {
		let call = 0
		return () => {
			const isPhase1 = call === 0
			call++
			return createTranscriptProcess([{stream: 'stderr', data: isPhase1 ? `[Merger] Merging formats into "${tempVideoPath}"\n[Metadata] Adding metadata to "${tempVideoPath}"\n[MoveFiles] Moving file "${tempVideoPath}" to "${finalVideoPath}"\n` : `[download] Destination: ${subPath}\n`}, {close: 0}], {
				beforeStart: () => {
					if (isPhase1) writeFileSync(finalVideoPath, 'fake-merged-bytes')
					else writeFileSync(subPath, subContent)
				}
			})
		}
	}

	it('passes the post-MoveFiles final path to ffmpeg, not the .arroxy-temp Merger path', async () => {
		const tempVideoPath = join(workDir, '.arroxy-temp', 'abc1234', 'Title.mkv')
		const finalVideoPath = join(workDir, 'Title.mkv')
		const subPath = join(workDir, 'Title.en.srt')
		vi.mocked(spawnYtDlp).mockImplementation(makeMergerMoveSpawn(tempVideoPath, finalVideoPath, subPath, 'sub-bytes') as never)

		const ffmpegCalls: string[][] = []
		vi.mocked(spawnFFmpeg).mockImplementation(((_bin: string, args: string[]) => {
			ffmpegCalls.push(args)
			return createTranscriptProcess([{close: 0}], {
				beforeStart: () => {
					writeFileSync(args[args.length - 1], 'muxed-bytes')
				}
			})
		}) as never)

		const {service} = makeService()
		await service.start({url: YOUTUBE_URL, outputDir: workDir, job: makeJob({formatId: '330+251', subtitles: {languages: ['en-orig'], mode: 'embed', format: 'srt', writeAuto: true}})})
		await vi.waitFor(() => expect(ffmpegCalls).toHaveLength(1))

		const args = ffmpegCalls[0]
		const firstInputIdx = args.indexOf('-i')
		expect(args[firstInputIdx + 1]).toBe(finalVideoPath)
		expect(args[firstInputIdx + 1]).not.toBe(tempVideoPath)
	})

	it('passes the post-"already been downloaded" path to ffmpeg when the merged file pre-exists', async () => {
		const finalVideoPath = join(workDir, 'Title.mkv')
		const subPath = join(workDir, 'Title.en.srt')

		let call = 0
		vi.mocked(spawnYtDlp).mockImplementation((() => {
			const isPhase1 = call === 0
			call++
			return createTranscriptProcess([{stream: 'stderr', data: isPhase1 ? `[download] ${finalVideoPath} has already been downloaded\n` : `[download] Destination: ${subPath}\n`}, {close: 0}], {
				beforeStart: () => {
					if (isPhase1) writeFileSync(finalVideoPath, 'fake-existing-bytes')
					else writeFileSync(subPath, 'sub-bytes')
				}
			})
		}) as never)

		const ffmpegCalls: string[][] = []
		vi.mocked(spawnFFmpeg).mockImplementation(((_bin: string, args: string[]) => {
			ffmpegCalls.push(args)
			return createTranscriptProcess([{close: 0}], {
				beforeStart: () => {
					writeFileSync(args[args.length - 1], 'muxed-bytes')
				}
			})
		}) as never)

		const {service} = makeService()
		await service.start({url: YOUTUBE_URL, outputDir: workDir, job: makeJob({formatId: '330+251', subtitles: {languages: ['en-orig'], mode: 'embed', format: 'srt', writeAuto: true}})})
		await vi.waitFor(() => expect(ffmpegCalls).toHaveLength(1))

		const args = ffmpegCalls[0]
		expect(args[args.indexOf('-i') + 1]).toBe(finalVideoPath)
	})
})

describe('DownloadService — embed+auto muxing after subtitle dedupe', () => {
	let workDir: string

	beforeEach(() => {
		workDir = mkdtempSync(join(tmpdir(), 'arroxy-mux-'))
	})

	afterEach(() => {
		rmSync(workDir, {recursive: true, force: true})
	})

	function makeTwoPhaseSpawn(videoPath: string, subPath: string, subContent: string) {
		let call = 0
		return () => {
			const isPhase1 = call === 0
			call++
			return createTranscriptProcess([{stream: 'stderr', data: isPhase1 ? `[download] Destination: ${videoPath}\n` : `[download] Destination: ${subPath}\n`}, {close: 0}], {
				beforeStart: () => {
					if (isPhase1) writeFileSync(videoPath, 'fake-video-bytes')
					else writeFileSync(subPath, subContent)
				}
			})
		}
	}

	function mockSuccessfulMux(ffmpegCalls: string[][] = []): void {
		vi.mocked(spawnFFmpeg).mockImplementation(((_bin: string, args: string[]) => {
			ffmpegCalls.push(args)
			return createTranscriptProcess([{close: 0}], {
				beforeStart: () => {
					writeFileSync(args[args.length - 1], 'muxed-bytes')
				}
			})
		}) as never)
	}

	it('runs ffmpeg with the deduped subtitle and renames the muxed output to the final mkv path', async () => {
		const rolling = readFileSync(join(__dirname, '../fixtures/subtitles/copilot-died.en-rolling.srt'), 'utf8')
		const videoPath = join(workDir, 'Title.mp4')
		const subPath = join(workDir, 'Title.en.srt')
		vi.mocked(spawnYtDlp).mockImplementation(makeTwoPhaseSpawn(videoPath, subPath, rolling) as never)

		const ffmpegCalls: string[][] = []
		mockSuccessfulMux(ffmpegCalls)

		const {service, recentJobsStore} = makeService()
		const artifacts: QueueArtifactEvent[] = []
		service.on('artifact', event => artifacts.push(event))
		await service.start({url: YOUTUBE_URL, outputDir: workDir, job: makeJob({formatId: '137+251', subtitles: {languages: ['en'], mode: 'embed', format: 'srt', writeAuto: true}})})
		await vi.waitFor(() => expect(ffmpegCalls).toHaveLength(1))
		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledOnce())

		const args = ffmpegCalls[0]
		const inputIdxs = args.reduce<number[]>((acc, v, i) => (v === '-i' ? [...acc, i] : acc), [])
		expect(args[inputIdxs[0] + 1]).toBe(videoPath)
		expect(args[inputIdxs[1] + 1]).toBe(subPath)

		const finalMkv = join(workDir, 'Title.mkv')
		expect(readFileSync(finalMkv, 'utf8')).toBe('muxed-bytes')
		expect(() => readFileSync(videoPath)).toThrow()
		expect(() => readFileSync(subPath)).toThrow()
		expect(artifacts.map(({path, kind}) => ({path, kind}))).toEqual([{path: finalMkv, kind: 'media'}])
	})

	it('emits mergingFormats status when the mux phase starts', async () => {
		const rolling = readFileSync(join(__dirname, '../fixtures/subtitles/copilot-died.en-rolling.srt'), 'utf8')
		const videoPath = join(workDir, 'Title.mp4')
		const subPath = join(workDir, 'Title.en.srt')
		vi.mocked(spawnYtDlp).mockImplementation(makeTwoPhaseSpawn(videoPath, subPath, rolling) as never)
		mockSuccessfulMux()

		const {service} = makeService()
		const events = captureStatuses(service)
		await service.start({url: YOUTUBE_URL, outputDir: workDir, job: makeJob({formatId: '137+251', subtitles: {languages: ['en'], mode: 'embed', format: 'srt', writeAuto: true}})})
		await vi.waitFor(() => expect(statusKeys(events)).toContain('mergingFormats'))

		const keys = statusKeys(events)
		const fetchIdx = keys.lastIndexOf('fetchingSubtitles')
		const mergeIdx = keys.lastIndexOf('mergingFormats')
		expect(mergeIdx).toBeGreaterThan(fetchIdx)
	})

	it('cancel during ffmpeg mux kills the ffmpeg process and removes the .muxing.mkv temp file', async () => {
		const rolling = readFileSync(join(__dirname, '../fixtures/subtitles/copilot-died.en-rolling.srt'), 'utf8')
		const videoPath = join(workDir, 'Title.mp4')
		const subPath = join(workDir, 'Title.en.srt')
		vi.mocked(spawnYtDlp).mockImplementation(makeTwoPhaseSpawn(videoPath, subPath, rolling) as never)

		let ffmpegProc: TranscriptProcess | null = null
		vi.mocked(spawnFFmpeg).mockImplementation(((_bin: string, args: string[]) => {
			const proc = createHangingProcess({closeOnKill: null, closeDelayMs: 5})
			ffmpegProc = proc
			writeFileSync(args[args.length - 1], 'partial-bytes')
			return proc
		}) as never)

		const {service} = makeService()
		const startResult = await service.start({url: YOUTUBE_URL, outputDir: workDir, job: makeJob({formatId: '137+251', subtitles: {languages: ['en'], mode: 'embed', format: 'srt', writeAuto: true}})})
		expect(startResult.ok).toBe(true)
		if (!startResult.ok) return

		await vi.waitFor(() => expect(ffmpegProc).not.toBeNull())
		await service.cancel(startResult.data.job.id)
		await vi.waitFor(() => expect(ffmpegProc?.kill).toHaveBeenCalled())

		const tempPath = join(workDir, 'Title.muxing.mkv')
		await vi.waitFor(() => expect(() => readFileSync(tempPath)).toThrow())
	})
})
