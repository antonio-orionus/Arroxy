// persistFormatPrefs — bridge between wizard state and SettingsStore.
// Reads format / audio / subtitle / output / embed / sponsorblock fields
// across multiple wizard slices and writes the right shape into the
// `common` / `single` / `playlist` Settings buckets via IPC. Lives in the
// wizard module (not queueSlice) because the inputs are wizard-owned, even
// though the firing point is queue-submit / start / retry.

import { resolveVideoResolution } from '../helpers.js';
import { isYouTubeExtractor } from '@shared/ytdlp/extractorPredicates.js';
import type { GetState, SetState } from '../types.js';

export async function persistFormatPrefs(set: SetState, get: GetState): Promise<void> {
  const { selectedVideoFormatId, activePreset, audioSelection, wizardFormats, wizardSubtitleLanguages, settings, wizardMode, playlistSelection, wizardExtractor } = get();
  if (!settings) return;
  const inBatch = wizardMode === 'playlist' || wizardMode === 'bulk';
  // Single-mode persisted prefs are scoped to YouTube. Non-YT runs skip the
  // `single.*` patch so a Vimeo/PornHub formatId or "YouTube Music" subfolder
  // doesn't leak into the next YouTube probe. Common prefs (sponsorblock mode,
  // embed/output artifact flags) stay global since they're pure intent.
  const persistSingleScope = isYouTubeExtractor(wizardExtractor);

  const common = {
    lastSponsorBlockMode: get().wizardSponsorBlockMode,
    lastSponsorBlockCategories: get().wizardSponsorBlockCategories,
    embedChapters: get().wizardEmbedChapters,
    embedMetadata: get().wizardEmbedMetadata,
    embedThumbnail: get().wizardEmbedThumbnail,
    writeDescription: get().wizardWriteDescription,
    writeThumbnail: get().wizardWriteThumbnail,
    ...(wizardMode !== 'bulk' ? { writeM3u: get().wizardWriteM3u } : {}),
    lastSubfolderEnabled: get().wizardSubfolderEnabled,
    lastSubfolder: get().wizardSubfolderName.trim()
  };

  if (inBatch) {
    const playlist = {
      ...(playlistSelection ? { lastPlaylistSelection: playlistSelection } : {})
    };
    const result = await window.appApi.settings.update({ common, playlist });
    if (result.ok) set({ settings: result.data });
    return;
  }

  if (!persistSingleScope) {
    const result = await window.appApi.settings.update({ common });
    if (result.ok) set({ settings: result.data });
    return;
  }

  const videoResolution = resolveVideoResolution(selectedVideoFormatId, wizardFormats, 'audio-only');

  // Only persist subtitle prefs when the user actually picked languages this run —
  // otherwise an empty selection (or a Skip Subs click) would wipe the saved list.
  const single = {
    lastVideoResolution: videoResolution,
    // SinglePrefs patch convention: undefined means "leave unchanged".
    // activePreset can be null in-memory (no preset selected); coerce to
    // undefined so the patch is a no-op rather than introducing a third state.
    ...(activePreset !== null ? { lastPreset: activePreset } : {}),
    lastAudioSelection: audioSelection,
    ...(wizardSubtitleLanguages.length > 0
      ? {
          lastSubtitleLanguages: wizardSubtitleLanguages,
          lastSubtitleMode: get().wizardSubtitleMode,
          lastSubtitleFormat: get().wizardSubtitleFormat
        }
      : {})
  };
  const result = await window.appApi.settings.update({ common, single });
  if (result.ok) {
    set({ settings: result.data });
  }
}
