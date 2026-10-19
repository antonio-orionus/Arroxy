import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {VideoPhase} from '@main/services/phases/VideoPhase.js'
import {SidecarSubsPhase} from '@main/services/phases/SidecarSubsPhase.js'
import {SubtitleOnlyPhase} from '@main/services/phases/SubtitleOnlyPhase.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveDownload, PhaseContext} from '@main/services/phases/types.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import {STATUS_KEY, type ExploreSignInState} from '@shared/schemas.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'
import type {YtDlpRequest, YtDlpResult, YtDlpRunOptions, YtDlpSignal} from '@main/services/YtDlp.js'
import {explorePorts} from '../helpers/explorePorts.js'

// Only the visibility helper is stubbed: it shells out to `attrib`, which does
// not exist off Windows.
vi.mock('@main/services/download/tempDirVisibility.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/download/tempDirVisibility.js')>()
	return {...actual, hideTempDirRoot: vi.fn()}
})

vi.mock('@main/services/subtitlePostProcess', () => ({
	postProcessSubtitleFiles: vi.fn().mockResolvedValue(undefined),
	resolveConvertedSubtitlePaths: vi.fn((paths: string[]) => Promise.resolve(paths)),
	muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ok: true, outputPath: '/tmp/video.mkv'}),
	logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}
}))

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=abc'
const EMBED_OFF = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const YOUTUBE_JOB: ResolvedStartDownloadInput['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '18', sponsorBlock: {mode: 'off'}, embed: EMBED_OFF}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const LOGIN_REQUIRED: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'loginRequired', rawError: 'ERROR: [youtube] abc: Sign in to confirm your age', stdout: '', stderr: ''}
const BOT_WALL: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'botBlock', rawError: "ERROR: [youtube] abc: Sign in to confirm you're not a bot", stdout: '', stderr: ''}
const NETWORK: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'network', rawError: 'ERROR: read reset', stdout: '', stderr: ''}
const COOKIES_REJECTED: YtDlpResult = {...LOGIN_REQUIRED, accountCookiesRejected: true}

let outputDir: string

beforeEach(async () => {
	outputDir = await mkdtemp(join(tmpdir(), 'arroxy-escalation-'))
})

afterEach(async () => {
	await rm(outputDir, {recursive: true, force: true})
})

function makeCtx(opts: {runs: YtDlpResult[]; input?: Partial<ResolvedStartDownloadInput>; signedIn?: boolean; verified?: ExploreSignInState; usesCookies?: boolean}) {
	const results = [...opts.runs]
	const run = vi.fn((_req: YtDlpRequest, _signal?: YtDlpSignal, _options?: YtDlpRunOptions) => {
		const next = results.shift()
		if (!next) throw new Error('unexpected yt-dlp run')
		return Promise.resolve(next)
	})
	const controller = new AbortController()
	const active: ActiveDownload = {
		job: {id: 'job-1', url: YOUTUBE_URL, outputDir, status: 'running', createdAt: '', updatedAt: ''},
		input: {url: YOUTUBE_URL, outputDir, job: YOUTUBE_JOB, ...opts.input},
		controller,
		signal: controller.signal,
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack()
	}
	const ports = explorePorts({signedIn: opts.signedIn, verified: opts.verified})
	const emitStatus = vi.fn()
	const ctx: PhaseContext = {active, signal: controller.signal, register: () => undefined, ytDlp: {run, usesCookies: vi.fn().mockResolvedValue(opts.usesCookies ?? false), invalidateTokenSession: vi.fn(), ffmpegPath: null} as never, emitStatus, safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...ports}
	return {ctx, run, emitStatus, canEscalate: ports.exploreGate.canEscalate, verifySignedIn: ports.exploreSession.verifySignedIn}
}

const identities = (run: {mock: {calls: Array<[YtDlpRequest, YtDlpSignal?, YtDlpRunOptions?]>}}): unknown[] => run.mock.calls.map(call => call[2]?.identity)
const statusKeys = (emitStatus: {mock: {calls: unknown[][]}}): unknown[] => emitStatus.mock.calls.map(call => call[1])

