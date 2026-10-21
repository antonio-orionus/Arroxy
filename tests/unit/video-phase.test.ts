import {EventEmitter} from 'node:events'
import {mkdtemp, mkdir, writeFile, rm, access} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {VideoPhase} from '@main/services/phases/VideoPhase.js'
import {hideTempDirRoot} from '@main/services/download/tempDirVisibility.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, QueueResumeContext, ResolvedStartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'
import type {YtDlpResult} from '@main/services/YtDlp.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import {explorePorts} from '../helpers/explorePorts.js'

// Only the visibility helper is stubbed: it shells out to `attrib`, which does
// not exist off Windows, and these tests are about when it is called.
vi.mock('@main/services/download/tempDirVisibility.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/download/tempDirVisibility.js')>()
	return {...actual, hideTempDirRoot: vi.fn()}
})

// The probe's info-json in the app's cache. A run loads a copy in the job's
// temp folder, so the file must exist for the copy to be made.
let probeCache: string
let PROBE: string
let STALE: string
beforeAll(async () => {
	probeCache = await mkdtemp(join(tmpdir(), 'arroxy-probe-cache-'))
	PROBE = join(probeCache, 'probe.info.json')
	STALE = join(probeCache, 'stale.info.json')
	await writeFile(PROBE, '{"id": "test"}')
	await writeFile(STALE, '{"id": "test"}')
})
afterAll(async () => {
	await rm(probeCache, {recursive: true, force: true})
})
const PROBE_COPY = join('/tmp', '.arroxy-temp', 'job-1', '_arroxy.probe.info.json')

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}

function makeJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
}

const BASE_JOB: PreparedJob = {
	kind: 'single-format',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	formatId: 'bv+ba',
	sponsorBlock: SB_OFF,
	embed: EMBED_OFF,
	subtitles: {
		request: {
			kind: 'tracks',
			tracks: [
				{key: 'en', auto: false},
				{key: 'ja', auto: false}
			]
		},
		mode: 'embed',
		format: 'vtt'
	}
}

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

	const ctx: PhaseContext = {
		active: makeActive(activeOverrides),
		signal: new AbortController().signal,
		register: () => undefined,
		ytDlp: {run: runMock, usesCookies: vi.fn().mockResolvedValue(false), ffmpegPath: '/fake/ffmpeg'} as never,
		emitStatus: vi.fn(),
		safeConsume: vi.fn(),
		cookielessRetry: new CookielessRetry(),
		...explorePorts()
	}
	return Object.assign(ctx, {runMock})
}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const SUCCESS_FALLBACK: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: true}
const EXIT_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'botBlock', rawError: 'bot', stdout: '', stderr: ''}
const NETWORK_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'network', rawError: 'read reset', stdout: '', stderr: ''}
const CHUNK_TRANSFER_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'chunkTransferFailure', rawError: 'Giving up after 3 retries', stdout: '', stderr: ''}
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

