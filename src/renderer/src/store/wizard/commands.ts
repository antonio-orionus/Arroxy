// WizardCommands — orchestrator helpers that span multiple wizard slices.
// Currently houses `resetAll`, applied via the `reset` action on the probe
// orchestrator slice. New cross-slice commands (e.g. snapshot replay, deep
// links) land here so individual slice files stay focused on their domain.

import {DEFAULTS} from '@shared/constants.js'
import {EMPTY_FORMAT_SELECTION} from '@shared/ytdlp/selectableFormat.js'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {FitNotice} from '@shared/profileSelection.js'
import type {SelectionOrder} from '@shared/selectionOrder.js'
import type {ReviewRow, WizardSettingsSnapshot} from './profileApplication.js'
import type {AudioSelection, BulkMetadataItemStatus, BulkMetadataStatus, DownloadProfile, DownloadProfileRef, FormatOption, MediaTags, PlaylistEntry, PlaylistScope, PlaylistSelection, SubtitleMap, WizardMode} from '@shared/types.js'
import type {BulkCappedList, GetState, SetState, WizardOrigin, WizardStep} from '../types.js'
import {assignProfileToItems, clearAssignmentsForItems} from './playlistProfileAssignments.js'
import {QUICK_DOWNLOAD_FEEDBACK_INITIAL} from './quickDownloadFeedback.js'
import {RESET_VIDEO_PART_STATE} from './videoPart.js'

// Full wizard reset state — owned conceptually by the four slices but applied
// in one set() call so the UI never sees a half-reset wizard. Per-slice reset
// constants live with their slice file; this is the union for the orchestrator.
export const RESET_WIZARD_STATE = {
	// probe + step nav
	wizardStep: 'url' as WizardStep,
	wizardOrigin: 'download' as WizardOrigin,
	wizardMode: 'single' as WizardMode,
	wizardUrl: '',
	reviewSourceRowId: null as string | null,
	wizardReviewRow: null as ReviewRow | null,
	wizardTitle: '',
	wizardThumbnail: '',
	wizardDuration: undefined as number | undefined,
	wizardVideoId: '',
	wizardUploader: '',
	wizardUploadDate: '',
	wizardMediaTags: {} as MediaTags,
	wizardFormatsDegraded: null,
	wizardExtractor: '',
	wizardExtractorKey: '',
	wizardWebpageUrl: '',
	wizardProbeInfoJsonRef: undefined,
	wizardProbeAuth: undefined,
	formatsLoading: false,
	wizardError: null,
	wizardErrorOrigin: null,
	playlistItems: [] as PlaylistEntry[],
	selectedPlaylistItemIds: [] as string[],
	playlistTitle: '',
	playlistId: '',
	playlistIsMultiVideo: false,
	playlistLikelyCapped: false,
	playlistProbeLoading: false,
	playlistProbeProgress: null,
	playlistScopeReloading: false,
	playlistScopeError: null as string | null,
	playlistScope: {items: {kind: 'app-limit'}} as PlaylistScope,
	playlistSelection: null as PlaylistSelection | null,
	playlistSortMode: 'api' as const,
	multiProfileMode: false,
	playlistProfileAssignments: {} as Record<string, DownloadProfileRef>,
	removedPlaylistItemIds: [] as string[],
	removedSelectionIds: [] as string[],
	bulkMetadataStatus: 'idle' as BulkMetadataStatus,
	bulkMetadataCompleted: 0,
	bulkMetadataTotal: 0,
	bulkMetadataById: {} as Record<string, BulkMetadataItemStatus>,
	bulkCappedLists: [] as BulkCappedList[],
	...QUICK_DOWNLOAD_FEEDBACK_INITIAL,
	// formatPicker
	wizardFormats: [] as FormatOption[],
	wizardFormatSelection: EMPTY_FORMAT_SELECTION,
	selectedVideoFormatId: '',
	audioSelection: {kind: 'none' as const},
	wizardSilencedAudio: null as AudioSelection | null,
	lastConvertBitrate: DEFAULT_AUDIO_BITRATE,
	wizardMediaKind: 'video' as const,
	wizardSubtitles: {} as SubtitleMap,
	wizardAutomaticCaptions: {} as SubtitleMap,
	wizardSubtitleLanguages: [] as string[],
	wizardProfile: null as DownloadProfile | null,
	wizardProfileBaseline: null as WizardSettingsSnapshot | null,
	wizardFitNotices: [] as FitNotice[],
	wizardSelectionOrder: null as SelectionOrder | null,
	wizardFilenameTemplate: DEFAULTS.filenameTemplate,
	wizardIsAudioOnlySource: false,
	wizardFileType: 'auto' as const,
	wizardFileTypeReset: null,
	wizardSubtitleMode: DEFAULTS.subtitleMode,
	wizardSubtitleFormat: DEFAULTS.subtitleFormat,
	// videoPart
	...RESET_VIDEO_PART_STATE,
	// outputConfig
	wizardSponsorBlockMode: DEFAULTS.sponsorBlockMode,
	wizardSponsorBlockCategories: DEFAULTS.sponsorBlockCategories,
	wizardEmbedChapters: DEFAULTS.embedChapters,
	wizardEmbedMetadata: DEFAULTS.embedMetadata,
	wizardEmbedThumbnail: DEFAULTS.embedThumbnail,
	wizardWriteDescription: DEFAULTS.writeDescription,
	wizardWriteThumbnail: DEFAULTS.writeThumbnail,
	wizardWriteM3u: DEFAULTS.writeM3u,
	wizardSubfolderEnabled: false,
	wizardSubfolderName: '',
	// sync-with-folder
	syncedDownloadedIds: [] as string[],
	syncScanState: 'idle' as 'idle' | 'scanning' | 'done',
	// dialogs
	advancedAutoOpen: false,
	advancedAutoTarget: 'cookies' as const,
	mixedUrlPromptOpen: false,
	mixedUrlPending: null as string | null,
	mixedUrlPromptSource: null,
	cookiesConfigDialogIssue: null,
	quickPlaylistCapDialogOpen: false
} as const

