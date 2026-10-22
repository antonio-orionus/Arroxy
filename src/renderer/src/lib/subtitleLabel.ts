import type {DownloadProfile, SubtitleMap, SubtitleMode} from '@shared/types.js'
import type {WizardMediaKind} from '@shared/schemas.js'
import {mediaKindHasVideo, profileSubtitleMode} from '@shared/downloadProfiles.js'
import {LIVE_CHAT_LANG} from '@shared/constants.js'
import {intlLanguageName} from '@shared/languageName.js'
import {formatList} from '@shared/listFormat.js'
import {captionLanguage, resolveSubtitleLabel} from '@shared/subtitleTrackLabel.js'

const SUBTITLE_MODE_I18N_KEYS = {sidecar: 'wizard.subtitles.saveMode.sidecar', embed: 'wizard.subtitles.saveMode.embed', subfolder: 'wizard.subtitles.saveMode.subfolder'} as const satisfies Record<SubtitleMode, string>
const SIDECAR_NO_VIDEO_KEY = 'wizard.subtitles.saveMode.sidecarNoVideo'

type SubtitleModeLabelKey = (typeof SUBTITLE_MODE_I18N_KEYS)[SubtitleMode] | typeof SIDECAR_NO_VIDEO_KEY

// Where subtitles are saved, as a label. Sidecar files of a download without
// video have no video to sit next to, so they go "In the download folder".
export function subtitleModeLabelKey(mode: SubtitleMode, hasVideo: boolean): SubtitleModeLabelKey {
	return mode === 'sidecar' && !hasVideo ? SIDECAR_NO_VIDEO_KEY : SUBTITLE_MODE_I18N_KEYS[mode]
}

// The single-video wizard's: only its Video kind has a video stream.
export function wizardSubtitleModeLabelKey(mediaKind: WizardMediaKind, mode: SubtitleMode): SubtitleModeLabelKey {
	return subtitleModeLabelKey(mode, mediaKind === 'video')
}

// A profile's, by the mode its job runs with.
export function profileSubtitleModeLabelKey(profile: DownloadProfile): SubtitleModeLabelKey {
	return subtitleModeLabelKey(profileSubtitleMode(profile), mediaKindHasVideo(profile.media.kind))
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
