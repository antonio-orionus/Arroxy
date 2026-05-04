import path from 'node:path';
import type { AppSettings } from '@shared/types';
import { JsonFileStore } from './JsonFileStore';

export class SettingsStore extends JsonFileStore {
  private readonly defaults: AppSettings;

  constructor(userDataPath: string, defaults: AppSettings) {
    super(path.join(userDataPath, 'settings.json'));
    this.defaults = defaults;
  }

  async get(): Promise<AppSettings> {
    const data = await this.readJson<Partial<AppSettings>>({}, (err) => console.error('[SettingsStore] Failed to load settings — using defaults', err));
    return { ...this.defaults, ...data };
  }

  async update(next: Partial<AppSettings>): Promise<AppSettings> {
    const merged = { ...(await this.get()), ...next };
    await this.writeJson(merged);
    return merged;
  }
}
