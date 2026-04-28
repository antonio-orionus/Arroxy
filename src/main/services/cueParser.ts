// Shared cue-stream parser. Both SRT and VTT carry sequences of
// (optional index, timecode, text-lines) separated by blank lines.
// YouTube's rolling-SRT output sometimes inserts blank lines *between*
// the timecode and the text (non-spec but common), so we filter blanks
// up front and detect cue boundaries structurally:
//   - VTT: next timecode line.
//   - SRT: numeric index line followed by a timecode line.

import type { Cue } from './cueDedupe';

export type ParseTimecode = (line: string) => [number, number] | null;
export type TransformText = (text: string) => string;

export interface ParseCueStreamInput {
  content: string;
  parseTimecode: ParseTimecode;
  transformText?: TransformText; // strip inline tags etc.; identity if omitted
  // VTT carries a header that must be preserved; SRT has none. Optional.
  detectHeader?: boolean;
}

export interface ParsedCueStream {
  header: string;
  cues: Cue[];
}

const INDEX_LINE_RE = /^\d+$/;

export function parseCueStream(input: ParseCueStreamInput): ParsedCueStream {
  const transform = input.transformText ?? ((s) => s);
  const rawLines = input.content.split('\n').map((l) => l.replace(/\r$/, ''));

  let header = '';
  let bodyStart = 0;
  if (input.detectHeader) {
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].trim() === '' && i > 0) {
        header = rawLines.slice(0, i).join('\n');
        bodyStart = i;
        break;
      }
    }
  }

  const nonEmpty = rawLines.slice(bodyStart).filter((l) => l.trim().length > 0);

  const cues: Cue[] = [];
  let i = 0;
  while (i < nonEmpty.length) {
    const tc = input.parseTimecode(nonEmpty[i]);
    if (!tc) { i++; continue; }

    let textLines = '';
    let j = i + 1;
    while (j < nonEmpty.length) {
      // Boundary: another timecode line (VTT-style consecutive cues).
      if (input.parseTimecode(nonEmpty[j])) break;
      // Boundary: SRT index line followed by a timecode.
      if (
        INDEX_LINE_RE.test(nonEmpty[j].trim()) &&
        j + 1 < nonEmpty.length &&
        input.parseTimecode(nonEmpty[j + 1])
      ) break;
      textLines += nonEmpty[j] + '\n';
      j++;
    }

    const text = transform(textLines).trim();
    // YouTube's rolling-caption VTT alternates empty "spacer" cues with the
    // real text cues. Drop the spacers so the dedupe algorithm sees a clean
    // stream of textful cues.
    if (text.length > 0) cues.push({ start: tc[0], end: tc[1], text });
    i = j;
  }

  return { header, cues };
}
