// WizardCommands — orchestrator helpers that span multiple wizard slices.
// Currently houses `resetAll`, applied via the `reset` action on the probe
// orchestrator slice. New cross-slice commands (e.g. snapshot replay, deep
// links) land here so individual slice files stay focused on their domain.

import { DEFAULTS } from '@shared/constants.js';
import { DEFAULT_AUDIO_BITRATE } from '@shared/schemas.js';
import type { FormatOption, PlaylistEntry, PlaylistPreset, SubtitleMap } from '@shared/types.js';
import type { SetState, WizardMode, WizardStep } from '../types.js';

// Full wizard reset state — owned conceptually by the four slices but applied
// in one set() call so the UI never sees a half-reset wizard. Per-slice reset
// constants live with their slice file; this is the union for the orchestrator.
export const RESET_WIZARD_STATE = {
  // probe + step nav
  wizardStep: 'url' as WizardStep,
  wizardMode: 'single' as WizardMode,
  wizardUrl: '',
  wizardTitle: '',
  wizardThumbnail: '',
  wizardDuration: undefined as number | undefined,
  wizardFormatsDegraded: null,
  wizardExtractor: '',
  wizardExtractorKey: '',
  wizardWebpageUrl: '',
  formatsLoading: false,
  wizardError: null,
  wizardErrorOrigin: null,
  playlistItems: [] as PlaylistEntry[],
  selectedPlaylistItemIds: [] as string[],
  playlistTitle: '',
  playlistId: '',
  playlistIsMultiVideo: false,
  playlistProbeLoading: false,
  selectedPlaylistPreset: null as PlaylistPreset | null,
  // formatPicker
  wizardFormats: [] as FormatOption[],
  selectedVideoFormatId: '',
  audioSelection: { kind: 'none' as const },
  lastConvertBitrate: DEFAULT_AUDIO_BITRATE,
  activePreset: null,
  wizardSubtitles: {} as SubtitleMap,
  wizardAutomaticCaptions: {} as SubtitleMap,
  wizardSubtitleLanguages: [] as string[],
  wizardSubtitleSkipped: false,
  wizardSubtitleMode: DEFAULTS.subtitleMode,
  wizardSubtitleFormat: DEFAULTS.subtitleFormat,
  // outputConfig
  wizardSponsorBlockMode: DEFAULTS.sponsorBlockMode,
  wizardSponsorBlockCategories: DEFAULTS.sponsorBlockCategories,
  wizardEmbedChapters: DEFAULTS.embedChapters,
  wizardEmbedMetadata: DEFAULTS.embedMetadata,
  wizardEmbedThumbnail: DEFAULTS.embedThumbnail,
  wizardWriteDescription: DEFAULTS.writeDescription,
  wizardWriteThumbnail: DEFAULTS.writeThumbnail,
  wizardSubfolderEnabled: false,
  wizardSubfolderName: '',
  // sync-with-folder
  syncedDownloadedIds: [] as string[],
  // dialogs
  advancedAutoOpen: false,
  advancedAutoTarget: 'cookies' as const,
  mixedUrlPromptOpen: false,
  mixedUrlPending: null as string | null,
  cookiesConfigDialogIssue: null
} as const;

export const WizardCommands = {
  resetAll(set: SetState): void {
    set(RESET_WIZARD_STATE);
  }
};
