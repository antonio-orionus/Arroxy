import {describe, expect, it, vi, beforeEach} from 'vitest'
import {SidecarSubsPhase} from '@main/services/phases/SidecarSubsPhase.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, StartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
import type {YtDlpResult} from '@main/services/YtDlp.js'

vi.mock('@main/services/subtitlePostProcess', () => ({dedupeSubtitleFiles: vi.fn().mockResolvedValue(undefined), muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ok: true, outputPath: '/tmp/video.mkv'}), logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {dedupeSubtitleFiles, muxSubtitlesIntoVideo} from '@main/services/subtitlePostProcess.js'

beforeEach(() => vi.clearAllMocks())

function makeJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
}

const BASE_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}}

const BASE_INPUT: StartDownloadInput = {url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', job: BASE_JOB}

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
	return {
		job: makeJob(),
		input: BASE_INPUT,
		controller: new AbortController(),
		get signal(): AbortSignal {
			return this.controller.signal
		},
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: ['/tmp/video.en.srt'],
		mediaPath: '/tmp/video.mp4',
		disposables: new AsyncStack(),
		...overrides
	}
}

function makeCtx(runResult: YtDlpResult, activeOverrides: Partial<ActiveDownload> = {}): PhaseContext {
	const runMock = vi.fn().mockResolvedValue(runResult)
	const active = makeActive(activeOverrides)
	return {active, signal: active.signal, register: d => active.disposables.defer(d), ytDlp: {run: runMock, ffmpegPath: '/fake/ffmpeg'} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const EXIT_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError: 'fail', stdout: '', stderr: ''}

describe('SidecarSubsPhase(embedAfter=false)', () => {
	it('calls ytDlp.run with kind: subtitle', async () => {
		const ctx = makeCtx(SUCCESS)
		await SidecarSubsPhase(false).run(ctx)
		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect(req.kind).toBe('subtitle')
	})

	it('does not forward SponsorBlock config to the subtitle request', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, sponsorBlock: {mode: 'remove', categories: ['sponsor']}}}})

		await SidecarSubsPhase(false).run(ctx)

		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect((req as {sponsorBlock?: unknown}).sponsorBlock).toBeUndefined()
	})

	it('forwards the media outputTemplate so sidecar subtitles match single filenames', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, outputTemplate: '%(title).200B [%(id)s].%(ext)s'}}})
		await SidecarSubsPhase(false).run(ctx)
		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect(req.outputTemplate).toBe('%(title).200B [%(id)s].%(ext)s')
	})

	it('emits fetchingSubtitles status before run', async () => {
		const ctx = makeCtx(SUCCESS)
		await SidecarSubsPhase(false).run(ctx)
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('download', STATUS_KEY.fetchingSubtitles)
	})

	it('success → returns completed', async () => {
		const outcome = await SidecarSubsPhase(false).run(makeCtx(SUCCESS))
		expect(outcome.kind).toBe('completed')
	})

	it('subtitle failure → soft-failed with subtitlesFailed', async () => {
		const outcome = await SidecarSubsPhase(false).run(makeCtx(EXIT_ERROR))
		expect(outcome.kind).toBe('soft-failed')
		if (outcome.kind === 'soft-failed') expect(outcome.status).toBe(STATUS_KEY.subtitlesFailed)
	})

	it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
		const fallbackResult: YtDlpResult = {...SUCCESS, usedExtractorFallback: true}
		const ctx = makeCtx(fallbackResult)
		await SidecarSubsPhase(false).run(ctx)
		expect(ctx.active.usedExtractorFallback).toBe(true)
	})

	it('writeAutoSubs=false → dedupeSubtitleFiles not called', async () => {
		await SidecarSubsPhase(false).run(makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_JOB.subtitles!, writeAuto: false}}}}))
		expect(dedupeSubtitleFiles).not.toHaveBeenCalled()
	})

	it('writeAutoSubs=true → dedupeSubtitleFiles called with subtitlePaths', async () => {
		const paths = ['/tmp/video.en.srt']
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_JOB.subtitles!, writeAuto: true}}}, subtitlePaths: paths})
		await SidecarSubsPhase(false).run(ctx)
		expect(dedupeSubtitleFiles).toHaveBeenCalledOnce()
		const [calledPaths] = vi.mocked(dedupeSubtitleFiles).mock.calls[0]
		expect(calledPaths).toEqual(paths)
	})

	it('dedupeSubtitleFiles shouldAbort reflects cancelRequested', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_JOB.subtitles!, writeAuto: true}}}, subtitlePaths: ['/tmp/video.en.srt']})
		await SidecarSubsPhase(false).run(ctx)

		const shouldAbort = vi.mocked(dedupeSubtitleFiles).mock.calls[0][3]
		expect(shouldAbort?.()).toBe(false)
		ctx.active.cancelRequested = true
		expect(shouldAbort?.()).toBe(true)
	})

	it('embedAfter=false → muxSubtitlesIntoVideo not called', async () => {
		await SidecarSubsPhase(false).run(makeCtx(SUCCESS))
		expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled()
	})

	it('pauseRequested during subtitle fetch → returns paused (not soft-failed)', async () => {
		const active = makeActive({cancelRequested: false})
		const runMock = vi.fn().mockImplementationOnce(async () => {
			active.pauseRequested = true
			return EXIT_ERROR // SIGTERM makes yt-dlp exit non-zero
		})
		const ctx: PhaseContext = {active, signal: active.signal, register: d => active.disposables.defer(d), ytDlp: {run: runMock, ffmpegPath: '/fake/ffmpeg'} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
		const outcome = await SidecarSubsPhase(false).run(ctx)
		expect(outcome.kind).toBe('paused')
	})
})

