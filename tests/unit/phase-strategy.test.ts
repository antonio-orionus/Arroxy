import { describe, it, expect } from 'vitest';
import { strategyFor, phasesFor, type StrategyKind } from '@main/services/phases/index.js';
import type { PreparedJob, SubtitleOptions, SponsorBlockOptions, EmbedOptions } from '@shared/preparedJob.js';

const EMBED_OFF: EmbedOptions = { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false };
const SB_OFF: SponsorBlockOptions = { mode: 'off' };

const BASE_SUBS: SubtitleOptions = { languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false };

describe('strategyFor — kind routing', () => {
  it('subtitle-only kind → always subtitle-only', () => {
    const job: PreparedJob = { kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: BASE_SUBS };
    expect(strategyFor(job)).toBe<StrategyKind>('subtitle-only');
  });

  it('single-format with no subtitles → video', () => {
    const job: PreparedJob = { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF };
    expect(strategyFor(job)).toBe<StrategyKind>('video');
  });

  it('audio-convert with no subtitles → video', () => {
    const job: PreparedJob = { kind: 'audio-convert', extractor: 'youtube', extractorKey: 'Youtube', audioConvert: { target: 'mp3', bitrateKbps: 192 }, preset: 'audio-only', sponsorBlock: SB_OFF, embed: EMBED_OFF };
    expect(strategyFor(job)).toBe<StrategyKind>('video');
  });

  it('playlist-preset with no subtitles → video', () => {
    const job: PreparedJob = { kind: 'playlist-preset', extractor: 'youtube', extractorKey: 'Youtube', selection: { kind: 'video', tier: 'best', codec: 'best' }, outputTemplate: '%(title)s.%(ext)s', sponsorBlock: SB_OFF, embed: EMBED_OFF };
    expect(strategyFor(job)).toBe<StrategyKind>('video');
  });

  it('single-format with subtitles mode=embed + writeAuto=false → video+embed', () => {
    const job: PreparedJob = { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: { languages: ['en'], mode: 'embed', format: 'vtt', writeAuto: false } };
    expect(strategyFor(job)).toBe<StrategyKind>('video+embed');
  });

  it('single-format with subtitles mode=embed + writeAuto=true → video+embed+auto', () => {
    const job: PreparedJob = { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: { languages: ['en'], mode: 'embed', format: 'vtt', writeAuto: true } };
    expect(strategyFor(job)).toBe<StrategyKind>('video+embed+auto');
  });

  it('single-format with subtitles mode=sidecar → video+sidecar', () => {
    const job: PreparedJob = { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: { languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false } };
    expect(strategyFor(job)).toBe<StrategyKind>('video+sidecar');
  });

  it('single-format with subtitles mode=subfolder → video+sidecar', () => {
    const job: PreparedJob = { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: { languages: ['en'], mode: 'subfolder', format: 'srt', writeAuto: false } };
    expect(strategyFor(job)).toBe<StrategyKind>('video+sidecar');
  });

  it('audio-convert with subtitles mode=sidecar → video+sidecar', () => {
    const job: PreparedJob = { kind: 'audio-convert', extractor: 'youtube', extractorKey: 'Youtube', audioConvert: { target: 'mp3', bitrateKbps: 192 }, preset: 'audio-only', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: { languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false } };
    expect(strategyFor(job)).toBe<StrategyKind>('video+sidecar');
  });
});

describe('phasesFor — production repro cell', () => {
  // The exact cell from the production log: audio-only preset + m4a-convert +
  // 2 subtitles. Before the fix this returned [Preflight, SubtitleOnlyPhase],
  // silently dropping the audio download.
  it('audio-only + m4a-convert + 2 subs → preflight + video phase', () => {
    const job: PreparedJob = {
      kind: 'audio-convert',
      extractor: 'youtube',
      extractorKey: 'Youtube',
      audioConvert: { target: 'm4a', bitrateKbps: 192 },
      preset: 'audio-only',
      sponsorBlock: SB_OFF,
      embed: EMBED_OFF,
      subtitles: { languages: ['en-j3PyPqV-e1s', 'en-orig'], mode: 'sidecar', format: 'srt', writeAuto: false }
    };
    const phases = phasesFor({ url: 'https://www.youtube.com/watch?v=gJYZE9UXiHk', outputDir: '/tmp/out', job }).map((p) => p.kind);
    expect(phases.some((k) => k.startsWith('video'))).toBe(true);
    expect(phases).not.toContain('subtitle-only');
  });
});
