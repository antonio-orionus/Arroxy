import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import {siteForJob} from '@shared/sites/index.js'
import type {SubtitleRequest} from '@shared/subtitleTracks.js'

vi.mock('@main/services/subtitlePostProcess.js', () => ({logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {resolveSubtitlePlan, subtitleEmbedTracks, subtitleRunIsEmpty, subtitleRunRequest, type SubtitleRun} from '@main/services/phases/subtitleTracks.js'

const YOUTUBE = siteForJob('youtube', 'https://www.youtube.com/watch?v=abc')
const VIMEO = siteForJob('vimeo', 'https://vimeo.com/1')

// A Japanese video on YouTube: a manual English track, its original-language
// caption under both keys, and a machine translation the plan must never pick.
const INFO = {subtitles: {en: [{ext: 'vtt', name: 'English'}]}, automatic_captions: {'ja-orig': [{ext: 'vtt'}], ja: [{ext: 'vtt'}], 'en-orig': [{ext: 'vtt'}], de: [{ext: 'vtt'}]}}

let dir: string
let infoJson: string
beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), 'arroxy-subtitle-plan-'))
	infoJson = join(dir, 'a.info.json')
	await writeFile(infoJson, JSON.stringify(INFO))
})
afterEach(async () => {
	await rm(dir, {recursive: true, force: true})
})

const options = (request: SubtitleRequest): SubtitleOptions => ({request, mode: 'sidecar', format: 'srt'})
const resolve = (request: SubtitleRequest, opts: {infoJsonPaths?: (string | undefined)[]; site?: typeof YOUTUBE} = {}): Promise<SubtitleRun> => resolveSubtitlePlan(options(request), {infoJsonPaths: opts.infoJsonPaths ?? [infoJson], site: opts.site ?? YOUTUBE, jobId: 'job'})

