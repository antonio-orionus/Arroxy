import {EventEmitter} from 'node:events'
import {access, mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {SidecarSubsPhase} from '@main/services/phases/SidecarSubsPhase.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, ResolvedStartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions, SubtitleOptions} from '@shared/preparedJob.js'
import type {SubtitleRequest} from '@shared/subtitleTracks.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import type {YtDlpRequest, YtDlpResult, YtDlpRunOptions, YtDlpSignal} from '@main/services/YtDlp.js'
import {explorePorts} from '../helpers/explorePorts.js'

vi.mock('@main/services/subtitlePostProcess', () => ({postProcessSubtitleFiles: vi.fn().mockResolvedValue(undefined), muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ok: true, outputPath: '/tmp/video.mkv'}), logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {postProcessSubtitleFiles, muxSubtitlesIntoVideo} from '@main/services/subtitlePostProcess.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const URL = 'https://www.youtube.com/watch?v=test'

// A Japanese video on YouTube: an uploaded English track, the Japanese caption
// under both its keys, and German, a machine translation the plan never picks.
const YOUTUBE_INFO = {id: 'test', title: 'Video', subtitles: {en: [{ext: 'vtt', name: 'English'}]}, automatic_captions: {'ja-orig': [{ext: 'vtt', name: 'Japanese (Original)'}], ja: [{ext: 'vtt', name: 'Japanese'}], de: [{ext: 'vtt', name: 'German'}], 'en-orig': [{ext: 'vtt', name: 'English (Original)'}]}}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const EXIT_ERROR: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError: 'fail', stdout: '', stderr: ''}

const subs = (request: SubtitleRequest, mode: SubtitleOptions['mode'] = 'sidecar'): SubtitleOptions => ({request, mode, format: 'srt'})
const MANUAL_EN = subs({kind: 'tracks', tracks: [{key: 'en', auto: false}]})
const codes = (languages: string[], source: 'manual-first' | 'manual-and-auto' = 'manual-first'): SubtitleOptions => subs({kind: 'languages', languages, source})

let outDir: string
let tempDir: string
beforeEach(async () => {
	vi.clearAllMocks()
	outDir = await mkdtemp(join(tmpdir(), 'arroxy-sidecar-'))
	tempDir = join(outDir, '.arroxy-temp', 'job')
	await mkdir(tempDir, {recursive: true})
	await writeFile(join(tempDir, '_arroxy.info.json'), JSON.stringify(YOUTUBE_INFO))
})
afterEach(async () => {
	await rm(outDir, {recursive: true, force: true})
})

function job(subtitles: SubtitleOptions, overrides: Partial<Extract<PreparedJob, {kind: 'single-format'}>> = {}): ResolvedStartDownloadInput['job'] {
	return {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles, ...overrides}
}

function input(overrides: Partial<ResolvedStartDownloadInput> = {}): ResolvedStartDownloadInput {
	return {url: URL, outputDir: outDir, job: job(MANUAL_EN), ...overrides}
}

interface FakeYtDlp {
	listing?: unknown
	listingResult?: YtDlpResult
	fetchResult?: YtDlpResult
}

// A listing prints the video's info-json; a subtitle run writes one file per
// key it was asked for and reports them, as yt-dlp's `requested_subtitles`
// does after `--convert-subs`: with no track names.
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

function makeCtx(opts: {input?: ResolvedStartDownloadInput; active?: Partial<ActiveDownload>; fake?: FakeYtDlp; ffmpegPath?: string | null; signedIn?: boolean} = {}): PhaseContext {
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
		mediaPath: join(outDir, 'video.mp4'),
		tempDir,
		disposables: new AsyncStack(),
		...opts.active
	}
	return {
		active,
		signal: active.signal,
		register: d => active.disposables.defer(d),
		ytDlp: {run: fakeRun(opts.fake), ffmpegPath: opts.ffmpegPath === undefined ? '/fake/ffmpeg' : opts.ffmpegPath} as never,
		emitStatus: vi.fn(),
		safeConsume: vi.fn(),
		cookielessRetry: new CookielessRetry(),
		...explorePorts({signedIn: opts.signedIn})
	}
}

const runMock = (ctx: PhaseContext) => vi.mocked(ctx.ytDlp.run as ReturnType<typeof fakeRun>)
const runs = (ctx: PhaseContext) => runMock(ctx).mock.calls
const fetchRequest = (ctx: PhaseContext) => runs(ctx).find(([req]) => req.kind === 'subtitles')?.[0]

