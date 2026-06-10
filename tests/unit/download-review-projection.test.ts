import {describe, expect, it} from 'vitest'
import type {FormatOption, PlaylistEntry} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import {buildDownloadReview} from '@renderer/store/wizard/downloadReviewProjection.js'

const FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p', ext: 'webm', resolution: '1080p', fps: 30, isVideoOnly: true, isAudioOnly: false, filesize: 1024},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 160}
]

const PLAYLIST_ITEMS: PlaylistEntry[] = [
	{id: 'a', title: 'A', url: 'https://youtu.be/a', thumbnail: '', duration: 1, playlistIndex: 1, videoId: 'a'},
	{id: 'b', title: 'B', url: 'https://youtu.be/b', thumbnail: '', duration: 1, playlistIndex: 2, videoId: 'b'}
]

function param(params: Record<string, unknown> | undefined, key: string): string {
	const value = params?.[key]
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
	return ''
}

function t(key: string, params?: Record<string, unknown>): string {
	if (key === 'wizard.confirm.itemsValue' || key === 'wizard.confirm.itemsValueAudio' || key === 'wizard.confirm.itemsValueBulk') return `${param(params, 'count')}/${param(params, 'total')}`
	if (key === 'playlistPresets.audioFormatBitrate') return `${param(params, 'format')} ${param(params, 'kbps')}`
	if (key === 'formatLabel.videoDot') return `${param(params, 'resolution')} · ${param(params, 'audio')}`
	if (key === 'formatLabel.audioOnlyDot') return `audio · ${param(params, 'audio')}`
	if (key === 'wizard.formats.convert.lossyLabel') return `${param(params, 'target')} ${param(params, 'bitrate')}`
	return key
}

function state(overrides: Partial<AppState> = {}): AppState {
	return {
		wizardMode: 'single',
		wizardTitle: 'Video',
		wizardThumbnail: '',
		wizardDuration: 60,
		wizardWebpageUrl: 'https://example.com/video',
		wizardOutputDir: '/downloads',
		wizardSubfolderEnabled: false,
		wizardSubfolderName: '',
		commonPaths: {downloads: '/downloads', videos: null, desktop: null, music: null, documents: null, pictures: null, home: '/home/me'},
		selectedVideoFormatId: '137',
		audioSelection: {kind: 'native', formatId: '251'},
		activePreset: null,
		wizardFormats: FORMATS,
		wizardSubtitleLanguages: ['en'],
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		wizardSubtitles: {en: [{ext: 'vtt'}]},
		wizardAutomaticCaptions: {},
		wizardSubtitleSkipped: false,
		playlistItems: PLAYLIST_ITEMS,
		selectedPlaylistItemIds: ['a', 'b'],
		playlistSelection: {kind: 'video', tier: '1080', codec: 'best'},
		playlistTitle: 'Playlist',
		wizardExtractor: 'youtube',
		wizardEmbedChapters: true,
		wizardEmbedMetadata: true,
		wizardEmbedThumbnail: false,
		wizardWriteDescription: false,
		wizardWriteThumbnail: false,
		wizardSponsorBlockMode: 'off',
		...overrides
	} as AppState
}

describe('DownloadReviewProjection', () => {
	it('builds single-video summary rows', () => {
		const review = buildDownloadReview(state(), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.summaryRows.map(row => row.key)).toEqual(['video', 'audio', 'subtitles', 'saveTo', 'size'])
		expect(review.subtitleValue).toContain('English')
		expect(review.hasNothingSelected).toBe(false)
		expect(review.allowedActions).toEqual({addToQueue: true, downloadNow: true})
	})

	it('builds playlist and bulk rows with item count label data', () => {
		const playlist = buildDownloadReview(state({wizardMode: 'playlist'}), {t, language: 'en', commonPaths: state().commonPaths})
		const bulk = buildDownloadReview(state({wizardMode: 'bulk'}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(playlist.summaryRows.map(row => row.key)).toEqual(['playlist', 'preset', 'items', 'saveTo'])
		expect(playlist.itemCountLabel).toEqual({key: 'wizard.confirm.itemsValue', params: {count: 2, total: '2'}})
		expect(bulk.summaryRows[0]?.value).toBe('wizard.bulk.title')
		expect(bulk.itemCountLabel).toEqual({key: 'wizard.confirm.itemsValueBulk', params: {count: 2, total: '2'}})
	})

	it('reports skipped subtitles as none', () => {
		const review = buildDownloadReview(state({wizardSubtitleSkipped: true}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.subtitleValue).toBe('wizard.confirm.subtitlesNone')
	})

	it('filters conflicts to warnings visible to the user', () => {
		const review = buildDownloadReview(state({selectedVideoFormatId: '', activePreset: 'subtitle-only', wizardSubtitleMode: 'embed', wizardEmbedThumbnail: true, wizardSponsorBlockMode: 'remove'}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.conflictWarnings).toEqual([])
	})

	it('surfaces visible audio-only subtitle embed conflicts', () => {
		const review = buildDownloadReview(state({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '251'}, activePreset: 'audio-only', wizardSubtitleMode: 'embed'}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.conflictWarnings.map(conflict => conflict.code)).toEqual(['subtitleEmbedAudioOnly'])
	})

	it('gates actions when nothing is selected', () => {
		const review = buildDownloadReview(state({selectedVideoFormatId: '', audioSelection: {kind: 'none'}, wizardSubtitleLanguages: []}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.hasNothingSelected).toBe(true)
		expect(review.allowedActions).toEqual({addToQueue: false, downloadNow: false})
	})
})
