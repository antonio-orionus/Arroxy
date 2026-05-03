import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PreflightPhase } from '@main/services/phases/PreflightPhase';
import type { PhaseContext, ActiveDownload } from '@main/services/phases/types';
import type { DownloadJob, StartDownloadInput } from '@shared/types';

vi.mock('@main/utils/diskSpace', () => ({
  checkDiskSpace: vi.fn()
}));

import { checkDiskSpace } from '@main/utils/diskSpace';

beforeEach(() => { vi.clearAllMocks(); });

function makeCtx(outputDir = '/output'): PhaseContext {
  const input: StartDownloadInput = { url: 'https://www.youtube.com/watch?v=test', outputDir };
  const job: DownloadJob = {
    id: 'test-job-id',
    url: 'https://www.youtube.com/watch?v=test',
    outputDir,
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const active: ActiveDownload = {
    job,
    input,
    cancelRequested: false,
    pauseRequested: false,
    subtitlePaths: [],
  };
  return {
    active,
    ytDlp: {} as never,
    logger: { log: vi.fn() } as never,
    emitStatus: vi.fn(),
    emitYtdlpFailure: vi.fn(),
    attachYtDlpProcess: vi.fn(),
    safeConsume: vi.fn(),
    cleanupPartFiles: vi.fn(),
    cleanupTempDir: vi.fn().mockResolvedValue(undefined),
    finalize: vi.fn(),
    moveToPaused: vi.fn(),
  };
}

describe('PreflightPhase', () => {
  it('returns continue when disk space is sufficient', async () => {
    vi.mocked(checkDiskSpace).mockResolvedValue({ ok: true, freeBytes: 10_000_000_000, requiredBytes: 6_000_000_000 });
    const phase = PreflightPhase(4_000_000_000);
    const outcome = await phase.run(makeCtx());
    expect(outcome.kind).toBe('continue');
  });

  it('returns hard-failed with outOfDiskSpace key when space is insufficient', async () => {
    vi.mocked(checkDiskSpace).mockResolvedValue({ ok: false, freeBytes: 500_000_000, requiredBytes: 1_500_000_000 });
    const phase = PreflightPhase(1_000_000_000);
    const outcome = await phase.run(makeCtx());
    expect(outcome.kind).toBe('hard-failed');
    if (outcome.kind === 'hard-failed') {
      expect(outcome.error.key).toBe('outOfDiskSpace');
    }
  });

  it('returns continue when expectedBytes is undefined (live stream)', async () => {
    vi.mocked(checkDiskSpace).mockResolvedValue({ ok: true, freeBytes: undefined, requiredBytes: undefined });
    const phase = PreflightPhase(undefined);
    const outcome = await phase.run(makeCtx());
    expect(outcome.kind).toBe('continue');
  });

  it('emits an error status on insufficient space', async () => {
    vi.mocked(checkDiskSpace).mockResolvedValue({ ok: false, freeBytes: 100_000_000, requiredBytes: 600_000_000 });
    const ctx = makeCtx();
    const phase = PreflightPhase(400_000_000);
    await phase.run(ctx);
    expect(ctx.emitStatus).toHaveBeenCalledWith(
      'error',
      expect.any(String),
      undefined,
      expect.objectContaining({ key: 'outOfDiskSpace' })
    );
  });

  it('calls checkDiskSpace with the job outputDir', async () => {
    vi.mocked(checkDiskSpace).mockResolvedValue({ ok: true, freeBytes: 999, requiredBytes: undefined });
    const phase = PreflightPhase(500_000_000);
    await phase.run(makeCtx('/my/output'));
    expect(checkDiskSpace).toHaveBeenCalledWith('/my/output', 500_000_000);
  });

  it('hard-failed error rawMessage includes GB amounts', async () => {
    vi.mocked(checkDiskSpace).mockResolvedValue({ ok: false, freeBytes: 1_073_741_824, requiredBytes: 4_294_967_296 });
    const phase = PreflightPhase(2_000_000_000);
    const outcome = await phase.run(makeCtx());
    if (outcome.kind === 'hard-failed') {
      expect(outcome.error.rawMessage).toContain('GB');
    }
  });
});
