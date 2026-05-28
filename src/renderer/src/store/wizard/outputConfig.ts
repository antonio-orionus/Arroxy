// OutputConfig slice — owns the wizard's "where + how the file lands" state:
// output dir + subfolder, SponsorBlock mode + categories, embed flags
// (chapters / metadata / thumbnail / description / thumbnailSidecar).
//
// `chooseWizardFolder` and `setWizardOutputDir` persist the selection to
// SettingsStore via the system slice's IPC; the format-prefs persistence
// pass at queue-submit time captures the rest.

import { DEFAULTS } from '@shared/constants.js';
import type { GetState, OutputConfigSlice, SetState } from '../types.js';

export function createOutputConfigSlice(set: SetState, _get: GetState): OutputConfigSlice {
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

    setWizardOutputDir: async (dir, persist = true) => {
      set({ wizardOutputDir: dir, syncedDownloadedIds: [] });
      if (persist) await window.appApi.settings.update({ common: { defaultOutputDir: dir } });
    },

    chooseWizardFolder: async () => {
      const result = await window.appApi.dialog.chooseFolder();
      if (!result.ok || !result.data.path) return;
      set({ wizardOutputDir: result.data.path, syncedDownloadedIds: [] });
      await window.appApi.settings.update({ common: { defaultOutputDir: result.data.path } });
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
    setWriteThumbnail: (v) => set({ wizardWriteThumbnail: v })
  };
}
