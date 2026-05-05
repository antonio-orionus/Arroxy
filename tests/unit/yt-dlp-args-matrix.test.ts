import { describe, it, expect } from 'vitest';
import { buildArgs, type YtDlpRequest } from '@main/services/YtDlp';
import type { AudioConvert, SubtitleFormat, SubtitleMode } from '@shared/types';

const AUDIO_CONVERTS: AudioConvert[] = [{ target: 'wav' }, { target: 'mp3', bitrateKbps: 128 }, { target: 'mp3', bitrateKbps: 192 }, { target: 'mp3', bitrateKbps: 320 }, { target: 'm4a', bitrateKbps: 192 }, { target: 'opus', bitrateKbps: 128 }];

const FORMAT_IDS = ['137+251', '251', '22'];
const SUBTITLE_LANGS_SETS: string[][] = [['en'], ['en', 'ja'], ['en-orig', 'en-j3PyPqV-e1s']];
const SUBTITLE_FORMATS: SubtitleFormat[] = ['srt', 'vtt', 'ass'];
const SUBTITLE_MODES: SubtitleMode[] = ['sidecar', 'subfolder'];

function adjacent(args: string[], a: string, b: string): boolean {
  for (let i = 0; i < args.length - 1; i++) if (args[i] === a && args[i + 1] === b) return true;
  return false;
}

describe('buildArgs — subtitle kind invariants', () => {
  const cases = SUBTITLE_LANGS_SETS.flatMap((langs) => SUBTITLE_FORMATS.flatMap((fmt) => SUBTITLE_MODES.flatMap((mode) => [false, true].map((auto) => ({ langs, fmt, mode, auto })))));

  it.each(cases)('subtitle kind always includes --skip-download [langs=$langs|fmt=$fmt|mode=$mode|auto=$auto]', ({ langs, fmt, mode, auto }) => {
    const req: YtDlpRequest = {
      kind: 'subtitle',
      url: 'https://www.youtube.com/watch?v=x',
      outputDir: '/tmp/out',
      subtitleLanguages: langs,
      subtitleMode: mode,
      subtitleFormat: fmt,
      writeAutoSubs: auto
    };
    const { args } = buildArgs(req);
    expect(args).toContain('--skip-download');
    expect(args).toContain('--write-subs');
    expect(adjacent(args, '--sub-langs', langs.join(','))).toBe(true);
    if (auto) expect(args).toContain('--write-auto-subs');
    // ass + auto silently downgrades to srt to allow dedupe — codified.
    const expectedFmt = auto && fmt === 'ass' ? 'srt' : fmt;
    expect(adjacent(args, '--sub-format', `${expectedFmt}/best`)).toBe(true);
    expect(adjacent(args, '--convert-subs', expectedFmt)).toBe(true);
  });
});

describe('buildArgs — video kind invariants', () => {
  // video kind: with formatId or with audioConvert (mutually exclusive
  // semantically — strategyFor wouldn't pass both, but buildArgs handles them).
  const formatIdCases = FORMAT_IDS.map((formatId) => ({ formatId, audioConvert: undefined as AudioConvert | undefined }));
  const audioConvertCases = AUDIO_CONVERTS.map((audioConvert) => ({ formatId: undefined as string | undefined, audioConvert }));

  it.each(formatIdCases)('formatId set + no audioConvert ⇒ -f formatId adjacent [$formatId]', ({ formatId }) => {
    const req: YtDlpRequest = {
      kind: 'video',
      url: 'https://www.youtube.com/watch?v=x',
      outputDir: '/tmp/out',
      formatId
    };
    const { args } = buildArgs(req);
    expect(adjacent(args, '-f', formatId)).toBe(true);
    expect(args).not.toContain('-x');
    expect(args).not.toContain('--skip-download');
    expect(args).toContain('--no-write-subs');
    expect(args).toContain('--no-write-auto-subs');
  });

  it.each(audioConvertCases)('audioConvert set ⇒ -x + bestaudio + --audio-format [target=$audioConvert.target]', ({ audioConvert }) => {
    const req: YtDlpRequest = {
      kind: 'video',
      url: 'https://www.youtube.com/watch?v=x',
      outputDir: '/tmp/out',
      audioConvert
    };
    const { args } = buildArgs(req);
    expect(adjacent(args, '-f', 'bestaudio/best')).toBe(true);
    expect(args).toContain('-x');
    expect(adjacent(args, '--audio-format', audioConvert.target)).toBe(true);
    if (audioConvert.target !== 'wav') {
      expect(adjacent(args, '--audio-quality', `${audioConvert.bitrateKbps}K`)).toBe(true);
    }
    expect(args).not.toContain('--skip-download');
  });

  it('production repro: m4a-convert + 2 subs (video+embed kind) emits embed-subs + merge-output', () => {
    const req: YtDlpRequest = {
      kind: 'video+embed',
      url: 'https://www.youtube.com/watch?v=gJYZE9UXiHk',
      outputDir: '/tmp/out',
      subtitleLanguages: ['en-j3PyPqV-e1s', 'en-orig']
    };
    const { args } = buildArgs(req);
    expect(args).toContain('--embed-subs');
    expect(args).toContain('--merge-output-format');
    expect(args).not.toContain('--skip-download');
  });
});

describe('buildArgs — production repro cells (audio convert + sidecar subs)', () => {
  // The exact failure mode from the production log: audio-only preset with
  // m4a@192 convert. The sidecar subs go through a separate phase, so the
  // video-kind invocation seen here has no subtitle flags — but it MUST
  // include the audio extraction flags.
  it.each(AUDIO_CONVERTS)('video kind w/ audioConvert=$target emits -x and audio-format', (audioConvert) => {
    const req: YtDlpRequest = {
      kind: 'video',
      url: 'https://www.youtube.com/watch?v=x',
      outputDir: '/tmp/out',
      audioConvert
    };
    const { args } = buildArgs(req);
    expect(args).toContain('-x');
    expect(adjacent(args, '--audio-format', audioConvert.target)).toBe(true);
  });
});
