import { create } from 'zustand';
import type {
  AppError,
  AppSettings,
  AudioQuality,
  FormatOption,
  Preset,
  QueueItem
} from '@shared/types';
import { nextMonotonicPercent, ProgressSmoother } from './progress';

export type WizardStep = 'url' | 'formats' | 'folder' | 'confirm' | 'error';

export interface GroupedVideoFormat {
  resolution: string;
  formatId: string;
  label: string;
  isAudioOnly: boolean;
}

function buildFormatId(videoFormatId: string, audioQuality: AudioQuality): string | undefined {
  if (videoFormatId === '' && audioQuality === 'none') return undefined;
  if (videoFormatId === '') {
    return audioQualitySelector(audioQuality);
  }
  if (audioQuality === 'none') return videoFormatId;
  return `${videoFormatId}+${audioQualitySelector(audioQuality)}`;
}

function audioQualitySelector(q: AudioQuality): string {
  if (q === 'best') return 'bestaudio';
  if (q === 'good') return 'bestaudio[abr<=128]';
  if (q === 'low') return 'worstaudio';
  return 'bestaudio';
}

function buildFormatLabel(
  videoFormatId: string,
  videoResolution: string,
  audioQuality: AudioQuality,
  preset: Preset | null
): string {
  if (preset) {
    const labels: Record<Preset, string> = {
      'best-quality': 'Best quality',
      balanced: 'Balanced',
      'audio-only': 'Audio only',
      'small-file': 'Small file'
    };
    return labels[preset];
  }
  if (videoFormatId === '') {
    const audioLabels: Record<AudioQuality, string> = {
      best: 'Best',
      good: 'Good',
      low: 'Low',
      none: 'None'
    };
    return `Audio only · ${audioLabels[audioQuality]}`;
  }
  const audioLabels: Record<AudioQuality, string> = {
    best: 'Best audio',
    good: 'Good audio',
    low: 'Low audio',
    none: 'No audio'
  };
  return `${videoResolution} · ${audioLabels[audioQuality]}`;
}

export function groupVideoFormats(formats: FormatOption[]): GroupedVideoFormat[] {
  const seen = new Set<string>();
  const grouped: GroupedVideoFormat[] = [];

  for (const f of formats) {
    if (!seen.has(f.resolution)) {
      seen.add(f.resolution);
      grouped.push({ resolution: f.resolution, formatId: f.formatId, label: f.label, isAudioOnly: false });
    }
  }

  grouped.push({ resolution: 'Audio only', formatId: '', label: 'Audio only (no video)', isAudioOnly: true });

  return grouped;
}

function applyPreset(preset: Preset, formats: FormatOption[]): { videoFormatId: string; audioQuality: AudioQuality } {
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);

  if (preset === 'best-quality') {
    return { videoFormatId: grouped[0]?.formatId ?? '', audioQuality: 'best' };
  }
  if (preset === 'balanced') {
    const target = grouped.find((g) => {
      const match = g.resolution.match(/(\d+)/);
      return match ? Number(match[1]) <= 720 : false;
    });
    return { videoFormatId: target?.formatId ?? grouped[grouped.length - 1]?.formatId ?? '', audioQuality: 'good' };
  }
  if (preset === 'audio-only') {
    return { videoFormatId: '', audioQuality: 'best' };
  }
  // small-file
  return { videoFormatId: grouped[grouped.length - 1]?.formatId ?? '', audioQuality: 'low' };
}

function restoreFormatSelection(
  formats: FormatOption[],
  settings: AppSettings | null
): { videoFormatId: string; audioQuality: AudioQuality; preset: Preset | null } {
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);

  if (settings?.lastPreset) {
    const result = applyPreset(settings.lastPreset, formats);
    return { ...result, preset: settings.lastPreset };
  }

  const audioQuality: AudioQuality = settings?.lastAudioQuality ?? 'best';

  if (settings?.lastVideoResolution === 'audio-only') {
    return { videoFormatId: '', audioQuality, preset: null };
  }

  if (settings?.lastVideoResolution) {
    const match = grouped.find((g) => g.resolution === settings.lastVideoResolution);
    if (match) return { videoFormatId: match.formatId, audioQuality, preset: null };
  }

  return { ...applyPreset('best-quality', formats), preset: 'best-quality' };
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
  selectedAudioQuality: AudioQuality;
  activePreset: Preset | null;
  wizardOutputDir: string;
  wizardError: AppError | null;
  wizardErrorOrigin: 'formats' | null;

  // Queue
  queue: QueueItem[];

  uiZoom: number;
  uiTheme: 'light' | 'dark' | 'system';

  // Drawer
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  showQueueTip: boolean;
  dismissQueueTip: () => void;

  // System
  commonPaths: AppSettings['commonPaths'];
  _unbindStatus: (() => void) | null;
  _unbindProgress: (() => void) | null;

  // Actions
  initialize: () => Promise<void>;
  openLogs: () => Promise<void>;
  setUiZoom: (zoom: number) => void;
  setUiTheme: (theme: 'light' | 'dark' | 'system') => void;

  setWizardUrl: (url: string) => void;
  submitUrl: () => Promise<void>;
  setSelectedVideoFormatId: (id: string) => void;
  setAudioQuality: (q: AudioQuality) => void;
  setPreset: (p: Preset) => void;
  confirmFormats: () => void;
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

