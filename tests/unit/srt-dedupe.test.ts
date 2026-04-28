import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dedupeSrt } from '@main/services/srtDedupe';

const FIXTURES = join(__dirname, '../fixtures/subtitles');

describe('dedupeSrt', () => {
  it('collapses YouTube rolling auto-caption cues to match the Parabolic reference', () => {
    const rolling = readFileSync(join(FIXTURES, 'copilot-died.en-rolling.srt'), 'utf8');
    const expected = readFileSync(join(FIXTURES, 'copilot-died.en-deduped.srt'), 'utf8').trim();

    const actual = dedupeSrt(rolling).trim();

    expect(actual).toBe(expected);
  });

  it('produces no overlapping cues — every cue starts strictly after the previous one ends', () => {
    const rolling = readFileSync(join(FIXTURES, 'copilot-died.en-rolling.srt'), 'utf8');

    const out = dedupeSrt(rolling);

    const timecodes = [...out.matchAll(/^(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)/gm)];
    expect(timecodes.length).toBeGreaterThan(0);
    const toMs = (m: RegExpMatchArray, off: number): number =>
      Number(m[off]) * 3600000 + Number(m[off + 1]) * 60000 + Number(m[off + 2]) * 1000 + Number(m[off + 3]);

    let lastEnd = -1;
    for (const m of timecodes) {
      const start = toMs(m, 1);
      const end = toMs(m, 5);
      expect(start).toBeGreaterThan(lastEnd);
      expect(end).toBeGreaterThanOrEqual(start);
      lastEnd = end;
    }
  });

  it('returns empty string for empty input', () => {
    expect(dedupeSrt('')).toBe('');
  });

  it('does not crash on malformed input — entries without timecodes are skipped', () => {
    const garbage = 'not an srt\n\nrandom\n\nlines\n';
    expect(() => dedupeSrt(garbage)).not.toThrow();
  });
});
