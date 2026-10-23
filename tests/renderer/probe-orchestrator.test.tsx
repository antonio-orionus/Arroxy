// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import type {ProbeError, ProbeResult} from '@shared/types.js'
import {ok, fail, type Result} from '@shared/result.js'
import {defaultAppSettings} from '@shared/constants.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {armQueue} from '../shared/quickDownloadHarness.js'
import {makeItem} from '../shared/fixtures.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {i18next} from '@shared/i18n/index.js'
import {multiProfileBreakdown} from '@renderer/store/wizard/downloadReviewProjection.js'
import {selectWizardReviewState} from '@renderer/store/wizard/wizardReviewState.js'

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

const VIDEO_PROBE: Extract<ProbeResult, {kind: 'video'}> = {
	kind: 'video',
	videoId: 'dQw4w9WgXcQ',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	webpageUrl: YOUTUBE_URL,
	isAudioOnlySource: false,
	formats: [
		{formatId: '137', label: '1080p', ext: 'mp4', resolution: '1080p', fps: 30, isVideoOnly: true, isAudioOnly: false},
		{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 160}
	],
	title: 'Test Video',
	thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
	duration: 212,
	subtitles: {en: [{ext: 'vtt'}]},
	automaticCaptions: {},
	isLive: false,
	hasDrm: false
}

const PLAYLIST_PROBE: Extract<ProbeResult, {kind: 'playlist'}> = {
	kind: 'playlist',
	extractor: 'youtube:playlist',
	extractorKey: 'YoutubePlaylist',
	webpageUrl: 'https://www.youtube.com/playlist?list=PLtest',
	isAudioOnlySource: false,
	playlistTitle: 'My Playlist',
	playlistId: 'PLtest',
	isMultiVideo: false,
	entries: [
		{id: 'e1', title: 'Entry 1', url: 'https://youtu.be/e1', thumbnail: '', duration: 60, playlistIndex: 1, videoId: 'e1'},
		{id: 'e2', title: 'Entry 2', url: 'https://youtu.be/e2', thumbnail: '', duration: 120, playlistIndex: 2, videoId: 'e2'}
	]
}

function playlistProbeWithEntries(count: number): Extract<ProbeResult, {kind: 'playlist'}> {
	return {
		...PLAYLIST_PROBE,
		entries: Array.from({length: count}, (_, index) => {
			const n = index + 1
			return {id: `e${n}`, title: `Entry ${n}`, url: `https://youtu.be/e${n}`, thumbnail: '', duration: 60, playlistIndex: n, videoId: `e${n}`}
		})
	}
}

function resetStore() {
	useAppStore.setState({...RESET_WIZARD_STATE, initialized: false, initializing: false, settings: null, wizardOutputDir: '', queue: []})
}

beforeEach(() => {
	resetStore()
	vi.clearAllMocks()
})

