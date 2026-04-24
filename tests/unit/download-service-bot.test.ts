import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DownloadService } from '@main/services/DownloadService';

vi.mock('@main/utils/process', () => ({
  spawnYtDlp: vi.fn()
}));

import { spawnYtDlp } from '@main/utils/process';

beforeEach(() => { vi.clearAllMocks(); });

function makeFakeProcess(exitCode: number, stderr = '', stdout = '') {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn()
  });
  setTimeout(() => {
    if (stderr) proc.stderr.emit('data', Buffer.from(stderr));
    if (stdout) proc.stdout.emit('data', Buffer.from(stdout));
    proc.emit('close', exitCode);
  }, 10);
  return proc;
}

function makeService(tokenOverrides: { token?: string; visitorData?: string } = {}) {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({
      token: tokenOverrides.token ?? 'mock-token',
      visitorData: tokenOverrides.visitorData ?? 'mock-visitor'
    }),
    invalidateCache: vi.fn()
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg')
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const logService = { log: vi.fn() };

  const service = new DownloadService(
    binaryManager as never,
    tokenService as never,
    recentJobsStore as never,
    logService as never,
    false // non-mock mode — uses real spawnYtDlp
  );

  return { service, tokenService, recentJobsStore, binaryManager };
}

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('DownloadService — extractor args', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never);
  });

  it('uses web.gvs context and passes visitor_data in extractor-args', async () => {
    const { service } = makeService({ token: 'TOK', visitorData: 'VD' });

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 50));

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    const extractorArgsIdx = args.indexOf('--extractor-args');
    const extractorArgsValue = args[extractorArgsIdx + 1];

    expect(extractorArgsValue).toContain('web.gvs+TOK');
    expect(extractorArgsValue).toContain('visitor_data=VD');
    expect(args).not.toContain('--no-warnings');
  });

  it('omits visitor_data when empty string', async () => {
    const { service } = makeService({ token: 'TOK', visitorData: '' });

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 50));

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    const extractorArgsIdx = args.indexOf('--extractor-args');
    const extractorArgsValue = args[extractorArgsIdx + 1];

    expect(extractorArgsValue).toContain('web.gvs+TOK');
    expect(extractorArgsValue).not.toContain('visitor_data');
  });
});

describe('DownloadService — error surfacing', () => {
  it('surfaces actual ERROR: line instead of generic exit-code message', async () => {
    const stderrMsg = 'ERROR: [youtube] abc: Video unavailable. The uploader has not made this video available in your country.';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, stderrMsg) as never);

    const { service, recentJobsStore } = makeService();
    const statuses: string[] = [];
    service.on('status', (ev) => statuses.push(ev.message));

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 100));

    const errorStatus = statuses.find((m) => m.startsWith('ERROR:'));
    expect(errorStatus).toBe(stderrMsg.trim());
    const finalized = recentJobsStore.push.mock.calls[0]?.[0];
    expect(finalized?.errorMessage).toBe(stderrMsg.trim());
  });
});

describe('DownloadService — bot-block retry', () => {
  it('retries once with fresh token on bot-block', async () => {
    const botStderr = "ERROR: [youtube] abc: Sign in to confirm you're not a bot.";

    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, botStderr) as never)  // first attempt fails
      .mockReturnValueOnce(makeFakeProcess(0) as never);              // retry succeeds

    const { service, tokenService, recentJobsStore } = makeService();
    tokenService.mintTokenForUrl
      .mockResolvedValueOnce({ token: 'old-token', visitorData: 'old-visitor' })
      .mockResolvedValueOnce({ token: 'new-token', visitorData: 'new-visitor' });

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 150));

    expect(tokenService.invalidateCache).toHaveBeenCalledOnce();
    expect(tokenService.mintTokenForUrl).toHaveBeenCalledTimes(2);
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);

    // Second spawn uses new token
    const retryArgs: string[] = vi.mocked(spawnYtDlp).mock.calls[1][1];
    const idx = retryArgs.indexOf('--extractor-args');
    expect(retryArgs[idx + 1]).toContain('new-token');

    const finalized = recentJobsStore.push.mock.calls[0]?.[0];
    expect(finalized?.status).toBe('completed');
  });

  it('does not retry a second time when retry also bot-blocks', async () => {
    const botStderr = "ERROR: [youtube] abc: Sign in to confirm you're not a bot.";

    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, botStderr) as never)
      .mockReturnValueOnce(makeFakeProcess(1, botStderr) as never);

    const { service, tokenService, recentJobsStore } = makeService();

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 150));

    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);
    expect(tokenService.invalidateCache).toHaveBeenCalledOnce(); // only once

    const finalized = recentJobsStore.push.mock.calls[0]?.[0];
    expect(finalized?.status).toBe('failed');
  });

  it('does not retry on ip_block', async () => {
    const ipBlockStderr = 'ERROR: [youtube] All player responses are invalid. Your IP is likely being blocked by Youtube';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, ipBlockStderr) as never);

    const { service, tokenService, recentJobsStore } = makeService();

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 100));

    expect(tokenService.invalidateCache).not.toHaveBeenCalled();
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);

    const finalized = recentJobsStore.push.mock.calls[0]?.[0];
    expect(finalized?.status).toBe('failed');
  });
});
