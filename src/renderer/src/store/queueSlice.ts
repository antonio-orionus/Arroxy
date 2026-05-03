import type {
  LocalizedError,
  QueueItem,
  StartDownloadInput
} from '@shared/types';
import { QUEUE_STATUS } from '@shared/schemas';
import { ProgressFormatter } from './progress';
import {
  buildFormatId,
  buildFormatLabel,
  generateId,
  resolveVideoResolution
} from './helpers';
import { effectiveOutputDir } from '@renderer/lib/path';
import type { GetState, SetState, QueueSlice } from './types';

export const progressFormatters = new Map<string, ProgressFormatter>();

export function updateQueueItem(set: SetState, id: string, patch: Partial<QueueItem>): void {
  set((state) => ({
    queue: state.queue.map((item) => (item.id === id ? { ...item, ...patch } : item))
  }));
}

export function maybeShowQueueTip(set: SetState): void {
  if (!localStorage.getItem('arroxy_seen_queue_tip')) {
    localStorage.setItem('arroxy_seen_queue_tip', '1');
    set({ drawerOpen: true, showQueueTip: true });
  }
}

export async function maybeStartNext(get: GetState): Promise<void> {
  if (get().queue.some((i) => i.status === QUEUE_STATUS.downloading)) return;
  const next = get().queue.find((i) => i.status === QUEUE_STATUS.pending);
  if (next) {
    await get().startItemDownload(next.id);
  }
}

export function saveQueue(get: GetState): void {
  void window.appApi.queue.save(get().queue).then(
    (result) => {
      if (!result.ok) console.error('[queue] save failed', result.error);
    },
    (err) => console.error('[queue] save threw', err)
  );
}

function buildQueueItem(get: GetState): QueueItem | null {
  const state = get();
  const { wizardUrl, wizardTitle, wizardThumbnail, wizardOutputDir } = state;
  const { wizardSubfolderEnabled, wizardSubfolderName } = state;
  const { selectedVideoFormatId, selectedAudioFormatId, activePreset, wizardFormats } = state;
  const outputDir = effectiveOutputDir(wizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName);

  const audioFormats = wizardFormats.filter((f) => f.isAudioOnly);
  const videoResolution = resolveVideoResolution(selectedVideoFormatId, wizardFormats, 'audio-only');

  const formatId = buildFormatId(selectedVideoFormatId, selectedAudioFormatId);
  const formatLabel = buildFormatLabel(selectedVideoFormatId, videoResolution, selectedAudioFormatId, audioFormats, activePreset);

  const selectedIds = [selectedVideoFormatId, selectedAudioFormatId].filter(Boolean) as string[];
  const selectedSizes = selectedIds.map((id) => wizardFormats.find((f) => f.formatId === id)?.filesize);
  const expectedBytes = selectedIds.length > 0 && selectedSizes.every((s) => s !== undefined)
    ? selectedSizes.reduce<number>((a, b) => a + b!, 0)
    : undefined;

  const subtitleLanguages = state.wizardSubtitleSkipped ? [] : state.wizardSubtitleLanguages;

  return {
    id: generateId(),
    url: wizardUrl,
    title: wizardTitle || wizardUrl,
    thumbnail: wizardThumbnail,
    outputDir,
    formatId,
    formatLabel,
    status: QUEUE_STATUS.pending,
    progressPercent: 0,
    progressDetail: null,
    lastStatus: null,
    error: null,
    finishedAt: null,
    downloadJobId: null,
    subtitleLanguages,
    writeAutoSubs: subtitleLanguages.some(
      (l) => !!state.wizardAutomaticCaptions[l] && !state.wizardSubtitles[l]
    ),
    subtitleMode: state.wizardSubtitleMode,
    subtitleFormat: state.wizardSubtitleFormat,
    sponsorBlockMode: state.wizardSponsorBlockMode,
    sponsorBlockCategories: [...state.wizardSponsorBlockCategories],
    embedChapters: state.wizardEmbedChapters,
    embedMetadata: state.wizardEmbedMetadata,
    embedThumbnail: state.wizardEmbedThumbnail,
    writeDescription: state.wizardWriteDescription,
    writeThumbnail: state.wizardWriteThumbnail,
    expectedBytes,
  };
}

function buildStartInput(item: QueueItem): StartDownloadInput {
  const hasSubs = item.subtitleLanguages.length > 0;
  return {
    url: item.url,
    outputDir: item.outputDir,
    formatId: item.formatId,
    subtitleLanguages: hasSubs ? item.subtitleLanguages : undefined,
    writeAutoSubs: hasSubs ? item.writeAutoSubs : undefined,
    subtitleMode: item.subtitleMode,
    subtitleFormat: item.subtitleFormat,
    ...(item.sponsorBlockMode !== 'off' && item.sponsorBlockCategories.length > 0 ? {
      sponsorBlockMode: item.sponsorBlockMode,
      sponsorBlockCategories: item.sponsorBlockCategories
    } : {}),
    embedChapters: item.embedChapters,
    embedMetadata: item.embedMetadata,
    embedThumbnail: item.embedThumbnail,
    writeDescription: item.writeDescription,
    writeThumbnail: item.writeThumbnail,
    expectedBytes: item.expectedBytes,
  };
}

