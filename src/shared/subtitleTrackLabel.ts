import type {DownloadProfileSubtitleSource, SubtitleMap} from './types.js'
import {languageLabel} from './languageName.js'

// Where a profile's subtitles come from; manual first is the default.
export const SUBTITLE_SOURCE_LABEL_KEYS = {
	'manual-first': 'wizard.profileEditor.subtitleSource.manualFirst',
	'manual-and-auto': 'wizard.profileEditor.subtitleSource.manualAndAuto',
	'manual-only': 'wizard.profileEditor.subtitleSource.manualOnly',
	'auto-only': 'wizard.profileEditor.subtitleSource.autoOnly'
} as const satisfies Record<DownloadProfileSubtitleSource, string>

// An `-orig` key is YouTube's caption of the spoken language, the only
// automatic caption Arroxy keeps there. yt-dlp names it "English (Original)",
// which next to the Auto badge reads as the uploaded track, so it never takes
// that name.
const ORIGINAL_CAPTION_SUFFIX = '-orig'

export function captionLanguage(code: string): string {
	return code.endsWith(ORIGINAL_CAPTION_SUFFIX) ? code.slice(0, -ORIGINAL_CAPTION_SUFFIX.length) : code
}

// The label of a subtitle track wherever the UI lists one, in the UI language:
// yt-dlp's track names are English whatever the UI language, so they are used
// only for codes Intl cannot name.
export function resolveSubtitleLabel(code: string, subtitles: SubtitleMap, automaticCaptions: SubtitleMap, uiLanguage: string): string {
	const fromIntl = languageLabel(captionLanguage(code), uiLanguage)
	if (fromIntl) return fromIntl
	const fromMeta = code.endsWith(ORIGINAL_CAPTION_SUFFIX) ? undefined : (subtitles[code]?.[0]?.name ?? automaticCaptions[code]?.[0]?.name)
	return fromMeta ?? captionLanguage(code)
}