describe('resolveSubtitlePlan', () => {
	it("plans a languages request from the video's info-json, never a translation", async () => {
		const run = await resolve({kind: 'languages', languages: ['ja', 'de', 'en'], source: 'manual-first'})
		expect(run.kind).toBe('plan')
		expect(subtitleRunRequest(run, 'srt')).toEqual({languages: ['(?-i:ja)', '(?-i:en)'], format: 'srt', writeAuto: true})
	})

	it('asks only for automatic captions when the plan holds no manual track', async () => {
		const run = await resolve({kind: 'languages', languages: ['ja'], source: 'manual-first'})
		expect(subtitleRunRequest(run, 'vtt')).toEqual({languages: ['(?-i:ja)'], format: 'vtt', writeAuto: true, autoOnly: true})
	})

	it('asks for manual tracks only when the plan holds no automatic caption', async () => {
		const run = await resolve({kind: 'languages', languages: ['en'], source: 'manual-first'})
		expect(subtitleRunRequest(run, 'srt')).toEqual({languages: ['(?-i:en)'], format: 'srt', writeAuto: false})
	})

	it('takes the first readable info-json', async () => {
		const run = await resolve({kind: 'languages', languages: ['en'], source: 'manual-first'}, {infoJsonPaths: [undefined, join(dir, 'missing.info.json'), infoJson]})
		expect(run.kind).toBe('plan')
	})

	it("sends a languages request's codes as a pattern when no info-json is readable", async () => {
		const run = await resolve({kind: 'languages', languages: ['en'], source: 'auto-only'}, {infoJsonPaths: [undefined]})
		expect(run).toEqual({kind: 'pattern', languages: ['en'], fetch: {manual: false, auto: true}})
		expect(subtitleRunRequest(run, 'srt')).toMatchObject({writeAuto: true, autoOnly: true})
		expect(subtitleRunRequest(run, 'srt').languages[0]).toMatch(/^en\(/)
	})

	// A lazy extractor's info-json lists no subtitles until asked to write them.
	it('sends the pattern on a site whose info-json lists no subtitles up front', async () => {
		expect((await resolve({kind: 'languages', languages: ['en'], source: 'manual-first'}, {site: VIMEO})).kind).toBe('pattern')
	})

	it("plans picked tracks over the video's maps: an -orig caption beside the video's manual track keeps its key", async () => {
		const run = await resolve({
			kind: 'tracks',
			tracks: [
				{key: 'en-orig', auto: true},
				{key: 'de', auto: false}
			]
		})
		expect(subtitleRunRequest(run, 'srt').languages).toEqual(['(?-i:en-orig)', '(?-i:de)'])
	})

	it('plans picked tracks without an info-json from the picks themselves, an -orig key kept beside a manual pick', async () => {
		const run = await resolve(
			{
				kind: 'tracks',
				tracks: [
					{key: 'en', auto: false},
					{key: 'en-orig', auto: true},
					{key: 'ja-orig', auto: true}
				]
			},
			{infoJsonPaths: []}
		)
		expect(subtitleRunRequest(run, 'srt').languages).toEqual(['(?-i:en)', '(?-i:en-orig)', '(?-i:ja-orig)'])
	})

	// Without the video's lists, an unpicked uploaded English may exist: the bare key could fetch it instead.
	it("keeps an -orig pick's own key without an info-json when the plan fetches a manual track", async () => {
		const run = await resolve(
			{
				kind: 'tracks',
				tracks: [
					{key: 'en-orig', auto: true},
					{key: 'de', auto: false}
				]
			},
			{infoJsonPaths: []}
		)
		expect(subtitleRunRequest(run, 'srt').languages).toEqual(['(?-i:en-orig)', '(?-i:de)'])
	})

	// A queue row migrated from 0.7.2 asks for a bare key from either kind, as its old argv did.
	it('asks once, with both write flags, for a key picked as both kinds', async () => {
		const run = await resolve({
			kind: 'tracks',
			tracks: [
				{key: 'ja', auto: false},
				{key: 'ja', auto: true}
			]
		})
		expect(subtitleRunRequest(run, 'srt')).toEqual({languages: ['(?-i:ja)'], format: 'srt', writeAuto: true})
	})

	it('is empty when the video has none of the languages', async () => {
		const run = await resolve({kind: 'languages', languages: ['fr'], source: 'manual-first'})
		expect(subtitleRunIsEmpty(run)).toBe(true)
		expect(run.kind === 'plan' && run.plan.missing).toEqual(['fr'])
	})

	it('a pattern is never empty: yt-dlp alone knows what it matches', async () => {
		expect(subtitleRunIsEmpty(await resolve({kind: 'languages', languages: ['fr'], source: 'manual-first'}, {infoJsonPaths: []}))).toBe(false)
	})
})

describe('subtitleEmbedTracks', () => {
	it("tags each file with its planned track's language, and an -orig caption beside its manual track as Auto-generated", async () => {
		const run = await resolve({kind: 'languages', languages: ['en', 'ja'], source: 'manual-and-auto'})
		const names = new Map([['en', 'English']])
		expect(subtitleEmbedTracks(['/out/v.en.srt', '/out/v.en-orig.srt', '/out/v.ja.srt', '/out/v.xx.srt'], run, names)).toEqual([
			{path: '/out/v.en.srt', lang: 'en', name: 'English'},
			{path: '/out/v.en-orig.srt', lang: 'en', title: 'Auto-generated'},
			{path: '/out/v.ja.srt', lang: 'ja'},
			{path: '/out/v.xx.srt', lang: 'und'}
		])
	})

	it("matches a pattern run's files to the requested codes", () => {
		const run: SubtitleRun = {kind: 'pattern', languages: ['de'], fetch: {manual: true, auto: true}}
		expect(subtitleEmbedTracks(['/out/v.de-DE.srt', '/out/v.de-en.srt'], run, new Map())).toEqual([
			{path: '/out/v.de-DE.srt', lang: 'de'},
			{path: '/out/v.de-en.srt', lang: 'und'}
		])
	})
})
