import {describe, expect, it} from 'vite-plus/test'
import {defaultAppSettings} from '@shared/constants.js'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
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

	it('pre-selects a video probe from the active download profile', () => {
		const settings = defaultAppSettings('/downloads')
		settings.profiles = {...settings.profiles, active: {kind: 'builtin', id: 'best-quality'}}
		const patch = projectVideoProbeResult(VIDEO_PROBE, appState({settings}), true)

		expect(patch).toMatchObject({wizardStep: 'formats', wizardMode: 'single', wizardTitle: 'Video', wizardExtractor: 'youtube', wizardMediaKind: 'video', selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '251'}, wizardSubtitleLanguages: [], formatsLoading: false})
		expect(patch.wizardProfile?.id).toBe('best-quality')
		expect(patch.wizardProfileBaseline?.videoFormatId).toBe('137')
		expect(patch.wizardProbeInfoJsonRef).toEqual(VIDEO_PROBE.probeInfoJsonRef)
	})

	it('applies the profile on every site, not only YouTube', () => {
		const settings = defaultAppSettings('/downloads')
		settings.profiles = {...settings.profiles, active: {kind: 'builtin', id: 'audio-only'}}
		const patch = projectVideoProbeResult({...VIDEO_PROBE, extractor: 'vimeo', extractorKey: 'Vimeo', webpageUrl: 'https://vimeo.com/1'}, appState({settings}), true)

		expect(patch).toMatchObject({wizardMediaKind: 'audio', selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '251'}})
	})

	it('defaults audio-only sources to Audio and says so', () => {
		const patch = projectVideoProbeResult({...VIDEO_PROBE, isAudioOnlySource: true}, appState(), true)

		expect(patch).toMatchObject({wizardMediaKind: 'audio', selectedVideoFormatId: ''})
		expect(patch.wizardFitNotices).toEqual([{kind: 'no-video'}])
	})

	it('uses the saved native-audio preference for audio-only sources', () => {
		const settings = defaultAppSettings('/downloads')
		settings.common.nativeAudioPreference = 'surround'
		const patch = projectVideoProbeResult({...VIDEO_PROBE, formats: DOLBY_FIRST_FORMATS, isAudioOnlySource: true}, appState({settings}), true)

		expect(patch).toMatchObject({wizardMediaKind: 'audio', selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '328'}})
	})

	it("keeps the user's edits when the same run probes again", () => {
		const first = projectVideoProbeResult(VIDEO_PROBE, appState(), true)
		const edited = appState({...first, wizardSubtitleLanguages: ['en'], wizardSponsorBlockMode: 'remove'})
		const retried = projectVideoProbeResult(VIDEO_PROBE, edited, false)

		expect(retried).toMatchObject({wizardSubtitleLanguages: ['en'], wizardSponsorBlockMode: 'remove', selectedVideoFormatId: '137'})
	})

	it('falls back to the profile pick when a retry no longer offers the chosen stream', () => {
		const first = projectVideoProbeResult(VIDEO_PROBE, appState(), true)
		const edited = appState({...first, selectedVideoFormatId: 'gone'})
		expect(projectVideoProbeResult(VIDEO_PROBE, edited, false).selectedVideoFormatId).toBe('137')
	})

	it('names the new combined file when a retry no longer offers the kept one', () => {
		const combined: FormatOption = {formatId: '18', label: '360p', ext: 'mp4', resolution: '640x360', isVideoOnly: false, isAudioOnly: false, audioCodec: 'mp4a.40.2'}
		const probe = {...VIDEO_PROBE, formats: [combined], formatSelection: selectionSourceFromOptions([combined])}
		const first = projectVideoProbeResult(probe, appState(), true)
		const edited = appState({...first, wizardMediaKind: 'audio', selectedVideoFormatId: '', audioSelection: {kind: 'extract', formatId: 'gone'}})
		expect(projectVideoProbeResult(probe, edited, false).audioSelection).toEqual({kind: 'extract', formatId: '18'})
	})

	it('lands a new video with the whole video picked, its chapters, and the link start offered', () => {
		const chapters = [{title: 'Intro', startSeconds: 0, endSeconds: 20}]
		const patch = projectVideoProbeResult({...VIDEO_PROBE, chapters}, appState({wizardUrl: 'https://youtu.be/abc?t=12', wizardPart: {start: '0:01', end: '0:02', exactCut: false}}), true)

		expect(patch).toMatchObject({wizardChapters: chapters, wizardUrlStartSeconds: 12, wizardPart: null})
	})

	it('keeps the part when the same run probes again', () => {
		const first = projectVideoProbeResult(VIDEO_PROBE, appState(), true)
		const part = {start: '0:10', end: '0:20', exactCut: true}
		expect(projectVideoProbeResult(VIDEO_PROBE, appState({...first, wizardPart: part}), false).wizardPart).toEqual(part)
	})

	it('clears the part for a new link and for a playlist, but not for a retry', () => {
		const part = {start: '0:10', end: '0:20', exactCut: false}
		expect(projectProbeStart(appState({wizardPart: part}), 'https://example.com/other', 'video').patch.wizardPart).toBeNull()
		expect(projectProbeStart(appState({wizardPart: part}), 'https://example.com/same', 'video', true).patch).not.toHaveProperty('wizardPart')
		expect(projectPlaylistProbeResult(PLAYLIST_PROBE, appState({wizardPart: part}), true)).toMatchObject({wizardPart: null, wizardChapters: []})
		expect(projectBulkStart(['https://youtu.be/a'], appState({wizardPart: part})).patch).toMatchObject({wizardPart: null})
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

	it('resets removal state on a scope reload result, so restore cannot re-add stale ids from the previous scope', () => {
		// reloadPlaylistWithScope calls this same projection but does not go
		// through projectProbeStart's reset — without resetting these fields
		// here too, an id removed from the previous scope's playlist would
		// still be sitting in removedSelectionIds and get re-added by
		// restoreRemovedPlaylistItems even though it no longer exists.
		const patch = projectPlaylistProbeResult(PLAYLIST_PROBE, appState({removedPlaylistItemIds: ['old-a'], removedSelectionIds: ['old-a']}), false)

		expect(patch.removedPlaylistItemIds).toEqual([])
		expect(patch.removedSelectionIds).toEqual([])
	})

	it('projects bulk start state without M3U and with YouTube extractor gating', () => {
		const projection = projectBulkStart(['https://www.youtube.com/watch?v=abc', 'https://youtu.be/def'], appState())

		expect(projection.allYouTubeVideos).toBe(true)
		expect(projection.patch).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'bulk', wizardExtractor: 'youtube', playlistTitle: 'Bulk URLs', wizardWriteM3u: false, bulkMetadataStatus: 'resolving'})
		expect(projection.patch.selectedPlaylistItemIds).toEqual(['bulk-1', 'bulk-2'])
	})

	// The Bulk review reads a former Radio link as the video alone, as before a
	// Mix became a list to offer; a plain mixed link keeps its path label and no id.
	it('keeps a video in a Mix a YouTube video row in the Bulk review', () => {
		const mix = 'https://www.youtube.com/watch?v=abc&list=RDabc&start_radio=1'
		const music = 'https://music.youtube.com/watch?v=def&list=RDCLAK5uy_x'
		const plain = 'https://www.youtube.com/watch?v=ghi&list=PLx'
		const projection = projectBulkStart([mix, music], appState())

		expect(projection.allYouTubeVideos).toBe(true)
		expect(projection.patch.playlistItems?.map(item => [item.title, item.videoId])).toEqual([
			['YouTube abc', 'abc'],
			['YouTube def', 'def']
		])
		const mixed = projectBulkStart([mix, plain], appState())
		expect(mixed.allYouTubeVideos).toBe(false)
		expect(mixed.patch.playlistItems?.[1]).toMatchObject({title: 'www.youtube.com/watch', videoId: null})
	})

	it('projects probe failure into the error step', () => {
		const error = {kind: 'other' as const, code: 'unknown' as const, message: 'failed'}

		expect(projectProbeFailure(error)).toMatchObject({wizardStep: 'error', formatsLoading: false, playlistProbeLoading: false, wizardError: error, wizardErrorOrigin: 'formats'})
	})
})

