import { DEFAULTS } from '@shared/constants';
import { DEFAULT_AUDIO_BITRATE } from '@shared/schemas';
import type { AppSettings, FormatOption, Preset, SubtitleMap, WizardTransition } from '@shared/types';
import { cleanYoutubeUrl } from '@shared/url';
import type { AppState, AudioSelection, GetState, SetState, WizardSlice, WizardStep } from './types';
import { presetProducesMedia, presetProducesVideo } from '@shared/presetTraits';

function pickWizardSnapshot(state: AppState): Record<string, unknown> {
  return {
    url: state.wizardUrl,
    title: state.wizardTitle,
    duration: state.wizardDuration,
    formatsCount: state.wizardFormats.length,
    selectedVideoFormatId: state.selectedVideoFormatId,
    audioSelection: state.audioSelection,
    activePreset: state.activePreset,
    subtitleLanguages: state.wizardSubtitleLanguages,
    subtitleMode: state.wizardSubtitleMode,
    subtitleFormat: state.wizardSubtitleFormat,
    subtitleSkipped: state.wizardSubtitleSkipped,
    sponsorBlockMode: state.wizardSponsorBlockMode,
    sponsorBlockCategories: state.wizardSponsorBlockCategories,
    embedChapters: state.wizardEmbedChapters,
    embedMetadata: state.wizardEmbedMetadata,
    embedThumbnail: state.wizardEmbedThumbnail,
    writeDescription: state.wizardWriteDescription,
    writeThumbnail: state.wizardWriteThumbnail,
    outputDir: state.wizardOutputDir,
    subfolderEnabled: state.wizardSubfolderEnabled,
    subfolderName: state.wizardSubfolderName
  };
}

function logStep(transition: WizardTransition, fromStep: WizardStep, toStep: WizardStep, snapshot: Record<string, unknown>): void {
  window.appApi.diagnostics.logWizardStep({ transition, fromStep, toStep, snapshot });
}

// Private helpers — only used inside this slice.

