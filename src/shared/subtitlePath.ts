// Subtitle file-path helpers shared by main + renderer + tests.
// Source-of-truth derives from SUBTITLE_FORMATS in schemas.ts so adding a
// format updates ext detection automatically.

import { SUBTITLE_FORMATS } from './schemas';

const EXTS_ALT = SUBTITLE_FORMATS.join('|');

// eslint-disable-next-line security/detect-non-literal-regexp -- EXTS_ALT is derived from the hardcoded SUBTITLE_FORMATS enum; not user input
const SUBTITLE_EXT_REGEX = new RegExp(`\\.(${EXTS_ALT})$`, 'i');

export function isSubtitleFile(path: string): boolean {
  return SUBTITLE_EXT_REGEX.test(path);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Strict lang detection: only matches when the path ends in `.<lang>.<ext>`
// where `<lang>` exactly equals one of the requested codes. This avoids the
// "Tutorial 1.0.en.srt" false-positive that a generic `\.([^.]+)\.<ext>$`
// regex would produce. Returns null if no requested lang matches; callers
// should fall back to 'und' (not to a positional guess).
export function detectSubtitleLang(path: string, requestedLangs: readonly string[]): string | null {
  for (const lang of requestedLangs) {
    // eslint-disable-next-line security/detect-non-literal-regexp -- lang is from requestedLangs (caller-validated BCP-47); EXTS_ALT is from hardcoded enum
    const re = new RegExp(`\\.${escapeRegExp(lang)}\\.(${EXTS_ALT})$`, 'i');
    if (re.test(path)) return lang;
  }
  return null;
}

// Embed mode forces mkv container — declared once so ytDlpArgs and the muxer
// agree without literal-string drift.
export const EMBED_CONTAINER_EXT = 'mkv';
