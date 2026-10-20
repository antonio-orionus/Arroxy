import {downloadProfileRefFor, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import type {TFunction} from 'i18next'
import type {LucideIcon} from 'lucide-react'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import {profilePickerOptions, type ProfilePickerOption} from './profilePickerOptions.js'

export interface DownloadProfileActionModel {
	activeProfile: DownloadProfile
	activeRef: DownloadProfileRef
	ActiveIcon: LucideIcon
	options: ProfilePickerOption[]
}

// The short media line under a profile's name ("720p · best audio"). Tiers,
// containers and bitrates read the same in every language; the words do not.
export function quickProfileSummary(profile: DownloadProfile, t: TFunction): string {
	switch (profile.media.kind) {
		case 'video-audio': {
			const {tier, goal} = profile.media
			const video = tier === 'best' ? t('wizard.url.profile.summary.bestVideo') : `${tier}p`
			const audio = goal === 'smart-tv' || profile.media.fileType === 'mp4' ? t('wizard.url.profile.summary.aacAudio') : t('wizard.url.profile.summary.bestAudio')
			return `${video} · ${audio}`
		}
		case 'video-only': {
			const {tier} = profile.media
			return `${tier === 'best' ? t('wizard.url.profile.summary.bestVideo') : `${tier}p`} · ${t('wizard.url.profile.summary.noAudio')}`
		}
		case 'audio-only':
			if (profile.media.audio.format === 'best') return t('wizard.url.profile.summary.bestAudio')
			if (profile.media.audio.format === 'wav') return t('wizard.url.profile.summary.wavAudio')
			return `${profile.media.audio.format.toUpperCase()} ${profile.media.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE}K`
		case 'subtitles-only':
			return t('wizard.url.profile.summary.subtitlesOnly')
	}
}

// `current` is the profile to mark as chosen instead of the app's active one: a
// download that started from another profile shows that one, even if it was
// hidden since (profilePickerOptions).
export function buildDownloadProfileActionModel(profilesPrefs: DownloadProfilesPrefs | undefined, current?: DownloadProfile): DownloadProfileActionModel {
	const activeProfile = current ?? resolveActiveDownloadProfile(profilesPrefs).profile
	return {activeProfile, activeRef: downloadProfileRefFor(activeProfile, profilesPrefs), ActiveIcon: PROFILE_ICONS[activeProfile.icon], options: profilePickerOptions(profilesPrefs, {current: activeProfile})}
}
