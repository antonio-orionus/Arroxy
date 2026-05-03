import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SidecarSubsPhase } from '@main/services/phases/SidecarSubsPhase';
import { STATUS_KEY } from '@shared/schemas';
import type { PhaseContext, ActiveDownload } from '@main/services/phases/types';
import type { DownloadJob, StartDownloadInput } from '@shared/types';
import type { YtDlpResult } from '@main/services/YtDlp';

vi.mock('@main/services/subtitlePostProcess', () => ({
  dedupeSubtitleFiles: vi.fn().mockResolvedValue(undefined),
  muxSubtitlesIntoVideo: vi.fn().mockResolvedValue({ ok: true, outputPath: '/tmp/video.mkv' }),
}));

import { dedupeSubtitleFiles, muxSubtitlesIntoVideo } from '@main/services/subtitlePostProcess';

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
  formatId: 'bv+ba',
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
    mediaPath: '/tmp/video.mp4',
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
    ytDlp: { run: runMock, ffmpegPath: '/fake/ffmpeg' } as never,
    logger: { log: vi.fn() } as never,
    emitStatus: vi.fn(),
    emitYtdlpFailure: vi.fn().mockReturnValue({ key: null }),
    attachYtDlpProcess: vi.fn(),
    safeConsume: vi.fn(),
    cleanupPartFiles: vi.fn().mockResolvedValue(undefined),
    cleanupTempDir: vi.fn().mockResolvedValue(undefined),
    finalize: vi.fn().mockResolvedValue(undefined),
    moveToPaused: vi.fn(),
  };
}

const SUCCESS: YtDlpResult = { kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false };
const EXIT_ERROR: YtDlpResult = { kind: 'exit-error', exitCode: 1, signal: null, rawError: 'fail', stdout: '', stderr: '' };

describe('SidecarSubsPhase(embedAfter=false)', () => {
  it('calls ytDlp.run with kind: subtitle', async () => {
    const ctx = makeCtx(SUCCESS);
    await SidecarSubsPhase(false).run(ctx);
    const [req] = vi.mocked(ctx.ytDlp.run as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(req.kind).toBe('subtitle');
  });

  it('emits fetchingSubtitles status before run', async () => {
    const ctx = makeCtx(SUCCESS);
    await SidecarSubsPhase(false).run(ctx);
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('download', STATUS_KEY.fetchingSubtitles);
  });

  it('success → returns completed', async () => {
    const outcome = await SidecarSubsPhase(false).run(makeCtx(SUCCESS));
    expect(outcome.kind).toBe('completed');
  });

  it('subtitle failure → soft-failed with subtitlesFailed', async () => {
    const outcome = await SidecarSubsPhase(false).run(makeCtx(EXIT_ERROR));
    expect(outcome.kind).toBe('soft-failed');
    if (outcome.kind === 'soft-failed') expect(outcome.status).toBe(STATUS_KEY.subtitlesFailed);
  });

  it('success with usedExtractorFallback → sets active.usedExtractorFallback', async () => {
    const fallbackResult: YtDlpResult = { ...SUCCESS, usedExtractorFallback: true };
    const ctx = makeCtx(fallbackResult);
    await SidecarSubsPhase(false).run(ctx);
    expect(ctx.active.usedExtractorFallback).toBe(true);
  });

  it('writeAutoSubs=false → dedupeSubtitleFiles not called', async () => {
    await SidecarSubsPhase(false).run(makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeAutoSubs: false },
    }));
    expect(dedupeSubtitleFiles).not.toHaveBeenCalled();
  });

  it('writeAutoSubs=true → dedupeSubtitleFiles called with subtitlePaths', async () => {
    const paths = ['/tmp/video.en.srt'];
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeAutoSubs: true },
      subtitlePaths: paths,
    });
    await SidecarSubsPhase(false).run(ctx);
    expect(dedupeSubtitleFiles).toHaveBeenCalledOnce();
    const [calledPaths] = vi.mocked(dedupeSubtitleFiles).mock.calls[0];
    expect(calledPaths).toEqual(paths);
  });

  it('dedupeSubtitleFiles shouldAbort reflects cancelRequested', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, writeAutoSubs: true },
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    await SidecarSubsPhase(false).run(ctx);

    const shouldAbort = vi.mocked(dedupeSubtitleFiles).mock.calls[0][3];
    expect(shouldAbort()).toBe(false);
    ctx.active.cancelRequested = true;
    expect(shouldAbort()).toBe(true);
  });

  it('embedAfter=false → muxSubtitlesIntoVideo not called', async () => {
    await SidecarSubsPhase(false).run(makeCtx(SUCCESS));
    expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled();
  });
});

