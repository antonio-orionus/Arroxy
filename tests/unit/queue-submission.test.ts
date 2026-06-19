import {describe, expect, it} from 'vitest'
import {defaultAppSettings} from '@shared/constants.js'
import {i18next} from '@shared/i18n/index.js'
import type {DownloadProfile, FormatOption, PlaylistEntry, ProbeResult} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import {prepareActiveProfileQueueSubmission, prepareManualQueueSubmission} from '@renderer/store/wizard/queueSubmission.js'

const FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p', ext: 'mp4', resolution: '1080p', fps: 30, isVideoOnly: true, isAudioOnly: false, filesize: 1000},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 160, filesize: 200}
]

const PLAYLIST_ITEMS: PlaylistEntry[] = [
	{id: 'a', title: 'A', url: 'https://youtu.be/a', thumbnail: '', duration: 1, playlistIndex: 1, videoId: 'a'},
	{id: 'b', title: 'B', url: 'https://youtu.be/b', thumbnail: '', duration: 1, playlistIndex: 2, videoId: 'b'}
]

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

function state(overrides: Partial<AppState> = {}): AppState {
	return {
		settings: defaultAppSettings('/downloads'),
		wizardMode: 'single',
		wizardUrl: 'https://www.youtube.com/watch?v=abc',
		wizardTitle: 'Video',
		wizardThumbnail: '',
		wizardOutputDir: '/downloads',
		wizardSubfolderEnabled: false,
		wizardSubfolderName: '',
		selectedVideoFormatId: '137',
		audioSelection: {kind: 'native', formatId: '251'},
		activePreset: null,
		wizardFormats: FORMATS,
		wizardSubtitles: {en: [{ext: 'vtt'}]},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: ['en'],
		wizardSubtitleSkipped: false,
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		wizardExtractor: 'youtube',
		wizardExtractorKey: 'Youtube',
		wizardProbeInfoJsonRef: {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'},
		wizardEmbedChapters: true,
		wizardEmbedMetadata: true,
		wizardEmbedThumbnail: false,
		wizardWriteDescription: false,
		wizardWriteThumbnail: false,
		wizardWriteM3u: true,
		wizardSponsorBlockMode: 'off',
		wizardSponsorBlockCategories: [],
		playlistItems: PLAYLIST_ITEMS,
		selectedPlaylistItemIds: ['a', 'b'],
		playlistTitle: 'Playlist',
		playlistId: 'PL',
		playlistIsMultiVideo: false,
		playlistSelection: {kind: 'video', tier: '1080', codec: 'best'},
		...overrides
	} as AppState
}

function subtitleProfile(): DownloadProfile {
	return {
		id: 'subs',
		name: 'Subs',
		icon: 'captions',
		media: {kind: 'subtitles-only'},
		subtitles: {enabled: true, languages: ['en'], source: 'manual-only', mode: 'embed', format: 'vtt'},
		output: {kind: 'default'},
		subfolder: {enabled: true, name: 'Subs'},
		sponsorBlock: {mode: 'remove', categories: ['sponsor']},
		embed: {chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true},
		createdAt: '2026-06-07T00:00:00.000Z',
		updatedAt: '2026-06-07T00:00:00.000Z'
	}
}

function expectSourcePreferredSelector(selector: string | undefined): void {
	expect(selector).toContain('[language_preference>0]')
	expect(selector).toContain("[format_note~=?'(?i)\\boriginal\\b']")
}

describe('QueueSubmission', () => {
	it('prepares a single manual queue item', () => {
		const prepared = prepareManualQueueSubmission(state(), 'priority')

		expect(prepared?.items).toHaveLength(1)
		expect(prepared?.manifest).toBeUndefined()
		expect(prepared?.items[0]).toMatchObject({url: 'https://www.youtube.com/watch?v=abc', title: 'Video', outputDir: '/downloads', lane: 'priority', writeM3u: true, job: {kind: 'single-format', formatId: '137+251', subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}}})
		expect(prepared?.items[0]?.probeInfoJsonRef).toEqual({id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'})
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
			expect(job.formatSelector).toContain("bestaudio[acodec~=?'^(?:e-?ac-?3|ec-3)$']")
			expectSourcePreferredSelector(job.formatSelector)
		}
	})

	it('localizes Smart TV MP4 playlist queue labels', async () => {
		await i18next.changeLanguage('de')
		try {
			const prepared = prepareManualQueueSubmission(state({wizardMode: 'playlist', selectedPlaylistItemIds: ['a'], playlistSelection: {kind: 'video', tier: '1080', codec: 'mp4'}}), 'normal')

			expect(prepared?.items[0]?.formatLabel).toBe('Smart-TV H.264 MP4 · Bis 1080p')
		} finally {
			await i18next.changeLanguage('en')
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
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({wizardOutputDir: '/profile-downloads'}), 'normal')

		expect(prepared?.items).toHaveLength(1)
		expect(prepared?.items[0]).toMatchObject({url: 'https://www.youtube.com/watch?v=abc', title: 'Video', outputDir: '/profile-downloads/Balanced 720p', formatLabel: 'Up to 720p · Native formats · Native audio', job: {kind: 'ranged-format'}})
		expect(prepared?.items[0]?.probeInfoJsonRef).toEqual(VIDEO_PROBE.probeInfoJsonRef)
	})

	it('threads surround preference into active-profile best-native selectors', () => {
		const settings = defaultAppSettings('/downloads')
		settings.common.nativeAudioPreference = 'surround'
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings}), 'normal')
		const job = prepared?.items[0]?.job

		expect(job?.kind).toBe('ranged-format')
		if (job?.kind === 'ranged-format') {
			expect(job.formatSelector).toContain("bestaudio[acodec~=?'^(?:e-?ac-?3|ec-3)$']")
			expectSourcePreferredSelector(job.formatSelector)
		}
	})

	it('uses the probe webpage URL for active-profile video items when wizard state is stale', () => {
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({wizardUrl: 'https://www.youtube.com/watch?v=stale'}), 'normal')

		expect(prepared?.items[0]?.url).toBe('https://www.youtube.com/watch?v=abc')
	})

	it('uses the default downloads folder and profile subfolder with native separators', () => {
		const settings = defaultAppSettings('C:\\Users\\User\\Downloads')
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings, wizardOutputDir: ''}), 'normal')

		expect(prepared?.items[0]?.outputDir).toBe('C:\\Users\\User\\Downloads\\Balanced 720p')
	})

	it('prepares active-profile playlist items and manifest payload', () => {
		const prepared = prepareActiveProfileQueueSubmission(PLAYLIST_PROBE, state(), 'normal')

		expect(prepared?.items).toHaveLength(2)
		expect(prepared?.items[0]).toMatchObject({playlistGroupId: expect.any(String), outputDir: '/downloads/Balanced 720p', writeM3u: true})
		expect(prepared?.manifest).toMatchObject({playlistTitle: 'Playlist', outputDir: '/downloads/Balanced 720p', items: PLAYLIST_ITEMS.map(entry => ({videoId: entry.videoId, title: entry.title, duration: entry.duration}))})
	})

	it('prepares subtitles-only active profile jobs', () => {
		const settings = defaultAppSettings('/downloads')
		const profile = subtitleProfile()
		settings.profiles = {active: {kind: 'custom', id: 'subs'}, custom: [profile], overrides: []}
		const prepared = prepareActiveProfileQueueSubmission(VIDEO_PROBE, state({settings}), 'normal')

		expect(prepared?.items[0]).toMatchObject({outputDir: '/downloads/Subs', job: {kind: 'subtitle-only', subtitles: {languages: ['en'], mode: 'sidecar', format: 'vtt', writeAuto: false}}})
	})
})
