import type { AppSettings, DependencyId, DownloadProfile, DownloadProfileRef, QueueItem } from '@shared/types.js';
import { QUEUE_STATUS } from '@shared/schemas.js';
import { DEFAULTS } from '@shared/constants.js';
import { DEFAULT_DOWNLOAD_PROFILES_PREFS, normalizeDownloadProfilesPrefs, removeDownloadProfileFromPrefs, saveDownloadProfileToPrefs } from '@shared/downloadProfiles.js';
import { i18next, pickLanguage, isRtl } from '@shared/i18n/index.js';
import type { GetState, SetState, ShareTrigger, SystemSlice } from './types.js';
import { notify } from '../lib/notify.js';
import { track } from '../lib/analytics.js';

let unbindWarmupProgress: (() => void) | null = null;
let unbindQueueSnapshot: (() => void) | null = null;
let unbindQueueAdded: (() => void) | null = null;
let unbindQueueUpdated: (() => void) | null = null;
let unbindQueueRemoved: (() => void) | null = null;

// RAF-batching for all incoming queue IPC messages (updated/added/removed).
// Without this each event causes its own state.queue.{map,splice,filter}
// rebuild + Zustand notify + React commit; with a 290-item playlist the
// renderer falls multiple seconds behind main. Single set() per frame merges
// all three streams. Add+remove for the same id in one frame cancel out;
// remove drops any pending update for the same id (item is gone, no point
// applying its last progress).
let pendingQueueUpdates = new Map<string, QueueItem>();
let pendingQueueAdded: { items: QueueItem[]; atIdx: number }[] = [];
let pendingQueueRemoved = new Set<string>();
let queueFlushScheduled = false;

const SHARE_MILESTONES: readonly number[] = [3, 25, 100];

function commonPatch(get: GetState, set: SetState, patch: Partial<AppSettings['common']>): void {
  const previous = get().settings;
  if (previous) {
    set({ settings: { ...previous, common: { ...previous.common, ...patch } } });
  }
  void window.appApi.settings.update({ common: patch }).then((result) => {
    if (!result.ok) {
      // Revert optimistic update — UI was showing patched value, but the
      // canonical state on disk never changed. Without rollback, renderer
      // and main process diverge until next initialize().
      if (previous) set({ settings: previous });
      notify.settingsSaveFailed('share', result.error);
      return;
    }
    set({ settings: result.data });
  });
}

// Shared pattern for setCookiesPath/setProxyUrl/...: optimistic update, IPC
// patch, on failure revert to the value captured before the patch.
async function applyCommonPatchAsync(get: GetState, set: SetState, label: string, patch: Partial<AppSettings['common']>): Promise<void> {
  const previous = get().settings;
  if (previous) set({ settings: { ...previous, common: { ...previous.common, ...patch } } });
  const result = await window.appApi.settings.update({ common: patch });
  if (!result.ok) {
    if (previous) set({ settings: previous });
    notify.settingsSaveFailed(label, result.error);
    return;
  }
  set({ settings: result.data });
}

async function applyProfilesPatchAsync(get: GetState, set: SetState, label: string, profiles: AppSettings['profiles']): Promise<void> {
  const previous = get().settings;
  if (previous) set({ settings: { ...previous, profiles } });
  const result = await window.appApi.settings.update({ profiles });
  if (!result.ok) {
    if (previous) set({ settings: previous });
    notify.settingsSaveFailed(label, result.error);
    return;
  }
  set({ settings: result.data });
}

function currentProfiles(settings: AppSettings | null): AppSettings['profiles'] {
  return normalizeDownloadProfilesPrefs(settings?.profiles ?? DEFAULT_DOWNLOAD_PROFILES_PREFS);
}

function openShareDialogInternal(set: SetState, trigger: ShareTrigger): void {
  set({ shareDialogOpen: true, shareDialogTrigger: trigger });
  track('share_dialog_opened', { via: trigger });
}

