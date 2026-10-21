import type {TFunction} from 'i18next'
import type {DownloadProfile} from '@shared/types.js'
import {EMBED_FIELDS, EMBED_OPTION_KEYS} from './outputLabels.js'
import {formatList} from '@shared/listFormat.js'
import {profileMediaValue, profileSubtitlesValue} from '@shared/profileFormatLabel.js'
import {effectiveOutputDir} from '@shared/subfolder.js'

// What a profile does, in the app language, for its hint. Names say what a
// profile is; this says the rest, so profile lists show names only. Its
// one-line form (profileFormatLabel) lives in shared: main builds rows too.

export interface ProfileSummaryRow {
	label: string
	value: string
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
	const rows: ProfileSummaryRow[] = [{label: mediaRowLabel(profile, t), value: profileMediaValue(profile, t, language)}]
	if (!subtitlesOnly) rows.push({label: t('wizard.review.rows.subtitles'), value: profile.subtitles.enabled ? profileSubtitlesValue(profile, t, language) : t('wizard.review.value.subtitlesOff')})
	rows.push({label: t('wizard.review.rows.saveTo'), value: folderValue(profile, t)})
	if (!subtitlesOnly) {
		const extras = EMBED_FIELDS.filter(field => profile.embed[field]).map(field => t(EMBED_OPTION_KEYS[field].shortKey))
		rows.push({label: t('wizard.review.rows.extras'), value: extras.length > 0 ? formatList(extras, language, 'conjunction') : t('wizard.review.value.extrasNone')})
	}
	return rows
}
