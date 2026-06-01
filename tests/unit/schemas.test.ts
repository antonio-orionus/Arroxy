import { describe, expect, it } from 'vitest';
import { startDownloadSchema, queueArraySchema, audioConvertSchema, MAX_SUBTITLE_LANGUAGES, infoDictSchema, updateSettingsSchema, PLAYLIST_VIDEO_TIERS, probeSchema } from '@shared/schemas.js';
import { DEFAULTS } from '@shared/constants.js';

const IDENTITY = { extractor: 'youtube', extractorKey: 'Youtube' };

describe('startDownloadSchema — multi-site URL acceptance', () => {
  const BASE_EMBED = { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false };

  it('accepts non-YouTube URLs (multi-site)', () => {
    const result = startDownloadSchema.safeParse({
      url: 'https://vimeo.com/12345',
      job: { kind: 'single-format', ...IDENTITY, formatId: '137', preset: 'custom', sponsorBlock: { mode: 'off' }, embed: BASE_EMBED }
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-http/https URLs', () => {
    const result = startDownloadSchema.safeParse({
      url: 'ftp://example.com/file.mp4',
      job: { kind: 'single-format', ...IDENTITY, formatId: '137', preset: 'custom', sponsorBlock: { mode: 'off' }, embed: BASE_EMBED }
    });
    expect(result.success).toBe(false);
  });

  it('accepts subtitle-only job with languages', () => {
    const result = startDownloadSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      job: { kind: 'subtitle-only', ...IDENTITY, subtitles: { languages: ['en', 'en-US', 'pt-BR', 'en-orig'], mode: 'sidecar', format: 'srt', writeAuto: false } }
    });
    expect(result.success).toBe(true);
  });

  it('accepts single-format job', () => {
    const result = startDownloadSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      job: { kind: 'single-format', ...IDENTITY, formatId: '137+251', preset: 'custom', outputTemplate: '%(title).200B [%(id)s].%(ext)s', sponsorBlock: { mode: 'off' }, embed: BASE_EMBED }
    });
    expect(result.success).toBe(true);
  });

  it(`MAX_SUBTITLE_LANGUAGES (${MAX_SUBTITLE_LANGUAGES}) is exported and positive`, () => {
    expect(MAX_SUBTITLE_LANGUAGES).toBeGreaterThan(0);
  });
});

describe('playlist video tiers', () => {
  it('preserves highest-to-lowest presentation order', () => {
    expect(PLAYLIST_VIDEO_TIERS).toEqual(['best', '2160', '1440', '1080', '720', '480', '360']);
  });
});

describe('probeSchema — playlist scope', () => {
  const url = 'https://www.youtube.com/playlist?list=PLabc';

  it.each([{ items: { kind: 'app-limit' } }, { items: { kind: 'first', count: 50 } }, { items: { kind: 'range', from: 500, to: 600 } }])('accepts %j', (playlistScope) => {
    expect(probeSchema.safeParse({ url, playlistMode: 'playlist', playlistScope }).success).toBe(true);
  });

  it.each([{ items: { kind: 'first', count: 0 } }, { items: { kind: 'first', count: 1.5 } }, { items: { kind: 'range', from: 0, to: 10 } }, { items: { kind: 'range', from: 20, to: 10 } }])('rejects %j', (playlistScope) => {
    expect(probeSchema.safeParse({ url, playlistMode: 'playlist', playlistScope }).success).toBe(false);
  });
});

describe('infoDictSchema — null normalization + _type discrimination', () => {
  it('treats null filesize/fps/duration as undefined (not validation errors)', () => {
    const raw = {
      title: 'x',
      thumbnail: null,
      duration: null,
      formats: [{ format_id: '22', filesize: null, fps: null, abr: null, ext: 'mp4' }],
      subtitles: null,
      automatic_captions: null
    };
    const result = infoDictSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.data;
      expect(data._type).toBe('video');
      if (data._type === 'video' || data._type === undefined) {
        expect(data.duration).toBeUndefined();
        expect(data.thumbnail).toBeUndefined();
        expect(data.formats?.[0].filesize).toBeUndefined();
        expect(data.formats?.[0].fps).toBeUndefined();
        expect(data.subtitles).toBeUndefined();
      }
    }
  });

  it('passes through unknown fields without rejecting', () => {
    const raw = {
      title: 'x',
      _unknown_field_yt_dlp_added_in_2030: 'whatever',
      formats: [{ format_id: '22', _new_codec_field: 'av2' }]
    };
    expect(infoDictSchema.safeParse(raw).success).toBe(true);
  });

  it('discriminates on _type: playlist', () => {
    const raw = {
      _type: 'playlist',
      id: 'PLabc',
      title: 'My playlist',
      entries: [
        { id: 'v1', title: 'Video 1', url: 'https://www.youtube.com/watch?v=v1' },
        { id: 'v2', title: 'Video 2', url: 'https://www.youtube.com/watch?v=v2' }
      ]
    };
    const result = infoDictSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data._type).toBe('playlist');
    }
  });

  it('discriminates on _type: multi_video', () => {
    const raw = {
      _type: 'multi_video',
      id: 'episode-1',
      title: 'Multi-act episode',
      entries: [{ id: 'a', title: 'Act 1', url: 'https://x.com/a' }]
    };
    expect(infoDictSchema.safeParse(raw).success).toBe(true);
  });

  it('discriminates on _type: url (redirect entry)', () => {
    const raw = { _type: 'url', url: 'https://example.com/video', ie_key: 'Generic' };
    const result = infoDictSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data._type).toBe('url');
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

  it.each([{ target: 'flac' }, { target: 'mp3' }, { target: 'mp3', bitrateKbps: 96 }, { target: 'mp3', bitrateKbps: 256000 }, {}])('rejects %j', (value) => {
    expect(audioConvertSchema.safeParse(value).success).toBe(false);
  });

  it('threads audioConvert through startDownloadSchema via job', () => {
    const parsed = startDownloadSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      job: { kind: 'audio-convert', ...IDENTITY, audioConvert: { target: 'mp3', bitrateKbps: 192 }, preset: 'audio-only', sponsorBlock: { mode: 'off' }, embed: { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false } }
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.job.kind).toBe('audio-convert');
      if (parsed.data.job.kind === 'audio-convert') {
        expect(parsed.data.job.audioConvert).toEqual({ target: 'mp3', bitrateKbps: 192 });
      }
    }
  });
});