const OVERRIDE_KEY: Record<DependencyId, 'ytDlp' | 'ffmpeg' | 'ffprobe' | 'deno'> = {
  'yt-dlp': 'ytDlp',
  ffmpeg: 'ffmpeg',
  ffprobe: 'ffprobe',
  deno: 'deno'
};

function makeBinaryOverridePatch(id: DependencyId, path: string | undefined): { common: { binaryOverrides: Record<string, string | undefined> } } {
  return { common: { binaryOverrides: { [OVERRIDE_KEY[id]]: path } } };
}

export function createSystemSlice(set: SetState, get: GetState): SystemSlice {
  return {
    initialized: false,
    initializing: false,
    splashDismissed: false,
    warmupDiagnostics: null,
    warmupBlocking: [],
    warmupRunning: false,
    warmupCancellable: false,
    warmupProgress: null,
    settings: null,
    // Guard `navigator` so vitest's node-env tests (e.g. format-selection-view)
    // can construct the store at module-load time without DOM globals.
    // initialize() reassigns from settingsResult.common.language anyway.
    language: typeof navigator !== 'undefined' ? pickLanguage(navigator.language) : pickLanguage('en'),
    commonPaths: undefined,
    shareDialogOpen: false,
    shareDialogTrigger: null,

    initialize: async () => {
      if (get().initialized || get().initializing) return;
      set({ initializing: true, splashDismissed: false });

      // Detach prior queue projection bindings (defense for a future re-init flow).
      unbindQueueSnapshot?.();
      unbindQueueAdded?.();
      unbindQueueUpdated?.();
      unbindQueueRemoved?.();

      // Queue projection: hydrate from initial snapshot, then apply diffs.
      // QueueService on main is the queue-of-record; this slice is a read-only
      // mirror of `service.snapshot()` + the four diff event streams.
      unbindQueueSnapshot = window.appApi.queue.events.onSnapshot((items) => {
        set({ queue: items });
      });
      const scheduleFlush = (): void => {
        if (queueFlushScheduled) return;
        queueFlushScheduled = true;
        requestAnimationFrame(flushQueueUpdates);
      };
      unbindQueueAdded = window.appApi.queue.events.onAdded((evt) => {
        pendingQueueAdded.push(evt);
        scheduleFlush();
      });
      // Single flush merges updated/added/removed streams in one set(). Order:
      // 1) drop pending updates for ids being removed (no point reviving).
      // 2) apply removes (filter once).
      // 3) apply adds (splice in arrival order — main is sole source of truth
      //    for atIdx so we don't try to reconcile out-of-order add events).
      // 4) apply updates (map once).
      const flushQueueUpdates = (): void => {
        queueFlushScheduled = false;
        const updates = pendingQueueUpdates;
        const adds = pendingQueueAdded;
        const removes = pendingQueueRemoved;
        if (updates.size === 0 && adds.length === 0 && removes.size === 0) return;
        pendingQueueUpdates = new Map();
        pendingQueueAdded = [];
        pendingQueueRemoved = new Set();
        for (const id of removes) updates.delete(id);
        // Count items that crossed pending/running → done in this batch.
        // Done items are not normally removed in the same frame (clearCompleted
        // is a separate user action), so checking updates is sufficient.
        // Build a Map for O(1) prev lookup — naive .find() would be O(n) per
        // update, blowing up to O(n²) during burst completions (e.g. resumeAll
        // of many paused-active items finishing in one tick).
        const prevQueue = get().queue;
        const prevById = new Map<string, QueueItem>();
        for (const i of prevQueue) prevById.set(i.id, i);
        // Snapshot the milestone counter BEFORE any set() runs. Defensive — no
        // set() in this flush touches settings, but hoisting the read makes
        // the "read prev, compute next, apply next" sequence obviously
        // race-free if future code adds settings mutations between the queue
        // set() and the milestone block.
        const prevMilestoneCount = get().settings?.common?.successfulDownloadCount ?? 0;
        let doneIncrements = 0;
        for (const [id, item] of updates) {
          const prev = prevById.get(id);
          if (prev && prev.status !== QUEUE_STATUS.done && item.status === QUEUE_STATUS.done) {
            doneIncrements++;
          }
        }
        set((state) => {
          let next: QueueItem[] = state.queue;
          if (removes.size > 0) next = next.filter((i) => !removes.has(i.id));
          if (adds.length > 0) {
            // Adds aren't always strictly contiguous with current array length
            // (could fire while removes also in flight). Splice at the original
            // atIdx clamped to current length; main computed atIdx against its
            // own snapshot which may differ from renderer mid-burst. Worst case
            // is order drift; the next snapshot event would correct it but
            // none arrives during normal operation.
            next = [...next];
            for (const { items, atIdx } of adds) {
              const idx = Math.min(atIdx, next.length);
              next.splice(idx, 0, ...items);
            }
          }
          if (updates.size > 0) next = next.map((i) => updates.get(i.id) ?? i);
          return next === state.queue ? {} : { queue: next };
        });
        if (doneIncrements > 0) {
          const nextCount = prevMilestoneCount + doneIncrements;
          commonPatch(get, set, { successfulDownloadCount: nextCount });
          for (let c = prevMilestoneCount + 1; c <= nextCount; c++) {
            if (SHARE_MILESTONES.includes(c)) {
              openShareDialogInternal(set, 'milestone');
              break;
            }
          }
        }
      };
      unbindQueueUpdated = window.appApi.queue.events.onUpdated(({ item }) => {
        pendingQueueUpdates.set(item.id, item);
        scheduleFlush();
      });
      unbindQueueRemoved = window.appApi.queue.events.onRemoved(({ itemId }) => {
        pendingQueueRemoved.add(itemId);
        scheduleFlush();
      });

      // The warmup-progress listener stays bound for the lifetime of the
      // process — repair flows trigger another warmup run without re-entering
      // initialize, so we can't unbind it here like the original did.
      unbindWarmupProgress?.();
      unbindWarmupProgress = window.appApi.events.onWarmupProgress((event) => {
        set((state) => ({
          warmupProgress: { ...(state.warmupProgress ?? {}), [event.binary]: event }
        }));
      });

      set({ warmupRunning: true, warmupCancellable: true });
      const settingsPromise = window.appApi.settings.get();
      const warmUpPromise = window.appApi.app.warmUp();
      const snapshotPromise = window.appApi.queue.cmd.getSnapshot();
      const settingsResult = await settingsPromise;

      if (settingsResult.ok) {
        const common = settingsResult.data.common ?? ({} as AppSettings['common']);
        const zoom = common.uiZoom ?? DEFAULTS.uiZoom;
        const theme = common.uiTheme ?? DEFAULTS.uiTheme;
        const persistedLang = common.language;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        const nextLanguage = persistedLang ?? get().language;
        if (nextLanguage !== i18next.language) {
          void i18next.changeLanguage(nextLanguage);
        }
        void window.appApi.app.setLanguage(nextLanguage);
        set({
          settings: settingsResult.data,
          wizardOutputDir: common.defaultOutputDir,
          commonPaths: common.commonPaths,
          uiZoom: zoom,
          uiTheme: theme,
          language: nextLanguage,
          drawerOpen: settingsResult.data.common?.drawerOpen ?? false
        });
      }

      const snapshotResult = await snapshotPromise;
      if (snapshotResult.ok) {
        set({
          queue: snapshotResult.data,
          ...(snapshotResult.data.length > 0 ? { drawerOpen: true } : {})
        });
      }

      const warmUpResult = await warmUpPromise;
      const warmupDiagnostics = warmUpResult.ok ? warmUpResult.data.dependencies : null;
      const warmupBlocking = warmUpResult.ok ? warmUpResult.data.blockingFailures : [];

      set({ initialized: true, initializing: false, warmupRunning: false, warmupCancellable: false, warmupDiagnostics, warmupBlocking });
    },

    setSplashDismissed: (dismissed) => {
      set({ splashDismissed: dismissed });
    },

    cancelWarmup: async () => {
      try {
        await window.appApi.app.cancelWarmup();
      } catch (err) {
        notify.warmupFailed('cancel threw', err);
      }
    },

    repairWarmup: async () => {
      if (get().warmupRunning) return;
      set({ warmupRunning: true, warmupCancellable: true });
      try {
        const result = await window.appApi.app.warmUp({ force: true });
        if (result.ok) {
          set({ warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures });
        } else {
          notify.warmupFailed('repair failed', result.error);
        }
      } catch (err) {
        notify.warmupFailed('repair threw', err);
      } finally {
        set({ warmupRunning: false, warmupCancellable: false });
      }
    },

    repairYtDlpWithHomebrew: async () => {
      if (get().warmupRunning) return;
      set({ warmupRunning: true, warmupCancellable: false });
      try {
        const install = await window.appApi.app.installYtDlpWithHomebrew();
        if (!install.ok) {
          notify.warmupFailed('homebrew repair failed', install.error);
          return;
        }
        set({ warmupCancellable: true });
        const result = await window.appApi.app.warmUp({ force: true });
        if (result.ok) {
          set({ warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures });
        } else {
          notify.warmupFailed('post-homebrew repair failed', result.error);
        }
      } catch (err) {
        notify.warmupFailed('homebrew repair threw', err);
      } finally {
        set({ warmupRunning: false, warmupCancellable: false });
      }
    },

    repairYtDlpWithWinget: async () => {
      if (get().warmupRunning) return;
      set({ warmupRunning: true, warmupCancellable: false });
      try {
        const install = await window.appApi.app.installYtDlpWithWinget();
        if (!install.ok) {
          notify.warmupFailed('winget repair failed', install.error);
          return;
        }
        set({ warmupCancellable: true });
        const result = await window.appApi.app.warmUp({ force: true });
        if (result.ok) {
          set({ warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures });
        } else {
          notify.warmupFailed('post-winget repair failed', result.error);
        }
      } catch (err) {
        notify.warmupFailed('winget repair threw', err);
      } finally {
        set({ warmupRunning: false, warmupCancellable: false });
      }
    },

    setBinaryOverride: async (id, path) => {
      const patch = makeBinaryOverridePatch(id, path);
      const result = await window.appApi.settings.update(patch);
      if (!result.ok) {
        notify.settingsSaveFailed('binaryOverrides', result.error);
        return;
      }
      set({ settings: result.data });
      try {
        await get().repairWarmup();
      } catch (err) {
        notify.warmupFailed('post-override repair threw', err);
      }
    },

    clearBinaryOverride: async (id) => {
      const patch = makeBinaryOverridePatch(id, undefined);
      const result = await window.appApi.settings.update(patch);
      if (!result.ok) {
        notify.settingsSaveFailed('binaryOverrides clear', result.error);
        return;
      }
      set({ settings: result.data });
      try {
        await get().repairWarmup();
      } catch (err) {
        notify.warmupFailed('post-clear repair threw', err);
      }
    },

    openBinariesDir: async () => {
      try {
        const result = await window.appApi.shell.openBinariesDir();
        if (!result.ok) notify.shellActionFailed('shell.openBinariesDir', result.error);
      } catch (err) {
        notify.shellActionFailed('shell.openBinariesDir', err);
      }
    },

    openLogs: async () => {
      try {
        const result = await window.appApi.logs.openDir();
        if (!result.ok) notify.shellActionFailed('logs.openDir', result.error);
      } catch (err) {
        notify.shellActionFailed('logs.openDir', err);
      }
    },

    setLanguage: (lang) => {
      set({ language: lang });
      document.documentElement.lang = lang;
      document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
      void i18next.changeLanguage(lang);
      void window.appApi.settings.update({ common: { language: lang } }).then((result) => {
        if (!result.ok) notify.settingsSaveFailed('language', result.error);
      });
      void window.appApi.app.setLanguage(lang);
    },

    setCookiesPath: async (path) => {
      await applyCommonPatchAsync(get, set, 'cookiesPath', { cookiesPath: path });
    },

    setCookiesMode: async (mode) => {
      await applyCommonPatchAsync(get, set, 'cookiesMode', { cookiesMode: mode });
    },

    setCookiesBrowser: async (browser) => {
      await applyCommonPatchAsync(get, set, 'cookiesBrowser', { cookiesBrowser: browser });
    },

    setProxyUrl: async (url) => {
      await applyCommonPatchAsync(get, set, 'proxyUrl', { proxyUrl: url });
    },

    setLimitRate: async (value) => {
      await applyCommonPatchAsync(get, set, 'limitRate', { limitRate: value ?? '' });
    },

    setPlaylistProbeLimit: async (value) => {
      await applyCommonPatchAsync(get, set, 'playlistProbeLimit', { playlistProbeLimit: value });
    },

    setIncludeIdInSingleFilenames: async (enabled) => {
      await applyCommonPatchAsync(get, set, 'includeIdInSingleFilenames', { includeIdInSingleFilenames: enabled });
    },

    setNetworkPacingPreset: async (value) => {
      await applyCommonPatchAsync(get, set, 'networkPacingPreset', { networkPacingPreset: value });
    },

    setPacingSleepRequests: async (value) => {
      await applyCommonPatchAsync(get, set, 'pacingSleepRequests', { pacingSleepRequests: value });
    },

    setPacingSleepInterval: async (value) => {
      await applyCommonPatchAsync(get, set, 'pacingSleepInterval', { pacingSleepInterval: value });
    },

    setPacingMaxSleepInterval: async (value) => {
      await applyCommonPatchAsync(get, set, 'pacingMaxSleepInterval', { pacingMaxSleepInterval: value });
    },

    setPacingSleepSubtitles: async (value) => {
      await applyCommonPatchAsync(get, set, 'pacingSleepSubtitles', { pacingSleepSubtitles: value });
    },

    setPacingConcurrentFragments: async (value) => {
      await applyCommonPatchAsync(get, set, 'pacingConcurrentFragments', { pacingConcurrentFragments: value });
    },

    setClipboardWatchEnabled: async (enabled) => {
      await applyCommonPatchAsync(get, set, 'clipboardWatchEnabled', { clipboardWatchEnabled: enabled });
    },

    setCloseBehavior: async (value) => {
      await applyCommonPatchAsync(get, set, 'closeBehavior', { closeBehavior: value });
    },

    setAnalyticsEnabled: async (enabled) => {
      await applyCommonPatchAsync(get, set, 'analyticsEnabled', { analyticsEnabled: enabled });
    },

    setActiveDownloadProfile: async (ref: DownloadProfileRef) => {
      const profiles = { ...currentProfiles(get().settings), active: ref };
      await applyProfilesPatchAsync(get, set, 'downloadProfile.active', profiles);
    },

    saveDownloadProfile: async (profile: DownloadProfile, activate = true) => {
      const previous = currentProfiles(get().settings);
      const profiles = saveDownloadProfileToPrefs(previous, profile, activate);
      await applyProfilesPatchAsync(get, set, 'downloadProfile.save', profiles);
    },

    removeDownloadProfile: async (id: string) => {
      const profiles = removeDownloadProfileFromPrefs(currentProfiles(get().settings), id);
      await applyProfilesPatchAsync(get, set, 'downloadProfile.remove', profiles);
    },

    openShareDialog: (trigger) => {
      openShareDialogInternal(set, trigger);
    },

    closeShareDialog: () => {
      set({ shareDialogOpen: false, shareDialogTrigger: null });
    },

    setShareInlineCardDismissed: async () => {
      track('share_inline_card_dismissed');
      await applyCommonPatchAsync(get, set, 'shareInlineCardDismissed', { shareInlineCardDismissed: true });
    },

    setShareHighValueBannerDismissed: async () => {
      track('share_prompt_dismissed', { via: 'high-value-inline' });
      await applyCommonPatchAsync(get, set, 'shareHighValueBannerDismissed', { shareHighValueBannerDismissed: true });
    }
  };
}
