import {describe, expect, it} from 'vite-plus/test'
import type {FormatOption, PlaylistEntry, PlaylistSelection} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import {buildDownloadReview, multiProfileBreakdown} from '@renderer/store/wizard/downloadReviewProjection.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {buildSingleSettingsSummary} from '@renderer/store/wizard/singleSettingsSummary.js'
import {buildSubtitleList} from '@renderer/lib/subtitleLabel.js'

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
	if (key === 'playlistPresets.videoFormat.mp4') return 'Localized MP4'
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
		wizardPart: null,
		wizardWebpageUrl: 'https://example.com/video',
		wizardOutputDir: '/downloads',
		wizardSubfolderEnabled: false,
		wizardSubfolderName: '',
		commonPaths: {downloads: '/downloads', videos: null, desktop: null, music: null, documents: null, pictures: null, home: '/home/me'},
		selectedVideoFormatId: '137',
		audioSelection: {kind: 'native', formatId: '251'},
		wizardMediaKind: 'video',
		wizardFormats: FORMATS,
		wizardSubtitleLanguages: ['en'],
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		wizardSubtitles: {en: [{ext: 'vtt'}]},
		wizardAutomaticCaptions: {},
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

	it('localizes the Smart TV MP4 playlist preset label', () => {
		const review = buildDownloadReview(state({wizardMode: 'playlist', playlistSelection: {kind: 'video', tier: '1080', codec: 'mp4'}}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.playlistPresetLabel).toBe('Localized MP4 · playlistPresets.tier.1080')
	})

	it('filters conflicts to warnings visible to the user', () => {
		const review = buildDownloadReview(state({selectedVideoFormatId: '', wizardMediaKind: 'subtitles', wizardSubtitleMode: 'embed', wizardEmbedThumbnail: true, wizardSponsorBlockMode: 'remove'}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.conflictWarnings).toEqual([])
	})

	it('surfaces visible audio-only subtitle embed conflicts', () => {
		const review = buildDownloadReview(state({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '251'}, wizardMediaKind: 'audio', wizardSubtitleMode: 'embed'}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.conflictWarnings.map(conflict => conflict.code)).toEqual(['subtitleEmbedAudioOnly'])
	})

	it('gates actions when nothing is selected', () => {
		const review = buildDownloadReview(state({selectedVideoFormatId: '', audioSelection: {kind: 'none'}, wizardSubtitleLanguages: []}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.hasNothingSelected).toBe(true)
		expect(review.allowedActions).toEqual({addToQueue: false, downloadNow: false})
	})
})

describe('subtitle language labels in a Russian UI', () => {
	const ruState = state({wizardSubtitleLanguages: ['ar', 'en-orig'], wizardSubtitles: {en: [{ext: 'vtt', name: 'English'}], ar: [{ext: 'vtt', name: 'Arabic'}]}, wizardAutomaticCaptions: {'en-orig': [{ext: 'vtt', name: 'English (Original)'}]}})
	const pickedLabels = buildSubtitleList(ruState.wizardSubtitles, ruState.wizardAutomaticCaptions, 'ru')
		.filter(item => ruState.wizardSubtitleLanguages.includes(item.code))
		.map(item => item.displayName)
	const listLabels = new Intl.ListFormat('ru', {type: 'conjunction'}).format(pickedLabels)

	it('match the picker list in the review row and the section summary, joined the Russian way', () => {
		expect(listLabels).toBe('Арабский и Английский')
		expect(buildDownloadReview(ruState, {t, language: 'ru', commonPaths: ruState.commonPaths}).subtitleValue.startsWith(`${listLabels} · `)).toBe(true)
		expect(buildSingleSettingsSummary(ruState, {t, language: 'ru'}).subtitles.startsWith(`${listLabels} · `)).toBe(true)
	})
})

describe('extras in a Russian UI', () => {
	it('join with the Russian list separators', () => {
		const summary = buildSingleSettingsSummary(state({wizardEmbedChapters: true, wizardEmbedMetadata: true, wizardEmbedThumbnail: false, wizardWriteDescription: false, wizardWriteThumbnail: false}), {t, language: 'ru'})
		expect(summary.extras).toBe(new Intl.ListFormat('ru', {type: 'conjunction'}).format([t('wizard.output.embedChapters.label'), t('wizard.output.embedMetadata.label')]))
		expect(summary.extras).toContain(' и ')
	})
})

describe('subtitles-only batch review', () => {
	const SUBS: PlaylistSelection = {kind: 'subtitles', languages: ['en', 'pl'], source: 'manual-first', mode: 'sidecar', format: 'srt'}

	it('summarizes the preset as subtitles with languages and format', () => {
		const review = buildDownloadReview(state({wizardMode: 'bulk', playlistSelection: SUBS}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.playlistPresetLabel).toBe('wizard.formats.kind.subtitles · English and Polish · SRT')
		expect(review.itemCountLabel).toEqual({key: 'wizard.confirm.itemsValueBulk', params: {count: 2, total: '2'}})
		expect(review.hasNothingSelected).toBe(false)
	})

	it('ignores a stale empty subtitles selection in multi-profile mode', () => {
		// The presets step is skipped in multi-profile mode, so the selection is
		// whatever the wizard last held; each item carries its own profile.
		const review = buildDownloadReview(state({wizardMode: 'bulk', multiProfileMode: true, playlistSelection: {...SUBS, languages: []}}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.hasNothingSelected).toBe(false)
		expect(review.allowedActions.addToQueue).toBe(true)
	})

	it('blocks queueing when no language is chosen', () => {
		const review = buildDownloadReview(state({wizardMode: 'bulk', playlistSelection: {...SUBS, languages: []}}), {t, language: 'en', commonPaths: state().commonPaths})

		expect(review.hasNothingSelected).toBe(true)
		expect(review.allowedActions.addToQueue).toBe(false)
	})

	it('counts rows on a profile hidden since it was assigned under that profile, listed first', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		if (!balanced) throw new Error('expected the balanced built-in')
		const lectures = {...balanced, id: 'lectures', name: 'Lectures', enabled: false}
		const rows = multiProfileBreakdown(
			state({
				multiProfileMode: true,
				settings: {common: {defaultOutputDir: '/downloads', rememberLastOutputDir: false, clipboardWatchEnabled: false, hotkeyEnabled: false}, playlist: {}, profiles: {active: {kind: 'builtin', id: 'balanced'}, custom: [lectures], overrides: [], enabledOverrides: {}}},
				playlistProfileAssignments: {a: {kind: 'custom', id: 'lectures'}}
			})
		)

		expect(rows.map(row => [row.profileId, row.count])).toEqual([
			['lectures', 1],
			['balanced', 1]
		])
	})
})
