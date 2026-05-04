import { describe, expect, it, vi } from 'vitest';
import { PhaseExecutor } from '@main/services/phases/PhaseExecutor';
import { STATUS_KEY } from '@shared/schemas';
import type { Phase, PhaseContext, PhaseOutcome, ActiveDownload } from '@main/services/phases/types';
import type { DownloadJob, LocalizedError, StartDownloadInput } from '@shared/types';

function makeJob(id = 'job-1'): DownloadJob {
  return {
    id,
    url: 'https://www.youtube.com/watch?v=test',
    outputDir: '/tmp',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
  const input: StartDownloadInput = {
    url: 'https://www.youtube.com/watch?v=test',
    outputDir: '/tmp'
  };
  return {
    job: makeJob(),
    input,
    cancelRequested: false,
    pauseRequested: false,
    subtitlePaths: [],
    ...overrides
  };
}

function makeCtx(activeOverrides: Partial<ActiveDownload> = {}): PhaseContext {
  return {
    active: makeActive(activeOverrides),
    ytDlp: {} as never,
    emitStatus: vi.fn(),
    emitYtdlpFailure: vi.fn().mockReturnValue({ key: null }),
    attachYtDlpProcess: vi.fn(),
    safeConsume: vi.fn(),
    cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
    cleanupTempDir: vi.fn().mockResolvedValue(undefined),
    finalize: vi.fn().mockResolvedValue(undefined),
    moveToPaused: vi.fn()
  };
}

function stubPhase(outcome: PhaseOutcome): Phase {
  return { kind: 'stub', run: vi.fn().mockResolvedValue(outcome) };
}

describe('PhaseExecutor — temp dir cleanup', () => {
  it('calls cleanupTempDir on hard-failed', async () => {
    const ctx = makeCtx();
    const error: LocalizedError = { key: 'outOfDiskSpace' };
    const phase = stubPhase({ kind: 'hard-failed', error });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(ctx.cleanupTempDir).toHaveBeenCalledOnce();
    expect(ctx.finalize).toHaveBeenCalledWith('failed', error);
  });

  it('calls cleanupTempDir on cancelled', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'cancelled' });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(ctx.cleanupTempDir).toHaveBeenCalledOnce();
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', STATUS_KEY.cancelled);
  });

  it('calls cleanupTempDir on successful completion', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'completed' });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(ctx.cleanupTempDir).toHaveBeenCalledOnce();
    expect(ctx.finalize).toHaveBeenCalledWith('completed');
  });

  it('calls cleanupTempDir on all-continue → complete', async () => {
    const ctx = makeCtx();

    await new PhaseExecutor().run(ctx, [stubPhase({ kind: 'continue' })]);

    expect(ctx.cleanupTempDir).toHaveBeenCalledOnce();
  });

  it('does NOT call cleanupTempDir on paused', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'paused' });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(ctx.cleanupTempDir).not.toHaveBeenCalled();
    expect(ctx.moveToPaused).toHaveBeenCalledOnce();
  });

  it('cleanupTempDir is called before finalize on hard-failed', async () => {
    const ctx = makeCtx();
    const order: string[] = [];
    vi.mocked(ctx.cleanupTempDir).mockImplementation(async () => {
      order.push('cleanup');
    });
    vi.mocked(ctx.finalize).mockImplementation(async () => {
      order.push('finalize');
    });

    const phase = stubPhase({ kind: 'hard-failed', error: { key: null } });
    await new PhaseExecutor().run(ctx, [phase]);

    expect(order).toEqual(['cleanup', 'finalize']);
  });
});
