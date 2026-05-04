import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('@main/utils/process');

import { spawnYtDlp } from '@main/utils/process';
import { DownloadService } from '@main/services/DownloadService';
import { YtDlp } from '@main/services/YtDlp';

class FakeProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = vi.fn();
}

function makeStubs(binaryOverrides: Partial<{ ensureYtDlp: () => Promise<string> }> = {}) {
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue(null),
    ensureFFprobe: vi.fn().mockResolvedValue(null),
    ...binaryOverrides
  };
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'tok', visitorData: 'vd' }),
    invalidateCache: vi.fn()
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const logService = { log: vi.fn() };
  const settingsStore = { get: vi.fn().mockResolvedValue({}) };
  const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
  return { ytDlp, binaryManager, tokenService, recentJobsStore, logService, settingsStore };
}

const URL = 'https://www.youtube.com/watch?v=test';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('pendingCancelCount', () => {
  it('is 0 after cancel() even while process has not yet closed', async () => {
    const stubs = makeStubs();
    const fakeProc = new FakeProcess(); // never fires close
    vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as never);

    const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore as never, stubs.logService as never);

    await svc.start({ url: URL, outputDir: '/tmp' });
    expect(svc.activeCount).toBe(1);
    expect(svc.pendingCancelCount).toBe(1);

    await svc.cancel();
    // SIGKILL sent but close event not yet fired — job still in activeJobs
    expect(svc.activeCount).toBe(1);
    // cancelRequested is true so pendingCancelCount should be 0
    expect(svc.pendingCancelCount).toBe(0);
  });

  it('counts only jobs that have not been cancelled', async () => {
    const stubs = makeStubs();
    const proc1 = new FakeProcess();
    const proc2 = new FakeProcess();
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(proc1 as never)
      .mockReturnValueOnce(proc2 as never);

    const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore as never, stubs.logService as never);

    const [r1] = await Promise.all([svc.start({ url: URL, outputDir: '/tmp' }), svc.start({ url: URL, outputDir: '/tmp' })]);

    expect(svc.pendingCancelCount).toBe(2);

    const jobId1 = r1.ok ? r1.data.job.id : '';
    await svc.cancel(jobId1);

    expect(svc.activeCount).toBe(2); // both still in map (no close event)
    expect(svc.pendingCancelCount).toBe(1); // only one cancelled
  });
});

describe('process group kill on POSIX', () => {
  it('kills the process group (negative PID) on non-Windows', async () => {
    if (process.platform === 'win32') return;

    const stubs = makeStubs();
    const fakeProc = new FakeProcess() as FakeProcess & { pid: number };
    fakeProc.pid = 999;
    vi.mocked(spawnYtDlp).mockReturnValue(fakeProc as never);

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);

    const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore as never, stubs.logService as never);

    await svc.start({ url: URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 30)); // let setupTempDir + spawnYtDlp complete
    await svc.cancel();

    expect(killSpy).toHaveBeenCalledWith(-999, 'SIGKILL');
  });
});

describe('pre-spawn cancel emits status event', () => {
  it('emits error status when cancelled during binary setup', async () => {
    let resolveBinary!: (v: string) => void;
    const binaryHeld = new Promise<string>((resolve) => {
      resolveBinary = resolve;
    });

    const stubs = makeStubs({ ensureYtDlp: vi.fn().mockReturnValue(binaryHeld) });
    const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore as never, stubs.logService as never);

    const statuses: { stage: string; statusKey: string }[] = [];
    svc.on('status', (ev) => statuses.push({ stage: ev.stage, statusKey: ev.statusKey }));

    const startPromise = svc.start({ url: URL, outputDir: '/tmp' });

    // Cancel while binary setup is pending
    await svc.cancel();

    // Let the binary setup resolve so the cancel-check in start() runs
    resolveBinary('/fake/yt-dlp');
    await startPromise;

    const cancelEvent = statuses.find((s) => s.stage === 'error' && s.statusKey === 'cancelled');
    expect(cancelEvent).toBeDefined();
  });

  it('emits error status when cancelled during token mint', async () => {
    let resolveToken!: (v: { token: string; visitorData: string }) => void;
    const tokenHeld = new Promise<{ token: string; visitorData: string }>((resolve) => {
      resolveToken = resolve;
    });

    const stubs = makeStubs();
    stubs.tokenService.mintTokenForUrl = vi.fn().mockReturnValue(tokenHeld);

    const svc = new DownloadService(stubs.ytDlp, stubs.recentJobsStore as never, stubs.logService as never);

    const statuses: { stage: string; statusKey: string }[] = [];
    svc.on('status', (ev) => statuses.push({ stage: ev.stage, statusKey: ev.statusKey }));

    const startPromise = svc.start({ url: URL, outputDir: '/tmp' });

    // Binary setup resolves immediately, now cancel during token mint
    await Promise.resolve(); // flush microtasks for binary setup
    await svc.cancel();

    resolveToken({ token: 'tok', visitorData: 'vd' });
    await startPromise;

    const cancelEvent = statuses.find((s) => s.stage === 'error' && s.statusKey === 'cancelled');
    expect(cancelEvent).toBeDefined();
  });
});
