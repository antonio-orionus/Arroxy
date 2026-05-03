import { DEFAULTS } from '@shared/constants';
import type { AppSettings, FormatOption, Preset, SubtitleMap, SponsorBlockMode, SponsorBlockCategory } from '@shared/types';
import { cleanYoutubeUrl } from '@shared/url';
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

export type VisibleStep = Exclude<WizardStep, 'error'>;
export const STEPS: VisibleStep[] = ['url', 'formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm'];

// Presets that don't download video — SponsorBlock is not applicable.
export const NO_VIDEO_PRESETS = new Set<string>(['audio-only', 'subtitle-only']);

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
  wizardSubtitleSkipped: false,
  wizardSubtitleMode: DEFAULTS.subtitleMode,
  wizardSubtitleFormat: DEFAULTS.subtitleFormat,
  wizardSponsorBlockMode: DEFAULTS.sponsorBlockMode as SponsorBlockMode,
  wizardSponsorBlockCategories: DEFAULTS.sponsorBlockCategories as SponsorBlockCategory[],
  wizardEmbedChapters: DEFAULTS.embedChapters,
  wizardEmbedMetadata: DEFAULTS.embedMetadata,
  wizardEmbedThumbnail: DEFAULTS.embedThumbnail,
  wizardWriteDescription: DEFAULTS.writeDescription,
  wizardWriteThumbnail: DEFAULTS.writeThumbnail,
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
      const url = cleanYoutubeUrl(get().wizardUrl.trim());
      if (!url) return;
      set({ wizardUrl: url, wizardStep: 'formats', formatsLoading: true, wizardError: null });

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
        wizardSubtitleSkipped: false,
        wizardSubtitleMode: settings?.lastSubtitleMode ?? DEFAULTS.subtitleMode,
        wizardSubtitleFormat: settings?.lastSubtitleFormat ?? DEFAULTS.subtitleFormat,
        wizardSponsorBlockMode: settings?.lastSponsorBlockMode ?? DEFAULTS.sponsorBlockMode,
        wizardSponsorBlockCategories: settings?.lastSponsorBlockCategories ?? [...DEFAULTS.sponsorBlockCategories],
        wizardEmbedChapters: settings?.embedChapters ?? DEFAULTS.embedChapters,
        wizardEmbedMetadata: settings?.embedMetadata ?? DEFAULTS.embedMetadata,
        wizardEmbedThumbnail: settings?.embedThumbnail ?? DEFAULTS.embedThumbnail,
        wizardWriteDescription: settings?.writeDescription ?? DEFAULTS.writeDescription,
        wizardWriteThumbnail: settings?.writeThumbnail ?? DEFAULTS.writeThumbnail,
        wizardSubfolderEnabled: settings?.lastSubfolderEnabled ?? false,
        wizardSubfolderName: settings?.lastSubfolder ?? '',
        formatsLoading: false
      });
    },

    advance: () => {
      const { wizardStep, activePreset } = get();
      const i = STEPS.indexOf(wizardStep as VisibleStep);
      if (i < 0 || i >= STEPS.length - 1) return;
      let nextIdx = i + 1;
      // Skip sponsorblock for presets that don't produce a video
      if (STEPS[nextIdx] === 'sponsorblock' && activePreset && NO_VIDEO_PRESETS.has(activePreset)) nextIdx++;
      // Skip output for subtitle-only preset (no media file to embed into)
      if (STEPS[nextIdx] === 'output' && activePreset === 'subtitle-only') nextIdx++;
      set({ wizardStep: STEPS[nextIdx] ?? STEPS[STEPS.length - 1] });
    },

    back: () => {
      const { wizardStep, activePreset } = get();
      const i = STEPS.indexOf(wizardStep as VisibleStep);
      if (i <= 0) return;
      let prevIdx = i - 1;
      // Skip output for subtitle-only preset
      if (STEPS[prevIdx] === 'output' && activePreset === 'subtitle-only') prevIdx--;
      // Skip sponsorblock for presets that don't produce a video
      if (STEPS[prevIdx] === 'sponsorblock' && activePreset && NO_VIDEO_PRESETS.has(activePreset)) prevIdx--;
      const target = STEPS[prevIdx] ?? STEPS[0];
      set({ wizardStep: target, ...(target === 'subtitles' && { wizardSubtitleSkipped: false }) });
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

    skipSubtitles: () => {
      const { wizardStep, activePreset } = get();
      const i = STEPS.indexOf(wizardStep as VisibleStep);
      if (i < STEPS.length - 1) {
        let nextIdx = i + 1;
        // Skip sponsorblock for no-video presets
        if (STEPS[nextIdx] === 'sponsorblock' && activePreset && NO_VIDEO_PRESETS.has(activePreset)) nextIdx++;
        // Skip output for subtitle-only preset
        if (STEPS[nextIdx] === 'output' && activePreset === 'subtitle-only') nextIdx++;
        set({ wizardSubtitleSkipped: true, wizardStep: STEPS[nextIdx] ?? STEPS[STEPS.length - 1] });
      }
    },

    setSponsorBlockMode: (mode) => set({ wizardSponsorBlockMode: mode }),

    toggleSponsorBlockCategory: (cat) => set((state) => ({
      wizardSponsorBlockCategories: state.wizardSponsorBlockCategories.includes(cat)
        ? state.wizardSponsorBlockCategories.filter((c) => c !== cat)
        : [...state.wizardSponsorBlockCategories, cat]
    })),

    setEmbedChapters: (v) => set({ wizardEmbedChapters: v }),
    setEmbedMetadata: (v) => set({ wizardEmbedMetadata: v }),
    setEmbedThumbnail: (v) => set({ wizardEmbedThumbnail: v }),
    setWriteDescription: (v) => set({ wizardWriteDescription: v }),
    setWriteThumbnail: (v) => set({ wizardWriteThumbnail: v }),
  };
}
