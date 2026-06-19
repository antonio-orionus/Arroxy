// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useAppStore} from '@renderer/store/useAppStore.js'
import type {ProbeError, ProbeResult} from '@shared/types.js'
import {ok, fail, type Result} from '@shared/result.js'
import {defaultAppSettings} from '@shared/constants.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

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
	it('records playlist probe progress while quick download is preparing', async () => {
		const api = buildMockAppApi()
		window.appApi = api

		await useAppStore.getState().initialize()
		const progressListener = vi.mocked(api.events.onProbeProgress).mock.calls.at(-1)?.[0]
		expect(progressListener).toBeDefined()
		useAppStore.setState({wizardUrl: 'https://www.youtube.com/@sunnyboy66/videos', playlistProbeLoading: false, quickDownloadStatus: 'preparing', quickDownloadProgressPhase: 'probing', quickDownloadProgressCurrent: 'https://www.youtube.com/@sunnyboy66/videos'})

		progressListener?.({url: 'https://www.youtube.com/@sunnyboy66/videos', playlistMode: 'playlist', phase: 'pages', loaded: 8, at: new Date().toISOString()})

		expect(useAppStore.getState().playlistProbeProgress).toMatchObject({phase: 'pages', loaded: 8})
	})

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

	it('opens the mixed URL prompt instead of silently forcing a watch/list URL to single-video mode', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		const settings = defaultAppSettings('/tmp/downloads')
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp/downloads', settings})

		await useAppStore.getState().quickDownload()

		expect(api.downloads.probe).not.toHaveBeenCalled()
		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardUrl: mixedUrl, mixedUrlPromptOpen: true, mixedUrlPending: mixedUrl, mixedUrlPromptSource: 'quick-download', quickDownloadStatus: 'idle'})
	})

	it('resumes quick download in single-video mode when the mixed URL prompt chooses the video', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		const settings = defaultAppSettings('/tmp/downloads')
		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp/downloads', settings: {...settings, common: {...settings.common, rememberLastOutputDir: false, clipboardWatchEnabled: false, includeIdInSingleFilenames: true}}})

		await useAppStore.getState().quickDownload()
		await useAppStore.getState().dismissMixedPrompt('video')

		expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'video'})
		const queued = vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0]?.[0]
		expect(queued).toMatchObject({
			url: VIDEO_PROBE.webpageUrl,
			title: 'Test Video',
			outputDir: '/tmp/downloads/Balanced 720p',
			status: 'pending',
			lane: 'normal',
			job: expect.objectContaining({kind: 'ranged-format', extractor: 'youtube', extractorKey: 'Youtube', intent: {kind: 'video-audio', codec: 'best', tiers: ['720'], audio: {format: 'best'}}, outputTemplate: '%(title).200B [%(id)s].%(ext)s'})
		})
		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
	})

	it('queues the whole playlist when quick download mixed URL prompt chooses the playlist', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})

		await useAppStore.getState().quickDownload()
		await useAppStore.getState().dismissMixedPrompt('playlist')

		expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'playlist', playlistScope: expect.any(Object)})
		const items = vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0] ?? []
		expect(items).toHaveLength(2)
		expect(items.every(item => item.job.kind === 'ranged-format')).toBe(true)
		expect(items.every(item => item.playlistGroupId === items[0]?.playlistGroupId)).toBe(true)
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url', quickDownloadStatus: 'queued'})
	})

	it('works on first launch with default profile settings', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp/first-launch-downloads', settings: defaultAppSettings('/tmp/first-launch-downloads')})

		await useAppStore.getState().quickDownload()

		const queued = vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0]?.[0]
		expect(queued).toMatchObject({outputDir: '/tmp/first-launch-downloads/Balanced 720p', formatLabel: 'Up to 720p · Native formats · Native audio', job: expect.objectContaining({kind: 'ranged-format', intent: {kind: 'video-audio', codec: 'best', tiers: ['720'], audio: {format: 'best'}}})})
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('resets quick-download feedback when the URL changes', () => {
		useAppStore.setState({quickDownloadStatus: 'error', quickDownloadFailure: {kind: 'exception', message: 'Previous failure'}})

		useAppStore.getState().setWizardUrl(YOUTUBE_URL)

		expect(useAppStore.getState().quickDownloadStatus).toBe('idle')
		expect(useAppStore.getState().quickDownloadFailure).toBeNull()
	})

	it('sets preparing while the probe is in flight', async () => {
		const api = buildMockAppApi()
		let resolveProbe!: (v: Result<ProbeResult, ProbeError>) => void
		vi.mocked(api.downloads.probe).mockReturnValue(
			new Promise<Result<ProbeResult, ProbeError>>(res => {
				resolveProbe = res
			})
		)
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp'})
		const promise = useAppStore.getState().quickDownload()

		expect(useAppStore.getState().quickDownloadStatus).toBe('preparing')

		resolveProbe(ok(VIDEO_PROBE))
		await promise
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
	})

	it('queues every loaded playlist entry with the active profile', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownload()

		expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://www.youtube.com/playlist?list=PLtest', playlistMode: 'playlist', playlistScope: expect.any(Object)})
		const items = vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0] ?? []
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
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('opens playlist review instead of silently queueing when an unknown URL probes as a playlist', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok({...PLAYLIST_PROBE, webpageUrl: 'https://example.com/course'}))
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://example.com/course', wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownload()

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'playlist', playlistTitle: 'My Playlist', quickDownloadStatus: 'idle'})
	})

	it('opens the quick playlist cap dialog when a playlist quick scan is capped', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(101)))
		window.appApi = api

		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', wizardOutputDir: '/tmp', settings: {...settings, common: {...settings.common, playlistProbeLimit: 100}}})
		await useAppStore.getState().quickDownload()

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(useAppStore.getState().playlistLikelyCapped).toBe(true)
		expect(useAppStore.getState().playlistItems).toHaveLength(100)
		expect(useAppStore.getState().quickDownloadStatus).toBe('idle')
		expect(useAppStore.getState().quickDownloadFailure).toBeNull()
		expect(useAppStore.getState().quickPlaylistCapDialogOpen).toBe(true)
	})

	it('queues capped playlist loaded items with the active profile', async () => {
		const api = buildMockAppApi()
		window.appApi = api

		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({
			wizardStep: 'playlistItems',
			wizardMode: 'playlist',
			wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
			wizardOutputDir: '/tmp',
			wizardExtractor: 'youtube:playlist',
			wizardExtractorKey: 'YoutubePlaylist',
			wizardWebpageUrl: 'https://www.youtube.com/playlist?list=PLtest',
			playlistItems: PLAYLIST_PROBE.entries,
			selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map(entry => entry.id),
			playlistTitle: 'My Playlist',
			playlistId: 'PLtest',
			playlistIsMultiVideo: false,
			playlistLikelyCapped: true,
			quickPlaylistCapDialogOpen: true,
			settings
		})

		await useAppStore.getState().queueLoadedPlaylistWithActiveProfile()

		const items = vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0] ?? []
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
		expect(useAppStore.getState().quickPlaylistCapDialogOpen).toBe(false)
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
	})

	it('quickDownloadUrls probes and queues every accepted bulk URL with the active profile', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		useAppStore.setState({wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownloadUrls(['https://youtu.be/one', 'https://youtu.be/two'])

		expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		expect(api.queue.cmd.add).toHaveBeenCalledTimes(2)
		const allQueued = vi.mocked(api.queue.cmd.add).mock.calls.flatMap(call => call[0])
		expect(allQueued).toHaveLength(2)
		expect(allQueued.every(item => item.job.kind === 'ranged-format')).toBe(true)
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
		expect(useAppStore.getState().wizardStep).toBe('url')
	})

	it('quickDownloadUrls routes mixed watch/list URLs to bulk review instead of silently forcing single-video mode', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownloadUrls(['https://youtu.be/one', mixedUrl])

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'bulk', playlistTitle: 'Bulk URLs', quickDownloadStatus: 'idle'})
		expect(useAppStore.getState().playlistItems.map(item => item.url)).toEqual(['https://youtu.be/one', mixedUrl])
	})

	it('quickDownloadUrls opens playlist review when an unknown bulk URL probes as a playlist', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok({...PLAYLIST_PROBE, webpageUrl: 'https://example.com/series'}))
		window.appApi = api

		useAppStore.setState({wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownloadUrls(['https://example.com/series'])

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'playlist', playlistTitle: 'My Playlist', quickDownloadStatus: 'idle'})
	})

	it('quickDownloadUrls preserves the whole batch when an unknown URL probes as a playlist', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async ({url}) => {
			if (url.includes('series')) return ok({...PLAYLIST_PROBE, webpageUrl: url})
			return ok({...VIDEO_PROBE, webpageUrl: url, title: 'Single'})
		})
		window.appApi = api

		useAppStore.setState({wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownloadUrls(['https://youtu.be/one', 'https://example.com/series'])

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'bulk', playlistTitle: 'Bulk URLs', quickDownloadStatus: 'idle'})
		expect(useAppStore.getState().playlistItems.map(item => item.url)).toEqual(['https://youtu.be/one', 'https://example.com/series'])
	})

	it('quickDownloadUrls continues after failed bulk probes and reports the failed count', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async ({url}) => {
			if (url.includes('bad')) return fail({kind: 'other', code: 'unknown', message: 'Probe failed'})
			return ok({...VIDEO_PROBE, title: url.includes('one') ? 'One' : 'Two'})
		})
		window.appApi = api

		useAppStore.setState({wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownloadUrls(['https://youtu.be/one', 'https://youtu.be/bad', 'https://youtu.be/two'])

		expect(api.downloads.probe).toHaveBeenCalledTimes(3)
		expect(api.queue.cmd.add).toHaveBeenCalledTimes(2)
		const allQueued = vi.mocked(api.queue.cmd.add).mock.calls.flatMap(call => call[0])
		expect(allQueued.map(item => item.title)).toEqual(['One', 'Two'])
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
		expect(useAppStore.getState().quickDownloadProgressFailed).toBe(1)
		expect(useAppStore.getState().quickDownloadFailure).toBeNull()
	})

	it('quickDownloadUrls keeps representative probe guidance when every bulk probe fails', async () => {
		const api = buildMockAppApi()
		const networkError: ProbeError = {kind: 'ytdlp', error: {kind: 'network', raw: 'network down'}}
		const botBlockError: ProbeError = {kind: 'ytdlp', error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}}
		vi.mocked(api.downloads.probe).mockImplementation(async ({url}) => fail(url.includes('bot') ? botBlockError : networkError))
		window.appApi = api

		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({wizardOutputDir: '/tmp', settings: {...settings, common: {...settings.common, cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt'}}})
		await useAppStore.getState().quickDownloadUrls(['https://youtu.be/network', 'https://youtu.be/bot'])

		expect(api.downloads.probe).toHaveBeenCalledTimes(2)
		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState().quickDownloadFailure).toEqual({kind: 'bulk-probe', error: botBlockError, urls: ['https://youtu.be/network', 'https://youtu.be/bot'], failedCount: 2})
		expect(useAppStore.getState().quickDownloadProgressFailed).toBe(2)
	})

	it('retryQuickDownloadFailure reruns the original failed bulk URL list', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'Probe failed'}))
		window.appApi = api

		useAppStore.setState({wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownloadUrls(['https://youtu.be/one', 'https://youtu.be/two'])
		expect(useAppStore.getState().quickDownloadFailure?.kind).toBe('bulk-probe')

		vi.mocked(api.downloads.probe).mockClear()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		await useAppStore.getState().retryQuickDownloadFailure()

		expect(vi.mocked(api.downloads.probe).mock.calls.map(call => call[0].url)).toEqual(['https://youtu.be/one', 'https://youtu.be/two'])
		expect(api.queue.cmd.add).toHaveBeenCalledTimes(2)
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
	})

	it('retryQuickDownloadFailure preserves a mixed URL single-video choice', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'Probe failed'}))
		window.appApi = api

		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownload()
		await useAppStore.getState().dismissMixedPrompt('video')

		expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'video'})
		expect(useAppStore.getState().quickDownloadFailure?.kind).toBe('probe')

		vi.mocked(api.downloads.probe).mockClear()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		await useAppStore.getState().retryQuickDownloadFailure()

		expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'video'})
		expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false)
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
	})

	it('retryQuickDownloadFailure preserves a mixed URL playlist choice', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'Probe failed'}))
		window.appApi = api

		const mixedUrl = `${YOUTUBE_URL}&list=PLtest`
		useAppStore.setState({wizardUrl: mixedUrl, wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		await useAppStore.getState().quickDownload()
		await useAppStore.getState().dismissMixedPrompt('playlist')

		expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'playlist', playlistScope: expect.any(Object)})
		expect(useAppStore.getState().quickDownloadFailure?.kind).toBe('probe')

		vi.mocked(api.downloads.probe).mockClear()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		await useAppStore.getState().retryQuickDownloadFailure()

		expect(api.downloads.probe).toHaveBeenCalledWith({url: mixedUrl, playlistMode: 'playlist', playlistScope: expect.any(Object)})
		expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false)
		expect(useAppStore.getState().quickDownloadStatus).toBe('queued')
	})

	it('retryQuickDownloadWithCookies enables configured cookies before rerunning a failed bulk URL list', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'ytdlp', error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}}))
		window.appApi = api

		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({wizardOutputDir: '/tmp', settings: {...settings, common: {...settings.common, cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt'}}})
		await useAppStore.getState().quickDownloadUrls(['https://youtu.be/one', 'https://youtu.be/two'])

		vi.mocked(api.downloads.probe).mockClear()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		await useAppStore.getState().retryQuickDownloadWithCookies()

		expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesMode: 'file'}})
		expect(vi.mocked(api.downloads.probe).mock.calls.map(call => call[0].url)).toEqual(['https://youtu.be/one', 'https://youtu.be/two'])
	})

	it('cancelQuickDownload stops pending bulk probes and keeps queued items untouched', async () => {
		const api = buildMockAppApi()
		let resolveFirst!: (value: Result<ProbeResult, ProbeError>) => void
		vi.mocked(api.downloads.probe).mockReturnValue(
			new Promise(resolve => {
				resolveFirst = resolve
			})
		)
		window.appApi = api

		useAppStore.setState({wizardOutputDir: '/tmp', settings: defaultAppSettings('/tmp')})
		const promise = useAppStore.getState().quickDownloadUrls(['https://youtu.be/one', 'https://youtu.be/two'])
		expect(useAppStore.getState().quickDownloadStatus).toBe('preparing')
		expect(useAppStore.getState().quickDownloadProgressTotal).toBe(2)

		useAppStore.getState().cancelQuickDownload()
		resolveFirst(ok(VIDEO_PROBE))
		await promise

		expect(api.downloads.probeCancel).toHaveBeenCalled()
		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState().quickDownloadStatus).toBe('idle')
		expect(useAppStore.getState().quickDownloadProgressTotal).toBe(0)
	})

	it('ignores stale quickDownload exceptions after cancellation', async () => {
		const api = buildMockAppApi()
		let rejectProbe!: (reason: Error) => void
		vi.mocked(api.downloads.probe).mockReturnValue(
			new Promise<Result<ProbeResult, ProbeError>>((_, reject) => {
				rejectProbe = reject
			})
		)
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp'})
		const promise = useAppStore.getState().quickDownload()
		expect(useAppStore.getState().quickDownloadStatus).toBe('preparing')

		useAppStore.getState().cancelQuickDownload()
		rejectProbe(new Error('late probe failure'))
		await promise

		expect(useAppStore.getState().quickDownloadStatus).toBe('idle')
		expect(useAppStore.getState().quickDownloadFailure).toBeNull()
	})

	it('keeps the URL and shows an error when probing fails', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'Probe failed'}))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp'})
		await useAppStore.getState().quickDownload()

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState().wizardUrl).toBe(YOUTUBE_URL)
		expect(useAppStore.getState().quickDownloadStatus).toBe('error')
		expect(useAppStore.getState().quickDownloadFailure).toEqual({kind: 'probe', error: {kind: 'other', code: 'unknown', message: 'Probe failed'}})
	})

	it('keeps the URL and shows an error when queue add fails', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		vi.mocked(api.queue.cmd.add).mockResolvedValue(fail({code: 'validation', message: 'Queue failed'}))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp'})
		await useAppStore.getState().quickDownload()

		expect(useAppStore.getState().wizardUrl).toBe(YOUTUBE_URL)
		expect(useAppStore.getState().quickDownloadStatus).toBe('error')
		expect(useAppStore.getState().quickDownloadFailure).toEqual({kind: 'queue', message: 'Queue failed'})
	})

	it('opens the cookies config dialog without probing when cookies settings are incomplete', async () => {
		const api = buildMockAppApi()
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp', settings: {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, rememberLastOutputDir: false, clipboardWatchEnabled: false, cookiesMode: 'file', cookiesPath: ''}}})

		await useAppStore.getState().quickDownload()

		expect(api.downloads.probe).not.toHaveBeenCalled()
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path')
		expect(useAppStore.getState().quickDownloadStatus).toBe('idle')
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

	it('trims the sentinel entry and marks the playlist as likely capped', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(101)))
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
		expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://vimeo.com/1', playlistMode: 'video'})
		expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://example.com/video/2', playlistMode: 'video'})
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

describe('skipSubtitles', () => {
	it('marks subtitles skipped and advances past subtitles step', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE))
		window.appApi = api

		useAppStore.setState({wizardUrl: YOUTUBE_URL})
		await useAppStore.getState().submitUrl()

		// Navigate to subtitles step manually
		useAppStore.setState({wizardStep: 'subtitles', wizardSubtitleSkipped: false})

		useAppStore.getState().skipSubtitles()

		const state = useAppStore.getState()
		expect(state.wizardSubtitleSkipped).toBe(true)
		expect(state.wizardStep).not.toBe('subtitles')
	})
})
