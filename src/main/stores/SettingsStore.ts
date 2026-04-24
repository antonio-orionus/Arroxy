import fs from 'node:fs/promises';
import path from 'node:path';
import type { AppSettings } from '@shared/types';

export class SettingsStore {
  private readonly filePath: string;

  private readonly defaults: AppSettings;

  constructor(userDataPath: string, defaults: AppSettings) {
    this.filePath = path.join(userDataPath, 'settings.json');
    this.defaults = defaults;
  }

  async get(): Promise<AppSettings> {
    const data = await this.read();
    return {
      ...this.defaults,
      ...data
    };
  }

  async update(next: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const merged = {
      ...current,
      ...next
    };
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  }

  private async read(): Promise<Partial<AppSettings>> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return parsed;
    } catch {
      return {};
    }
  }
}
