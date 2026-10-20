import {EventEmitter} from 'node:events'
import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi, beforeEach} from 'vite-plus/test'
import {SubtitleOnlyPhase} from '@main/services/phases/SubtitleOnlyPhase.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, ResolvedStartDownloadInput} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {YtDlpResult} from '@main/services/YtDlp.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import {explorePorts} from '../helpers/explorePorts.js'

vi.mock('@main/services/subtitlePostProcess', () => ({
	resolveConvertedSubtitlePaths: vi.fn(async (paths: readonly string[]) => [...paths]),
	postProcessSubtitleFiles: vi.fn().mockResolvedValue(undefined),
	muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ok: false}),
	logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}
}))

import {postProcessSubtitleFiles, resolveConvertedSubtitlePaths} from '@main/services/subtitlePostProcess.js'

beforeEach(() => vi.clearAllMocks())

function makeJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
}

const BASE_SUBS = {languages: ['en'], mode: 'sidecar' as const, format: 'srt' as const, writeAuto: false}
const BASE_JOB: PreparedJob = {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: BASE_SUBS}

const BASE_INPUT: ResolvedStartDownloadInput = {url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', job: BASE_JOB}

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
		disposables: new AsyncStack(),
		...overrides
	}
}

function makeCtx(runResult: YtDlpResult, activeOverrides: Partial<ActiveDownload> = {}): PhaseContext {
	const runMock = vi.fn().mockResolvedValue(runResult)
	return {active: makeActive(activeOverrides), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock, ffmpegPath: null} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const EXIT_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError: 'fail', stdout: '', stderr: ''}

