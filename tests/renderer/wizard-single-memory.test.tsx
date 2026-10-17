// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '../shared/fixtures.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'
import type {ProbeResult} from '@shared/types.js'

// A single-video run starts from the active download profile and remembers
// nothing afterwards: edits apply to that download only (keeping them is an
// explicit Save as profile). The old hidden memory — YouTube-only, and folder
// picks rewriting the global folder — is gone. Both directions are covered:
// WRITE (download done → no settings.update) and READ (probe → profile, never
// the last run's choices).

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
		wizardMediaKind: 'video',
		wizardOutputDir: '',
		wizardError: null,
		wizardErrorOrigin: null,
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: [],
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

describe('single-video memory — WRITE side', () => {
	it.each(['youtube', 'vimeo'])('a %s download writes no settings', async extractor => {
		const updateMock = vi.fn().mockImplementation(async () => ok(buildAppSettings({})))
		const api = buildMockAppApi({settings: buildAppSettings({})})
		api.settings.update = updateMock
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe(extractor)))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl(extractor === 'youtube' ? 'https://www.youtube.com/watch?v=x' : 'https://vimeo.com/123')
		await useAppStore.getState().submitUrl()
		useAppStore.getState().setSponsorBlockMode('remove')
		await useAppStore.getState().addToQueue()

		expect(updateMock).not.toHaveBeenCalled()
	})

	it('a folder picked for one download does not become the global folder', async () => {
		const updateMock = vi.fn().mockImplementation(async () => ok(buildAppSettings({})))
		const api = buildMockAppApi({settings: buildAppSettings({})})
		api.settings.update = updateMock
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('youtube')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://www.youtube.com/watch?v=x')
		await useAppStore.getState().submitUrl()
		await useAppStore.getState().setWizardOutputDir('/elsewhere', false)
		useAppStore.getState().back()

		expect(updateMock).not.toHaveBeenCalled()
		expect(useAppStore.getState().wizardOutputDir).toBe('/tmp')
	})
})

describe('single-video memory — READ side', () => {
	it("ignores the last run's subfolder and SponsorBlock choices: the profile decides", async () => {
		const api = buildMockAppApi({settings: buildAppSettings({lastSubfolderEnabled: true, lastSubfolder: 'Music', lastSponsorBlockMode: 'remove'})})
		api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('vimeo')))
		window.appApi = api

		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl('https://vimeo.com/123')
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.wizardProfile?.id).toBe('balanced')
		expect(state).toMatchObject({wizardSubfolderEnabled: true, wizardSubfolderName: 'Balanced 720p', wizardSponsorBlockMode: 'off'})
	})
})
