// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {hydrateBulkMetadata, nextBulkMetadataRunId} from '@renderer/store/wizard/bulkMetadataHydration.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '@shared/result.js'
import type {ProbeResult} from '@shared/types.js'

function resetStore() {
	useAppStore.setState({...RESET_WIZARD_STATE, initialized: false, initializing: false, settings: null, wizardOutputDir: '', queue: []})
}

beforeEach(() => {
	resetStore()
	vi.clearAllMocks()
})

const VIDEO_PROBE = (overrides: Partial<Extract<ProbeResult, {kind: 'video'}>> = {}): Extract<ProbeResult, {kind: 'video'}> => ({
	kind: 'video',
	videoId: 'BV1bK411W797_p1',
	extractor: 'bilibili',
	extractorKey: 'BiliBili',
	webpageUrl: 'https://www.bilibili.com/video/BV1bK411W797?p=1',
	isAudioOnlySource: false,
	formats: [],
	title: 'Real Part Title',
	thumbnail: 'https://example.com/thumb.jpg',
	duration: 123,
	subtitles: {},
	automaticCaptions: {},
	isLive: false,
	hasDrm: false,
	uploader: 'Some Uploader',
	uploadDate: '20260803',
	timestamp: 1754000000,
	...overrides
})

describe('playlist hydration', () => {
	it('probes placeholder rows and fills title, uploader, uploadDate, timestamp, clearing the flag', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE()))
		window.appApi = api

		useAppStore.setState({
			wizardMode: 'playlist',
			playlistItems: [{id: '1::https://www.bilibili.com/video/BV1bK411W797?p=1', url: 'https://www.bilibili.com/video/BV1bK411W797?p=1', title: 'Untitled · #1', thumbnail: '', playlistIndex: 1, videoId: null, titleIsPlaceholder: true}],
			selectedPlaylistItemIds: ['1::https://www.bilibili.com/video/BV1bK411W797?p=1'],
			bulkMetadataStatus: 'resolving',
			bulkMetadataCompleted: 0,
			bulkMetadataTotal: 1,
			bulkMetadataById: {}
		})

		const runId = nextBulkMetadataRunId()
		await hydrateBulkMetadata([{id: '1::https://www.bilibili.com/video/BV1bK411W797?p=1', url: 'https://www.bilibili.com/video/BV1bK411W797?p=1', index: 0}], useAppStore.setState, runId)

		expect(api.downloads.probe).toHaveBeenCalledWith({url: 'https://www.bilibili.com/video/BV1bK411W797?p=1', playlistMode: 'video'})
		const state = useAppStore.getState()
		expect(state.playlistItems[0]?.title).toBe('Real Part Title')
		expect(state.playlistItems[0]?.uploader).toBe('Some Uploader')
		expect(state.playlistItems[0]?.uploadDate).toBe('20260803')
		expect(state.playlistItems[0]?.timestamp).toBe(1754000000)
		expect(state.playlistItems[0]?.titleIsPlaceholder).toBeUndefined()
	})

	it('never probes non-placeholder rows when only placeholder targets are passed', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE()))
		window.appApi = api

		useAppStore.setState({
			wizardMode: 'playlist',
			playlistItems: [
				{id: '1::e1', url: 'https://youtu.be/e1', title: 'Real Title', thumbnail: '', playlistIndex: 1, videoId: 'e1'},
				{id: '2::https://example.com/p2', url: 'https://example.com/p2', title: 'Untitled · #2', thumbnail: '', playlistIndex: 2, videoId: null, titleIsPlaceholder: true}
			],
			selectedPlaylistItemIds: ['1::e1', '2::https://example.com/p2'],
			bulkMetadataStatus: 'resolving',
			bulkMetadataCompleted: 0,
			bulkMetadataTotal: 1,
			bulkMetadataById: {}
		})

		const runId = nextBulkMetadataRunId()
		await hydrateBulkMetadata([{id: '2::https://example.com/p2', url: 'https://example.com/p2', index: 1}], useAppStore.setState, runId)

		expect(api.downloads.probe).toHaveBeenCalledTimes(1)
		expect(vi.mocked(api.downloads.probe).mock.calls[0]?.[0]).toEqual({url: 'https://example.com/p2', playlistMode: 'video'})
	})

	it('aborts write-back when the run is superseded', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.downloads.probe).mockImplementation(async () => {
			await new Promise(resolve => setTimeout(resolve, 20))
			return ok(VIDEO_PROBE())
		})
		window.appApi = api

		useAppStore.setState({
			wizardMode: 'playlist',
			playlistItems: [{id: '1::https://example.com/p1', url: 'https://example.com/p1', title: 'Untitled · #1', thumbnail: '', playlistIndex: 1, videoId: null, titleIsPlaceholder: true}],
			selectedPlaylistItemIds: ['1::https://example.com/p1'],
			bulkMetadataStatus: 'resolving',
			bulkMetadataCompleted: 0,
			bulkMetadataTotal: 1,
			bulkMetadataById: {}
		})

		const staleRunId = nextBulkMetadataRunId()
		const pending = hydrateBulkMetadata([{id: '1::https://example.com/p1', url: 'https://example.com/p1', index: 0}], useAppStore.setState, staleRunId)
		nextBulkMetadataRunId()
		await pending

		const state = useAppStore.getState()
		expect(state.playlistItems[0]?.title).toBe('Untitled · #1')
		expect(state.playlistItems[0]?.titleIsPlaceholder).toBe(true)
	})
})

describe('playlist placeholder trigger', () => {
	it('hydrates only placeholder rows after a playlist probe, leaving real titles unprobed', async () => {
		const api = buildMockAppApi()
		const playlistProbe: Extract<ProbeResult, {kind: 'playlist'}> = {
			kind: 'playlist',
			extractor: 'youtube:playlist',
			extractorKey: 'YoutubePlaylist',
			webpageUrl: 'https://www.youtube.com/playlist?list=PLtest',
			isAudioOnlySource: false,
			playlistTitle: 'Series',
			playlistId: 'PLtest',
			isMultiVideo: false,
			entries: [
				{id: '1::https://www.bilibili.com/video/BV1bK411W797?p=1', url: 'https://www.bilibili.com/video/BV1bK411W797?p=1', title: 'Untitled · #1', thumbnail: '', playlistIndex: 1, videoId: null, titleIsPlaceholder: true},
				{id: '2::e2', url: 'https://youtu.be/e2', title: 'Real Title', thumbnail: '', playlistIndex: 2, videoId: 'e2'}
			]
		}
		vi.mocked(api.downloads.probe).mockImplementation(async (input: {url: string; playlistMode?: string}) => {
			if (input.playlistMode === 'playlist') return ok(playlistProbe)
			return ok(VIDEO_PROBE({webpageUrl: input.url}))
		})
		window.appApi = api

		useAppStore.setState({wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', playlistScope: {items: {kind: 'app-limit'}}})
		await useAppStore.getState().submitUrl()
		await new Promise(resolve => setTimeout(resolve, 50))

		const calls = vi.mocked(api.downloads.probe).mock.calls.map(call => call[0])
		const videoProbes = calls.filter(call => call.playlistMode === 'video')
		expect(videoProbes).toHaveLength(1)
		expect(videoProbes[0]?.url).toBe('https://www.bilibili.com/video/BV1bK411W797?p=1')
		const state = useAppStore.getState()
		expect(state.playlistItems[1]?.title).toBe('Real Title')
	})
})