describe('VideoPhase download-time escalation', () => {
	it('escalates after an anonymous loginRequired failure and persists before spawning', async () => {
		const probeInfoJsonPath = join(outputDir, 'probe.info.json')
		await writeFile(probeInfoJsonPath, '{}')
		// Run 1 loads the probe info-json; run 2 is the existing re-extraction fallback; run 3 is the escalation.
		const {ctx, run, emitStatus, canEscalate} = makeCtx({runs: [LOGIN_REQUIRED, LOGIN_REQUIRED, SUCCESS], input: {probeInfoJsonPath}, signedIn: true})

		const outcome = await VideoPhase(false).run(ctx)

		expect(outcome).toEqual({kind: 'continue'})
		expect(identities(run)).toEqual(['configured', 'configured', 'exploreSession'])
		expect(run.mock.calls[2]?.[2]).toEqual({identity: 'exploreSession', jobKey: 'job-1'})
		// The escalated run re-extracts: the anonymous info-json is never replayed signed in.
		const escalatedReq = run.mock.calls[2]?.[0]
		expect(escalatedReq?.kind === 'media' ? escalatedReq.resume?.loadInfoJsonPath : 'not media').toBeUndefined()
		expect(canEscalate).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'})
		const signingIn = emitStatus.mock.calls.findIndex(call => call[0] === 'download' && call[1] === STATUS_KEY.signingInWithExplore)
		expect(signingIn).toBeGreaterThanOrEqual(0)
		// QueueService persists the job's auth on that status, so it must come first.
		expect(emitStatus.mock.invocationCallOrder[signingIn]).toBeLessThan(run.mock.invocationCallOrder[2])
		expect(ctx.active.input.auth).toBe('exploreSession')
	})

	it('escalates a YouTube bot wall: the PoT ladder already ran inside YtDlp', async () => {
		const {ctx, run} = makeCtx({runs: [BOT_WALL, SUCCESS], signedIn: true})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(identities(run)).toEqual(['configured', 'exploreSession'])
	})

	it('does not escalate a bot wall the ladder has not exhausted', async () => {
		// A non-PoT site has no ladder to exhaust (R2), so its bot wall never escalates.
		const {ctx, run, emitStatus} = makeCtx({runs: [BOT_WALL], input: {url: 'https://vimeo.com/1', job: {...YOUTUBE_JOB, extractor: 'vimeo', extractorKey: 'Vimeo'}}, signedIn: true})
		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome.kind).toBe('hard-failed')
		expect(run).toHaveBeenCalledOnce()
		expect(statusKeys(emitStatus)).not.toContain(STATUS_KEY.signingInWithExplore)
	})

	it('does not escalate a failure an account cannot fix', async () => {
		const {ctx, run, canEscalate} = makeCtx({runs: [NETWORK], signedIn: true})
		expect((await VideoPhase(false).run(ctx)).kind).toBe('hard-failed')
		expect(run).toHaveBeenCalledOnce()
		expect(canEscalate).not.toHaveBeenCalled()
	})

	it('does not escalate when the gate refuses (not in explore mode, signed out, or switched off)', async () => {
		const {ctx, run, emitStatus} = makeCtx({runs: [LOGIN_REQUIRED], signedIn: false})
		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome).toMatchObject({kind: 'hard-failed', error: {kind: 'loginRequired'}})
		expect(run).toHaveBeenCalledOnce()
		expect(statusKeys(emitStatus)).not.toContain(STATUS_KEY.signingInWithExplore)
		expect(ctx.active.input.auth).toBeUndefined()
	})

	it('does not escalate a job that already runs signed in', async () => {
		const {ctx, run, emitStatus} = makeCtx({runs: [LOGIN_REQUIRED], input: {auth: 'exploreSession'}, signedIn: true})
		expect((await VideoPhase(false).run(ctx)).kind).toBe('hard-failed')
		expect(identities(run)).toEqual(['exploreSession'])
		expect(statusKeys(emitStatus)).not.toContain(STATUS_KEY.signingInWithExplore)
	})

	it('does not spawn the escalation when the job is cancelled while the gate decides', async () => {
		const {ctx, run, canEscalate} = makeCtx({runs: [LOGIN_REQUIRED], signedIn: true})
		canEscalate.mockImplementation(() => {
			ctx.active.cancelRequested = true
			return Promise.resolve(true)
		})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'cancelled'})
		expect(run).toHaveBeenCalledOnce()
	})

	it('re-verifies and retries once when yt-dlp rejects the account cookies', async () => {
		const {ctx, run, verifySignedIn} = makeCtx({runs: [COOKIES_REJECTED, SUCCESS], input: {auth: 'exploreSession'}, signedIn: true, verified: 'signedIn'})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(verifySignedIn).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'})
		expect(identities(run)).toEqual(['exploreSession', 'exploreSession'])
	})

	it('retries only once when the cookies are rejected again', async () => {
		const {ctx, run, verifySignedIn} = makeCtx({runs: [COOKIES_REJECTED, COOKIES_REJECTED], input: {auth: 'exploreSession'}, signedIn: true, verified: 'signedIn'})
		expect((await VideoPhase(false).run(ctx)).kind).toBe('hard-failed')
		expect(verifySignedIn).toHaveBeenCalledOnce()
		expect(run).toHaveBeenCalledTimes(2)
	})

	it('fails with the Explore sign-in error when verification says signed out', async () => {
		const {ctx, run, emitStatus} = makeCtx({runs: [COOKIES_REJECTED], input: {auth: 'exploreSession'}, signedIn: true, verified: 'signedOut'})
		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome).toMatchObject({kind: 'hard-failed', error: {kind: 'loginRequired'}})
		expect(emitStatus).toHaveBeenCalledWith('error', STATUS_KEY.exploreSignedOut, undefined, expect.objectContaining({kind: 'loginRequired'}))
		// Never falls back to an anonymous run.
		expect(identities(run)).toEqual(['exploreSession'])
	})

	it('fails with a normal retryable error, not signed out, when verification cannot tell (R22)', async () => {
		const {ctx, run, emitStatus} = makeCtx({runs: [COOKIES_REJECTED], input: {auth: 'exploreSession'}, signedIn: true, verified: 'unknown'})
		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome).toMatchObject({kind: 'hard-failed', error: {kind: 'network'}})
		expect(statusKeys(emitStatus)).not.toContain(STATUS_KEY.exploreSignedOut)
		// No retry on an unconfirmed session, and never an anonymous run.
		expect(identities(run)).toEqual(['exploreSession'])
	})

	it('ends cancelled, not signed out, when the job is cancelled during verification', async () => {
		const {ctx, emitStatus, verifySignedIn} = makeCtx({runs: [COOKIES_REJECTED], input: {auth: 'exploreSession'}, signedIn: true})
		verifySignedIn.mockImplementation(() => {
			ctx.active.cancelRequested = true
			return Promise.resolve('signedOut' as const)
		})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'cancelled'})
		expect(statusKeys(emitStatus)).not.toContain(STATUS_KEY.exploreSignedOut)
	})

	it('handles rejected cookies on a just-escalated run the same way', async () => {
		const {ctx, run, emitStatus} = makeCtx({runs: [LOGIN_REQUIRED, COOKIES_REJECTED], signedIn: true, verified: 'signedOut'})
		expect((await VideoPhase(false).run(ctx)).kind).toBe('hard-failed')
		expect(identities(run)).toEqual(['configured', 'exploreSession'])
		expect(statusKeys(emitStatus)).toContain(STATUS_KEY.exploreSignedOut)
	})
})

