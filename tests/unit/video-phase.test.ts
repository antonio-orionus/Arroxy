import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { VideoPhase } from '@main/services/phases/VideoPhase';
import { STATUS_KEY } from '@shared/schemas';
import type { PhaseContext, ActiveDownload } from '@main/services/phases/types';
import type { DownloadJob, StartDownloadInput } from '@shared/types';
import type { YtDlpResult } from '@main/services/YtDlp';

function makeJob(): DownloadJob {
  return {
    id: 'job-1',
    url: 'https://www.youtube.com/watch?v=test',
    outputDir: '/tmp',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

const BASE_INPUT: StartDownloadInput = {
  url: 'https://www.youtube.com/watch?v=test',
  outputDir: '/tmp',
  formatId: 'bv+ba',
  subtitleLanguages: ['en', 'ja'],
  subtitleMode: 'embed',
  writeAutoSubs: false,
  subtitleFormat: 'vtt'
};

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
  return {
    job: makeJob(),
    input: BASE_INPUT,
    cancelRequested: false,
    pauseRequested: false,
    subtitlePaths: [],
    ...overrides
  };
}

function makeCtx(runResult: YtDlpResult, activeOverrides: Partial<ActiveDownload> = {}): PhaseContext & { runMock: ReturnType<typeof vi.fn> } {
  const runMock = vi.fn().mockImplementation((_req, signal) => {
    return Promise.resolve(runResult).then((r) => {
      signal?.onAttempt?.(0);
      return r;
    });
  });

  const ctx: PhaseContext = {
    active: makeActive(activeOverrides),
    ytDlp: { run: runMock, ffmpegPath: '/fake/ffmpeg' } as never,
    emitStatus: vi.fn(),
    emitYtdlpFailure: vi.fn().mockReturnValue({ key: 'botBlock' }),
    attachYtDlpProcess: vi.fn(),
    safeConsume: vi.fn(),
    cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
    cleanupTempDir: vi.fn().mockResolvedValue(undefined),
    finalize: vi.fn().mockResolvedValue(undefined),
    moveToPaused: vi.fn()
  };
  return Object.assign(ctx, { runMock });
}

const SUCCESS: YtDlpResult = {
  kind: 'success',
  stdout: '',
  stderr: '',
  usedExtractorFallback: false
};
const SUCCESS_FALLBACK: YtDlpResult = {
  kind: 'success',
  stdout: '',
  stderr: '',
  usedExtractorFallback: true
};
const EXIT_ERROR: YtDlpResult = {
  kind: 'exit-error',
  exitCode: 1,
  signal: 'botBlock',
  rawError: 'bot',
  stdout: '',
  stderr: ''
};

describe('VideoPhase(embed=false)', () => {
  it('calls ytDlp.run with kind: video', async () => {
    const ctx = makeCtx(SUCCESS);
    await VideoPhase(false).run(ctx);
    expect(ctx.runMock).toHaveBeenCalledOnce();
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.kind).toBe('video');
  });

  it('success → returns continue', async () => {
    const outcome = await VideoPhase(false).run(makeCtx(SUCCESS));
    expect(outcome.kind).toBe('continue');
  });

  it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
    const ctx = makeCtx(SUCCESS_FALLBACK);
    await VideoPhase(false).run(ctx);
    expect(ctx.active.usedExtractorFallback).toBe(true);
  });

  it('exit-error → hard-failed with emitYtdlpFailure result', async () => {
    const ctx = makeCtx(EXIT_ERROR);
    const outcome = await VideoPhase(false).run(ctx);
    expect(outcome.kind).toBe('hard-failed');
    expect(ctx.emitYtdlpFailure).toHaveBeenCalledOnce();
  });
});

