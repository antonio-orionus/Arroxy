// VTT deduplication for YouTube auto-captions.
//
// VTT auto-cap files have inline timing tags like `<00:00:00.280><c>word</c>`
// inside cue text. We strip those, then run the same dedupe algorithm as SRT,
// then emit valid WebVTT (timecode separator `.` instead of `,`, plus the
// `WEBVTT` header).

import { dedupeCues, msToTimecodeParts, timecodeToMs, type Cue } from './cueDedupe';
import { parseCueStream } from './cueParser';

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

export function dedupeVtt(content: string): string {
  const { header, cues } = parseCueStream({
    content,
    parseTimecode: parseVttTimecode,
    transformText: stripInlineTags,
    detectHeader: true
  });
  const safeHeader = header.startsWith('WEBVTT') ? header : 'WEBVTT';
  return formatVtt(safeHeader, dedupeCues(cues));
}