describe('SubtitleOnlyPhase', () => {
	it('calls ytDlp.run with kind: subtitles', async () => {
		const ctx = makeCtx(SUCCESS)
		await SubtitleOnlyPhase.run(ctx)
		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect(req.kind).toBe('subtitles')
		expect(req.url).toBe(BASE_INPUT.url)
		expect(req.subtitles.languages).toEqual(['(?-i:en)'])
	})

	it("resolves language codes against the probe's info-json", async () => {
		const dir = await mkdtemp(join(tmpdir(), 'arroxy-subs-'))
		const probeInfoJsonPath = join(dir, 'probe.info.json')
		await writeFile(probeInfoJsonPath, JSON.stringify({subtitles: {'pt-BR': [{ext: 'vtt'}]}, automatic_captions: {'en-orig': [{ext: 'vtt'}], en: [{ext: 'vtt'}], pt: [{ext: 'vtt'}]}}))
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, probeInfoJsonPath, job: {...BASE_JOB, subtitles: {...BASE_SUBS, languages: ['pt', 'en'], writeAuto: true, languagesAreCodes: true}}}})
		await SubtitleOnlyPhase.run(ctx)
		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect(req.subtitles.languages).toEqual(['(?-i:pt-BR)', '(?-i:en)'])
		await rm(dir, {recursive: true, force: true})
	})

	it('runs anonymously by default and with the Explore session for an escalated job', async () => {
		const anonymous = makeCtx(SUCCESS)
		await SubtitleOnlyPhase.run(anonymous)
		expect(vi.mocked(anonymous.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]?.[2]).toEqual({identity: 'configured', jobKey: 'job-1'})

		const signedIn = Object.assign(makeCtx(SUCCESS, {input: {...BASE_INPUT, auth: 'exploreSession'}}), explorePorts({signedIn: true}))
		await SubtitleOnlyPhase.run(signedIn)
		expect(vi.mocked(signedIn.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]?.[2]).toEqual({identity: 'exploreSession', jobKey: 'job-1'})
	})

	it('parks a paused escalated job whose Explore session is gone instead of failing it', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, auth: 'exploreSession'}, pauseRequested: true})
		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome).toEqual({kind: 'paused'})
		expect(vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
		expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled()
	})

	it('still fails a signed-out escalated job that is not paused', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, auth: 'exploreSession'}})
		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome.kind).toBe('hard-failed')
	})

	it('forwards autoOnly so manual tracks are skipped', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_SUBS, writeAuto: true, autoOnly: true}}}})
		await SubtitleOnlyPhase.run(ctx)
		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect(req.subtitles).toMatchObject({writeAuto: true, autoOnly: true})
	})

	it('omits autoOnly for manual-first jobs', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_SUBS, writeAuto: true}}}})
		await SubtitleOnlyPhase.run(ctx)
		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect(req.subtitles.autoOnly).toBeUndefined()
	})

	it('forwards filenameTemplate for single subtitle-only jobs', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, filenameTemplate: '{title} [{id}]'}}})
		await SubtitleOnlyPhase.run(ctx)
		const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0]
		expect(req.output.template).toBe('%(title).120B [%(id)s].%(ext)s')
	})

	it('success → returns completed', async () => {
		const outcome = await SubtitleOnlyPhase.run(makeCtx(SUCCESS))
		expect(outcome.kind).toBe('completed')
	})

	// A subtitles-only job saves nothing else, so finding no track is not a
	// plain success: the queue row must say nothing was saved.
	it('soft-fails without fetching when the video has none of the requested languages', async () => {
		const dir = await mkdtemp(join(tmpdir(), 'arroxy-subs-'))
		const probeInfoJsonPath = join(dir, 'probe.info.json')
		await writeFile(probeInfoJsonPath, JSON.stringify({subtitles: {en: [{ext: 'vtt'}], es: [{ext: 'vtt'}]}, automatic_captions: {}}))
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, probeInfoJsonPath, job: {...BASE_JOB, subtitles: {...BASE_SUBS, languages: ['de'], languagesAreCodes: true}}}})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.noSubtitleTracks})
		expect(ctx.ytDlp.run).not.toHaveBeenCalled()
		await rm(dir, {recursive: true, force: true})
	})

	// yt-dlp exits 0 when none of the requested languages exists (it only warns),
	// which happens when the codes are matched as a pattern.
	it('soft-fails when the subtitle run writes no file', async () => {
		const outcome = await SubtitleOnlyPhase.run(makeCtx(SUCCESS, {subtitlePaths: []}))
		expect(outcome).toEqual({kind: 'soft-failed', status: STATUS_KEY.noSubtitleTracks})
	})

	it('failure → hard-failed with classified error payload', async () => {
		const ctx = makeCtx(EXIT_ERROR)
		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('unknown')
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({kind: 'unknown'}))
	})

	it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
		const ctx = makeCtx({...SUCCESS, usedExtractorFallback: true})
		await SubtitleOnlyPhase.run(ctx)
		expect(ctx.active.usedExtractorFallback).toBe(true)
	})

	it('writeAutoSubs=false → postProcessSubtitleFiles not called', async () => {
		await SubtitleOnlyPhase.run(makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_SUBS, writeAuto: false}}}}))
		expect(postProcessSubtitleFiles).not.toHaveBeenCalled()
	})

	it('writeAutoSubs=true → postProcessSubtitleFiles called after success', async () => {
		const paths = ['/tmp/video.en.srt']
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_SUBS, writeAuto: true}}}, subtitlePaths: paths})
		await SubtitleOnlyPhase.run(ctx)
		expect(postProcessSubtitleFiles).toHaveBeenCalledOnce()
		const [calledPaths, calledOpts] = vi.mocked(postProcessSubtitleFiles).mock.calls[0]
		expect(calledPaths).toEqual(paths)
		// The site gate reads these — forwarding the wrong ones silently disables
		// the rolling dedupe or the URL fallback.
		expect(calledOpts).toMatchObject({extractor: BASE_JOB.extractor, url: BASE_INPUT.url, jobId: expect.any(String)})
	})

	it('post-processes the converted subtitle files, not the deleted pre-conversion paths', async () => {
		vi.mocked(resolveConvertedSubtitlePaths).mockResolvedValueOnce(['/tmp/video.en.srt'])
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_SUBS, writeAuto: true}}}, subtitlePaths: ['/tmp/video.en.vtt']})
		await SubtitleOnlyPhase.run(ctx)
		expect(resolveConvertedSubtitlePaths).toHaveBeenCalledWith(['/tmp/video.en.vtt'], 'srt')
		expect(vi.mocked(postProcessSubtitleFiles).mock.calls[0][0]).toEqual(['/tmp/video.en.srt'])
		expect(ctx.active.subtitlePaths).toEqual(['/tmp/video.en.srt'])
	})

	it('postProcessSubtitleFiles shouldAbort reflects cancelRequested', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: {...BASE_SUBS, writeAuto: true}}}})
		await SubtitleOnlyPhase.run(ctx)

		const shouldAbort = vi.mocked(postProcessSubtitleFiles).mock.calls[0][1].shouldAbort
		expect(shouldAbort?.()).toBe(false)
		ctx.active.cancelRequested = true
		expect(shouldAbort?.()).toBe(true)
	})

	it('pauseRequested after run → returns paused (not hard-failed)', async () => {
		const active = makeActive({cancelRequested: false})
		const runMock = vi.fn().mockImplementationOnce(async () => {
			active.pauseRequested = true
			return EXIT_ERROR // SIGTERM makes yt-dlp exit non-zero
		})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome.kind).toBe('paused')
	})

	it('cancelled after run → returns cancelled', async () => {
		const ctx: PhaseContext = {active: makeActive({cancelRequested: false}), signal: new AbortController().signal, register: () => undefined, ytDlp: {} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
		const runMock = vi.fn().mockImplementationOnce(async () => {
			ctx.active.cancelRequested = true
			return SUCCESS
		})
		ctx.ytDlp = {run: runMock} as never

		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome.kind).toBe('cancelled')
	})

	it('onMinting(0) → emits mintingToken; onMinting(1) → emits remintingToken', async () => {
		const runMock = vi.fn().mockImplementation(async (_req, signal) => {
			signal?.onMinting?.(0)
			signal?.onMinting?.(1)
			return SUCCESS
		})
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await SubtitleOnlyPhase.run(ctx)

		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken)
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken)
	})

	it('no onMinting call → no token status emitted', async () => {
		const runMock = vi.fn().mockImplementation(async (_req, _signal) => SUCCESS)
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await SubtitleOnlyPhase.run(ctx)

		expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled()
	})

	it('onSpawn → assigns process, registers SIGKILL disposable, emits fetchingSubtitles', async () => {
		const fakeProc = Object.assign(new EventEmitter(), {kill: vi.fn()})
		const runMock = vi.fn().mockImplementation(async (_req, signal) => {
			signal?.onSpawn?.(fakeProc)
			return SUCCESS
		})
		const active = makeActive()
		const registerSpy = vi.fn((d: () => void | Promise<void>) => active.disposables.defer(d))
		const ctx: PhaseContext = {active, signal: active.signal, register: registerSpy, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await SubtitleOnlyPhase.run(ctx)

		expect(active.ytDlpProcess).toBe(fakeProc)
		expect(registerSpy).toHaveBeenCalled()
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('download', STATUS_KEY.fetchingSubtitles)
	})
})
