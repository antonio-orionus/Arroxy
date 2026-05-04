import Store from 'electron-store';
import type { RecentJob } from '@shared/types';

const MAX_JOBS = 30;

type RecentJobsData = { jobs: RecentJob[] };

export class RecentJobsStore {
  private readonly store: Store<RecentJobsData>;

  constructor(userDataPath: string) {
    this.store = new Store<RecentJobsData>({ name: 'recent-jobs', cwd: userDataPath, defaults: { jobs: [] }, clearInvalidConfig: true });
  }

  async list(): Promise<RecentJob[]> {
    return [...this.store.get('jobs')].sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
  }

  async push(job: RecentJob): Promise<void> {
    const current = this.store.get('jobs');
    const merged = [job, ...current.filter((entry) => entry.id !== job.id)].slice(0, MAX_JOBS);
    this.store.set('jobs', merged);
  }
}
