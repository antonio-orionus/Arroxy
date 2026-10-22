import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import {siteForJob} from '@shared/sites/index.js'
import type {SubtitleRequest} from '@shared/subtitleTracks.js'

vi.mock('@main/services/subtitlePostProcess.js', () => ({logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {automaticCaptionPaths, clearSubtitleReport, eagerSubtitleLists, missingSubtitles, planSubtitleRun, readSubtitleReport, saveSubtitleListing, subtitleEmbedTracks, subtitleFetchRequest, subtitleReportFile, type SubtitleLists} from '@main/services/phases/subtitleTracks.js'

const YOUTUBE = siteForJob('youtube', 'https://www.youtube.com/watch?v=abc')
const VIMEO = siteForJob('vimeo', 'https://vimeo.com/1')

// A Japanese video on YouTube: a manual English track, its original-language
// caption under both keys, and a machine translation the plan must never pick.
const INFO = {title: ' Video ', subtitles: {en: [{ext: 'vtt', name: 'English'}]}, automatic_captions: {'ja-orig': [{ext: 'vtt'}], ja: [{ext: 'vtt'}], 'en-orig': [{ext: 'vtt'}], de: [{ext: 'vtt'}]}}

let dir: string
let infoJson: string
beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), 'arroxy-subtitle-run-'))
	infoJson = join(dir, 'a.info.json')
	await writeFile(infoJson, JSON.stringify(INFO))
})
afterEach(async () => {
	await rm(dir, {recursive: true, force: true})
})

const options = (request: SubtitleRequest): SubtitleOptions => ({request, mode: 'sidecar', format: 'srt'})
const languages = (codes: string[], source: 'manual-first' | 'manual-and-auto' = 'manual-first'): SubtitleRequest => ({kind: 'languages', languages: codes, source})
async function lists(): Promise<SubtitleLists> {
	const found = await eagerSubtitleLists([infoJson], YOUTUBE)
	if (!found) throw new Error('fixture info-json unreadable')
	return found
}
const plan = async (request: SubtitleRequest) => planSubtitleRun(options(request), await lists(), {site: YOUTUBE, jobId: 'job'})

describe('eagerSubtitleLists', () => {
	it('reads the first readable info-json, with its title', async () => {
		const found = await eagerSubtitleLists([undefined, join(dir, 'missing.info.json'), infoJson], YOUTUBE)
		expect(found).toMatchObject({infoJsonPath: infoJson, title: 'Video'})
		expect(Object.keys(found?.automaticCaptions ?? {})).toContain('ja-orig')
	})

	// A lazy extractor's info-json lists no subtitles until asked to write them.
	it('reads nothing on a site whose info-json lists subtitles only when asked', async () => {
		expect(await eagerSubtitleLists([infoJson], VIMEO)).toBeNull()
	})

	it('reads nothing when no info-json is readable', async () => {
		await writeFile(infoJson, '{not json')
		expect(await eagerSubtitleLists([undefined, infoJson], YOUTUBE)).toBeNull()
	})
})

describe('saveSubtitleListing', () => {
	it("saves a listing's stdout in the temp folder for the fetch to load", async () => {
		const saved = await saveSubtitleListing(JSON.stringify(INFO), dir)
		expect(saved.kind === 'saved' ? saved.lists.infoJsonPath : saved.kind).toBe(join(dir, '_arroxy.subtitles.info.json'))
		expect(JSON.parse(await readFile(join(dir, '_arroxy.subtitles.info.json'), 'utf8'))).toEqual(INFO)
	})

	it('saves nothing that is not an info-json', async () => {
		expect(await saveSubtitleListing('[info] Downloading', dir)).toEqual({kind: 'not-info-json'})
	})

	// A full disk or a vanished folder is an answer, not a throw: the phase decides what it costs the job.
	it('says the listing could not be written instead of throwing', async () => {
		await mkdir(join(dir, '_arroxy.subtitles.info.json'))
		expect(await saveSubtitleListing(JSON.stringify(INFO), dir)).toMatchObject({kind: 'unwritable', raw: expect.stringContaining('_arroxy.subtitles.info.json')})
	})
})