describe('VideoPhase(embed=true)', () => {
  it('calls ytDlp.run with kind: video+embed and subtitle fields', async () => {
    const ctx = makeCtx(SUCCESS);
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.kind).toBe('video+embed');
    expect(req.subtitleLanguages).toEqual(['en', 'ja']);
  });

  it('embed=true but no subtitleLanguages → falls back to video kind', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, subtitleLanguages: undefined }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.kind).toBe('video');
  });

  it('embed=true with empty subtitleLanguages → falls back to video kind', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, subtitleLanguages: [] }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.kind).toBe('video');
  });
});

describe('VideoPhase — sidecar field propagation', () => {
  it('writeDescription propagates to YtDlpRequest (video kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, subtitleLanguages: [], writeDescription: true }
    });
    await VideoPhase(false).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.writeDescription).toBe(true);
  });

  it('writeThumbnail propagates to YtDlpRequest (video kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, subtitleLanguages: [], writeThumbnail: true }
    });
    await VideoPhase(false).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.writeThumbnail).toBe(true);
  });

  it('writeDescription propagates to YtDlpRequest (video+embed kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeDescription: true }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.writeDescription).toBe(true);
  });

  it('writeThumbnail propagates to YtDlpRequest (video+embed kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeThumbnail: true }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.writeThumbnail).toBe(true);
  });
});

describe('VideoPhase — cancel / pause', () => {
  it('cancelRequested after run → returns cancelled', async () => {
    const runMock = vi.fn().mockImplementation((_req, _signal) => {
      return Promise.resolve(SUCCESS);
    });
    const ctx: PhaseContext = {
      active: makeActive({ cancelRequested: false }),
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      cleanupTempDir: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn()
    };
    // Set cancelRequested during the run
    runMock.mockImplementationOnce(async () => {
      ctx.active.cancelRequested = true;
      return SUCCESS;
    });

    const outcome = await VideoPhase(false).run(ctx);
    expect(outcome.kind).toBe('cancelled');
  });

  it('pauseRequested after run → returns paused', async () => {
    const runMock = vi.fn().mockImplementation(async () => SUCCESS);
    const ctx: PhaseContext = {
      active: makeActive({ pauseRequested: false }),
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      cleanupTempDir: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn()
    };
    runMock.mockImplementationOnce(async () => {
      ctx.active.pauseRequested = true;
      return SUCCESS;
    });

    const outcome = await VideoPhase(false).run(ctx);
    expect(outcome.kind).toBe('paused');
  });
});

describe('VideoPhase — signal callbacks', () => {
  it('onAttempt(0) → emits mintingToken; onAttempt(1) → emits remintingToken', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onAttempt?.(0);
      signal?.onAttempt?.(1);
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      cleanupTempDir: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn()
    };

    await VideoPhase(false).run(ctx);

    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken);
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken);
  });

  it('onAttempt(2) → does not emit any status (fallback is silent)', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onAttempt?.(2);
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      cleanupTempDir: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn()
    };

    await VideoPhase(false).run(ctx);

    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled();
  });

  it('onSpawn → calls attachYtDlpProcess with proc and downloadingMedia', async () => {
    const fakeProc = new EventEmitter();
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onSpawn?.(fakeProc as never);
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      cleanupTempDir: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn()
    };

    await VideoPhase(false).run(ctx);

    expect(ctx.attachYtDlpProcess).toHaveBeenCalledWith(fakeProc, STATUS_KEY.downloadingMedia);
  });

  it('onStdout/onStderr → calls safeConsume', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onStdout?.('stdout line\n');
      signal?.onStderr?.('stderr line\n');
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      emitYtdlpFailure: vi.fn(),
      attachYtDlpProcess: vi.fn(),
      safeConsume: vi.fn(),
      cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
      cleanupTempDir: vi.fn().mockResolvedValue(undefined),
      finalize: vi.fn().mockResolvedValue(undefined),
      moveToPaused: vi.fn()
    };

    await VideoPhase(false).run(ctx);

    expect(ctx.safeConsume).toHaveBeenCalledWith('stdout line\n');
    expect(ctx.safeConsume).toHaveBeenCalledWith('stderr line\n');
  });
});
