import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { RecentJobsStore } from '@main/stores/RecentJobsStore';
import { SettingsStore } from '@main/stores/SettingsStore';

describe('settings and recent stores', () => {
  it('persists settings updates', async () => {
    const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-'));
    const store = new SettingsStore(userData, {
      defaultOutputDir: '/tmp',
      rememberLastOutputDir: true
    });

    const updated = await store.update({ defaultOutputDir: '/home/test/downloads' });
    expect(updated.defaultOutputDir).toBe('/home/test/downloads');

    const readBack = await store.get();
    expect(readBack.defaultOutputDir).toBe('/home/test/downloads');
  });

  it('keeps recent jobs bounded and sorted', async () => {
    const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-'));
    const store = new RecentJobsStore(userData);

    await store.push({
      id: '1',
      url: 'https://youtu.be/a',
      outputDir: '/tmp',
      status: 'completed',
      finishedAt: '2024-01-01T00:00:00.000Z'
    });

    await store.push({
      id: '2',
      url: 'https://youtu.be/b',
      outputDir: '/tmp',
      status: 'failed',
      finishedAt: '2024-01-02T00:00:00.000Z',
      errorMessage: 'boom'
    });

    const list = await store.list();
    expect(list[0].id).toBe('2');
    expect(list[1].id).toBe('1');
  });
});
