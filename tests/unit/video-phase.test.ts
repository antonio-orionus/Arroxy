import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoPhase } from '@main/services/phases/VideoPhase.js';
import { STATUS_KEY } from '@shared/schemas.js';
import { AsyncStack } from '@main/services/phases/types.js';
import type { PhaseContext, ActiveDownload } from '@main/services/phases/types.js';
import type { DownloadJob, StartDownloadInput } from '@shared/types.js';
import type { PreparedJob, EmbedOptions, SponsorBlockOptions } from '@shared/preparedJob.js';
import type { YtDlpResult } from '@main/services/YtDlp.js';

const EMBED_OFF: EmbedOptions = { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false };
const SB_OFF: SponsorBlockOptions = { mode: 'off' };

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

const BASE_JOB: PreparedJob = {
  kind: 'single-format',
  extractor: 'youtube',
  extractorKey: 'Youtube',
  formatId: 'bv+ba',
  preset: 'custom',
  sponsorBlock: SB_OFF,
  embed: EMBED_OFF,
  subtitles: { languages: ['en', 'ja'], mode: 'embed', format: 'vtt', writeAuto: false }
};

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
    subtitlePaths: [],
    disposables: new AsyncStack(),
    ...overrides
  };
}

function makeCtx(runResult: YtDlpResult, activeOverrides: Partial<ActiveDownload> = {}): PhaseContext & { runMock: ReturnType<typeof vi.fn> } {
  const runMock = vi.fn().mockImplementation((_req, signal) => {
    return Promise.resolve(runResult).then((r) => {
      signal?.onMinting?.(0);
      return r;
    });
  });

  const ctx: PhaseContext = {
    active: makeActive(activeOverrides),
    signal: new AbortController().signal,
    register: () => undefined,
    ytDlp: { run: runMock, ffmpegPath: '/fake/ffmpeg' } as never,
    emitStatus: vi.fn(),
    safeConsume: vi.fn()
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
  errorKind: 'botBlock',
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

  it('forwards a single-mode outputTemplate to yt-dlp', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: {
        ...BASE_INPUT,
        job: { ...BASE_JOB, outputTemplate: '%(title).200B [%(id)s].%(ext)s' }
      }
    });
    await VideoPhase(false).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.outputTemplate).toBe('%(title).200B [%(id)s].%(ext)s');
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

  it('exit-error → hard-failed with classified error payload', async () => {
    const ctx = makeCtx(EXIT_ERROR);
    const outcome = await VideoPhase(false).run(ctx);
    expect(outcome.kind).toBe('hard-failed');
    if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('botBlock');
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', expect.any(String), expect.any(Object), expect.objectContaining({ kind: 'botBlock' }));
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
      input: { ...BASE_INPUT, job: { ...BASE_JOB, subtitles: undefined } }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.kind).toBe('video');
  });

  it('embed=true with empty subtitleLanguages → falls back to video kind', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, job: { ...BASE_JOB, subtitles: undefined } }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.kind).toBe('video');
  });

  it('audio-convert jobs keep audioConvert when subtitles are embedded', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: {
        ...BASE_INPUT,
        job: {
          kind: 'audio-convert',
          extractor: 'youtube',
          extractorKey: 'Youtube',
          audioConvert: { target: 'mp3', bitrateKbps: 192 },
          preset: 'audio-only',
          sponsorBlock: SB_OFF,
          embed: EMBED_OFF,
          subtitles: { languages: ['en'], mode: 'embed', format: 'vtt', writeAuto: false }
        }
      }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.kind).toBe('video+embed');
    expect(req.audioConvert).toEqual({ target: 'mp3', bitrateKbps: 192 });
  });
});

describe('VideoPhase — sidecar field propagation', () => {
  it('writeDescription propagates to YtDlpRequest (video kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, job: { ...BASE_JOB, subtitles: undefined, embed: { ...EMBED_OFF, description: true } } }
    });
    await VideoPhase(false).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.writeDescription).toBe(true);
  });

  it('writeThumbnail propagates to YtDlpRequest (video kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, job: { ...BASE_JOB, subtitles: undefined, embed: { ...EMBED_OFF, thumbnailSidecar: true } } }
    });
    await VideoPhase(false).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.writeThumbnail).toBe(true);
  });

  it('writeDescription propagates to YtDlpRequest (video+embed kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, job: { ...BASE_JOB, embed: { ...EMBED_OFF, description: true } } }
    });
    await VideoPhase(true).run(ctx);
    const [req] = ctx.runMock.mock.calls[0];
    expect(req.writeDescription).toBe(true);
  });

  it('writeThumbnail propagates to YtDlpRequest (video+embed kind)', async () => {
    const ctx = makeCtx(SUCCESS, {
      input: { ...BASE_INPUT, job: { ...BASE_JOB, embed: { ...EMBED_OFF, thumbnailSidecar: true } } }
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
      signal: new AbortController().signal,
      register: () => undefined,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
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
      signal: new AbortController().signal,
      register: () => undefined,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };
    runMock.mockImplementationOnce(async () => {
      ctx.active.pauseRequested = true;
      return SUCCESS;
    });

    const outcome = await VideoPhase(false).run(ctx);
    expect(outcome.kind).toBe('paused');
  });
});