describe('submitUrl — video probe', () => {
	it('sets wizardStep=formats and populates formats on successful video probe', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(api.downloads.probe).toHaveBeenCalledWith({url: YOUTUBE_URL, playlistMode: 'video'})
		expect(state.wizardStep).toBe('formats')
		expect(state.wizardFormats).toHaveLength(2)
		expect(state.wizardTitle).toBe('Test Video')
		expect(state.wizardExtractor).toBe('youtube')
		expect(state.formatsLoading).toBe(false)
	})

	it('populates subtitle pool from probe result', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.wizardSubtitles).toEqual({en: [{ext: 'vtt'}]})
	})

	it('sets wizardStep=error on probe failure', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'Bot block'}))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.wizardStep).toBe('error')
		expect(state.wizardError).not.toBeNull()
		expect(state.formatsLoading).toBe(false)
	})

	it('opens the mixed URL prompt without probing when the URL carries video and collection intent', async () => {
		const api = buildMockAppApi()
		window.appApi = api

		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl})
		await useAppStore.getState().submitUrl()

		expect(api.downloads.probe).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'wizard'})
	})

	it('a retry of a failed list Review on a video-in-a-list link loads the list again, without asking', async () => {
		const api = buildMockAppApi()
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		vi.mocked(api.downloads.probe)
			.mockResolvedValueOnce(fail({kind: 'other', code: 'unknown', message: 'Bot block'}))
			.mockResolvedValueOnce(ok(PLAYLIST_PROBE))
		window.appApi = api

		await useAppStore.getState().openPlaylistReview(mixedUrl, 'playlist', 'row-1')
		expect(useAppStore.getState().wizardStep).toBe('error')
		await useAppStore.getState().retry()

		const state = useAppStore.getState()
		expect(state.mixedUrlPromptOpen).toBe(false)
		expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		expect(api.downloads.probe).toHaveBeenLastCalledWith(expect.objectContaining({url: mixedUrl, playlistMode: 'playlist'}))
		expect(state).toMatchObject({wizardStep: 'playlistItems', reviewSourceRowId: 'row-1', formatsLoading: false})
		expect(state.playlistItems).toHaveLength(2)
	})

	// #665: the row was placed with Audio only into /music; the active profile is another.
	it('a Review starts every picked video from the profile and folder its row was placed with', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api
		const settings = defaultAppSettings('/tmp/downloads')
		const row = makeItem({
			id: 'row-1',
			status: 'needs-choice',
			choice: {kind: 'list-size', loaded: 2, capped: false},
			url: PLAYLIST_PROBE.webpageUrl,
			job: {kind: 'unresolved', extractor: '', extractorKey: ''},
			probeMode: 'playlist',
			pinnedProfile: {ref: {kind: 'builtin', id: 'audio-only'}, outputContext: {currentOutputDir: '/music', defaultOutputDir: '/tmp/downloads'}}
		})
		useAppStore.setState({settings, wizardOutputDir: '/tmp/downloads', queue: [row]})

		await useAppStore.getState().openPlaylistReview(PLAYLIST_PROBE.webpageUrl, 'playlist', 'row-1')
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', multiProfileMode: true, wizardOutputDir: '/tmp/downloads'})
		// Continue goes to the per-video profiles: this mode has no presets.
		useAppStore.getState().confirmPlaylistSelection()
		expect(useAppStore.getState().wizardStep).toBe('playlistProfiles')
		// The row may leave Downloads meanwhile; the Review keeps its profile.
		useAppStore.setState({queue: []})
		expect(multiProfileBreakdown(selectWizardReviewState(useAppStore.getState())).map(row => row.profileId)).toEqual(['audio-only'])
		await useAppStore.getState().addToQueue()

		const items = vi.mocked(api.queue.cmd.replaceProbing).mock.calls[0]?.[0].items ?? []
		const audioOnly = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'audio-only')
		expect(items).toHaveLength(2)
		for (const item of items) {
			expect(item.formatLabel).toBe(audioOnly ? profileFormatLabel(audioOnly, i18next.t, i18next.language) : '')
			expect(item.outputDir.startsWith('/tmp/downloads')).toBe(true)
		}
	})

	it("a Review's video given another profile takes it; the others keep the row's", async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api
		const settings = defaultAppSettings('/tmp/downloads')
		const row = makeItem({
			id: 'row-1',
			status: 'needs-choice',
			choice: {kind: 'list-size', loaded: 2, capped: false},
			url: PLAYLIST_PROBE.webpageUrl,
			job: {kind: 'unresolved', extractor: '', extractorKey: ''},
			probeMode: 'playlist',
			pinnedProfile: {ref: {kind: 'builtin', id: 'audio-only'}, outputContext: {defaultOutputDir: '/tmp/downloads'}}
		})
		useAppStore.setState({settings, wizardOutputDir: '/tmp/downloads', queue: [row]})
		await useAppStore.getState().openPlaylistReview(PLAYLIST_PROBE.webpageUrl, 'playlist', 'row-1')

		useAppStore.getState().assignPlaylistProfile(['e1'], settings.profiles.active)
		useAppStore.getState().assignPlaylistProfile(['e2'], {kind: 'builtin', id: 'audio-only'})
		expect(useAppStore.getState().playlistProfileAssignments).toEqual({e1: settings.profiles.active})
		await useAppStore.getState().addToQueue()

		const items = vi.mocked(api.queue.cmd.replaceProbing).mock.calls[0]?.[0].items ?? []
		const label = (id: string): string => {
			const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
			return profile ? profileFormatLabel(profile, i18next.t, i18next.language) : ''
		}
		expect(items.map(item => item.formatLabel)).toEqual([label(settings.profiles.active.id), label('audio-only')])
	})

	it("keeps the row's profile when every picked video was already queued, and the list stays open", async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api
		const pinnedProfile = {ref: {kind: 'builtin', id: 'audio-only'}, outputContext: {defaultOutputDir: '/tmp/downloads'}} as const
		const row = makeItem({id: 'row-1', status: 'needs-choice', choice: {kind: 'list-size', loaded: 2, capped: false}, url: PLAYLIST_PROBE.webpageUrl, job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'playlist', pinnedProfile})
		const queued = PLAYLIST_PROBE.entries.map(entry => makeItem({id: `q-${entry.id}`, status: 'pending', url: entry.url}))
		useAppStore.setState({settings: defaultAppSettings('/tmp/downloads'), wizardOutputDir: '/tmp/downloads', queue: [row, ...queued]})
		await useAppStore.getState().openPlaylistReview(PLAYLIST_PROBE.webpageUrl, 'playlist', 'row-1')

		await useAppStore.getState().addToQueue()

		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', reviewSourceRowId: null, reviewPinnedProfile: pinnedProfile})
	})

	it('a retry whose list lands first takes the saved list settings, as a first load does', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe)
			.mockResolvedValueOnce(fail({kind: 'other', code: 'unknown', message: 'Bot block'}))
			.mockResolvedValueOnce(ok(PLAYLIST_PROBE))
		window.appApi = api
		const settings = defaultAppSettings('/tmp/downloads')
		useAppStore.setState({settings: {...settings, common: {...settings.common, lastSubfolderEnabled: true, lastSubfolder: 'Saved folder'}}})

		await useAppStore.getState().openPlaylistReview(`${YOUTUBE_URL}&list=PLtest`, 'playlist', 'row-1')
		await useAppStore.getState().retry()

		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', wizardSubfolderEnabled: true, wizardSubfolderName: 'Saved folder'})
	})

	it('sets formatsLoading=true during probe and false after', async () => {
		const api = buildMockAppApi()
		let resolveProbe!: (v: Result<ProbeResult, ProbeError>) => void
		vi.mocked(api.downloads.probe).mockReturnValue(
			new Promise<Result<ProbeResult, ProbeError>>(res => {
				resolveProbe = res
			})
		)
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL})
		const probePromise = useAppStore.getState().submitUrl()

		expect(useAppStore.getState().formatsLoading).toBe(true)

		resolveProbe(ok(VIDEO_PROBE))
		await probePromise

		expect(useAppStore.getState().formatsLoading).toBe(false)
	})
})

