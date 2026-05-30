// @vitest-environment node
//
// Lifecycle integration tests for QueueService + QueueStore. The "quit and
// reload" boundary is simulated by constructing a fresh QueueService instance
// pointing at the same userData dir — same as a cold boot. DownloadService is
// faked so no real yt-dlp / ffmpeg processes spawn, but persistence is real:
// each `pauseAll` / `cancelAll` / per-item commit lands in `queue.json` and
// the second instance reads it back.
//
// These cover full user sequences that are painful to verify by hand:
//   - quit-with-pause survives restart (no auto-spawn)
//   - quit-with-pause + resumeAll on next boot re-spawns with tempDir
//   - cancel-all clears the persisted pause flag
//   - cancel single paused item leaves the queue paused
//   - quit without pause auto-spawns the demoted-pending head on reload
//   - priority lane spawn respects the ceiling on cold boot
//   - normal completion + restart picks up the next pending after sleep window

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { QueueService } from '@main/services/QueueService.js';
import { QueueStore } from '@main/stores/QueueStore.js';
import type { DownloadService } from '@main/services/DownloadService.js';
import { ok } from '@shared/result.js';
import { makeItem } from '../shared/fixtures.js';

class FakeDownloadService extends EventEmitter {
  start = vi.fn();
  cancel = vi.fn();
  pause = vi.fn();
  resume = vi.fn();
}