describe('VideoPhase', () => {
	it('calls ytDlp.run with kind: media', async () => {
		const ctx = makeCtx(SUCCESS)
		await VideoPhase.run(ctx)
		expect(ctx.runMock).toHaveBeenCalledOnce()
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.kind).toBe('media')
	})

	it('runs with the configured identity by default and the Explore session for an escalated job', async () => {
		const anonymous = makeCtx(SUCCESS)
		await VideoPhase.run(anonymous)
		expect(anonymous.runMock.mock.calls[0]?.[2]).toMatchObject({identity: 'configured', jobKey: 'job-1', finalPathFile: expect.stringMatching(/_arroxy\.final-path\.txt$/)})

		const signedIn = Object.assign(makeCtx(SUCCESS, {input: {...BASE_INPUT, auth: 'exploreSession'}}), explorePorts({signedIn: true}))
		await VideoPhase.run(signedIn)
		expect(signedIn.runMock.mock.calls[0]?.[2]).toMatchObject({identity: 'exploreSession', jobKey: 'job-1'})
	})

	it('keeps the Explore session on the info-json re-extraction fallback', async () => {
		const ctx = Object.assign(makeCtx(SUCCESS, {input: {...BASE_INPUT, auth: 'exploreSession', probeInfoJsonPath: PROBE}}), explorePorts({signedIn: true}))
		ctx.runMock.mockResolvedValueOnce({kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError: 'ERROR: bad info json', stdout: '', stderr: ''})
		await VideoPhase.run(ctx)
		expect(ctx.runMock).toHaveBeenCalledTimes(2)
		expect(ctx.runMock.mock.calls.map(call => call[2])).toMatchObject([
			{identity: 'exploreSession', jobKey: 'job-1'},
			{identity: 'exploreSession', jobKey: 'job-1'}
		])
	})

	it('forwards a single-mode filenameTemplate to yt-dlp', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, filenameTemplate: '{title} [{id}]'}}})
		await VideoPhase.run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.output.template).toBe('%(title).40B [%(id)s].%(ext)s')
	})

	it('uses combined YouTube player clients for explicit single-format downloads', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, formatId: '337+380'}}})
		await VideoPhase.run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.extractor).toEqual({youtube: {playerClient: ['default', 'web_embedded']}})
	})

	it('uses combined YouTube player clients for ranged playlist/profile downloads', async () => {
		const rangedJob: PreparedJob = {
			kind: 'ranged-format',
			extractor: 'youtube',
			extractorKey: 'Youtube',
			intent: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}},
			formatSelector: 'bestvideo*+bestaudio/best',
			formatSort: 'res:1080,fps',
			mergeOutputFormat: undefined,
			audioConvert: undefined,
			filenameTemplate: '{title} [{id}]',
			sponsorBlock: SB_OFF,
			embed: EMBED_OFF
		}
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: rangedJob}})
		await VideoPhase.run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.extractor).toEqual({youtube: {playerClient: ['default', 'web_embedded']}})
	})

	it('fresh single-video start with probeInfoJsonPath passes loadInfoJsonPath to yt-dlp', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, probeInfoJsonPath: PROBE}})

		await VideoPhase.run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBe(PROBE_COPY)
	})

	it('pre-media info-json failure retries once without loadInfoJsonPath', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(NETWORK_ERROR).mockResolvedValueOnce(SUCCESS)
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: STALE}})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock, invalidateTokenSession: vi.fn()} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		const outcome = await VideoPhase.run(ctx)

		expect(outcome.kind).toBe('continue')
		expect(runMock).toHaveBeenCalledTimes(2)
		expect(runMock.mock.calls[0][0].resume?.loadInfoJsonPath).toBe(PROBE_COPY)
		expect(runMock.mock.calls[1][0].resume?.loadInfoJsonPath).toBeUndefined()
	})

	// Root cause of the reported "works once, then needs a restart": the session's
	// PO token / visitor_data pins every download to one googlevideo edge host for
	// 5h. When that host dies, dropping the info-json is not enough — re-extraction
	// under the same session identity is handed the same dead host (observed in a
	// user log: a genuinely fresh probe returned the identical host). Only a new
	// visitor_data recovers, which until now meant restarting the app.
	it('resets the token session before re-extracting after a network failure', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(NETWORK_ERROR).mockResolvedValueOnce(SUCCESS)
		const invalidateTokenSession = vi.fn()
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: STALE}})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock, invalidateTokenSession} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

		expect(invalidateTokenSession).toHaveBeenCalledOnce()
		expect(invalidateTokenSession.mock.invocationCallOrder[0]).toBeLessThan(runMock.mock.invocationCallOrder[1])
	})

	// The other half of `canRecoverWithNewSession`. Without this the branch is
	// load-bearing in production and free to delete in tests: 'network' alone
	// covers the guard, so removing `chunkTransferFailure` stays green.
	it('resets the token session after a chunk transfer failure too', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(CHUNK_TRANSFER_ERROR).mockResolvedValueOnce(SUCCESS)
		const invalidateTokenSession = vi.fn()
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: STALE}})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock, invalidateTokenSession} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

		expect(invalidateTokenSession).toHaveBeenCalledOnce()
		expect(invalidateTokenSession.mock.invocationCallOrder[0]).toBeLessThan(runMock.mock.invocationCallOrder[1])
	})

	// Minting is the one await here long enough for a user to give up inside it.
	// Spawning the fallback anyway only to SIGKILL it on the next line wastes a
	// process and reports the cancellation late.
	it('abandons the fallback when the job is cancelled during the session reset', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(NETWORK_ERROR).mockResolvedValueOnce(SUCCESS)
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: STALE}})
		const invalidateTokenSession = vi.fn().mockImplementation(async () => {
			active.cancelRequested = true
			active.controller.abort()
			return false
		})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock, invalidateTokenSession} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		const outcome = await VideoPhase.run(ctx)

		expect(outcome).toEqual({kind: 'cancelled'})
		expect(runMock).toHaveBeenCalledTimes(1)
	})

	// The job's own signal reaches the mint, so the reset abandons the hidden
	// window instead of holding the cancel until its full budget expires.
	it('hands the job signal to the session reset', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(NETWORK_ERROR).mockResolvedValueOnce(SUCCESS)
		const invalidateTokenSession = vi.fn()
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: STALE}})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock, invalidateTokenSession} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

		expect(invalidateTokenSession).toHaveBeenCalledWith(active.signal)
	})

	// A bot wall already has its own re-mint ladder inside YtDlp, and a stale or
	// malformed info-json is a plan problem rather than a session problem. Minting
	// costs a hidden-window page load, so it stays scoped to transport failures.
	it('does not reset the token session when the failure is not transport-related', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(EXIT_ERROR).mockResolvedValueOnce(SUCCESS)
		const invalidateTokenSession = vi.fn()
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: STALE}})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock, invalidateTokenSession} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

		expect(runMock).toHaveBeenCalledTimes(2)
		expect(invalidateTokenSession).not.toHaveBeenCalled()
	})

	// Pinning the edge host to the session identity is a YouTube behaviour, and
	// only YouTube reads the token the mint produces. Elsewhere the hidden-window
	// scrape is pure cost — the same reason YtDlp skips the PoT ladder off-site.
	it('does not reset the token session for a site that does not use PoT', async () => {
		const runMock = vi.fn().mockResolvedValueOnce(NETWORK_ERROR).mockResolvedValueOnce(SUCCESS)
		const invalidateTokenSession = vi.fn()
		const input: ResolvedStartDownloadInput = {url: 'https://vimeo.com/123456', outputDir: '/tmp', job: {...BASE_JOB, extractor: 'vimeo', extractorKey: 'Vimeo'}, probeInfoJsonPath: STALE}
		const active = makeActive({input, job: {...makeJob(), url: input.url}})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock, invalidateTokenSession} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

		expect(runMock).toHaveBeenCalledTimes(2)
		expect(invalidateTokenSession).not.toHaveBeenCalled()
	})

	it('post-media info-json failure does not retry and preserves resume behavior', async () => {
		const runMock = vi.fn().mockImplementation(async () => {
			active.mediaDownloadStarted = true
			return NETWORK_ERROR
		})
		const active = makeActive({input: {...BASE_INPUT, probeInfoJsonPath: STALE}, tempDir: '/tmp/arroxy-resume-info-json'})
		const ctx: PhaseContext = {active, signal: active.signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		const outcome = await VideoPhase.run(ctx)

		expect(runMock).toHaveBeenCalledTimes(1)
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toMatchObject({kind: 'media-retry', reason: 'media-transfer', failureKind: 'network'})
	})

	it('success → returns continue', async () => {
		const outcome = await VideoPhase.run(makeCtx(SUCCESS))
		expect(outcome.kind).toBe('continue')
	})

	it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
		const ctx = makeCtx(SUCCESS_FALLBACK)
		await VideoPhase.run(ctx)
		expect(ctx.active.usedExtractorFallback).toBe(true)
	})

	it('exit-error → hard-failed with classified error payload', async () => {
		const ctx = makeCtx(EXIT_ERROR)
		const outcome = await VideoPhase.run(ctx)
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('botBlock')
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({kind: 'botBlock'}))
	})

	it('media transfer failure after media starts returns resume context', async () => {
		const tempDir = '/tmp/arroxy-resume-media'
		const ctx = makeCtx(NETWORK_ERROR, {tempDir, mediaDownloadStarted: true, mediaComponentPaths: [`${tempDir}/video.f137.webm.part`, `${tempDir}/video.f251.m4a.part`]})

		const outcome = await VideoPhase.run(ctx)

		const expected: QueueResumeContext = {kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: 'network'}
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toEqual(expected)
		expect(ctx.active.resumeContext).toEqual(expected)
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({kind: 'network'}), expected)
	})

	it('rate-limit media failures preserve split component resume context', async () => {
		const tempDir = '/tmp/arroxy-resume-rate'
		const ctx = makeCtx(RATE_LIMIT_ERROR, {tempDir, mediaDownloadStarted: true, mediaComponentPaths: [`${tempDir}/video.f137.webm.part`, `${tempDir}/video.f251.m4a.part`]})

		const outcome = await VideoPhase.run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toMatchObject({kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: 'rateLimit'})
	})

	it('postprocess and disk-full failures after media acquisition preserve postprocess resume context', async () => {
		for (const failure of [POSTPROCESS_ERROR, DISK_FULL_ERROR]) {
			const tempDir = `/tmp/arroxy-resume-${failure.errorKind}`
			const ctx = makeCtx(failure, {tempDir, mediaDownloadStarted: true, mediaComponentPaths: [`${tempDir}/video.f137.webm`], mediaPath: `${tempDir}/video.webm`, mediaPostprocessStarted: true})

			const outcome = await VideoPhase.run(ctx)

			expect(outcome.kind).toBe('hard-failed')
			if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toMatchObject({kind: 'media-retry', tempDir, reason: 'postprocess', failureKind: failure.errorKind})
		}
	})

	it('auth/content failures and pre-media network failures do not preserve resume context', async () => {
		for (const failure of [EXIT_ERROR, NETWORK_ERROR]) {
			const ctx = makeCtx(failure, {tempDir: '/tmp/arroxy-non-resumable'})

			const outcome = await VideoPhase.run(ctx)

			expect(outcome.kind).toBe('hard-failed')
			if (outcome.kind === 'hard-failed') expect(outcome.resumeContext).toBeUndefined()
			expect(ctx.active.resumeContext).toBeUndefined()
		}
	})

	it('SponsorBlock API failure → continues without failing the downloaded media', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR, {input: {...BASE_INPUT, job: {...BASE_JOB, sponsorBlock: {mode: 'mark', categories: ['sponsor']}}}})

		const outcome = await VideoPhase.run(ctx)

		expect(outcome.kind).toBe('continue')
		expect(ctx.runMock).toHaveBeenCalledTimes(1)
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toEqual({mode: 'mark', categories: ['sponsor']})
		expect(ctx.emitStatus).not.toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})

	it('SponsorBlock API failure with mode=off → hard-fails', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR)

		const outcome = await VideoPhase.run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toBeUndefined()
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})

	it('SponsorBlock API failure with empty categories → hard-fails', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR, {input: {...BASE_INPUT, job: {...BASE_JOB, sponsorBlock: {mode: 'mark', categories: []}}}})

		const outcome = await VideoPhase.run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toEqual({mode: 'mark', categories: []})
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})

	// A mixed bulk batch resolves the renderer-side extractor to '' for every row
	// in it, which used to strand the YouTube rows on the generic adapter: no
	// SponsorBlock, no YouTube player clients. The job URL is per-row and always
	// present, so it decides the site when the extractor cannot.
	it('empty extractor + YouTube URL → SponsorBlock and player clients still apply', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, extractor: '', extractorKey: '', sponsorBlock: {mode: 'mark', categories: ['sponsor']}}}})

		await VideoPhase.run(ctx)

		const req = ctx.runMock.mock.calls[0][0]
		expect(req.sponsorBlock).toEqual({mode: 'mark', categories: ['sponsor']})
		expect(req.extractor).toEqual({youtube: {playerClient: ['default', 'web_embedded']}})
	})

	it('empty extractor + non-YouTube URL → stays generic', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, url: 'https://vimeo.com/12345', job: {...BASE_JOB, extractor: '', extractorKey: '', sponsorBlock: {mode: 'mark', categories: ['sponsor']}}}})

		await VideoPhase.run(ctx)

		const req = ctx.runMock.mock.calls[0][0]
		expect(req.sponsorBlock).toBeUndefined()
		expect(req.extractor).toBeUndefined()
	})

	it('SponsorBlock API failure on a site without SponsorBlock support → hard-fails', async () => {
		const ctx = makeCtx(SPONSORBLOCK_API_ERROR, {input: {...BASE_INPUT, job: {...BASE_JOB, extractor: 'Vimeo', extractorKey: 'Vimeo', sponsorBlock: {mode: 'mark', categories: ['sponsor']}}}})

		const outcome = await VideoPhase.run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		expect(ctx.runMock.mock.calls[0][0].sponsorBlock).toBeUndefined()
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.any(Object))
	})
})

