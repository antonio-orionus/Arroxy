import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SubtitleOnlyPhase } from '@main/services/phases/SubtitleOnlyPhase.js';
import { STATUS_KEY } from '@shared/schemas.js';
import { AsyncStack } from '@main/services/phases/types.js';
import type { PhaseContext, ActiveDownload } from '@main/services/phases/types.js';
import type { DownloadJob, StartDownloadInput } from '@shared/types.js';
import type { PreparedJob } from '@shared/preparedJob.js';
import type { YtDlpResult } from '@main/services/YtDlp.js';

vi.mock('@main/services/subtitlePostProcess', () => ({
  dedupeSubtitleFiles: vi.fn().mockResolvedValue(undefined),
  muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ ok: false }),
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

import { dedupeSubtitleFiles } from '@main/services/subtitlePostProcess.js';

beforeEach(() => vi.clearAllMocks());

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

const BASE_SUBS = { languages: ['en'], mode: 'sidecar' as const, format: 'srt' as const, writeAuto: false };
const BASE_JOB: PreparedJob = { kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: BASE_SUBS };

const BASE_INPUT: StartDownloadInput = {
  url: 'https://www.youtube.com/watch?v=test',
  outputDir: '/tmp',
  job: BASE_JOB
};

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
  return {
    job: makeJob(),
    input: BASE_INPUT,
    controller: new AbortController(),
    get signal(): AbortSignal {
      return this.controller.signal;
    },
    cancelRequested: false,
    pauseRequested: false,
    subtitlePaths: ['/tmp/video.en.srt'],
    disposables: new AsyncStack(),
    ...overrides
  };
}

function makeCtx(runResult: YtDlpResult, activeOverrides: Partial<ActiveDownload> = {}): PhaseContext {
  const runMock = vi.fn().mockResolvedValue(runResult);
  return {
    active: makeActive(activeOverrides),
    signal: new AbortController().signal,
    register: () => undefined,
    ytDlp: { run: runMock, ffmpegPath: null } as never,
    emitStatus: vi.fn(),
    safeConsume: vi.fn()
  };
}

const SUCCESS: YtDlpResult = {
  kind: 'success',
  stdout: '',
  stderr: '',
  usedExtractorFallback: false
};
const EXIT_ERROR: YtDlpResult = {
  kind: 'exit-error',
  exitCode: 1,
  errorKind: 'unknown',
  rawError: 'fail',
  stdout: '',
  stderr: ''
};

