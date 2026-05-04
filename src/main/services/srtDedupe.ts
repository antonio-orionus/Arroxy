// SRT deduplication for YouTube auto-captions.
// Algorithm lives in cueDedupe.ts; cue parsing is inlined here.

import { dedupeCues, msToTimecodeParts, timecodeToMs, type Cue } from './cueDedupe';

const SRT_TIMECODE_RE = /^(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)/;
const INDEX_LINE_RE = /^\d+$/;

function parseSrtTimecode(line: string): [number, number] | null {
  const m = line.match(SRT_TIMECODE_RE);
  if (!m) return null;
  return [timecodeToMs(m[1], m[2], m[3], m[4]), timecodeToMs(m[5], m[6], m[7], m[8])];
}

function formatSrtTimecode(ms: number): string {
  const p = msToTimecodeParts(ms);
  return `${p.h}:${p.m}:${p.s},${p.ms}`;
}

function formatSrt(cues: Iterable<Cue>): string {
  let i = 1;
  let out = '';
  for (const c of cues) {
    out += `${i}\n${formatSrtTimecode(c.start)} --> ${formatSrtTimecode(c.end)}\n${c.text}\n\n`;
    i++;
  }
  return out.trimEnd();
}

function parseSrtCues(content: string): Cue[] {
  const nonEmpty = content
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0);
  const cues: Cue[] = [];
  let i = 0;
  while (i < nonEmpty.length) {
    const tc = parseSrtTimecode(nonEmpty[i]);
    if (!tc) {
      i++;
      continue;
    }
    let textLines = '';
    let j = i + 1;
    while (j < nonEmpty.length) {
      if (parseSrtTimecode(nonEmpty[j])) break;
      // SRT index line (bare number) followed by a timecode signals a new cue boundary.
      if (INDEX_LINE_RE.test(nonEmpty[j].trim()) && j + 1 < nonEmpty.length && parseSrtTimecode(nonEmpty[j + 1])) break;
      textLines += nonEmpty[j] + '\n';
      j++;
    }
    const text = textLines.trim();
    if (text.length > 0) cues.push({ start: tc[0], end: tc[1], text });
    i = j;
  }
  return cues;
}

export function dedupeSrt(content: string): string {
  return formatSrt(dedupeCues(parseSrtCues(content)));
}
