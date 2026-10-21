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
