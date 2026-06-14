import {EventEmitter} from 'node:events'
import {mkdtemp, mkdir, writeFile, rm, access} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {VideoPhase} from '@main/services/phases/VideoPhase.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, QueueResumeContext, StartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'
import type {YtDlpResult} from '@main/services/YtDlp.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}

function makeJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
}

const BASE_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: {languages: ['en', 'ja'], mode: 'embed', format: 'vtt', writeAuto: false}}

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
		subtitlePaths: [],
		disposables: new AsyncStack(),
		...overrides
	}
}

function makeCtx(runResult: YtDlpResult, activeOverrides: Partial<ActiveDownload> = {}): PhaseContext & {runMock: ReturnType<typeof vi.fn>} {
	const runMock = vi.fn().mockImplementation((_req, signal) => {
		return Promise.resolve(runResult).then(r => {
			signal?.onMinting?.(0)
			return r
		})
	})

	const ctx: PhaseContext = {active: makeActive(activeOverrides), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock, ffmpegPath: '/fake/ffmpeg'} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
	return Object.assign(ctx, {runMock})
}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const SUCCESS_FALLBACK: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: true}
const EXIT_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'botBlock', rawError: 'bot', stdout: '', stderr: ''}
const NETWORK_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'network', rawError: 'read reset', stdout: '', stderr: ''}
const RATE_LIMIT_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'rateLimit', rawError: 'rate limited', stdout: '', stderr: ''}
const POSTPROCESS_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'postprocessFailure', rawError: 'Postprocessing: Conversion failed!', stdout: '', stderr: ''}
const DISK_FULL_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'outOfDiskSpace', rawError: 'No space left on device', stdout: '', stderr: ''}
const SPONSORBLOCK_API_ERROR: YtDlpResult = {
	kind: 'exit-error',
	exitCode: 1,
	errorKind: 'unknown',
	rawError: 'ERROR: Preprocessing: Unable to communicate with SponsorBlock API: HTTP Error 503: Service Unavailable',
	stdout: '',
	stderr: 'ERROR: Preprocessing: Unable to communicate with SponsorBlock API: HTTP Error 503: Service Unavailable'
}