describe('pre-spawn guard for escalated jobs (R5b)', () => {
	it('fails, not downgrades, when an escalated item spawns after the mode left explore', async () => {
		// The gate reads the live settings: cookiesMode 'off' → canEscalate false.
		const {ctx, run, emitStatus} = makeCtx({runs: [SUCCESS], input: {auth: 'exploreSession'}, signedIn: false})
		const outcome = await VideoPhase(false).run(ctx)
		expect(outcome).toMatchObject({kind: 'hard-failed', error: {kind: 'loginRequired'}})
		expect(run).not.toHaveBeenCalled()
		expect(emitStatus).toHaveBeenCalledWith('error', STATUS_KEY.exploreSignedOut, undefined, expect.objectContaining({kind: 'loginRequired'}))
	})

	// R13: the video is already saved, and phase-2 subtitle failures are soft.
	it('soft-fails the sidecar subtitles of an escalated job, keeping the saved video', async () => {
		const {ctx, run, emitStatus} = makeCtx({runs: [SUCCESS], input: {auth: 'exploreSession', job: {...YOUTUBE_JOB, subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}}}, signedIn: false})
		const outcome = await SidecarSubsPhase(false).run(ctx)
		expect(outcome).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(run).not.toHaveBeenCalled()
		// No error-stage status: that would fail the queue item.
		expect(emitStatus.mock.calls.map(call => call[0])).not.toContain('error')
		expect(statusKeys(emitStatus)).not.toContain(STATUS_KEY.exploreSignedOut)
	})

	it('guards the subtitle-only spawn of an escalated job', async () => {
		const subtitleOnly: ResolvedStartDownloadInput['job'] = {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}}
		const {ctx, run, emitStatus} = makeCtx({runs: [SUCCESS], input: {auth: 'exploreSession', job: subtitleOnly}, signedIn: false})
		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome).toMatchObject({kind: 'hard-failed', error: {kind: 'loginRequired'}})
		expect(run).not.toHaveBeenCalled()
		expect(statusKeys(emitStatus)).toContain(STATUS_KEY.exploreSignedOut)
	})

	it('lets an anonymous job spawn without consulting the gate', async () => {
		const {ctx, run, canEscalate} = makeCtx({runs: [SUCCESS]})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(run).toHaveBeenCalledOnce()
		expect(canEscalate).not.toHaveBeenCalled()
	})
})

