import {describe, expect, it} from 'vite-plus/test'
import {defaultAppSettings} from '@shared/constants.js'
import {i18next} from '@shared/i18n/index.js'
import type {DownloadProfile, PlaylistEntry, PlaylistSelection, ProbeResult, QueueItem, QueueItemStatus} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {AppState} from '@renderer/store/types.js'
import {prepareActiveProfileQueueSubmission, prepareManualQueueSubmission, prepareMultiProfileQueueSubmission} from '@renderer/store/wizard/queueSubmission.js'
import type {PreparedQueueSubmission} from '@shared/queueSubmission.js'
import {profilePatch} from '@renderer/store/wizard/wizardProfileState.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {FORMATS, PLAYLIST_ITEMS, wizardState as state} from '../shared/queueSubmissionState.js'

const VIDEO_PROBE: Extract<ProbeResult, {kind: 'video'}> = {
	kind: 'video',
	videoId: 'abc',
	probeInfoJsonRef: {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'},
	extractor: 'youtube',
	extractorKey: 'Youtube',
	webpageUrl: 'https://www.youtube.com/watch?v=abc',
	isAudioOnlySource: false,
	formats: FORMATS,
	title: 'Video',
	thumbnail: '',
	duration: 60,
	subtitles: {},
	automaticCaptions: {},
	isLive: false,
	hasDrm: false
}

const PLAYLIST_PROBE: Extract<ProbeResult, {kind: 'playlist'}> = {kind: 'playlist', extractor: 'youtube:playlist', extractorKey: 'YoutubePlaylist', webpageUrl: 'https://www.youtube.com/playlist?list=PL', isAudioOnlySource: false, playlistTitle: 'Playlist', playlistId: 'PL', isMultiVideo: false, entries: PLAYLIST_ITEMS}

function manualPlaylistState(overrides: Partial<AppState> = {}): AppState {
	return state({wizardMode: 'playlist', ...overrides})
}

function subtitleProfile(): DownloadProfile {
	return {
		id: 'subs',
		name: 'Subs',
		icon: 'captions',
		enabled: true,
		media: {kind: 'subtitles-only'},
		subtitles: {enabled: true, languages: ['en'], source: 'manual-only', mode: 'embed', format: 'vtt'},
		output: {kind: 'default'},
		filename: {kind: 'default'},
		subfolder: {enabled: true, name: 'Subs'},
		sponsorBlock: {mode: 'remove', categories: ['sponsor']},
		embed: {chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true},
		createdAt: '2026-06-07T00:00:00.000Z',
		updatedAt: '2026-06-07T00:00:00.000Z'
	}
}

function multiProfileVideoProfile(): DownloadProfile {
	return {
		id: 'video-first',
		name: 'Video first',
		icon: 'video',
		enabled: true,
		media: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}},
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'},
		output: {kind: 'fixed', dir: '/multi/video'},
		filename: {kind: 'default'},
		subfolder: {enabled: false, name: ''},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false},
		createdAt: '2026-06-07T00:00:00.000Z',
		updatedAt: '2026-06-07T00:00:00.000Z'
	}
}

function multiProfilePodcastProfile(): DownloadProfile {
	return {
		id: 'podcast',
		name: 'Podcast',
		icon: 'audio',
		enabled: true,
		media: {kind: 'audio-only', audio: {format: 'best'}},
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'},
		output: {kind: 'fixed', dir: '/multi/podcast'},
		filename: {kind: 'default'},
		subfolder: {enabled: false, name: ''},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false},
		createdAt: '2026-06-07T00:00:00.000Z',
		updatedAt: '2026-06-07T00:00:00.000Z'
	}
}

function multiProfileState(overrides: Partial<AppState> = {}): AppState {
	const settings = defaultAppSettings('/downloads')
	const first = multiProfileVideoProfile()
	const podcast = multiProfilePodcastProfile()
	settings.profiles = {active: {kind: 'custom', id: first.id}, custom: [first, podcast], overrides: [], enabledOverrides: {}}
	return state({wizardMode: 'playlist', settings, multiProfileMode: true, playlistProfileAssignments: {}, removedPlaylistItemIds: [], ...overrides})
}

function expectSourcePreferredSelector(selector: string | undefined): void {
	expect(selector).toContain('[language_preference>0]')
	expect(selector).toContain("[format_note~='(?i)\\boriginal\\b']")
}

// The wizard's fallbacks; these tests name everything through the probe.
const NO_SOURCE = {url: '', playlistTitle: ''}

