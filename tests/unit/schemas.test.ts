import { describe, expect, it } from 'vitest';
import { isYouTubeUrl, startDownloadSchema, ytDlpInfoSchema, queueArraySchema, audioConvertSchema, MAX_SUBTITLE_LANGUAGES } from '@shared/schemas';

describe('isYouTubeUrl', () => {
  it.each(['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ', 'https://m.youtube.com/watch?v=abc', 'https://music.youtube.com/watch?v=abc'])('accepts %s', (url) => {
    expect(isYouTubeUrl(url)).toBe(true);
  });

  it.each(['https://example.com/watch?v=dQw4w9WgXcQ', 'https://youtube.evil.com/watch?v=abc', 'not a url', ''])('rejects %s', (url) => {
    expect(isYouTubeUrl(url)).toBe(false);
  });
});

describe('startDownloadSchema — subtitleLanguages regex', () => {
  function build(langs: string[]) {
    return startDownloadSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      subtitleLanguages: langs
    });
  }

  it.each([['en'], ['en-US'], ['pt-BR'], ['en-orig'], ['fr-CA-orig']])('accepts %j', (lang) => {
    expect(build([lang]).success).toBe(true);
  });

  it.each([
    ['x'], // single letter
    ['english'], // too long
    ['EN'], // uppercase primary
    ['en_US'], // underscore separator
    ['en-'] // trailing dash
  ])('rejects %j', (lang) => {
    expect(build([lang]).success).toBe(false);
  });

  it(`caps subtitle languages at MAX_SUBTITLE_LANGUAGES (${MAX_SUBTITLE_LANGUAGES})`, () => {
    const tooMany = Array.from({ length: MAX_SUBTITLE_LANGUAGES + 1 }, () => 'en');
    expect(build(tooMany).success).toBe(false);

    const justRight = Array.from({ length: MAX_SUBTITLE_LANGUAGES }, () => 'en');
    expect(build(justRight).success).toBe(true);
  });
});

describe('ytDlpInfoSchema — null normalization', () => {
  it('treats null filesize/fps/duration as undefined (not validation errors)', () => {
    const raw = {
      title: 'x',
      thumbnail: null,
      duration: null,
      formats: [{ format_id: '22', filesize: null, fps: null, abr: null, ext: 'mp4' }],
      subtitles: null,
      automatic_captions: null
    };
    const result = ytDlpInfoSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duration).toBeUndefined();
      expect(result.data.thumbnail).toBeUndefined();
      expect(result.data.formats?.[0].filesize).toBeUndefined();
      expect(result.data.formats?.[0].fps).toBeUndefined();
      expect(result.data.subtitles).toBeUndefined();
    }
  });

  it('passes through unknown fields without rejecting', () => {
    const raw = {
      title: 'x',
      _unknown_field_yt_dlp_added_in_2030: 'whatever',
      formats: [{ format_id: '22', _new_codec_field: 'av2' }]
    };
    expect(ytDlpInfoSchema.safeParse(raw).success).toBe(true);
  });

  it('accepts a fully-populated info object', () => {
    const raw = {
      title: 'x',
      thumbnail: 't.jpg',
      duration: 120,
      formats: [
        {
          format_id: '22',
          filesize: 1024,
          fps: 30,
          ext: 'mp4',
          resolution: '720p',
          vcodec: 'avc1',
          acodec: 'mp4a'
        }
      ],
      subtitles: { en: [{ ext: 'vtt', name: 'English' }] },
      automatic_captions: { 'en-orig': [{ ext: 'vtt' }] }
    };
    const result = ytDlpInfoSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });
});

describe('audioConvertSchema', () => {
  it.each([
    { target: 'mp3' as const, bitrateKbps: 128 as const },
    { target: 'mp3' as const, bitrateKbps: 192 as const },
    { target: 'mp3' as const, bitrateKbps: 256 as const },
    { target: 'mp3' as const, bitrateKbps: 320 as const },
    { target: 'm4a' as const, bitrateKbps: 192 as const },
    { target: 'opus' as const, bitrateKbps: 128 as const },
    { target: 'wav' as const },
    { target: 'wav' as const, bitrateKbps: 192 as const } // excess key permitted (non-strict object)
  ])('accepts %j', (value) => {
    expect(audioConvertSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    { target: 'flac' }, // unknown target
    { target: 'mp3' }, // missing bitrate for lossy
    { target: 'mp3', bitrateKbps: 96 }, // unsupported bitrate
    { target: 'mp3', bitrateKbps: 256000 }, // bps not kbps
    {} // missing target
  ])('rejects %j', (value) => {
    expect(audioConvertSchema.safeParse(value).success).toBe(false);
  });

  it('threads audioConvert through startDownloadSchema', () => {
    const parsed = startDownloadSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      audioConvert: { target: 'mp3', bitrateKbps: 192 }
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.audioConvert).toEqual({ target: 'mp3', bitrateKbps: 192 });
    }
  });
});

describe('queueArraySchema', () => {
  const valid = {
    id: 'a',
    url: 'u',
    title: 't',
    thumbnail: '',
    outputDir: '/tmp',
    formatLabel: 'Best',
    status: 'done',
    progressPercent: 100,
    progressDetail: null,
    lastStatus: null,
    error: null,
    finishedAt: null,
    downloadJobId: null,
    subtitleLanguages: [],
    writeAutoSubs: false,
    subtitleMode: 'sidecar',
    subtitleFormat: 'srt'
  };

  it('accepts an empty array', () => {
    expect(queueArraySchema.safeParse([]).success).toBe(true);
  });

  it('rejects a queue item with an unknown status', () => {
    expect(queueArraySchema.safeParse([{ ...valid, status: 'wat' }]).success).toBe(false);
  });

  it('rejects a queue item with an unknown subtitleMode', () => {
    expect(queueArraySchema.safeParse([{ ...valid, subtitleMode: 'magic' }]).success).toBe(false);
  });

  it('rejects when error.key is not a known YtdlpErrorKey', () => {
    expect(
      queueArraySchema.safeParse([
        {
          ...valid,
          status: 'error',
          error: { key: 'totallyMadeUp', rawMessage: 'oops' }
        }
      ]).success
    ).toBe(false);
  });
});