describe('VideoPhase — subtitles', () => {
	it('leaves embedded subtitles to the subtitle phase: the media run downloads none', async () => {
		const ctx = makeCtx(SUCCESS)
		await VideoPhase.run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.kind).toBe('media')
		expect(req.subtitles).toBeUndefined()
	})
})

describe('VideoPhase — audio conversion', () => {
	it('marks wav audio conversion as lossless for the bridge planner', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {kind: 'audio-convert', extractor: 'youtube', extractorKey: 'Youtube', audioConvert: {target: 'wav'}, sponsorBlock: SB_OFF, embed: EMBED_OFF}}})

		await VideoPhase.run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.audio?.convert).toEqual({target: 'wav', lossy: false})
	})
})

describe('VideoPhase — sidecar field propagation', () => {
	it('writeDescription propagates to media embed options', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: undefined, embed: {...EMBED_OFF, description: true}}}})
		await VideoPhase.run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.embed?.description).toBe(true)
	})

	it('writeThumbnail propagates to media embed options', async () => {
		const ctx = makeCtx(SUCCESS, {input: {...BASE_INPUT, job: {...BASE_JOB, subtitles: undefined, embed: {...EMBED_OFF, thumbnailSidecar: true}}}})
		await VideoPhase.run(ctx)
		const [req] = ctx.runMock.mock.calls[0]
		expect(req.embed?.thumbnailSidecar).toBe(true)
	})
})

