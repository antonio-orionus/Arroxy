import { describe, it, expect } from 'vitest';
import { strategyFor, phasesFor, type StrategyKind } from '@main/services/phases';
import { presetProducesMedia } from '@shared/presetTraits';
import type { Preset, AudioConvert, SubtitleMode, StartDownloadInput } from '@shared/types';

// Matrix axes — narrower than the renderer AudioSelection so we test what
// strategyFor + phasesFor actually consume from StartDownloadInput.
const PRESETS: (Preset | 'custom')[] = ['best-quality', 'balanced', 'small-file', 'audio-only', 'subtitle-only', 'custom'];
const FORMAT_IDS: (string | undefined)[] = [undefined, '', '137+251'];
const AUDIO_CONVERTS: (AudioConvert | undefined)[] = [undefined, { target: 'wav' }, { target: 'mp3', bitrateKbps: 192 }, { target: 'm4a', bitrateKbps: 192 }, { target: 'opus', bitrateKbps: 128 }];
const SUBTITLE_LANGS: string[][] = [[], ['en'], ['en', 'ja']];
const SUBTITLE_MODES: SubtitleMode[] = ['sidecar', 'subfolder', 'embed'];

interface Cell {
  preset: Preset | 'custom';
  formatId: string | undefined;
  audioConvert: AudioConvert | undefined;
  subtitleLanguages: string[];
  subtitleMode: SubtitleMode;
}

function buildInput(cell: Cell): StartDownloadInput {
  return {
    url: 'https://www.youtube.com/watch?v=gJYZE9UXiHk',
    outputDir: '/tmp/out',
    formatId: cell.formatId === '' ? undefined : cell.formatId,
    preset: cell.preset,
    subtitleLanguages: cell.subtitleLanguages.length > 0 ? cell.subtitleLanguages : undefined,
    subtitleMode: cell.subtitleMode,
    audioConvert: cell.audioConvert
  };
}

function* cells(): Generator<Cell> {
  for (const preset of PRESETS) for (const formatId of FORMAT_IDS) for (const audioConvert of AUDIO_CONVERTS) for (const subtitleLanguages of SUBTITLE_LANGS) for (const subtitleMode of SUBTITLE_MODES) yield { preset, formatId, audioConvert, subtitleLanguages, subtitleMode };
}

const ALL: Cell[] = [...cells()];

describe('strategyFor — matrix invariants', () => {
  it(`covers ${ALL.length} cells`, () => {
    expect(ALL.length).toBeGreaterThan(450);
  });

  // INV-1: subtitle-only preset always routes to 'subtitle-only'.
  it.each(ALL.filter((c) => c.preset === 'subtitle-only'))('subtitle-only preset → subtitle-only strategy [$preset|fmt=$formatId|ac=$audioConvert|subs=$subtitleLanguages]', (c) => {
    expect(strategyFor(buildInput(c))).toBe<StrategyKind>('subtitle-only');
  });

  // INV-2: media-producing preset never routes to subtitle-only — even when
  // formatId is undefined (the production bug: audio-only + convert).
  it.each(ALL.filter((c) => c.preset !== 'custom' && c.preset !== 'subtitle-only' && presetProducesMedia(c.preset)))('media-producing preset never routes to subtitle-only [$preset|fmt=$formatId|ac=$audioConvert|subs=$subtitleLanguages]', (c) => {
    const input = buildInput(c);
    // Custom-with-no-media semantics differ; this guards the named presets.
    expect(strategyFor(input)).not.toBe<StrategyKind>('subtitle-only');
  });

  // INV-3: when formatId is set OR audioConvert is set, strategy is never
  // subtitle-only regardless of preset (custom path must respect audioConvert).
  it.each(ALL.filter((c) => c.preset !== 'subtitle-only' && (!!c.formatId || !!c.audioConvert)))('media-intent input never routes to subtitle-only [$preset|fmt=$formatId|ac=$audioConvert|subs=$subtitleLanguages]', (c) => {
    expect(strategyFor(buildInput(c))).not.toBe<StrategyKind>('subtitle-only');
  });

  // INV-4: with subs and no media intent, custom preset → subtitle-only.
  it.each(ALL.filter((c) => c.preset === 'custom' && !c.formatId && !c.audioConvert && c.subtitleLanguages.length > 0))('custom + no-media + subs → subtitle-only [mode=$subtitleMode]', (c) => {
    expect(strategyFor(buildInput(c))).toBe<StrategyKind>('subtitle-only');
  });

  // INV-5: no subs + media intent → 'video' strategy.
  it.each(ALL.filter((c) => c.preset !== 'subtitle-only' && c.subtitleLanguages.length === 0 && (!!c.formatId || !!c.audioConvert)))('no subs + media intent → video [$preset|fmt=$formatId|ac=$audioConvert]', (c) => {
    expect(strategyFor(buildInput(c))).toBe<StrategyKind>('video');
  });

  // INV-6: subs + embed mode + media → embed strategy.
  it.each(ALL.filter((c) => c.preset !== 'subtitle-only' && c.subtitleMode === 'embed' && c.subtitleLanguages.length > 0 && (!!c.formatId || !!c.audioConvert)))('embed mode + subs + media → video+embed* [$preset|fmt=$formatId|ac=$audioConvert]', (c) => {
    const s = strategyFor(buildInput(c));
    expect(['video+embed', 'video+embed+auto']).toContain(s);
  });

  // INV-7: subs + sidecar/subfolder mode + media → video+sidecar.
  it.each(ALL.filter((c) => c.preset !== 'subtitle-only' && c.subtitleMode !== 'embed' && c.subtitleLanguages.length > 0 && (!!c.formatId || !!c.audioConvert)))('non-embed mode + subs + media → video+sidecar [$preset|fmt=$formatId|ac=$audioConvert|mode=$subtitleMode]', (c) => {
    expect(strategyFor(buildInput(c))).toBe<StrategyKind>('video+sidecar');
  });
});

describe('phasesFor — production repro cell', () => {
  // The exact cell from the production log: audio-only preset + m4a-convert +
  // 2 subtitles. Before the fix this returned [Preflight, SubtitleOnlyPhase],
  // silently dropping the audio download.
  it('audio-only + m4a-convert + 2 subs → preflight + video phase', () => {
    const input: StartDownloadInput = {
      url: 'https://www.youtube.com/watch?v=gJYZE9UXiHk',
      outputDir: '/tmp/out',
      preset: 'audio-only',
      formatId: undefined,
      audioConvert: { target: 'm4a', bitrateKbps: 192 },
      subtitleLanguages: ['en-j3PyPqV-e1s', 'en-orig'],
      subtitleMode: 'sidecar'
    };
    const phases = phasesFor(input).map((p) => p.kind);
    expect(phases.some((k) => k.startsWith('video'))).toBe(true);
    expect(phases).not.toContain('subtitle-only');
  });
});