describe('ProbeResultProjection — job auth', () => {
	it('keeps a signed-in video probe auth for the single wizard item', () => {
		expect(projectVideoProbeResult({...VIDEO_PROBE, auth: 'exploreSession'}, appState(), true).wizardProbeAuth).toBe('exploreSession')
		expect(projectVideoProbeResult(VIDEO_PROBE, appState(), true).wizardProbeAuth).toBeUndefined()
	})

	it('entries keep the auth main put on them (an account-only playlist)', () => {
		const patch = projectPlaylistProbeResult({...PLAYLIST_PROBE, auth: 'exploreSession', entries: PLAYLIST_PROBE.entries.map(entry => ({...entry, auth: 'exploreSession' as const}))}, appState(), true)

		expect(patch.playlistItems?.map(entry => entry.auth)).toEqual(['exploreSession', 'exploreSession'])
	})

	it('a playlist enumerated signed in past a bot wall leaves its entries anonymous (R20)', () => {
		const patch = projectPlaylistProbeResult({...PLAYLIST_PROBE, auth: 'exploreSession'}, appState(), true)

		expect(patch.playlistItems?.every(entry => entry.auth === undefined)).toBe(true)
	})

	it('an anonymous playlist leaves its entries untouched', () => {
		const patch = projectPlaylistProbeResult(PLAYLIST_PROBE, appState(), true)

		expect(patch.playlistItems?.every(entry => !('auth' in entry))).toBe(true)
	})

	it('a bulk row seeded from a signed-in collection keeps the auth', () => {
		const projection = projectBulkStart(['https://youtu.be/a'], appState(), new Map([['https://youtu.be/a', {title: 'A', thumbnail: '', videoId: 'a', auth: 'exploreSession' as const}]]))

		expect(projection.playlistItems[0]?.auth).toBe('exploreSession')
	})

	it('a bulk start carries the lists cut at the load limit, and none by default', () => {
		const capped = [{url: 'https://www.youtube.com/playlist?list=PLx', title: 'Every lecture'}]

		expect(projectBulkStart(['https://youtu.be/a'], appState(), undefined, capped).patch.bulkCappedLists).toEqual(capped)
		expect(projectBulkStart(['https://youtu.be/a'], appState()).patch.bulkCappedLists).toEqual([])
	})
})