describe('QueueSubmission', () => {
	it('prepares a single manual queue item', () => {
		const prepared = prepareManualQueueSubmission(state(), 'priority')

		expect(prepared?.items).toHaveLength(1)
		expect(prepared?.manifest).toBeUndefined()
		expect(prepared?.items[0]).toMatchObject({
			url: 'https://www.youtube.com/watch?v=abc',
			title: 'Video',
			outputDir: '/downloads',
			lane: 'priority',
			writeM3u: true,
			job: {kind: 'single-format', formatId: '137+251', subtitles: {request: {kind: 'tracks', tracks: [{key: 'en', auto: false}]}, mode: 'sidecar', format: 'srt'}}
		})
		expect(prepared?.items[0]?.probeInfoJsonRef).toEqual({id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'})
	})

	it("keeps an auto-only profile's subtitle source when subtitles were not edited", () => {
		const autoOnly = {...BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!, subtitles: {enabled: true, languages: ['en'], source: 'auto-only' as const, mode: 'sidecar' as const, format: 'srt' as const}}
		// A non-YouTube site keys both tracks plain `en`, so the key alone can't say which one.
		const both = {wizardExtractor: 'vimeo', wizardSubtitles: {en: [{ext: 'vtt'}]}, wizardAutomaticCaptions: {en: [{ext: 'vtt'}]}}
		const applied = profilePatch(autoOnly, {...state(both), settings: defaultAppSettings('/downloads')})
		const prepared = prepareManualQueueSubmission(state({...both, ...applied}), 'priority')
		expect(prepared?.items[0]?.job).toMatchObject({subtitles: {request: {kind: 'tracks', tracks: [{key: 'en', auto: true}]}}})
	})

	// Audio mode extracts (`--audio-format best`), and the stream's size still sets the disk check.
	it('keeps the expected size of a native audio pick it extracts', () => {
		const job = prepareManualQueueSubmission(state({wizardMediaKind: 'audio', selectedVideoFormatId: ''}), 'priority')?.items[0]?.job
		expect(job).toMatchObject({kind: 'audio-convert', audioConvert: {target: 'best'}, formatId: '251', expectedBytes: 200})
	})

	it('never sends SponsorBlock with an audio or subtitles download', () => {
		for (const kind of ['audio', 'subtitles'] as const) {
			const prepared = prepareManualQueueSubmission(state({wizardMediaKind: kind, selectedVideoFormatId: '', wizardSponsorBlockMode: 'remove', wizardSponsorBlockCategories: ['sponsor']}), 'priority')
			const job = prepared?.items[0]?.job
			expect(job && 'sponsorBlock' in job ? job.sponsorBlock : {mode: 'off'}).toEqual({mode: 'off'})
		}
	})

	it('queues a part of the video: the range, a suffixed file name, a scaled size and no SponsorBlock', () => {
		const prepared = prepareManualQueueSubmission(state({wizardDuration: 60, wizardPart: {start: '0:10', end: '0:40', exactCut: true}, wizardSponsorBlockMode: 'remove', wizardSponsorBlockCategories: ['sponsor']}), 'priority')
		const job = prepared?.items[0]?.job
		if (job?.kind !== 'single-format') throw new Error('expected a single-format job')
		expect(job.videoPart).toEqual({startSeconds: 10, endSeconds: 40, exactCut: true})
		expect(job.filenameTemplate).toMatch(/ \[10s-40s\]$/)
		expect(job.expectedBytes).toBe(600)
		expect(job.sponsorBlock).toEqual({mode: 'off'})
	})

	it('downloads the whole video when the part is invalid or the kind is Subtitles', () => {
		for (const overrides of [{wizardPart: {start: '0:50', end: '0:40', exactCut: false}}, {wizardMediaKind: 'subtitles' as const, selectedVideoFormatId: '', wizardPart: {start: '0:10', end: '0:40', exactCut: false}}]) {
			const job = prepareManualQueueSubmission(state({wizardDuration: 60, ...overrides}), 'priority')?.items[0]?.job
			expect(job).not.toHaveProperty('videoPart')
			expect(job && 'filenameTemplate' in job ? job.filenameTemplate : '').not.toMatch(/s\]$/)
		}
	})

	it('prepares playlist manual items and a full manifest payload', () => {
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'playlist', selectedPlaylistItemIds: ['a']}), 'normal')

		expect(prepared?.items).toHaveLength(1)
		expect(prepared?.items[0]).toMatchObject({playlistGroupId: expect.any(String), writeM3u: true, job: {kind: 'ranged-format'}})
		expect(prepared?.manifest).toMatchObject({playlistTitle: 'Playlist', outputDir: '/downloads/Playlist', items: PLAYLIST_ITEMS.map(entry => ({videoId: entry.videoId, title: entry.title, duration: entry.duration}))})
	})

	it('threads surround preference into playlist best-native selectors', () => {
		const settings = defaultAppSettings('/downloads')
		settings.common.nativeAudioPreference = 'surround'
		const prepared = prepareManualQueueSubmission(state({settings, wizardMode: 'playlist', selectedPlaylistItemIds: ['a']}), 'normal')
		const job = prepared?.items[0]?.job

		expect(job?.kind).toBe('ranged-format')
		if (job?.kind === 'ranged-format') {
			expect(job.formatSelector).toContain("bestaudio[acodec~='^(?:e-?ac-?3|ec-3)$']")
			expectSourcePreferredSelector(job.formatSelector)
		}
	})

	it('prepares bulk items without an M3U manifest', () => {
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'bulk'}), 'normal')

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.manifest).toBeUndefined()
		expect(prepared?.items.every(item => item.writeM3u === false && item.playlistGroupId === undefined)).toBe(true)
	})

	it('threads source-preferred best-native selectors into manual bulk items', () => {
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'bulk'}), 'normal')
		const job = prepared?.items[0]?.job

		expect(job?.kind).toBe('ranged-format')
		if (job?.kind === 'ranged-format') expectSourcePreferredSelector(job.formatSelector)
	})

	it('prepares bulk items with per-entry probe info-json refs when metadata hydration found them', () => {
		const ref = {id: '00000000-0000-4000-8000-0000000000aa', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'a'}
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'bulk', playlistItems: [{...PLAYLIST_ITEMS[0], probeInfoJsonRef: ref}, PLAYLIST_ITEMS[1]]}), 'normal')

		expect(prepared?.items[0]?.probeInfoJsonRef).toEqual(ref)
		expect(prepared?.items[1]?.probeInfoJsonRef).toBeUndefined()
	})

	it('prepares an active-profile video item', () => {
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({wizardOutputDir: '/profile-downloads'}), 'normal', NO_SOURCE)

		expect(prepared?.items).toHaveLength(1)
		expect(prepared?.items[0]).toMatchObject({url: 'https://www.youtube.com/watch?v=abc', title: 'Video', outputDir: '/profile-downloads/Balanced 720p', formatLabel: 'Up to 720p · Best picture', job: {kind: 'ranged-format'}})
		expect(prepared?.items[0]?.probeInfoJsonRef).toEqual(VIDEO_PROBE.probeInfoJsonRef)
	})

	it('threads surround preference into active-profile best-native selectors', () => {
		const settings = defaultAppSettings('/downloads')
		settings.common.nativeAudioPreference = 'surround'
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings}), 'normal', NO_SOURCE)
		const job = prepared?.items[0]?.job

		expect(job?.kind).toBe('ranged-format')
		if (job?.kind === 'ranged-format') {
			expect(job.formatSelector).toContain("bestaudio[acodec~='^(?:e-?ac-?3|ec-3)$']")
			expectSourcePreferredSelector(job.formatSelector)
		}
	})

	it('names a {site} folder after the queued link when the probe reports no page URL', () => {
		const settings = defaultAppSettings('/downloads')
		settings.common.filenameTemplate = '{site}/{title} [{id}]'
		const prepared = prepareActiveProfileQueueSubmission({...VIDEO_PROBE, webpageUrl: ''}, state({settings}), 'normal', {url: 'https://vimeo.com/1', playlistTitle: ''})

		expect(prepared?.items[0]?.outputDir).toMatch(/[/\\]vimeo\.com$/)
	})

	it('uses the probe webpage URL for active-profile video items when wizard state is stale', () => {
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({wizardUrl: 'https://www.youtube.com/watch?v=stale'}), 'normal', NO_SOURCE)

		expect(prepared?.items[0]?.url).toBe('https://www.youtube.com/watch?v=abc')
	})

	it('uses the default downloads folder and profile subfolder with native separators', () => {
		const settings = defaultAppSettings('C:\\Users\\User\\Downloads')
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings, wizardOutputDir: ''}), 'normal', NO_SOURCE)

		expect(prepared?.items[0]?.outputDir).toBe('C:\\Users\\User\\Downloads\\Balanced 720p')
	})

	it('prepares active-profile playlist items and manifest payload', () => {
		const prepared = prepareActiveProfileQueueSubmission(PLAYLIST_PROBE, state(), 'normal', NO_SOURCE)

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items[0]).toMatchObject({playlistGroupId: expect.any(String), outputDir: '/downloads/Balanced 720p', writeM3u: true})
		expect(prepared?.manifest).toMatchObject({playlistTitle: 'Playlist', outputDir: '/downloads/Balanced 720p', items: PLAYLIST_ITEMS.map(entry => ({videoId: entry.videoId, title: entry.title, duration: entry.duration}))})
	})

	it('prepares subtitles-only active profile jobs', () => {
		const settings = defaultAppSettings('/downloads')
		const profile = subtitleProfile()
		settings.profiles = {active: {kind: 'custom', id: 'subs'}, custom: [profile], overrides: [], enabledOverrides: {}}
		const prepared = prepareActiveProfileQueueSubmission({...VIDEO_PROBE, subtitles: {'en-GB': [{ext: 'vtt'}]}}, state({settings}), 'normal', NO_SOURCE)

		expect(prepared?.items[0]).toMatchObject({outputDir: '/downloads/Subs', job: {kind: 'subtitle-only', subtitles: {request: {kind: 'languages', languages: ['en'], source: 'manual-only'}, mode: 'sidecar', format: 'vtt'}}})
	})

	// An .m3u lists media files: a subtitles-only playlist (Quick Download, Bulk) has none to list.
	it('writes no .m3u for a playlist queued with a subtitles-only profile', () => {
		const settings = defaultAppSettings('/downloads')
		settings.profiles = {active: {kind: 'custom', id: 'subs'}, custom: [subtitleProfile()], overrides: [], enabledOverrides: {}}
		const prepared = prepareActiveProfileQueueSubmission(PLAYLIST_PROBE, state({settings}), 'normal', NO_SOURCE)

		expect(prepared?.items.length).toBeGreaterThan(0)
		expect(prepared?.items.every(item => item.writeM3u === false)).toBe(true)
	})

	// Queue time no longer resolves codes to tracks: the subtitle phase plans them from the video's own lists.
	it('queues a subtitles-only profile job with the languages request when the video has none of its languages', () => {
		const settings = defaultAppSettings('/downloads')
		settings.profiles = {active: {kind: 'custom', id: 'subs'}, custom: [subtitleProfile()], overrides: [], enabledOverrides: {}}
		const job = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings}), 'normal', NO_SOURCE)?.items[0]?.job

		expect(job).toMatchObject({kind: 'subtitle-only', subtitles: {request: {kind: 'languages', languages: ['en'], source: 'manual-only'}}})
	})

	it('keeps removed items out of the manual playlist submission and its manifest', () => {
		const state = manualPlaylistState({playlistItems: PLAYLIST_ITEMS, selectedPlaylistItemIds: ['a', 'b'], removedPlaylistItemIds: ['b']})

		const prepared = prepareManualQueueSubmission(state, 'normal')

		expect(prepared?.items).toHaveLength(1)
		expect(prepared?.manifest?.items.map(item => item.videoId)).toEqual(['a'])
	})

	// Quick Download / hotkey queue a probe result with no picker in front of it,
	// so playlistSortMode is whatever the user last set on some earlier list. A
	// list they never saw must not be reordered by that leftover.
	it('ignores a leftover playlistSortMode when there was no picker', () => {
		const entries: PlaylistEntry[] = [
			{id: '1::a', title: 'A', url: 'https://example.com/a', thumbnail: '', playlistIndex: 1, videoId: 'a', timestamp: 300},
			{id: '2::b', title: 'B', url: 'https://example.com/b', thumbnail: '', playlistIndex: 2, videoId: 'b', timestamp: 100}
		]

		const prepared = prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, entries}, state({playlistSortMode: 'upload-asc'}), 'normal', NO_SOURCE)

		expect(prepared?.items.map(item => item.url)).toEqual(['https://example.com/a', 'https://example.com/b'])
	})

	it('numbers playlist_index contiguously in sorted order over selected rows only', () => {
		const items: PlaylistEntry[] = [
			{id: '1::a', title: 'A', url: 'https://example.com/a', thumbnail: '', playlistIndex: 1, videoId: 'a', timestamp: 300},
			{id: '2::b', title: 'B', url: 'https://example.com/b', thumbnail: '', playlistIndex: 2, videoId: 'b', timestamp: 100},
			{id: '3::c', title: 'C', url: 'https://example.com/c', thumbnail: '', playlistIndex: 3, videoId: 'c', timestamp: 200}
		]
		const settings = defaultAppSettings('/downloads')
		settings.common.filenameTemplate = '{playlist_index} - {title} [{id}]'
		// Select only b + a: sorted by upload-asc that's b(100) then a(300),
		// so b gets 001 and a gets 002 with no gap.
		const state = manualPlaylistState({settings, playlistItems: items, selectedPlaylistItemIds: ['1::a', '2::b'], playlistSortMode: 'upload-asc'})

		const prepared = prepareManualQueueSubmission(state, 'normal')

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items[0]?.url).toBe('https://example.com/b')
		expect(prepared?.items[1]?.url).toBe('https://example.com/a')
		const templates = prepared?.items.map(item => (item.job.kind === 'ranged-format' ? item.job.filenameTemplate : null))
		expect(templates?.[0]).toContain('001 - B [b]')
		expect(templates?.[1]).toContain('002 - A [a]')
		// Never written back onto the entries themselves.
		expect(items[0]?.playlistIndex).toBe(1)
		expect(items[1]?.playlistIndex).toBe(2)
	})
})