describe('VideoPhase — temp dir lifecycle (real fs)', () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), 'arroxy-vp-'));
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  function makeRealCtx(activeOverrides: Partial<ActiveDownload>): PhaseContext & { runMock: ReturnType<typeof vi.fn> } {
    const job = makeJob();
    job.outputDir = outputDir;
    const input: StartDownloadInput = { ...BASE_INPUT, outputDir, job: BASE_JOB };
    const runMock = vi.fn().mockResolvedValue(SUCCESS);
    const realController = new AbortController();
    const ctx: PhaseContext = {
      active: { job, input, controller: realController, signal: realController.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack(), ...activeOverrides },
      signal: realController.signal,
      register: () => undefined,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };
    return Object.assign(ctx, { runMock });
  }

  it('fresh start (active.tempDir undefined) → wipes existing temp dir contents', async () => {
    const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8));
    await mkdir(expectedTempDir, { recursive: true });
    const stalePart = join(expectedTempDir, 'leftover.f137.webm.part');
    await writeFile(stalePart, 'stale');

    const ctx = makeRealCtx({});
    await VideoPhase(false).run(ctx);

    await expect(access(stalePart)).rejects.toThrow();
    expect(ctx.active.tempDir).toBe(expectedTempDir);
  });

  it('resume (active.tempDir already set) → preserves .part file in temp dir', async () => {
    const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8));
    await mkdir(expectedTempDir, { recursive: true });
    const partFile = join(expectedTempDir, 'video.f337.webm.part');
    await writeFile(partFile, 'partial-bytes');

    const ctx = makeRealCtx({ tempDir: expectedTempDir });
    await VideoPhase(false).run(ctx);

    await expect(access(partFile)).resolves.toBeUndefined();
    expect(ctx.active.tempDir).toBe(expectedTempDir);
  });

  it('resume w/ cached _arroxy.info.json → passes loadInfoJsonPath to ytDlp.run', async () => {
    const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8));
    await mkdir(expectedTempDir, { recursive: true });
    const infoJsonPath = join(expectedTempDir, '_arroxy.info.json');
    await writeFile(infoJsonPath, '{}');

    const ctx = makeRealCtx({ tempDir: expectedTempDir });
    await VideoPhase(false).run(ctx);

    const [req] = ctx.runMock.mock.calls[0];
    expect(req.loadInfoJsonPath).toBe(infoJsonPath);
  });

  it('resume w/o cached info.json → loadInfoJsonPath undefined', async () => {
    const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8));
    await mkdir(expectedTempDir, { recursive: true });

    const ctx = makeRealCtx({ tempDir: expectedTempDir });
    await VideoPhase(false).run(ctx);

    const [req] = ctx.runMock.mock.calls[0];
    expect(req.loadInfoJsonPath).toBeUndefined();
  });

  it('fresh start → loadInfoJsonPath undefined even if stale info.json existed (tempDir wiped)', async () => {
    const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8));
    await mkdir(expectedTempDir, { recursive: true });
    await writeFile(join(expectedTempDir, '_arroxy.info.json'), '{}');

    const ctx = makeRealCtx({});
    await VideoPhase(false).run(ctx);

    const [req] = ctx.runMock.mock.calls[0];
    expect(req.loadInfoJsonPath).toBeUndefined();
  });

  it('resume with missing temp dir → mkdir recreates it without throwing', async () => {
    const expectedTempDir = join(outputDir, '.arroxy-temp', 'job-1'.slice(0, 8));

    const ctx = makeRealCtx({ tempDir: expectedTempDir });
    const outcome = await VideoPhase(false).run(ctx);

    expect(outcome.kind).toBe('continue');
    await expect(access(expectedTempDir)).resolves.toBeUndefined();
  });
});

describe('VideoPhase — signal callbacks', () => {
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

    await VideoPhase(false).run(ctx);

    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.mintingToken);
    expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('token', STATUS_KEY.remintingToken);
  });

  it('fallback attempt → does not emit any status (onMinting never fires for fallback)', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, _signal) => SUCCESS);
    const ctx: PhaseContext = {
      active: makeActive(),
      signal: new AbortController().signal,
      register: () => undefined,
      ytDlp: { run: runMock } as never,
      emitStatus: vi.fn(),
      safeConsume: vi.fn()
    };

    await VideoPhase(false).run(ctx);

    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled();
  });

  it('onSpawn → assigns process to active and registers SIGKILL disposable (no preemptive status)', async () => {
    const fakeProc = Object.assign(new EventEmitter(), { kill: vi.fn() });
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onSpawn?.(fakeProc as never);
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

    await VideoPhase(false).run(ctx);

    expect(active.ytDlpProcess).toBe(fakeProc);
    expect(registerSpy).toHaveBeenCalled();
    // No preemptive status emit on spawn (token attempts only).
    expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalledWith('download', expect.anything());
  });

  it('onStdout/onStderr → calls safeConsume', async () => {
    const runMock = vi.fn().mockImplementation(async (_req, signal) => {
      signal?.onStdout?.('stdout line\n');
      signal?.onStderr?.('stderr line\n');
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

    await VideoPhase(false).run(ctx);

    expect(ctx.safeConsume).toHaveBeenCalledWith('stdout line\n');
    expect(ctx.safeConsume).toHaveBeenCalledWith('stderr line\n');
  });
});
