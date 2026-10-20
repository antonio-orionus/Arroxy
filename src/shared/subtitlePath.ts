// Subtitle file-path helpers shared by main + renderer + tests.
// Source-of-truth derives from SUBTITLE_FORMATS in schemas.ts so adding a
// format updates ext detection automatically.

import {SUBTITLE_FORMATS} from './schemas.js'
import {matchesSubtitleLanguage} from './subtitleTracks.js'

const EXTS_ALT = SUBTITLE_FORMATS.join('|')

// eslint-disable-next-line security/detect-non-literal-regexp -- EXTS_ALT is derived from the hardcoded SUBTITLE_FORMATS enum; not user input
const SUBTITLE_EXT_REGEX = new RegExp(`\\.(${EXTS_ALT})$`, 'i')

export function isSubtitleFile(path: string): boolean {
	return SUBTITLE_EXT_REGEX.test(path)
}

// eslint-disable-next-line security/detect-non-literal-regexp -- EXTS_ALT is derived from the hardcoded SUBTITLE_FORMATS enum; not user input
const TRACK_KEY_REGEX = new RegExp(`\\.([\\w-]+)\\.(${EXTS_ALT})$`, 'i')

// Strict lang detection: reads the `<lang>` segment of a path ending in
// `.<lang>.<ext>` and only accepts it when it equals a requested code, or is a
// regional variant of one (`de-DE` for `de`). The track key cannot contain a
// dot, which avoids the "Tutorial 1.0.en.srt" → `0` false-positive. Returns
// null if no requested lang matches; callers should fall back to 'und' (not to
// a positional guess).
// The track key yt-dlp wrote a subtitle file under: the `<lang>` segment of
// `.<lang>.<ext>`, or null for a path not shaped like one.
export function subtitleTrackKey(path: string): string | null {
	return TRACK_KEY_REGEX.exec(path)?.[1] ?? null
}

export function detectSubtitleLang(path: string, requestedLangs: readonly string[]): string | null {
	const trackKey = subtitleTrackKey(path)
	if (!trackKey) return null
	return requestedLangs.find(lang => lang.toLowerCase() === trackKey.toLowerCase()) ?? requestedLangs.find(lang => matchesSubtitleLanguage(lang, trackKey)) ?? null
}