async function persistFormatPrefs(set: SetState, get: GetState): Promise<void> {
  const { selectedVideoFormatId, activePreset, wizardFormats, wizardSubtitleLanguages, settings } = get();
  if (!settings) return;

  const videoResolution = resolveVideoResolution(selectedVideoFormatId, wizardFormats, 'audio-only');

  // Only persist subtitle prefs when the user actually picked languages this run —
  // otherwise an empty selection (or a Skip Subs click) would wipe the saved list.
  const patch = {
    lastVideoResolution: videoResolution,
    lastPreset: activePreset,
    ...(wizardSubtitleLanguages.length > 0 ? {
      lastSubtitleLanguages: wizardSubtitleLanguages,
      lastSubtitleMode: get().wizardSubtitleMode,
      lastSubtitleFormat: get().wizardSubtitleFormat,
    } : {}),
    lastSponsorBlockMode: get().wizardSponsorBlockMode,
    lastSponsorBlockCategories: get().wizardSponsorBlockCategories,
    lastSubfolderEnabled: get().wizardSubfolderEnabled,
    lastSubfolder: get().wizardSubfolderName.trim(),
    embedChapters: get().wizardEmbedChapters,
    embedMetadata: get().wizardEmbedMetadata,
    embedThumbnail: get().wizardEmbedThumbnail,
    writeDescription: get().wizardWriteDescription,
    writeThumbnail: get().wizardWriteThumbnail,
  };
  const result = await window.appApi.settings.update(patch);
  if (result.ok) {
    set({ settings: result.data });
  }
}

export function createQueueSlice(set: SetState, get: GetState): QueueSlice {
  return {
    queue: [],

    addToQueue: async () => {
      const item = buildQueueItem(get);
      if (!item) return;
      set((state) => ({ queue: [...state.queue, item] }));
      maybeShowQueueTip(set);
      saveQueue(get);
      await persistFormatPrefs(set, get);
      get().reset();
      await maybeStartNext(get);
    },

    addAndDownloadImmediately: async () => {
      const item = buildQueueItem(get);
      if (!item) return;
      set((state) => ({ queue: [...state.queue, item] }));
      maybeShowQueueTip(set);
      saveQueue(get);
      await persistFormatPrefs(set, get);
      get().reset();
      await get().startItemDownload(item.id);
    },

    startItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item) return;

      updateQueueItem(set, itemId, {
        status: QUEUE_STATUS.downloading,
        progressPercent: 0,
        progressDetail: null,
        lastStatus: null,
        error: null
      });

      const result = await window.appApi.downloads.start(buildStartInput(item));

      if (!result.ok) {
        const errorPayload: LocalizedError = { key: null, rawMessage: result.error.message };
        updateQueueItem(set, itemId, { status: QUEUE_STATUS.error, error: errorPayload });
        saveQueue(get);
        return;
      }

      updateQueueItem(set, itemId, { downloadJobId: result.data.job.id });
    },

    cancelItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item || (item.status !== QUEUE_STATUS.downloading && item.status !== QUEUE_STATUS.paused)) return;

      await window.appApi.downloads.cancel({ jobId: item.downloadJobId ?? undefined });
      updateQueueItem(set, itemId, { status: QUEUE_STATUS.cancelled, downloadJobId: null });
      saveQueue(get);
      void maybeStartNext(get);
    },

    pauseItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item || item.status !== QUEUE_STATUS.downloading) return;

      const result = await window.appApi.downloads.pause({ jobId: item.downloadJobId ?? undefined });
      if (result.ok && result.data.paused) {
        updateQueueItem(set, itemId, { status: QUEUE_STATUS.paused, progressDetail: null });
        saveQueue(get);
      }
    },

    resumeItemDownload: async (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (!item || item.status !== QUEUE_STATUS.paused) return;

      updateQueueItem(set, itemId, { status: QUEUE_STATUS.downloading, error: null });
      saveQueue(get);

      // Within-session pause: the main process still owns the paused job;
      // resume re-spawns under the same jobId so status events stay coherent.
      if (item.downloadJobId) {
        const resumeResult = await window.appApi.downloads.resume({ jobId: item.downloadJobId });
        if (resumeResult.ok && resumeResult.data.resumed) {
          saveQueue(get);
          return;
        }
        if (!resumeResult.ok) {
          console.warn('[resume] resume() failed, falling back to start()', resumeResult.error);
        }
      }

      // If a cancel landed during the resume await, the item is no longer
      // `downloading` — bail before starting a fresh job that would race the
      // cancel that just finalized things.
      const current = get().queue.find((i) => i.id === itemId);
      if (current?.status !== QUEUE_STATUS.downloading) return;

      // Fallback: across app restart the main process has no record of the
      // paused job. Start a fresh job — yt-dlp's --continue picks up the
      // .part file on disk.
      const result = await window.appApi.downloads.start(buildStartInput(item));

      if (!result.ok) {
        const errorPayload: LocalizedError = { key: null, rawMessage: result.error.message };
        updateQueueItem(set, itemId, { status: QUEUE_STATUS.error, error: errorPayload });
        saveQueue(get);
        return;
      }

      updateQueueItem(set, itemId, { downloadJobId: result.data.job.id });
      saveQueue(get);
    },

    removeQueueItem: (itemId) => {
      const item = get().queue.find((i) => i.id === itemId);
      if (item?.status === QUEUE_STATUS.downloading || item?.status === QUEUE_STATUS.paused) return;
      set((state) => ({ queue: state.queue.filter((i) => i.id !== itemId) }));
      saveQueue(get);
    },

    retryQueueItem: async (itemId) => {
      updateQueueItem(set, itemId, {
        status: QUEUE_STATUS.pending,
        progressPercent: 0,
        progressDetail: null,
        lastStatus: null,
        error: null,
        finishedAt: null,
        downloadJobId: null
      });
      saveQueue(get);
      await maybeStartNext(get);
    },

    clearCompleted: () => {
      set((state) => ({
        queue: state.queue.filter((i) => i.status !== QUEUE_STATUS.done && i.status !== QUEUE_STATUS.cancelled)
      }));
      saveQueue(get);
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
}