describe('queueArraySchema', () => {
  const EMBED_OFF = { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false };
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
    job: { kind: 'single-format', ...IDENTITY, formatId: '137+251', preset: 'custom', sponsorBlock: { mode: 'off' }, embed: EMBED_OFF }
  };

  it('accepts an empty array', () => {
    expect(queueArraySchema.safeParse([]).success).toBe(true);
  });

  it('accepts a valid queue item', () => {
    expect(queueArraySchema.safeParse([valid]).success).toBe(true);
  });

  it('rejects a queue item with an unknown status', () => {
    expect(queueArraySchema.safeParse([{ ...valid, status: 'wat' }]).success).toBe(false);
  });

  it('rejects a queue item with an unknown job kind', () => {
    expect(queueArraySchema.safeParse([{ ...valid, job: { kind: 'magic-format' } }]).success).toBe(false);
  });

  it('defaults lane to "normal" when missing (beta-shape migration safety)', () => {
    const { lane: _omit, ...legacy } = { ...valid, lane: 'normal' };
    void _omit;
    const parsed = queueArraySchema.safeParse([legacy]);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data[0].lane).toBe('normal');
  });

  it('accepts lane="priority"', () => {
    expect(queueArraySchema.safeParse([{ ...valid, lane: 'priority' }]).success).toBe(true);
  });

  it('defaults writeM3u to true when missing (pre-existing items keep always-on M3U)', () => {
    const parsed = queueArraySchema.safeParse([valid]);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data[0].writeM3u).toBe(true);
  });

  it('preserves an explicit writeM3u=false (playlist opt-out)', () => {
    const parsed = queueArraySchema.safeParse([{ ...valid, writeM3u: false }]);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data[0].writeM3u).toBe(false);
  });

  it('rejects an unknown lane value', () => {
    expect(queueArraySchema.safeParse([{ ...valid, lane: 'turbo' }]).success).toBe(false);
  });

  it('rejects when error.kind is not a known YtDlpErrorKind', () => {
    expect(
      queueArraySchema.safeParse([
        {
          ...valid,
          status: 'error',
          error: { kind: 'totallyMadeUp', raw: 'oops' }
        }
      ]).success
    ).toBe(false);
  });
});

describe('updateSettingsSchema — common.limitRate', () => {
  it.each(['500K', '1M', '1.5M', '750K', '10M', '50M', '100k', '2m', ''])('accepts %s', (value) => {
    expect(updateSettingsSchema.safeParse({ common: { limitRate: value } }).success).toBe(true);
  });

  it.each(['500', 'abc', '1G', '500KB', '1 M', '-1M', '1.M'])('rejects %s', (value) => {
    expect(updateSettingsSchema.safeParse({ common: { limitRate: value } }).success).toBe(false);
  });
});

describe('updateSettingsSchema — common.includeIdInSingleFilenames', () => {
  it.each([true, false])('accepts includeIdInSingleFilenames=%s', (value) => {
    expect(updateSettingsSchema.safeParse({ common: { includeIdInSingleFilenames: value } }).success).toBe(true);
  });
});

describe('updateSettingsSchema — common.writeM3u', () => {
  it.each([true, false])('accepts writeM3u=%s', (value) => {
    expect(updateSettingsSchema.safeParse({ common: { writeM3u: value } }).success).toBe(true);
  });
  it('rejects a non-boolean writeM3u', () => {
    expect(updateSettingsSchema.safeParse({ common: { writeM3u: 'yes' } }).success).toBe(false);
  });
});

describe('DEFAULTS — output prefs', () => {
  it('writeM3u defaults to true (playlist M3U on by default)', () => {
    expect(DEFAULTS.writeM3u).toBe(true);
  });
});

describe('updateSettingsSchema — network pacing', () => {
  it.each([1, 100, 5000])('accepts playlistProbeLimit=%s', (value) => {
    expect(updateSettingsSchema.safeParse({ common: { playlistProbeLimit: value } }).success).toBe(true);
  });

  it.each([0, -1, 5001, 1.5])('rejects playlistProbeLimit=%s', (value) => {
    expect(updateSettingsSchema.safeParse({ common: { playlistProbeLimit: value } }).success).toBe(false);
  });

  it('accepts pacing preset and custom fields', () => {
    expect(
      updateSettingsSchema.safeParse({
        common: {
          networkPacingPreset: 'custom',
          pacingSleepRequests: 1,
          pacingSleepInterval: 10,
          pacingMaxSleepInterval: 20,
          pacingSleepSubtitles: 5,
          pacingConcurrentFragments: 1
        }
      }).success
    ).toBe(true);
  });
});
