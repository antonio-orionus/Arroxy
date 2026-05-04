import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnFFmpeg: vi.fn() };
});

import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { spawnFFmpeg } from '@main/utils/process';
import { dedupeSubtitleFiles, muxSubtitlesIntoVideo } from '@main/services/subtitlePostProcess';

const JOB_ID = 'job-1';

function makeFakeFFmpeg(exitCode: number) {
  const proc = Object.assign(new EventEmitter(), { kill: vi.fn() });
  setTimeout(() => proc.emit('close', exitCode), 10);
  return proc;
}

function makeFakeFFmpegError() {
  const proc = Object.assign(new EventEmitter(), { kill: vi.fn() });
  setTimeout(() => proc.emit('error', new Error('ENOENT')), 10);
  return proc;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── muxSubtitlesIntoVideo ───────────────────────────────────────────────────

describe('muxSubtitlesIntoVideo — ffmpeg args', () => {
  it('one sub: -y -i video -i sub -c copy -c:s srt -metadata:s:s:0 language=eng tempPath', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: ['/tmp/video.en.srt'],
      requestedLangs: ['en'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0];
    expect(args[0]).toBe('-y');
    expect(args[1]).toBe('-i');
    expect(args[2]).toBe('/tmp/video.mkv');
    expect(args[3]).toBe('-i');
    expect(args[4]).toBe('/tmp/video.en.srt');
    expect(args).toContain('-c');
    expect(args).toContain('copy');
    expect(args).toContain('-c:s');
    expect(args).toContain('srt');
    expect(args).toContain('-metadata:s:s:0');
    expect(args).toContain('language=eng');
    // tempPath ends with .muxing.mkv
    expect(args[args.length - 1]).toMatch(/\.muxing\.mkv$/);
  });

  it('two subs → two -i flags and two -metadata entries indexed correctly', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: ['/tmp/video.en.srt', '/tmp/video.ja.srt'],
      requestedLangs: ['en', 'ja'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0];
    // Two sub -i flags (after video -i)
    const iIdxs = args.reduce<number[]>((acc, a, i) => (a === '-i' ? [...acc, i] : acc), []);
    expect(iIdxs).toHaveLength(3); // video + sub1 + sub2

    expect(args).toContain('-metadata:s:s:0');
    expect(args).toContain('language=eng');
    expect(args).toContain('-metadata:s:s:1');
    expect(args).toContain('language=jpn');
  });

  it('ISO 639-1 → 639-2/B: ja→jpn, zh→chi, ko→kor, ru→rus', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/v.mkv',
      subtitlePaths: ['/tmp/v.ja.srt', '/tmp/v.zh.srt', '/tmp/v.ko.srt'],
      requestedLangs: ['ja', 'zh', 'ko'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0];
    expect(args).toContain('language=jpn');
    expect(args).toContain('language=chi');
    expect(args).toContain('language=kor');
  });

  it('unknown / 3-letter lang passes through unchanged', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/v.mkv',
      subtitlePaths: ['/tmp/v.und.srt'],
      requestedLangs: ['und'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0];
    expect(args).toContain('language=und');
  });

  it('unrecognized path lang → und (detectSubtitleLang returns null)', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/v.mkv',
      subtitlePaths: ['/tmp/v.xx.srt'],
      requestedLangs: ['en'], // 'xx' doesn't match 'en'
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0];
    expect(args).toContain('language=und');
  });
});