describe('planSubtitleRun', () => {
	it("plans a languages request over the video's lists, never a translation", async () => {
		expect((await plan(languages(['ja', 'de', 'en']))).tracks.map(({requestKey, auto}) => ({requestKey, auto}))).toEqual([
			{requestKey: 'ja', auto: true},
			{requestKey: 'en', auto: false}
		])
	})

	it("plans picked tracks: an -orig caption beside the video's manual track keeps its key", async () => {
		const planned = await plan({
			kind: 'tracks',
			tracks: [
				{key: 'en-orig', auto: true},
				{key: 'en', auto: false}
			]
		})
		expect(planned.tracks.map(track => track.requestKey)).toEqual(['en-orig', 'en'])
	})
})

// ADR 0016's outcome when the video lacks requested languages, decided from the plan alone.
describe('missingSubtitles', () => {
	it('fails a subtitles-only job with none of its languages before anything is fetched, naming them', async () => {
		expect(missingSubtitles(await plan(languages(['fr', 'de'])), {subtitlesOnly: true})).toEqual({before: {kind: 'hard-failed', error: {kind: 'noSubtitles', raw: 'No subtitles in the requested languages: fr, de', languageCodes: ['fr', 'de']}}})
	})

	it('keeps the video of a job with media and names the languages it lacks', async () => {
		expect(missingSubtitles(await plan(languages(['fr'])), {subtitlesOnly: false})).toEqual({before: {kind: 'soft-failed', status: 'subtitleLanguagesMissing', params: {languageCodes: 'fr'}}})
	})

	it('fetches the languages the video has and names the rest afterwards', async () => {
		const planned = await plan(languages(['en', 'fr']))
		expect(missingSubtitles(planned, {subtitlesOnly: true})).toEqual({after: {kind: 'soft-failed', status: 'subtitleLanguagesMissingOthersSaved', params: {languageCodes: 'fr'}}})
		expect(missingSubtitles(planned, {subtitlesOnly: false})).toEqual({after: {kind: 'soft-failed', status: 'subtitleLanguagesMissing', params: {languageCodes: 'fr'}}})
	})

	it('says nothing when every language is on the video', async () => {
		expect(missingSubtitles(await plan(languages(['en'])), {subtitlesOnly: true})).toEqual({})
	})

	it('ends a request for no tracks at all as complete', async () => {
		expect(missingSubtitles(await plan({kind: 'tracks', tracks: []}), {subtitlesOnly: true})).toEqual({before: {kind: 'completed'}})
	})
})

describe('subtitleFetchRequest', () => {
	it("asks for the plan's keys from the lists' info-json, with a report in the temp folder", async () => {
		const request = subtitleFetchRequest(await plan(languages(['en', 'ja'])), {url: 'https://www.youtube.com/watch?v=abc', output: {directory: dir, subtitleMode: 'subfolder'}, format: 'vtt', lists: await lists(), tempDir: join(dir, 'tmp')})
		expect(request).toEqual({
			kind: 'subtitles',
			url: 'https://www.youtube.com/watch?v=abc',
			output: {directory: dir, subtitleMode: 'subfolder', report: {subtitles: join(dir, 'tmp', '_arroxy.subtitles.report.json')}},
			subtitles: {
				tracks: [
					{key: 'en', auto: false},
					{key: 'ja', auto: true}
				],
				format: 'vtt'
			},
			loadInfoJsonPath: infoJson
		})
	})
})

