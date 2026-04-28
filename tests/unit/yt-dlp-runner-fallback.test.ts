import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { runYtDlp } from '@main/services/ytDlpRunner';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process';

beforeEach(() => { vi.clearAllMocks(); });

const URL = 'https://www.youtube.com/watch?v=test';
const BOT_STDERR = "ERROR: [youtube] abc: Sign in to confirm you're not a bot.";

function fakeProc(exitCode: number, stderr = '') {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn()
  });
  setTimeout(() => {
    if (stderr) proc.stderr.emit('data', Buffer.from(stderr));
    proc.emit('close', exitCode);
  }, 5);
  return proc as never;
}

function tokenSvc() {
  return {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'tok', visitorData: 'vd' }),
    invalidateCache: vi.fn()
  };
}

function callArgs(callIndex: number): string[] {
  return vi.mocked(spawnYtDlp).mock.calls[callIndex][1] as string[];
}

describe('runYtDlp — 3-attempt ladder', () => {
  it('attempt 0 succeeds: no extractor fallback used', async () => {
    vi.mocked(spawnYtDlp).mockReturnValueOnce(fakeProc(0));
    const token = tokenSvc();

    const result = await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: token
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.usedExtractorFallback).toBe(false);
    }
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);
    expect(callArgs(0)[1]).toContain('po_token=web.gvs+tok');
  });

  it('botBlock → re-mint succeeds: no fallback used', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(0));
    const token = tokenSvc();
    token.mintTokenForUrl
      .mockResolvedValueOnce({ token: 'old', visitorData: 'vd' })
      .mockResolvedValueOnce({ token: 'new', visitorData: 'vd' });

    const result = await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: token
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.usedExtractorFallback).toBe(false);
    }
    expect(token.invalidateCache).toHaveBeenCalledOnce();
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);
    expect(callArgs(1)[1]).toContain('po_token=web.gvs+new');
  });

  it('botBlock → re-mint botBlock → fallback succeeds: usedExtractorFallback=true', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(0));
    const token = tokenSvc();
    const onAttempt = vi.fn();

    const result = await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: token,
      onAttempt
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.usedExtractorFallback).toBe(true);
    }
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(3);
    expect(onAttempt.mock.calls.map((c) => c[0])).toEqual([0, 1, 2]);
    // Final attempt must NOT use po_token; must use the player_client filter.
    const lastArgs = callArgs(2);
    expect(lastArgs[1]).toBe('youtube:player_client=default,-web,-web_safari');
    expect(lastArgs[1]).not.toContain('po_token');
  });

  it('first mint throws → skips both PoT attempts and goes straight to fallback', async () => {
    vi.mocked(spawnYtDlp).mockReturnValueOnce(fakeProc(0));
    const token = tokenSvc();
    token.mintTokenForUrl.mockRejectedValueOnce(new Error('WebPoClient global not found'));
    const onAttempt = vi.fn();

    const result = await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: token,
      onAttempt
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.usedExtractorFallback).toBe(true);
    }
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);
    expect(onAttempt.mock.calls.map((c) => c[0])).toEqual([0, 2]);
    expect(callArgs(0)[1]).toBe('youtube:player_client=default,-web,-web_safari');
  });

  it('re-mint throws → goes straight to fallback', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(0));
    const token = tokenSvc();
    token.mintTokenForUrl
      .mockResolvedValueOnce({ token: 'tok', visitorData: 'vd' })
      .mockRejectedValueOnce(new Error('SDF:notready timeout'));

    const result = await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: token
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.usedExtractorFallback).toBe(true);
    }
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);
    expect(callArgs(1)[1]).toBe('youtube:player_client=default,-web,-web_safari');
  });

  it('non-botBlock failure on attempt 0 surfaces immediately (no retry)', async () => {
    const ipBlock = 'ERROR: [youtube] abc: Your IP is likely being blocked by Youtube';
    vi.mocked(spawnYtDlp).mockReturnValueOnce(fakeProc(1, ipBlock));
    const token = tokenSvc();

    const result = await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: token
    });

    expect(result.kind).toBe('exit-error');
    expect(token.invalidateCache).not.toHaveBeenCalled();
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);
  });

  it('all three attempts botBlock → final exit-error surfaces', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR));
    const token = tokenSvc();

    const result = await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: token
    });

    expect(result.kind).toBe('exit-error');
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(3);
  });

  it('cookies path is still injected on the fallback attempt', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(1, BOT_STDERR))
      .mockReturnValueOnce(fakeProc(0));

    await runYtDlp({
      url: URL,
      ytDlpPath: '/yt-dlp',
      ffmpegPath: null,
      args: [URL],
      tokenService: tokenSvc(),
      cookiesPath: '/c.txt'
    });

    const last = callArgs(2);
    const idx = last.indexOf('--cookies');
    expect(idx).toBeGreaterThan(-1);
    expect(last[idx + 1]).toBe('/c.txt');
  });
});