describe('SidecarSubsPhase: before anything runs', () => {
	it('parks a paused escalated job whose Explore session is gone instead of soft-failing it', async () => {
		const ctx = makeCtx({input: input({auth: 'exploreSession'}), active: {pauseRequested: true}})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'paused'})
		expect(runs(ctx)).toHaveLength(0)
	})

	it('cancels rather than soft-failing a cancelled escalated job whose session is gone', async () => {
		expect(await SidecarSubsPhase(false).run(makeCtx({input: input({auth: 'exploreSession'}), active: {cancelRequested: true}}))).toEqual({kind: 'cancelled'})
	})

	it('soft-fails a signed-out escalated job that is not interrupted', async () => {
		expect(await SidecarSubsPhase(false).run(makeCtx({input: input({auth: 'exploreSession'})}))).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
	})

	it('soft-fails without a temp folder for the listing and the report', async () => {
		const ctx = makeCtx({active: {tempDir: undefined}})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(runs(ctx)).toHaveLength(0)
	})
})

describe('SidecarSubsPhase: the fetch', () => {
	it("fetches the planned tracks from the media run's info-json and asks for a report in the temp folder", async () => {
		const ctx = makeCtx({input: input({job: job(MANUAL_EN, {filenameTemplate: '{title} [{id}]', sponsorBlock: {mode: 'remove', categories: ['sponsor']}})})})
		await SidecarSubsPhase(false).run(ctx)
		expect(runs(ctx)).toHaveLength(1)
		expect(fetchRequest(ctx)).toEqual({
			kind: 'subtitles',
			url: URL,
			output: {directory: outDir, subtitleMode: 'sidecar', template: '%(title).120B [%(id)s].%(ext)s', report: {subtitles: join(tempDir, '_arroxy.subtitles.report.json')}},
			subtitles: {tracks: [{key: 'en', auto: false}], format: 'srt'},
			loadInfoJsonPath: join(tempDir, '_arroxy.info.json')
		})
	})

	it('runs anonymously by default and with the Explore session for an escalated job, through a cooldown', async () => {
		const anonymous = makeCtx()
		await SidecarSubsPhase(false).run(anonymous)
		expect(runs(anonymous)[0]?.[2]).toEqual({identity: 'configured', jobKey: 'job-1', honorCooldown: false})

		const signedIn = makeCtx({input: input({auth: 'exploreSession'}), signedIn: true})
		await SidecarSubsPhase(false).run(signedIn)
		expect(runs(signedIn)[0]?.[2]).toEqual({identity: 'exploreSession', jobKey: 'job-1', honorCooldown: false})
	})

	it('asks for exactly the tracks the Format screen would pick, never a machine translation', async () => {
		const ctx = makeCtx({input: input({job: job(codes(['en', 'ja', 'de']))})})
		await SidecarSubsPhase(false).run(ctx)
		expect(fetchRequest(ctx)).toMatchObject({
			subtitles: {
				tracks: [
					{key: 'en', auto: false},
					{key: 'ja', auto: true}
				]
			}
		})
	})

	it('emits fetchingSubtitles before running', async () => {
		const ctx = makeCtx()
		await SidecarSubsPhase(false).run(ctx)
		expect(ctx.emitStatus).toHaveBeenCalledWith('download', STATUS_KEY.fetchingSubtitles)
	})

	it('takes the written files from the report, inside the output folder', async () => {
		const ctx = makeCtx({input: input({job: job(codes(['en', 'ja']))})})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'completed'})
		expect(ctx.active.subtitlePaths).toEqual([join(outDir, 'video.en.srt'), join(outDir, 'video.ja.srt')])
	})

	it('post-processes every file, rolling-cue dedupe for the automatic captions alone', async () => {
		await SidecarSubsPhase(false).run(makeCtx({input: input({job: job(codes(['en', 'ja']))})}))
		expect(postProcessSubtitleFiles).toHaveBeenCalledWith([join(outDir, 'video.en.srt'), join(outDir, 'video.ja.srt')], expect.objectContaining({extractor: 'youtube', url: URL, rollingDedupe: [join(outDir, 'video.ja.srt')]}))

		vi.mocked(postProcessSubtitleFiles).mockClear()
		await SidecarSubsPhase(false).run(makeCtx())
		expect(postProcessSubtitleFiles).toHaveBeenCalledWith([join(outDir, 'video.en.srt')], expect.objectContaining({rollingDedupe: []}))
	})

	// yt-dlp reports every file it wrote or found already present.
	it('soft-fails a fetch that reports no written files', async () => {
		const ctx = makeCtx()
		runMock(ctx).mockResolvedValue(SUCCESS)
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(postProcessSubtitleFiles).not.toHaveBeenCalled()
	})

	// yt-dlp appends to the report, so an earlier attempt's would answer for this run.
	it('soft-fails without fetching when an earlier report cannot be removed', async () => {
		await mkdir(join(tempDir, '_arroxy.subtitles.report.json'))
		const ctx = makeCtx()
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(fetchRequest(ctx)).toBeUndefined()
	})

	it("post-processing's shouldAbort reflects cancelRequested", async () => {
		const ctx = makeCtx({input: input({job: job(codes(['ja']))})})
		await SidecarSubsPhase(false).run(ctx)
		const shouldAbort = vi.mocked(postProcessSubtitleFiles).mock.calls[0]?.[1].shouldAbort
		expect(shouldAbort?.()).toBe(false)
		ctx.active.cancelRequested = true
		expect(shouldAbort?.()).toBe(true)
	})

	it('a failed fetch is the subtitle failure', async () => {
		expect(await SidecarSubsPhase(false).run(makeCtx({fake: {fetchResult: EXIT_ERROR}}))).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
	})

	it('marks a fetch that used the extractor fallback', async () => {
		const ctx = makeCtx({fake: {fetchResult: {...SUCCESS, usedExtractorFallback: true}}})
		await SidecarSubsPhase(false).run(ctx)
		expect(ctx.active.usedExtractorFallback).toBe(true)
	})

	it('parks a job paused during the fetch instead of soft-failing it', async () => {
		const ctx = makeCtx()
		runMock(ctx).mockImplementationOnce(async () => {
			ctx.active.pauseRequested = true
			return EXIT_ERROR
		})
		expect((await SidecarSubsPhase(false).run(ctx)).kind).toBe('paused')
	})

	it('does not mux without embedding', async () => {
		await SidecarSubsPhase(false).run(makeCtx())
		expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled()
	})
})

