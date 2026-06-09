// Subtitle file-path helpers shared by main + renderer + tests.
// Source-of-truth derives from SUBTITLE_FORMATS in schemas.ts so adding a
// format updates ext detection automatically.

import {SUBTITLE_FORMATS} from './schemas.js'

const EXTS_ALT = SUBTITLE_FORMATS.join('|')

// eslint-disable-next-line security/detect-non-literal-regexp -- EXTS_ALT is derived from the hardcoded SUBTITLE_FORMATS enum; not user input
const SUBTITLE_EXT_REGEX = new RegExp(`\\.(${EXTS_ALT})$`, 'i')

export function isSubtitleFile(path: string): boolean {
	return SUBTITLE_EXT_REGEX.test(path)
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Strict lang detection: only matches when the path ends in `.<lang>.<ext>`
// where `<lang>` exactly equals one of the requested codes. This avoids the
// "Tutorial 1.0.en.srt" false-positive that a generic `\.([^.]+)\.<ext>$`
// regex would produce. Returns null if no requested lang matches; callers
// should fall back to 'und' (not to a positional guess).
export function detectSubtitleLang(path: string, requestedLangs: readonly string[]): string | null {
	const patterns = requestedLangs.map(lang => ({
		lang,
		// eslint-disable-next-line security/detect-non-literal-regexp -- escapeRegExp(lang) sanitizes requestedLangs, EXTS_ALT is from the hardcoded SUBTITLE_FORMATS enum, and the pattern is end-anchored
		re: new RegExp(`\\.${escapeRegExp(lang)}\\.(${EXTS_ALT})$`, 'i')
	}))
	for (const {lang, re} of patterns) {
		if (re.test(path)) return lang
	}
	return null
}

// Embed mode forces mkv container — declared once so ytDlpArgs and the muxer
// agree without literal-string drift.
export const EMBED_CONTAINER_EXT = 'mkv'