describe('SubtitleOnlyPhase', () => {
  it('calls ytDlp.run with kind: subtitle', async () => {
    const ctx = makeCtx(SUCCESS);
    await SubtitleOnlyPhase.run(ctx);
    const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(req.kind).toBe('subtitle');
    expect(req.url).toBe(BASE_INPUT.url);
    expect(req.subtitleLanguages).toEqual(['en']);
  });

  it('forwards outputTemplate for single subtitle-only jobs', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: {
        ...BASE_INPUT,
        job: { ...BASE_JOB, outputTemplate: '%(title).200B [%(id)s].%(ext)s' }
      }
    });
    await SubtitleOnlyPhase.run(ctx);
    const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(req.outputTemplate).toBe('%(title).200B [%(id)s].%(ext)s');
  });

  it('success → returns completed', async () => {
    const outcome = await SubtitleOnlyPhase.run(makeCtx(SUCCESS));
    expect(outcome.kind).toBe('completed');
  });

  it('failure → hard-failed with classified error payload', async () => {
    const ctx = makeCtx(EXIT_ERROR);
    const outcome = await SubtitleOnlyPhase.run(ctx);
    expect(outcome.kind).toBe('hard-failed');
    if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('unknown');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({ kind: 'unknown' }));
  });

  it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
    const ctx = makeCtx({ ...SUCCESS, usedExtractorFallback: true });
    await SubtitleOnlyPhase.run(ctx);
    expect(ctx.active.usedExtractorFallback).toBe(true);
  });

  it('writeAutoSubs=false → dedupeSubtitleFiles not called', async () => {
    await SubtitleOnlyPhase.run(
      makeCtx(SUCCESS, {
        input: { ...BASE_INPUT, job: { ...BASE_JOB, subtitles: { ...BASE_SUBS, writeAuto: false } } }
      })
    );
    expect(dedupeSubtitleFiles).not.toHaveBeenCalled();
  });

  it('writeAutoSubs=true → dedupeSubtitleFiles called after success', async () => {
    const paths = ['/tmp/video.en.srt'];
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, job: { ...BASE_JOB, subtitles: { ...BASE_SUBS, writeAuto: true } } },
      subtitlePaths: paths
    });
    await SubtitleOnlyPhase.run(ctx);
    expect(dedupeSubtitleFiles).toHaveBeenCalledOnce();
    const [calledPaths] = vi.mocked(dedupeSubtitleFiles).mock.calls[0];
    expect(calledPaths).toEqual(paths);
  });

  it('dedupeSubtitleFiles shouldAbort reflects cancelRequested', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, job: { ...BASE_JOB, subtitles: { ...BASE_SUBS, writeAuto: true } } }
    });
    await SubtitleOnlyPhase.run(ctx);

    const shouldAbort = vi.mocked(dedupeSubtitleFiles).mock.calls[0][3];
    expect(shouldAbort?.()).toBe(false);
    ctx.active.cancelRequested = true;
    expect(shouldAbort?.()).toBe(true);
  });

  it('pauseRequested after run → returns paused (not hard-failed)', async () => {
    const active = makeActive({ cancelRequested: false });
    const runMock = vi.fn().mockImplementationOnce(async () => {
      active.pauseRequested = true;
      return EXIT_ERROR; // SIGTERM makes yt-dlp exit non-zero
    });
    const ctx: PhaseContext = {
      active,
      signal: active.signal,
      register: () => undefined,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };

    const outcome = await SubtitleOnlyPhase.run(ctx);
    expect(outcome.kind).toBe('paused');
  });

  it('cancelled after run → returns cancelled', async () => {
    const ctx: PhaseContext = {
      active: makeActive({ cancelRequested: false }),
      signal: new AbortController().signal,
      register: () => undefined,
      ytDlp: {} as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };
    const runMock = vi.fn().mockImplementationOnce(async () => {
      ctx.active.cancelRequested = true;
      return SUCCESS;
    });
    ctx.ytDlp = { run: runMock } as never;

    const outcome = await SubtitleOnlyPhase.run(ctx);
    expect(outcome.kind).toBe('cancelled');
  });

  it('onMinting(0) → emits mintingToken; onMinting(1) → emits remintingToken', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onMinting?.(0);
      signal?.onMinting?.(1);
      return SUCCESS;
    });
    const ctx: PhaseContext = {
      active: makeActive(),
      signal: new AbortController().signal,
      register: () => undefined,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };

    await SubtitleOnlyPhase.run(ctx);

    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken);
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken);
  });

  it('no onMinting call → no token status emitted', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, _signal) => SUCCESS);
    const ctx: PhaseContext = {
      active: makeActive(),
      signal: new AbortController().signal,
      register: () => undefined,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };

    await SubtitleOnlyPhase.run(ctx);

    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled();
  });

  it('onSpawn → assigns process, registers SIGKILL disposable, emits fetchingSubtitles', async () => {
    const fakeProc = { kill: vi.fn() };
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onSpawn?.(fakeProc);
      return SUCCESS;
    });
    const active = makeActive();
    const registerSpy = vi.fn((d: () => void | Promise<void>) => active.disposables.defer(d));
    const ctx: PhaseContext = {
      active,
      signal: active.signal,
      register: registerSpy,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };

    await SubtitleOnlyPhase.run(ctx);

    expect(active.ytDlpProcess).toBe(fakeProc);
    expect(registerSpy).toHaveBeenCalled();
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('download', STATUS_KEY.fetchingSubtitles);
  });
});
