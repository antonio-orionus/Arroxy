// VTT deduplication for YouTube auto-captions.
//
// VTT auto-cap files have inline timing tags like `<00:00:00.280><c>word</c>`
// inside cue text. We strip those, then run the same dedupe algorithm as SRT,
// then emit valid WebVTT (timecode separator `.` instead of `,`, plus the
// `WEBVTT` header). Cue parsing is inlined here.

import { dedupeCues, msToTimecodeParts, timecodeToMs, type Cue } from './cueDedupe';

const VTT_TIMECODE_RE = /^(\d+):(\d+):(\d+)\.(\d+) --> (\d+):(\d+):(\d+)\.(\d+)/;
// YouTube's auto-caption inline tags: word timing markers and <c>...</c>
// styling spans. Strip both — they have no meaning once cues are deduped.
const INLINE_TIMING_RE = /<\d+:\d+:\d+\.\d+>/g;
const INLINE_STYLE_RE = /<\/?c[^>]*>/g;

function parseVttTimecode(line: string): [number, number] | null {
  const m = line.match(VTT_TIMECODE_RE);
  if (!m) return null;
  return [timecodeToMs(m[1], m[2], m[3], m[4]), timecodeToMs(m[5], m[6], m[7], m[8])];
}

function formatVttTimecode(ms: number): string {
  const p = msToTimecodeParts(ms);
  return `${p.h}:${p.m}:${p.s}.${p.ms}`;
}

function stripInlineTags(text: string): string {
  return text.replace(INLINE_TIMING_RE, '').replace(INLINE_STYLE_RE, '');
}

function formatVtt(header: string, cues: Iterable<Cue>): string {
  let out = header.trimEnd() + '\n\n';
  for (const c of cues) {
    out += `${formatVttTimecode(c.start)} --> ${formatVttTimecode(c.end)}\n${c.text}\n\n`;
  }
  return out.trimEnd();
}

function parseVttCues(content: string): { header: string; cues: Cue[] } {
  const rawLines = content.split('\n').map((l) => l.replace(/\r$/, ''));

  // VTT carries a header (everything before the first blank line) that must
  // be preserved. YouTube's auto-caption VTT always starts with "WEBVTT".
  let header = '';
  let bodyStart = 0;
  for (let i = 0; i < rawLines.length; i++) {
    if (rawLines[i].trim() === '' && i > 0) {
      header = rawLines.slice(0, i).join('\n');
      bodyStart = i;
      break;
    }
  }

  const nonEmpty = rawLines.slice(bodyStart).filter((l) => l.trim().length > 0);
  const cues: Cue[] = [];
  let i = 0;
  while (i < nonEmpty.length) {
    const tc = parseVttTimecode(nonEmpty[i]);
    if (!tc) {
      i++;
      continue;
    }
    let textLines = '';
    let j = i + 1;
    while (j < nonEmpty.length) {
      if (parseVttTimecode(nonEmpty[j])) break;
      textLines += nonEmpty[j] + '\n';
      j++;
    }
    // YouTube's rolling-caption VTT alternates empty "spacer" cues with the
    // real text cues. Drop the spacers so the dedupe algorithm sees a clean
    // stream of textful cues.
    const text = stripInlineTags(textLines).trim();
    if (text.length > 0) cues.push({ start: tc[0], end: tc[1], text });
    i = j;
  }
  return { header, cues };
}

export function dedupeVtt(content: string): string {
  const { header, cues } = parseVttCues(content);
  const safeHeader = header.startsWith('WEBVTT') ? header : 'WEBVTT';
  return formatVtt(safeHeader, dedupeCues(cues));
}