// A2-3: a run that succeeded although yt-dlp dropped the account cookies.
describe('rejected cookies on a run that succeeded', () => {
	const REJECTED_BUT_DONE: YtDlpResult = {...SUCCESS, accountCookiesRejected: true}

	it('checks the session (so a signed-out one gets reported) but keeps the finished download', async () => {
		for (const verified of ['signedIn', 'signedOut', 'unknown'] as const) {
			const {ctx, run, emitStatus, verifySignedIn} = makeCtx({runs: [REJECTED_BUT_DONE], input: {auth: 'exploreSession'}, signedIn: true, verified})
			expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
			expect(verifySignedIn).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'})
			expect(run).toHaveBeenCalledOnce()
			expect(emitStatus.mock.calls.map(call => call[0])).not.toContain('error')
		}
	})

	// M1: the finished download does not wait on the page load.
	it('does not hold the finished download while the check is still running', async () => {
		const {ctx, verifySignedIn} = makeCtx({runs: [REJECTED_BUT_DONE], input: {auth: 'exploreSession'}, signedIn: true})
		verifySignedIn.mockImplementation(() => new Promise<ExploreSignInState>(() => undefined))
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(verifySignedIn).toHaveBeenCalledOnce()
	})

	// M2: a sign-out the site confirmed stops the job's later signed-in spawns, cookies present or not.
	it('skips the sidecar subtitles once the check confirms the session signed out', async () => {
		const job = {...YOUTUBE_JOB, subtitles: {languages: ['en'], mode: 'sidecar' as const, format: 'srt' as const, writeAuto: false}}
		const {ctx, run} = makeCtx({runs: [REJECTED_BUT_DONE, SUCCESS], input: {auth: 'exploreSession', job}, signedIn: true, verified: 'signedOut'})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(run).toHaveBeenCalledOnce()
	})

	it('still fetches the sidecar subtitles when the check finds the session signed in', async () => {
		const job = {...YOUTUBE_JOB, subtitles: {languages: ['en'], mode: 'sidecar' as const, format: 'srt' as const, writeAuto: false}}
		const {ctx, run} = makeCtx({runs: [REJECTED_BUT_DONE, SUCCESS], input: {auth: 'exploreSession', job}, signedIn: true, verified: 'signedIn'})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'completed'})
		expect(identities(run)).toEqual(['exploreSession', 'exploreSession'])
	})

	it('keeps sidecar subtitles that arrived anyway', async () => {
		const {ctx, run, verifySignedIn} = makeCtx({runs: [REJECTED_BUT_DONE], input: {auth: 'exploreSession', job: {...YOUTUBE_JOB, subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}}}, signedIn: true, verified: 'signedOut'})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'completed'})
		expect(verifySignedIn).toHaveBeenCalledOnce()
		expect(run).toHaveBeenCalledOnce()
	})
})

describe('rejected cookies on a sidecar subtitle fetch', () => {
	const SUBS_JOB: ResolvedStartDownloadInput['job'] = {...YOUTUBE_JOB, subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}}

	it('soft-fails, keeping the saved video, when the session turns out signed out', async () => {
		const {ctx, run, emitStatus, verifySignedIn} = makeCtx({runs: [COOKIES_REJECTED], input: {auth: 'exploreSession', job: SUBS_JOB}, signedIn: true, verified: 'signedOut'})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(verifySignedIn).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'})
		expect(run).toHaveBeenCalledOnce()
		expect(emitStatus.mock.calls.map(call => call[0])).not.toContain('error')
	})

	it('retries once, signed in, when the session is still good', async () => {
		const {ctx, run} = makeCtx({runs: [COOKIES_REJECTED, SUCCESS], input: {auth: 'exploreSession', job: SUBS_JOB}, signedIn: true, verified: 'signedIn'})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'completed'})
		expect(identities(run)).toEqual(['exploreSession', 'exploreSession'])
	})
})