export const WizardCommands = {
	resetAll(set: SetState): void {
		set(RESET_WIZARD_STATE)
	},

	enterMultiProfileMode(set: SetState): void {
		set({multiProfileMode: true, wizardStep: 'playlistProfiles'})
	},

	exitMultiProfileMode(set: SetState): void {
		// Deliberately keeps playlistProfileAssignments rather than clearing them —
		// they're keyed by item id, pruned on removal, and reset on every new
		// probe (probeResultProjection.ts, probeOrchestrator.ts), so re-entering
		// the mode restores the user's work instead of silently discarding it with
		// no confirm and no undo. Nothing reads this map while multiProfileMode is
		// false (StepPlaylistProfiles, multiProfileBreakdown, and
		// prepareMultiProfileQueueSubmission are all gated on that flag), so a
		// stale-but-unused map is harmless in single/normal-playlist mode.
		set({multiProfileMode: false, wizardStep: 'playlistItems'})
	},

	assignPlaylistProfile(itemIds: string[], ref: DownloadProfileRef, set: SetState, get: GetState): void {
		const state = get()
		const {ref: baselineRef} = resolveActiveDownloadProfile(state.settings?.profiles)
		set({playlistProfileAssignments: assignProfileToItems(state.playlistProfileAssignments, itemIds, ref, baselineRef)})
	},

	resetPlaylistProfile(itemIds: string[], set: SetState, get: GetState): void {
		set({playlistProfileAssignments: clearAssignmentsForItems(get().playlistProfileAssignments, itemIds)})
	},

	removePlaylistItems(itemIds: string[], set: SetState, get: GetState): void {
		const state = get()
		const removed = new Set([...state.removedPlaylistItemIds, ...itemIds])
		// Record which of these ids were checked *before* removal — restore
		// re-checks only those, not every removed id (an unchecked row must come
		// back unchecked). Set hoisted for the same reason as elsewhere (see
		// queueSubmission.ts's selectedPlaylistEntries): itemIds and
		// selectedPlaylistItemIds can both be up to playlist-size long.
		const selectedIdSet = new Set(state.selectedPlaylistItemIds)
		const newlyRemovedSelected = itemIds.filter(id => selectedIdSet.has(id))
		const removedSelectionIds = new Set([...state.removedSelectionIds, ...newlyRemovedSelected])
		set({removedPlaylistItemIds: [...removed], removedSelectionIds: [...removedSelectionIds], selectedPlaylistItemIds: state.selectedPlaylistItemIds.filter(id => !removed.has(id)), playlistProfileAssignments: clearAssignmentsForItems(state.playlistProfileAssignments, itemIds)})
	},

	restoreRemovedPlaylistItems(set: SetState, get: GetState): void {
		const state = get()
		const restoredSelection = new Set([...state.selectedPlaylistItemIds, ...state.removedSelectionIds])
		set({selectedPlaylistItemIds: [...restoredSelection], removedPlaylistItemIds: [], removedSelectionIds: []})
	}
}