// Sites whose info-json lists subtitles only when asked to write them, and a
// job with no info-json at all, get the lists from a run of their own.
describe('SidecarSubsPhase: the listing run', () => {
	const vimeo = (subtitles: SubtitleOptions): ResolvedStartDownloadInput => input({url: 'https://vimeo.com/1', job: job(subtitles, {extractor: 'vimeo', extractorKey: 'Vimeo'})})
	const VIMEO_INFO = {id: '1', title: 'Clip', subtitles: {de: [{ext: 'vtt', name: 'Deutsch'}]}, automatic_captions: {}}

	it('lists the subtitles on a site without eager lists, then fetches from the saved listing', async () => {
		const ctx = makeCtx({input: vimeo(codes(['de'])), fake: {listing: VIMEO_INFO}})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'completed'})
		expect(runs(ctx).map(([req]) => req.kind)).toEqual(['subtitle-listing', 'subtitles'])
		expect(runs(ctx)[0]?.[0]).toEqual({kind: 'subtitle-listing', url: 'https://vimeo.com/1'})
		const listing = join(tempDir, '_arroxy.subtitles.info.json')
		await expect(access(listing)).resolves.toBeUndefined()
		expect(fetchRequest(ctx)).toMatchObject({subtitles: {tracks: [{key: 'de', auto: false}]}, loadInfoJsonPath: listing})
	})

	it('lists them on YouTube too when no info-json is readable', async () => {
		await rm(join(tempDir, '_arroxy.info.json'))
		const ctx = makeCtx({input: input({job: job(codes(['ja']))})})
		await SidecarSubsPhase(false).run(ctx)
		expect(runs(ctx).map(([req]) => req.kind)).toEqual(['subtitle-listing', 'subtitles'])
		expect(fetchRequest(ctx)).toMatchObject({subtitles: {tracks: [{key: 'ja', auto: true}]}})
	})

	it('soft-fails when the listing fails or prints no info-json, and fetches nothing', async () => {
		for (const listingResult of [EXIT_ERROR, {...SUCCESS, stdout: 'not json'}]) {
			const ctx = makeCtx({input: vimeo(codes(['de'])), fake: {listingResult}})
			expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
			expect(fetchRequest(ctx)).toBeUndefined()
		}
	})
})

// ADR 0016: the video is saved, so the job ends with a notice naming what it lacks.
describe('SidecarSubsPhase: languages the video lacks', () => {
	it('keeps the video and names the languages without fetching when the video has none of them', async () => {
		const ctx = makeCtx({input: input({job: job(codes(['fr']))})})
		expect(await SidecarSubsPhase(false).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitleLanguagesMissing, params: {languageCodes: 'fr'}})
		expect(runs(ctx)).toHaveLength(0)
	})

	it('fetches the languages the video has, then names the rest', async () => {
		expect(await SidecarSubsPhase(false).run(makeCtx({input: input({job: job(codes(['en', 'fr']))})}))).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitleLanguagesMissing, params: {languageCodes: 'fr'}})
	})

	it('embeds the languages the video has, then names the rest; a failed mux is the subtitle failure', async () => {
		const embed = input({job: job(codes(['en', 'fr']))})
		expect(await SidecarSubsPhase(true).run(makeCtx({input: embed}))).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitleLanguagesMissing, params: {languageCodes: 'fr'}})
		expect(muxSubtitlesIntoVideo).toHaveBeenCalledOnce()

		vi.mocked(muxSubtitlesIntoVideo).mockResolvedValueOnce({ok: false})
		expect(await SidecarSubsPhase(true).run(makeCtx({input: embed}))).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
	})
})

