import {DEFAULTS} from '@shared/constants.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {DEFAULT_PLAYLIST_SELECTION} from '@shared/schemas.js'
import type {AppSettings, PlaylistEntry, PlaylistSelection, ProbePlaylistMode, ProbeResult} from '@shared/types.js'
import {classifyUrlIntent, deriveUrlIntentLabel, extractUrlIntentYouTubeVideoId, isObviousSingleUrlIntent} from '@shared/urlIntent.js'
import {isYouTubeExtractor} from '@shared/ytdlp/extractorPredicates.js'
import type {AppState, WizardStep} from '../types.js'
import {applyPreset, restoreFormatSelection, restoreSubtitleSelection} from './formatPicker.js'

type CommonPrefsPatch = Pick<AppState, 'wizardSponsorBlockMode' | 'wizardSponsorBlockCategories' | 'wizardEmbedChapters' | 'wizardEmbedMetadata' | 'wizardEmbedThumbnail' | 'wizardWriteDescription' | 'wizardWriteThumbnail' | 'wizardWriteM3u'>

export interface ProbeStartProjection {
	fromStep: WizardStep
	initialStep: WizardStep
	patch: Partial<AppState>
}

export interface BulkStartProjection {
	patch: Partial<AppState>
	allYouTubeVideos: boolean
	playlistItems: PlaylistEntry[]
}

function restoreCommonWizardPrefs(settings: AppSettings | null): CommonPrefsPatch {
	return {
		wizardSponsorBlockMode: settings?.common?.lastSponsorBlockMode ?? DEFAULTS.sponsorBlockMode,
		wizardSponsorBlockCategories: settings?.common?.lastSponsorBlockCategories ?? [...DEFAULTS.sponsorBlockCategories],
		wizardEmbedChapters: settings?.common?.embedChapters ?? DEFAULTS.embedChapters,
		wizardEmbedMetadata: settings?.common?.embedMetadata ?? DEFAULTS.embedMetadata,
		wizardEmbedThumbnail: settings?.common?.embedThumbnail ?? DEFAULTS.embedThumbnail,
		wizardWriteDescription: settings?.common?.writeDescription ?? DEFAULTS.writeDescription,
		wizardWriteThumbnail: settings?.common?.writeThumbnail ?? DEFAULTS.writeThumbnail,
		wizardWriteM3u: settings?.common?.writeM3u ?? DEFAULTS.writeM3u
	}
}

export function projectProbeStart(state: AppState, url: string, playlistMode: ProbePlaylistMode): ProbeStartProjection {
	const initialStep: WizardStep = playlistMode === 'playlist' ? 'playlistItems' : 'formats'
	return {
		fromStep: state.wizardStep,
		initialStep,
		patch: {
			wizardUrl: url,
			wizardStep: initialStep,
			wizardMode: playlistMode === 'playlist' ? 'playlist' : 'single',
			formatsLoading: playlistMode !== 'playlist',
			playlistProbeLoading: playlistMode !== 'video',
			playlistScopeError: null,
			wizardError: null,
			cookiesConfigDialogIssue: null,
			wizardFormats: [],
			wizardFormatsDegraded: null,
			wizardSubtitles: {},
			wizardAutomaticCaptions: {},
			wizardSubtitleLanguages: [],
			playlistItems: [],
			selectedPlaylistItemIds: [],
			playlistTitle: '',
			playlistId: '',
			playlistIsMultiVideo: false,
			playlistLikelyCapped: false,
			playlistProbeProgress: null,
			playlistScopeReloading: false,
			bulkMetadataStatus: 'idle',
			bulkMetadataCompleted: 0,
			bulkMetadataTotal: 0,
			bulkMetadataById: {},
			syncedDownloadedIds: [],
			syncScanState: 'idle',
			wizardExtractor: '',
			wizardExtractorKey: '',
			wizardWebpageUrl: ''
		}
	}
}

