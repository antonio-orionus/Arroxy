import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LogService } from '@main/services/LogService';
import type { BinaryManager } from '@main/services/BinaryManager';
import type { TokenService } from '@main/services/TokenService';
import type { RecentJobsStore } from '@main/stores/RecentJobsStore';

// Must be top-level (Vitest hoists vi.mock calls)
vi.mock('@main/utils/process');

import { spawnYtDlp } from '@main/utils/process';
import { DownloadService } from '@main/services/DownloadService';

class FakeProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = vi.fn();
}

function makeStubs() {
  const logger = { log: vi.fn() } as unknown as LogService;
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue(null),
  } as unknown as BinaryManager;
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'tok', visitorData: 'vd' }),
    invalidateCache: vi.fn(),
  } as unknown as TokenService;
  const recentJobsStore = {
    push: vi.fn().mockResolvedValue(undefined),
  } as unknown as RecentJobsStore;
  const settingsStore = {
    get: vi.fn().mockResolvedValue({}),
  } as never;
  return { logger, binaryManager, tokenService, recentJobsStore, settingsStore };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DownloadService stdout/stderr crash safety', () => {
  it('stdout data handler swallows exceptions from consumeProgress', async () => {
    const stubs = makeStubs();
    const svc = new DownloadService(
      stubs.binaryManager, stubs.tokenService, stubs.recentJobsStore, stubs.logger, stubs.settingsStore
    );

    const fakeProc = new FakeProcess();
    vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as any);
    vi.spyOn(svc as any, 'consumeProgress').mockImplementation(() => {
      throw new Error('disk full');
    });

    // start() registers handlers synchronously in spawnProcess, then returns
    await svc.start({ url: 'https://youtube.com/watch?v=test', outputDir: '/tmp', formatId: 'x' });

    expect(() => {
      fakeProc.stdout.emit('data', Buffer.from('[download] 50% of 10MiB'));
    }).not.toThrow();
  });

  it('stderr data handler swallows exceptions from consumeProgress', async () => {
    const stubs = makeStubs();
    const svc = new DownloadService(
      stubs.binaryManager, stubs.tokenService, stubs.recentJobsStore, stubs.logger, stubs.settingsStore
    );

    const fakeProc = new FakeProcess();
    vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as any);
    vi.spyOn(svc as any, 'consumeProgress').mockImplementation(() => {
      throw new Error('disk full');
    });

    await svc.start({ url: 'https://youtube.com/watch?v=test', outputDir: '/tmp', formatId: 'x' });

    expect(() => {
      fakeProc.stderr.emit('data', Buffer.from('ERROR: some yt-dlp error line'));
    }).not.toThrow();
  });

  it('active job count is still correct after a crash in the stdout handler', async () => {
    const stubs = makeStubs();
    const svc = new DownloadService(
      stubs.binaryManager, stubs.tokenService, stubs.recentJobsStore, stubs.logger, stubs.settingsStore
    );

    const fakeProc = new FakeProcess();
    vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as any);
    vi.spyOn(svc as any, 'consumeProgress').mockImplementation(() => {
      throw new Error('write error');
    });

    const result = await svc.start({ url: 'https://youtube.com/watch?v=test', outputDir: '/tmp', formatId: 'x' });
    expect(result.ok).toBe(true);
    expect(svc.activeCount).toBe(1);

    // Crash in handler — job should still be tracked
    fakeProc.stdout.emit('data', Buffer.from('some line'));
    expect(svc.activeCount).toBe(1);
  });
});