describe('readSubtitleReport', () => {
	it("takes each written file from yt-dlp's last report line, relative to the run's folder", async () => {
		const report = subtitleReportFile(dir)
		await writeFile(report, `${JSON.stringify({en: {filepath: 'old.en.srt'}})}\n${JSON.stringify({en: {ext: 'srt', filepath: 'subtitles/v.en.srt'}, ja: {ext: 'srt', filepath: join(dir, 'v.ja.srt')}, de: {ext: 'srt'}})}\n`)
		expect(await readSubtitleReport(report, dir, 'job')).toEqual([
			{key: 'en', path: join(dir, 'subtitles', 'v.en.srt')},
			{key: 'ja', path: join(dir, 'v.ja.srt')}
		])
	})

	it('reads nothing from a missing, empty, unparsable or null report', async () => {
		const report = subtitleReportFile(dir)
		expect(await readSubtitleReport(report, dir, 'job')).toEqual([])
		for (const text of ['', '{oops', 'null\n']) {
			await writeFile(report, text)
			expect(await readSubtitleReport(report, dir, 'job')).toEqual([])
		}
	})

	// yt-dlp appends, so a report left by an earlier attempt would answer for this run.
	it('is cleared before a run', async () => {
		await writeFile(subtitleReportFile(dir), JSON.stringify({en: {filepath: 'old.en.srt'}}))
		expect(await clearSubtitleReport(dir, 'job')).toBe(true)
		expect(await readSubtitleReport(subtitleReportFile(dir), dir, 'job')).toEqual([])
	})
})

describe('reported files and the plan', () => {
	const reported = [
		{key: 'en', path: '/out/v.en.srt'},
		{key: 'en-orig', path: '/out/v.en-orig.srt'},
		{key: 'xx', path: '/out/v.xx.srt'}
	]

	// `--convert-subs` drops the name from the report, so it comes from the lists.
	it("tags each file with its planned track's language and its name in the lists, and an -orig caption beside its manual track as Auto-generated", async () => {
		expect(subtitleEmbedTracks(reported, await plan(languages(['en'], 'manual-and-auto')), {lists: await lists(), format: 'srt'})).toEqual([
			{path: '/out/v.en.srt', lang: 'en', name: 'English'},
			{path: '/out/v.en-orig.srt', lang: 'en', title: 'Auto-generated'},
			{path: '/out/v.xx.srt', lang: 'und'}
		])
	})

	// yt-dlp keys a track uploaded with a name of its own by YouTube's vssId.
	it('titles an English caption Auto-generated beside an English track uploaded under a name of its own', async () => {
		const named: SubtitleLists = {...(await lists()), subtitles: {'en-nP7-2PuUl7o': [{ext: 'srt', name: 'English - en'}]}, automaticCaptions: {'en-orig': [{ext: 'srt', name: 'English (Original)'}], en: [{ext: 'srt', name: 'English'}]}}
		const planned = planSubtitleRun(options(languages(['en'], 'manual-and-auto')), named, {site: YOUTUBE, jobId: 'job'})
		const files = [
			{key: 'en-nP7-2PuUl7o', path: '/out/v.en-nP7-2PuUl7o.srt'},
			{key: 'en', path: '/out/v.en.srt'}
		]
		expect(subtitleEmbedTracks(files, planned, {lists: named, format: 'srt'})).toEqual([
			{path: '/out/v.en-nP7-2PuUl7o.srt', lang: 'en', name: 'English - en'},
			{path: '/out/v.en.srt', lang: 'en', name: 'English', title: 'Auto-generated'}
		])
	})

	it('names a track after the format the run fetched: the last in that format, else the last', async () => {
		const named = {
			...(await lists()),
			subtitles: {
				en: [
					{ext: 'srt', name: 'English srt 1'},
					{ext: 'srt', name: 'English srt 2'},
					{ext: 'vtt', name: 'English vtt'}
				]
			}
		}
		const planned = await plan(languages(['en']))
		expect(subtitleEmbedTracks([{key: 'en', path: '/out/v.en.srt'}], planned, {lists: named, format: 'srt'})[0]?.name).toBe('English srt 2')
		expect(subtitleEmbedTracks([{key: 'en', path: '/out/v.en.vtt'}], planned, {lists: named, format: 'ass'})[0]?.name).toBe('English vtt')
	})

	it("lists only the automatic captions' files for rolling-cue dedupe", async () => {
		expect(automaticCaptionPaths(reported, await plan(languages(['en'], 'manual-and-auto')))).toEqual(['/out/v.en-orig.srt'])
	})
})
