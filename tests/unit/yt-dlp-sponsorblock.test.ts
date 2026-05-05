import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DownloadService } from '@main/services/DownloadService';
import { YtDlp } from '@main/services/YtDlp';
import type { StatusEvent } from '@shared/types';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn(), spawnFFmpeg: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeFakeProcess(exitCode: number) {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn()
  });
  setTimeout(() => proc.emit('close', exitCode), 10);
  return proc;
}

function makeService() {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'tok', visitorData: 'vis' }),
    invalidateCache: vi.fn()
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue(null),
    ensureFFprobe: vi.fn().mockResolvedValue(null)
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const settingsStore = { get: vi.fn().mockResolvedValue({}) };
  const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
  const service = new DownloadService(ytDlp, recentJobsStore as never, false);
  return service;
}

function waitForDone(service: DownloadService): Promise<void> {
  return new Promise((resolve) => {
    function handler(event: StatusEvent) {
      if (event.stage === 'done' || event.stage === 'error') {
        service.off('status', handler);
        resolve();
      }
    }
    service.on('status', handler);
  });
}

function callArgs(callIndex = 0): string[] {
  return vi.mocked(spawnYtDlp).mock.calls[callIndex][1];
}

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('SponsorBlock — yt-dlp arg injection', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('adds --sponsorblock-mark for mark mode (--embed-chapters is a separate setting)', async () => {
    const service = makeService();
    const done = waitForDone(service);
    await service.start({
      url: YOUTUBE_URL,
      outputDir: '/tmp',
      formatId: '137+251',
      sponsorBlockMode: 'mark',
      sponsorBlockCategories: ['sponsor', 'selfpromo']
    });
    await done;

    const args = callArgs(0);
    expect(args).toContain('--sponsorblock-mark');
    expect(args[args.indexOf('--sponsorblock-mark') + 1]).toBe('sponsor,selfpromo');
    expect(args).not.toContain('--embed-chapters');
    expect(args).not.toContain('--sponsorblock-remove');
  });

  it('adds --sponsorblock-remove for remove mode (no --embed-chapters)', async () => {
    const service = makeService();
    const done = waitForDone(service);
    await service.start({
      url: YOUTUBE_URL,
      outputDir: '/tmp',
      formatId: '137+251',
      sponsorBlockMode: 'remove',
      sponsorBlockCategories: ['sponsor', 'intro', 'outro']
    });
    await done;

    const args = callArgs(0);
    expect(args).toContain('--sponsorblock-remove');
    expect(args[args.indexOf('--sponsorblock-remove') + 1]).toBe('sponsor,intro,outro');
    expect(args).not.toContain('--embed-chapters');
    expect(args).not.toContain('--sponsorblock-mark');
  });

  it('omits all SponsorBlock flags when mode is off', async () => {
    const service = makeService();
    const done = waitForDone(service);
    await service.start({
      url: YOUTUBE_URL,
      outputDir: '/tmp',
      formatId: '137+251',
      sponsorBlockMode: 'off',
      sponsorBlockCategories: ['sponsor']
    });
    await done;

    const args = callArgs(0);
    expect(args).not.toContain('--sponsorblock-mark');
    expect(args).not.toContain('--sponsorblock-remove');
    expect(args).not.toContain('--embed-chapters');
  });

  it('omits all SponsorBlock flags when categories is empty', async () => {
    const service = makeService();
    const done = waitForDone(service);
    await service.start({
      url: YOUTUBE_URL,
      outputDir: '/tmp',
      formatId: '137+251',
      sponsorBlockMode: 'mark',
      sponsorBlockCategories: []
    });
    await done;

    const args = callArgs(0);
    expect(args).not.toContain('--sponsorblock-mark');
    expect(args).not.toContain('--embed-chapters');
  });

  it('omits SponsorBlock flags when no config is passed', async () => {
    const service = makeService();
    const done = waitForDone(service);
    await service.start({
      url: YOUTUBE_URL,
      outputDir: '/tmp',
      formatId: '137+251'
    });
    await done;

    const args = callArgs(0);
    expect(args).not.toContain('--sponsorblock-mark');
    expect(args).not.toContain('--sponsorblock-remove');
    expect(args).not.toContain('--embed-chapters');
  });

  it('does NOT add SponsorBlock flags to the subtitle-phase invocation', async () => {
    const service = makeService();
    const done = waitForDone(service);
    await service.start({
      url: YOUTUBE_URL,
      outputDir: '/tmp',
      formatId: '137+251',
      subtitleLanguages: ['en'],
      sponsorBlockMode: 'remove',
      sponsorBlockCategories: ['sponsor']
    });
    await done;

    // Two spawns: phase 1 (video) and phase 2 (subs)
    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(2);
    const phase2Args = callArgs(1);
    expect(phase2Args).not.toContain('--sponsorblock-remove');
    expect(phase2Args).not.toContain('--sponsorblock-mark');
  });

  it('does NOT add SponsorBlock flags when formatId is absent (subtitle-only download)', async () => {
    const service = makeService();
    const done = waitForDone(service);
    await service.start({
      url: YOUTUBE_URL,
      outputDir: '/tmp',
      subtitleLanguages: ['en'],
      sponsorBlockMode: 'mark',
      sponsorBlockCategories: ['sponsor']
    });
    await done;

    // Only one spawn for subtitle-only
    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
    const args = callArgs(0);
    expect(args).not.toContain('--sponsorblock-mark');
  });
});
