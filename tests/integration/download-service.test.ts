import { describe, expect, it, vi } from 'vitest';
import { DownloadService } from '@main/services/DownloadService';
import type { DownloadJob } from '@shared/types';

function makeService() {
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/tmp/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/tmp/ffmpeg')
  };
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'mock-token', visitorData: 'mock-visitor' })
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const logService = { log: vi.fn() };
  const service = new DownloadService(
    binaryManager as never,
    tokenService as never,
    recentJobsStore as never,
    logService as never,
    true
  );
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

    const [r1, r2] = await Promise.all([
      service.start({ url: 'https://youtube.com/watch?v=1', outputDir: '/tmp' }),
      service.start({ url: 'https://youtube.com/watch?v=2', outputDir: '/tmp' })
    ]);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 3200));
    expect(recentJobsStore.push).toHaveBeenCalledTimes(2);
  });

  it('cancel(jobId) cancels only the specified job, not others', async () => {
    const { service, recentJobsStore } = makeService();

    const [r1, r2] = await Promise.all([
      service.start({ url: 'https://youtube.com/watch?v=1', outputDir: '/tmp' }),
      service.start({ url: 'https://youtube.com/watch?v=2', outputDir: '/tmp' })
    ]);

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

    // Manually inject a paused job to simulate the pause flow
    const pausedJob: DownloadJob = {
      id: 'paused-job-id',
      url: 'https://youtube.com/watch?v=xyz',
      outputDir: '/tmp/paused-downloads',
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    (service as unknown as { pausedJobs: Map<string, DownloadJob> }).pausedJobs.set(
      pausedJob.id,
      pausedJob
    );

    const cancelResult = await service.cancel(pausedJob.id);
    expect(cancelResult.ok).toBe(true);
    if (cancelResult.ok) expect(cancelResult.data.cancelled).toBe(true);
    expect(cleanupSpy).toHaveBeenCalledWith('/tmp/paused-downloads');

    const pausedJobs = (service as unknown as { pausedJobs: Map<string, DownloadJob> }).pausedJobs;
    expect(pausedJobs.has(pausedJob.id)).toBe(false);
  });
});