describe('prepareMultiProfileQueueSubmission', () => {
	it('gives each item its assigned profile output dir and emits no playlist group', () => {
		const state = multiProfileState({playlistItems: PLAYLIST_ITEMS, selectedPlaylistItemIds: ['a', 'b'], playlistProfileAssignments: {b: {kind: 'custom', id: 'podcast'}}})

		const prepared = prepareMultiProfileQueueSubmission(state, 'normal')

		expect(prepared).not.toBeNull()
		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.manifest).toBeUndefined()
		expect(prepared?.items.every(item => item.playlistGroupId === undefined)).toBe(true)
		expect(prepared?.items.every(item => item.writeM3u === false)).toBe(true)
		expect(prepared?.items[0].outputDir).not.toBe(prepared?.items[1].outputDir)
	})

	it('labels each item with its own profile', () => {
		const state = multiProfileState({playlistItems: PLAYLIST_ITEMS, selectedPlaylistItemIds: ['a', 'b'], playlistProfileAssignments: {b: {kind: 'custom', id: 'podcast'}}})

		const labels = prepareMultiProfileQueueSubmission(state, 'normal')?.items.map(item => item.formatLabel)

		expect(new Set(labels).size).toBe(2)
	})

	it('returns null when nothing is selected', () => {
		expect(prepareMultiProfileQueueSubmission(multiProfileState({playlistItems: PLAYLIST_ITEMS, selectedPlaylistItemIds: []}), 'normal')).toBeNull()
	})

	it('excludes removed items even when they are still selected', () => {
		const state = multiProfileState({playlistItems: PLAYLIST_ITEMS, selectedPlaylistItemIds: ['a', 'b'], removedPlaylistItemIds: ['b']})

		expect(prepareMultiProfileQueueSubmission(state, 'normal')?.items).toHaveLength(1)
	})
})

