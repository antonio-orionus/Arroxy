import { describe, expect, it, vi } from 'vitest';
import { PhaseExecutor } from '@main/services/phases/PhaseExecutor.js';
import { STATUS_KEY } from '@shared/schemas.js';
import { AsyncStack } from '@main/services/phases/types.js';
import type { Phase, PhaseContext, PhaseOutcome, ActiveDownload } from '@main/services/phases/types.js';
import type { DownloadJob, LocalizedError, StartDownloadInput } from '@shared/types.js';
import type { PreparedJob, EmbedOptions, SponsorBlockOptions } from '@shared/preparedJob.js';

const EMBED_OFF: EmbedOptions = { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false };
const SB_OFF: SponsorBlockOptions = { mode: 'off' };
const DEFAULT_JOB: PreparedJob = { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF };

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
    outputDir: '/tmp',
    job: DEFAULT_JOB
  };
  return {
    job: makeJob(),
    input,
    controller: new AbortController(),
    get signal(): AbortSignal {
      return this.controller.signal;
    },
    cancelRequested: false,
    pauseRequested: false,
    subtitlePaths: [],
    disposables: new AsyncStack(),
    ...overrides
  };
}

function makeCtx(activeOverrides: Partial<ActiveDownload> = {}): PhaseContext {
  return {
    active: makeActive(activeOverrides),
    signal: new AbortController().signal,
    register: () => undefined,
    ytDlp: {} as never,
    emitStatus: vi.fn(),
    safeConsume: vi.fn()
  };
}

function stubPhase(outcome: PhaseOutcome): Phase {
  return { kind: 'stub', run: vi.fn().mockResolvedValue(outcome) };
}

describe('PhaseExecutor', () => {
  it('continue → next phase runs; all continue → completed at end', async () => {
    const ctx = makeCtx();
    const phase1 = stubPhase({ kind: 'continue' });
    const phase2 = stubPhase({ kind: 'continue' });

    const outcome = await new PhaseExecutor().run(ctx, [phase1, phase2]);

    expect(phase1.run).toHaveBeenCalledOnce();
    expect(phase2.run).toHaveBeenCalledOnce();
    expect(outcome.kind).toBe('completed');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.complete);
  });

  it('completed → returns completed, subsequent phases skipped', async () => {
    const ctx = makeCtx();
    const phase1 = stubPhase({ kind: 'completed' });
    const phase2 = stubPhase({ kind: 'continue' });

    const outcome = await new PhaseExecutor().run(ctx, [phase1, phase2]);

    expect(phase2.run).not.toHaveBeenCalled();
    expect(outcome.kind).toBe('completed');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.complete);
  });

  it('completion with usedExtractorFallback → emits usedExtractorFallback before complete', async () => {
    const ctx = makeCtx({ usedExtractorFallback: true });

    await new PhaseExecutor().run(ctx, []);

    const calls = vi.mocked(ctx.emitStatus).mock.calls;
    const fallbackIdx = calls.findIndex(([, key]) => key === STATUS_KEY.usedExtractorFallback);
    const completeIdx = calls.findIndex(([, key]) => key === STATUS_KEY.complete);
    expect(fallbackIdx).toBeGreaterThan(-1);
    expect(completeIdx).toBeGreaterThan(fallbackIdx);
  });

  it('soft-failed → emits status on done stage, returns soft-failed', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed });

    const outcome = await new PhaseExecutor().run(ctx, [phase]);

    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.subtitlesFailed);
    expect(outcome.kind).toBe('soft-failed');
  });

  it('hard-failed → returns hard-failed with error payload, no emitStatus from executor', async () => {
    const ctx = makeCtx();
    const error: LocalizedError = { kind: 'botBlock', raw: '' };
    const phase = stubPhase({ kind: 'hard-failed', error });

    const outcome = await new PhaseExecutor().run(ctx, [phase]);

    expect(outcome.kind).toBe('hard-failed');
    if (outcome.kind === 'hard-failed') expect(outcome.error).toEqual(error);
    // Executor itself does not emit — phase already emitted with the LocalizedError.
    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled();
  });

  it('hard-failed stops pipeline — phase after hard failure is not called', async () => {
    const ctx = makeCtx();
    const error: LocalizedError = { kind: 'botBlock', raw: '' };
    const phase1 = stubPhase({ kind: 'hard-failed', error });
    const phase2 = stubPhase({ kind: 'continue' });

    await new PhaseExecutor().run(ctx, [phase1, phase2]);

    expect(phase2.run).not.toHaveBeenCalled();
  });

  it('cancelled → emits cancelled status, returns cancelled', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'cancelled' });

    const outcome = await new PhaseExecutor().run(ctx, [phase]);

    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', STATUS_KEY.cancelled);
    expect(outcome.kind).toBe('cancelled');
  });

  it('paused → returns paused, no terminal emitStatus', async () => {
    const ctx = makeCtx();
    const phase = stubPhase({ kind: 'paused' });

    const outcome = await new PhaseExecutor().run(ctx, [phase]);

    expect(outcome.kind).toBe('paused');
    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled();
  });

  it('empty phase array → returns completed', async () => {
    const ctx = makeCtx();

    const outcome = await new PhaseExecutor().run(ctx, []);

    expect(outcome.kind).toBe('completed');
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
