import { describe, expect, it, vi, beforeEach } from 'vitest';
import { YtDlp } from '@main/services/YtDlp.js';
import { createTranscriptProcess } from '../helpers/processTranscript.js';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process.js')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process.js';

const URL = 'https://www.youtube.com/watch?v=test';
const BOT_STDERR = "ERROR: [youtube] abc: Sign in to confirm you're not a bot.";

function makeFakeProcess(exitCode: number, stderr = '') {
  return createTranscriptProcess(stderr ? [{ stream: 'stderr', data: stderr }, { close: exitCode }] : [{ close: exitCode }]);
}

function makeYtDlp(tokenService?: { mintTokenForUrl: ReturnType<typeof vi.fn>; invalidateCache: ReturnType<typeof vi.fn> }) {
  const ts = tokenService ?? {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'tok', visitorData: 'vd', fromCache: false }),
    invalidateCache: vi.fn()
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue(null),
    ensureFFprobe: vi.fn().mockResolvedValue(null)
  };
  const settingsStore = { get: vi.fn().mockResolvedValue({}) };
  return {
    ytDlp: new YtDlp(binaryManager as never, ts as never, settingsStore as never),
    tokenService: ts
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('YtDlp — retry ladder', () => {
  it('happy path: attempt 0 succeeds → result success, usedExtractorFallback=false', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never);
    const { ytDlp } = makeYtDlp();

    const result = await ytDlp.run({ kind: 'video', url: URL, outputDir: '/tmp' });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') expect(result.usedExtractorFallback).toBe(false);
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);
  });

  it('bot-block then success: invalidateCache called, attempt 1 uses new token', async () => {
    vi.mocked(spawnYtDlp)
      .mockImplementationOnce(() => makeFakeProcess(1, BOT_STDERR) as never)
      .mockImplementationOnce(() => makeFakeProcess(0) as never);

    const { ytDlp, tokenService } = makeYtDlp();
    tokenService.mintTokenForUrl.mockResolvedValueOnce({ token: 'old-tok', visitorData: 'vd', fromCache: false }).mockResolvedValueOnce({ token: 'new-tok', visitorData: 'vd', fromCache: false });

    const result = await ytDlp.run({ kind: 'video', url: URL, outputDir: '/tmp' });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') expect(result.usedExtractorFallback).toBe(false);
    expect(tokenService.invalidateCache).toHaveBeenCalledOnce();
    expect(tokenService.mintTokenForUrl).toHaveBeenCalledTimes(2);
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);

    const retryArgs: string[] = vi.mocked(spawnYtDlp).mock.calls[1][1];
    expect(retryArgs[retryArgs.indexOf('--extractor-args') + 1]).toContain('new-tok');
  });

  it('two bot-blocks → attempt 2 uses player_client fallback, usedExtractorFallback=true', async () => {
    vi.mocked(spawnYtDlp)
      .mockImplementationOnce(() => makeFakeProcess(1, BOT_STDERR) as never)
      .mockImplementationOnce(() => makeFakeProcess(1, BOT_STDERR) as never)
      .mockImplementationOnce(() => makeFakeProcess(0) as never);

    const { ytDlp, tokenService } = makeYtDlp();

    const result = await ytDlp.run({ kind: 'video', url: URL, outputDir: '/tmp' });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') expect(result.usedExtractorFallback).toBe(true);
    expect(tokenService.invalidateCache).toHaveBeenCalledOnce();
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(3);

    const fallbackArgs: string[] = vi.mocked(spawnYtDlp).mock.calls[2][1];
    expect(fallbackArgs[fallbackArgs.indexOf('--extractor-args') + 1]).toBe('youtube:player_client=default,-web,-web_safari');
  });

  it('first mint throws → skips to fallback, usedExtractorFallback=true', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never);

    const { ytDlp, tokenService } = makeYtDlp();
    tokenService.mintTokenForUrl.mockRejectedValueOnce(new Error('provider offline'));

    const result = await ytDlp.run({ kind: 'video', url: URL, outputDir: '/tmp' });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') expect(result.usedExtractorFallback).toBe(true);
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);

    const fallbackArgs: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    expect(fallbackArgs[fallbackArgs.indexOf('--extractor-args') + 1]).toBe('youtube:player_client=default,-web,-web_safari');
  });

  it('re-mint throws → falls back to player_client fallback', async () => {
    vi.mocked(spawnYtDlp)
      .mockImplementationOnce(() => makeFakeProcess(1, BOT_STDERR) as never)
      .mockImplementationOnce(() => makeFakeProcess(0) as never);

    const { ytDlp, tokenService } = makeYtDlp();
    tokenService.mintTokenForUrl.mockResolvedValueOnce({ token: 'tok', visitorData: 'vd', fromCache: false }).mockRejectedValueOnce(new Error('re-mint failed'));

    const result = await ytDlp.run({ kind: 'video', url: URL, outputDir: '/tmp' });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') expect(result.usedExtractorFallback).toBe(true);
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);
  });

  it('non-botBlock exit-error returns immediately without retry', async () => {
    const ipBlockStderr = 'ERROR: [youtube] All player responses are invalid. Your IP is likely being blocked by Youtube';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, ipBlockStderr) as never);

    const { ytDlp, tokenService } = makeYtDlp();

    const result = await ytDlp.run({ kind: 'video', url: URL, outputDir: '/tmp' });

    expect(result.kind).toBe('exit-error');
    expect(tokenService.invalidateCache).not.toHaveBeenCalled();
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);
  });

  it('spawn error returns kind: spawn-error immediately', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(createTranscriptProcess([{ error: new Error('ENOENT') }]) as never);

    const { ytDlp } = makeYtDlp();
    const result = await ytDlp.run({ kind: 'video', url: URL, outputDir: '/tmp' });

    expect(result.kind).toBe('spawn-error');
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);
  });

  it('effectiveSubtitleFormat is passed through on subtitle success', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never);
    const { ytDlp } = makeYtDlp();

    const result = await ytDlp.run({
      kind: 'subtitle',
      url: URL,
      outputDir: '/tmp',
      subtitleLanguages: ['en'],
      subtitleFormat: 'ass',
      writeAutoSubs: true
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') expect(result.effectiveSubtitleFormat).toBe('srt');
  });
});
