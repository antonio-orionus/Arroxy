import type {SubtitleMap, SubtitleMode} from '@shared/types.js'
import {LIVE_CHAT_LANG} from '@shared/constants.js'

export const SUBTITLE_MODE_I18N_KEYS = {sidecar: 'wizard.subtitles.saveMode.sidecar', embed: 'wizard.subtitles.saveMode.embed', subfolder: 'wizard.subtitles.saveMode.subfolder'} as const satisfies Record<SubtitleMode, string>

const displayNamesByLanguage = new Map<string, Intl.DisplayNames>()

function displayNamesFor(uiLanguage: string): Intl.DisplayNames {
	const cached = displayNamesByLanguage.get(uiLanguage)
	if (cached) return cached
	// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language; locale is runtime data
	const next = new Intl.DisplayNames([uiLanguage, 'en'], {type: 'language'})
	displayNamesByLanguage.set(uiLanguage, next)
	return next
}

export function resolveSubtitleLabel(code: string, subtitles: SubtitleMap, automaticCaptions: SubtitleMap, uiLanguage: string): string {
	const fromMeta = subtitles[code]?.[0]?.name ?? automaticCaptions[code]?.[0]?.name
	if (fromMeta) return fromMeta
	try {
		const normalized = code.replace('_', '-').split('-orig')[0]
		const dn = displayNamesFor(uiLanguage)
		return dn.of(normalized) ?? code
	} catch {
		return code
	}
}

export function buildSubtitleList(subtitles: SubtitleMap, automaticCaptions: SubtitleMap, uiLanguage: string): {code: string; displayName: string; isAuto: boolean}[] {
	const manual = Object.keys(subtitles).flatMap(code => (code === LIVE_CHAT_LANG ? [] : [{code, displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage), isAuto: false}]))
	const auto = Object.keys(automaticCaptions).flatMap(code => (code === LIVE_CHAT_LANG || subtitles[code] ? [] : [{code, displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage), isAuto: true}]))
	return [...manual, ...auto]
}
