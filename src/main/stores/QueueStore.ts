import path from 'node:path';
import type { QueueItem } from '@shared/types';
import { JsonFileStore } from './JsonFileStore';

export class QueueStore extends JsonFileStore {
  constructor(userDataPath: string) {
    super(path.join(userDataPath, 'queue.json'));
  }

  async save(items: QueueItem[]): Promise<void> {
    const toStore = items
      .filter((item) => item.status !== 'cancelled')
      .map((item): QueueItem => {
        const wasDownloading = item.status === 'downloading';
        const wasActive = wasDownloading || item.status === 'paused';
        return {
          ...item,
          status: wasDownloading ? 'pending' : item.status,
          progressPercent: wasActive ? 0 : item.progressPercent,
          progressDetail: wasActive ? null : item.progressDetail,
          downloadJobId: null,
        };
      });

    await this.writeJson(toStore);
  }

  async load(): Promise<QueueItem[]> {
    const parsed = await this.readJson<QueueItem[]>([], (err) =>
      console.error('[QueueStore] Failed to load queue — returning empty', err)
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({ ...item, downloadJobId: null }));
  }
}
