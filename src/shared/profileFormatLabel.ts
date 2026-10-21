import type {TFunction} from 'i18next'
import {DEFAULT_AUDIO_BITRATE} from './schemas.js'
import type {DownloadProfile} from './types.js'
import {formatList} from './listFormat.js'
import {resolveSubtitleLabel} from './subtitleTrackLabel.js'

// What a profile downloads, in the app language, as one line: a queue row's
// format and the profile update diff's. The window and main both build rows,
// so each passes its own translator and language.

const FILE_TYPE_LABEL_KEYS = {mp4: 'fileType.mp4', mkv: 'fileType.mkv', webm: 'fileType.webm'} as const

function subtitleLanguages(languages: readonly string[], language: string): string {
	return formatList(
		languages.map(code => resolveSubtitleLabel(code, {}, {}, language)),
		language,
		'conjunction'
	)
}

export function profileSubtitlesValue(profile: DownloadProfile, t: TFunction, language: string): string {
	const {languages, format, mode} = profile.subtitles
	if (languages.length === 0) return t('wizard.subtitles.noSelected')
	return [subtitleLanguages(languages, language), mode === 'embed' ? null : format.toUpperCase()].filter(Boolean).join(' · ')
}

// What a profile downloads, without its kind: the video it picks, the audio it
// converts to, or the subtitles it fetches. The hint's row label names the kind.
export function profileMediaValue(profile: DownloadProfile, t: TFunction, language: string): string {
	const {media} = profile
	switch (media.kind) {
		case 'video-audio':
		case 'video-only': {
			const parts = [t(`playlistPresets.tier.${media.tier}`), t(media.goal === 'smart-tv' ? 'wizard.profileEditor.goal.smartTv.name' : 'wizard.profileEditor.goal.bestPicture.name')]
			if (media.fileType !== 'auto') parts.push(t(FILE_TYPE_LABEL_KEYS[media.fileType]))
			if (media.kind === 'video-only') parts.push(t('wizard.formats.noAudio'))
			return parts.join(' · ')
		}
		case 'audio-only': {
			const {format, bitrateKbps} = media.audio
			if (format === 'best') return t('wizard.formats.keepAudio')
			if (format === 'wav') return t('wizard.formats.convert.wavLabel')
			return t('wizard.formats.convert.lossyLabel', {target: format.toUpperCase(), bitrate: bitrateKbps ?? DEFAULT_AUDIO_BITRATE})
		}
		case 'subtitles-only':
			return profileSubtitlesValue(profile, t, language)
	}
}

// What a profile downloads, as one line that stands on its own (a queue row's
// format, the update diff): audio and subtitle profiles say their kind first.
export function profileFormatLabel(profile: DownloadProfile, t: TFunction, language: string): string {
	const value = profileMediaValue(profile, t, language)
	switch (profile.media.kind) {
		case 'video-audio':
		case 'video-only':
			return value
		case 'audio-only':
			return `${t('wizard.formats.kind.audio')} · ${value}`
		case 'subtitles-only':
			return `${t('wizard.formats.kind.subtitles')} · ${value}`
	}
}
