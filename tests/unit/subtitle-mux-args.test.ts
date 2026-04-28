import { describe, expect, it } from 'vitest';
import { buildSubtitleEmbedArgs } from '@main/services/subtitleMuxArgs';

describe('buildSubtitleEmbedArgs', () => {
  it('produces an ffmpeg command that copy-mux video + sub streams into the output, tagging language metadata', () => {
    const args = buildSubtitleEmbedArgs({
      videoPath: '/downloads/Title.mp4',
      subtitleTracks: [{ path: '/downloads/Title.en.srt', lang: 'en' }],
      outputPath: '/downloads/Title.muxed.mkv'
    });

    // -y: overwrite output without prompting (we'll rename atomically anyway)
    expect(args).toContain('-y');
    // Inputs are added in order: video, then each sub track
    const inputIdxs = args.reduce<number[]>((acc, v, i) => v === '-i' ? [...acc, i] : acc, []);
    expect(args[inputIdxs[0] + 1]).toBe('/downloads/Title.mp4');
    expect(args[inputIdxs[1] + 1]).toBe('/downloads/Title.en.srt');
    // Stream copy for video+audio (no re-encode)
    expect(args).toContain('-c');
    expect(args[args.indexOf('-c') + 1]).toBe('copy');
    // Sub codec srt (mkv-native; matches our deduped format)
    expect(args).toContain('-c:s');
    expect(args[args.indexOf('-c:s') + 1]).toBe('srt');
    // ISO 639-2/B language tag for the first sub stream
    expect(args).toContain('-metadata:s:s:0');
    expect(args[args.indexOf('-metadata:s:s:0') + 1]).toBe('language=eng');
    // Output last
    expect(args[args.length - 1]).toBe('/downloads/Title.muxed.mkv');
  });

  it('handles multiple subtitle tracks with distinct language metadata', () => {
    const args = buildSubtitleEmbedArgs({
      videoPath: '/v.mp4',
      subtitleTracks: [
        { path: '/v.en.srt', lang: 'en' },
        { path: '/v.es.srt', lang: 'es' }
      ],
      outputPath: '/v.mkv'
    });

    expect(args).toContain('-metadata:s:s:0');
    expect(args[args.indexOf('-metadata:s:s:0') + 1]).toBe('language=eng');
    expect(args).toContain('-metadata:s:s:1');
    expect(args[args.indexOf('-metadata:s:s:1') + 1]).toBe('language=spa');
  });

  it('falls back to the raw lang code when ISO 639-2 mapping is unknown (e.g. en-orig)', () => {
    const args = buildSubtitleEmbedArgs({
      videoPath: '/v.mp4',
      subtitleTracks: [{ path: '/v.en-orig.srt', lang: 'en-orig' }],
      outputPath: '/v.mkv'
    });
    expect(args[args.indexOf('-metadata:s:s:0') + 1]).toBe('language=en-orig');
  });
});
