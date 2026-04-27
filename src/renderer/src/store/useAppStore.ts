import { create } from 'zustand';
import type {
  AppError,
  AppSettings,
  FormatOption,
  LocalizedError,
  Preset,
  QueueItem,
  StatusSnapshot,
  SubtitleMap,
  SupportedLang
} from '@shared/types';
import { i18next, pickLanguage } from '@shared/i18n';
import { nextMonotonicPercent, ProgressFormatter } from './progress';

export type WizardStep = 'url' | 'formats' | 'subtitles' | 'folder' | 'confirm' | 'error';

const PRESETS: readonly Preset[] = ['best-quality', 'balanced', 'audio-only', 'small-file'];

export function presetLabel(preset: Preset): string {
  return i18next.t(`presets.${preset}.label` as const);
}

export function presetOptions(): { value: Preset; label: string; desc: string }[] {
  return PRESETS.map((value) => ({
    value,
    label: i18next.t(`presets.${value}.label` as const),
    desc: i18next.t(`presets.${value}.desc` as const)
  }));
}

export interface GroupedVideoFormat {
  resolution: string;
  formatId: string;
  label: string;
  isAudioOnly: boolean;
  dynamicRange?: string;
}

function buildFormatId(videoFormatId: string, audioFormatId: string | null): string | undefined {
  if (videoFormatId === '' && audioFormatId === null) return undefined;
  if (videoFormatId === '') return audioFormatId ?? undefined;
  if (audioFormatId === null) return videoFormatId;
  return `${videoFormatId}+${audioFormatId}`;
}

function buildFormatLabel(
  videoFormatId: string,
  videoResolution: string,
  audioFormatId: string | null,
  audioFormats: FormatOption[],
  preset: Preset | null
): string {
  if (preset) {
    return i18next.t(`presets.${preset}.label` as const);
  }
  const audioFmt = audioFormats.find((f) => f.formatId === audioFormatId);
  const audioLabel = audioFormatId === null
    ? i18next.t('wizard.formats.noAudio')
    : (audioFmt?.label ?? i18next.t('formatLabel.audioFallback'));
  if (videoFormatId === '') return i18next.t('formatLabel.audioOnlyDot', { audio: audioLabel });
  return i18next.t('formatLabel.videoDot', { resolution: videoResolution, audio: audioLabel });
}

