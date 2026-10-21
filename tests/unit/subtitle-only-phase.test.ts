import {EventEmitter} from 'node:events'
import {access, mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {SubtitleOnlyPhase} from '@main/services/phases/SubtitleOnlyPhase.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, ResolvedStartDownloadInput} from '@shared/types.js'
import type {PreparedJob, SubtitleOptions} from '@shared/preparedJob.js'
import type {SubtitleRequest} from '@shared/subtitleTracks.js'
import type {YtDlpRequest, YtDlpResult, YtDlpRunOptions, YtDlpSignal} from '@main/services/YtDlp.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import {explorePorts} from '../helpers/explorePorts.js'

vi.mock('@main/services/subtitlePostProcess', () => ({postProcessSubtitleFiles: vi.fn().mockResolvedValue(undefined), muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ok: false}), logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {postProcessSubtitleFiles} from '@main/services/subtitlePostProcess.js'

const URL = 'https://www.youtube.com/watch?v=test'

// A Japanese video on YouTube, as the probe saved it: an uploaded English
// track, the Japanese caption under both its keys, and a German machine
// translation the plan never picks.
const YOUTUBE_INFO = {id: 'test', title: 'The Real Title', subtitles: {en: [{ext: 'vtt', name: 'English'}]}, automatic_captions: {'ja-orig': [{ext: 'vtt'}], ja: [{ext: 'vtt'}], de: [{ext: 'vtt'}]}}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const EXIT_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError: 'fail', stdout: '', stderr: ''}

const subs = (request: SubtitleRequest): SubtitleOptions => ({request, mode: 'sidecar', format: 'srt'})
const MANUAL_EN = subs({kind: 'tracks', tracks: [{key: 'en', auto: false}]})
const codes = (languages: string[]): SubtitleOptions => subs({kind: 'languages', languages, source: 'manual-first'})

let outDir: string
let probeInfoJsonPath: string
beforeEach(async () => {
	vi.clearAllMocks()
	outDir = await mkdtemp(join(tmpdir(), 'arroxy-subs-only-'))
	await mkdir(join(outDir, 'probe'), {recursive: true})
	probeInfoJsonPath = join(outDir, 'probe', 'probe.info.json')
	await writeFile(probeInfoJsonPath, JSON.stringify(YOUTUBE_INFO))
})
afterEach(async () => {
	await rm(outDir, {recursive: true, force: true})
})

function job(subtitles: SubtitleOptions, overrides: Partial<Extract<PreparedJob, {kind: 'subtitle-only'}>> = {}): ResolvedStartDownloadInput['job'] {
	return {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles, ...overrides}
}

function input(overrides: Partial<ResolvedStartDownloadInput> = {}): ResolvedStartDownloadInput {
	return {url: URL, outputDir: outDir, probeInfoJsonPath, job: job(MANUAL_EN), ...overrides}
}

interface FakeYtDlp {
	listing?: unknown
	listingResult?: YtDlpResult
	fetchResult?: YtDlpResult
}

// A listing prints the video's info-json; a subtitle run writes one file per
// key it was asked for and reports them, as yt-dlp's `requested_subtitles` does.
function fakeRun(fake: FakeYtDlp = {}) {
	return vi.fn(async (req: YtDlpRequest, _signal?: YtDlpSignal, _options?: YtDlpRunOptions): Promise<YtDlpResult> => {
		if (req.kind === 'subtitle-listing') return fake.listingResult ?? {...SUCCESS, stdout: JSON.stringify(fake.listing ?? YOUTUBE_INFO)}
		if (fake.fetchResult && fake.fetchResult.kind !== 'success') return fake.fetchResult
		if (req.kind === 'subtitles' && 'tracks' in req.subtitles && req.output.report?.subtitles) {
			const report = Object.fromEntries(req.subtitles.tracks.map(track => [track.key, {ext: 'srt', filepath: `video.${track.key}.srt`}]))
			await writeFile(req.output.report.subtitles, `${JSON.stringify(report)}\n`)
		}
		return fake.fetchResult ?? SUCCESS
	})
}

function makeCtx(opts: {input?: ResolvedStartDownloadInput; active?: Partial<ActiveDownload>; fake?: FakeYtDlp; signedIn?: boolean} = {}): PhaseContext {
	const jobRecord: DownloadJob = {id: 'job-1', url: URL, outputDir: outDir, status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
	const active: ActiveDownload = {
		job: jobRecord,
		input: opts.input ?? input(),
		controller: new AbortController(),
		get signal(): AbortSignal {
			return this.controller.signal
		},
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack(),
		...opts.active
	}
	return {active, signal: active.signal, register: d => active.disposables.defer(d), ytDlp: {run: fakeRun(opts.fake)} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts({signedIn: opts.signedIn})}
}

const runMock = (ctx: PhaseContext) => vi.mocked(ctx.ytDlp.run as ReturnType<typeof fakeRun>)
const runs = (ctx: PhaseContext) => runMock(ctx).mock.calls
const fetchRequest = (ctx: PhaseContext) => runs(ctx).find(([req]) => req.kind === 'subtitles')?.[0]

describe('SubtitleOnlyPhase: before anything runs', () => {
	it('parks a paused escalated job whose Explore session is gone instead of failing it', async () => {
		const ctx = makeCtx({input: input({auth: 'exploreSession'}), active: {pauseRequested: true}})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'paused'})
		expect(runs(ctx)).toHaveLength(0)
		expect(ctx.emitStatus).not.toHaveBeenCalled()
	})

	it('still fails a signed-out escalated job that is not paused', async () => {
		expect((await SubtitleOnlyPhase.run(makeCtx({input: input({auth: 'exploreSession'})}))).kind).toBe('hard-failed')
	})

	it('fails, naming the folder, when the temp folder cannot be made', async () => {
		await writeFile(join(outDir, '.arroxy-temp'), 'a file where the folder goes')
		const ctx = makeCtx()
		expect(await SubtitleOnlyPhase.run(ctx)).toMatchObject({kind: 'hard-failed', error: {kind: 'outputNotWritable'}})
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', STATUS_KEY.outputNotWritable, {dir: outDir}, expect.objectContaining({kind: 'outputNotWritable'}))
		expect(runs(ctx)).toHaveLength(0)
	})

	it('makes the job a temp folder and removes it when the job finalizes', async () => {
		const ctx = makeCtx()
		await SubtitleOnlyPhase.run(ctx)
		const {tempDir} = ctx.active
		expect(tempDir).toBe(join(outDir, '.arroxy-temp', 'job-1'))
		await ctx.active.disposables[Symbol.asyncDispose]()
		await expect(access(tempDir!)).rejects.toThrow()
	})
})

