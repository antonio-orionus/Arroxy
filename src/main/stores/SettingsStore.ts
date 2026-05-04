import Store from 'electron-store';
import type { AppSettings } from '@shared/types';

export class SettingsStore {
  private readonly store: Store<AppSettings>;

  constructor(userDataPath: string, defaults: AppSettings) {
    this.store = new Store<AppSettings>({ name: 'settings', cwd: userDataPath, defaults, clearInvalidConfig: true });
  }

  async get(): Promise<AppSettings> {
    return this.store.store;
  }

  async update(next: Partial<AppSettings>): Promise<AppSettings> {
    this.store.set(next as AppSettings);
    return this.store.store;
  }
}
