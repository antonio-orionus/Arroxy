import type { DownloadJob, QueueItem } from '@shared/types';

export { ok, fail } from '@shared/result';

export function makeItem(
  overrides: Partial<QueueItem> & Pick<QueueItem, 'id' | 'status'>
): QueueItem {
  return {
    url: `https://youtube.com/watch?v=${overrides.id}`,
    title: overrides.id,
    thumbnail: '',
    outputDir: '/tmp',
    formatId: undefined,
    formatLabel: 'Best',
    progressPercent: 0,
    progressDetail: null,
    lastStatus: null,
    error: null,
    finishedAt: null,
    downloadJobId: null,
    subtitleLanguages: [],
    writeAutoSubs: false,
    subtitleMode: 'sidecar',
    subtitleFormat: 'srt',
    ...overrides,
  };
}

export function makeJob(id: string): DownloadJob {
  return {
    id,
    url: '',
    outputDir: '/tmp',
    status: 'running',
    createdAt: '',
    updatedAt: ''
  };
}