describe('SidecarSubsPhase(embedAfter=true)', () => {
  it('ffmpeg available + mediaPath + subtitlePaths → calls muxSubtitlesIntoVideo', async () => {
    const ctx = makeCtx(SUCCESS, {
      mediaPath: '/tmp/video.mp4',
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    await SidecarSubsPhase(true).run(ctx);
    expect(muxSubtitlesIntoVideo).toHaveBeenCalledOnce();
  });

  it('mux success → updates active.mediaPath to muxed output', async () => {
    vi.mocked(muxSubtitlesIntoVideo).mockResolvedValueOnce({ ok: true, outputPath: '/tmp/video.mkv' });
    const ctx = makeCtx(SUCCESS, {
      mediaPath: '/tmp/video.mp4',
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    await SidecarSubsPhase(true).run(ctx);
    expect(ctx.active.mediaPath).toBe('/tmp/video.mkv');
  });

  it('ffmpeg=null → skips mux, emits subtitlesFailed, returns completed', async () => {
    const ctx = makeCtx(SUCCESS, {
      mediaPath: '/tmp/video.mp4',
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    (ctx.ytDlp as unknown as Record<string, unknown>).ffmpegPath = null;
    const outcome = await SidecarSubsPhase(true).run(ctx);
    expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled();
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('download', STATUS_KEY.subtitlesFailed);
    expect(outcome.kind).toBe('completed');
  });

  it('mux returns { ok: false } → leaves mediaPath unchanged, returns completed', async () => {
    vi.mocked(muxSubtitlesIntoVideo).mockResolvedValueOnce({ ok: false });
    const ctx = makeCtx(SUCCESS, {
      mediaPath: '/tmp/video.mp4',
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    const originalPath = ctx.active.mediaPath;
    const outcome = await SidecarSubsPhase(true).run(ctx);
    expect(ctx.active.mediaPath).toBe(originalPath);
    expect(outcome.kind).toBe('completed');
  });

  it('no mediaPath → skips mux, returns completed', async () => {
    const ctx = makeCtx(SUCCESS, {
      mediaPath: undefined,
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    const outcome = await SidecarSubsPhase(true).run(ctx);
    expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled();
    expect(outcome.kind).toBe('completed');
  });

  it('empty subtitlePaths → skips mux, returns completed', async () => {
    const ctx = makeCtx(SUCCESS, {
      mediaPath: '/tmp/video.mp4',
      subtitlePaths: [],
    });
    const outcome = await SidecarSubsPhase(true).run(ctx);
    expect(muxSubtitlesIntoVideo).not.toHaveBeenCalled();
    expect(outcome.kind).toBe('completed');
  });

  it('emits mergingFormats before mux', async () => {
    const ctx = makeCtx(SUCCESS, {
      mediaPath: '/tmp/video.mp4',
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    await SidecarSubsPhase(true).run(ctx);
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('download', STATUS_KEY.mergingFormats);
  });

  it('onSpawn from mux sets active.ffmpegProcess; cleared after mux', async () => {
    let procDuringMux: unknown;
    vi.mocked(muxSubtitlesIntoVideo).mockImplementationOnce(async (opts) => {
      const fakeProc = {};
      opts.onSpawn(fakeProc as never);
      procDuringMux = fakeProc;
      return { ok: true, outputPath: '/tmp/video.mkv' };
    });
    const ctx = makeCtx(SUCCESS, {
      mediaPath: '/tmp/video.mp4',
      subtitlePaths: ['/tmp/video.en.srt'],
    });
    await SidecarSubsPhase(true).run(ctx);
    expect(procDuringMux).toBeDefined();
    // ffmpegProcess is cleared after mux completes
    expect(ctx.active.ffmpegProcess).toBeUndefined();
  });
});
