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
      rememberLastOutputDir: true,
      clipboardWatchEnabled: false
    });

    const updated = await store.update({ defaultOutputDir: '/home/test/downloads' });
    expect(updated.defaultOutputDir).toBe('/home/test/downloads');

    const readBack = await store.get();
    expect(readBack.defaultOutputDir).toBe('/home/test/downloads');
  });

  it('persists subtitle language preferences', async () => {
    const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-subs-'));
    const store = new SettingsStore(userData, {
      defaultOutputDir: '/tmp',
      rememberLastOutputDir: true,
      clipboardWatchEnabled: false
    });

    const updated = await store.update({ lastSubtitleLanguages: ['en', 'es'] });
    expect(updated.lastSubtitleLanguages).toEqual(['en', 'es']);

    const readBack = await store.get();
    expect(readBack.lastSubtitleLanguages).toEqual(['en', 'es']);
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
      error: { key: null, rawMessage: 'boom' }
    });

    const list = await store.list();
    expect(list[0].id).toBe('2');
    expect(list[1].id).toBe('1');
  });

  it('handles concurrent push() calls — push is synchronous so both jobs land without interleaving', async () => {
    const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-concurrent-'));
    const store = new RecentJobsStore(userData);

    await Promise.all([
      store.push({
        id: 'job-a',
        url: 'https://youtu.be/a',
        outputDir: '/tmp',
        status: 'completed',
        finishedAt: '2024-01-01T00:00:00.000Z'
      }),
      store.push({
        id: 'job-b',
        url: 'https://youtu.be/b',
        outputDir: '/tmp',
        status: 'completed',
        finishedAt: '2024-01-02T00:00:00.000Z'
      })
    ]);

    const list = await store.list();
    expect(list).toHaveLength(2);
    expect(list.map((j) => j.id)).toContain('job-a');
    expect(list.map((j) => j.id)).toContain('job-b');
  });

  it('returns defaults when settings.json is corrupted', async () => {
    const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-corrupt-'));
    await fs.writeFile(path.join(userData, 'settings.json'), 'not valid json', 'utf-8');
    const store = new SettingsStore(userData, {
      defaultOutputDir: '/tmp',
      rememberLastOutputDir: true,
      clipboardWatchEnabled: false
    });

    const settings = await store.get();
    expect(settings.defaultOutputDir).toBe('/tmp');
  });

  it('returns empty list when recent-jobs.json is corrupted', async () => {
    const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-corrupt-'));
    await fs.writeFile(path.join(userData, 'recent-jobs.json'), 'not valid json', 'utf-8');
    const store = new RecentJobsStore(userData);

    expect(await store.list()).toEqual([]);
  });
});