function jobResult(jobId = `job-${Math.random().toString(36).slice(2)}`) {
  return ok({ job: { id: jobId, url: '', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
}

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

async function tempUserData(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'queue-lifecycle-'));
}

// `boot` simulates the main-process startup wiring: fresh DownloadService, a
// fresh QueueStore pointed at the persisted dir, and a fresh QueueService
// that calls init() to hydrate from disk.
async function boot(dir: string, normalCap = 1, ceiling = 4) {
  const ds = new FakeDownloadService();
  // Default behavior: every start succeeds with a stable jobId derived from
  // the call count so the test can attribute downstream events. Tests can
  // override per scenario.
  let n = 0;
  ds.start.mockImplementation(() => Promise.resolve(jobResult(`job-${++n}`)));
  ds.pause.mockResolvedValue(ok({ paused: true, tempDir: '/tmp/.arroxy-temp/sim' }));
  ds.resume.mockResolvedValue(ok({ resumed: true }));
  ds.cancel.mockResolvedValue(ok({ cancelled: true }));

  const store = new QueueStore(dir);
  const qs = new QueueService(store, ds as unknown as DownloadService, normalCap, ceiling);
  await qs.init();
  // Wait one tick so init's recomputeSchedule has a chance to fire spawn()s.
  await flushMicrotasks();
  return { qs, ds, store };
}

describe('queue lifecycle — quit and reload', () => {
  it('add 4 → pauseAll → quit/reload — queue stays paused, nothing auto-spawns', async () => {
    const dir = await tempUserData();
    const first = await boot(dir);
    first.qs.add([makeItem({ id: 'a', status: 'pending' }), makeItem({ id: 'b', status: 'pending' }), makeItem({ id: 'c', status: 'pending' }), makeItem({ id: 'd', status: 'pending' })]);
    await vi.waitFor(() => expect(first.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('running'));
    await first.qs.pauseAll();
    expect(first.qs.schedulerIsPaused()).toBe(true);
    // Give the trailing `persist()` a chance to flush.
    await flushMicrotasks();

    // ──────── simulate quit + reload ────────
    const second = await boot(dir);

    expect(second.qs.schedulerIsPaused()).toBe(true);
    expect(second.ds.start).not.toHaveBeenCalled();
    const snap = second.qs.snapshot();
    expect(snap.find((i) => i.id === 'a')?.status).toBe('paused-active');
    expect(snap.filter((i) => i.status === 'pending')).toHaveLength(3);
  });

  it('add 4 → pauseAll → quit/reload → resumeAll — first item re-spawns with persisted tempDir', async () => {
    const dir = await tempUserData();
    const first = await boot(dir);
    first.ds.pause.mockResolvedValue(ok({ paused: true, tempDir: '/tmp/.arroxy-temp/keep-me' }));
    first.qs.add([makeItem({ id: 'a', status: 'pending' }), makeItem({ id: 'b', status: 'pending' }), makeItem({ id: 'c', status: 'pending' }), makeItem({ id: 'd', status: 'pending' })]);
    await vi.waitFor(() => expect(first.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('running'));
    await first.qs.pauseAll();
    await flushMicrotasks();

    const second = await boot(dir);
    expect(second.qs.snapshot().find((i) => i.id === 'a')?.tempDir).toBe('/tmp/.arroxy-temp/keep-me');

    await second.qs.resumeAll();
    await flushMicrotasks();

    expect(second.qs.schedulerIsPaused()).toBe(false);
    expect(second.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('running');
    // Re-spawn must thread the persisted tempDir so yt-dlp picks up .part files.
    expect(second.ds.start).toHaveBeenCalledTimes(1);
    expect(second.ds.start.mock.calls[0]?.[0]).toMatchObject({ tempDir: '/tmp/.arroxy-temp/keep-me' });
    // cap=1 means b/c/d stay pending.
    expect(second.qs.snapshot().filter((i) => i.status === 'pending')).toHaveLength(3);
  });

  it('add 4 → pauseAll → cancelAll → quit/reload — empty queue, not paused, fresh adds auto-spawn', async () => {
    const dir = await tempUserData();
    const first = await boot(dir);
    first.qs.add([makeItem({ id: 'a', status: 'pending' }), makeItem({ id: 'b', status: 'pending' })]);
    await vi.waitFor(() => expect(first.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('running'));
    await first.qs.pauseAll();
    await first.qs.cancel(null);
    await flushMicrotasks();

    const second = await boot(dir);
    expect(second.qs.schedulerIsPaused()).toBe(false);
    // Cancelled items are not persisted at all.
    expect(second.qs.snapshot()).toHaveLength(0);

    // Fresh add on the reloaded instance auto-spawns.
    second.qs.add([makeItem({ id: 'fresh', status: 'pending' })]);
    await vi.waitFor(() => expect(second.ds.start).toHaveBeenCalledOnce());
    expect(second.qs.snapshot()[0].status).toBe('running');
  });

  it('add 4 → pauseAll → cancel single paused-active item → quit/reload — queue still paused, others survive', async () => {
    const dir = await tempUserData();
    const first = await boot(dir);
    first.qs.add([makeItem({ id: 'a', status: 'pending' }), makeItem({ id: 'b', status: 'pending' }), makeItem({ id: 'c', status: 'pending' })]);
    await vi.waitFor(() => expect(first.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('running'));
    await first.qs.pauseAll();
    // Cancel just the previously-running item.
    await first.qs.cancel('a');
    await flushMicrotasks();

    const second = await boot(dir);
    expect(second.qs.schedulerIsPaused()).toBe(true);
    // a is cancelled → stripped on save. b + c persist as pending.
    expect(second.ds.start).not.toHaveBeenCalled();
    expect(second.qs.snapshot().every((i) => i.status === 'pending')).toBe(true);
    expect(second.qs.snapshot()).toHaveLength(2);
  });

  it('add 4 → quit without pausing → reload demotes running → auto-spawns the head', async () => {
    const dir = await tempUserData();
    const first = await boot(dir);
    first.qs.add([makeItem({ id: 'a', status: 'pending' }), makeItem({ id: 'b', status: 'pending' })]);
    await vi.waitFor(() => expect(first.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('running'));
    // No pauseAll — just leave the queue running and "quit" (drop the
    // instance). QueueStore.save already demoted 'a' running→pending on the
    // last persist.
    await flushMicrotasks();

    const second = await boot(dir);
    expect(second.qs.schedulerIsPaused()).toBe(false);
    // First pending picks up automatically on boot.
    await vi.waitFor(() => expect(second.ds.start).toHaveBeenCalledOnce());
    expect(second.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('running');
    expect(second.qs.snapshot().find((i) => i.id === 'b')?.status).toBe('pending');
  });

  it('priority + normal mix → pauseAll → quit/reload → resumeAll — ceiling honored on reboot resume', async () => {
    const dir = await tempUserData();
    const first = await boot(dir, 1, 2); // ceiling=2 for a tight test
    first.qs.add([makeItem({ id: 'p1', status: 'pending', lane: 'priority' }), makeItem({ id: 'p2', status: 'pending', lane: 'priority' }), makeItem({ id: 'p3', status: 'pending', lane: 'priority' }), makeItem({ id: 'n1', status: 'pending', lane: 'normal' })]);
    await vi.waitFor(() => expect(first.ds.start).toHaveBeenCalledTimes(2));
    await first.qs.pauseAll();
    await flushMicrotasks();

    const second = await boot(dir, 1, 2);
    expect(second.qs.schedulerIsPaused()).toBe(true);
    expect(second.ds.start).not.toHaveBeenCalled();

    await second.qs.resumeAll();
    await flushMicrotasks();

    expect(second.qs.snapshot().filter((i) => i.status === 'running')).toHaveLength(2);
    // p3 + n1 stay pending — ceiling=2 holds them back.
    expect(second.qs.snapshot().filter((i) => i.status === 'pending')).toHaveLength(2);
  });
});

describe('queue lifecycle — completion + restart', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('first item completes after restart → sleep window armed → next pending spawns', async () => {
    const dir = await tempUserData();
    const first = await boot(dir);
    first.qs.add([makeItem({ id: 'a', status: 'pending' }), makeItem({ id: 'b', status: 'pending' })]);
    await flushMicrotasks();
    // Just quit without doing anything — 'a' was mid-spawn on first instance.
    await flushMicrotasks();

    const second = await boot(dir);
    // 'a' demoted to pending on save → second boot picks it up. Wait for spawn.
    await flushMicrotasks();
    expect(second.ds.start).toHaveBeenCalledTimes(1);
    // boot()'s mock factory generates 'job-1', 'job-2', ... per call. Use the
    // deterministic name rather than reading mock.results (which holds the
    // unresolved Promise object, not the resolved data).
    const firstJobId = 'job-1';

    // Complete first job → sleep window armed.
    second.ds.emit('status', { jobId: firstJobId, stage: 'done', statusKey: 'complete', at: new Date().toISOString() });
    await flushMicrotasks();
    expect(second.qs.snapshot().find((i) => i.id === 'a')?.status).toBe('done');
    expect(second.qs.snapshot().find((i) => i.id === 'b')?.status).toBe('pending');

    // After sleep window, next pending spawns.
    await vi.advanceTimersByTimeAsync(600);
    await flushMicrotasks();
    expect(second.ds.start).toHaveBeenCalledTimes(2);
    expect(second.qs.snapshot().find((i) => i.id === 'b')?.status).toBe('running');
  });
});
