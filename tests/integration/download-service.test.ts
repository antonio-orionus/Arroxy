import { describe, expect, it, vi } from 'vitest';
import { DownloadService } from '@main/services/DownloadService';
import { YtDlp } from '@main/services/YtDlp';
import type { DownloadJob } from '@shared/types';

function makeService() {
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/tmp/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/tmp/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue(null),
    ensureFFprobe: vi.fn().mockResolvedValue(null)
  };
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'mock-token', visitorData: 'mock-visitor' })
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const settingsStore = { get: vi.fn().mockResolvedValue({}) };
  const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
  const service = new DownloadService(ytDlp, recentJobsStore as never, true);
  return { service, recentJobsStore };
}

describe('DownloadService (mock mode)', () => {
  it('starts and emits lifecycle events', async () => {
    const { service, recentJobsStore } = makeService();
    const statuses: string[] = [];
    service.on('status', (event) => statuses.push(event.stage));

    const result = await service.start({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      outputDir: '/tmp',
      formatId: ''
    });

    expect(result.ok).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 3200));
    expect(statuses).toContain('setup');
    expect(statuses).toContain('token');
    expect(statuses).toContain('download');
    expect(statuses).toContain('done');
    expect(recentJobsStore.push).toHaveBeenCalledOnce();
  });

  it('cancels an active mock download and calls cleanupPartFiles', async () => {
    const { service } = makeService();
    const cleanupSpy = vi.spyOn(service, 'cleanupPartFiles').mockResolvedValue();

    const startResult = await service.start({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      outputDir: '/tmp/downloads'
    });
    expect(startResult.ok).toBe(true);

    const cancelResult = await service.cancel();
    expect(cancelResult.ok).toBe(true);
    if (cancelResult.ok) expect(cancelResult.data.cancelled).toBe(true);
    expect(cleanupSpy).toHaveBeenCalledWith('/tmp/downloads');
  });

  it('allows two downloads to start concurrently', async () => {
    const { service, recentJobsStore } = makeService();

    const [r1, r2] = await Promise.all([service.start({ url: 'https://youtube.com/watch?v=1', outputDir: '/tmp' }), service.start({ url: 'https://youtube.com/watch?v=2', outputDir: '/tmp' })]);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 3200));
    expect(recentJobsStore.push).toHaveBeenCalledTimes(2);
  });

  it('cancel(jobId) cancels only the specified job, not others', async () => {
    const { service, recentJobsStore } = makeService();

    const [r1, r2] = await Promise.all([service.start({ url: 'https://youtube.com/watch?v=1', outputDir: '/tmp' }), service.start({ url: 'https://youtube.com/watch?v=2', outputDir: '/tmp' })]);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    const jobId1 = r1.ok ? r1.data.job.id : '';
    const cancelResult = await service.cancel(jobId1);
    expect(cancelResult.ok).toBe(true);
    if (cancelResult.ok) expect(cancelResult.data.cancelled).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 3200));

    const statuses = recentJobsStore.push.mock.calls.map((c) => c[0].status);
    expect(statuses).toContain('cancelled');
    expect(statuses).toContain('completed');
  });

  it('pause() pauses mock download and moves job to pausedJobs', async () => {
    const { service } = makeService();

    const startResult = await service.start({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      outputDir: '/tmp'
    });
    expect(startResult.ok).toBe(true);
    const jobId = startResult.ok ? startResult.data.job.id : '';

    const pauseResult = await service.pause(jobId);
    expect(pauseResult.ok).toBe(true);
    if (pauseResult.ok) expect(pauseResult.data.paused).toBe(true);

    const pausedJobs = (service as unknown as { pausedJobs: Map<string, unknown> }).pausedJobs;
    expect(pausedJobs.has(jobId)).toBe(true);
  });

  it('cancel() of a paused job cleans up .part files and removes from pausedJobs', async () => {
    const { service } = makeService();
    const cleanupSpy = vi.spyOn(service, 'cleanupPartFiles').mockResolvedValue();

    // Manually inject a paused job to simulate the pause flow.
    const pausedJob: DownloadJob = {
      id: 'paused-job-id',
      url: 'https://youtube.com/watch?v=xyz',
      outputDir: '/tmp/paused-downloads',
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    type PausedDownload = { job: DownloadJob; input: { url: string; outputDir: string } };
    (service as unknown as { pausedJobs: Map<string, PausedDownload> }).pausedJobs.set(pausedJob.id, { job: pausedJob, input: { url: pausedJob.url, outputDir: pausedJob.outputDir } });

    const cancelResult = await service.cancel(pausedJob.id);
    expect(cancelResult.ok).toBe(true);
    if (cancelResult.ok) expect(cancelResult.data.cancelled).toBe(true);
    expect(cleanupSpy).toHaveBeenCalledWith('/tmp/paused-downloads');

    const pausedJobs = (service as unknown as { pausedJobs: Map<string, PausedDownload> }).pausedJobs;
    expect(pausedJobs.has(pausedJob.id)).toBe(false);
  });

  it('resume() re-runs a paused mock job under the same id', async () => {
    const { service } = makeService();

    const startResult = await service.start({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      outputDir: '/tmp'
    });
    const jobId = startResult.ok ? startResult.data.job.id : '';
    await service.pause(jobId);

    const resumeResult = await service.resume(jobId);
    expect(resumeResult.ok).toBe(true);
    if (resumeResult.ok) {
      expect(resumeResult.data.resumed).toBe(true);
      expect(resumeResult.data.job?.id).toBe(jobId);
    }

    const pausedJobs = (service as unknown as { pausedJobs: Map<string, unknown> }).pausedJobs;
    expect(pausedJobs.has(jobId)).toBe(false);
  });

  it('resume() returns { resumed: false } for unknown jobId (renderer falls back to start)', async () => {
    const { service } = makeService();
    const result = await service.resume('does-not-exist');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.resumed).toBe(false);
  });

  it('resume() returns ok({resumed:false}) when cancel arrives before binaries finish', async () => {
    // ensureYtDlp resolves only after we explicitly release it, so we can flip
    // cancelRequested during the await window between activeJobs.set and the
    // post-binaries cancel check.
    let releaseBinaries: () => void = () => undefined;
    const binaryGate = new Promise<string>((resolve) => {
      releaseBinaries = () => resolve('/tmp/yt-dlp');
    });
    const binaryManager = {
      ensureYtDlp: vi.fn().mockReturnValue(binaryGate),
      ensureFFmpeg: vi.fn().mockResolvedValue('/tmp/ffmpeg'),
      ensureDeno: vi.fn().mockResolvedValue(null),
      ensureFFprobe: vi.fn().mockResolvedValue(null)
    };
    const tokenService = { mintTokenForUrl: vi.fn() };
    const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
    const settingsStore = { get: vi.fn().mockResolvedValue({}) };
    const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
    const service = new DownloadService(ytDlp, recentJobsStore as never, true);
    vi.spyOn(service, 'cleanupPartFiles').mockResolvedValue();

    // Seed a paused job directly so resume() takes the within-session branch.
    const pausedJob: DownloadJob = {
      id: 'paused-cancel-race',
      url: 'https://youtube.com/watch?v=race',
      outputDir: '/tmp/race',
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    type PausedDownload = { job: DownloadJob; input: { url: string; outputDir: string } };
    (service as unknown as { pausedJobs: Map<string, PausedDownload> }).pausedJobs.set(pausedJob.id, { job: pausedJob, input: { url: pausedJob.url, outputDir: pausedJob.outputDir } });

    const resumePromise = service.resume(pausedJob.id);
    // resume() is now awaiting ensureYtDlp; fire cancel which will mark
    // cancelRequested on the active entry.
    await service.cancel(pausedJob.id);
    releaseBinaries();

    const result = await resumePromise;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.resumed).toBe(false);

    const recentCalls = recentJobsStore.push.mock.calls.map((c) => c[0].status);
    expect(recentCalls).toContain('cancelled');
  });
});