export function projectProbeFailure(error: AppState['wizardError']): Partial<AppState> {
	return {wizardStep: 'error', formatsLoading: false, playlistProbeLoading: false, playlistProbeProgress: null, wizardError: error, wizardErrorOrigin: 'formats', wizardFormatsDegraded: null}
}

export function projectVideoProbeResult(probe: Extract<ProbeResult, {kind: 'video'}>, state: AppState, firstProbe: boolean): Partial<AppState> {
	const settings = state.settings
	const {formats, title, thumbnail, duration, subtitles, automaticCaptions, degraded} = probe
	// Format/audio/subtitle/preset prefs are scoped to YouTube. Non-YT extractors
	// get fresh defaults so a YT formatId / 1080p resolution doesn't leak into a
	// Vimeo/PornHub/etc. probe. Subfolder + common prefs are global intent.
	const persistApplies = isYouTubeExtractor(probe.extractor)
	const scopedSettings = persistApplies ? settings : null
	let {videoFormatId, audioSelection, preset} = restoreFormatSelection(formats, scopedSettings)
	const {languages: subtitleLanguages} = restoreSubtitleSelection(subtitles, automaticCaptions, scopedSettings)
	if (probe.isAudioOnlySource) {
		const audioOnlyPick = applyPreset('audio-only', formats)
		videoFormatId = audioOnlyPick.videoFormatId
		audioSelection = audioOnlyPick.audioSelection
		preset = 'audio-only'
	}
	return {
		wizardStep: 'formats',
		wizardMode: 'single',
		wizardFormats: formats,
		wizardFormatsDegraded: degraded ?? null,
		wizardExtractor: probe.extractor,
		wizardExtractorKey: probe.extractorKey,
		wizardWebpageUrl: probe.webpageUrl,
		wizardTitle: title,
		wizardThumbnail: thumbnail,
		wizardDuration: duration,
		selectedVideoFormatId: videoFormatId,
		audioSelection,
		activePreset: preset,
		wizardSubtitles: subtitles,
		wizardAutomaticCaptions: automaticCaptions,
		wizardSubtitleLanguages: subtitleLanguages,
		wizardSubtitleSkipped: false,
		...(firstProbe
			? {
					wizardSubtitleMode: scopedSettings?.single?.lastSubtitleMode ?? DEFAULTS.subtitleMode,
					wizardSubtitleFormat: scopedSettings?.single?.lastSubtitleFormat ?? DEFAULTS.subtitleFormat,
					...restoreCommonWizardPrefs(settings),
					wizardSubfolderEnabled: settings?.common?.lastSubfolderEnabled ?? false,
					wizardSubfolderName: settings?.common?.lastSubfolder ?? ''
				}
			: {}),
		formatsLoading: false,
		playlistProbeLoading: false,
		playlistProbeProgress: null,
		playlistItems: [],
		selectedPlaylistItemIds: [],
		playlistTitle: '',
		playlistId: '',
		playlistIsMultiVideo: false
	}
}

function visiblePlaylistProbeLimit(state: Pick<AppState, 'playlistScope' | 'settings'>): number {
	const scope = state.playlistScope
	if (scope.items.kind === 'first') return scope.items.count
	if (scope.items.kind === 'range') return scope.items.to - scope.items.from + 1
	return resolvePlaylistProbeLimit(state.settings?.common)
}