describe('VideoPhase(embed=false)', () => {
	it('calls ytDlp.run with kind: media', async () => {
		const ctx = makeCtx(SUCCESS)
		await VideoPhase(false).run(ctx)
		expect(ctx.runMock).toHaveBeenCalledOnce()
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.kind).toBe('media')
	})

	it('forwards a single-mode outputTemplate to yt-dlp', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, outputTemplate: '%(title).200B [%(id)s].%(ext)s'}}})
		await VideoPhase(false).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.output.template).toBe('%(title).200B [%(id)s].%(ext)s')
	})

	it('uses combined YouTube player clients for explicit single-format downloads', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, formatId: '337+380'}}})
		await VideoPhase(false).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.extractor).toEqual({youtube: {playerClient: ['default', 'web_embedded']}})
	})

	it('uses combined YouTube player clients for ranged playlist/profile downloads', async () => {
		const rangedJob: PreparedJob = {
			kind: 'ranged-format',
			extractor: 'youtube',
			extractorKey: 'Youtube',
			intent: {kind: 'video-audio', codec: 'best', tiers: ['1080'], audio: {format: 'best'}},
			formatSelector: 'bestvideo*+bestaudio/best',
			formatSort: 'res:1080,fps',
			mergeOutputFormat: undefined,
			audioConvert: undefined,
			outputTemplate: '%(title).200B [%(id)s].%(ext)s',
			sponsorBlock: SB_OFF,
			embed: EMBED_OFF
		}
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: rangedJob}})
		await VideoPhase(false).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.extractor).toEqual({youtube: {playerClient: ['default', 'web_embedded']}})
	})

	it('fresh single-video start with probeInfoJsonPath passes loadInfoJsonPath to yt-dlp', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, probeInfoJsonPath: '/cache/probe.info.json'}})

		await VideoPhase(false).run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBe('/cache/probe.info.json')
	})

	it('pre-media info-json failure retries once without loadInfoJsonPath', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(NETWORK_ERROR).mockResolvedValueOnce(SUCCESS)
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: '/cache/stale.info.json'}})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}

		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome.kind).toBe('continue')
		expect(runMock).toHaveBeenCalledTimes(2)
		expect(runMock.mock.calls[0][0].resume?.loadInfoJsonPath).toBe('/cache/stale.info.json')
		expect(runMock.mock.calls[1][0].resume?.loadInfoJsonPath).toBeUndefined()
	})

	it('post-media info-json failure does not retry and preserves resume behavior', async () => {
		const runMock = vi.fn().mockImplementation(async () => {
			active.mediaDownloadStarted = true
			return NETWORK_ERROR
		})
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: '/cache/stale.info.json'}, tempDir: '/tmp/arroxy-resume-info-json'})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}

		const outcome = await VideoPhase(false).run(ctx)

		expect(runMock).toHaveBeenCalledTimes(1)
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toMatchObject({kind: 'media-retry', reason: 'media-transfer', failureKind: 'network'})
	})

	it('success → returns continue', async () => {
		const outcome = await VideoPhase(false).run(makeCtx(SUCCESS))
		expect(outcome.kind).toBe('continue')
	})

	it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
		const ctx = makeCtx(SUCCESS_FALLBACK)
		await VideoPhase(false).run(ctx)
		expect(ctx.active.usedExtractorFallback).toBe(true)
	})

	it('exit-error → hard-failed with classified error payload', async () => {
		const ctx = makeCtx(EXIT_ERROR)
		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('botBlock')
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({kind: 'botBlock'}))
	})

	it('media transfer failure after media starts returns resume context', async () => {
		const tempDir = '/tmp/arroxy-resume-media'
		const ctx = makeCtx(NETWORK_ERROR, {tempDir, mediaDownloadStarted: true, mediaComponentPaths: [`${tempDir}/video.f137.webm.part`, `${tempDir}/video.f251.m4a.part`]})

		const outcome = await VideoPhase(false).run(ctx)

		const expected: QueueResumeContext = {kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: 'network'}
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toEqual(expected)
		expect(ctx.active.resumeContext).toEqual(expected)
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({kind: 'network'}), expected)
	})

	it('rate-limit media failures preserve split component resume context', async () => {
		const tempDir = '/tmp/arroxy-resume-rate'
		const ctx = makeCtx(RATE_LIMIT_ERROR, {tempDir, mediaDownloadStarted: true, mediaComponentPaths: [`${tempDir}/video.f137.webm.part`, `${tempDir}/video.f251.m4a.part`]})

		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toMatchObject({kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: 'rateLimit'})
	})

	it('postprocess and disk-full failures after media acquisition preserve postprocess resume context', async () => {
		for (const failure of [POSTPROCESS_ERROR, DISK_FULL_ERROR]) {
			const tempDir = `/tmp/arroxy-resume-${failure.errorKind}`
			const ctx = makeCtx(failure, {tempDir, mediaDownloadStarted: true, mediaComponentPaths: [`${tempDir}/video.f137.webm`], mediaPath: `${tempDir}/video.webm`, mediaPostprocessStarted: true})

			const outcome = await VideoPhase(false).run(ctx)

			expect(outcome.kind).toBe('hard-failed')
			if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toMatchObject({kind: 'media-retry', tempDir, reason: 'postprocess', failureKind: failure.errorKind})
		}
	})

	it('auth/content failures and pre-media network failures do not preserve resume context', async () => {
		for (const failure of [EXIT_ERROR, NETWORK_ERROR]) {
			const ctx = makeCtx(failure, {tempDir: '/tmp/arroxy-non-resumable'})

			const outcome = await VideoPhase(false).run(ctx)

			expect(outcome.kind).toBe('hard-failed')
			if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toBeUndefined()
			expect(ctx.active.resumeContext).toBeUndefined()
		}
	})

	it('SponsorBlock API failure → continues without failing the downloaded media', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR, {input: {...BASE_INPUT, job: {...BASE_JOB, sponsorBlock: {mode: 'mark', categories: ['sponsor']}}}})

		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome.kind).toBe('continue')
		expect(ctx.runMock).toHaveBeenCalledTimes(1)
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toEqual({mode: 'mark', categories: ['sponsor']})
		expect(ctx.emitStatus).not.toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})

	it('SponsorBlock API failure with mode=off → hard-fails', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR)

		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toBeUndefined()
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})

	it('SponsorBlock API failure with empty categories → hard-fails', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR, {input: {...BASE_INPUT, job: {...BASE_JOB, sponsorBlock: {mode: 'mark', categories: []}}}})

		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toEqual({mode: 'mark', categories: []})
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})

	it('SponsorBlock API failure on a site without SponsorBlock support → hard-fails', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR, {input: {...BASE_INPUT, job: {...BASE_JOB, extractor: 'Vimeo', extractorKey: 'Vimeo', sponsorBlock: {mode: 'mark', categories: ['sponsor']}}}})

		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toBeUndefined()
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})
})

