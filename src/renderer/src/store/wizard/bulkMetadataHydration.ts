import type { BulkMetadataCancelReason, BulkMetadataItemStatus } from '@shared/types.js';
import { bulkLogger, redactUrlForLog } from '@renderer/lib/bulkLogger.js';
import type { AppState, SetState } from '../types.js';

export const BULK_METADATA_CONCURRENCY = 2;

let bulkMetadataRunSeq = 0;

export function nextBulkMetadataRunId(): number {
  bulkMetadataRunSeq += 1;
  return bulkMetadataRunSeq;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function cancelBulkMetadataProbes(reason: BulkMetadataCancelReason, state?: Pick<AppState, 'bulkMetadataStatus' | 'bulkMetadataCompleted' | 'bulkMetadataTotal'>): void {
  const previousRunId = bulkMetadataRunSeq;
  const nextRunId = nextBulkMetadataRunId();
  bulkLogger.info('Bulk metadata cancellation requested', {
    reason,
    previousRunId,
    nextRunId,
    status: state?.bulkMetadataStatus,
    completed: state?.bulkMetadataCompleted,
    total: state?.bulkMetadataTotal
  });
  if (typeof window.appApi.downloads.probeCancel === 'function') {
    void window.appApi.downloads.probeCancel();
  }
}

export async function hydrateBulkMetadata(urls: string[], set: SetState, runId: number): Promise<void> {
  let nextIndex = 0;
  bulkLogger.info('Bulk metadata hydration started', {
    runId,
    total: urls.length,
    concurrency: Math.min(BULK_METADATA_CONCURRENCY, urls.length)
  });

  async function worker(): Promise<void> {
    while (bulkMetadataRunSeq === runId && nextIndex < urls.length) {
      const index = nextIndex;
      nextIndex += 1;
      const url = urls[index];
      const id = `bulk-${index + 1}`;
      let finalStatus: BulkMetadataItemStatus = 'failed';

      set((state) => {
        if (state.wizardMode !== 'bulk') return {};
        const current = state.playlistItems.find((entry) => entry.id === id);
        if (current?.url !== url) return {};
        return { bulkMetadataById: { ...state.bulkMetadataById, [id]: 'resolving' } };
      });

      try {
        bulkLogger.debug('Bulk metadata probe started', { runId, itemId: id, index: index + 1, url: redactUrlForLog(url) });
        const result = await window.appApi.downloads.probe({ url, playlistMode: 'video' });
        if (!result.ok) {
          if (result.error.kind === 'other' && result.error.message === 'Probe cancelled') {
            bulkLogger.info('Bulk metadata probe cancelled', { runId, itemId: id, index: index + 1, url: redactUrlForLog(url) });
            continue;
          }
          bulkLogger.warn('Bulk metadata probe failed', { runId, itemId: id, index: index + 1, url: redactUrlForLog(url), error: result.error });
          continue;
        }
        if (result.data.kind !== 'video') {
          bulkLogger.warn('Bulk metadata probe returned non-video result', { runId, itemId: id, index: index + 1, url: redactUrlForLog(url), kind: result.data.kind });
          continue;
        }
        if (bulkMetadataRunSeq !== runId) return;

        const probe = result.data;
        finalStatus = 'done';
        bulkLogger.info('Bulk metadata resolved', {
          runId,
          itemId: id,
          index: index + 1,
          title: probe.title,
          videoId: probe.videoId,
          extractor: probe.extractor,
          duration: probe.duration
        });
        set((state) => {
          if (state.wizardMode !== 'bulk') return {};
          const current = state.playlistItems.find((entry) => entry.id === id);
          if (current?.url !== url) return {};
          return {
            playlistItems: state.playlistItems.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    title: probe.title.trim() || entry.title,
                    thumbnail: probe.thumbnail || entry.thumbnail,
                    duration: probe.duration ?? entry.duration,
                    videoId: probe.videoId ?? entry.videoId
                  }
                : entry
            )
          };
        });
      } catch (error) {
        // Metadata hydration is best-effort; synthetic rows remain usable.
        bulkLogger.warn('Bulk metadata probe threw', { runId, itemId: id, index: index + 1, url: redactUrlForLog(url), error: errorMessage(error) });
      } finally {
        if (bulkMetadataRunSeq === runId) {
          set((state) => {
            if (state.wizardMode !== 'bulk') return {};
            const current = state.playlistItems.find((entry) => entry.id === id);
            if (current?.url !== url) return {};
            const completed = Math.min(state.bulkMetadataCompleted + 1, state.bulkMetadataTotal);
            return {
              bulkMetadataCompleted: completed,
              bulkMetadataStatus: completed >= state.bulkMetadataTotal ? 'done' : 'resolving',
              bulkMetadataById: { ...state.bulkMetadataById, [id]: finalStatus }
            };
          });
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(BULK_METADATA_CONCURRENCY, urls.length) }, () => worker()));
  if (bulkMetadataRunSeq === runId) {
    bulkLogger.info('Bulk metadata hydration finished', { runId, total: urls.length });
  } else {
    bulkLogger.info('Bulk metadata hydration stopped', { runId, supersededByRunId: bulkMetadataRunSeq });
  }
}