export function groupVideoFormats(formats: FormatOption[]): GroupedVideoFormat[] {
  const seen = new Set<string>();
  const grouped: GroupedVideoFormat[] = [];

  for (const f of formats) {
    if (f.isAudioOnly) continue;
    const key = `${f.resolution}|${f.dynamicRange ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      grouped.push({ resolution: f.resolution, formatId: f.formatId, label: f.label, isAudioOnly: false, dynamicRange: f.dynamicRange });
    }
  }

  grouped.push({
    resolution: i18next.t('wizard.formats.audioOnly'),
    formatId: '',
    label: i18next.t('wizard.formats.audioOnlyOption'),
    isAudioOnly: true
  });

  return grouped;
}

function applyPreset(preset: Preset, formats: FormatOption[]): { videoFormatId: string; audioFormatId: string | null } {
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;
  const worstAudio = audioFormats[audioFormats.length - 1]?.formatId ?? bestAudio;

  if (preset === 'best-quality') {
    return { videoFormatId: grouped[0]?.formatId ?? '', audioFormatId: bestAudio };
  }
  if (preset === 'balanced') {
    const target = grouped.find((g) => {
      const match = g.resolution.match(/(\d+)/);
      return match ? Number(match[1]) <= 720 : false;
    });
    return { videoFormatId: target?.formatId ?? grouped[grouped.length - 1]?.formatId ?? '', audioFormatId: bestAudio };
  }
  if (preset === 'audio-only') {
    return { videoFormatId: '', audioFormatId: bestAudio };
  }
  // small-file
  return { videoFormatId: grouped[grouped.length - 1]?.formatId ?? '', audioFormatId: worstAudio };
}

function restoreFormatSelection(
  formats: FormatOption[],
  settings: AppSettings | null
): { videoFormatId: string; audioFormatId: string | null; preset: Preset | null } {
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;

  if (settings?.lastPreset) {
    const result = applyPreset(settings.lastPreset, formats);
    return { ...result, preset: settings.lastPreset };
  }

  if (settings?.lastVideoResolution === 'audio-only') {
    return { videoFormatId: '', audioFormatId: bestAudio, preset: null };
  }

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
  const available = new Set([
    ...Object.keys(subtitles ?? {}),
    ...Object.keys(automaticCaptions ?? {})
  ]);
  const languages = (settings?.lastSubtitleLanguages ?? []).filter((l) => available.has(l));
  return { languages };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AppState {
  initialized: boolean;
  initializing: boolean;
  warmupFailures: string[];
  settings: AppSettings | null;

  // Wizard
  wizardStep: WizardStep;
  formatsLoading: boolean;
  wizardUrl: string;
  wizardTitle: string;
  wizardThumbnail: string;
  wizardDuration?: number;
  wizardFormats: FormatOption[];
  selectedVideoFormatId: string;
  selectedAudioFormatId: string | null;
  activePreset: Preset | null;
  wizardOutputDir: string;
  wizardError: AppError | null;
  wizardErrorOrigin: 'formats' | null;
  wizardSubtitles: SubtitleMap;
  wizardAutomaticCaptions: SubtitleMap;
  wizardSubtitleLanguages: string[];

  // Queue
  queue: QueueItem[];

  uiZoom: number;
  uiTheme: 'light' | 'dark' | 'system';
  language: SupportedLang;

  // Drawer
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  showQueueTip: boolean;
  dismissQueueTip: () => void;

  // System
  commonPaths: AppSettings['commonPaths'];

  // Actions
  initialize: () => Promise<void>;
  openLogs: () => Promise<void>;
  setUiZoom: (zoom: number) => void;
  setUiTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: SupportedLang) => void;

  setWizardUrl: (url: string) => void;
  submitUrl: () => Promise<void>;
  goToStep: (step: WizardStep) => void;
  setSelectedVideoFormatId: (id: string) => void;
  setAudioFormatId: (id: string | null) => void;
  setPreset: (p: Preset) => void;
  confirmFormats: () => void;
  toggleSubtitleLanguage: (lang: string) => void;
  confirmSubtitles: () => void;
  chooseWizardFolder: () => Promise<void>;
  confirmFolder: () => void;
  addToQueue: () => Promise<void>;
  addAndDownloadImmediately: () => Promise<void>;
  retryWizard: () => Promise<void>;
  resetWizard: () => void;

  startItemDownload: (itemId: string) => Promise<void>;
  cancelItemDownload: (itemId: string) => Promise<void>;
  pauseItemDownload: (itemId: string) => Promise<void>;
  resumeItemDownload: (itemId: string) => Promise<void>;
  removeQueueItem: (itemId: string) => void;
  retryQueueItem: (itemId: string) => Promise<void>;
  clearCompleted: () => void;
  openItemFolder: (itemId: string) => Promise<void>;
  openItemUrl: (itemId: string) => void;
}

const progressFormatters = new Map<string, ProgressFormatter>();

export const useAppStore = create<AppState>((set, get) => {
  function updateQueueItem(id: string, patch: Partial<QueueItem>): void {
    set((state) => ({
      queue: state.queue.map((item) => (item.id === id ? { ...item, ...patch } : item))
    }));
  }

  function maybeShowQueueTip(): void {
    if (!localStorage.getItem('arroxy_seen_queue_tip')) {
      localStorage.setItem('arroxy_seen_queue_tip', '1');
      set({ drawerOpen: true, showQueueTip: true });
    }
  }

  async function maybeStartNext(): Promise<void> {
    if (get().queue.some((i) => i.status === 'downloading')) return;
    const next = get().queue.find((i) => i.status === 'pending');
    if (next) {
      await get().startItemDownload(next.id);
    }
  }

  function saveQueue(): void {
    void window.appApi.queue.save(get().queue);
  }

  function buildQueueItem(): QueueItem | null {
    const state = get();
    const { wizardUrl, wizardTitle, wizardThumbnail, wizardOutputDir } = state;
    const { selectedVideoFormatId, selectedAudioFormatId, activePreset, wizardFormats } = state;

    const audioFormats = wizardFormats.filter((f) => f.isAudioOnly);
    const grouped = groupVideoFormats(wizardFormats).filter((g) => !g.isAudioOnly);
    const videoResolution =
      selectedVideoFormatId === ''
        ? 'audio-only'
        : grouped.find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? selectedVideoFormatId;

    const formatId = buildFormatId(selectedVideoFormatId, selectedAudioFormatId);
    const formatLabel = buildFormatLabel(selectedVideoFormatId, videoResolution, selectedAudioFormatId, audioFormats, activePreset);

    return {
      id: generateId(),
      url: wizardUrl,
      title: wizardTitle || wizardUrl,
      thumbnail: wizardThumbnail,
      outputDir: wizardOutputDir,
      formatId,
      formatLabel,
      status: 'pending',
      progressPercent: 0,
      progressDetail: null,
      lastStatus: null,
      error: null,
      finishedAt: null,
      downloadJobId: null,
      subtitleLanguages: state.wizardSubtitleLanguages,
      writeAutoSubs: state.wizardSubtitleLanguages.some(
        (l) => !!state.wizardAutomaticCaptions[l] && !state.wizardSubtitles[l]
      )
    };
  }

  async function persistFormatPrefs(): Promise<void> {
    const { selectedVideoFormatId, activePreset, wizardFormats, wizardSubtitleLanguages, settings } = get();
    if (!settings) return;

    const grouped = groupVideoFormats(wizardFormats).filter((g) => !g.isAudioOnly);
    const videoResolution =
      selectedVideoFormatId === ''
        ? 'audio-only'
        : grouped.find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? selectedVideoFormatId;

    const patch = {
      lastVideoResolution: videoResolution,
      lastPreset: activePreset,
      lastSubtitleLanguages: wizardSubtitleLanguages
    };
    const result = await window.appApi.settings.update(patch);
    if (result.ok) {
      set({ settings: result.data });
    }
  }

  return {
    initialized: false,
    initializing: false,
    warmupFailures: [],
    settings: null,
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
    queue: [],
    uiZoom: 1,
    uiTheme: 'system',
    language: pickLanguage(navigator.language),
    drawerOpen: false,
    setDrawerOpen: (open) => set({ drawerOpen: open }),
    showQueueTip: false,
    dismissQueueTip: () => set({ showQueueTip: false }),
    commonPaths: undefined,

    initialize: async () => {
      if (get().initialized || get().initializing) return;
      set({ initializing: true });

      window.appApi.events.onStatus((event) => {
        const item = get().queue.find((i) => i.downloadJobId === event.jobId);
        if (!item) return;

        if (event.stage === 'done') {
          progressFormatters.delete(event.jobId);
          updateQueueItem(item.id, {
            status: 'done',
            progressPercent: 100,
            finishedAt: new Date().toISOString(),
            downloadJobId: null,
            lastStatus: { key: event.statusKey, params: event.params }
          });
          saveQueue();
          void maybeStartNext();
        } else if (event.stage === 'error') {
          progressFormatters.delete(event.jobId);
          updateQueueItem(item.id, {
            status: 'error',
            error: event.error ?? { key: null },
            lastStatus: { key: event.statusKey, params: event.params },
            downloadJobId: null
          });
          saveQueue();
          void maybeStartNext();
        } else {
          // Phase transitions (merge, fetch subs, sleep) supersede stale download-speed
          // progress detail — clear it so the phase status text becomes visible.
          const isPhaseTransition =
            event.statusKey === 'mergingFormats' ||
            event.statusKey === 'fetchingSubtitles' ||
            event.statusKey === 'sleepingBetweenRequests';
          updateQueueItem(item.id, {
            lastStatus: { key: event.statusKey, params: event.params },
            ...(isPhaseTransition ? { progressDetail: null } : {})
          });
        }
      });

      window.appApi.events.onProgress((event) => {
        const item = get().queue.find((i) => i.downloadJobId === event.jobId);
        if (!item) return;

        let formatter = progressFormatters.get(event.jobId);
        if (!formatter) {
          formatter = new ProgressFormatter();
          progressFormatters.set(event.jobId, formatter);
        }
        const detail = formatter.update(event.line);
        updateQueueItem(item.id, {
          progressPercent: nextMonotonicPercent(item.progressPercent, event.percent),
          ...(detail !== null ? { progressDetail: detail } : {})
        });
      });

      const settingsPromise = window.appApi.settings.get();
      const warmUpPromise = window.appApi.app.warmUp();
      const queuePromise = window.appApi.queue.load();

      const [settingsResult, warmUpResult, savedQueue] = await Promise.all([
        settingsPromise,
        warmUpPromise,
        queuePromise
      ]);

      if (settingsResult.ok) {
        const zoom = settingsResult.data.uiZoom ?? 1;
        const theme = settingsResult.data.uiTheme ?? 'system';
        const persistedLang = settingsResult.data.language;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        const nextLanguage = persistedLang ?? get().language;
        if (nextLanguage !== i18next.language) {
          void i18next.changeLanguage(nextLanguage);
        }
        void window.appApi.app.setLanguage(nextLanguage);
        set({
          settings: settingsResult.data,
          wizardOutputDir: settingsResult.data.defaultOutputDir,
          commonPaths: settingsResult.data.commonPaths,
          uiZoom: zoom,
          uiTheme: theme,
          language: nextLanguage
        });
      }

      const warmupFailures = warmUpResult.ok ? warmUpResult.data.failures : [];

      if (savedQueue.length > 0) {
        type StoredItem = typeof savedQueue[number] & { subtitleLanguages?: string[]; writeAutoSubs?: boolean };
        const migratedQueue: QueueItem[] = (savedQueue as StoredItem[]).map((item) => ({
          ...item,
          subtitleLanguages: item.subtitleLanguages ?? [],
          writeAutoSubs: item.writeAutoSubs ?? false
        }));
        set({ queue: migratedQueue, drawerOpen: true });
        await maybeStartNext();
      }

      set({ initialized: true, initializing: false, warmupFailures });
    },

    openLogs: async () => {
      await window.appApi.logs.openDir();
    },

    setUiZoom: (zoom) => {
      const clamped = Math.round(Math.min(1.5, Math.max(0.7, zoom)) * 20) / 20;
      set({ uiZoom: clamped });
      void window.appApi.settings.update({ uiZoom: clamped });
    },

    setUiTheme: (theme) => {
      set({ uiTheme: theme });
      void window.appApi.settings.update({ uiTheme: theme });
    },

    setLanguage: (lang) => {
      set({ language: lang });
      void i18next.changeLanguage(lang);
      void window.appApi.settings.update({ language: lang });
      void window.appApi.app.setLanguage(lang);
    },

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
      const { videoFormatId, audioFormatId, preset } = restoreFormatSelection(formats, get().settings);
      const { languages: subtitleLanguages } = restoreSubtitleSelection(subtitles, automaticCaptions, get().settings);

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
        formatsLoading: false
      });
    },

    goToStep: (step) => set({ wizardStep: step }),

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

    confirmSubtitles: () => set({ wizardStep: 'folder' }),

    chooseWizardFolder: async () => {
      const result = await window.appApi.dialog.chooseFolder();
      if (!result.ok || !result.data.path) return;
      set({ wizardOutputDir: result.data.path });
      await window.appApi.settings.update({ defaultOutputDir: result.data.path });
    },

    confirmFolder: () => set({ wizardStep: 'confirm' }),

    addToQueue: async () => {
      const item = buildQueueItem();
      if (!item) return;
      set((state) => ({ queue: [...state.queue, item] }));
      maybeShowQueueTip();
      saveQueue();
      await persistFormatPrefs();
      get().resetWizard();
      await maybeStartNext();
    },

    addAndDownloadImmediately: async () => {
      const item = buildQueueItem();
      if (!item) return;
      set((state) => ({ queue: [...state.queue, item] }));
      maybeShowQueueTip();
      saveQueue();
      await persistFormatPrefs();
      get().resetWizard();
      await get().startItemDownload(item.id);
    },

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
        wizardSubtitleLanguages: []
      });
    },

    startItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item) return;

      updateQueueItem(itemId, { status: 'downloading', progressPercent: 0, progressDetail: null, lastStatus: null, error: null });

      const result = await window.appApi.downloads.start({
        url: item.url,
        outputDir: item.outputDir,
        formatId: item.formatId,
        subtitleLanguages: item.subtitleLanguages.length ? item.subtitleLanguages : undefined,
        writeAutoSubs: item.subtitleLanguages.length ? item.writeAutoSubs : undefined
      });

      if (!result.ok) {
        const errorPayload: LocalizedError = { key: null, rawMessage: result.error.message };
        updateQueueItem(itemId, { status: 'error', error: errorPayload });
        return;
      }

      updateQueueItem(itemId, { downloadJobId: result.data.job.id });
    },

    cancelItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item || (item.status !== 'downloading' && item.status !== 'paused')) return;

      console.log('[cancel] status:', item.status, '| downloadJobId:', item.downloadJobId);
      await window.appApi.downloads.cancel({ jobId: item.downloadJobId ?? undefined });
      updateQueueItem(itemId, { status: 'cancelled', downloadJobId: null });
      saveQueue();
      void maybeStartNext();
    },

    pauseItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item || item.status !== 'downloading') return;

      const result = await window.appApi.downloads.pause({ jobId: item.downloadJobId ?? undefined });
      if (result.ok && result.data.paused) {
        updateQueueItem(itemId, { status: 'paused', progressDetail: null });
        saveQueue();
      }
    },

    resumeItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item || item.status !== 'paused') return;

      updateQueueItem(itemId, { status: 'downloading', error: null });
      saveQueue();

      const result = await window.appApi.downloads.start({
        url: item.url,
        outputDir: item.outputDir,
        formatId: item.formatId,
        subtitleLanguages: item.subtitleLanguages.length ? item.subtitleLanguages : undefined,
        writeAutoSubs: item.subtitleLanguages.length ? item.writeAutoSubs : undefined
      });

      if (!result.ok) {
        const errorPayload: LocalizedError = { key: null, rawMessage: result.error.message };
        updateQueueItem(itemId, { status: 'error', error: errorPayload });
        saveQueue();
        return;
      }

      updateQueueItem(itemId, { downloadJobId: result.data.job.id });
      saveQueue();
    },

    removeQueueItem: (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (item?.status === 'downloading' || item?.status === 'paused') return;
      set((state) => ({ queue: state.queue.filter((i) => i.id !== itemId) }));
      saveQueue();
    },

    retryQueueItem: async (itemId) => {
      updateQueueItem(itemId, {
        status: 'pending',
        progressPercent: 0,
        progressDetail: null,
        lastStatus: null,
        error: null,
        finishedAt: null,
        downloadJobId: null
      });
      saveQueue();
      await maybeStartNext();
    },

    clearCompleted: () => {
      set((state) => ({
        queue: state.queue.filter((i) => i.status !== 'done' && i.status !== 'cancelled')
      }));
      saveQueue();
    },

    openItemFolder: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item) return;
      await window.appApi.shell.openFolder(item.outputDir);
    },

    openItemUrl: (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item) return;
      void window.appApi.shell.openExternal(item.url);
    }
  };
});

export function formatStatus(snapshot: StatusSnapshot | null): string {
  if (!snapshot) return '';
  const key = `status.${snapshot.key}`;
  // i18next typed resources don't compose with computed keys + interpolation params; cast through unknown.
  return (i18next.t as (k: string, opts?: Record<string, unknown>) => string)(key, snapshot.params);
}

export function formatLocalizedError(error: LocalizedError | null): string {
  if (!error) return '';
  if (error.key) return i18next.t(`errors.ytdlp.${error.key}` as const);
  return error.rawMessage ?? '';
}

export function formatError(error: AppError | null): string {
  if (!error) return '';
  return error.message;
}
