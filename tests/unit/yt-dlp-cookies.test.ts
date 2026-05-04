import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DownloadService } from '@main/services/DownloadService';
import { YtDlp } from '@main/services/YtDlp';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
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

function makeService(settings: Record<string, unknown>) {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'tok', visitorData: 'vd' }),
    invalidateCache: vi.fn()
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue(null),
    ensureFFprobe: vi.fn().mockResolvedValue(null)
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const settingsStore = { get: vi.fn().mockResolvedValue(settings) };

  const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
  const service = new DownloadService(ytDlp, recentJobsStore as never);

  return { service };
}

const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('cookies flag injection', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never);
  });

  it('passes --cookies <path> when toggle is on and path is set', async () => {
    const { service } = makeService({ cookiesEnabled: true, cookiesPath: '/home/u/cookies.txt' });

    await service.start({ url: URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 50));

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    const idx = args.indexOf('--cookies');
    expect(idx).toBeGreaterThan(-1);
    expect(args[idx + 1]).toBe('/home/u/cookies.txt');
    // Lives next to --extractor-args (token), not at the end
    expect(idx).toBeLessThan(args.indexOf(URL));
  });

  it('omits --cookies when toggle is off, even if path is set', async () => {
    const { service } = makeService({ cookiesEnabled: false, cookiesPath: '/home/u/cookies.txt' });

    await service.start({ url: URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 50));

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    expect(args).not.toContain('--cookies');
  });

  it('omits --cookies when toggle is on but path is empty/whitespace', async () => {
    const { service } = makeService({ cookiesEnabled: true, cookiesPath: '   ' });

    await service.start({ url: URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 50));

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    expect(args).not.toContain('--cookies');
  });

  it('omits --cookies when both fields are absent', async () => {
    const { service } = makeService({});

    await service.start({ url: URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 50));

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    expect(args).not.toContain('--cookies');
  });
});
