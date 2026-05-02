import type { QueueItem, SubtitleFormat, SubtitleMode } from '@shared/types';
import { QUEUE_STATUS, STATUS_KEY } from '@shared/schemas';
import { DEFAULTS } from '@shared/constants';
import { i18next, pickLanguage } from '@shared/i18n';
import { nextMonotonicPercent, ProgressFormatter } from './progress';
import { progressFormatters, maybeStartNext, saveQueue, updateQueueItem } from './queueSlice';
import type { GetState, SetState, SystemSlice } from './types';

let unbindStatus: (() => void) | null = null;
let unbindProgress: (() => void) | null = null;

export function createSystemSlice(set: SetState, get: GetState): SystemSlice {
  return {
    initialized: false,
    initializing: false,
    warmupFailures: [],
    settings: null,
    language: pickLanguage(navigator.language),
    commonPaths: undefined,

    initialize: async () => {
      if (get().initialized || get().initializing) return;
      set({ initializing: true });

      // Detach any prior bindings (defense for a future re-init flow).
      unbindStatus?.();
      unbindProgress?.();

      unbindStatus = window.appApi.events.onStatus((event) => {
        const item = get().queue.find((i) => i.downloadJobId === event.jobId);
        if (!item) return;

        if (event.stage === 'done') {
          progressFormatters.delete(event.jobId);
          updateQueueItem(set, item.id, {
            status: QUEUE_STATUS.done,
            progressPercent: 100,
            finishedAt: new Date().toISOString(),
            downloadJobId: null,
            lastStatus: { key: event.statusKey, params: event.params }
          });
          saveQueue(get);
          void maybeStartNext(get);
        } else if (event.stage === 'error') {
          progressFormatters.delete(event.jobId);
          updateQueueItem(set, item.id, {
            status: QUEUE_STATUS.error,
            error: event.error ?? { key: null },
            lastStatus: { key: event.statusKey, params: event.params },
            downloadJobId: null
          });
          saveQueue(get);
          void maybeStartNext(get);
        } else {
          // Phase transitions (merge, fetch subs, sleep) supersede stale download-speed
          // progress detail — clear it so the phase status text becomes visible.
          const isPhaseTransition =
            event.statusKey === STATUS_KEY.mergingFormats ||
            event.statusKey === STATUS_KEY.fetchingSubtitles ||
            event.statusKey === STATUS_KEY.sleepingBetweenRequests;
          // yt-dlp emits per-file percent (0→100% for each sub, then video, then audio).
          // Reset the bar when a new file becomes the active download target so the
          // first sub's instant 100% doesn't peg it for the rest of the job.
          const isFileBoundary =
            event.statusKey === STATUS_KEY.downloadingMedia ||
            event.statusKey === STATUS_KEY.fetchingSubtitles;
          updateQueueItem(set, item.id, {
            lastStatus: { key: event.statusKey, params: event.params },
            ...(isPhaseTransition ? { progressDetail: null } : {}),
            ...(isFileBoundary ? { progressPercent: 0 } : {})
          });
        }
      });

      unbindProgress = window.appApi.events.onProgress((event) => {
        const item = get().queue.find((i) => i.downloadJobId === event.jobId);
        if (!item) return;

        let formatter = progressFormatters.get(event.jobId);
        if (!formatter) {
          formatter = new ProgressFormatter();
          progressFormatters.set(event.jobId, formatter);
        }
        const detail = formatter.update(event.line);
        updateQueueItem(set, item.id, {
          progressPercent: nextMonotonicPercent(item.progressPercent, event.percent),
          ...(detail !== null ? { progressDetail: detail } : {})
        });
      });

      const settingsPromise = window.appApi.settings.get();
      const warmUpPromise = window.appApi.app.warmUp();
      const queuePromise = window.appApi.queue.load();

      const [settingsResult, warmUpResult, queueResult] = await Promise.all([
        settingsPromise,
        warmUpPromise,
        queuePromise
      ]);

      const savedQueue = queueResult.ok ? queueResult.data : [];
      if (!queueResult.ok) {
        console.error('[queue] load failed — starting with empty queue', queueResult.error);
      }

      if (settingsResult.ok) {
        const zoom = settingsResult.data.uiZoom ?? DEFAULTS.uiZoom;
        const theme = settingsResult.data.uiTheme ?? DEFAULTS.uiTheme;
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
        type StoredItem = typeof savedQueue[number] & {
          subtitleLanguages?: string[];
          writeAutoSubs?: boolean;
          subtitleMode?: SubtitleMode;
          subtitleFormat?: SubtitleFormat;
        };
        const migratedQueue: QueueItem[] = (savedQueue as StoredItem[]).map((item) => ({
          ...item,
          subtitleLanguages: item.subtitleLanguages ?? [],
          writeAutoSubs: item.writeAutoSubs ?? false,
          subtitleMode: item.subtitleMode ?? DEFAULTS.subtitleMode,
          subtitleFormat: item.subtitleFormat ?? DEFAULTS.subtitleFormat
        }));
        set({ queue: migratedQueue, drawerOpen: true });
        await maybeStartNext(get);
      }

      set({ initialized: true, initializing: false, warmupFailures });
    },

    openLogs: async () => {
      await window.appApi.logs.openDir();
    },

    setLanguage: (lang) => {
      set({ language: lang });
      void i18next.changeLanguage(lang);
      void window.appApi.settings.update({ language: lang }).then((result) => {
        if (!result.ok) console.error('[settings] language save failed', result.error);
      });
      void window.appApi.app.setLanguage(lang);
    },

    setCookiesPath: async (path) => {
      const current = get().settings;
      if (current) set({ settings: { ...current, cookiesPath: path } });
      const result = await window.appApi.settings.update({ cookiesPath: path });
      if (!result.ok) {
        console.error('[settings] cookiesPath save failed', result.error);
        return;
      }
      set({ settings: result.data });
    },

    setCookiesEnabled: async (enabled) => {
      const current = get().settings;
      if (current) set({ settings: { ...current, cookiesEnabled: enabled } });
      const result = await window.appApi.settings.update({ cookiesEnabled: enabled });
      if (!result.ok) {
        console.error('[settings] cookiesEnabled save failed', result.error);
        return;
      }
      set({ settings: result.data });
    },

    setClipboardWatchEnabled: async (enabled) => {
      const current = get().settings;
      if (current) set({ settings: { ...current, clipboardWatchEnabled: enabled } });
      const result = await window.appApi.settings.update({ clipboardWatchEnabled: enabled });
      if (!result.ok) {
        console.error('[settings] clipboardWatchEnabled save failed', result.error);
        return;
      }
      set({ settings: result.data });
    }
  };
}