// A container row (channel/playlist/album kept by the probe's all-nested
// fallback) addresses a whole set. Queueing one would hand yt-dlp a collection
// URL under a single pre-bound filename, so every submission seam drops it.
const CONTAINER_ITEM: PlaylistEntry = {id: 'c', title: 'Greatest Hits', url: 'https://music.youtube.com/browse/VLPLxyz', thumbnail: '', playlistIndex: 3, videoId: 'VLPLxyz', isContainer: true}

describe('the Format screen file type reaches the queued job', () => {
	function singleJob(overrides: Partial<AppState> = {}): PreparedJob | undefined {
		return prepareManualQueueSubmission(state(overrides), 'priority')?.items[0]?.job
	}

	it('carries a chosen file type as a lossless remux, never a recode', () => {
		const job = singleJob({wizardFileType: 'mkv'})

		expect(job).toMatchObject({kind: 'single-format', formatId: '137+251', mergeOutputFormat: 'mkv', remuxVideo: 'mkv'})
		expect(JSON.stringify(job)).not.toContain('recode')
	})

	it('lets WebM fall back to MKV instead of failing when the streams do not fit', () => {
		expect(singleJob({wizardFileType: 'webm'})).toMatchObject({mergeOutputFormat: 'webm/mkv', remuxVideo: 'webm>webm/mkv'})
	})

	it('sends nothing for Auto, so the streams decide as before', () => {
		const job = singleJob({wizardFileType: 'auto'})

		expect(job).toMatchObject({kind: 'single-format', formatId: '137+251'})
		expect(job).not.toHaveProperty('mergeOutputFormat')
		expect(job).not.toHaveProperty('remuxVideo')
	})

	it('ignores the file type for audio and subtitles downloads', () => {
		const job = singleJob({wizardMediaKind: 'audio', selectedVideoFormatId: '', wizardFileType: 'mkv'})

		expect(job).not.toHaveProperty('remuxVideo')
	})

	it('still says what was asked when embedded subtitles will override it (the bridge drops the remux)', () => {
		const job = singleJob({wizardFileType: 'mp4', wizardSubtitleMode: 'embed', wizardSubtitleLanguages: ['en']})

		expect(job).toMatchObject({kind: 'single-format', remuxVideo: 'mp4'})
	})
})

describe('the HDR preference reaches the queued job', () => {
	function sortFor(hdrPreference: 'auto' | 'sdr' | 'hdr' | undefined): string | undefined {
		const settings = defaultAppSettings('/downloads')
		if (hdrPreference === undefined) delete settings.common.hdrPreference
		else settings.common.hdrPreference = hdrPreference
		const job = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings}), 'normal', NO_SOURCE)?.items[0]?.job
		return job?.kind === 'ranged-format' ? job.formatSort : undefined
	}

	it('asks for SDR first by default: Auto reads as SDR where there is no HDR screen', () => {
		expect(sortFor('sdr')).toBe('res:720,fps,hdr:sdr')
		expect(sortFor(undefined)).toBe('res:720,fps,hdr:sdr')
	})

	it("leaves yt-dlp's HDR-first order alone when the app setting is HDR", () => {
		expect(sortFor('hdr')).toBe('res:720,fps')
	})
})

