import fs from 'node:fs/promises';
import path from 'node:path';
import type { QueueItem } from '@shared/types';

export class QueueStore {
  private readonly filePath: string;

  constructor(userDataPath: string) {
    this.filePath = path.join(userDataPath, 'queue.json');
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

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(toStore, null, 2), 'utf-8');
  }

  async load(): Promise<QueueItem[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as QueueItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => ({ ...item, downloadJobId: null }));
    } catch (err) {
      console.error('[QueueStore] Failed to load queue — returning empty', err);
      return [];
    }
  }
}