// A2-6: subtitle-only jobs escalate at download time like the video phase.
describe('SubtitleOnlyPhase download-time escalation', () => {
	const SUBTITLE_ONLY: ResolvedStartDownloadInput['job'] = {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}}

	it('escalates an anonymous account failure, persisting the signed-in auth before the spawn', async () => {
		const {ctx, run, emitStatus, canEscalate} = makeCtx({runs: [LOGIN_REQUIRED, SUCCESS], input: {job: SUBTITLE_ONLY}, signedIn: true})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'completed'})
		expect(identities(run)).toEqual(['configured', 'exploreSession'])
		// The signed-in spawn counts against the job's signed-in budget.
		expect(run.mock.calls[1]?.[2]).toEqual({identity: 'exploreSession', jobKey: 'job-1'})
		expect(canEscalate).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'})
		const signingIn = emitStatus.mock.calls.findIndex(call => call[0] === 'download' && call[1] === STATUS_KEY.signingInWithExplore)
		expect(signingIn).toBeGreaterThanOrEqual(0)
		expect(emitStatus.mock.invocationCallOrder[signingIn]).toBeLessThan(run.mock.invocationCallOrder[1])
		// Sticky: the job stays signed in.
		expect(ctx.active.input.auth).toBe('exploreSession')
	})

	it('escalates a YouTube bot wall the PoT ladder could not get past', async () => {
		const {ctx, run} = makeCtx({runs: [BOT_WALL, SUCCESS], input: {job: SUBTITLE_ONLY}, signedIn: true})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'completed'})
		expect(identities(run)).toEqual(['configured', 'exploreSession'])
	})

	it('does not escalate when the gate refuses, nor a failure an account cannot fix', async () => {
		const refused = makeCtx({runs: [LOGIN_REQUIRED], input: {job: SUBTITLE_ONLY}, signedIn: false})
		expect(await SubtitleOnlyPhase.run(refused.ctx)).toMatchObject({kind: 'hard-failed', error: {kind: 'loginRequired'}})
		expect(refused.run).toHaveBeenCalledOnce()
		const network = makeCtx({runs: [NETWORK], input: {job: SUBTITLE_ONLY}, signedIn: true})
		expect((await SubtitleOnlyPhase.run(network.ctx)).kind).toBe('hard-failed')
		expect(network.canEscalate).not.toHaveBeenCalled()
	})

	it('does not spawn the escalation when the job is paused while the gate decides', async () => {
		const {ctx, run, canEscalate} = makeCtx({runs: [LOGIN_REQUIRED], input: {job: SUBTITLE_ONLY}, signedIn: true})
		canEscalate.mockImplementation(() => {
			ctx.active.pauseRequested = true
			return Promise.resolve(true)
		})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'paused'})
		expect(run).toHaveBeenCalledOnce()
	})

	it('fails signed out, never anonymous, when the escalated spawn is refused by the guard', async () => {
		const {ctx, run, emitStatus, canEscalate} = makeCtx({runs: [LOGIN_REQUIRED], input: {job: SUBTITLE_ONLY}, signedIn: true})
		// The escalation decision says yes; the pre-spawn guard right after says no.
		canEscalate.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
		expect(await SubtitleOnlyPhase.run(ctx)).toMatchObject({kind: 'hard-failed', error: {kind: 'loginRequired'}})
		expect(run).toHaveBeenCalledOnce()
		expect(statusKeys(emitStatus)).toContain(STATUS_KEY.exploreSignedOut)
	})

	it('handles rejected cookies on the escalated run: verify, then retry once', async () => {
		const {ctx, run, verifySignedIn} = makeCtx({runs: [LOGIN_REQUIRED, COOKIES_REJECTED, SUCCESS], input: {job: SUBTITLE_ONLY}, signedIn: true, verified: 'signedIn'})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'completed'})
		expect(verifySignedIn).toHaveBeenCalledOnce()
		expect(identities(run)).toEqual(['configured', 'exploreSession', 'exploreSession'])
	})
})