describe('a profile file type reaches the quick download job', () => {
	it('an MP4 profile pairs AAC and remuxes to MP4', () => {
		const base = BUILTIN_DOWNLOAD_PROFILES.find(p => p.id === 'hd-1080')
		if (!base) throw new Error('no hd-1080')
		const profile: DownloadProfile = {...base, id: 'mp4-profile', media: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'mp4', audio: {native: {kind: 'default'}}}}
		const settings = defaultAppSettings('/downloads')
		settings.profiles = {active: {kind: 'custom', id: profile.id}, custom: [profile], overrides: [], enabledOverrides: {}}

		const job = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings}), 'normal', NO_SOURCE)?.items[0]?.job

		expect(job).toMatchObject({kind: 'ranged-format', mergeOutputFormat: 'mp4', remuxVideo: 'mp4'})
		if (job?.kind === 'ranged-format') expect(job.formatSort).toBe('res:1080,fps,hdr:sdr,acodec:m4a')
	})
})

describe('container rows are never queued', () => {
	it('prepareManualQueueSubmission drops them', () => {
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'playlist', playlistItems: [...PLAYLIST_ITEMS, CONTAINER_ITEM], selectedPlaylistItemIds: ['a', 'b', 'c']}), 'normal')

		expect(prepared?.items.map(item => item.url)).toEqual([PLAYLIST_ITEMS[0].url, PLAYLIST_ITEMS[1].url])
	})

	it('prepareManualQueueSubmission returns null when only containers are selected', () => {
		expect(prepareManualQueueSubmission(state({wizardMode: 'playlist', playlistItems: [CONTAINER_ITEM], selectedPlaylistItemIds: ['c']}), 'normal')).toBeNull()
	})

	it('prepareMultiProfileQueueSubmission drops them', () => {
		const prepared = prepareMultiProfileQueueSubmission(multiProfileState({playlistItems: [...PLAYLIST_ITEMS, CONTAINER_ITEM], selectedPlaylistItemIds: ['a', 'b', 'c']}), 'normal')

		expect(prepared?.items).toHaveLength(2)
	})

	it('prepareActiveProfileQueueSubmission drops them', () => {
		const probe = {...PLAYLIST_PROBE, entries: [...PLAYLIST_ITEMS, CONTAINER_ITEM]}

		const prepared = prepareActiveProfileQueueSubmission(probe, state(), 'normal', NO_SOURCE)

		expect(prepared?.items.map(item => item.url)).toEqual([PLAYLIST_ITEMS[0].url, PLAYLIST_ITEMS[1].url])
		expect(prepared?.manifest?.items.map(item => item.videoId)).toEqual(['a', 'b'])
	})

	it('prepareActiveProfileQueueSubmission returns null when every entry is a container', () => {
		expect(prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, entries: [CONTAINER_ITEM]}, state(), 'normal', NO_SOURCE)).toBeNull()
	})
})

// Mixes and long playlists list one video at several positions. The probe keeps
// each position as its own row, but the queue admits a video once, so every
// submission seam queues the first occurrence only. Without that, the repeat is
// rejected as an in-batch duplicate and the whole batch is lost.
const REPEATED_ITEMS: PlaylistEntry[] = [
	{id: '1::a', title: 'A', url: 'https://youtu.be/a', thumbnail: '', duration: 1, playlistIndex: 1, videoId: 'a'},
	{id: '2::b', title: 'B', url: 'https://youtu.be/b', thumbnail: '', duration: 1, playlistIndex: 2, videoId: 'b'},
	{id: '3::a', title: 'A', url: 'https://youtu.be/a', thumbnail: '', duration: 1, playlistIndex: 3, videoId: 'a'},
	{id: '4::c', title: 'C', url: 'https://youtu.be/c', thumbnail: '', duration: 1, playlistIndex: 4, videoId: 'c'}
]
const REPEATED_URLS = ['https://youtu.be/a', 'https://youtu.be/b', 'https://youtu.be/c']
const ALL_REPEATED_IDS = REPEATED_ITEMS.map(entry => entry.id)
function jobFilenameTemplate(job: PreparedJob): string | undefined {
	return 'filenameTemplate' in job ? job.filenameTemplate : undefined
}
const NUMBERED_TITLES = ['001 - A', '002 - B', '003 - C']
function numberedSettings(): AppState['settings'] {
	const settings = defaultAppSettings('/downloads')
	return {...settings, common: {...settings.common, filenameTemplate: '{playlist_index} - {title}'}}
}

describe('a video listed twice is queued once', () => {
	it('prepareActiveProfileQueueSubmission keeps the first occurrence, numbers contiguously, and matches the manifest', () => {
		const prepared = prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, entries: REPEATED_ITEMS}, state({settings: numberedSettings()}), 'normal', NO_SOURCE)

		expect(prepared?.items.map(item => item.url)).toEqual(REPEATED_URLS)
		expect(prepared?.items.map(item => jobFilenameTemplate(item.job))).toEqual(NUMBERED_TITLES)
		expect(prepared?.manifest?.items.map(item => item.videoId)).toEqual(['a', 'b', 'c'])
	})

	it('prepareManualQueueSubmission keeps the first selected occurrence, numbers contiguously, and matches the manifest', () => {
		const prepared = prepareManualQueueSubmission(manualPlaylistState({settings: numberedSettings(), playlistItems: REPEATED_ITEMS, selectedPlaylistItemIds: ALL_REPEATED_IDS}), 'normal')

		expect(prepared?.items.map(item => item.url)).toEqual(REPEATED_URLS)
		expect(prepared?.items.map(item => jobFilenameTemplate(item.job))).toEqual(NUMBERED_TITLES)
		expect(prepared?.manifest?.items.map(item => item.videoId)).toEqual(['a', 'b', 'c'])
	})

	it('prepareManualQueueSubmission queues a repeated video that is selected only at its later position', () => {
		const prepared = prepareManualQueueSubmission(manualPlaylistState({playlistItems: REPEATED_ITEMS, selectedPlaylistItemIds: ['2::b', '3::a']}), 'normal')

		expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/b', 'https://youtu.be/a'])
	})

	it('prepareManualQueueSubmission dedupes a bulk list', () => {
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'bulk', playlistItems: REPEATED_ITEMS, selectedPlaylistItemIds: ALL_REPEATED_IDS}), 'normal')

		expect(prepared?.items.map(item => item.url)).toEqual(REPEATED_URLS)
	})

	it('prepareMultiProfileQueueSubmission queues each video once', () => {
		const prepared = prepareMultiProfileQueueSubmission(multiProfileState({playlistItems: REPEATED_ITEMS, selectedPlaylistItemIds: ALL_REPEATED_IDS}), 'normal')

		expect(prepared?.items.map(item => item.url)).toEqual(REPEATED_URLS)
	})
})

