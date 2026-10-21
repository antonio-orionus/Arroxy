// Quick Download and the Format screen must fetch the same subtitle tracks for
// the same profile and video. Each path's job is planned by the subtitle
// phase's own steps over the recorded probe as its lists (the info-json on
// YouTube, a listing elsewhere), the fetch is planned by the bridge, and its
// argv is run through a model of yt-dlp's own track choice
// (`YoutubeDL.process_subtitles`: manual tracks first, automatic captions fill
// in, each `--sub-langs` entry fullmatched case-insensitively against the
// keys) over the recorded raw maps, so a track that is not the one planned,
// such as a machine translation, shows up here.

import {mkdtempSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi} from 'vite-plus/test'
import {DEFAULTS, defaultAppSettings} from '@shared/constants.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import {resolveProfileSelection} from '@shared/profileSelection.js'
import {siteForJob} from '@shared/sites/index.js'
import {EMPTY_FORMAT_SELECTION} from '@shared/ytdlp/selectableFormat.js'
import type {DownloadProfile, DownloadProfileSubtitleSource, QueueItem, VideoProbeResult} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import {probeSourceResult} from '@renderer/dev/probeSources/index.js'
import type {ProbeSourceId} from '@renderer/dev/probeSources/sources.js'
import {prepareActiveProfileQueueSubmission, prepareManualQueueSubmission} from '@renderer/store/wizard/queueSubmission.js'
import {profilePatch} from '@renderer/store/wizard/wizardProfileState.js'
import youtube2007 from '@renderer/dev/probeSources/youtube-2007.json' with {type: 'json'}
import youtube2010 from '@renderer/dev/probeSources/youtube-2010.json' with {type: 'json'}
import youtubeMusic from '@renderer/dev/probeSources/youtube-music.json' with {type: 'json'}
import youtubeMultilang from '@renderer/dev/probeSources/youtube-multilang.json' with {type: 'json'}
import youtubeAutodub from '@renderer/dev/probeSources/youtube-autodub.json' with {type: 'json'}
import dailymotion from '@renderer/dev/probeSources/dailymotion.json' with {type: 'json'}

