import fs from 'node:fs/promises';
import path from 'node:path';
import type { RecentJob } from '@shared/types';

const MAX_JOBS = 30;

export class RecentJobsStore {
  private readonly filePath: string;

  constructor(userDataPath: string) {
    this.filePath = path.join(userDataPath, 'recent-jobs.json');
  }

  async list(): Promise<RecentJob[]> {
    const jobs = await this.read();
    return jobs.sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
  }

  async push(job: RecentJob): Promise<void> {
    const current = await this.list();
    const merged = [job, ...current.filter((entry) => entry.id !== job.id)].slice(0, MAX_JOBS);
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(merged, null, 2), 'utf-8');
  }

  private async read(): Promise<RecentJob[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as RecentJob[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
