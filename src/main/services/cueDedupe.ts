// Shared cue model + dedupe algorithm used by srtDedupe and vttDedupe.
//
// The dedupe targets YouTube's rolling auto-caption pattern: each cue
// duplicates the previous + 1 word. Algorithm derived from Parabolic's
// MIT-licensed `srt_fix` postprocessor (Copyright (c) 2026 Nickvision) —
// re-implemented in TypeScript.

export interface Cue {
  start: number; // ms
  end: number;   // ms
  text: string;
}

// Tunables. Names instead of magic numbers so tests + future tweaks have a
// shared vocabulary. Values inherited from Parabolic's reference implementation.
const NEAR_ZERO_DURATION_MS = 150;        // cue.start - cue.end < this → "instant" cue
const SHORT_TAIL_WORD_THRESHOLD = 2;       // ≤N words on the trailing line → fold into prev
const SOLO_WORD_MIN_LENGTH = 2;            // single-word prev shorter than this isn't a sentinel

// Enforces strict, non-overlapping order. The dedupe loop has several
// `continue` branches that extend `prev.end` to the current cue's end
// without re-checking the next cue, so an extended prev can leak into the
// start of its successor. We catch that here. Pure: yields fresh objects
// rather than mutating input.
function* enforceStrictOrder(cues: Iterable<Cue>): Generator<Cue> {
  let lastEnd = -1;
  for (const c of cues) {
    let start = c.start;
    let end = c.end;
    if (start <= lastEnd) start = lastEnd + 1;
    if (end < start) end = start;
    yield { start, end, text: c.text };
    lastEnd = end;
  }
}

export function dedupeCues(cues: Iterable<Cue>): Iterable<Cue> {
  return enforceStrictOrder(dedupeCuesRaw(cues));
}

function* dedupeCuesRaw(cues: Iterable<Cue>): Generator<Cue> {
  // `prev` is a *fresh* cue we own and can mutate — we never mutate the
  // caller's input. Inputs are copied on entry and deep-copied via the
  // text/start/end primitives.
  let prev: Cue | null = null;
  for (const orig of cues) {
    const cue: Cue = { start: orig.start, end: orig.end, text: orig.text.trim() };

    if (prev === null) { prev = cue; continue; }
    if (cue.text.length === 0) continue;

    if (cue.start - cue.end < NEAR_ZERO_DURATION_MS && prev.text.includes(cue.text)) {
      prev.end = cue.end;
      continue;
    }

    const currentLines = cue.text.split('\n');
    const lastLines = prev.text.split('\n');
    let singleWord = false;

    if (currentLines[0] === lastLines[lastLines.length - 1]) {
      if (lastLines.length === 1) {
        const onlyWord = lastLines[0];
        if (onlyWord.split(' ').length < 2 && onlyWord.length > SOLO_WORD_MIN_LENGTH) {
          singleWord = true;
          cue.text = currentLines[0] + ' ' + currentLines.slice(1).join('\n');
        } else {
          cue.text = currentLines.slice(1).join('\n');
        }
      } else {
        cue.text = currentLines.slice(1).join('\n');
      }
    } else {
      if (cue.text.split(' ').length <= SHORT_TAIL_WORD_THRESHOLD) {
        prev.end = cue.end;
        const glue = cue.text.startsWith(' ') ? cue.text : ' ' + cue.text;
        prev.text += glue;
        continue;
      }
    }

    if (cue.start <= prev.end) prev.end = cue.start - 1;
    if (cue.start >= cue.end) { const t = cue.end; cue.end = cue.start; cue.start = t; }

    if (!singleWord) yield prev;
    prev = cue;
  }
  if (prev !== null) yield prev;
}

export function timecodeToMs(h: string, mm: string, s: string, ms: string): number {
  return Number(h) * 3_600_000 + Number(mm) * 60_000 + Number(s) * 1_000 + Number(ms);
}

export function msToTimecodeParts(ms: number): { h: string; m: string; s: string; ms: string } {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const millis = ms % 1_000;
  const pad2 = (n: number): string => String(n).padStart(2, '0');
  const pad3 = (n: number): string => String(n).padStart(3, '0');
  return { h: pad2(hours), m: pad2(minutes), s: pad2(seconds), ms: pad3(millis) };
}
