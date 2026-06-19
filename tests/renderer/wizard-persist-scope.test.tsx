// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '../shared/fixtures.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'
import type {ProbeResult} from '@shared/types.js'

// Persistence scope rule: `single.*` settings (lastPreset, lastVideoResolution,
// lastAudioSelection, lastSubtitleLanguages, lastSubfolder*) only apply when
// the active extractor is YouTube. Cross-site contamination (a YT formatId
// surfacing as a default on Vimeo, "YouTube Music" subfolder leaking to
// PornHub) was the bug this scope rule prevents.
//
// Tests cover both directions: WRITE side (download done → settings.update)
// and READ side (probe → wizard restoration).

function buildVideoProbe(extractor: string): ProbeResult {
	return {
		kind: 'video',
		extractor,
		extractorKey: extractor,
		webpageUrl: 'https://example.com/x',
		isAudioOnlySource: false,
		formats: [
			{formatId: 'mp4-720', label: '720p mp4', ext: 'mp4', resolution: '720p', isVideoOnly: true, isAudioOnly: false},
			{formatId: 'aac-128', label: 'aac 128', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true}
		],
		title: 'Test',
		thumbnail: '',
		duration: 100,
		subtitles: {},
		automaticCaptions: {},
		isLive: false,
		hasDrm: false
	}
}

function resetStore(): void {
	useAppStore.setState({
		initialized: false,
		initializing: false,
		settings: null,
		wizardStep: 'url',
		wizardMode: 'single',
		formatsLoading: false,
		playlistProbeLoading: false,
		wizardUrl: '',
		wizardTitle: '',
		wizardThumbnail: '',
		wizardDuration: undefined,
		wizardFormats: [],
		wizardFormatsDegraded: null,
		wizardExtractor: '',
		wizardExtractorKey: '',
		wizardWebpageUrl: '',
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		activePreset: null,
		wizardOutputDir: '',
		wizardError: null,
		wizardErrorOrigin: null,
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: [],
		wizardSubtitleSkipped: false,
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		wizardSubfolderEnabled: false,
		wizardSubfolderName: '',
		wizardSponsorBlockMode: 'off',
		wizardSponsorBlockCategories: ['sponsor', 'selfpromo'],
		playlistItems: [],
		selectedPlaylistItemIds: [],
		playlistTitle: '',
		playlistId: '',
		playlistIsMultiVideo: false,
		cookiesConfigDialogIssue: null,
		playlistSelection: null,
		queue: []
	})
}

beforeEach(() => {
	resetStore()
	vi.clearAllMocks()
})

describe('persist scope — WRITE side', () => {
	it('YouTube run writes single + common settings on download', async () => {
		const updateMock = vi.fn().mockImplementation(async () => ok(buildAppSettings({})))
		const api = buildMockAppApi({settings: buildAppSettings({})})
		api.settings.update = updateMock
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('youtube')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://www.youtube.com/watch?v=x')
		await useAppStore.getState().submitUrl()
		await useAppStore.getState().addToQueue()

		expect(updateMock).toHaveBeenCalled()
		const lastPatch = updateMock.mock.calls[updateMock.mock.calls.length - 1][0]
		expect(lastPatch).toHaveProperty('common')
		expect(lastPatch).toHaveProperty('single')
	})

	it('non-YouTube run writes common only — no single patch (format/audio/subtitle/subfolder not contaminated)', async () => {
		const updateMock = vi.fn().mockImplementation(async () => ok(buildAppSettings({})))
		const api = buildMockAppApi({settings: buildAppSettings({})})
		api.settings.update = updateMock
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('vimeo')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://vimeo.com/123')
		await useAppStore.getState().submitUrl()
		await useAppStore.getState().addToQueue()

		expect(updateMock).toHaveBeenCalled()
		const lastPatch = updateMock.mock.calls[updateMock.mock.calls.length - 1][0]
		expect(lastPatch).toHaveProperty('common')
		expect(lastPatch.common).toHaveProperty('lastSubfolderEnabled')
		expect(lastPatch.common).toHaveProperty('lastSubfolder')
		expect(lastPatch).not.toHaveProperty('single')
	})

	it('common patch persists writeM3u so the playlist M3U toggle is remembered across sessions', async () => {
		const updateMock = vi.fn().mockImplementation(async () => ok(buildAppSettings({})))
		const api = buildMockAppApi({settings: buildAppSettings({})})
		api.settings.update = updateMock
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('youtube')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://www.youtube.com/watch?v=x')
		await useAppStore.getState().submitUrl()
		// Toggle off AFTER probe — submitUrl restores common prefs from settings,
		// so an earlier set would be clobbered by the restoration pass.
		useAppStore.getState().setWriteM3u(false)
		await useAppStore.getState().addToQueue()

		const lastPatch = updateMock.mock.calls[updateMock.mock.calls.length - 1][0]
		expect(lastPatch.common).toHaveProperty('writeM3u', false)
	})
})

describe('persist scope — READ side', () => {
	it('YouTube probe restores persisted lastPreset', async () => {
		const api = buildMockAppApi({settings: buildAppSettings({lastPreset: 'audio-only'})})
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('youtube')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://www.youtube.com/watch?v=x')
		await useAppStore.getState().submitUrl()

		expect(useAppStore.getState().activePreset).toBe('audio-only')
	})

	it('non-YouTube probe restores persisted subfolder settings', async () => {
		const api = buildMockAppApi({settings: buildAppSettings({lastSubfolderEnabled: true, lastSubfolder: 'Music'})})
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('vimeo')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://vimeo.com/123')
		await useAppStore.getState().submitUrl()

		expect(useAppStore.getState().wizardSubfolderEnabled).toBe(true)
		expect(useAppStore.getState().wizardSubfolderName).toBe('Music')
	})

	it('non-YouTube probe ignores persisted lastPreset (fresh defaults)', async () => {
		const api = buildMockAppApi({settings: buildAppSettings({lastPreset: 'audio-only'})})
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('vimeo')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://vimeo.com/123')
		await useAppStore.getState().submitUrl()

		// Without persist scope leaking, fresh default best-quality kicks in.
		expect(useAppStore.getState().activePreset).toBe('best-quality')
	})
})
