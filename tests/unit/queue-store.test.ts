import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { QueueStore } from '@main/stores/QueueStore';
import { makeItem } from '../shared/fixtures';

async function tempStore(): Promise<[QueueStore, string]> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-store-'));
  return [new QueueStore(dir), dir];
}

describe('QueueStore', () => {
  it('returns empty array when no file exists', async () => {
    const [store] = await tempStore();
    expect(await store.load()).toEqual([]);
  });

  it('round-trips pending items unchanged', async () => {
    const [store] = await tempStore();
    const item = makeItem({ id: 'a', status: 'pending' });
    await store.save([item]);

    const loaded = await store.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('a');
    expect(loaded[0].status).toBe('pending');
    expect(loaded[0].progressPercent).toBe(0);
  });

  it('round-trips done items with progress and finishedAt preserved', async () => {
    const [store] = await tempStore();
    const item = makeItem({
      id: 'b',
      status: 'done',
      progressPercent: 100,
      finishedAt: '2024-01-01T12:00:00.000Z',
    });
    await store.save([item]);

    const loaded = await store.load();
    expect(loaded[0].status).toBe('done');
    expect(loaded[0].progressPercent).toBe(100);
    expect(loaded[0].finishedAt).toBe('2024-01-01T12:00:00.000Z');
  });

  it('round-trips error items with errorMessage preserved', async () => {
    const [store] = await tempStore();
    const item = makeItem({ id: 'c', status: 'error', errorMessage: 'Network error' });
    await store.save([item]);

    const loaded = await store.load();
    expect(loaded[0].status).toBe('error');
    expect(loaded[0].errorMessage).toBe('Network error');
  });

  it('normalizes downloading → pending and resets progress', async () => {
    const [store] = await tempStore();
    const item = makeItem({
      id: 'd',
      status: 'downloading',
      progressPercent: 67,
      progressDetail: '4.5MiB/s ETA 00:10',
      downloadJobId: 'job-xyz',
    });
    await store.save([item]);

    const loaded = await store.load();
    expect(loaded[0].status).toBe('pending');
    expect(loaded[0].progressPercent).toBe(0);
    expect(loaded[0].progressDetail).toBeNull();
    expect(loaded[0].downloadJobId).toBeNull();
  });

  it('keeps paused status and resets progress (user-paused survives reload)', async () => {
    const [store] = await tempStore();
    const item = makeItem({
      id: 'e',
      status: 'paused',
      progressPercent: 40,
      progressDetail: '1.2MiB/s',
      downloadJobId: 'job-abc',
    });
    await store.save([item]);

    const loaded = await store.load();
    expect(loaded[0].status).toBe('paused');
    expect(loaded[0].progressPercent).toBe(0);
    expect(loaded[0].progressDetail).toBeNull();
    expect(loaded[0].downloadJobId).toBeNull();
  });

  it('excludes cancelled items from save', async () => {
    const [store] = await tempStore();
    await store.save([
      makeItem({ id: 'keep', status: 'pending' }),
      makeItem({ id: 'drop', status: 'cancelled' }),
    ]);

    const loaded = await store.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('keep');
  });

  it('always sets downloadJobId to null on load', async () => {
    const [store, dir] = await tempStore();
    // Write raw JSON with a non-null downloadJobId to simulate corrupted/legacy data
    const raw = [makeItem({ id: 'f', status: 'pending', downloadJobId: 'stale-job' })];
    await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify(raw), 'utf-8');

    const loaded = await store.load();
    expect(loaded[0].downloadJobId).toBeNull();
  });

  it('overwrites previous save on subsequent saves', async () => {
    const [store] = await tempStore();
    await store.save([makeItem({ id: 'first', status: 'pending' })]);
    await store.save([makeItem({ id: 'second', status: 'done', progressPercent: 100 })]);

    const loaded = await store.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('second');
  });

  it('handles corrupted JSON gracefully', async () => {
    const [store, dir] = await tempStore();
    await fs.writeFile(path.join(dir, 'queue.json'), 'not valid json', 'utf-8');
    expect(await store.load()).toEqual([]);
  });

  it('handles non-array JSON gracefully', async () => {
    const [store, dir] = await tempStore();
    await fs.writeFile(path.join(dir, 'queue.json'), '{"not": "an array"}', 'utf-8');
    expect(await store.load()).toEqual([]);
  });

  it('logs an error to console when queue.json is corrupted', async () => {
    const [store, dir] = await tempStore();
    await fs.writeFile(path.join(dir, 'queue.json'), 'not valid json', 'utf-8');

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await store.load();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatch(/Failed to load queue/);
    spy.mockRestore();
  });
});
