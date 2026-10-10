// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {notify, setNotificationSink, type NotificationLevel} from '@renderer/lib/notify.js'
import {defaultAppSettings} from '@shared/constants.js'
import {i18next} from '@shared/i18n/index.js'
import {ok} from '@shared/result.js'
import type {PlaylistEntry, ProbeResult, QueueItem, QueueItemStatus} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// A playlist that overlaps what is already live in the queue must not be lost to
// the admission guard's conflict. The overlap is dropped before submission, the
// rest is queued, and the user is told how many were skipped. Everything already
// queued is neither a failure nor an empty selection.

const URL_A = 'https://youtu.be/a'
const URL_B = 'https://youtu.be/b'
const URL_C = 'https://youtu.be/c'
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'

const ENTRIES: PlaylistEntry[] = [URL_A, URL_B, URL_C].map((url, index) => ({id: `e${index + 1}`, title: `Entry ${index + 1}`, url, thumbnail: '', duration: 60, playlistIndex: index + 1, videoId: `e${index + 1}`}))

const PLAYLIST_PROBE: Extract<ProbeResult, {kind: 'playlist'}> = {kind: 'playlist', extractor: 'youtube:playlist', extractorKey: 'YoutubePlaylist', webpageUrl: PLAYLIST_URL, isAudioOnlySource: false, playlistTitle: 'My Playlist', playlistId: 'PLtest', isMultiVideo: false, entries: ENTRIES}

function queued(url: string, status: QueueItemStatus = 'pending'): QueueItem {
	return {id: `q-${url}`, url, status} as QueueItem
}

const notices: {level: NotificationLevel; message: string; id: string}[] = []

beforeEach(() => {
	notices.length = 0
	setNotificationSink((level, message, id) => notices.push({level, message, id}))
	vi.spyOn(console, 'info').mockImplementation(() => {})
	useAppStore.setState({...RESET_WIZARD_STATE, initialized: false, initializing: false, settings: defaultAppSettings('/tmp'), wizardOutputDir: '/tmp', queue: []})
})

afterEach(() => {
	setNotificationSink(null)
	vi.restoreAllMocks()
})

function expectSkippedNotice(count: number): void {
	expect(notices).toEqual([{level: 'info', message: i18next.t('notifications.queue.skippedAlreadyQueued', {count}), id: 'queue-skipped-already-queued'}])
}

describe('notify.queueSkippedAlreadyQueued', () => {
	it('says how many videos were skipped, in singular and plural', () => {
		notify.queueSkippedAlreadyQueued(1)
		notify.queueSkippedAlreadyQueued(98)

		expect(notices.map(notice => notice.message)).toEqual(['1 video is already in the queue — skipped', '98 videos are already in the queue — skipped'])
		expect(new Set(notices.map(notice => notice.id)).size).toBe(1)
	})
})

describe('Quick Download of a playlist', () => {
	function arm(queue: QueueItem[]) {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		window.appApi = api
		useAppStore.setState({wizardUrl: PLAYLIST_URL, queue})
		return api
	}

	it('queues the videos that are not queued yet and reports the skip', async () => {
		const api = arm([queued(URL_B)])

		await useAppStore.getState().quickDownload()

		expect(vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0].map(item => item.url)).toEqual([URL_A, URL_C])
		expect(useAppStore.getState()).toMatchObject({quickDownloadStatus: 'queued', quickDownloadFailure: null})
		expectSkippedNotice(1)
	})

	it('treats a playlist that is entirely queued as done, not as a failure', async () => {
		const api = arm([URL_A, URL_B, URL_C].map(url => queued(url, 'running')))

		await useAppStore.getState().quickDownload()

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({quickDownloadStatus: 'idle', quickDownloadFailure: null, wizardStep: 'url'})
		expectSkippedNotice(3)
	})

	it('does not skip finished videos', async () => {
		const api = arm([queued(URL_A, 'done'), queued(URL_B, 'cancelled')])

		await useAppStore.getState().quickDownload()

		expect(vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0]).toHaveLength(3)
		expect(notices).toEqual([])
	})

	it('keeps a lone already-queued video as the admission conflict', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok({kind: 'video', videoId: 'a', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: URL_A, isAudioOnlySource: false, formats: [], title: 'A', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false} satisfies ProbeResult))
		vi.mocked(api.queue.cmd.add).mockResolvedValue({ok: false, error: {code: 'conflict', message: 'conflict: queue item URL is already active'}})
		window.appApi = api
		useAppStore.setState({wizardUrl: URL_A, queue: [queued(URL_A)]})

		await useAppStore.getState().quickDownload()

		expect(api.queue.cmd.add).toHaveBeenCalledOnce()
		expect(useAppStore.getState().quickDownloadStatus).toBe('error')
		expect(notices).toEqual([])
	})
})

describe('queueing a loaded playlist with the active profile', () => {
	function arm(queue: QueueItem[]) {
		const api = buildMockAppApi()
		window.appApi = api
		useAppStore.setState({wizardUrl: PLAYLIST_URL, wizardStep: 'playlistItems', wizardMode: 'playlist', playlistTitle: 'My Playlist', playlistItems: ENTRIES, selectedPlaylistItemIds: ENTRIES.map(entry => entry.id), quickPlaylistCapDialogOpen: true, queue})
		return api
	}

	it('queues the rest and reports the skip', async () => {
		const api = arm([queued(URL_C)])

		await useAppStore.getState().queueLoadedPlaylistWithActiveProfile()

		expect(vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0].map(item => item.url)).toEqual([URL_A, URL_B])
		expectSkippedNotice(1)
	})

	it('closes the cap dialog without a failure when everything is already queued', async () => {
		const api = arm(ENTRIES.map(entry => queued(entry.url)))

		await useAppStore.getState().queueLoadedPlaylistWithActiveProfile()

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({quickDownloadStatus: 'idle', quickDownloadFailure: null, quickPlaylistCapDialogOpen: false})
		expectSkippedNotice(3)
	})
})

describe('adding a reviewed playlist or bulk list to the queue', () => {
	function arm(queue: QueueItem[], wizardMode: 'playlist' | 'bulk') {
		const api = buildMockAppApi()
		window.appApi = api
		useAppStore.setState({wizardMode, wizardStep: 'confirm', wizardExtractor: 'youtube', playlistTitle: 'My Playlist', playlistItems: ENTRIES, selectedPlaylistItemIds: ENTRIES.map(entry => entry.id), playlistSelection: {kind: 'video', tier: '1080', codec: 'best'}, wizardOutputDir: '/tmp', queue})
		return api
	}

	it.each(['playlist', 'bulk'] as const)('%s: queues the rest, reports the skip and resets the wizard', async mode => {
		const api = arm([queued(URL_A)], mode)

		await useAppStore.getState().addToQueue()

		expect(vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0].map(item => item.url)).toEqual([URL_B, URL_C])
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url', wizardError: null})
		expectSkippedNotice(1)
	})

	it.each(['playlist', 'bulk'] as const)('%s: keeps the wizard in place, with no error, when everything is already queued', async mode => {
		const api = arm(
			ENTRIES.map(entry => queued(entry.url)),
			mode
		)

		await useAppStore.getState().addToQueue()

		expect(api.queue.cmd.add).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'confirm', wizardError: null, isSubmittingToQueue: false})
		expect(useAppStore.getState().selectedPlaylistItemIds).toHaveLength(3)
		expectSkippedNotice(3)
	})

	it('stays silent when nothing overlaps', async () => {
		arm([queued('https://youtu.be/elsewhere')], 'playlist')

		await useAppStore.getState().addToQueue()

		expect(notices).toEqual([])
	})
})
