import type {AppState} from '../types.js'

// The wizard choices the download review, the settings summary and the profile
// drafts are built from. Components that show those subscribe to exactly these
// fields (with useShallow), so unrelated store traffic such as queue progress
// does not re-render them.
export type WizardReviewState = Pick<
	AppState,
	| 'audioSelection'
	| 'commonPaths'
	| 'multiProfileMode'
	| 'playlistItems'
	| 'playlistProfileAssignments'
	| 'playlistSelection'
	| 'playlistTitle'
	| 'removedPlaylistItemIds'
	| 'selectedPlaylistItemIds'
	| 'selectedVideoFormatId'
	| 'settings'
	| 'wizardAutomaticCaptions'
	| 'wizardDuration'
	| 'wizardEmbedChapters'
	| 'wizardEmbedMetadata'
	| 'wizardEmbedThumbnail'
	| 'wizardExtractor'
	| 'wizardFileType'
	| 'wizardFilenameTemplate'
	| 'wizardFormatSelection'
	| 'wizardFormats'
	| 'wizardMediaKind'
	| 'wizardMode'
	| 'wizardOutputDir'
	| 'wizardPart'
	| 'wizardProfile'
	| 'wizardProfileBaseline'
	| 'wizardSponsorBlockCategories'
	| 'wizardSponsorBlockMode'
	| 'wizardSubfolderEnabled'
	| 'wizardSubfolderName'
	| 'wizardSubtitleFormat'
	| 'wizardSubtitleLanguages'
	| 'wizardSubtitleMode'
	| 'wizardSubtitles'
	| 'wizardThumbnail'
	| 'wizardTitle'
	| 'wizardWebpageUrl'
	| 'wizardWriteDescription'
	| 'wizardWriteThumbnail'
>

export function selectWizardReviewState(state: AppState): WizardReviewState {
	return {
		audioSelection: state.audioSelection,
		commonPaths: state.commonPaths,
		multiProfileMode: state.multiProfileMode,
		playlistItems: state.playlistItems,
		playlistProfileAssignments: state.playlistProfileAssignments,
		playlistSelection: state.playlistSelection,
		playlistTitle: state.playlistTitle,
		removedPlaylistItemIds: state.removedPlaylistItemIds,
		selectedPlaylistItemIds: state.selectedPlaylistItemIds,
		selectedVideoFormatId: state.selectedVideoFormatId,
		settings: state.settings,
		wizardAutomaticCaptions: state.wizardAutomaticCaptions,
		wizardDuration: state.wizardDuration,
		wizardEmbedChapters: state.wizardEmbedChapters,
		wizardEmbedMetadata: state.wizardEmbedMetadata,
		wizardEmbedThumbnail: state.wizardEmbedThumbnail,
		wizardExtractor: state.wizardExtractor,
		wizardFileType: state.wizardFileType,
		wizardFilenameTemplate: state.wizardFilenameTemplate,
		wizardFormatSelection: state.wizardFormatSelection,
		wizardFormats: state.wizardFormats,
		wizardMediaKind: state.wizardMediaKind,
		wizardMode: state.wizardMode,
		wizardOutputDir: state.wizardOutputDir,
		wizardPart: state.wizardPart,
		wizardProfile: state.wizardProfile,
		wizardProfileBaseline: state.wizardProfileBaseline,
		wizardSponsorBlockCategories: state.wizardSponsorBlockCategories,
		wizardSponsorBlockMode: state.wizardSponsorBlockMode,
		wizardSubfolderEnabled: state.wizardSubfolderEnabled,
		wizardSubfolderName: state.wizardSubfolderName,
		wizardSubtitleFormat: state.wizardSubtitleFormat,
		wizardSubtitleLanguages: state.wizardSubtitleLanguages,
		wizardSubtitleMode: state.wizardSubtitleMode,
		wizardSubtitles: state.wizardSubtitles,
		wizardThumbnail: state.wizardThumbnail,
		wizardTitle: state.wizardTitle,
		wizardWebpageUrl: state.wizardWebpageUrl,
		wizardWriteDescription: state.wizardWriteDescription,
		wizardWriteThumbnail: state.wizardWriteThumbnail
	}
}
