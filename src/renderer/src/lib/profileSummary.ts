import type {TFunction} from 'i18next'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {DownloadProfile} from '@shared/types.js'
import {EMBED_FIELDS, EMBED_OPTION_KEYS} from './outputLabels.js'
import {formatList, resolveSubtitleLabel} from './subtitleLabel.js'
import {effectiveOutputDir} from '@shared/subfolder.js'

// What a profile does, in the app language, for its hint and every one-line
// description of it (a queue row's format, the profile update diff). Names say
// what a profile is; this says the rest, so profile lists show names only.

export interface ProfileSummaryRow {
	label: string
	value: string
}

const FILE_TYPE_LABEL_KEYS = {mp4: 'fileType.mp4', mkv: 'fileType.mkv', webm: 'fileType.webm'} as const

function subtitleLanguages(languages: readonly string[], language: string): string {
	return formatList(
		languages.map(code => resolveSubtitleLabel(code, {}, {}, language)),
		language,
		'conjunction'
	)
}

function subtitlesValue(profile: DownloadProfile, t: TFunction, language: string): string {
	const {languages, format, mode} = profile.subtitles
	if (languages.length === 0) return t('wizard.subtitles.noSelected')
	return [subtitleLanguages(languages, language), mode === 'embed' ? null : format.toUpperCase()].filter(Boolean).join(' · ')
}

// What a profile downloads, without its kind: the video it picks, the audio it
// converts to, or the subtitles it fetches. The hint's row label names the kind.
function mediaValue(profile: DownloadProfile, t: TFunction, language: string): string {
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
			return subtitlesValue(profile, t, language)
	}
}

// What a profile downloads, as one line that stands on its own (a queue row's
// format, the update diff): audio and subtitle profiles say their kind first.
export function profileFormatLabel(profile: DownloadProfile, t: TFunction, language: string): string {
	const value = mediaValue(profile, t, language)
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

function mediaRowLabel(profile: DownloadProfile, t: TFunction): string {
	switch (profile.media.kind) {
		case 'video-audio':
		case 'video-only':
			return t('playlistPresets.type.video')
		case 'audio-only':
			return t('playlistPresets.type.audio')
		case 'subtitles-only':
			return t('wizard.review.rows.subtitles')
	}
}

function folderValue(profile: DownloadProfile, t: TFunction): string {
	const subfolder = profile.subfolder.enabled ? profile.subfolder.name.trim() : ''
	if (profile.output.kind === 'fixed') return effectiveOutputDir(profile.output.dir, subfolder !== '', subfolder)
	return subfolder ? t('wizard.profileEditor.destination.defaultFolderWithSubfolder', {subfolder}) : t('wizard.profileEditor.destination.defaultFolder')
}

// One labelled row per area: what it downloads, its subtitles, where it saves
// and what it adds. A subtitles-only profile has neither subtitle nor extras rows.
export function profileSummaryRows(profile: DownloadProfile, t: TFunction, language: string): ProfileSummaryRow[] {
	const subtitlesOnly = profile.media.kind === 'subtitles-only'
	const rows: ProfileSummaryRow[] = [{label: mediaRowLabel(profile, t), value: mediaValue(profile, t, language)}]
	if (!subtitlesOnly) rows.push({label: t('wizard.review.rows.subtitles'), value: profile.subtitles.enabled ? subtitlesValue(profile, t, language) : t('wizard.review.value.subtitlesOff')})
	rows.push({label: t('wizard.review.rows.saveTo'), value: folderValue(profile, t)})
	if (!subtitlesOnly) {
		const extras = EMBED_FIELDS.filter(field => profile.embed[field]).map(field => t(EMBED_OPTION_KEYS[field].shortKey))
		rows.push({label: t('wizard.review.rows.extras'), value: extras.length > 0 ? formatList(extras, language, 'conjunction') : t('wizard.review.value.extrasNone')})
	}
	return rows
}
