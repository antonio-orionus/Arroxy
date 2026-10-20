import {downloadProfileRefFor, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import type {LucideIcon} from 'lucide-react'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import {profilePickerOptions, type ProfilePickerOption} from './profilePickerOptions.js'

export interface DownloadProfileActionModel {
	activeProfile: DownloadProfile
	activeRef: DownloadProfileRef
	ActiveIcon: LucideIcon
	activeSummary: string
	options: ProfilePickerOption[]
}

export function quickProfileSummary(profile: DownloadProfile): string {
	switch (profile.media.kind) {
		case 'video-audio': {
			const {tier, goal} = profile.media
			const video = tier === 'best' ? 'best video' : `${tier}p`
			const audio = goal === 'smart-tv' || profile.media.fileType === 'mp4' ? 'AAC audio' : 'best audio'
			return `${video} · ${audio}`
		}
		case 'video-only': {
			const {tier} = profile.media
			return tier === 'best' ? 'best video · no audio' : `${tier}p · no audio`
		}
		case 'audio-only':
			if (profile.media.audio.format === 'best') return 'best audio'
			if (profile.media.audio.format === 'wav') return 'WAV audio'
			return `${profile.media.audio.format.toUpperCase()} ${profile.media.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE}K`
		case 'subtitles-only':
			return 'subtitles only'
	}
}

// `current` is the profile to mark as chosen instead of the app's active one: a
// download that started from another profile shows that one, even if it was
// hidden since (profilePickerOptions).
export function buildDownloadProfileActionModel(profilesPrefs: DownloadProfilesPrefs | undefined, current?: DownloadProfile): DownloadProfileActionModel {
	const activeProfile = current ?? resolveActiveDownloadProfile(profilesPrefs).profile
	return {activeProfile, activeRef: downloadProfileRefFor(activeProfile, profilesPrefs), ActiveIcon: PROFILE_ICONS[activeProfile.icon], activeSummary: quickProfileSummary(activeProfile), options: profilePickerOptions(profilesPrefs, {current: activeProfile})}
}
