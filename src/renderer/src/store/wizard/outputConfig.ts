// OutputConfig slice — owns the wizard's "where + how the file lands" state:
// output dir + subfolder, SponsorBlock mode + categories, embed / sidecar
// output flags (chapters / metadata / thumbnail / description /
// thumbnailSidecar / M3U).
//
// `chooseWizardFolder` and `setWizardOutputDir` persist the selection to
// SettingsStore via the system slice's IPC; the format-prefs persistence
// pass at queue-submit time captures the rest.

import { DEFAULTS } from '@shared/constants.js';
import { splitDir } from '@shared/subfolder.js';
import { notify } from '@renderer/lib/notify.js';
import type { GetState, OutputConfigSlice, SetState } from '../types.js';

export function createOutputConfigSlice(set: SetState, get: GetState): OutputConfigSlice {
  return {
    wizardOutputDir: '',
    wizardSubfolderEnabled: false,
    wizardSubfolderName: '',
    wizardSponsorBlockMode: DEFAULTS.sponsorBlockMode,
    wizardSponsorBlockCategories: DEFAULTS.sponsorBlockCategories,
    wizardEmbedChapters: DEFAULTS.embedChapters,
    wizardEmbedMetadata: DEFAULTS.embedMetadata,
    wizardEmbedThumbnail: DEFAULTS.embedThumbnail,
    wizardWriteDescription: DEFAULTS.writeDescription,
    wizardWriteThumbnail: DEFAULTS.writeThumbnail,
    wizardWriteM3u: DEFAULTS.writeM3u,

    setWizardOutputDir: async (dir, persist = true) => {
      set({ wizardOutputDir: dir, syncedDownloadedIds: [] });
      if (persist) await window.appApi.settings.update({ common: { defaultOutputDir: dir } });
    },

    chooseWizardFolder: async () => {
      // Seed the dialog with the current output dir so it opens there.
      const result = await window.appApi.dialog.chooseFolder(get().wizardOutputDir || undefined);
      if (!result.ok || !result.data.path) return;
      set({ wizardOutputDir: result.data.path, syncedDownloadedIds: [] });
      await window.appApi.settings.update({ common: { defaultOutputDir: result.data.path } });
    },

    // Point the playlist at an exact folder (sync "Change folder"). We keep ONE
    // source of truth — base + subfolder — by inverting the dir into base=parent
    // + explicit subfolder=leaf (see splitDir). This keeps the output settings
    // and the playlist dir in sync both ways: picking a folder updates base +
    // subfolder, and editing base/subfolder re-derives the playlist dir.
    setPlaylistFolder: async (dir) => {
      const { parent, leaf } = splitDir(dir);
      // A drive/POSIX root (empty leaf) or a separator-less path (empty parent)
      // can't be inverted into base + explicit subfolder without producing an
      // inconsistent output dir — decline rather than write a broken SSOT.
      if (!leaf || !parent) {
        notify.playlistFolderRejected(dir);
        return;
      }
      set({ wizardOutputDir: parent, wizardSubfolderEnabled: true, wizardSubfolderName: leaf, syncedDownloadedIds: [] });
      await window.appApi.settings.update({ common: { defaultOutputDir: parent } });
    },

    setWizardSubfolderEnabled: (enabled) => set({ wizardSubfolderEnabled: enabled }),
    setWizardSubfolderName: (name) => set({ wizardSubfolderName: name }),

    setSponsorBlockMode: (mode) => set({ wizardSponsorBlockMode: mode }),

    toggleSponsorBlockCategory: (cat) =>
      set((state) => ({
        wizardSponsorBlockCategories: state.wizardSponsorBlockCategories.includes(cat) ? state.wizardSponsorBlockCategories.filter((c) => c !== cat) : [...state.wizardSponsorBlockCategories, cat]
      })),

    setEmbedChapters: (v) => set({ wizardEmbedChapters: v }),
    setEmbedMetadata: (v) => set({ wizardEmbedMetadata: v }),
    setEmbedThumbnail: (v) => set({ wizardEmbedThumbnail: v }),
    setWriteDescription: (v) => set({ wizardWriteDescription: v }),
    setWriteThumbnail: (v) => set({ wizardWriteThumbnail: v }),
    setWriteM3u: (v) => set({ wizardWriteM3u: v })
  };
}
