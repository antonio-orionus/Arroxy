import type {SubtitleMap, SubtitleMode} from '@shared/types.js'
import {LIVE_CHAT_LANG} from '@shared/constants.js'
import {intlLanguageName, languageLabel} from './languageName.js'

export const SUBTITLE_MODE_I18N_KEYS = {sidecar: 'wizard.subtitles.saveMode.sidecar', embed: 'wizard.subtitles.saveMode.embed', subfolder: 'wizard.subtitles.saveMode.subfolder'} as const satisfies Record<SubtitleMode, string>

// An `-orig` key is YouTube's caption of the spoken language, the only
// automatic caption Arroxy keeps there. yt-dlp names it "English (Original)",
// which next to the Auto badge reads as the uploaded track, so it never takes
// that name.
const ORIGINAL_CAPTION_SUFFIX = '-orig'

function captionLanguage(code: string): string {
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

export function buildSubtitleList(subtitles: SubtitleMap, automaticCaptions: SubtitleMap, uiLanguage: string): {code: string; displayName: string; isAuto: boolean}[] {
	const manual = Object.keys(subtitles).flatMap(code => (code === LIVE_CHAT_LANG ? [] : [{code, displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage), isAuto: false}]))
	const auto = Object.keys(automaticCaptions).flatMap(code => (code === LIVE_CHAT_LANG || subtitles[code] ? [] : [{code, displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage), isAuto: true}]))
	return [...manual, ...auto]
}

// A language name for running text, in the UI language's own casing
// ("subtitles in German" / "субтитры на языках: немецкий").
export function languageName(code: string, uiLanguage: string): string {
	return intlLanguageName(captionLanguage(code), uiLanguage) ?? captionLanguage(code)
}

const listFormats = new Map<string, Intl.ListFormat>()

// Language codes as a list of names in the UI language. The message picks the
// join: "no subtitles in German or French" says none of them exist, "asks for
// subtitles in German and French" lists them all. Intl spells either in each
// language's own separators.
export function formatLanguageList(codes: readonly string[], uiLanguage: string, type: 'conjunction' | 'disjunction'): string {
	return formatList(
		codes.map(code => languageName(code, uiLanguage)),
		uiLanguage,
		type
	)
}

// Labels as one list in the UI language's own separators ("A, B and C").
export function formatList(items: readonly string[], uiLanguage: string, type: 'conjunction' | 'disjunction'): string {
	const key = `${type}:${uiLanguage}`
	let list = listFormats.get(key)
	if (!list) {
		// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language and type; locale is runtime data
		list = new Intl.ListFormat([uiLanguage, 'en'], {type})
		listFormats.set(key, list)
	}
	return list.format(items)
}
