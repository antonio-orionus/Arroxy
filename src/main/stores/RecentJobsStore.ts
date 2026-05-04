import path from 'node:path';
import type { RecentJob } from '@shared/types';
import { JsonFileStore } from './JsonFileStore';

const MAX_JOBS = 30;

export class RecentJobsStore extends JsonFileStore {
  private pushQueue: Promise<void> = Promise.resolve();

  constructor(userDataPath: string) {
    super(path.join(userDataPath, 'recent-jobs.json'));
  }

  async list(): Promise<RecentJob[]> {
    const jobs = await this.readJson<RecentJob[]>([], (err) => console.error('[RecentJobsStore] Failed to load recent jobs — returning empty', err));
    if (!Array.isArray(jobs)) return [];
    return jobs.sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
  }

  async push(job: RecentJob): Promise<void> {
    const next = this.pushQueue.then(async () => {
      const current = await this.list();
      const merged = [job, ...current.filter((entry) => entry.id !== job.id)].slice(0, MAX_JOBS);
      await this.writeJson(merged);
    });
    this.pushQueue = next.catch(() => {});
    return next;
  }
}