// A video that is already live in the queue is skipped, not a reason to reject
// the whole playlist: admission refuses a live duplicate, so the batch is
// filtered here and the user is told how many were left out.
function queued(url: string, status: QueueItemStatus = 'pending'): QueueItem {
	return {id: `q-${status}-${url}`, url, status} as QueueItem
}
const LIVE_STATUSES: QueueItemStatus[] = ['probing', 'pending', 'running', 'paused-held', 'paused-active']
const TERMINAL_STATUSES: QueueItemStatus[] = ['done', 'error', 'cancelled']
const ABC_ITEMS: PlaylistEntry[] = ['a', 'b', 'c'].map((id, index) => ({id, title: id.toUpperCase(), url: `https://youtu.be/${id}`, thumbnail: '', duration: 1, playlistIndex: index + 1, videoId: id}))
const ABC_URLS = ABC_ITEMS.map(entry => entry.url)

describe('videos already live in the queue are skipped', () => {
	describe('prepareActiveProfileQueueSubmission', () => {
		const probe = {...PLAYLIST_PROBE, entries: ABC_ITEMS}

		it('drops the queued entry, numbers the rest contiguously, and counts the skip', () => {
			const prepared = prepareActiveProfileQueueSubmission(probe, state({settings: numberedSettings(), queue: [queued('https://youtu.be/a')]}), 'normal', NO_SOURCE)

			expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/b', 'https://youtu.be/c'])
			expect(prepared?.items.map(item => jobFilenameTemplate(item.job))).toEqual(['001 - B', '002 - C'])
			expect(prepared?.skippedAlreadyQueued).toBe(1)
		})

		// The manifest is the playlist's full ordered list by contract (the .m3u is
		// rebuilt from it and from the files on disk), so a skipped video stays in it.
		it('keeps the whole playlist in the manifest', () => {
			const prepared = prepareActiveProfileQueueSubmission(probe, state({queue: [queued('https://youtu.be/a')]}), 'normal', NO_SOURCE)

			expect(prepared?.manifest?.items.map(item => item.videoId)).toEqual(['a', 'b', 'c'])
		})

		it.each(LIVE_STATUSES)('skips a %s item', status => {
			const prepared = prepareActiveProfileQueueSubmission(probe, state({queue: [queued('https://youtu.be/b', status)]}), 'normal', NO_SOURCE)

			expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/a', 'https://youtu.be/c'])
			expect(prepared?.skippedAlreadyQueued).toBe(1)
		})

		it.each(TERMINAL_STATUSES)('does not skip a %s item', status => {
			const prepared = prepareActiveProfileQueueSubmission(probe, state({queue: ABC_URLS.map(url => queued(url, status))}), 'normal', NO_SOURCE)

			expect(prepared?.items.map(item => item.url)).toEqual(ABC_URLS)
			expect(prepared?.skippedAlreadyQueued).toBe(0)
		})

		it('counts a queued video listed twice once', () => {
			const prepared = prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, entries: REPEATED_ITEMS}, state({queue: [queued('https://youtu.be/a')]}), 'normal', NO_SOURCE)

			expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/b', 'https://youtu.be/c'])
			expect(prepared?.skippedAlreadyQueued).toBe(1)
		})

		it('yields no items, and no manifest, when every video is already queued', () => {
			const prepared = prepareActiveProfileQueueSubmission(probe, state({queue: ABC_URLS.map(url => queued(url))}), 'normal', NO_SOURCE)

			expect(prepared).toEqual({items: [], skippedAlreadyQueued: 3})
		})

		it('reports nothing skipped when the queue is unrelated', () => {
			const prepared = prepareActiveProfileQueueSubmission(probe, state({queue: [queued('https://youtu.be/zzz')]}), 'normal', NO_SOURCE)

			expect(prepared?.items).toHaveLength(3)
			expect(prepared?.skippedAlreadyQueued).toBe(0)
		})

		it('leaves a lone video to the admission guard', () => {
			const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({queue: [queued(VIDEO_PROBE.webpageUrl)]}), 'normal', NO_SOURCE)

			expect(prepared?.items.map(item => item.url)).toEqual([VIDEO_PROBE.webpageUrl])
			expect(prepared?.skippedAlreadyQueued).toBe(0)
		})
	})

	describe('prepareManualQueueSubmission', () => {
		const picked = (overrides: Partial<AppState> = {}) => manualPlaylistState({playlistItems: ABC_ITEMS, selectedPlaylistItemIds: ['a', 'b', 'c'], ...overrides})

		it('playlist picker: drops the queued entry, numbers the rest contiguously, and counts the skip', () => {
			const prepared = prepareManualQueueSubmission(picked({settings: numberedSettings(), queue: [queued('https://youtu.be/b')]}), 'normal')

			expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/a', 'https://youtu.be/c'])
			expect(prepared?.items.map(item => jobFilenameTemplate(item.job))).toEqual(['001 - A', '002 - C'])
			expect(prepared?.skippedAlreadyQueued).toBe(1)
			expect(prepared?.manifest?.items.map(item => item.videoId)).toEqual(['a', 'b', 'c'])
		})

		it('only counts skipped videos that were selected', () => {
			const prepared = prepareManualQueueSubmission(picked({selectedPlaylistItemIds: ['a', 'b'], queue: [queued('https://youtu.be/c')]}), 'normal')

			expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/a', 'https://youtu.be/b'])
			expect(prepared?.skippedAlreadyQueued).toBe(0)
		})

		it('bulk list: drops queued URLs in intake order and counts them', () => {
			const prepared = prepareManualQueueSubmission(state({wizardMode: 'bulk', playlistItems: ABC_ITEMS, selectedPlaylistItemIds: ['a', 'b', 'c'], queue: [queued('https://youtu.be/a'), queued('https://youtu.be/c', 'running')]}), 'normal')

			expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/b'])
			expect(prepared?.skippedAlreadyQueued).toBe(2)
			expect(prepared?.manifest).toBeUndefined()
		})

		it.each(TERMINAL_STATUSES)('does not skip a %s item', status => {
			const prepared = prepareManualQueueSubmission(picked({queue: ABC_URLS.map(url => queued(url, status))}), 'normal')

			expect(prepared?.items.map(item => item.url)).toEqual(ABC_URLS)
			expect(prepared?.skippedAlreadyQueued).toBe(0)
		})

		it('yields no items, and no manifest, when everything selected is already queued', () => {
			const prepared = prepareManualQueueSubmission(picked({queue: ABC_URLS.map(url => queued(url))}), 'normal')

			expect(prepared).toEqual({items: [], skippedAlreadyQueued: 3})
		})

		it('still returns null when nothing is selected', () => {
			expect(prepareManualQueueSubmission(picked({selectedPlaylistItemIds: [], queue: [queued('https://youtu.be/a')]}), 'normal')).toBeNull()
		})

		it('leaves a single video to the admission guard', () => {
			const prepared = prepareManualQueueSubmission(state({queue: [queued('https://www.youtube.com/watch?v=abc')]}), 'normal')

			expect(prepared?.items).toHaveLength(1)
			expect(prepared?.skippedAlreadyQueued).toBe(0)
		})
	})

	describe('prepareMultiProfileQueueSubmission', () => {
		const picked = (overrides: Partial<AppState> = {}) => multiProfileState({playlistItems: ABC_ITEMS, selectedPlaylistItemIds: ['a', 'b', 'c'], ...overrides})

		it('drops the queued entry and counts the skip', () => {
			const prepared = prepareMultiProfileQueueSubmission(picked({queue: [queued('https://youtu.be/a')]}), 'normal')

			expect(prepared?.items.map(item => item.url)).toEqual(['https://youtu.be/b', 'https://youtu.be/c'])
			expect(prepared?.skippedAlreadyQueued).toBe(1)
		})

		it.each(TERMINAL_STATUSES)('does not skip a %s item', status => {
			const prepared = prepareMultiProfileQueueSubmission(picked({queue: ABC_URLS.map(url => queued(url, status))}), 'normal')

			expect(prepared?.items).toHaveLength(3)
			expect(prepared?.skippedAlreadyQueued).toBe(0)
		})

		it('yields no items when everything selected is already queued', () => {
			const prepared = prepareMultiProfileQueueSubmission(picked({queue: ABC_URLS.map(url => queued(url))}), 'normal')

			expect(prepared).toEqual({items: [], skippedAlreadyQueued: 3})
		})

		it('still returns null when nothing is selected', () => {
			expect(prepareMultiProfileQueueSubmission(picked({selectedPlaylistItemIds: [], queue: [queued('https://youtu.be/a')]}), 'normal')).toBeNull()
		})
	})
})