describe('SubtitleOnlyPhase: the fetch', () => {
	it("fetches the planned tracks from the probe's info-json and asks for a report in the temp folder", async () => {
		const ctx = makeCtx({input: input({job: job(MANUAL_EN, {filenameTemplate: '{title} [{id}]'})})})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'completed'})
		const tempDir = join(outDir, '.arroxy-temp', 'job-1')
		expect(runs(ctx)).toHaveLength(1)
		expect(fetchRequest(ctx)).toEqual({
			kind: 'subtitles',
			url: URL,
			output: {directory: outDir, subtitleMode: 'sidecar', template: '%(title).40B [%(id)s].%(ext)s', report: {subtitles: join(tempDir, '_arroxy.subtitles.report.json')}},
			subtitles: {tracks: [{key: 'en', auto: false}], format: 'srt'},
			loadInfoJsonPath: probeInfoJsonPath
		})
	})

	it('runs anonymously by default and with the Explore session for an escalated job', async () => {
		const anonymous = makeCtx()
		await SubtitleOnlyPhase.run(anonymous)
		expect(runs(anonymous)[0]?.[2]).toEqual({identity: 'configured', jobKey: 'job-1'})

		const signedIn = makeCtx({input: input({auth: 'exploreSession'}), signedIn: true})
		await SubtitleOnlyPhase.run(signedIn)
		expect(runs(signedIn)[0]?.[2]).toEqual({identity: 'exploreSession', jobKey: 'job-1'})
	})

	it('asks for exactly the tracks the Format screen would pick, never a machine translation', async () => {
		const ctx = makeCtx({input: input({job: job(codes(['en', 'ja', 'de']))})})
		await SubtitleOnlyPhase.run(ctx)
		expect(fetchRequest(ctx)).toMatchObject({
			subtitles: {
				tracks: [
					{key: 'en', auto: false},
					{key: 'ja', auto: true}
				]
			}
		})
	})

	it('takes the written files from the report and names the row from the info-json', async () => {
		const ctx = makeCtx({input: input({job: job(codes(['en']))})})
		await SubtitleOnlyPhase.run(ctx)
		expect(ctx.active.subtitlePaths).toEqual([join(outDir, 'video.en.srt')])
		expect(ctx.active.mediaTitle).toBe('The Real Title')
	})

	it('post-processes every file, rolling-cue dedupe for the automatic captions alone', async () => {
		const mixed = makeCtx({input: input({job: job(codes(['en', 'ja']))})})
		await SubtitleOnlyPhase.run(mixed)
		expect(postProcessSubtitleFiles).toHaveBeenCalledWith([join(outDir, 'video.en.srt'), join(outDir, 'video.ja.srt')], expect.objectContaining({extractor: 'youtube', url: URL, jobId: 'job-1', rollingDedupe: [join(outDir, 'video.ja.srt')]}))
		const shouldAbort = vi.mocked(postProcessSubtitleFiles).mock.calls[0]?.[1].shouldAbort
		expect(shouldAbort?.()).toBe(false)
		mixed.active.cancelRequested = true
		expect(shouldAbort?.()).toBe(true)

		vi.mocked(postProcessSubtitleFiles).mockClear()
		await SubtitleOnlyPhase.run(makeCtx())
		expect(postProcessSubtitleFiles).toHaveBeenCalledWith([join(outDir, 'video.en.srt')], expect.objectContaining({rollingDedupe: []}))
	})

	// yt-dlp reports every file it wrote or found already present: none means nothing was saved.
	it('fails a fetch that reports no written files', async () => {
		const ctx = makeCtx()
		runMock(ctx).mockResolvedValue(SUCCESS)
		expect(await SubtitleOnlyPhase.run(ctx)).toMatchObject({kind: 'hard-failed', error: {kind: 'unknown'}})
	})

	// yt-dlp appends to the report, so an earlier attempt's would answer for this run.
	it('fails without fetching when an earlier report cannot be removed', async () => {
		await mkdir(join(outDir, '.arroxy-temp', 'job-1', '_arroxy.subtitles.report.json'), {recursive: true})
		const ctx = makeCtx({active: {tempDir: join(outDir, '.arroxy-temp', 'job-1')}})
		expect(await SubtitleOnlyPhase.run(ctx)).toMatchObject({kind: 'hard-failed', error: {kind: 'outputNotWritable'}})
		expect(fetchRequest(ctx)).toBeUndefined()
	})

	it('a failed fetch is a hard failure with the classified error', async () => {
		const ctx = makeCtx({fake: {fetchResult: EXIT_ERROR}})
		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('unknown')
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({kind: 'unknown'}))
	})

	it('marks a fetch that used the extractor fallback', async () => {
		const ctx = makeCtx({fake: {fetchResult: {...SUCCESS, usedExtractorFallback: true}}})
		await SubtitleOnlyPhase.run(ctx)
		expect(ctx.active.usedExtractorFallback).toBe(true)
	})

	it('parks a job paused during the fetch, and ends a cancelled one as cancelled', async () => {
		const paused = makeCtx()
		runMock(paused).mockImplementationOnce(async () => {
			paused.active.pauseRequested = true
			return EXIT_ERROR
		})
		expect((await SubtitleOnlyPhase.run(paused)).kind).toBe('paused')

		const cancelled = makeCtx()
		runMock(cancelled).mockImplementationOnce(async () => {
			cancelled.active.cancelRequested = true
			return SUCCESS
		})
		expect((await SubtitleOnlyPhase.run(cancelled)).kind).toBe('cancelled')
	})

	it('reports token minting, and nothing when no token is minted', async () => {
		const minting = makeCtx()
		runMock(minting).mockImplementationOnce(async (_req, signal) => {
			signal?.onMinting?.(0)
			signal?.onMinting?.(1)
			return SUCCESS
		})
		await SubtitleOnlyPhase.run(minting)
		expect(minting.emitStatus).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken)
		expect(minting.emitStatus).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken)

		const quiet = makeCtx()
		await SubtitleOnlyPhase.run(quiet)
		expect(quiet.emitStatus).not.toHaveBeenCalledWith('token', expect.anything())
	})

	it('holds the spawned process, kills it on finalize, and says it is fetching subtitles', async () => {
		const fakeProc = Object.assign(new EventEmitter(), {kill: vi.fn()})
		const ctx = makeCtx()
		runMock(ctx).mockImplementationOnce(async (_req, signal) => {
			signal?.onSpawn?.(fakeProc as never, outDir)
			return SUCCESS
		})
		await SubtitleOnlyPhase.run(ctx)
		expect(ctx.active.ytDlpProcess).toBe(fakeProc)
		expect(ctx.emitStatus).toHaveBeenCalledWith('download', STATUS_KEY.fetchingSubtitles)
	})
})

