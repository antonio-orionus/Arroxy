import type {DownloadProfile, SubtitleFormat, SubtitleMap, SubtitleMode} from '@shared/types.js'
import type {WizardMediaKind} from '@shared/schemas.js'
import {mediaKindHasVideo, subtitleModeForMedia} from '@shared/downloadProfiles.js'
import {LIVE_CHAT_LANG} from '@shared/constants.js'
import {intlLanguageName} from '@shared/languageName.js'
import {formatList} from '@shared/listFormat.js'
import {captionLanguage, resolveSubtitleLabel} from '@shared/subtitleTrackLabel.js'

const SUBTITLE_MODE_I18N_KEYS = {sidecar: 'wizard.subtitles.saveMode.sidecar', embed: 'wizard.subtitles.saveMode.embed', subfolder: 'wizard.subtitles.saveMode.subfolder'} as const satisfies Record<SubtitleMode, string>
const SIDECAR_NO_VIDEO_KEY = 'wizard.subtitles.saveMode.sidecarNoVideo'

type SubtitleModeLabelKey = (typeof SUBTITLE_MODE_I18N_KEYS)[SubtitleMode] | typeof SIDECAR_NO_VIDEO_KEY

// The single-video wizard's media kinds, as a profile's, for the subtitle rules.
const WIZARD_PROFILE_MEDIA_KINDS = {video: 'video-audio', audio: 'audio-only', subtitles: 'subtitles-only'} as const satisfies Record<WizardMediaKind, DownloadProfile['media']['kind']>

// Where subtitles of this mode are saved, as a label. Sidecar files of a
// download without video have no video to sit next to, so they go "In the
// download folder".
export function subtitleModeLabelKey(mode: SubtitleMode, hasVideo: boolean): SubtitleModeLabelKey {
	return mode === 'sidecar' && !hasVideo ? SIDECAR_NO_VIDEO_KEY : SUBTITLE_MODE_I18N_KEYS[mode]
}

export function wizardMediaHasVideo(mediaKind: WizardMediaKind): boolean {
	return mediaKindHasVideo(WIZARD_PROFILE_MEDIA_KINDS[mediaKind])
}

// The subtitle mode a run of this kind can keep, by the profile editor's rule:
// without video there is nothing to embed into, so Embed becomes Sidecar.
export function wizardSubtitleModeForMedia(mediaKind: WizardMediaKind, mode: SubtitleMode): SubtitleMode {
	return subtitleModeForMedia(WIZARD_PROFILE_MEDIA_KINDS[mediaKind], mode)
}

export interface SubtitleDeliveryLabel {
	// The format of the files written, null when the subtitles are embedded.
	format: string | null
	labelKey: SubtitleModeLabelKey
}

// What a download does with its subtitles, for a one-line summary: by the mode
// it runs with, so Embed without video reads as the sidecar files it writes.
export function subtitleDeliveryLabel(mediaKind: DownloadProfile['media']['kind'], mode: SubtitleMode, format: SubtitleFormat): SubtitleDeliveryLabel {
	const runs = subtitleModeForMedia(mediaKind, mode)
	return {format: runs === 'embed' ? null : format.toUpperCase(), labelKey: subtitleModeLabelKey(runs, mediaKindHasVideo(mediaKind))}
}

export function wizardSubtitleDeliveryLabel(mediaKind: WizardMediaKind, mode: SubtitleMode, format: SubtitleFormat): SubtitleDeliveryLabel {
	return subtitleDeliveryLabel(WIZARD_PROFILE_MEDIA_KINDS[mediaKind], mode, format)
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
