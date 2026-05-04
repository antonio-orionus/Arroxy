import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { QueueStore } from '@main/stores/QueueStore';
import { makeItem } from '../shared/fixtures';

async function tempStore(): Promise<[QueueStore, string]> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-store-'));
  return [new QueueStore(dir), dir];
}

async function loadOk(store: QueueStore) {
  const result = await store.load();
  if (!result.ok) throw new Error(`expected ok, got fail: ${result.error.message}`);
  return result.data;
}

describe('QueueStore', () => {
  it('returns empty array when no file exists', async () => {
    const [store] = await tempStore();
    expect(await loadOk(store)).toEqual([]);
  });

  it('round-trips pending items unchanged', async () => {
    const [store] = await tempStore();
    const item = makeItem({ id: 'a', status: 'pending' });
    await store.save([item]);

    const loaded = await loadOk(store);
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
      finishedAt: '2024-01-01T12:00:00.000Z'
    });
    await store.save([item]);

    const loaded = await loadOk(store);
    expect(loaded[0].status).toBe('done');
    expect(loaded[0].progressPercent).toBe(100);
    expect(loaded[0].finishedAt).toBe('2024-01-01T12:00:00.000Z');
  });

  it('round-trips error items with error preserved', async () => {
    const [store] = await tempStore();
    const item = makeItem({
      id: 'c',
      status: 'error',
      error: { key: null, rawMessage: 'Network error' }
    });
    await store.save([item]);

    const loaded = await loadOk(store);
    expect(loaded[0].status).toBe('error');
    expect(loaded[0].error?.rawMessage).toBe('Network error');
  });

  it('normalizes downloading → pending and resets progress', async () => {
    const [store] = await tempStore();
    const item = makeItem({
      id: 'd',
      status: 'downloading',
      progressPercent: 67,
      progressDetail: '4.5MiB/s ETA 00:10',
      downloadJobId: 'job-xyz'
    });
    await store.save([item]);

    const loaded = await loadOk(store);
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
      downloadJobId: 'job-abc'
    });
    await store.save([item]);

    const loaded = await loadOk(store);
    expect(loaded[0].status).toBe('paused');
    expect(loaded[0].progressPercent).toBe(0);
    expect(loaded[0].progressDetail).toBeNull();
    expect(loaded[0].downloadJobId).toBeNull();
  });

  it('excludes cancelled items from save', async () => {
    const [store] = await tempStore();
    await store.save([makeItem({ id: 'keep', status: 'pending' }), makeItem({ id: 'drop', status: 'cancelled' })]);

    const loaded = await loadOk(store);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('keep');
  });

  it('always sets downloadJobId to null on load', async () => {
    const [store, dir] = await tempStore();
    const raw = [makeItem({ id: 'f', status: 'pending', downloadJobId: 'stale-job' })];
    await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({ items: raw }), 'utf-8');

    const loaded = await loadOk(store);
    expect(loaded[0].downloadJobId).toBeNull();
  });

  it('overwrites previous save on subsequent saves', async () => {
    const [store] = await tempStore();
    await store.save([makeItem({ id: 'first', status: 'pending' })]);
    await store.save([makeItem({ id: 'second', status: 'done', progressPercent: 100 })]);

    const loaded = await loadOk(store);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('second');
  });

  it('resets to empty queue when startup file is corrupt JSON (clearInvalidConfig repairs on construction)', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-store-'));
    await fs.writeFile(path.join(dir, 'queue.json'), 'not valid json', 'utf-8');
    const store = new QueueStore(dir);

    expect(await loadOk(store)).toEqual([]);
  });

  it('returns validation failure for non-array JSON (no silent recovery)', async () => {
    const [store, dir] = await tempStore();
    await fs.writeFile(path.join(dir, 'queue.json'), '{"not": "an array"}', 'utf-8');

    const result = await store.load();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('validation');
      expect(result.error.message).toMatch(/corrupted/i);
    }
  });
});