// A flat-playlist probe row whose extractor yielded no title carries the
// fabricated `Untitled · #N` label plus the placeholder flag. Both playlist
// submission seams must carry the flag onto the QueueItem so the backfill
// layers can find rows that still need a real title.
const PLACEHOLDER_ITEM: PlaylistEntry = {...PLAYLIST_ITEMS[0], id: 'u1', title: 'Untitled · #1', titleIsPlaceholder: true}

describe('placeholder titles ride onto queue items', () => {
	it('prepareManualQueueSubmission carries the flag', () => {
		const prepared = prepareManualQueueSubmission(manualPlaylistState({playlistItems: [PLACEHOLDER_ITEM, PLAYLIST_ITEMS[1]], selectedPlaylistItemIds: ['u1', 'b']}), 'normal')

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items[0]?.titleIsPlaceholder).toBe(true)
		expect(prepared?.items[1]?.titleIsPlaceholder).toBeUndefined()
	})

	it('prepareMultiProfileQueueSubmission carries the flag', () => {
		const prepared = prepareMultiProfileQueueSubmission(multiProfileState({playlistItems: [PLACEHOLDER_ITEM, PLAYLIST_ITEMS[1]], selectedPlaylistItemIds: ['u1', 'b']}), 'normal')

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items[0]?.titleIsPlaceholder).toBe(true)
		expect(prepared?.items[1]?.titleIsPlaceholder).toBeUndefined()
	})

	it('prepareActiveProfileQueueSubmission carries the flag', () => {
		const prepared = prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, entries: [PLACEHOLDER_ITEM, PLAYLIST_ITEMS[1]]}, state(), 'normal', NO_SOURCE)

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items[0]?.titleIsPlaceholder).toBe(true)
		expect(prepared?.items[1]?.titleIsPlaceholder).toBeUndefined()
	})
})

describe('bulk submissions keep intake order', () => {
	const items: PlaylistEntry[] = [
		{id: 'bulk-1', title: 'First', url: 'https://example.com/1', thumbnail: '', playlistIndex: 1, videoId: 'a', timestamp: 300},
		{id: 'bulk-2', title: 'Second', url: 'https://example.com/2', thumbnail: '', playlistIndex: 2, videoId: 'b', timestamp: 100}
	]

	it('prepareManualQueueSubmission ignores a retained upload sort in bulk mode', () => {
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'bulk', playlistItems: items, selectedPlaylistItemIds: ['bulk-1', 'bulk-2'], playlistSortMode: 'upload-asc', playlistSelection: {kind: 'video', tier: 'best', codec: 'best'}}), 'normal')

		expect(prepared?.items.map(item => item.url)).toEqual(['https://example.com/1', 'https://example.com/2'])
	})

	it('prepareMultiProfileQueueSubmission ignores a retained upload sort in bulk mode', () => {
		const prepared = prepareMultiProfileQueueSubmission(multiProfileState({wizardMode: 'bulk', playlistItems: items, selectedPlaylistItemIds: ['bulk-1', 'bulk-2'], playlistSortMode: 'upload-desc'}), 'normal')

		expect(prepared?.items.map(item => item.url)).toEqual(['https://example.com/1', 'https://example.com/2'])
	})
})