describe('VideoPhase(embed=true)', () => {
	it('calls ytDlp.run with media subtitles when embedding is enabled', async () => {
		const ctx = makeCtx(SUCCESS)
		await VideoPhase(true).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.kind).toBe('media')
		expect(req.subtitles).toMatchObject({embed: true, languages: ['en', 'ja']})
	})

	it('embed=true but no subtitleLanguages → omits media subtitles', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: undefined}}})
		await VideoPhase(true).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.kind).toBe('media')
		expect(req.subtitles).toBeUndefined()
	})

	it('embed=true with empty subtitleLanguages → omits media subtitles', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_JOB.subtitles!, languages: []}}}})
		await VideoPhase(true).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.kind).toBe('media')
		expect(req.subtitles).toBeUndefined()
	})

	it('audio-convert jobs keep audioConvert when subtitles are embedded', async () => {
		const ctx = makeCtx(SUCCESS, {
			input: {...BASE_INPUT, job: {kind: 'audio-convert', extractor: 'youtube', extractorKey: 'Youtube', audioConvert: {target: 'mp3', bitrateKbps: 192}, preset: 'audio-only', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: {languages: ['en'], mode: 'embed', format: 'vtt', writeAuto: false}}}
		})
		await VideoPhase(true).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.kind).toBe('media')
		expect(req.subtitles).toMatchObject({embed: true, languages: ['en']})
		expect(req.audio?.convert).toEqual({target: 'mp3', lossy: true, bitrateKbps: 192})
	})

	it('marks wav audio conversion as lossless for the bridge planner', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {kind: 'audio-convert', extractor: 'youtube', extractorKey: 'Youtube', audioConvert: {target: 'wav'}, preset: 'audio-only', sponsorBlock: SB_OFF, embed: EMBED_OFF}}})

		await VideoPhase(false).run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.audio?.convert).toEqual({target: 'wav', lossy: false})
	})
})

describe('VideoPhase — sidecar field propagation', () => {
	it('writeDescription propagates to media embed options', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: undefined, embed: {...EMBED_OFF, description: true}}}})
		await VideoPhase(false).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.embed?.description).toBe(true)
	})

	it('writeThumbnail propagates to media embed options', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: undefined, embed: {...EMBED_OFF, thumbnailSidecar: true}}}})
		await VideoPhase(false).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.embed?.thumbnailSidecar).toBe(true)
	})

	it('writeDescription propagates with embedded subtitles', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, embed: {...EMBED_OFF, description: true}}}})
		await VideoPhase(true).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.embed?.description).toBe(true)
	})

	it('writeThumbnail propagates with embedded subtitles', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, embed: {...EMBED_OFF, thumbnailSidecar: true}}}})
		await VideoPhase(true).run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.embed?.thumbnailSidecar).toBe(true)
	})
})

describe('VideoPhase — cancel / pause', () => {
	it('cancelRequested after run → returns cancelled', async () => {
		const runMock = vi.fn().mockImplementation((_req, _signal) => {
			return Promise.resolve(SUCCESS)
		})
		const ctx: PhaseContext = {active: makeActive({cancelRequested: false}), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
		// Set cancelRequested during the run
		runMock.mockImplementationOnce(async () => {
			ctx.active.cancelRequested = true
			return SUCCESS
		})

		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome.kind).toBe('cancelled')
	})

	it('pauseRequested after run → returns paused', async () => {
		const runMock = vi.fn().mockImplementation(async () => SUCCESS)
		const ctx: PhaseContext = {active: makeActive({pauseRequested: false}), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
		runMock.mockImplementationOnce(async () => {
			ctx.active.pauseRequested = true
			return SUCCESS
		})

		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome.kind).toBe('paused')
	})
})

