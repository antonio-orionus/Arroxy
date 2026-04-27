import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DownloadService } from '@main/services/DownloadService';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process';

beforeEach(() => { vi.clearAllMocks(); });

function makeFakeProcess(exitCode: number, stderr = '') {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn()
  });
  setTimeout(() => {
    if (stderr) proc.stderr.emit('data', Buffer.from(stderr));
    proc.emit('close', exitCode);
  }, 10);
  return proc;
}

import type { StatusEvent, StatusKey } from '@shared/types';

function captureStatuses(service: { on: (e: 'status', cb: (e: StatusEvent) => void) => void }): StatusEvent[] {
  const events: StatusEvent[] = [];
  service.on('status', (e) => events.push(e));
  return events;
}

function statusKeys(events: StatusEvent[]): StatusKey[] {
  return events.map((e) => e.statusKey);
}

function makeService() {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'mock-token', visitorData: 'mock-visitor' }),
    invalidateCache: vi.fn()
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg')
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const logService = { log: vi.fn() };
  const service = new DownloadService(
    binaryManager as never, tokenService as never, recentJobsStore as never, logService as never, false
  );
  return { service, recentJobsStore };
}

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function callArgs(callIndex: number): string[] {
  return vi.mocked(spawnYtDlp).mock.calls[callIndex][1] as string[];
}

describe('DownloadService — split video/subtitle invocations', () => {
  beforeEach(() => {
    // Each spawn gets its own fresh process (each phase is a separate yt-dlp invocation)
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('phase 1 (video) never carries subtitle flags', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en', 'es'], writeAutoSubs: true });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('--no-write-subs');
    expect(args).toContain('--no-write-auto-subs');
    expect(args).not.toContain('--write-subs');
    expect(args).not.toContain('--write-auto-subs');
    expect(args).not.toContain('--sub-langs');
    expect(args).not.toContain('--sleep-subtitles');
  });

  it('phase 2 (subtitles) runs only when languages are selected', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(2);
    const args = callArgs(1);
    expect(args).toContain('--skip-download');
    expect(args).toContain('--write-subs');
    expect(args).toContain('--sub-langs');
    expect(args[args.indexOf('--sub-langs') + 1]).toBe('en');
  });

  it('phase 2 includes --write-auto-subs when writeAutoSubs is true', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en-orig'], writeAutoSubs: true });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args).toContain('--write-auto-subs');
  });

  it('phase 2 omits --write-auto-subs when writeAutoSubs is false', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'], writeAutoSubs: false });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args).not.toContain('--write-auto-subs');
  });

  it('phase 2 includes --sleep-subtitles 3 (rate-limit protection)', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args).toContain('--sleep-subtitles');
    expect(args[args.indexOf('--sleep-subtitles') + 1]).toBe('3');
  });

  it('only phase 1 runs when no subtitles are requested', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
  });

  it('only phase 1 runs when subtitleLanguages is empty', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: [], writeAutoSubs: true });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
  });

  it('phase 1 always includes -f and -o', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('-f');
    expect(args[args.indexOf('-f') + 1]).toBe('137+251');
    expect(args).toContain('-o');
    expect(args).toContain(YOUTUBE_URL);
  });

  it('does NOT run phase 2 when phase 1 fails', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(1) as never);

    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
  });
});

describe('DownloadService — status events', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('emits complete (stage=done) when phase 2 succeeds', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    const final = events[events.length - 1];
    expect(final.statusKey).toBe('complete');
    expect(final.stage).toBe('done');
  });

  it('emits subtitlesFailed (stage=done) when phase 2 fails — and never emits complete after', async () => {
    let callIndex = 0;
    vi.mocked(spawnYtDlp).mockImplementation(() => {
      const exitCode = callIndex === 0 ? 0 : 1;
      callIndex++;
      return makeFakeProcess(exitCode) as never;
    });

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    const final = events[events.length - 1];
    expect(final.statusKey).toBe('subtitlesFailed');
    expect(final.stage).toBe('done');
    expect(statusKeys(events)).not.toContain('complete');
  });

  it('records job as completed (not failed) when phase 2 fails', async () => {
    let callIndex = 0;
    vi.mocked(spawnYtDlp).mockImplementation(() => {
      const exitCode = callIndex === 0 ? 0 : 1;
      callIndex++;
      return makeFakeProcess(exitCode) as never;
    });

    const { service, recentJobsStore } = makeService();

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    expect(recentJobsStore.push).toHaveBeenCalledOnce();
    expect(recentJobsStore.push.mock.calls[0][0].status).toBe('completed');
  });

  it('emits sleepingBetweenRequests with rounded seconds when yt-dlp logs a sleep line', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[download] Sleeping 5.00 seconds ...\n') as never
    );

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    const sleepEvent = events.find((e) => e.statusKey === 'sleepingBetweenRequests');
    expect(sleepEvent).toBeDefined();
    expect(sleepEvent!.params).toEqual({ seconds: 5 });
  });

  it('rounds fractional sleep durations', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[youtube] Sleeping 3.7 seconds ...\n') as never
    );

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    const sleepEvent = events.find((e) => e.statusKey === 'sleepingBetweenRequests');
    expect(sleepEvent!.params).toEqual({ seconds: 4 });
  });

  it('emits mergingFormats when yt-dlp logs a [Merger] line', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[Merger] Merging formats into "/tmp/video.mp4"\n') as never
    );

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    expect(statusKeys(events)).toContain('mergingFormats');
  });

  it('emits downloadingMedia at phase 1 spawn and fetchingSubtitles at phase 2 spawn', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    const keys = statusKeys(events);
    const downloadingMediaIdx = keys.indexOf('downloadingMedia');
    const fetchingSubsIdx = keys.indexOf('fetchingSubtitles');

    expect(downloadingMediaIdx).toBeGreaterThanOrEqual(0);
    expect(fetchingSubsIdx).toBeGreaterThan(downloadingMediaIdx);
  });

  it('does not emit fetchingSubtitles when no subs are requested', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    expect(statusKeys(events)).not.toContain('fetchingSubtitles');
  });
});
