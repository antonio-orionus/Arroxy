import { DEFAULTS } from '@shared/constants';
import { applyPreset, restoreFormatSelection, restoreSubtitleSelection } from './helpers';
import type { GetState, SetState, WizardSlice } from './types';

export function createWizardSlice(set: SetState, get: GetState): WizardSlice {
  return {
    wizardStep: 'url',
    formatsLoading: false,
    wizardUrl: '',
    wizardTitle: '',
    wizardThumbnail: '',
    wizardDuration: undefined,
    wizardFormats: [],
    selectedVideoFormatId: '',
    selectedAudioFormatId: null,
    activePreset: null,
    wizardOutputDir: '',
    wizardError: null,
    wizardErrorOrigin: null,
    wizardSubtitles: {},
    wizardAutomaticCaptions: {},
    wizardSubtitleLanguages: [],
    wizardSubtitleMode: DEFAULTS.subtitleMode,
    wizardSubtitleFormat: DEFAULTS.subtitleFormat,

    setWizardUrl: (url) => set({ wizardUrl: url }),

    submitUrl: async () => {
      const url = get().wizardUrl.trim();
      if (!url) return;
      set({ wizardStep: 'formats', formatsLoading: true, wizardError: null });

      const result = await window.appApi.downloads.getFormats({ url });
      if (!result.ok) {
        set({ wizardStep: 'error', formatsLoading: false, wizardError: result.error, wizardErrorOrigin: 'formats' });
        return;
      }

      const { formats, title, thumbnail, duration, subtitles = {}, automaticCaptions = {} } = result.data;
      const settings = get().settings;
      const { videoFormatId, audioFormatId, preset } = restoreFormatSelection(formats, settings);
      const { languages: subtitleLanguages } = restoreSubtitleSelection(subtitles, automaticCaptions, settings);

      set({
        wizardFormats: formats,
        wizardTitle: title,
        wizardThumbnail: thumbnail,
        wizardDuration: duration,
        selectedVideoFormatId: videoFormatId,
        selectedAudioFormatId: audioFormatId,
        activePreset: preset,
        wizardSubtitles: subtitles,
        wizardAutomaticCaptions: automaticCaptions,
        wizardSubtitleLanguages: subtitleLanguages,
        wizardSubtitleMode: settings?.lastSubtitleMode ?? DEFAULTS.subtitleMode,
        wizardSubtitleFormat: settings?.lastSubtitleFormat ?? DEFAULTS.subtitleFormat,
        formatsLoading: false
      });
    },

    goToStep: (step) => set({ wizardStep: step }),

    setWizardOutputDir: async (dir, persist = true) => {
      set({ wizardOutputDir: dir });
      if (persist) {
        await window.appApi.settings.update({ defaultOutputDir: dir });
      }
    },

    setSelectedVideoFormatId: (id) => set({ selectedVideoFormatId: id, activePreset: null }),

    setAudioFormatId: (id) => set({ selectedAudioFormatId: id, activePreset: null }),

    setPreset: (p) => {
      const { wizardFormats } = get();
      const { videoFormatId, audioFormatId } = applyPreset(p, wizardFormats);
      set({ activePreset: p, selectedVideoFormatId: videoFormatId, selectedAudioFormatId: audioFormatId });
    },

    confirmFormats: () => set({ wizardStep: 'subtitles' }),

    toggleSubtitleLanguage: (lang) => set((state) => ({
      wizardSubtitleLanguages: state.wizardSubtitleLanguages.includes(lang)
        ? state.wizardSubtitleLanguages.filter((l) => l !== lang)
        : [...state.wizardSubtitleLanguages, lang]
    })),

    setSubtitleMode: (mode) => set({ wizardSubtitleMode: mode }),
    setSubtitleFormat: (format) => set({ wizardSubtitleFormat: format }),

    confirmSubtitles: () => set({ wizardStep: 'folder' }),

    chooseWizardFolder: async () => {
      const result = await window.appApi.dialog.chooseFolder();
      if (!result.ok || !result.data.path) return;
      set({ wizardOutputDir: result.data.path });
      await window.appApi.settings.update({ defaultOutputDir: result.data.path });
    },

    confirmFolder: () => set({ wizardStep: 'confirm' }),

    retryWizard: async () => {
      const { wizardErrorOrigin } = get();
      if (wizardErrorOrigin === 'formats') {
        set({ wizardStep: 'formats', formatsLoading: true, wizardError: null });
        await get().submitUrl();
      }
    },

    resetWizard: () => {
      set({
        wizardStep: 'url',
        wizardUrl: '',
        wizardTitle: '',
        wizardThumbnail: '',
        wizardDuration: undefined,
        wizardFormats: [],
        formatsLoading: false,
        wizardError: null,
        wizardErrorOrigin: null,
        wizardSubtitles: {},
        wizardAutomaticCaptions: {},
        wizardSubtitleLanguages: [],
        wizardSubtitleMode: DEFAULTS.subtitleMode,
        wizardSubtitleFormat: DEFAULTS.subtitleFormat
      });
    }
  };
}