describe('SidecarSubsPhase(embedAfter=true)', () => {
	const muxOpts = () => vi.mocked(muxSubtitlesIntoVideo).mock.calls[0]?.[0]

	it("hands the mux each reported file with its planned track's language and yt-dlp's name for it from the lists", async () => {
		await SidecarSubsPhase(true).run(makeCtx({input: input({job: job(codes(['en', 'ja']))})}))
		expect(muxOpts()?.tracks).toEqual([
			{path: join(outDir, 'video.en.srt'), lang: 'en', name: 'English'},
			{path: join(outDir, 'video.ja.srt'), lang: 'ja', name: 'Japanese'}
		])
	})

	it('titles the automatic caption beside an uploaded track of its language apart', async () => {
		await SidecarSubsPhase(true).run(makeCtx({input: input({job: job(codes(['en'], 'manual-and-auto'))})}))
		expect(muxOpts()?.tracks).toEqual([
			{path: join(outDir, 'video.en.srt'), lang: 'en', name: 'English'},
			{path: join(outDir, 'video.en-orig.srt'), lang: 'en', name: 'English (Original)', title: 'Auto-generated'}
		])
	})

	it('keeps the cover art only when the job embeds the thumbnail', async () => {
		await SidecarSubsPhase(true).run(makeCtx())
		expect(vi.mocked(muxSubtitlesIntoVideo).mock.calls[0]?.[0].keepCoverArt).toBe(false)
		await SidecarSubsPhase(true).run(makeCtx({input: input({job: job(MANUAL_EN, {embed: {...EMBED_OFF, thumbnail: true}})})}))
		expect(vi.mocked(muxSubtitlesIntoVideo).mock.calls[1]?.[0].keepCoverArt).toBe(true)
	})

	it('a muxed file becomes the media path', async () => {
		vi.mocked(muxSubtitlesIntoVideo).mockResolvedValueOnce({ok: true, outputPath: join(outDir, 'video.mkv')})
		const ctx = makeCtx()
		expect(await SidecarSubsPhase(true).run(ctx)).toEqual({kind: 'completed'})
		expect(ctx.active.mediaPath).toBe(join(outDir, 'video.mkv'))
	})

	it('soft-fails without muxing when ffmpeg, the video or the reported files are missing', async () => {
		const noFiles = makeCtx()
		runMock(noFiles).mockResolvedValue(SUCCESS)
		for (const ctx of [makeCtx({ffmpegPath: null}), makeCtx({active: {mediaPath: undefined}}), noFiles]) expect(await SidecarSubsPhase(true).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled()
	})

	it('a failed mux leaves the media path and soft-fails', async () => {
		vi.mocked(muxSubtitlesIntoVideo).mockResolvedValueOnce({ok: false})
		const ctx = makeCtx()
		const before = ctx.active.mediaPath
		expect(await SidecarSubsPhase(true).run(ctx)).toEqual({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})
		expect(ctx.active.mediaPath).toBe(before)
	})

	it('parks a job paused during the mux instead of completing it', async () => {
		const ctx = makeCtx()
		vi.mocked(muxSubtitlesIntoVideo).mockImplementationOnce(async opts => {
			opts.onSpawn(Object.assign(new EventEmitter(), {kill: vi.fn()}) as never)
			ctx.active.pauseRequested = true
			return {ok: true, outputPath: '/tmp/video.mkv'}
		})
		expect((await SidecarSubsPhase(true).run(ctx)).kind).toBe('paused')
	})

	it('emits mergingFormats before the mux', async () => {
		const ctx = makeCtx()
		await SidecarSubsPhase(true).run(ctx)
		expect(ctx.emitStatus).toHaveBeenCalledWith('download', STATUS_KEY.mergingFormats)
	})

	it("holds the mux's ffmpeg process while it runs and clears it after", async () => {
		let during: unknown
		const ctx = makeCtx()
		vi.mocked(muxSubtitlesIntoVideo).mockImplementationOnce(async opts => {
			opts.onSpawn(new EventEmitter() as never)
			during = ctx.active.ffmpegProcess
			return {ok: true, outputPath: '/tmp/video.mkv'}
		})
		await SidecarSubsPhase(true).run(ctx)
		expect(during).toBeDefined()
		expect(ctx.active.ffmpegProcess).toBeUndefined()
	})
})