// A playlist entry is queued before its video is known and usually has no
// probe info-json; a site without eager lists has none worth reading.
describe('SubtitleOnlyPhase: the listing run', () => {
	it('lists the subtitles when no info-json is at hand, then fetches from the saved listing', async () => {
		const ctx = makeCtx({input: input({probeInfoJsonPath: undefined, job: job(codes(['ja']))})})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'completed'})
		expect(runs(ctx).map(([req]) => req.kind)).toEqual(['subtitle-listing', 'subtitles'])
		const listing = join(outDir, '.arroxy-temp', 'job-1', '_arroxy.subtitles.info.json')
		expect(fetchRequest(ctx)).toMatchObject({subtitles: {tracks: [{key: 'ja', auto: true}]}, loadInfoJsonPath: listing})
		expect(ctx.active.mediaTitle).toBe('The Real Title')
	})

	it('lists the subtitles on a site whose info-json lists them only when asked', async () => {
		const vimeo = input({url: 'https://vimeo.com/1', job: job(codes(['de']), {extractor: 'vimeo', extractorKey: 'Vimeo'})})
		const ctx = makeCtx({input: vimeo, fake: {listing: {id: '1', title: 'Clip', subtitles: {de: [{ext: 'vtt'}]}}}})
		await SubtitleOnlyPhase.run(ctx)
		expect(runs(ctx)[0]?.[0]).toEqual({kind: 'subtitle-listing', url: 'https://vimeo.com/1'})
		expect(fetchRequest(ctx)).toMatchObject({subtitles: {tracks: [{key: 'de', auto: false}]}})
	})

	it("keeps the listing's JSON out of progress parsing and the job log", async () => {
		const ctx = makeCtx({input: input({probeInfoJsonPath: undefined, job: job(codes(['ja']))})})
		runMock(ctx).mockImplementationOnce(async (_req, signal) => {
			signal?.onStdout?.(JSON.stringify(YOUTUBE_INFO))
			return {...SUCCESS, stdout: JSON.stringify(YOUTUBE_INFO)}
		})
		await SubtitleOnlyPhase.run(ctx)
		expect(ctx.safeConsume).not.toHaveBeenCalled()
	})

	it('a failed listing is a hard failure and fetches nothing', async () => {
		const ctx = makeCtx({input: input({probeInfoJsonPath: undefined}), fake: {listingResult: EXIT_ERROR}})
		expect((await SubtitleOnlyPhase.run(ctx)).kind).toBe('hard-failed')
		expect(fetchRequest(ctx)).toBeUndefined()
	})

	it('a listing that prints no info-json is a hard failure', async () => {
		const ctx = makeCtx({input: input({probeInfoJsonPath: undefined}), fake: {listingResult: {...SUCCESS, stdout: 'not json'}}})
		const outcome = await SubtitleOnlyPhase.run(ctx)
		expect(outcome).toMatchObject({kind: 'hard-failed', error: {kind: 'parse'}})
		expect(fetchRequest(ctx)).toBeUndefined()
	})
})