function groupedNonAudioFormats(formats: FormatOption[]): { resolution: string; formatId: string }[] {
  const seen = new Set<string>();
  const out: { resolution: string; formatId: string }[] = [];
  for (const f of formats) {
    if (f.isAudioOnly) continue;
    const key = `${f.resolution}|${f.dynamicRange ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ resolution: f.resolution, formatId: f.formatId });
    }
  }
  return out;
}

function nativeAudio(formatId: string | null): AudioSelection {
  return formatId === null ? { kind: 'none' } : { kind: 'native', formatId };
}

export function applyPreset(preset: Preset, formats: FormatOption[]): { videoFormatId: string; audioSelection: AudioSelection } {
  const grouped = groupedNonAudioFormats(formats);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;
  const worstAudio = audioFormats[audioFormats.length - 1]?.formatId ?? bestAudio;

  if (preset === 'best-quality') return { videoFormatId: grouped[0]?.formatId ?? '', audioSelection: nativeAudio(bestAudio) };
  if (preset === 'audio-only') return { videoFormatId: '', audioSelection: nativeAudio(bestAudio) };
  if (preset === 'subtitle-only') return { videoFormatId: '', audioSelection: { kind: 'none' } };
  if (preset === 'balanced') {
    const target = grouped.find((g) => {
      const m = /(\d+)/.exec(g.resolution);
      return m ? Number(m[1]) <= 720 : false;
    });
    return {
      videoFormatId: target?.formatId ?? grouped[grouped.length - 1]?.formatId ?? '',
      audioSelection: nativeAudio(bestAudio)
    };
  }
  // small-file
  return { videoFormatId: grouped[grouped.length - 1]?.formatId ?? '', audioSelection: nativeAudio(worstAudio) };
}

function restoreFormatSelection(formats: FormatOption[], settings: AppSettings | null): { videoFormatId: string; audioSelection: AudioSelection; preset: Preset | null } {
  const grouped = groupedNonAudioFormats(formats);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;

  if (settings?.lastPreset) return { ...applyPreset(settings.lastPreset, formats), preset: settings.lastPreset };
  if (settings?.lastVideoResolution === 'audio-only') return { videoFormatId: '', audioSelection: nativeAudio(bestAudio), preset: 'audio-only' };
  if (settings?.lastVideoResolution) {
    const match = grouped.find((g) => g.resolution === settings.lastVideoResolution);
    if (match) return { videoFormatId: match.formatId, audioSelection: nativeAudio(bestAudio), preset: null };
  }
  return { ...applyPreset('best-quality', formats), preset: 'best-quality' };
}

function restoreSubtitleSelection(subtitles: SubtitleMap | undefined, automaticCaptions: SubtitleMap | undefined, settings: AppSettings | null): { languages: string[] } {
  const available = new Set([...Object.keys(subtitles ?? {}), ...Object.keys(automaticCaptions ?? {})]);
  const languages = (settings?.lastSubtitleLanguages ?? []).filter((l) => available.has(l));
  return { languages };
}

export type VisibleStep = Exclude<WizardStep, 'error'>;
export const STEPS: VisibleStep[] = ['url', 'formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm'];

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
  wizardSponsorBlockMode: DEFAULTS.sponsorBlockMode,
  wizardSponsorBlockCategories: DEFAULTS.sponsorBlockCategories,
  wizardEmbedChapters: DEFAULTS.embedChapters,
  wizardEmbedMetadata: DEFAULTS.embedMetadata,
  wizardEmbedThumbnail: DEFAULTS.embedThumbnail,
  wizardWriteDescription: DEFAULTS.writeDescription,
  wizardWriteThumbnail: DEFAULTS.writeThumbnail,
  wizardSubfolderEnabled: false,
  wizardSubfolderName: ''
} as const;

export function createWizardSlice(set: SetState, get: GetState): WizardSlice {
  return {
    ...RESET_STATE,
    selectedVideoFormatId: '',
    audioSelection: { kind: 'none' },
    lastConvertBitrate: DEFAULT_AUDIO_BITRATE,
    activePreset: null,
    wizardOutputDir: '',

    setWizardUrl: (url) => set({ wizardUrl: url }),

    submitUrl: async () => {
      const url = cleanYoutubeUrl(get().wizardUrl.trim());
      if (!url) return;
      const fromStep = get().wizardStep;
      set({ wizardUrl: url, wizardStep: 'formats', formatsLoading: true, wizardError: null });
      logStep('submitUrl', fromStep, 'formats', pickWizardSnapshot(get()));

      const result = await window.appApi.downloads.getFormats({ url });
      if (!result.ok) {
        set({
          wizardStep: 'error',
          formatsLoading: false,
          wizardError: result.error,
          wizardErrorOrigin: 'formats'
        });
        return;
      }

      const { formats, title, thumbnail, duration, subtitles = {}, automaticCaptions = {} } = result.data;
      const settings = get().settings;
      const { videoFormatId, audioSelection, preset } = restoreFormatSelection(formats, settings);
      const { languages: subtitleLanguages } = restoreSubtitleSelection(subtitles, automaticCaptions, settings);

      set({
        wizardFormats: formats,
        wizardTitle: title,
        wizardThumbnail: thumbnail,
        wizardDuration: duration,
        selectedVideoFormatId: videoFormatId,
        audioSelection,
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
      if (STEPS[nextIdx] === 'sponsorblock' && activePreset && !presetProducesVideo(activePreset)) nextIdx++;
      if (STEPS[nextIdx] === 'output' && activePreset && !presetProducesMedia(activePreset)) nextIdx++;
      const target = STEPS[nextIdx] ?? STEPS[STEPS.length - 1];
      set({ wizardStep: target });
      logStep('advance', wizardStep, target, pickWizardSnapshot(get()));
    },

    back: () => {
      const { wizardStep, activePreset } = get();
      const i = STEPS.indexOf(wizardStep as VisibleStep);
      if (i <= 0) return;
      let prevIdx = i - 1;
      if (STEPS[prevIdx] === 'output' && activePreset && !presetProducesMedia(activePreset)) prevIdx--;
      if (STEPS[prevIdx] === 'sponsorblock' && activePreset && !presetProducesVideo(activePreset)) prevIdx--;
      const target = STEPS[prevIdx] ?? STEPS[0];
      set({ wizardStep: target, ...(target === 'subtitles' && { wizardSubtitleSkipped: false }) });
      logStep('back', wizardStep, target, pickWizardSnapshot(get()));
    },

    reset: () => {
      const fromStep = get().wizardStep;
      set(RESET_STATE);
      logStep('reset', fromStep, 'url', pickWizardSnapshot(get()));
    },

    retry: async () => {
      const { wizardErrorOrigin, wizardStep } = get();
      if (wizardErrorOrigin === 'formats') {
        set({ wizardStep: 'formats', formatsLoading: true, wizardError: null });
        logStep('retry', wizardStep, 'formats', pickWizardSnapshot(get()));
        await get().submitUrl();
      }
    },

    setWizardOutputDir: async (dir, persist = true) => {
      set({ wizardOutputDir: dir });
      if (persist) await window.appApi.settings.update({ defaultOutputDir: dir });
    },

    // Invariant: (video !== '') && (audio.kind === 'convert-lossy' | 'convert-lossless') is invalid —
    // convert (-x) is mutually exclusive with video+audio merging.
    // Reconcile here instead of relying on the UI to prevent it.
    setSelectedVideoFormatId: (id) =>
      set((state) => {
        const reconcileAudio = id !== '' && (state.audioSelection.kind === 'convert-lossy' || state.audioSelection.kind === 'convert-lossless');
        if (!reconcileAudio) {
          return { selectedVideoFormatId: id, activePreset: id === '' ? 'audio-only' : null };
        }
        const bestAudio = state.wizardFormats.find((f) => f.isAudioOnly)?.formatId ?? null;
        return {
          selectedVideoFormatId: id,
          activePreset: null,
          audioSelection: nativeAudio(bestAudio)
        };
      }),
    setAudioSelection: (sel) =>
      set((state) => {
        // Symmetric guard: picking a convert target while a video is selected
        // clears the video to audio-only — the user's intent is "I want this
        // audio-converted file", and convert can't be merged with video.
        const clearVideo = (sel.kind === 'convert-lossy' || sel.kind === 'convert-lossless') && state.selectedVideoFormatId !== '';
        return {
          audioSelection: sel,
          selectedVideoFormatId: clearVideo ? '' : state.selectedVideoFormatId,
          activePreset: clearVideo || state.selectedVideoFormatId === '' ? 'audio-only' : null,
          // Keep the user's bitrate choice sticky across mp3/m4a/opus toggles.
          lastConvertBitrate: sel.kind === 'convert-lossy' ? sel.bitrateKbps : state.lastConvertBitrate
        };
      }),

    setPreset: (p) => {
      const { wizardFormats } = get();
      const { videoFormatId, audioSelection } = applyPreset(p, wizardFormats);
      set({
        activePreset: p,
        selectedVideoFormatId: videoFormatId,
        audioSelection
      });
    },

    toggleSubtitleLanguage: (lang) =>
      set((state) => ({
        wizardSubtitleLanguages: state.wizardSubtitleLanguages.includes(lang) ? state.wizardSubtitleLanguages.filter((l) => l !== lang) : [...state.wizardSubtitleLanguages, lang]
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
        if (STEPS[nextIdx] === 'sponsorblock' && activePreset && !presetProducesVideo(activePreset)) nextIdx++;
        if (STEPS[nextIdx] === 'output' && activePreset && !presetProducesMedia(activePreset)) nextIdx++;
        const target = STEPS[nextIdx] ?? STEPS[STEPS.length - 1];
        set({ wizardSubtitleSkipped: true, wizardStep: target });
        logStep('skipSubtitles', wizardStep, target, pickWizardSnapshot(get()));
      }
    },

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