export function projectPlaylistProbeResult(probe: Extract<ProbeResult, {kind: 'playlist'}>, state: AppState, firstProbe: boolean): Partial<AppState> {
	const settings = state.settings
	const playlistLimit = visiblePlaylistProbeLimit(state)
	const hasSentinel = probe.entries.length > playlistLimit
	const playlistLikelyCapped = hasSentinel && state.playlistScope.items.kind === 'app-limit'
	const playlistItems = hasSentinel ? probe.entries.slice(0, playlistLimit) : probe.entries
	const persistedSelection: PlaylistSelection = settings?.playlist?.lastPlaylistSelection ?? DEFAULT_PLAYLIST_SELECTION
	const computedSelection: PlaylistSelection = probe.isAudioOnlySource ? {kind: 'audio', format: 'best'} : persistedSelection
	const playlistSelection = firstProbe ? computedSelection : (state.playlistSelection ?? computedSelection)
	return {
		wizardStep: 'playlistItems',
		wizardMode: 'playlist',
		wizardExtractor: probe.extractor,
		wizardExtractorKey: probe.extractorKey,
		wizardWebpageUrl: probe.webpageUrl,
		playlistItems,
		selectedPlaylistItemIds: playlistItems.map(e => e.id),
		playlistTitle: probe.playlistTitle,
		playlistId: probe.playlistId,
		playlistIsMultiVideo: probe.isMultiVideo,
		playlistLikelyCapped,
		playlistScopeError: null,
		playlistProbeLoading: false,
		playlistProbeProgress: null,
		formatsLoading: false,
		wizardFormats: [],
		wizardFormatsDegraded: null,
		...(firstProbe ? {...restoreCommonWizardPrefs(settings), wizardSubfolderEnabled: settings?.common?.lastSubfolderEnabled ?? false, wizardSubfolderName: settings?.common?.lastSubfolder ?? ''} : {}),
		playlistSelection
	}
}

export function projectBulkStart(urls: readonly string[], state: AppState): BulkStartProjection {
	const settings = state.settings
	const intents = urls.map(url => classifyUrlIntent(url))
	const allYouTubeVideos = intents.length > 0 && intents.every(isObviousSingleUrlIntent)
	const playlistSelection: PlaylistSelection = settings?.playlist?.lastPlaylistSelection ?? DEFAULT_PLAYLIST_SELECTION
	const playlistItems = urls.map((url, index) => {
		const number = index + 1
		const intent = intents[index] ?? classifyUrlIntent(url)
		return {id: `bulk-${number}`, url, title: deriveUrlIntentLabel(url) ?? `Bulk URL ${number}`, thumbnail: '', playlistIndex: number, videoId: extractUrlIntentYouTubeVideoId(intent)}
	})
	return {
		allYouTubeVideos,
		playlistItems,
		patch: {
			wizardStep: 'playlistItems',
			wizardMode: 'bulk',
			wizardUrl: '',
			wizardTitle: '',
			wizardThumbnail: '',
			wizardDuration: undefined,
			wizardFormats: [],
			wizardFormatsDegraded: null,
			selectedVideoFormatId: '',
			audioSelection: {kind: 'none'},
			activePreset: null,
			wizardSubtitles: {},
			wizardAutomaticCaptions: {},
			wizardSubtitleLanguages: [],
			wizardSubtitleSkipped: false,
			wizardExtractor: allYouTubeVideos ? 'youtube' : '',
			wizardExtractorKey: allYouTubeVideos ? 'Youtube' : '',
			wizardWebpageUrl: '',
			formatsLoading: false,
			playlistProbeLoading: false,
			wizardError: null,
			wizardErrorOrigin: null,
			cookiesConfigDialogIssue: null,
			playlistItems,
			selectedPlaylistItemIds: playlistItems.map(entry => entry.id),
			playlistTitle: 'Bulk URLs',
			playlistId: 'bulk',
			playlistIsMultiVideo: false,
			playlistLikelyCapped: false,
			playlistProbeProgress: null,
			bulkMetadataStatus: urls.length > 0 ? 'resolving' : 'idle',
			bulkMetadataCompleted: 0,
			bulkMetadataTotal: urls.length,
			bulkMetadataById: Object.fromEntries(playlistItems.map(entry => [entry.id, 'pending'])),
			syncedDownloadedIds: [],
			syncScanState: 'idle',
			...restoreCommonWizardPrefs(settings),
			wizardSubfolderEnabled: settings?.common?.lastSubfolderEnabled ?? false,
			wizardSubfolderName: settings?.common?.lastSubfolder ?? '',
			wizardWriteM3u: false,
			playlistSelection
		}
	}
}
