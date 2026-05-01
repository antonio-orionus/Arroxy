import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SubtitleOnlyPhase } from '@main/services/phases/SubtitleOnlyPhase';
import { STATUS_KEY } from '@shared/schemas';
import type { PhaseContext, ActiveDownload } from '@main/services/phases/types';
import type { DownloadJob, StartDownloadInput } from '@shared/types';
import type { YtDlpResult } from '@main/services/YtDlp';

vi.mock('@main/services/subtitlePostProcess', () => ({
  dedupeSubtitleFiles: vi.fn().mockResolvedValue(undefined),
  muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ ok: false }),
}));

import { dedupeSubtitleFiles } from '@main/services/subtitlePostProcess';

beforeEach(() => vi.clearAllMocks());

function makeJob(): DownloadJob {
  return {
    id: 'job-1',
    url: 'https://www.youtube.com/watch?v=test',
    outputDir: '/tmp',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const BASE_INPUT: StartDownloadInput = {
  url: 'https://www.youtube.com/watch?v=test',
  outputDir: '/tmp',
  subtitleLanguages: ['en'],
  subtitleMode: 'sidecar',
  writeAutoSubs: false,
  subtitleFormat: 'srt',
};

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
  return {
    job: makeJob(),
    input: BASE_INPUT,
    cancelRequested: false,
    pauseRequested: false,
    subtitlePaths: ['/tmp/video.en.srt'],
    ...overrides,
  };
}

function makeCtx(
  runResult: YtDlpResult,
  activeOverrides: Partial<ActiveDownload> = {}
): PhaseContext {
  const runMock = vi.fn().mockResolvedValue(runResult);
  return {
    active: makeActive(activeOverrides),
    ytDlp: { run: runMock, ffmpegPath: null } as never,
    logger: { log: vi.fn() } as never,
    emitStatus: vi.fn(),
    emitYtdlpFailure: vi.fn().mockReturnValue({ key: null }),
    attachYtDlpProcess: vi.fn(),
    safeConsume: vi.fn(),
    cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
    finalize: vi.fn().mockResolvedValue(undefined),
    moveToPaused: vi.fn(),
  };
}

const SUCCESS: YtDlpResult = { kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false };
const EXIT_ERROR: YtDlpResult = { kind: 'exit-error', exitCode: 1, signal: null, rawError: 'fail', stdout: '', stderr: '' };

describe('SubtitleOnlyPhase', () => {
  it('calls ytDlp.run with kind: subtitle', async () => {
    const ctx = makeCtx(SUCCESS);
    await SubtitleOnlyPhase.run(ctx);
    const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(req.kind).toBe('subtitle');
    expect(req.url).toBe(BASE_INPUT.url);
    expect(req.subtitleLanguages).toEqual(['en']);
  });

  it('success → returns completed', async () => {
    const outcome = await SubtitleOnlyPhase.run(makeCtx(SUCCESS));
    expect(outcome.kind).toBe('completed');
  });

  it('failure → hard-failed (no video to fall back to)', async () => {
    const ctx = makeCtx(EXIT_ERROR);
    const outcome = await SubtitleOnlyPhase.run(ctx);
    expect(outcome.kind).toBe('hard-failed');
    expect(ctx.emitYtdlpFailure).toHaveBeenCalledOnce();
  });

  it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
    const ctx = makeCtx({ ...SUCCESS, usedExtractorFallback: true });
    await SubtitleOnlyPhase.run(ctx);
    expect(ctx.active.usedExtractorFallback).toBe(true);
  });

  it('writeAutoSubs=false → dedupeSubtitleFiles not called', async () => {
    await SubtitleOnlyPhase.run(makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeAutoSubs: false },
    }));
    expect(dedupeSubtitleFiles).not.toHaveBeenCalled();
  });

  it('writeAutoSubs=true → dedupeSubtitleFiles called after success', async () => {
    const paths = ['/tmp/video.en.srt'];
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeAutoSubs: true },
      subtitlePaths: paths,
    });
    await SubtitleOnlyPhase.run(ctx);
    expect(dedupeSubtitleFiles).toHaveBeenCalledOnce();
    const [calledPaths] = vi.mocked(dedupeSubtitleFiles).mock.calls[0];
    expect(calledPaths).toEqual(paths);
  });

  it('dedupeSubtitleFiles shouldAbort reflects cancelRequested', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeAutoSubs: true },
    });
    await SubtitleOnlyPhase.run(ctx);

    const shouldAbort = vi.mocked(dedupeSubtitleFiles).mock.calls[0][3];
    expect(shouldAbort()).toBe(false);
    ctx.active.cancelRequested = true;
    expect(shouldAbort()).toBe(true);
  });

  it('cancelled after run → returns cancelled', async () => {
    const ctx: PhaseContext = {
      active: makeActive({ cancelRequested: false }),
      ytDlp: {} as never,
      logger: { log: vi.fn() } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn(),
    };
    const runMock = vi.fn().mockImplementationOnce(async () => {
      ctx.active.cancelRequested = true;
      return SUCCESS;
    });
    ctx.ytDlp = { run: runMock } as never;

    const outcome = await SubtitleOnlyPhase.run(ctx);
    expect(outcome.kind).toBe('cancelled');
  });

  it('onAttempt(0) → emits mintingToken; onAttempt(1) → emits remintingToken', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onAttempt?.(0);
      signal?.onAttempt?.(1);
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      ytDlp: { run: runMock } as never,
      logger: { log: vi.fn() } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn(),
    };

    await SubtitleOnlyPhase.run(ctx);

    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken);
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken);
  });

  it('onAttempt(2) → no status emitted', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onAttempt?.(2);
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      ytDlp: { run: runMock } as never,
      logger: { log: vi.fn() } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn(),
    };

    await SubtitleOnlyPhase.run(ctx);

    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled();
  });

  it('onSpawn → calls attachYtDlpProcess with proc and fetchingSubtitles', async () => {
    const fakeProc = {};
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onSpawn?.(fakeProc as never);
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      ytDlp: { run: runMock } as never,
      logger: { log: vi.fn() } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn(),
    };

    await SubtitleOnlyPhase.run(ctx);

    expect(ctx.attachYtDlpProcess).toHaveBeenCalledWith(fakeProc, STATUS_KEY.fetchingSubtitles);
  });
});
