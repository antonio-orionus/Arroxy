import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FormatProbeService } from '@main/services/FormatProbeService';

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

function makeService() {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'mock-token', visitorData: 'mock-visitor' }),
    invalidateCache: vi.fn()
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg')
  };
  const logService = { log: vi.fn() };
  const service = new FormatProbeService(binaryManager as never, tokenService as never, logService as never, false);
  return { service };
}

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const BASE_FORMAT = { format_id: '22', ext: 'mp4', resolution: '720p', vcodec: 'avc1', acodec: 'mp4a', fps: 30 };

describe('FormatProbeService — subtitle parsing', () => {
  it('forwards subtitles and automatic_captions from yt-dlp JSON', async () => {
    const json = JSON.stringify({
      title: 'Test Video',
      thumbnail: 'https://example.com/thumb.jpg',
      formats: [BASE_FORMAT],
      subtitles: {
        en: [{ ext: 'vtt', name: 'English' }, { ext: 'json3' }],
        es: [{ ext: 'vtt' }]
      },
      automatic_captions: {
        'en-orig': [{ ext: 'vtt' }],
        'ja-orig': [{ ext: 'vtt', name: '日本語' }]
      }
    });
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', json) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.subtitles).toEqual({
      en: [{ ext: 'vtt', name: 'English' }, { ext: 'json3' }],
      es: [{ ext: 'vtt' }]
    });
    expect(result.data.automaticCaptions).toEqual({
      'en-orig': [{ ext: 'vtt' }],
      'ja-orig': [{ ext: 'vtt', name: '日本語' }]
    });
  });

  it('drops translation-only entries from automatic_captions (keeps only -orig)', async () => {
    const json = JSON.stringify({
      title: 'Test Video',
      thumbnail: '',
      formats: [BASE_FORMAT],
      automatic_captions: {
        'en-orig': [{ ext: 'vtt' }],
        hy: [{ ext: 'vtt' }],
        eu: [{ ext: 'vtt' }],
        el: [{ ext: 'vtt' }]
      }
    });
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', json) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.automaticCaptions).toEqual({
      'en-orig': [{ ext: 'vtt' }]
    });
  });

  it('normalizes missing subtitle fields to empty objects', async () => {
    const json = JSON.stringify({
      title: 'Test Video',
      thumbnail: '',
      formats: [BASE_FORMAT]
      // no subtitles / automatic_captions
    });
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', json) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.subtitles).toEqual({});
    expect(result.data.automaticCaptions).toEqual({});
  });

  it('drops tracks that have no ext field', async () => {
    const json = JSON.stringify({
      title: 'Test Video',
      thumbnail: '',
      formats: [BASE_FORMAT],
      subtitles: {
        en: [{ ext: 'vtt', name: 'English' }, { name: 'No ext track' }]
      },
      automatic_captions: {}
    });
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', json) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.subtitles).toEqual({
      en: [{ ext: 'vtt', name: 'English' }]
    });
  });

  it('drops live_chat from automatic_captions', async () => {
    const json = JSON.stringify({
      title: 'Test Video',
      thumbnail: '',
      formats: [BASE_FORMAT],
      automatic_captions: {
        'en-orig': [{ ext: 'vtt' }],
        live_chat: [{ ext: 'json3' }]
      }
    });
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', json) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.automaticCaptions).toEqual({ 'en-orig': [{ ext: 'vtt' }] });
    expect(result.data.automaticCaptions).not.toHaveProperty('live_chat');
  });

  it('drops language keys whose entire track list is filtered out', async () => {
    const json = JSON.stringify({
      title: 'Test Video',
      thumbnail: '',
      formats: [BASE_FORMAT],
      subtitles: {
        en: [{ name: 'No ext' }]
      }
    });
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', json) as never);

    const { service } = makeService();
    const result = await service.getFormats(YOUTUBE_URL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.subtitles).toEqual({});
  });
});
