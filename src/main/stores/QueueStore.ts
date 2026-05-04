import Store from 'electron-store';
import type { QueueItem } from '@shared/types';
import { queueArraySchema, QUEUE_STATUS } from '@shared/schemas';
import { fail, ok, type Result } from '@shared/result';

type QueueData = { items: QueueItem[] };

export class QueueStore {
  private readonly store: Store<QueueData>;

  constructor(userDataPath: string) {
    this.store = new Store<QueueData>({ name: 'queue', cwd: userDataPath, defaults: { items: [] }, clearInvalidConfig: true });
  }

  async save(items: QueueItem[]): Promise<void> {
    const toStore = items
      .filter((item) => item.status !== QUEUE_STATUS.cancelled)
      .map((item): QueueItem => {
        const wasDownloading = item.status === QUEUE_STATUS.downloading;
        const wasActive = wasDownloading || item.status === QUEUE_STATUS.paused;
        return {
          ...item,
          status: wasDownloading ? QUEUE_STATUS.pending : item.status,
          progressPercent: wasActive ? 0 : item.progressPercent,
          progressDetail: wasActive ? null : item.progressDetail,
          downloadJobId: null
        };
      });

    const result = queueArraySchema.safeParse(toStore);
    if (!result.success) {
      throw new Error(`QueueStore.save: invalid queue payload — ${result.error.issues[0]?.message ?? 'schema mismatch'}`);
    }

    this.store.set('items', result.data);
  }

  async load(): Promise<Result<QueueItem[]>> {
    const raw = this.store.get('items');
    const validated = queueArraySchema.safeParse(raw);
    if (!validated.success) {
      const issue = validated.error.issues[0]?.message ?? 'schema mismatch';
      return fail({ code: 'validation', message: `Queue file is corrupted: ${issue}` });
    }

    return ok(validated.data.map((item) => ({ ...item, downloadJobId: null })));
  }
}