vi.mock('@main/services/subtitlePostProcess.js', () => ({logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {eagerSubtitleLists, planSubtitleRun, saveSubtitleListing, subtitleFetchRequest} from '@main/services/phases/subtitleTracks.js'
import {planWorkflow} from 'yt-dlp-bridge'

interface RawMaps {
	subtitles?: Record<string, unknown>
	automatic_captions?: Record<string, unknown>
}

const SOURCES: [ProbeSourceId, {info: RawMaps}][] = [
	['youtube-2007', youtube2007],
	['youtube-2010', youtube2010],
	['youtube-music', youtubeMusic],
	['youtube-multilang', youtubeMultilang],
	['youtube-autodub', youtubeAutodub],
	['dailymotion', dailymotion]
]
const LANGUAGE_SETS = [['en'], ['de'], ['ja'], ['pt'], ['es', 'zh']]
const SUBTITLE_SOURCES: DownloadProfileSubtitleSource[] = ['manual-first', 'manual-and-auto', 'manual-only', 'auto-only']
const MEDIA = ['balanced', 'subtitles-only'] as const

// YouTube lists its original-language automatic captions twice, as `en` and
// `en-orig`, with the same URL: one track under two keys. Tracks are compared
// as `manual:<key>` / `auto:<key without -orig>`.
function trackId(raw: RawMaps, key: string, writeSubs: boolean): string {
	return writeSubs && key in (raw.subtitles ?? {}) ? `manual:${key}` : `auto:${key.replace(/-orig$/, '')}`
}

const infoJsonDir = mkdtempSync(join(tmpdir(), 'arroxy-parity-'))

interface Fetch {
	// The `--sub-langs` entries, which name the files and embedded tracks.
	languages: string[]
	tracks: string[]
	// The site's info-json lists no subtitles until asked: a listing run gave them.
	listed: boolean
}

function argAfter(args: readonly string[], flag: string): string | undefined {
	const index = args.indexOf(flag)
	return index === -1 ? undefined : args[index + 1]
}

// What a job's subtitle phase asks yt-dlp for, with the probe as its info-json,
// and the tracks yt-dlp then downloads, per `YoutubeDL.process_subtitles` and
// `orderedSet_from_options(use_regex=True)`.
async function ytDlpFetches(raw: RawMaps, probe: VideoProbeResult, subtitles: SubtitleOptions | undefined): Promise<Fetch> {
	if (!subtitles) return {languages: [], tracks: [], listed: false}
	const infoJson = join(infoJsonDir, `${probe.videoId}.info.json`)
	writeFileSync(infoJson, JSON.stringify(raw))
	const site = siteForJob(probe.extractor, probe.webpageUrl)
	const eager = await eagerSubtitleLists([infoJson], site)
	const saved = eager ? null : await saveSubtitleListing(JSON.stringify(raw), infoJsonDir)
	const lists = eager ?? (saved?.kind === 'saved' ? saved.lists : null)
	if (!lists) throw new Error('fixture lists unreadable')
	const plan = planSubtitleRun(subtitles, lists, {site, jobId: 'parity'})
	if (plan.tracks.length === 0) return {languages: [], tracks: [], listed: eager === null}
	const {args} = planWorkflow(subtitleFetchRequest(plan, {url: probe.webpageUrl, output: {directory: infoJsonDir}, format: subtitles.format, lists, tempDir: infoJsonDir}))
	const writeSubs = args.includes('--write-subs')
	const available = new Set<string>()
	if (writeSubs) for (const key of Object.keys(raw.subtitles ?? {})) available.add(key)
	if (args.includes('--write-auto-subs')) for (const key of Object.keys(raw.automatic_captions ?? {})) available.add(key)
	const languages = (argAfter(args, '--sub-langs') ?? '').split(',').filter(Boolean)
	const picked = new Set<string>()
	for (const pattern of languages) {
		const fullmatch = new RegExp(`^(?:${pattern})$`, 'i')
		for (const key of available) if (fullmatch.test(key)) picked.add(trackId(raw, key, writeSubs))
	}
	return {languages, tracks: [...picked].sort(), listed: eager === null}
}

function profileFor(media: (typeof MEDIA)[number], languages: string[], source: DownloadProfileSubtitleSource): DownloadProfile {
	const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
	return {...base, id: 'parity', media: media === 'subtitles-only' ? {kind: 'subtitles-only'} : base.media, subtitles: {enabled: true, languages, source, mode: 'sidecar', format: 'srt'}}
}

function subtitlesOf(item: QueueItem | undefined): SubtitleOptions | undefined {
	const job = item?.job
	return job && 'subtitles' in job ? job.subtitles : undefined
}

function quickJob(probe: VideoProbeResult, profile: DownloadProfile): SubtitleOptions | undefined {
	const settings = defaultAppSettings('/downloads')
	settings.profiles = {active: {kind: 'custom', id: profile.id}, custom: [profile], overrides: [], enabledOverrides: {}}
	return subtitlesOf(prepareActiveProfileQueueSubmission(probe, {settings, queue: []} as unknown as AppState, 'normal', {url: probe.webpageUrl, playlistTitle: ''})?.items[0])
}

// `handPicked`: the tracks the user ticked on the Format screen instead of the profile's.
function interactiveJob(probe: VideoProbeResult, profile: DownloadProfile, handPicked?: string[]): SubtitleOptions | undefined {
	const probeFields = {
		settings: defaultAppSettings('/downloads'),
		wizardFormats: probe.formats,
		wizardFormatSelection: probe.formatSelection ?? EMPTY_FORMAT_SELECTION,
		wizardSubtitles: probe.subtitles,
		wizardAutomaticCaptions: probe.automaticCaptions,
		wizardIsAudioOnlySource: probe.isAudioOnlySource,
		wizardOutputDir: '/downloads'
	}
	const applied = profilePatch(profile, probeFields)
	const state = {
		...probeFields,
		...applied,
		wizardMode: 'single',
		wizardUrl: probe.webpageUrl,
		wizardTitle: probe.title,
		wizardThumbnail: '',
		wizardExtractor: probe.extractor,
		wizardExtractorKey: probe.extractorKey,
		wizardMediaKind: profile.media.kind === 'subtitles-only' ? 'subtitles' : 'video',
		...(handPicked ? {wizardSubtitleLanguages: handPicked} : {}),
		queue: []
	} as unknown as AppState
	return subtitlesOf(prepareManualQueueSubmission(state, 'normal')?.items[0])
}

describe('subtitle tracks: Quick Download vs the Format screen', () => {
	for (const [id, fixture] of SOURCES) {
		const probe = probeSourceResult(id)
		for (const media of MEDIA)
			for (const source of SUBTITLE_SOURCES)
				for (const languages of LANGUAGE_SETS) {
					const profile = profileFor(media, languages, source)
					const picked = resolveProfileSelection({
						profile,
						formats: probe.formats,
						selection: probe.formatSelection ?? EMPTY_FORMAT_SELECTION,
						subtitles: probe.subtitles,
						automaticCaptions: probe.automaticCaptions,
						isAudioOnlySource: probe.isAudioOnlySource,
						nativeAudioPreference: DEFAULTS.nativeAudioPreference
					}).subtitleLanguages
					// A subtitles-only profile with no track on this video has nothing for the Format screen to queue.
					if (media === 'subtitles-only' && picked.length === 0) continue
					it(`${id} · ${media} · ${source} · ${languages.join('+')}`, async () => {
						const interactive = await ytDlpFetches(fixture.info, probe, interactiveJob(probe, profile))
						const quick = await ytDlpFetches(fixture.info, probe, quickJob(probe, profile))
						expect(interactive.tracks).toEqual(picked.map(key => trackId(fixture.info, key, source !== 'auto-only')).sort())
						expect(quick.tracks).toEqual(interactive.tracks)
						// The keys name the files and the embedded tracks, so they match too.
						expect(quick.languages).toEqual(interactive.languages)
					})
				}
	}
})

// The same track gets the same key, and so the same file name and embedded
// track, whether a profile picked it or the user did.
describe('subtitle tracks the user picks on the Format screen', () => {
	const profile = profileFor('balanced', [], 'manual-first')
	const cases: [ProbeSourceId, string[], string[], string[]][] = [
		// A video with no uploaded English: its caption goes by `en`, as a profile sends it.
		['youtube-2007', ['en-orig'], ['en'], ['auto:en']],
		// Uploaded and automatic English: the caption keeps `en-orig`, so the two stay apart.
		['youtube-2010', ['en', 'en-orig'], ['en', 'en-orig'], ['auto:en', 'manual:en']],
		// Only the caption, though an uploaded track exists: automatic captions alone, by `en`.
		['youtube-2010', ['en-orig'], ['en'], ['auto:en']]
	]
	for (const [id, keys, requested, fetched] of cases) {
		it(`${id} · ${keys.join('+')}`, async () => {
			const probe = probeSourceResult(id)
			const fetch = await ytDlpFetches(Object.fromEntries(SOURCES)[id].info, probe, interactiveJob(probe, profile, keys))
			expect(fetch.languages).toEqual(requested.map(key => `(?-i:${key})`))
			expect(fetch.tracks).toEqual(fetched)
		})
	}
})

// Vimeo, TikTok, Bilibili and others list subtitles only when yt-dlp is asked to
// write or list them, which a probe never is: their empty maps say nothing.
describe('a site whose probe does not list every subtitle track', () => {
	it("queues the profile's languages, and the subtitle phase plans them from a listing", async () => {
		const probe: VideoProbeResult = {...probeSourceResult('dailymotion'), extractor: 'vimeo', extractorKey: 'Vimeo', webpageUrl: 'https://vimeo.com/1', subtitles: {}, automaticCaptions: {}}
		const listing: RawMaps = {subtitles: {en: [{ext: 'vtt'}], 'en-x-autogen': [{ext: 'vtt'}]}}
		for (const media of MEDIA) {
			const subtitles = quickJob(probe, profileFor(media, ['en'], 'manual-first'))
			expect(subtitles?.request).toEqual({kind: 'languages', languages: ['en'], source: 'manual-first'})
			expect(await ytDlpFetches(listing, probe, subtitles)).toEqual({languages: ['(?-i:en)'], tracks: ['manual:en'], listed: true})
		}
	})
})