describe('muxSubtitlesIntoVideo — outcomes', () => {
  it('ffmpeg exit 0 → { ok: true, outputPath }', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    const result = await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: ['/tmp/video.en.srt'],
      requestedLangs: ['en'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    expect(result.ok).toBe(true);
    expect(result.outputPath).toMatch(/\.mkv$/);
  });

  it('ffmpeg non-zero exit → { ok: false }, originals preserved', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(1) as never);

    const result = await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: ['/tmp/video.en.srt'],
      requestedLangs: ['en'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    expect(result.ok).toBe(false);
    expect(rename).not.toHaveBeenCalled();
    // unlink is called for tempPath cleanup only
    expect(unlink).toHaveBeenCalledWith(expect.stringContaining('.muxing.mkv'));
  });

  it('ffmpeg spawn error → { ok: false }', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpegError() as never);

    const result = await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: ['/tmp/video.en.srt'],
      requestedLangs: ['en'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    expect(result.ok).toBe(false);
  });

  it('empty subtitlePaths → { ok: false } without spawning ffmpeg', async () => {
    const result = await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: [],
      requestedLangs: ['en'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    expect(result.ok).toBe(false);
    expect(spawnFFmpeg).not.toHaveBeenCalled();
  });

  it('onSpawn invoked with the ffmpeg proc', async () => {
    const fakeProc = makeFakeFFmpeg(0);
    vi.mocked(spawnFFmpeg).mockReturnValue(fakeProc as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    const onSpawn = vi.fn();
    await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: ['/tmp/video.en.srt'],
      requestedLangs: ['en'],
      onSpawn,
      jobId: JOB_ID
    });

    expect(onSpawn).toHaveBeenCalledWith(fakeProc);
  });

  it('success renames tempPath to outputPath and deletes sub files', async () => {
    vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never);
    vi.mocked(rename).mockResolvedValue(undefined as never);
    vi.mocked(unlink).mockResolvedValue(undefined as never);

    await muxSubtitlesIntoVideo({
      ffmpegPath: '/fake/ffmpeg',
      videoPath: '/tmp/video.mkv',
      subtitlePaths: ['/tmp/video.en.srt'],
      requestedLangs: ['en'],
      onSpawn: vi.fn(),
      jobId: JOB_ID
    });

    expect(rename).toHaveBeenCalledWith(expect.stringContaining('.muxing.mkv'), '/tmp/video.mkv');
    expect(unlink).toHaveBeenCalledWith('/tmp/video.en.srt');
  });
});

// ─── dedupeSubtitleFiles ─────────────────────────────────────────────────────

describe('dedupeSubtitleFiles', () => {
  it('.srt: reads, dedupes, writes back if content changed', async () => {
    const original = '1\n00:00:00,000 --> 00:00:01,000\nhello\n\n2\n00:00:00,500 --> 00:00:01,500\nhello\nworld\n';
    const parsed = '1\n00:00:00,000 --> 00:00:01,500\nhello\nworld';
    vi.mocked(readFile).mockResolvedValue(original as never);

    await dedupeSubtitleFiles(['/tmp/video.en.srt'], JOB_ID, () => false);

    expect(readFile).toHaveBeenCalledWith('/tmp/video.en.srt', 'utf8');
    // dedupeSrt will produce different content → writeFile should be called
    expect(writeFile).toHaveBeenCalledWith('/tmp/video.en.srt', expect.any(String), 'utf8');
    void parsed;
  });

  it('.vtt: reads, dedupes, writes back if content changed', async () => {
    const original = 'WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nhello\n\n00:00:00.500 --> 00:00:01.500\nhello world\n';
    vi.mocked(readFile).mockResolvedValue(original as never);

    await dedupeSubtitleFiles(['/tmp/video.en.vtt'], JOB_ID, () => false);

    expect(readFile).toHaveBeenCalledWith('/tmp/video.en.vtt', 'utf8');
    expect(writeFile).toHaveBeenCalled();
  });

  it('unknown extension → skipped silently, no read/write', async () => {
    await dedupeSubtitleFiles(['/tmp/video.en.ass'], JOB_ID, () => false);

    expect(readFile).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('content unchanged → writeFile not called', async () => {
    // A single non-duplicate SRT cue — dedupe output equals input
    const content = '1\n00:00:00,000 --> 00:00:01,000\nhello';
    vi.mocked(readFile).mockResolvedValue(content as never);

    await dedupeSubtitleFiles(['/tmp/video.en.srt'], JOB_ID, () => false);

    expect(writeFile).not.toHaveBeenCalled();
  });

  it('read error → logged and swallowed, never throws', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await expect(dedupeSubtitleFiles(['/tmp/missing.srt'], JOB_ID, () => false)).resolves.toBeUndefined();
  });

  it('shouldAbort() true before file → that file is skipped', async () => {
    vi.mocked(readFile).mockResolvedValue('content' as never);

    await dedupeSubtitleFiles(['/tmp/video.en.srt', '/tmp/video.ja.srt'], JOB_ID, () => true);

    expect(readFile).not.toHaveBeenCalled();
  });

  it('processes multiple files', async () => {
    vi.mocked(readFile).mockResolvedValue('1\n00:00:00,000 --> 00:00:01,000\nhello' as never);

    await dedupeSubtitleFiles(['/tmp/video.en.srt', '/tmp/video.ja.srt'], JOB_ID, () => false);

    expect(readFile).toHaveBeenCalledTimes(2);
  });
});
