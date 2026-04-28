// SRT deduplication for YouTube auto-captions.
// Algorithm lives in cueDedupe.ts; parsing scaffold in cueParser.ts.

import { dedupeCues, msToTimecodeParts, timecodeToMs, type Cue } from './cueDedupe';
import { parseCueStream } from './cueParser';

const SRT_TIMECODE_RE = /^(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)/;

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

export function dedupeSrt(content: string): string {
  const { cues } = parseCueStream({ content, parseTimecode: parseSrtTimecode });
  return formatSrt(dedupeCues(cues));
}
