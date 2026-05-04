import type { DownloadJob, QueueItem } from '@shared/types';
import { DEFAULTS } from '@shared/constants';
import { queueItemSchema } from '@shared/schemas';

export { ok } from '@shared/result';

export function makeItem(
  overrides: Partial<QueueItem> & Pick<QueueItem, 'id' | 'status'>
): QueueItem {
  const candidate = {
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
    subtitleMode: DEFAULTS.subtitleMode,
    subtitleFormat: DEFAULTS.subtitleFormat,
    sponsorBlockMode: DEFAULTS.sponsorBlockMode,
    sponsorBlockCategories: DEFAULTS.sponsorBlockCategories,
    embedChapters: DEFAULTS.embedChapters,
    embedMetadata: DEFAULTS.embedMetadata,
    embedThumbnail: DEFAULTS.embedThumbnail,
    writeDescription: DEFAULTS.writeDescription,
    writeThumbnail: DEFAULTS.writeThumbnail,
    ...overrides,
  };
  // Schema-validate so a future field added to QueueItem cannot silently slip
  // past test fixtures — the fixture and the real shape are forced to agree.
  const parsed = queueItemSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(`makeItem fixture invalid: ${parsed.error.issues[0]?.message ?? 'schema mismatch'}`);
  }
  return parsed.data;
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