describe('SidecarSubsPhase(embedAfter=true)', () => {
	it('ffmpeg available + mediaPath + subtitlePaths → calls muxSubtitlesIntoVideo', async () => {
		const ctx = makeCtx(SUCCESS, {mediaPath: '/tmp/video.mp4', subtitlePaths: ['/tmp/video.en.srt']})
		await SidecarSubsPhase(true).run(ctx)
		expect(muxSubtitlesIntoVideo).toHaveBeenCalledOnce()
	})

	it('mux success → updates active.mediaPath to muxed output', async () => {
		vi.mocked(muxSubtitlesIntoVideo).mockResolvedValueOnce({ok: true, outputPath: '/tmp/video.mkv'})
		const ctx = makeCtx(SUCCESS, {mediaPath: '/tmp/video.mp4', subtitlePaths: ['/tmp/video.en.srt']})
		await SidecarSubsPhase(true).run(ctx)
		expect(ctx.active.mediaPath).toBe('/tmp/video.mkv')
	})

	it('ffmpeg=null → skips mux and returns soft-failed subtitlesFailed', async () => {
		const ctx = makeCtx(SUCCESS, {mediaPath: '/tmp/video.mp4', subtitlePaths: ['/tmp/video.en.srt']})
		;(ctx.ytDlp as unknown as Record<string, unknown>).ffmpegPath = null
		const outcome = await SidecarSubsPhase(true).run(ctx)
		expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled()
		expect(outcome.kind).toBe('soft-failed')
		if (outcome.kind === 'soft-failed') expect(outcome.status).toBe(STATUS_KEY.subtitlesFailed)
	})

	it('mux returns { ok: false } → leaves mediaPath unchanged and returns soft-failed subtitlesFailed', async () => {
		vi.mocked(muxSubtitlesIntoVideo).mockResolvedValueOnce({ok: false})
		const ctx = makeCtx(SUCCESS, {mediaPath: '/tmp/video.mp4', subtitlePaths: ['/tmp/video.en.srt']})
		const originalPath = ctx.active.mediaPath
		const outcome = await SidecarSubsPhase(true).run(ctx)
		expect(ctx.active.mediaPath).toBe(originalPath)
		expect(outcome.kind).toBe('soft-failed')
		if (outcome.kind === 'soft-failed') expect(outcome.status).toBe(STATUS_KEY.subtitlesFailed)
	})

	it('no mediaPath → skips mux and returns soft-failed subtitlesFailed', async () => {
		const ctx = makeCtx(SUCCESS, {mediaPath: undefined, subtitlePaths: ['/tmp/video.en.srt']})
		const outcome = await SidecarSubsPhase(true).run(ctx)
		expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled()
		expect(outcome.kind).toBe('soft-failed')
		if (outcome.kind === 'soft-failed') expect(outcome.status).toBe(STATUS_KEY.subtitlesFailed)
	})

	it('empty subtitlePaths → skips mux and returns soft-failed subtitlesFailed', async () => {
		const ctx = makeCtx(SUCCESS, {mediaPath: '/tmp/video.mp4', subtitlePaths: []})
		const outcome = await SidecarSubsPhase(true).run(ctx)
		expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled()
		expect(outcome.kind).toBe('soft-failed')
		if (outcome.kind === 'soft-failed') expect(outcome.status).toBe(STATUS_KEY.subtitlesFailed)
	})

	it('pauseRequested during embed mux → returns paused (not completed)', async () => {
		const active = makeActive({cancelRequested: false, mediaPath: '/tmp/video.mp4', subtitlePaths: ['/tmp/video.en.srt']})
		const runMock = vi.fn().mockResolvedValue(SUCCESS)
		vi.mocked(muxSubtitlesIntoVideo).mockImplementationOnce(async opts => {
			opts.onSpawn({kill: vi.fn()} as never)
			active.pauseRequested = true
			return {ok: true, outputPath: '/tmp/video.mkv'}
		})
		const ctx: PhaseContext = {active, signal: active.signal, register: d => active.disposables.defer(d), ytDlp: {run: runMock, ffmpegPath: '/fake/ffmpeg'} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
		const outcome = await SidecarSubsPhase(true).run(ctx)
		expect(outcome.kind).toBe('paused')
	})

	it('emits mergingFormats before mux', async () => {
		const ctx = makeCtx(SUCCESS, {mediaPath: '/tmp/video.mp4', subtitlePaths: ['/tmp/video.en.srt']})
		await SidecarSubsPhase(true).run(ctx)
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('download', STATUS_KEY.mergingFormats)
	})

	it('onSpawn from mux sets active.ffmpegProcess; cleared after mux', async () => {
		let procDuringMux: unknown
		vi.mocked(muxSubtitlesIntoVideo).mockImplementationOnce(async opts => {
			const fakeProc = {}
			opts.onSpawn(fakeProc as never)
			procDuringMux = fakeProc
			return {ok: true, outputPath: '/tmp/video.mkv'}
		})
		const ctx = makeCtx(SUCCESS, {mediaPath: '/tmp/video.mp4', subtitlePaths: ['/tmp/video.en.srt']})
		await SidecarSubsPhase(true).run(ctx)
		expect(procDuringMux).toBeDefined()
		// ffmpegProcess is cleared after mux completes
		expect(ctx.active.ffmpegProcess).toBeUndefined()
	})
})
