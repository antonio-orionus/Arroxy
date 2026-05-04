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

describe('PhaseExecutor', () => {
  it('continue → next phase runs; all continue → complete() at end', async () => {
    const ctx = makeCtx();
    const phase1 = stubPhase({ kind: 'continue' });
    const phase2 = stubPhase({ kind: 'continue' });

    await new PhaseExecutor().run(ctx, [phase1, phase2]);

    expect(phase1.run).toHaveBeenCalledOnce();
    expect(phase2.run).toHaveBeenCalledOnce();
    expect(ctx.finalize).toHaveBeenCalledWith('completed');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.complete);
  });

  it('completed → complete() called, subsequent phases skipped', async () => {
    const ctx = makeCtx();
    const phase1 = stubPhase({ kind: 'completed' });
    const phase2 = stubPhase({ kind: 'continue' });

    await new PhaseExecutor().run(ctx, [phase1, phase2]);

    expect(phase2.run).not.toHaveBeenCalled();
    expect(ctx.finalize).toHaveBeenCalledWith('completed');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.complete);
  });

  it('complete() with usedExtractorFallback → emits usedExtractorFallback before complete', async () => {
    const ctx = makeCtx({ usedExtractorFallback: true });

    await new PhaseExecutor().run(ctx, []);

    const calls = vi.mocked(ctx.emitStatus).mock.calls;
    const fallbackIdx = calls.findIndex(([, key]) => key === STATUS_KEY.usedExtractorFallback);
    const completeIdx = calls.findIndex(([, key]) => key === STATUS_KEY.complete);
    expect(fallbackIdx).toBeGreaterThan(-1);
    expect(completeIdx).toBeGreaterThan(fallbackIdx);
  });

  it('soft-failed → emits status on done stage, finalizes completed', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.subtitlesFailed);
    expect(ctx.finalize).toHaveBeenCalledWith('completed');
  });

  it('hard-failed → finalizes failed with error payload, no emitStatus', async () => {
    const ctx = makeCtx();
    const error: LocalizedError = { key: 'botBlock' };
    const phase = stubPhase({ kind: 'hard-failed', error });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(ctx.finalize).toHaveBeenCalledWith('failed', error);
    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled();
  });

  it('cancelled → cleanupPartFiles called with outputDir, emits cancelled, finalizes cancelled', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'cancelled' });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(ctx.cleanupPartFiles).toHaveBeenCalledWith('/tmp');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', STATUS_KEY.cancelled);
    expect(ctx.finalize).toHaveBeenCalledWith('cancelled');
  });

  it('paused → moveToPaused called, finalize not called', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'paused' });

    await new PhaseExecutor().run(ctx, [phase]);

    expect(ctx.moveToPaused).toHaveBeenCalledOnce();
    expect(ctx.finalize).not.toHaveBeenCalled();
  });

  it('empty phase array → complete() called', async () => {
    const ctx = makeCtx();

    await new PhaseExecutor().run(ctx, []);

    expect(ctx.finalize).toHaveBeenCalledWith('completed');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.complete);
  });

  it('cancelled stops pipeline — phase after cancelled is not called', async () => {
    const ctx = makeCtx();
    const phase1 = stubPhase({ kind: 'cancelled' });
    const phase2 = stubPhase({ kind: 'continue' });

    await new PhaseExecutor().run(ctx, [phase1, phase2]);

    expect(phase2.run).not.toHaveBeenCalled();
  });
});