describe('subtitles-only batch selections', () => {
	const SUBS: PlaylistSelection = {kind: 'subtitles', languages: ['en', 'pl'], source: 'manual-first', mode: 'subfolder', format: 'vtt'}

	it('prepares bulk subtitle-only jobs without media, SponsorBlock, or embed options', () => {
		const prepared = prepareManualQueueSubmission(state({wizardMode: 'bulk', playlistSelection: SUBS, wizardSponsorBlockMode: 'remove', wizardSponsorBlockCategories: ['sponsor']}), 'normal')

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.manifest).toBeUndefined()
		for (const item of prepared?.items ?? []) {
			expect(item.job).toMatchObject({kind: 'subtitle-only', subtitles: {request: {kind: 'languages', languages: ['en', 'pl'], source: 'manual-first'}, mode: 'subfolder', format: 'vtt'}})
		}
	})

	it('labels subtitle-only batch items with the languages and format', async () => {
		await i18next.changeLanguage('en')
		const prepared = prepareManualQueueSubmission(manualPlaylistState({playlistSelection: SUBS}), 'normal')

		expect(prepared?.items[0]?.formatLabel).toBe('Subtitles only · en, pl · VTT')
	})

	it('keeps playlist grouping and skips the M3U manifest for subtitle-only playlists', () => {
		const prepared = prepareManualQueueSubmission(manualPlaylistState({playlistSelection: SUBS}), 'normal')

		expect(prepared?.items.every(item => item.playlistGroupId !== undefined)).toBe(true)
		expect(prepared?.items.every(item => item.writeM3u === false)).toBe(true)
	})
})

describe('job auth threading', () => {
	const SIGNED_IN_ITEMS: PlaylistEntry[] = PLAYLIST_ITEMS.map(entry => ({...entry, auth: 'exploreSession'}))

	it('quick-download items of an account-only playlist carry the auth main put on its entries', () => {
		const prepared = prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, auth: 'exploreSession', entries: SIGNED_IN_ITEMS}, state(), 'normal', NO_SOURCE)

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items.map(item => item.auth)).toEqual(['exploreSession', 'exploreSession'])
	})

	it('quick-download items of a playlist enumerated past a bot wall start anonymous (R20)', () => {
		const prepared = prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, auth: 'exploreSession'}, state(), 'normal', NO_SOURCE)

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items.every(item => !('auth' in item))).toBe(true)
	})

	it('a signed-in video probe makes the quick-download item signed in', () => {
		const prepared = prepareActiveProfileQueueSubmission({...VIDEO_PROBE, auth: 'exploreSession'}, state(), 'normal', NO_SOURCE)

		expect(prepared?.items[0]?.auth).toBe('exploreSession')
	})

	it('the single wizard item carries the probe auth', () => {
		const prepared = prepareManualQueueSubmission(state({wizardProbeAuth: 'exploreSession'}), 'normal')

		expect(prepared?.items[0]?.auth).toBe('exploreSession')
	})

	it('manual playlist and bulk items carry their entry auth', () => {
		for (const wizardMode of ['playlist', 'bulk'] as const) {
			const prepared = prepareManualQueueSubmission(state({wizardMode, playlistItems: SIGNED_IN_ITEMS}), 'normal')
			expect(prepared?.items.map(item => item.auth)).toEqual(['exploreSession', 'exploreSession'])
		}
	})

	it('multi-profile items carry their entry auth', () => {
		const prepared = prepareMultiProfileQueueSubmission(multiProfileState({playlistItems: SIGNED_IN_ITEMS}), 'normal')

		expect(prepared?.items.length).toBeGreaterThan(0)
		expect(prepared?.items.every(item => item.auth === 'exploreSession')).toBe(true)
	})

	it('anonymous probes leave auth off every item', () => {
		const quick = prepareActiveProfileQueueSubmission(PLAYLIST_PROBE, state(), 'normal', NO_SOURCE)
		const single = prepareManualQueueSubmission(state(), 'normal')

		expect(quick?.items.length).toBeGreaterThan(0)
		expect(single?.items.length).toBeGreaterThan(0)
		expect([...(quick?.items ?? []), ...(single?.items ?? [])].every(item => !('auth' in item))).toBe(true)
	})
})

// A row hydration probed knows yt-dlp's format ids, so its name needs a smaller
// in-flight reserve than a flat row's, and keeps more of a long title.
describe('a playlist row is budgeted from the formats its own probe listed', () => {
	const TITLE = '日本語'.repeat(100)
	const PROBED: PlaylistEntry = {
		...PLAYLIST_ITEMS[0],
		title: TITLE,
		probedFormats: [
			{formatId: '137', ext: 'mp4'},
			{formatId: '251', ext: 'webm'}
		]
	}
	const FLAT: PlaylistEntry = {...PLAYLIST_ITEMS[1], title: TITLE}

	function templateLengths(prepared: PreparedQueueSubmission | null): number[] {
		return prepared?.items.map(item => jobFilenameTemplate(item.job)?.length ?? 0) ?? []
	}

	it('in a manual playlist submission', () => {
		const [probed = 0, flat = 0] = templateLengths(prepareManualQueueSubmission(manualPlaylistState({playlistItems: [PROBED, FLAT]}), 'normal'))
		expect(probed).toBeGreaterThan(flat)
	})

	it('in a multi-profile submission', () => {
		const [probed = 0, flat = 0] = templateLengths(prepareMultiProfileQueueSubmission(multiProfileState({playlistItems: [PROBED, FLAT]}), 'normal'))
		expect(probed).toBeGreaterThan(flat)
	})

	it('in an active-profile playlist submission', () => {
		const [probed = 0, flat = 0] = templateLengths(prepareActiveProfileQueueSubmission({...PLAYLIST_PROBE, entries: [PROBED, FLAT]}, state(), 'normal', NO_SOURCE))
		expect(probed).toBeGreaterThan(flat)
	})
})
