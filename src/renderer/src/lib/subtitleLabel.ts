import type {SubtitleMap, SubtitleMode} from '@shared/types.js'
import {LIVE_CHAT_LANG} from '@shared/constants.js'

export const SUBTITLE_MODE_I18N_KEYS = {sidecar: 'wizard.subtitles.saveMode.sidecar', embed: 'wizard.subtitles.saveMode.embed', subfolder: 'wizard.subtitles.saveMode.subfolder'} as const satisfies Record<SubtitleMode, string>

const displayNamesByLanguage = new Map<string, Intl.DisplayNames>()

function displayNamesFor(uiLanguage: string): Intl.DisplayNames {
	const cached = displayNamesByLanguage.get(uiLanguage)
	if (cached) return cached
	// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language; locale is runtime data
	const next = new Intl.DisplayNames([uiLanguage, 'en'], {type: 'language', fallback: 'none'})
	displayNamesByLanguage.set(uiLanguage, next)
	return next
}

const graphemesByLanguage = new Map<string, Intl.Segmenter>()

// A label starts a list row, chip or summary, so it starts with a capital even
// where CLDR writes language names in lowercase (Russian "английский").
function capitalizeFirst(text: string, uiLanguage: string): string {
	let graphemes = graphemesByLanguage.get(uiLanguage)
	if (!graphemes) {
		// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language; locale is runtime data
		graphemes = new Intl.Segmenter(uiLanguage, {granularity: 'grapheme'})
		graphemesByLanguage.set(uiLanguage, graphemes)
	}
	const first = graphemes.segment(text)[Symbol.iterator]().next().value?.segment ?? ''
	return first.toLocaleUpperCase(uiLanguage) + text.slice(first.length)
}

function intlLanguageName(code: string, uiLanguage: string): string | undefined {
	try {
		return displayNamesFor(uiLanguage).of(code)
	} catch {
		// Other sites' keys need not be BCP 47 tags (NRK's `nb-ttv`).
		return undefined
	}
}

// An `-orig` key is YouTube's caption of the spoken language, the only
// automatic caption Arroxy keeps there. yt-dlp names it "English (Original)",
// which next to the Auto badge reads as the uploaded track, so it never takes
// that name.
const ORIGINAL_CAPTION_SUFFIX = '-orig'

// The label of a subtitle track wherever the UI lists one, in the UI language:
// yt-dlp's track names are English whatever the UI language, so they are used
// only for codes Intl cannot name.
export function resolveSubtitleLabel(code: string, subtitles: SubtitleMap, automaticCaptions: SubtitleMap, uiLanguage: string): string {
	const isOriginalCaption = code.endsWith(ORIGINAL_CAPTION_SUFFIX)
	const languageCode = isOriginalCaption ? code.slice(0, -ORIGINAL_CAPTION_SUFFIX.length) : code
	const fromIntl = intlLanguageName(languageCode.replace('_', '-'), uiLanguage)
	if (fromIntl) return capitalizeFirst(fromIntl, uiLanguage)
	const fromMeta = isOriginalCaption ? undefined : (subtitles[code]?.[0]?.name ?? automaticCaptions[code]?.[0]?.name)
	return fromMeta ?? languageCode
}

export function buildSubtitleList(subtitles: SubtitleMap, automaticCaptions: SubtitleMap, uiLanguage: string): {code: string; displayName: string; isAuto: boolean}[] {
	const manual = Object.keys(subtitles).flatMap(code => (code === LIVE_CHAT_LANG ? [] : [{code, displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage), isAuto: false}]))
	const auto = Object.keys(automaticCaptions).flatMap(code => (code === LIVE_CHAT_LANG || subtitles[code] ? [] : [{code, displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage), isAuto: true}]))
	return [...manual, ...auto]
}

// A language name for running text, in the UI language's own casing
// ("subtitles in German" / "субтитры на языках: немецкий").
export function languageName(code: string, uiLanguage: string): string {
	return intlLanguageName(code, uiLanguage) ?? code
}

const listFormatByLanguage = new Map<string, Intl.ListFormat>()

// Language codes as a list of names in the UI language ("German, French").
export function formatLanguageList(codes: readonly string[], uiLanguage: string): string {
	let list = listFormatByLanguage.get(uiLanguage)
	if (!list) {
		// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language; locale is runtime data
		list = new Intl.ListFormat([uiLanguage, 'en'], {type: 'unit', style: 'short'})
		listFormatByLanguage.set(uiLanguage, list)
	}
	return list.format(codes.map(code => languageName(code, uiLanguage)))
}
