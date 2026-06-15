import {describe, expect, it} from 'vitest'
import {defaultAppSettings} from '@shared/constants.js'
import type {FormatOption, ProbeResult} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import {projectBulkStart, projectPlaylistProbeResult, projectProbeFailure, projectProbeStart, projectVideoProbeResult} from '@renderer/store/wizard/probeResultProjection.js'

const VIDEO_FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p', ext: 'mp4', resolution: '1080p', fps: 30, isVideoOnly: true, isAudioOnly: false},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 160}
]

const DOLBY_FIRST_FORMATS: FormatOption[] = [
	{formatId: '337', label: '2160p HDR', ext: 'webm', resolution: '2160p HDR', fps: 30, isVideoOnly: true, isAudioOnly: false},
	{formatId: '380', label: 'm4a ac-3 384kbps', ext: 'm4a', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 384, audioCodec: 'ac-3'},
	{formatId: '328', label: 'm4a ec-3 384kbps', ext: 'm4a', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 384, audioCodec: 'ec-3'},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 143, audioCodec: 'opus'},
	{formatId: '140', label: 'm4a AAC 130kbps', ext: 'm4a', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 130, audioCodec: 'mp4a.40.2'}
]

const VIDEO_PROBE: Extract<ProbeResult, {kind: 'video'}> = {
	kind: 'video',
	videoId: 'abc',
	probeInfoJsonRef: {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'},
	extractor: 'youtube',
	extractorKey: 'Youtube',
	webpageUrl: 'https://www.youtube.com/watch?v=abc',
	isAudioOnlySource: false,
	formats: VIDEO_FORMATS,
	title: 'Video',
	thumbnail: '',
	duration: 60,
	subtitles: {en: [{ext: 'vtt'}]},
	automaticCaptions: {},
	isLive: false,
	hasDrm: false
}

const PLAYLIST_PROBE: Extract<ProbeResult, {kind: 'playlist'}> = {
	kind: 'playlist',
	extractor: 'youtube:playlist',
	extractorKey: 'YoutubePlaylist',
	webpageUrl: 'https://www.youtube.com/playlist?list=PL',
	isAudioOnlySource: false,
	playlistTitle: 'Playlist',
	playlistId: 'PL',
	isMultiVideo: false,
	entries: [
		{id: 'a', title: 'A', url: 'https://youtu.be/a', thumbnail: '', duration: 1, playlistIndex: 1, videoId: 'a'},
		{id: 'b', title: 'B', url: 'https://youtu.be/b', thumbnail: '', duration: 1, playlistIndex: 2, videoId: 'b'},
		{id: 'sentinel', title: 'Sentinel', url: 'https://youtu.be/sentinel', thumbnail: '', duration: 1, playlistIndex: 3, videoId: 'sentinel'}
	]
}

function appState(overrides: Partial<AppState> = {}): AppState {
	const settings = defaultAppSettings('/downloads')
	return {wizardStep: 'url', settings, playlistScope: {items: {kind: 'first', count: 2}}, playlistSelection: null, ...overrides} as AppState
}

describe('ProbeResultProjection', () => {
	it('projects probe start into the correct loading lane', () => {
		const projection = projectProbeStart(appState({wizardStep: 'url'}), 'https://example.com/video', 'playlist')

		expect(projection.fromStep).toBe('url')
		expect(projection.initialStep).toBe('playlistItems')
		expect(projection.patch).toMatchObject({wizardUrl: 'https://example.com/video', wizardStep: 'playlistItems', wizardMode: 'playlist', formatsLoading: false, playlistProbeLoading: true, wizardError: null})
		expect(projection.patch.wizardSubtitles).toEqual({})
	})

	it('projects video probe results and restores YouTube-scoped preferences', () => {
		const settings = defaultAppSettings('/downloads')
		settings.single = {...settings.single, lastVideoResolution: '1080p', lastSubtitleLanguages: ['en']}
		const patch = projectVideoProbeResult(VIDEO_PROBE, appState({settings}), true)

		expect(patch).toMatchObject({wizardStep: 'formats', wizardMode: 'single', wizardTitle: 'Video', wizardExtractor: 'youtube', selectedVideoFormatId: '137', wizardSubtitleLanguages: ['en'], formatsLoading: false})
		expect(patch.wizardProbeInfoJsonRef).toEqual(VIDEO_PROBE.probeInfoJsonRef)
	})

	it('does not revive a persisted Dolby audio id when a YouTube probe has Opus available', () => {
		const settings = defaultAppSettings('/downloads')
		settings.single = {...settings.single, lastPreset: 'best-quality', lastVideoResolution: '2160p HDR', lastAudioSelection: {kind: 'native', formatId: '328'}}
		const patch = projectVideoProbeResult({...VIDEO_PROBE, formats: DOLBY_FIRST_FORMATS}, appState({settings}), true)

		expect(patch).toMatchObject({selectedVideoFormatId: '337', audioSelection: {kind: 'native', formatId: '251'}})
	})

	it('does not leak YouTube format preferences into non-YouTube probes', () => {
		const settings = defaultAppSettings('/downloads')
		settings.single = {...settings.single, lastVideoResolution: 'missing-youtube-resolution', lastPreset: 'audio-only'}
		const patch = projectVideoProbeResult({...VIDEO_PROBE, extractor: 'vimeo', extractorKey: 'Vimeo', webpageUrl: 'https://vimeo.com/1'}, appState({settings}), true)

		expect(patch.selectedVideoFormatId).toBe('137')
		expect(patch.activePreset).toBe('best-quality')
	})

	it('defaults audio-only sources to the audio-only preset', () => {
		const patch = projectVideoProbeResult({...VIDEO_PROBE, isAudioOnlySource: true}, appState(), true)

		expect(patch.selectedVideoFormatId).toBe('')
		expect(patch.activePreset).toBe('audio-only')
	})

	it('uses the saved native-audio preference for audio-only sources', () => {
		const settings = defaultAppSettings('/downloads')
		settings.common.nativeAudioPreference = 'surround'
		const patch = projectVideoProbeResult({...VIDEO_PROBE, formats: DOLBY_FIRST_FORMATS, isAudioOnlySource: true}, appState({settings}), true)

		expect(patch.selectedVideoFormatId).toBe('')
		expect(patch.audioSelection).toEqual({kind: 'native', formatId: '328'})
		expect(patch.activePreset).toBe('audio-only')
	})

	it('trims playlist sentinels and marks app-limit caps', () => {
		const patch = projectPlaylistProbeResult(PLAYLIST_PROBE, appState({playlistScope: {items: {kind: 'app-limit'}}, settings: {...defaultAppSettings('/downloads'), common: {...defaultAppSettings('/downloads').common, playlistProbeLimit: 2}}}), true)

		expect(patch.playlistItems).toHaveLength(2)
		expect(patch.selectedPlaylistItemIds).toEqual(['a', 'b'])
		expect(patch.playlistLikelyCapped).toBe(true)
	})

	it('preserves playlist selection while retrying playlist probes', () => {
		const existingSelection = {kind: 'audio' as const, format: 'mp3' as const, bitrateKbps: 192 as const}
		const patch = projectPlaylistProbeResult(PLAYLIST_PROBE, appState({playlistSelection: existingSelection}), false)

		expect(patch.playlistSelection).toEqual(existingSelection)
	})

	it('projects bulk start state without M3U and with YouTube extractor gating', () => {
		const projection = projectBulkStart(['https://www.youtube.com/watch?v=abc', 'https://youtu.be/def'], appState())

		expect(projection.allYouTubeVideos).toBe(true)
		expect(projection.patch).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'bulk', wizardExtractor: 'youtube', playlistTitle: 'Bulk URLs', wizardWriteM3u: false, bulkMetadataStatus: 'resolving'})
		expect(projection.patch.selectedPlaylistItemIds).toEqual(['bulk-1', 'bulk-2'])
	})

	it('projects probe failure into the error step', () => {
		const error = {kind: 'other' as const, code: 'unknown' as const, message: 'failed'}

		expect(projectProbeFailure(error)).toMatchObject({wizardStep: 'error', formatsLoading: false, playlistProbeLoading: false, wizardError: error, wizardErrorOrigin: 'formats'})
	})
})
