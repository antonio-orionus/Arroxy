import fs from 'node:fs/promises';
import path from 'node:path';
import type { QueueItem } from '@shared/types';
import { queueArraySchema, QUEUE_STATUS } from '@shared/schemas';
import { fail, ok, type Result } from '@shared/result';
import { createAppError } from '@main/utils/errorFactory';
import { JsonFileStore } from './JsonFileStore';

export class QueueStore extends JsonFileStore {
  constructor(userDataPath: string) {
    super(path.join(userDataPath, 'queue.json'));
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

    await this.writeJson(result.data);
  }

  async load(): Promise<Result<QueueItem[]>> {
    let raw: string;
    try {
      raw = await fs.readFile(this.filePath, 'utf-8');
    } catch (err) {
      if (isNodeNotFound(err)) return ok([]);
      const message = err instanceof Error ? err.message : String(err);
      return fail(createAppError('ipc', `Queue load failed: ${message}`));
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return fail(createAppError('validation', `Queue file is not valid JSON: ${message}`));
    }

    const validated = queueArraySchema.safeParse(parsed);
    if (!validated.success) {
      const issue = validated.error.issues[0]?.message ?? 'schema mismatch';
      return fail(createAppError('validation', `Queue file is corrupted: ${issue}`));
    }

    return ok(validated.data.map((item) => ({ ...item, downloadJobId: null })));
  }
}

function isNodeNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ENOENT';
}
