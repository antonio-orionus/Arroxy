// Quick Download and the Format screen must fetch the same subtitle tracks for
// the same profile and video. Each path's job is run through a model of
// yt-dlp's own track choice (`YoutubeDL.process_subtitles`: manual tracks
// first, automatic captions fill in, each `--sub-langs` entry fullmatched
// case-insensitively against the keys) over the recorded probe's raw maps,
// so a pattern that also catches YouTube's machine translations shows up here.

import {describe, expect, it} from 'vite-plus/test'
import {DEFAULTS, defaultAppSettings} from '@shared/constants.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import {resolveProfileSelection} from '@shared/profileSelection.js'
import {ytDlpSubtitleLanguages} from '@shared/subtitleLanguages.js'
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
const SUBTITLE_SOURCES: DownloadProfileSubtitleSource[] = ['manual-first', 'manual-only', 'auto-only']
const MEDIA = ['balanced', 'subtitles-only'] as const

// YouTube lists its original-language automatic captions twice, as `en` and
// `en-orig`, with the same URL: one track under two keys. Tracks are compared
// as `manual:<key>` / `auto:<key without -orig>`.
function trackId(raw: RawMaps, key: string, writeSubs: boolean): string {
	return writeSubs && key in (raw.subtitles ?? {}) ? `manual:${key}` : `auto:${key.replace(/-orig$/, '')}`
}

// The tracks yt-dlp downloads for a job, per `YoutubeDL.process_subtitles`
// and `orderedSet_from_options(use_regex=True)`.
function ytDlpFetches(raw: RawMaps, subtitles: SubtitleOptions | undefined): string[] {
	if (!subtitles) return []
	const writeSubs = !subtitles.autoOnly
	const available = new Set<string>()
	if (writeSubs) for (const key of Object.keys(raw.subtitles ?? {})) available.add(key)
	if (subtitles.writeAuto) for (const key of Object.keys(raw.automatic_captions ?? {})) available.add(key)
	const picked = new Set<string>()
	for (const pattern of ytDlpSubtitleLanguages(subtitles)) {
		const fullmatch = new RegExp(`^(?:${pattern})$`, 'i')
		for (const key of available) if (fullmatch.test(key)) picked.add(trackId(raw, key, writeSubs))
	}
	return [...picked].sort()
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

function interactiveJob(probe: VideoProbeResult, profile: DownloadProfile): SubtitleOptions | undefined {
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
					it(`${id} · ${media} · ${source} · ${languages.join('+')}`, () => {
						const interactive = ytDlpFetches(fixture.info, interactiveJob(probe, profile))
						expect(interactive).toEqual(picked.map(key => trackId(fixture.info, key, source !== 'auto-only')).sort())
						expect(ytDlpFetches(fixture.info, quickJob(probe, profile))).toEqual(interactive)
					})
				}
	}
})

// Vimeo, TikTok, Bilibili and others list subtitles only when yt-dlp is asked to
// write or list them, which a probe never is: their empty maps say nothing.
describe('a site whose probe does not list every subtitle track', () => {
	it("keeps Quick Download's language codes for yt-dlp to match", () => {
		const probe: VideoProbeResult = {...probeSourceResult('dailymotion'), extractor: 'vimeo', extractorKey: 'Vimeo', subtitles: {}, automaticCaptions: {}}
		for (const media of MEDIA) expect(quickJob(probe, profileFor(media, ['en'], 'manual-first'))).toMatchObject({languages: ['en'], languagesAreCodes: true})
	})
})