// ADR 0016: a subtitles-only job none of whose languages is on the video leaves nothing usable.
describe('SubtitleOnlyPhase: languages the video lacks', () => {
	it('fails hard, naming the languages, without fetching', async () => {
		const ctx = makeCtx({input: input({job: job(codes(['de', 'fr']))})})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'hard-failed', error: {kind: 'noSubtitles', raw: 'No subtitles in the requested languages: de, fr', languageCodes: ['de', 'fr']}})
		expect(runs(ctx)).toHaveLength(0)
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', STATUS_KEY.noSubtitles, {languageCodes: 'de,fr'}, expect.objectContaining({kind: 'noSubtitles'}))
	})

	it('saves the languages the video has and names the rest', async () => {
		const ctx = makeCtx({input: input({job: job(codes(['en', 'fr']))})})
		expect(await SubtitleOnlyPhase.run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitleLanguagesMissingOthersSaved, params: {languageCodes: 'fr'}})
		expect(fetchRequest(ctx)).toMatchObject({subtitles: {tracks: [{key: 'en', auto: false}]}})
	})

	it('a failed fetch still fails the job', async () => {
		expect((await SubtitleOnlyPhase.run(makeCtx({input: input({job: job(codes(['en', 'fr']))}), fake: {fetchResult: EXIT_ERROR}}))).kind).toBe('hard-failed')
	})
})
