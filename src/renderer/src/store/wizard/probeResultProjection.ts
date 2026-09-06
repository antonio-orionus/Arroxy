import {DEFAULTS} from '@shared/constants.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {DEFAULT_PLAYLIST_SELECTION} from '@shared/schemas.js'
import {placeholderTitleFlag} from '@shared/queueTitle.js'
import type {AppSettings, BulkMetadataStatus, PlaylistEntry, PlaylistSelection, ProbePlaylistMode, ProbeResult} from '@shared/types.js'
import {classifyUrlIntent, deriveUrlIntentLabel, extractUrlIntentYouTubeVideoId, isObviousSingleUrlIntent} from '@shared/urlIntent.js'
import {isYouTubeExtractor} from '@shared/ytdlp/extractorPredicates.js'
import type {AppState, WizardStep} from '../types.js'
import type {BulkMetadataTarget} from './bulkMetadataHydration.js'
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
	/** Rows still needing a metadata probe — seeded rows are already complete. */
	metadataTargets: BulkMetadataTarget[]
}

/**
 * Metadata already known for a bulk row, from the playlist probe that produced
 * it. Rows expanded out of a collection URL arrive with real values, so they
 * skip hydration entirely instead of re-probing every entry one at a time.
 */
export type BulkEntrySeed = Pick<PlaylistEntry, 'title' | 'thumbnail' | 'duration' | 'videoId' | 'uploader' | 'uploadDate' | 'timestamp' | 'isContainer' | 'titleIsPlaceholder'>

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
			wizardWebpageUrl: '',
			wizardProbeInfoJsonRef: undefined,
			multiProfileMode: false,
			playlistSortMode: 'api' as const,
			playlistProfileAssignments: {},
			removedPlaylistItemIds: [],
			removedSelectionIds: []
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
		const audioOnlyPick = applyPreset('audio-only', formats, scopedSettings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference)
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
		wizardProbeInfoJsonRef: probe.probeInfoJsonRef,
		wizardTitle: title,
		wizardThumbnail: thumbnail,
		wizardDuration: duration,
		wizardVideoId: probe.videoId ?? '',
		wizardUploader: probe.uploader ?? '',
		wizardUploadDate: probe.uploadDate ?? '',
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
		wizardProbeInfoJsonRef: undefined,
		playlistItems,
		// Container rows (channel/playlist/album) stay visible so an all-container
		// result still renders a picker, but they start unselected: they cannot be
		// downloaded, and pre-selecting them would put the wizard one click from a
		// submission that silently drops most of what looked selected.
		selectedPlaylistItemIds: playlistItems.filter(e => e.isContainer !== true).map(e => e.id),
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
		playlistSelection,
		// A first probe is a new list: reset the view sort to api order. Scope
		// reloads reuse this projection with firstProbe=false and keep the
		// user's current sort.
		...(firstProbe ? {playlistSortMode: 'api' as const} : {}),
		// This projection also lands `reloadPlaylistWithScope`'s result, which
		// does not go through projectProbeStart's reset. Without resetting these
		// here too, restoreRemovedPlaylistItems after a scope reload can re-add
		// ids from the previous scope's playlist that no longer exist in this
		// one. On a first probe these are already [] (projectProbeStart), so this
		// is a no-op there.
		removedPlaylistItemIds: [],
		removedSelectionIds: []
	}
}

export function projectBulkStart(urls: readonly string[], state: AppState, seeds?: ReadonlyMap<string, BulkEntrySeed>): BulkStartProjection {
	const settings = state.settings
	const intents = urls.map(url => classifyUrlIntent(url))
	const allYouTubeVideos = intents.length > 0 && intents.every(isObviousSingleUrlIntent)
	const playlistSelection: PlaylistSelection = settings?.playlist?.lastPlaylistSelection ?? DEFAULT_PLAYLIST_SELECTION
	const metadataTargets: BulkMetadataTarget[] = []
	const playlistItems = urls.map((url, index) => {
		const number = index + 1
		const id = `bulk-${number}`
		const intent = intents[index] ?? classifyUrlIntent(url)
		const seed = seeds?.get(url)
		if (!seed) metadataTargets.push({id, url, index})
		// A seeded row takes the playlist probe's own title, exactly as the normal
		// playlist path does — ProbeService's fallback chain (title → id hint →
		// "Untitled · #N") guarantees a non-empty one, so there is nothing to fall
		// back to here. The URL label below is only for unseeded rows, and is only
		// ever a placeholder: hydration must replace it before the row can be
		// downloaded, because binding a URL label into a filename template is what
		// names every file after the URL.
		return {
			id,
			url,
			title: seed?.title ?? deriveUrlIntentLabel(url) ?? `Bulk URL ${number}`,
			thumbnail: seed?.thumbnail ?? '',
			playlistIndex: number,
			videoId: seed?.videoId ?? extractUrlIntentYouTubeVideoId(intent),
			...(seed?.duration === undefined ? {} : {duration: seed.duration}),
			...(seed?.uploader === undefined ? {} : {uploader: seed.uploader}),
			...(seed?.uploadDate === undefined ? {} : {uploadDate: seed.uploadDate}),
			...(seed?.timestamp === undefined ? {} : {timestamp: seed.timestamp}),
			...(seed?.isContainer === true ? {isContainer: true as const} : {}),
			...placeholderTitleFlag(seed?.titleIsPlaceholder)
		}
	})
	const seededCount = playlistItems.length - metadataTargets.length
	// 'idle' means no bulk list exists. A list whose rows all arrived seeded
	// from a collection probe has no work left, which is 'done', not 'idle' —
	// otherwise the confirm step reads it as a list that never resolved.
	const bulkMetadataStatus: BulkMetadataStatus = metadataTargets.length > 0 ? 'resolving' : urls.length > 0 ? 'done' : 'idle'
	return {
		allYouTubeVideos,
		playlistItems,
		metadataTargets,
		patch: {
			wizardStep: 'playlistItems',
			wizardMode: 'bulk',
			wizardUrl: '',
			wizardTitle: '',
			wizardThumbnail: '',
			wizardDuration: undefined,
			wizardVideoId: '',
			wizardUploader: '',
			wizardUploadDate: '',
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
			wizardProbeInfoJsonRef: undefined,
			formatsLoading: false,
			playlistProbeLoading: false,
			wizardError: null,
			wizardErrorOrigin: null,
			cookiesConfigDialogIssue: null,
			playlistItems,
			// A row seeded as a playlist (a collection that could not be expanded)
			// is not downloadable, so it must not start checked.
			selectedPlaylistItemIds: playlistItems.filter(entry => entry.isContainer !== true).map(entry => entry.id),
			playlistTitle: 'Bulk URLs',
			playlistId: 'bulk',
			playlistIsMultiVideo: false,
			playlistLikelyCapped: false,
			playlistProbeProgress: null,
			bulkMetadataStatus,
			bulkMetadataCompleted: seededCount,
			bulkMetadataTotal: urls.length,
			bulkMetadataById: Object.fromEntries(playlistItems.map(entry => [entry.id, seeds?.has(entry.url) ? 'done' : 'pending'])),
			syncedDownloadedIds: [],
			syncScanState: 'idle',
			...restoreCommonWizardPrefs(settings),
			wizardSubfolderEnabled: settings?.common?.lastSubfolderEnabled ?? false,
			wizardSubfolderName: settings?.common?.lastSubfolder ?? '',
			wizardWriteM3u: false,
			playlistSelection,
			multiProfileMode: false,
			playlistProfileAssignments: {},
			removedPlaylistItemIds: [],
			removedSelectionIds: []
		}
	}
}
