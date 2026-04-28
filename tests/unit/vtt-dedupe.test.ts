import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dedupeVtt } from '@main/services/vttDedupe';

const FIXTURES = join(__dirname, '../fixtures/subtitles');

describe('dedupeVtt', () => {
  it('strips inline timing tags and dedupes rolling cues — output is well-formed and shorter than input', () => {
    const rolling = readFileSync(join(FIXTURES, 'copilot-died.en-orig.vtt'), 'utf8');

    const out = dedupeVtt(rolling);

    // WEBVTT header preserved
    expect(out.startsWith('WEBVTT')).toBe(true);
    // No leftover inline timing tags like <00:00:00.280><c>just</c>
    expect(out).not.toMatch(/<\d+:\d+:\d+\.\d+>/);
    expect(out).not.toMatch(/<\/?c>/);
    // Dedupe must shrink the file — rolling cues are highly redundant.
    expect(out.length).toBeLessThan(rolling.length / 2);
    // No two consecutive cues share identical text (the rolling pattern).
    const cueBlocks = out.split(/\n\n/).slice(1).filter((b) => b.includes('-->'));
    const texts = cueBlocks.map((b) => b.split('\n').slice(1).join(' ').trim());
    for (let i = 1; i < texts.length; i++) {
      expect(texts[i]).not.toBe(texts[i - 1]);
    }
  });

  it('produces no overlapping cues — every cue starts strictly after the previous one ends', () => {
    const rolling = readFileSync(join(FIXTURES, 'copilot-died.en-orig.vtt'), 'utf8');

    const out = dedupeVtt(rolling);

    const timecodes = [...out.matchAll(/^(\d+):(\d+):(\d+)\.(\d+) --> (\d+):(\d+):(\d+)\.(\d+)/gm)];
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

  it('returns minimal valid WEBVTT for empty input', () => {
    expect(dedupeVtt('').startsWith('WEBVTT')).toBe(true);
  });

  it('handles older auto-caption format (2018 video) — no overlaps, no leftover tags', () => {
    const rolling = readFileSync(join(FIXTURES, 'rubiks-2018.en-orig.vtt'), 'utf8');

    const out = dedupeVtt(rolling);

    expect(out.startsWith('WEBVTT')).toBe(true);
    expect(out).not.toMatch(/<\d+:\d+:\d+\.\d+>/);
    expect(out).not.toMatch(/<\/?c>/);

    const timecodes = [...out.matchAll(/^(\d+):(\d+):(\d+)\.(\d+) --> (\d+):(\d+):(\d+)\.(\d+)/gm)];
    expect(timecodes.length).toBeGreaterThan(20); // sanity — should have many cues
    const toMs = (m: RegExpMatchArray, off: number): number =>
      Number(m[off]) * 3600000 + Number(m[off + 1]) * 60000 + Number(m[off + 2]) * 1000 + Number(m[off + 3]);

    let lastEnd = -1;
    for (const m of timecodes) {
      const start = toMs(m, 1);
      expect(start).toBeGreaterThan(lastEnd);
      lastEnd = toMs(m, 5);
    }
  });
});
