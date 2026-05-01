import { DEFAULTS } from '@shared/constants';
import type { AppSettings, FormatOption, Preset, SubtitleMap } from '@shared/types';
import type { GetState, SetState, WizardSlice, WizardStep } from './types';

// Private helpers — only used inside this slice.

function groupedNonAudioFormats(formats: FormatOption[]) {
  const seen = new Set<string>();
  const out: { resolution: string; formatId: string }[] = [];
  for (const f of formats) {
    if (f.isAudioOnly) continue;
    const key = `${f.resolution}|${f.dynamicRange ?? ''}`;
    if (!seen.has(key)) { seen.add(key); out.push({ resolution: f.resolution, formatId: f.formatId }); }
  }
  return out;
}

function applyPreset(preset: Preset, formats: FormatOption[]): { videoFormatId: string; audioFormatId: string | null } {
  const grouped = groupedNonAudioFormats(formats);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;
  const worstAudio = audioFormats[audioFormats.length - 1]?.formatId ?? bestAudio;

  if (preset === 'best-quality') return { videoFormatId: grouped[0]?.formatId ?? '', audioFormatId: bestAudio };
  if (preset === 'audio-only') return { videoFormatId: '', audioFormatId: bestAudio };
  if (preset === 'subtitle-only') return { videoFormatId: '', audioFormatId: null };
  if (preset === 'balanced') {
    const target = grouped.find((g) => { const m = g.resolution.match(/(\d+)/); return m ? Number(m[1]) <= 720 : false; });
    return { videoFormatId: target?.formatId ?? grouped[grouped.length - 1]?.formatId ?? '', audioFormatId: bestAudio };
  }
  // small-file
  return { videoFormatId: grouped[grouped.length - 1]?.formatId ?? '', audioFormatId: worstAudio };
}

function restoreFormatSelection(
  formats: FormatOption[],
  settings: AppSettings | null
): { videoFormatId: string; audioFormatId: string | null; preset: Preset | null } {
  const grouped = groupedNonAudioFormats(formats);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;

  if (settings?.lastPreset) return { ...applyPreset(settings.lastPreset, formats), preset: settings.lastPreset };
  if (settings?.lastVideoResolution === 'audio-only') return { videoFormatId: '', audioFormatId: bestAudio, preset: null };
  if (settings?.lastVideoResolution) {
    const match = grouped.find((g) => g.resolution === settings.lastVideoResolution);
    if (match) return { videoFormatId: match.formatId, audioFormatId: bestAudio, preset: null };
  }
  return { ...applyPreset('best-quality', formats), preset: 'best-quality' };
}

function restoreSubtitleSelection(
  subtitles: SubtitleMap | undefined,
  automaticCaptions: SubtitleMap | undefined,
  settings: AppSettings | null
): { languages: string[] } {
  const available = new Set([...Object.keys(subtitles ?? {}), ...Object.keys(automaticCaptions ?? {})]);
  const languages = (settings?.lastSubtitleLanguages ?? []).filter((l) => available.has(l));
  return { languages };
}

const NEXT_STEP: Partial<Record<WizardStep, WizardStep>> = {
  formats: 'subtitles',
  subtitles: 'folder',
  folder: 'confirm',
};

const PREV_STEP: Partial<Record<WizardStep, WizardStep>> = {
  formats: 'url',
  subtitles: 'formats',
  folder: 'formats',
  confirm: 'folder',
};

const RESET_STATE = {
  wizardStep: 'url' as WizardStep,
  wizardUrl: '',
  wizardTitle: '',
  wizardThumbnail: '',
  wizardDuration: undefined as number | undefined,
  wizardFormats: [] as FormatOption[],
  formatsLoading: false,
  wizardError: null,
  wizardErrorOrigin: null,
  wizardSubtitles: {} as SubtitleMap,
  wizardAutomaticCaptions: {} as SubtitleMap,
  wizardSubtitleLanguages: [] as string[],
  wizardSubtitleMode: DEFAULTS.subtitleMode,
  wizardSubtitleFormat: DEFAULTS.subtitleFormat,
  wizardSubfolderEnabled: false,
  wizardSubfolderName: '',
} as const;

export function createWizardSlice(set: SetState, get: GetState): WizardSlice {
  return {
    ...RESET_STATE,
    selectedVideoFormatId: '',
    selectedAudioFormatId: null,
    activePreset: null,
    wizardOutputDir: '',

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
        wizardSubfolderEnabled: settings?.lastSubfolderEnabled ?? false,
        wizardSubfolderName: settings?.lastSubfolder ?? '',
        formatsLoading: false
      });
    },

    advance: () => {
      const next = NEXT_STEP[get().wizardStep];
      if (next) set({ wizardStep: next });
    },

    back: () => {
      const prev = PREV_STEP[get().wizardStep];
      if (prev) set({ wizardStep: prev });
    },

    reset: () => set(RESET_STATE),

    retry: async () => {
      const { wizardErrorOrigin } = get();
      if (wizardErrorOrigin === 'formats') {
        set({ wizardStep: 'formats', formatsLoading: true, wizardError: null });
        await get().submitUrl();
      }
    },

    setWizardOutputDir: async (dir, persist = true) => {
      set({ wizardOutputDir: dir });
      if (persist) await window.appApi.settings.update({ defaultOutputDir: dir });
    },

    setSelectedVideoFormatId: (id) => set({ selectedVideoFormatId: id, activePreset: null }),
    setAudioFormatId: (id) => set({ selectedAudioFormatId: id, activePreset: null }),

    setPreset: (p) => {
      const { wizardFormats } = get();
      const { videoFormatId, audioFormatId } = applyPreset(p, wizardFormats);
      set({ activePreset: p, selectedVideoFormatId: videoFormatId, selectedAudioFormatId: audioFormatId });
    },

    toggleSubtitleLanguage: (lang) => set((state) => ({
      wizardSubtitleLanguages: state.wizardSubtitleLanguages.includes(lang)
        ? state.wizardSubtitleLanguages.filter((l) => l !== lang)
        : [...state.wizardSubtitleLanguages, lang]
    })),

    setSubtitleMode: (mode) => set({ wizardSubtitleMode: mode }),
    setSubtitleFormat: (format) => set({ wizardSubtitleFormat: format }),

    chooseWizardFolder: async () => {
      const result = await window.appApi.dialog.chooseFolder();
      if (!result.ok || !result.data.path) return;
      set({ wizardOutputDir: result.data.path });
      await window.appApi.settings.update({ defaultOutputDir: result.data.path });
    },

    setWizardSubfolderEnabled: (enabled) => set({ wizardSubfolderEnabled: enabled }),
    setWizardSubfolderName: (name) => set({ wizardSubfolderName: name }),
  };
}