describe('VideoPhase — cancel / pause', () => {
	it('cancelRequested after run → returns cancelled', async () => {
		const runMock = vi.fn().mockImplementation((_req, _signal) => {
			return Promise.resolve(SUCCESS)
		})
		const ctx: PhaseContext = {active: makeActive({cancelRequested: false}), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
		// Set cancelRequested during the run
		runMock.mockImplementationOnce(async () => {
			ctx.active.cancelRequested = true
			return SUCCESS
		})

		const outcome = await VideoPhase.run(ctx)
		expect(outcome.kind).toBe('cancelled')
	})

	it('pauseRequested after run → returns paused', async () => {
		const runMock = vi.fn().mockImplementation(async () => SUCCESS)
		const ctx: PhaseContext = {active: makeActive({pauseRequested: false}), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
		runMock.mockImplementationOnce(async () => {
			ctx.active.pauseRequested = true
			return SUCCESS
		})

		const outcome = await VideoPhase.run(ctx)
		expect(outcome.kind).toBe('paused')
	})
})

describe('VideoPhase — temp dir lifecycle (real fs)', () => {
	let outputDir: string

	beforeEach(async () => {
		outputDir = await mkdtemp(join(tmpdir(), 'arroxy-vp-'))
		vi.mocked(hideTempDirRoot).mockClear()
	})

	afterEach(async () => {
		await rm(outputDir, {recursive: true, force: true})
	})

	function makeRealCtx(activeOverrides: Partial<ActiveDownload>, runResult: YtDlpResult = SUCCESS): PhaseContext & {runMock: ReturnType<typeof vi.fn>} {
		const job = makeJob()
		job.outputDir = outputDir
		const input: ResolvedStartDownloadInput = {...BASE_INPUT, outputDir, job: BASE_JOB as Extract<PreparedJob, {kind: 'single-format'}>}
		const runMock = vi.fn().mockResolvedValue(runResult)
		const realController = new AbortController()
		const active: ActiveDownload = {job, input, controller: realController, signal: realController.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack(), ...activeOverrides}
		const ctx: PhaseContext = {active, signal: realController.signal, register: disposable => active.disposables.defer(disposable), ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
		return Object.assign(ctx, {runMock})
	}

	// Windows-only in effect, but the trigger is platform-independent and worth
	// pinning here: the hide must fire exactly when `.arroxy-temp` is created.
	// Verified on a real Windows 11 host that a recreated root loses the Hidden
	// attribute, so "once per session" would leave later downloads visible.
	it('hides .arroxy-temp at the moment it creates the root', async () => {
		await VideoPhase.run(makeRealCtx({}))

		expect(vi.mocked(hideTempDirRoot)).toHaveBeenCalledWith(join(outputDir, '.arroxy-temp'))
	})

	it('does not re-hide a .arroxy-temp that already exists', async () => {
		await mkdir(join(outputDir, '.arroxy-temp'), {recursive: true})

		await VideoPhase.run(makeRealCtx({}))

		expect(vi.mocked(hideTempDirRoot)).not.toHaveBeenCalled()
	})

	it('hides again once cleanup has removed the root and a later job recreates it', async () => {
		await VideoPhase.run(makeRealCtx({}))
		await rm(join(outputDir, '.arroxy-temp'), {recursive: true, force: true})

		await VideoPhase.run(makeRealCtx({}))

		expect(vi.mocked(hideTempDirRoot)).toHaveBeenCalledTimes(2)
	})

	it('fresh start (active.tempDir undefined) → wipes existing temp dir contents', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const stalePart = join(expectedTempDir, 'leftover.f137.webm.part')
		await writeFile(stalePart, 'stale')

		const ctx = makeRealCtx({})
		await VideoPhase.run(ctx)

		await expect(access(stalePart)).rejects.toThrow()
		expect(ctx.active.tempDir).toBe(expectedTempDir)
	})

	it('resume (active.tempDir already set) → preserves .part file in temp dir', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const partFile = join(expectedTempDir, 'video.f337.webm.part')
		await writeFile(partFile, 'partial-bytes')

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		await VideoPhase.run(ctx)

		await expect(access(partFile)).resolves.toBeUndefined()
		expect(ctx.active.tempDir).toBe(expectedTempDir)
	})

	it('resume w/ cached _arroxy.info.json → passes loadInfoJsonPath to ytDlp.run', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const infoJsonPath = join(expectedTempDir, '_arroxy.info.json')
		await writeFile(infoJsonPath, '{}')

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		await VideoPhase.run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBe(infoJsonPath)
	})

	it('a part never replays its own saved info-json: yt-dlp wrote it after cutting, so the range would apply twice', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		await writeFile(join(expectedTempDir, '_arroxy.info.json'), '{"section_start": 3, "duration": 3}')
		const job: PreparedJob = {...BASE_JOB, videoPart: {startSeconds: 3, endSeconds: 6, exactCut: false}}

		const ctx = makeRealCtx({tempDir: expectedTempDir, input: {...BASE_INPUT, job, probeInfoJsonPath: PROBE}})
		await VideoPhase.run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBe(join(expectedTempDir, '_arroxy.probe.info.json'))
		expect(req.downloadSections).toEqual(['*3-6'])
	})

	it('resume w/o cached info.json → loadInfoJsonPath undefined', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		await VideoPhase.run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBeUndefined()
	})

	it('fresh start → loadInfoJsonPath undefined even if stale info.json existed (tempDir wiped)', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		await writeFile(join(expectedTempDir, '_arroxy.info.json'), '{}')

		const ctx = makeRealCtx({})
		await VideoPhase.run(ctx)

		const [req] = ctx.runMock.mock.calls[0]
		expect(req.resume?.loadInfoJsonPath).toBeUndefined()
	})

	it('resume with missing temp dir → mkdir recreates it without throwing', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))

		const ctx = makeRealCtx({tempDir: expectedTempDir})
		const outcome = await VideoPhase.run(ctx)

		expect(outcome.kind).toBe('continue')
		await expect(access(expectedTempDir)).resolves.toBeUndefined()
	})

	it('resumable media failure preserves temp dir when disposables drain', async () => {
		const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8))
		await mkdir(expectedTempDir, {recursive: true})
		const partFile = join(expectedTempDir, 'video.f137.webm.part')
		await writeFile(partFile, 'partial-bytes')

		const ctx = makeRealCtx({tempDir: expectedTempDir, mediaDownloadStarted: true, mediaComponentPaths: [partFile]}, NETWORK_ERROR)
		const outcome = await VideoPhase.run(ctx)
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
		const outcome = await VideoPhase.run(ctx)
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
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken)
		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken)
	})

	it('fallback attempt → does not emit any status (onMinting never fires for fallback)', async () => {
		const runMock = vi.fn().mockImplementation(async (_req, _signal) => SUCCESS)
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

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
		const ctx: PhaseContext = {active, signal: active.signal, register: registerSpy, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

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
		const ctx: PhaseContext = {active: makeActive(), signal: new AbortController().signal, register: () => undefined, ytDlp: {run: runMock} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}

		await VideoPhase.run(ctx)

		expect(ctx.safeConsume).toHaveBeenCalledWith('stdout line\n')
		expect(ctx.safeConsume).toHaveBeenCalledWith('stderr line\n')
	})
})