describe('quickDownload', () => {
	it('ignores unrelated probe progress without notifying store subscribers', async () => {
		const api = buildMockAppApi()
		window.appApi = api

		await useAppStore.getState().initialize()
		const progressListener = vi.mocked(api.events.onProbeProgress).mock.calls.at(-1)?.[0]
		expect(progressListener).toBeDefined()
		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=active', playlistProbeLoading: true, playlistProbeProgress: null})
		const subscriber = vi.fn()
		const unsubscribe = useAppStore.subscribe(subscriber)

		progressListener?.({url: 'https://www.youtube.com/playlist?list=stale', playlistMode: 'playlist', phase: 'pages', loaded: 3, at: new Date().toISOString()})

		expect(subscriber).not.toHaveBeenCalled()
		expect(useAppStore.getState().playlistProbeProgress).toBeNull()
		unsubscribe()
	})

	// A single link's Quick Download prepares in the background: a placeholder
	// row is swapped for what the probe prepared (see quick-download-pipeline).
	async function swapped(api: ReturnType<typeof buildMockAppApi>) {
		await vi.waitFor(() => expect(api.queue.cmd.replaceProbing).toHaveBeenCalled())
		return vi.mocked(api.queue.cmd.replaceProbing).mock.calls[0]?.[0].items ?? []
	}

	it('opens the mixed URL prompt instead of silently forcing a watch/list URL to single-video mode', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		const settings = defaultAppSettings('/tmp/downloads')
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp/downloads', settings})

		await useAppStore.getState().quickDownload({url: mixedUrl, entry: 'url-tab'})

		// Nothing is taken in until the prompt is answered.
		expect(api.intake.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardUrl: mixedUrl, mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'url-tab'})
	})

	it.each(['&list=RDdQw4w9WgXcQ&start_radio=1', '&list=RDCLAK5uy_test', '&list=PLtest&start_radio=1'])('asks about a video in a Mix or Music playlist too (%s)', async suffix => {
		const api = buildMockAppApi()
		window.appApi = api
		const mixUrl = `${YOUTUBE_URL}${suffix}`
		useAppStore.setState({wizardUrl: mixUrl, settings: defaultAppSettings('/tmp/downloads')})

		await useAppStore.getState().quickDownload({url: mixUrl, entry: 'url-tab'})
		expect(useAppStore.getState()).toMatchObject({mixedUrlPromptOpen: true, mixedUrlPending: mixUrl, mixedUrlPromptSource: 'url-tab'})

		useAppStore.setState({mixedUrlPromptOpen: false, mixedUrlPending: null, mixedUrlPromptSource: null})
		await useAppStore.getState().submitUrl()
		expect(useAppStore.getState()).toMatchObject({mixedUrlPromptOpen: true, mixedUrlPending: mixUrl, mixedUrlPromptSource: 'wizard'})
		expect(api.downloads.probe).not.toHaveBeenCalled()
	})

	it('This video queues the video of a mixed link with no question', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		armQueue(api)
		window.appApi = api

		const settings = defaultAppSettings('/tmp/downloads')
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp/downloads', settings: {...settings, common: {...settings.common, rememberLastOutputDir: false, clipboardWatchEnabled: false, filenameTemplate: '{title} [{id}]'}}})

		await useAppStore.getState().quickDownload({url: mixedUrl, entry: 'url-tab', playlistMode: 'video'})
		expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false)

		await vi.waitFor(() => expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'video', ownerKey: expect.any(String), playlistScope: {items: {kind: 'first', count: 100}}}))
		const [queued] = await swapped(api)
		expect(queued).toMatchObject({
			url: VIDEO_PROBE.webpageUrl,
			title: 'Test Video',
			outputDir: '/tmp/downloads/Balanced 720p',
			status: 'pending',
			lane: 'normal',
			// Bound, not the token form: the probe supplied both title and id, so
			// the job carries the name that will actually be written.
			job: expect.objectContaining({kind: 'ranged-format', extractor: 'youtube', extractorKey: 'Youtube', intent: {kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'auto', audio: {native: {kind: 'default'}}}, filenameTemplate: 'Test Video [dQw4w9WgXcQ]'})
		})
		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('queues exactly the first N of the playlist when the list dialog answers the first N', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		armQueue(api)
		window.appApi = api

		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp', settings})

		await useAppStore.getState().quickDownload({url: mixedUrl, entry: 'url-tab'})
		await useAppStore.getState().dismissMixedPrompt({kind: 'first', count: 250})

		await vi.waitFor(() => expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'playlist', playlistScope: {items: {kind: 'first', count: 250}}, ownerKey: expect.any(String)}))
		const items = await swapped(api)
		expect(items).toHaveLength(2)
		expect(items.every(item => item.job.kind === 'ranged-format')).toBe(true)
		expect(items.every(item => item.playlistGroupId === items[0]?.playlistGroupId)).toBe(true)
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('answers an Explore prompt: the list in the background with no take, the first N with one', async () => {
		const api = buildMockAppApi()
		window.appApi = api
		const realQuickDownload = useAppStore.getState().quickDownload
		const quickDownload = vi.fn(async () => {})
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, playlistProbeLimit: 250}}, quickDownload})
		try {
			useAppStore.setState({mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'explore'})
			await useAppStore.getState().dismissMixedPrompt({kind: 'first', count: 250})
			expect(quickDownload).toHaveBeenLastCalledWith({url: mixedUrl, entry: 'explore', playlistMode: 'playlist', take: {kind: 'first', count: 250}})
			expect(useAppStore.getState()).toMatchObject({mixedUrlPromptOpen: false, mixedUrlPending: null, mixedUrlPromptSource: null})

			useAppStore.setState({mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'explore'})
			await useAppStore.getState().dismissMixedPrompt({kind: 'list'})
			expect(quickDownload).toHaveBeenLastCalledWith({url: mixedUrl, entry: 'explore', playlistMode: 'playlist'})
		} finally {
			useAppStore.setState({quickDownload: realQuickDownload})
		}
	})

	it('loads the first N the Interactive prompt promises, not a custom range left over from an earlier list', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, playlistScope: {items: {kind: 'range', from: 10, to: 20}}, mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'wizard'})

		await useAppStore.getState().dismissMixedPrompt({kind: 'pick'})

		expect(api.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: mixedUrl, playlistMode: 'playlist', playlistScope: {items: {kind: 'app-limit'}}}))
	})

	it.each([
		['url-tab', 'download'],
		['explore', 'explore']
	] as const)('opens the picker from the %s list dialog, landing the wizard where it came from', async (source, origin) => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: '', wizardOrigin: 'download', reviewSourceRowId: 'row-1', settings: defaultAppSettings('/tmp'), mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: source})

		await useAppStore.getState().dismissMixedPrompt({kind: 'pick'})

		expect(api.intake.add).not.toHaveBeenCalled()
		expect(api.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: mixedUrl, playlistMode: 'playlist', playlistScope: {items: {kind: 'app-limit'}}}))
		expect(useAppStore.getState()).toMatchObject({wizardUrl: mixedUrl, wizardOrigin: origin, reviewSourceRowId: null, wizardStep: 'playlistItems'})
	})

	it('opens the cookies config dialog instead of probing when the Interactive prompt answers with an incomplete cookie setup', async () => {
		const api = buildMockAppApi()
		window.appApi = api
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		const defaults = defaultAppSettings('/tmp')
		useAppStore.setState({wizardUrl: mixedUrl, settings: {...defaults, common: {...defaults.common, cookiesMode: 'file', cookiesPath: ''}}, mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'wizard'})

		await useAppStore.getState().dismissMixedPrompt({kind: 'pick'})

		expect(api.downloads.probe).not.toHaveBeenCalled()
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path')
	})

	it("Interactive's Just this video drops the list from the link, so a retry neither asks again nor loads the list", async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'Bot block'}))
		window.appApi = api
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest&index=3`
		useAppStore.setState({wizardUrl: mixedUrl, settings: defaultAppSettings('/tmp'), mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'wizard'})

		await useAppStore.getState().dismissMixedPrompt({kind: 'video'})
		expect(api.downloads.probe).toHaveBeenLastCalledWith(expect.objectContaining({url: YOUTUBE_URL, playlistMode: 'video'}))
		expect(useAppStore.getState().wizardUrl).toBe(YOUTUBE_URL)

		await useAppStore.getState().retry()
		expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false)
		expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		expect(api.downloads.probe).toHaveBeenLastCalledWith(expect.objectContaining({url: YOUTUBE_URL}))

		await useAppStore.getState().retryFormatProbe()
		expect(api.downloads.probe).toHaveBeenLastCalledWith(expect.objectContaining({url: YOUTUBE_URL}))
	})

	it('opens the cookies config dialog instead of probing when the Interactive prompt answers Just this video with an incomplete cookie setup', async () => {
		const api = buildMockAppApi()
		window.appApi = api
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		const defaults = defaultAppSettings('/tmp')
		useAppStore.setState({wizardUrl: mixedUrl, settings: {...defaults, common: {...defaults.common, cookiesMode: 'file', cookiesPath: ''}}, mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'wizard'})

		await useAppStore.getState().dismissMixedPrompt({kind: 'video'})

		expect(api.downloads.probe).not.toHaveBeenCalled()
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path')
	})

	it('works on first launch with default profile settings', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		armQueue(api)
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp/first-launch-downloads', settings: defaultAppSettings('/tmp/first-launch-downloads')})

		await useAppStore.getState().quickDownload({url: YOUTUBE_URL, entry: 'url-tab'})

		const [queued] = await swapped(api)
		expect(queued).toMatchObject({outputDir: '/tmp/first-launch-downloads/Balanced 720p', formatLabel: 'Up to 720p · Best picture', job: expect.objectContaining({kind: 'ranged-format', intent: {kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'auto', audio: {native: {kind: 'default'}}}})})
		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('queues every loaded playlist entry with the active profile', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		armQueue(api)
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownload({url: 'https://www.youtube.com/playlist?list=PLtest', entry: 'url-tab'})

		await vi.waitFor(() => expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://www.youtube.com/playlist?list=PLtest', playlistMode: 'playlist', ownerKey: expect.any(String), playlistScope: {items: {kind: 'first', count: 100}}}))
		const items = await swapped(api)
		expect(items).toHaveLength(2)
		expect(items.every(item => item.job.kind === 'ranged-format')).toBe(true)
		expect(items.every(item => item.playlistGroupId === items[0]?.playlistGroupId)).toBe(true)
		expect(api.playlist.registerManifest).toHaveBeenCalledWith(
			expect.objectContaining({
				playlistTitle: 'My Playlist',
				items: [
					{videoId: 'e1', title: 'Entry 1', duration: 60},
					{videoId: 'e2', title: 'Entry 2', duration: 120}
				]
			})
		)
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('asks for a review on the row instead of silently queueing when an unknown URL probes as a playlist', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok({...PLAYLIST_PROBE, webpageUrl: 'https://example.com/course'}))
		armQueue(api)
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://example.com/course', wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownload({url: 'https://example.com/course', entry: 'url-tab'})

		await vi.waitFor(() => expect(useAppStore.getState().queue).toMatchObject([{status: 'needs-choice', choice: {kind: 'list-size', loaded: 2, capped: false}, title: 'My Playlist'}]))
		expect(api.queue.cmd.replaceProbing).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url'})
	})

	it('asks how many to queue on the row when a playlist quick scan is capped', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(101)))
		armQueue(api)
		window.appApi = api

		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', wizardOutputDir: '/tmp', settings: {...settings, common: {...settings.common, playlistProbeLimit: 100}}})
		await useAppStore.getState().quickDownload({url: 'https://www.youtube.com/playlist?list=PLtest', entry: 'url-tab'})

		await vi.waitFor(() => expect(useAppStore.getState().queue).toMatchObject([{status: 'needs-choice', choice: {kind: 'list-size', loaded: 100, capped: true}}]))
		expect(api.queue.cmd.replaceProbing).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url', playlistItems: []})
	})

	it('keeps the URL when the row cannot be placed', async () => {
		const api = buildMockAppApi()
		// Main refuses to place the row.
		vi.mocked(api.intake.add).mockResolvedValue(ok({kind: 'not-added'}))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp'})
		await useAppStore.getState().quickDownload({url: YOUTUBE_URL, entry: 'url-tab'})

		expect(api.intake.add).toHaveBeenCalledWith(expect.objectContaining({url: YOUTUBE_URL}))
		expect(useAppStore.getState().wizardUrl).toBe(YOUTUBE_URL)
	})

	it('opens the cookies config dialog without probing when cookies settings are incomplete', async () => {
		const api = buildMockAppApi()
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp', settings: {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, rememberLastOutputDir: false, clipboardWatchEnabled: false, cookiesMode: 'file', cookiesPath: ''}}})

		await useAppStore.getState().quickDownload({url: YOUTUBE_URL, entry: 'url-tab'})

		expect(api.intake.add).not.toHaveBeenCalled()
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path')
	})
})

describe('submitUrl — playlist probe', () => {
	it('sets wizardStep=playlistItems and populates entries', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest'})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.wizardStep).toBe('playlistItems')
		expect(state.wizardMode).toBe('playlist')
		expect(state.playlistItems).toHaveLength(2)
		expect(state.playlistTitle).toBe('My Playlist')
		expect(state.formatsLoading).toBe(false)
	})

	it('auto-selects all playlist entries', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest'})
		await useAppStore.getState().submitUrl()

		const {selectedPlaylistItemIds, playlistItems} = useAppStore.getState()
		expect(selectedPlaylistItemIds).toEqual(playlistItems.map(e => e.id))
	})

	it('threads playlist scope into playlist probes', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', playlistScope: {items: {kind: 'range', from: 10, to: 20}}})
		await useAppStore.getState().submitUrl()

		expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://www.youtube.com/playlist?list=PLtest', playlistMode: 'playlist', playlistScope: {items: {kind: 'range', from: 10, to: 20}}})
	})

	it('keeps playlist-step range selection as selection-only', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest'})
		await useAppStore.getState().submitUrl()
		vi.mocked(api.downloads.probe).mockClear()

		useAppStore.getState().selectPlaylistRange(2, 2)

		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['e2'])
		expect(api.downloads.probe).not.toHaveBeenCalled()
	})

	it('selectAllPlaylistItems excludes removed rows (I3)', async () => {
		// Without filtering against removedPlaylistItemIds, "Select all" would
		// over-count: the removed row isn't rendered, so there's no checkbox left
		// to uncheck and correct the count.
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest'})
		await useAppStore.getState().submitUrl()

		useAppStore.getState().removePlaylistItems(['e1'])
		useAppStore.getState().selectAllPlaylistItems()

		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['e2'])
	})

	it('selectPlaylistRange excludes removed rows within the range (I3)', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest'})
		await useAppStore.getState().submitUrl()

		useAppStore.getState().removePlaylistItems(['e1'])
		useAppStore.getState().selectPlaylistRange(1, 2)

		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['e2'])
	})

	it('trims the sentinel entry and marks the playlist as likely capped', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(101)))
		armQueue(api)
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', settings: {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100}}})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.playlistItems).toHaveLength(100)
		expect(state.selectedPlaylistItemIds).toHaveLength(100)
		expect(state.playlistLikelyCapped).toBe(true)
	})

	it('does not mark an exact-limit playlist as capped without a sentinel entry', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(100)))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', settings: {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100}}})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.playlistItems).toHaveLength(100)
		expect(state.playlistLikelyCapped).toBe(false)
	})

	it('trims first-count scoped probes without showing the app-limit cap alert', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(51)))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', playlistScope: {items: {kind: 'first', count: 50}}, settings: {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100}}})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.playlistItems).toHaveLength(50)
		expect(state.playlistLikelyCapped).toBe(false)
	})

	it('trims range scoped probes to the requested inclusive count', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(102)))
		window.appApi = api

		useAppStore.setState({
			wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
			playlistScope: {items: {kind: 'range', from: 500, to: 600}},
			settings: {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100}}
		})
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.playlistItems).toHaveLength(101)
		expect(state.playlistLikelyCapped).toBe(false)
	})

	it('logs scoped playlist reload start and success diagnostics', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(51)))
		window.appApi = api

		useAppStore.setState({wizardStep: 'playlistItems', wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', playlistItems: PLAYLIST_PROBE.entries, selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map(entry => entry.id), playlistScope: {items: {kind: 'app-limit'}}})

		const requestedScope = {items: {kind: 'first' as const, count: 50}}
		await useAppStore.getState().reloadPlaylistWithScope(requestedScope)

		expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
			expect.objectContaining({transition: 'playlistScopeReloadStart', fromStep: 'playlistItems', toStep: 'playlistItems', snapshot: expect.objectContaining({requestedScope, previousScope: {items: {kind: 'app-limit'}}, previousItemsCount: 2, playlistItemsCount: 2, selectedPlaylistItemsCount: 2})})
		)
		expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
			expect.objectContaining({transition: 'playlistScopeReloadSuccess', fromStep: 'playlistItems', toStep: 'playlistItems', snapshot: expect.objectContaining({requestedScope, previousItemsCount: 2, returnedEntryCount: 51, visibleItemsCount: 50, playlistItemsCount: 50, selectedPlaylistItemsCount: 50})})
		)
	})

	it('logs scoped playlist reload failures with the restored scope', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'playlist_empty', message: 'Playlist returned no entries'}))
		window.appApi = api

		useAppStore.setState({wizardStep: 'playlistItems', wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', playlistItems: PLAYLIST_PROBE.entries, selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map(entry => entry.id), playlistScope: {items: {kind: 'app-limit'}}, playlistLikelyCapped: true})

		const requestedScope = {items: {kind: 'range' as const, from: 900, to: 950}}
		await useAppStore.getState().reloadPlaylistWithScope(requestedScope)

		expect(useAppStore.getState().playlistLikelyCapped).toBe(true)
		expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
			expect.objectContaining({
				transition: 'playlistScopeReloadFailure',
				fromStep: 'playlistItems',
				toStep: 'playlistItems',
				snapshot: expect.objectContaining({requestedScope, restoredScope: {items: {kind: 'app-limit'}}, previousItemsCount: 2, playlistItemsCount: 2, selectedPlaylistItemsCount: 2, errorKind: 'other', message: 'No videos matched that playlist scope. Your previous list is still shown.'})
			})
		)
	})

	it('restores playlist state and logs when scoped playlist reload throws', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockRejectedValue(new Error('IPC bridge crashed'))
		window.appApi = api

		useAppStore.setState({wizardStep: 'playlistItems', wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', playlistItems: PLAYLIST_PROBE.entries, selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map(entry => entry.id), playlistScope: {items: {kind: 'app-limit'}}, playlistLikelyCapped: true})

		const requestedScope = {items: {kind: 'range' as const, from: 900, to: 950}}
		await useAppStore.getState().reloadPlaylistWithScope(requestedScope)

		expect(useAppStore.getState().playlistScope).toEqual({items: {kind: 'app-limit'}})
		expect(useAppStore.getState().playlistLikelyCapped).toBe(true)
		expect(useAppStore.getState().playlistScopeReloading).toBe(false)
		expect(useAppStore.getState().playlistScopeError).toBe('Could not reload that playlist scope: IPC bridge crashed. Your previous list is still shown.')
		expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
			expect.objectContaining({
				transition: 'playlistScopeReloadFailure',
				fromStep: 'playlistItems',
				toStep: 'playlistItems',
				snapshot: expect.objectContaining({requestedScope, restoredScope: {items: {kind: 'app-limit'}}, previousItemsCount: 2, playlistItemsCount: 2, selectedPlaylistItemsCount: 2, errorKind: 'exception', message: 'Could not reload that playlist scope: IPC bridge crashed. Your previous list is still shown.'})
			})
		)
	})

	it('clears a stuck resolving status when a scope reload returns no placeholders', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({
			wizardStep: 'playlistItems',
			wizardMode: 'playlist',
			wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
			playlistItems: PLAYLIST_PROBE.entries,
			selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map(entry => entry.id),
			playlistScope: {items: {kind: 'app-limit'}},
			bulkMetadataStatus: 'resolving',
			bulkMetadataCompleted: 1,
			bulkMetadataTotal: 2,
			bulkMetadataById: {e1: 'resolving', e2: 'pending'}
		})

		await useAppStore.getState().reloadPlaylistWithScope({items: {kind: 'first' as const, count: 50}})

		const state = useAppStore.getState()
		expect(state.bulkMetadataStatus).toBe('done')
		expect(state.bulkMetadataById).toEqual({})
	})

	it('restarts placeholder hydration for the restored list after a failed scope reload', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async (input: {url: string; playlistMode?: string}) => {
			if (input.playlistMode === 'playlist') return fail({kind: 'other', code: 'unknown', message: 'Reload failed'})
			return ok({...VIDEO_PROBE, webpageUrl: input.url, title: 'Recovered Title'})
		})
		window.appApi = api

		const placeholder = {id: '1::https://example.com/p1', url: 'https://example.com/p1', title: 'Untitled · #1', thumbnail: '', playlistIndex: 1, videoId: null, titleIsPlaceholder: true as const}
		useAppStore.setState({
			wizardStep: 'playlistItems',
			wizardMode: 'playlist',
			wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
			playlistItems: [placeholder],
			selectedPlaylistItemIds: [placeholder.id],
			playlistScope: {items: {kind: 'app-limit'}},
			bulkMetadataStatus: 'resolving',
			bulkMetadataCompleted: 0,
			bulkMetadataTotal: 1,
			bulkMetadataById: {[placeholder.id]: 'resolving'}
		})

		await useAppStore.getState().reloadPlaylistWithScope({items: {kind: 'first' as const, count: 50}})

		// Failure restores the previous list and resumes its hydration on a new run.
		expect(useAppStore.getState().playlistItems).toHaveLength(1)
		await vi.waitFor(() => {
			expect(vi.mocked(api.downloads.probe).mock.calls.some(call => call[0].playlistMode === 'video')).toBe(true)
		})
		await vi.waitFor(() => {
			expect(useAppStore.getState().playlistItems[0]?.title).toBe('Recovered Title')
		})
		expect(useAppStore.getState().playlistItems[0]?.titleIsPlaceholder).toBeUndefined()
	})
})

describe('bulk URL mode', () => {
	it('enters playlistItems with synthetic bulk entries before metadata probes resolve', () => {
		const api = buildMockAppApi()
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://vimeo.com/1', 'https://example.com/video/2'])

		const state = useAppStore.getState()
		expect(state.wizardStep).toBe('playlistItems')
		expect(state.wizardMode).toBe('bulk')
		expect(state.playlistTitle).toBe('Bulk URLs')
		expect(state.playlistItems.map(item => item.title)).toEqual(['vimeo.com/1', 'example.com/video/2'])
		expect(state.bulkMetadataStatus).toBe('resolving')
		expect(state.bulkMetadataCompleted).toBe(0)
		expect(state.bulkMetadataTotal).toBe(2)
		expect(state.bulkMetadataById).toEqual({'bulk-1': 'resolving', 'bulk-2': 'resolving'})
		expect(state.selectedPlaylistItemIds).toEqual(state.playlistItems.map(item => item.id))
		expect(state.wizardExtractor).toBe('')
		expect(state.wizardWriteM3u).toBe(false)
	})

	it('hydrates bulk titles, thumbnails, durations, and video ids from yt-dlp probes', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async ({url}) =>
			ok({
				...VIDEO_PROBE,
				title: url.endsWith('/1') ? 'Resolved One' : 'Resolved Two',
				thumbnail: url.endsWith('/1') ? 'https://img.example/one.jpg' : 'https://img.example/two.jpg',
				duration: url.endsWith('/1') ? 11 : 22,
				videoId: url.endsWith('/1') ? 'one-id' : 'two-id',
				probeInfoJsonRef: {id: url.endsWith('/1') ? '00000000-0000-4000-8000-000000000001' : '00000000-0000-4000-8000-000000000002', createdAt: '2026-06-14T00:00:00.000Z', videoId: url.endsWith('/1') ? 'one-id' : 'two-id'}
			})
		)
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://vimeo.com/1', 'https://example.com/video/2'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().playlistItems.map(item => item.title)).toEqual(['Resolved One', 'Resolved Two'])
		})
		expect(useAppStore.getState().playlistItems.map(item => item.thumbnail)).toEqual(['https://img.example/one.jpg', 'https://img.example/two.jpg'])
		expect(useAppStore.getState().playlistItems.map(item => item.duration)).toEqual([11, 22])
		expect(useAppStore.getState().playlistItems.map(item => item.videoId)).toEqual(['one-id', 'two-id'])
		expect(useAppStore.getState().playlistItems.map(item => item.probeInfoJsonRef?.videoId)).toEqual(['one-id', 'two-id'])
		expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
		expect(useAppStore.getState().bulkMetadataCompleted).toBe(2)
		expect(useAppStore.getState().bulkMetadataById).toEqual({'bulk-1': 'done', 'bulk-2': 'done'})
		expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://vimeo.com/1', playlistMode: 'video', timeoutMs: 180_000})
		expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://example.com/video/2', playlistMode: 'video', timeoutMs: 180_000})
	})

	it('keeps synthetic bulk metadata when a probe fails or returns a playlist', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://vimeo.com/1', 'https://example.com/video/2'])

		await vi.waitFor(() => {
			expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		})
		expect(useAppStore.getState().playlistItems.map(item => item.title)).toEqual(['vimeo.com/1', 'example.com/video/2'])
		expect(useAppStore.getState().playlistItems.map(item => item.videoId)).toEqual([null, null])
		expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
		expect(useAppStore.getState().bulkMetadataCompleted).toBe(2)
		expect(useAppStore.getState().bulkMetadataById).toEqual({'bulk-1': 'failed', 'bulk-2': 'failed'})
	})

	it('limits bulk metadata probes to two concurrent URLs', async () => {
		const api = buildMockAppApi()
		const resolvers: ((value: Result<ProbeResult, ProbeError>) => void)[] = []
		function resolveProbeAt(index: number, value: Result<ProbeResult, ProbeError>): void {
			const resolve = resolvers[index]
			if (!resolve) throw new Error(`missing bulk metadata resolver ${index}`)
			resolve(value)
		}
		vi.mocked(api.downloads.probe).mockImplementation(
			() =>
				new Promise(resolve => {
					resolvers.push(resolve)
				})
		)
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://example.com/1', 'https://example.com/2', 'https://example.com/3'])

		expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		expect(useAppStore.getState().bulkMetadataById).toEqual({'bulk-1': 'resolving', 'bulk-2': 'resolving', 'bulk-3': 'pending'})

		resolveProbeAt(0, ok({...VIDEO_PROBE, title: 'Resolved One', videoId: 'one-id'}))

		await vi.waitFor(() => {
			expect(api.downloads.probe).toHaveBeenCalledTimes(3)
		})
		expect(useAppStore.getState().bulkMetadataById['bulk-3']).toBe('resolving')

		resolveProbeAt(1, ok({...VIDEO_PROBE, title: 'Resolved Two', videoId: 'two-id'}))
		resolveProbeAt(2, ok({...VIDEO_PROBE, title: 'Resolved Three', videoId: 'three-id'}))

		await vi.waitFor(() => {
			expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
		})
		expect(useAppStore.getState().bulkMetadataById).toEqual({'bulk-1': 'done', 'bulk-2': 'done', 'bulk-3': 'done'})
	})

	it('cancels bulk metadata probes and prevents pending probes after reset', async () => {
		const api = buildMockAppApi()
		const resolvers: ((value: Result<ProbeResult, ProbeError>) => void)[] = []
		vi.mocked(api.downloads.probe).mockImplementation(
			() =>
				new Promise(resolve => {
					resolvers.push(resolve)
				})
		)
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://example.com/1', 'https://example.com/2', 'https://example.com/3'])
		expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		vi.mocked(api.downloads.probeCancel).mockClear()

		useAppStore.getState().reset()

		expect(api.downloads.probeCancel).toHaveBeenCalledTimes(1)
		expect(useAppStore.getState().wizardStep).toBe('url')
		resolvers[0]?.(ok({...VIDEO_PROBE, title: 'Stale One', videoId: 'stale-one'}))
		resolvers[1]?.(ok({...VIDEO_PROBE, title: 'Stale Two', videoId: 'stale-two'}))
		await Promise.resolve()

		expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		expect(useAppStore.getState().playlistItems).toEqual([])
	})

	it('cancels bulk metadata probes when backing out to the URL step', () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(() => new Promise(() => undefined))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://example.com/1', 'https://example.com/2'])
		vi.mocked(api.downloads.probeCancel).mockClear()

		useAppStore.getState().back()

		expect(api.downloads.probeCancel).toHaveBeenCalledTimes(1)
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('allows advancing bulk items while metadata is still resolving', () => {
		window.appApi = buildMockAppApi()
		useAppStore.setState({wizardStep: 'playlistItems', wizardMode: 'bulk', selectedPlaylistItemIds: ['bulk-1'], bulkMetadataStatus: 'resolving'} as Partial<ReturnType<typeof useAppStore.getState>>)

		useAppStore.getState().confirmPlaylistSelection()

		expect(useAppStore.getState().wizardStep).toBe('playlistPresets')
	})

	it('marks bulk as YouTube-only only when every URL is a clear individual YouTube URL', () => {
		window.appApi = buildMockAppApi()

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/watch?v=one', 'https://youtu.be/two'])

		expect(useAppStore.getState().wizardExtractor).toBe('youtube')
		expect(useAppStore.getState().wizardExtractorKey).toBe('Youtube')
	})

	it('does not retry a format probe in bulk mode', async () => {
		const api = buildMockAppApi()
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://vimeo.com/1', 'https://vimeo.com/2'])
		vi.mocked(api.downloads.probe).mockClear()
		await useAppStore.getState().retryFormatProbe()

		expect(api.downloads.probe).not.toHaveBeenCalled()
	})
})

describe('reset', () => {
	it('clears all wizard state back to url step', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL})
		await useAppStore.getState().submitUrl()

		expect(useAppStore.getState().wizardStep).toBe('formats')

		useAppStore.getState().reset()

		const state = useAppStore.getState()
		expect(state.wizardStep).toBe('url')
		expect(state.wizardUrl).toBe('')
		expect(state.wizardFormats).toEqual([])
		expect(state.wizardTitle).toBe('')
		expect(state.wizardError).toBeNull()
		expect(state.formatsLoading).toBe(false)
	})
})

describe('bulk URL mode — collection URLs', () => {
	// A collection URL must never become one bulk row: the job would carry a
	// single pre-bound filename while yt-dlp downloaded the whole set under it.
	// Bulk intake expands it first, the way Quick Download already does.
	it('expands a playlist URL into its entries instead of queueing it whole', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/playlist?list=PLtest'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().playlistItems.map(item => item.url)).toEqual(['https://youtu.be/e1', 'https://youtu.be/e2'])
		})
		expect(api.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: 'https://www.youtube.com/playlist?list=PLtest', playlistMode: 'playlist'}))
		expect(useAppStore.getState().wizardMode).toBe('bulk')
	})

	it('seeds expanded rows from the playlist probe so they need no second probe', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/playlist?list=PLtest'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
		})
		expect(useAppStore.getState().playlistItems.map(item => item.title)).toEqual(['Entry 1', 'Entry 2'])
		expect(useAppStore.getState().playlistItems.map(item => item.videoId)).toEqual(['e1', 'e2'])
		// One probe for the playlist, none per entry.
		expect(api.downloads.probe).toHaveBeenCalledTimes(1)
	})

	it('keeps plain video URLs alongside an expanded playlist, in order', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async ({url}) => (url.includes('list=') ? ok(PLAYLIST_PROBE) : ok({...VIDEO_PROBE, title: 'Plain Video', videoId: 'plain'})))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://youtu.be/first', 'https://www.youtube.com/playlist?list=PLtest'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().playlistItems.map(item => item.url)).toEqual(['https://youtu.be/first', 'https://youtu.be/e1', 'https://youtu.be/e2'])
		})
	})

	it('shows the list in its loading state while expansion probes run', async () => {
		const api = buildMockAppApi()
		// Initialised to a no-op rather than null: assignment happens inside a
		// promise executor, which control-flow analysis cannot order, so a
		// nullable here narrows to `never` at the call below.
		let release = (): void => {}
		vi.mocked(api.downloads.probe).mockImplementation(
			async () =>
				new Promise(resolve => {
					release = () => resolve(ok(PLAYLIST_PROBE))
				})
		)
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/playlist?list=PLtest'])

		// Synchronously, before any probe resolves: the dialog has closed, so the
		// list screen must already be visible rather than the previous page.
		expect(useAppStore.getState().wizardStep).toBe('playlistItems')
		expect(useAppStore.getState().playlistProbeLoading).toBe(true)

		await vi.waitFor(() => expect(api.downloads.probe).toHaveBeenCalled())
		release()
		await vi.waitFor(() => {
			expect(useAppStore.getState().playlistProbeLoading).toBe(false)
		})
		expect(useAppStore.getState().playlistItems).toHaveLength(2)
	})

	it('surfaces an error when every URL was a collection and none could be read', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'playlist unavailable'}))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/playlist?list=PLtest'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().wizardStep).toBe('error')
		})
		expect(useAppStore.getState().wizardError).toMatchObject({message: 'playlist unavailable'})
		expect(useAppStore.getState().playlistItems).toHaveLength(0)
		expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
	})

	it('clears the loading state when the probe bridge rejects outright', async () => {
		// A rejection rather than a failed Result left the detached expansion task
		// with no store write at all, stranding the picker mid-load.
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockRejectedValue(new Error('bridge exploded'))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/playlist?list=PLtest'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().wizardStep).toBe('error')
		})
		expect(useAppStore.getState().playlistProbeLoading).toBe(false)
		expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
	})

	it('marks a bulk row a playlist when its probe comes back as one', async () => {
		// URL shape cannot catch every container, so the probe result is the
		// backstop: asked for a video, got a set, therefore not downloadable.
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://example.com/opaque-collection'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().playlistItems[0]?.isContainer).toBe(true)
		})
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual([])
	})

	it('errors when a probe succeeds but holds only more playlists', async () => {
		// A channel's Playlists tab: every entry is a container, so expansion
		// filters them all and nothing downloadable survives. Keying the guard off
		// the drop count missed this, because nothing was dropped.
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(
			ok({
				...PLAYLIST_PROBE,
				entries: [
					{id: 'n1', title: 'Greatest Hits', url: 'https://www.youtube.com/playlist?list=PLa', thumbnail: '', playlistIndex: 1, videoId: 'VLPLa', isContainer: true},
					{id: 'n2', title: 'B Sides', url: 'https://www.youtube.com/playlist?list=PLb', thumbnail: '', playlistIndex: 2, videoId: 'VLPLb', isContainer: true}
				]
			})
		)
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/@artist/playlists'])

		await vi.waitFor(() => {
			expect(useAppStore.getState().wizardStep).toBe('error')
		})
		expect(useAppStore.getState().playlistProbeLoading).toBe(false)
		expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
	})

	it('clears the loading state when the user goes back mid-expansion', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async () => new Promise(() => {}))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://www.youtube.com/playlist?list=PLtest'])
		expect(useAppStore.getState().playlistProbeLoading).toBe(true)

		useAppStore.getState().back()

		// Stranding these leaves the picker permanently mid-load on the way
		// forward again, recoverable only by a full reset.
		expect(useAppStore.getState().playlistProbeLoading).toBe(false)
		expect(useAppStore.getState().bulkMetadataStatus).toBe('done')
	})

	it('keeps an unexpandable collection as a marked, unselectable row', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async ({url}) => (url.includes('list=') ? fail({kind: 'other', code: 'unknown', message: 'nope'}) : ok({...VIDEO_PROBE, title: 'Plain Video', videoId: 'plain'})))
		window.appApi = api

		useAppStore.getState().startBulkUrls(['https://youtu.be/first', 'https://www.youtube.com/playlist?list=PLtest'])

		// It stays visible — a pasted URL that simply vanishes is the same silent
		// drop this change exists to end — but it can never be downloaded.
		await vi.waitFor(() => {
			expect(useAppStore.getState().playlistItems.map(item => item.url)).toEqual(['https://youtu.be/first', 'https://www.youtube.com/playlist?list=PLtest'])
		})
		expect(useAppStore.getState().playlistItems[1].isContainer).toBe(true)
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['bulk-1'])
	})
})

describe('playlist rows that are themselves playlists', () => {
	// Kept visible so an all-playlist probe result still renders a picker, but
	// they cannot be downloaded — the URL addresses a whole set while a queue
	// item carries one pre-bound filename. Selection has to refuse them at the
	// source; accepting and dropping them at submit is the silent failure.
	const NESTED_PROBE: Extract<ProbeResult, {kind: 'playlist'}> = {
		...PLAYLIST_PROBE,
		entries: [
			{id: 'v1', title: 'Real Video', url: 'https://youtu.be/v1', thumbnail: '', playlistIndex: 1, videoId: 'v1'},
			{id: 'c1', title: 'Greatest Hits', url: 'https://www.youtube.com/playlist?list=PLx', thumbnail: '', playlistIndex: 2, videoId: 'VLPLx', isContainer: true},
			{id: 'c2', title: 'Some Album', url: 'https://music.youtube.com/browse/MPREb', thumbnail: '', playlistIndex: 3, videoId: 'MPREb', isContainer: true}
		]
	}

	async function loadNested(): Promise<void> {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(NESTED_PROBE))
		window.appApi = api
		useAppStore.setState({wizardUrl: 'https://www.youtube.com/@artist/playlists'})
		await useAppStore.getState().submitUrl()
	}

	it('leaves them unselected by default', async () => {
		await loadNested()
		expect(useAppStore.getState().playlistItems).toHaveLength(3)
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['v1'])
	})

	it('refuses to select one by hand', async () => {
		await loadNested()
		useAppStore.getState().setPlaylistItemSelected('c1', true)
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['v1'])
	})

	it('skips them in select-all', async () => {
		await loadNested()
		useAppStore.getState().selectAllPlaylistItems()
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['v1'])
	})

	it('skips them in a range selection that spans them', async () => {
		await loadNested()
		useAppStore.getState().selectPlaylistRange(1, 3)
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['v1'])
	})

	it('still allows unselecting, so a stale selection stays correctable', async () => {
		await loadNested()
		useAppStore.setState({selectedPlaylistItemIds: ['v1', 'c1']})
		useAppStore.getState().setPlaylistItemSelected('c1', false)
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['v1'])
	})
})