describe('VideoPhase — temp dir lifecycle (real fs)', () => {
	let outputDir: string

	beforeEach(async () => {
		outputDir = await mkdtemp(join(tmpdir(), 'arroxy-vp-'))
	})

	afterEach(async () => {
		await rm(outputDir, {recursive: true, force: true})
	})

	function makeRealCtx(activeOverrides: Partial<ActiveDownload>, runResult: YtDlpResult = SUCCESS): PhaseContext & {runMock: ReturnType<typeof vi.fn>} {
		const job = makeJob()
		job.outputDir = outputDir
		const input: StartDownloadInput = {...BASE_INPUT, outputDir, job: BASE_JOB}
		const runMock = vi.fn().mockResolvedValue(runResult)
		const realController = new AbortController()
		const active: ActiveDownload = {job, input, controller: realController, signal: realController.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack(), ...activeOverrides}
		const ctx: PhaseContext = {active, signal: realController.signal, register: disposable => active.disposables.defer(disposable), ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
		return Object.assign(ctx, {runMock})
	}

	it('fresh start (active.tempDir undefined) → wipes existing temp dir contents', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const stalePart = join(expectedTempDir, 'leftover.f137.webm.part')
		await writeFile(stalePart, 'stale')

		const ctx = makeRealCtx({})
		await VideoPhase(false).run(ctx)

		await expect(access(stalePart)).rejects.toThrow()
		expect(ctx.active.tempDir).toBe(expectedTempDir)
	})

	it('resume (active.tempDir already set) → preserves .part file in temp dir', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const partFile = join(expectedTempDir, 'video.f337.webm.part')
		await writeFile(partFile, 'partial-bytes')

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		await VideoPhase(false).run(ctx)

		await expect(access(partFile)).resolves.toBeUndefined()
		expect(ctx.active.tempDir).toBe(expectedTempDir)
	})

	it('resume w/ cached _arroxy.info.json → passes loadInfoJsonPath to ytDlp.run', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const infoJsonPath = join(expectedTempDir, '_arroxy.info.json')
		await writeFile(infoJsonPath, '{}')

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		await VideoPhase(false).run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBe(infoJsonPath)
	})

	it('resume w/o cached info.json → loadInfoJsonPath undefined', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		await VideoPhase(false).run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBeUndefined()
	})

	it('fresh start → loadInfoJsonPath undefined even if stale info.json existed (tempDir wiped)', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		await writeFile(join(expectedTempDir, '_arroxy.info.json'), '{}')

		const ctx = makeRealCtx({})
		await VideoPhase(false).run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBeUndefined()
	})

	it('resume with missing temp dir → mkdir recreates it without throwing', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome.kind).toBe('continue')
		await expect(access(expectedTempDir)).resolves.toBeUndefined()
	})

	it('resumable media failure preserves temp dir when disposables drain', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const partFile = join(expectedTempDir, 'video.f137.webm.part')
		await writeFile(partFile, 'partial-bytes')

		const ctx = makeRealCtx({tempDir: expectedTempDir, mediaDownloadStarted: true, mediaComponentPaths: [partFile]}, NETWORK_ERROR)
		const outcome = await VideoPhase(false).run(ctx)
		await ctx.active.disposables[Symbol.asyncDispose]()

		expect(outcome.kind).toBe('hard-failed')
		await expect(access(partFile)).resolves.toBeUndefined()
		expect(ctx.active.resumeContext?.tempDir).toBe(expectedTempDir)
	})

	it('non-resumable failure deletes temp dir when disposables drain', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const partFile = join(expectedTempDir, 'video.f137.webm.part')
		await writeFile(partFile, 'partial-bytes')

		const ctx = makeRealCtx({tempDir: expectedTempDir, mediaDownloadStarted: true, mediaComponentPaths: [partFile]}, EXIT_ERROR)
		const outcome = await VideoPhase(false).run(ctx)
		await ctx.active.disposables[Symbol.asyncDispose]()

		expect(outcome.kind).toBe('hard-failed')
		await expect(access(expectedTempDir)).rejects.toThrow()
	})
})

describe('VideoPhase — signal callbacks', () => {
	it('onMinting(0) → emits mintingToken; onMinting(1) → emits remintingToken', async () => {
		const runMock = vi.fn().mockImplementation(async (_req, signal) => {
			signal?.onMinting?.(0)
			signal?.onMinting?.(1)
			return SUCCESS
		})
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}

		await VideoPhase(false).run(ctx)

		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken)
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken)
	})

	it('fallback attempt → does not emit any status (onMinting never fires for fallback)', async () => {
		const runMock = vi.fn().mockImplementation(async (_req, _signal) => SUCCESS)
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}

		await VideoPhase(false).run(ctx)

		expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled()
	})

	it('onSpawn → assigns process to active and registers SIGKILL disposable (no preemptive status)', async () => {
		const fakeProc = Object.assign(new EventEmitter(), {kill: vi.fn()})
		const runMock = vi.fn().mockImplementation(async (_req, signal) => {
			signal?.onSpawn?.(fakeProc as never)
			return SUCCESS
		})
		const active = makeActive()
		const registerSpy = vi.fn((d: () => void | Promise<void>) => active.disposables.defer(d))
		const ctx: PhaseContext = {active, signal: active.signal, register: registerSpy, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}

		await VideoPhase(false).run(ctx)

		expect(active.ytDlpProcess).toBe(fakeProc)
		expect(registerSpy).toHaveBeenCalled()
		// No preemptive status emit on spawn (token attempts only).
		expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalledWith('download', expect.anything())
	})

	it('onStdout/onStderr → calls safeConsume', async () => {
		const runMock = vi.fn().mockImplementation(async (_req, signal) => {
			signal?.onStdout?.('stdout line\n')
			signal?.onStderr?.('stderr line\n')
			return SUCCESS
		})
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}

		await VideoPhase(false).run(ctx)

		expect(ctx.safeConsume).toHaveBeenCalledWith('stdout line\n')
		expect(ctx.safeConsume).toHaveBeenCalledWith('stderr line\n')
	})
})