const progressSmoothers = new Map<string, ProgressSmoother>();

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
    const { selectedVideoFormatId, selectedAudioQuality, activePreset, wizardFormats } = state;

    const grouped = groupVideoFormats(wizardFormats).filter((g) => !g.isAudioOnly);
    const videoResolution =
      selectedVideoFormatId === ''
        ? 'audio-only'
        : grouped.find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? selectedVideoFormatId;

    const formatId = buildFormatId(selectedVideoFormatId, selectedAudioQuality);
    const formatLabel = buildFormatLabel(selectedVideoFormatId, videoResolution, selectedAudioQuality, activePreset);

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
      errorMessage: null,
      finishedAt: null,
      downloadJobId: null
    };
  }

  async function persistFormatPrefs(): Promise<void> {
    const { selectedVideoFormatId, selectedAudioQuality, activePreset, wizardFormats, settings } = get();
    if (!settings) return;

    const grouped = groupVideoFormats(wizardFormats).filter((g) => !g.isAudioOnly);
    const videoResolution =
      selectedVideoFormatId === ''
        ? 'audio-only'
        : grouped.find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? selectedVideoFormatId;

    const patch = {
      lastVideoResolution: videoResolution,
      lastAudioQuality: selectedAudioQuality,
      lastPreset: activePreset
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
    selectedAudioQuality: 'best',
    activePreset: null,
    wizardOutputDir: '',
    wizardError: null,
    wizardErrorOrigin: null,
    queue: [],
    uiZoom: 1,
    uiTheme: 'system',
    drawerOpen: false,
    setDrawerOpen: (open) => set({ drawerOpen: open }),
    showQueueTip: false,
    dismissQueueTip: () => set({ showQueueTip: false }),
    commonPaths: undefined,
    _unbindStatus: null,
    _unbindProgress: null,

    initialize: async () => {
      if (get().initialized || get().initializing) return;
      set({ initializing: true });

      if (!get()._unbindStatus) {
        set({
          _unbindStatus: window.appApi.events.onStatus((event) => {
            const item = get().queue.find((i) => i.downloadJobId === event.jobId);
            if (!item) return;

            if (event.stage === 'done') {
              progressSmoothers.delete(event.jobId);
              updateQueueItem(item.id, {
                status: 'done',
                progressPercent: 100,
                finishedAt: new Date().toISOString(),
                downloadJobId: null
              });
              saveQueue();
              void maybeStartNext();
            } else if (event.stage === 'error') {
              progressSmoothers.delete(event.jobId);
              updateQueueItem(item.id, {
                status: 'error',
                errorMessage: event.message,
                downloadJobId: null
              });
              saveQueue();
              void maybeStartNext();
            }
          })
        });
      }

      if (!get()._unbindProgress) {
        set({
          _unbindProgress: window.appApi.events.onProgress((event) => {
            const item = get().queue.find((i) => i.downloadJobId === event.jobId);
            if (!item) return;

            let smoother = progressSmoothers.get(event.jobId);
            if (!smoother) {
              smoother = new ProgressSmoother();
              progressSmoothers.set(event.jobId, smoother);
            }
            const detail = smoother.update(event.line);
            updateQueueItem(item.id, {
              progressPercent: nextMonotonicPercent(item.progressPercent, event.percent),
              ...(detail !== null ? { progressDetail: detail } : {})
            });
          })
        });
      }

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
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        set({
          settings: settingsResult.data,
          wizardOutputDir: settingsResult.data.defaultOutputDir,
          commonPaths: settingsResult.data.commonPaths,
          uiZoom: zoom,
          uiTheme: theme
        });
      }

      const warmupFailures = warmUpResult.ok ? warmUpResult.data.failures : [];

      if (savedQueue.length > 0) {
        set({ queue: savedQueue, drawerOpen: true });
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

      const { formats, title, thumbnail, duration } = result.data;
      const { videoFormatId, audioQuality, preset } = restoreFormatSelection(formats, get().settings);

      set({
        wizardFormats: formats,
        wizardTitle: title,
        wizardThumbnail: thumbnail,
        wizardDuration: duration,
        selectedVideoFormatId: videoFormatId,
        selectedAudioQuality: audioQuality,
        activePreset: preset,
        formatsLoading: false
      });
    },

    setSelectedVideoFormatId: (id) => set({ selectedVideoFormatId: id, activePreset: null }),

    setAudioQuality: (q) => set({ selectedAudioQuality: q, activePreset: null }),

    setPreset: (p) => {
      const { wizardFormats } = get();
      const { videoFormatId, audioQuality } = applyPreset(p, wizardFormats);
      set({ activePreset: p, selectedVideoFormatId: videoFormatId, selectedAudioQuality: audioQuality });
    },

    confirmFormats: () => set({ wizardStep: 'folder' }),

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
        wizardErrorOrigin: null
      });
    },

    startItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item) return;

      updateQueueItem(itemId, { status: 'downloading', progressPercent: 0, progressDetail: null, errorMessage: null });

      const result = await window.appApi.downloads.start({
        url: item.url,
        outputDir: item.outputDir,
        formatId: item.formatId
      });

      if (!result.ok) {
        updateQueueItem(itemId, { status: 'error', errorMessage: result.error.message });
        return;
      }

      updateQueueItem(itemId, { downloadJobId: result.data.job.id });
    },

    cancelItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item || (item.status !== 'downloading' && item.status !== 'paused')) return;

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

      updateQueueItem(itemId, { status: 'downloading', errorMessage: null });

      const result = await window.appApi.downloads.start({
        url: item.url,
        outputDir: item.outputDir,
        formatId: item.formatId
      });

      if (!result.ok) {
        updateQueueItem(itemId, { status: 'error', errorMessage: result.error.message });
        return;
      }

      updateQueueItem(itemId, { downloadJobId: result.data.job.id });
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
        errorMessage: null,
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

export function formatError(error: AppError | null): string {
  if (!error) return '';
  return error.message;
}
