import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FormatProbeService } from '@main/services/FormatProbeService';
import { YtDlp } from '@main/services/YtDlp';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

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

const MINIMAL_JSON = JSON.stringify({
  title: 'Test Video',
  thumbnail: 'https://example.com/thumb.jpg',
  formats: [
    { format_id: '22', ext: 'mp4', resolution: '720p', vcodec: 'avc1', acodec: 'mp4a', fps: 30 }
  ]
});

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
    ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue(null),
    ensureFFprobe: vi.fn().mockResolvedValue(null)
  };
  const logService = { log: vi.fn() };
  const settingsStore = { get: vi.fn().mockResolvedValue({}) };

  const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
  const service = new FormatProbeService(ytDlp, logService as never);

  return { service, tokenService };
}

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('FormatProbeService — extractor args', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', MINIMAL_JSON) as never);
  });

  it('uses web.gvs context and includes visitor_data in extractor-args', async () => {
    const { service } = makeService({ token: 'TOK', visitorData: 'VD' });

    await service.getFormats(YOUTUBE_URL);

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    const idx = args.indexOf('--extractor-args');
    expect(args[idx + 1]).toContain('web.gvs+TOK');
    expect(args[idx + 1]).toContain('visitor_data=VD');
    expect(args).not.toContain('--no-warnings');
  });

  it('omits visitor_data when empty string', async () => {
    const { service } = makeService({ token: 'TOK', visitorData: '' });

    await service.getFormats(YOUTUBE_URL);

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    const idx = args.indexOf('--extractor-args');
    expect(args[idx + 1]).not.toContain('visitor_data');
  });
});

describe('FormatProbeService — error surfacing', () => {
  it('surfaces raw ERROR: line for private video (renderer translates)', async () => {
    const stderrMsg = 'ERROR: [youtube] abc: Private video';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, stderrMsg) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('ERROR: [youtube] abc: Private video');
    }
  });

  it('surfaces raw ERROR: line for unrecognized errors', async () => {
    const stderrMsg = 'ERROR: [youtube] abc: Unsupported URL';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, stderrMsg) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('ERROR: [youtube] abc: Unsupported URL');
    }
  });
});

describe('FormatProbeService — bot-block retry', () => {
  it('retries once on bot-block and succeeds', async () => {
    const botStderr = "ERROR: [youtube] abc: Sign in to confirm you're not a bot.";

    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, botStderr) as never)
      .mockReturnValueOnce(makeFakeProcess(0, '', MINIMAL_JSON) as never);

    const { service, tokenService } = makeService();
    tokenService.mintTokenForUrl
      .mockResolvedValueOnce({ token: 'old-token', visitorData: 'old-visitor' })
      .mockResolvedValueOnce({ token: 'new-token', visitorData: 'new-visitor' });

    const result = await service.getFormats(YOUTUBE_URL);

    expect(tokenService.invalidateCache).toHaveBeenCalledOnce();
    expect(tokenService.mintTokenForUrl).toHaveBeenCalledTimes(2);
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe('Test Video');
    }
  });

  it('escalates to player_client fallback when both PoT attempts bot-block', async () => {
    const botStderr = "ERROR: [youtube] abc: Sign in to confirm you're not a bot.";

    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, botStderr) as never)
      .mockReturnValueOnce(makeFakeProcess(1, botStderr) as never)
      .mockReturnValueOnce(makeFakeProcess(1, botStderr) as never);

    const { service, tokenService } = makeService();

    const result = await service.getFormats(YOUTUBE_URL);

    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(3);
    expect(tokenService.invalidateCache).toHaveBeenCalledOnce();
    expect(result.ok).toBe(false);

    // Third attempt was the no-PoT fallback path.
    const fallbackArgs: string[] = vi.mocked(spawnYtDlp).mock.calls[2][1];
    const idx = fallbackArgs.indexOf('--extractor-args');
    expect(fallbackArgs[idx + 1]).toBe('youtube:player_client=default,-web,-web_safari');
  });
});
