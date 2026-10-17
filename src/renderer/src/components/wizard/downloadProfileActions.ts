import {downloadProfileLabel, downloadProfileRefFor, enabledDownloadProfiles, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import type {LucideIcon} from 'lucide-react'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'

export interface DownloadProfileActionOption {
	profile: DownloadProfile
	ref: DownloadProfileRef
	Icon: LucideIcon
	label: string
	active: boolean
}

export interface DownloadProfileActionModel {
	activeProfile: DownloadProfile
	activeRef: DownloadProfileRef
	ActiveIcon: LucideIcon
	activeSummary: string
	options: DownloadProfileActionOption[]
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
// download that started from another profile shows that one. A profile turned
// off since then still shows, first.
export function buildDownloadProfileActionModel(profilesPrefs: DownloadProfilesPrefs | undefined, current?: DownloadProfile): DownloadProfileActionModel {
	const enabled = enabledDownloadProfiles(profilesPrefs)
	const activeProfile = current ?? resolveActiveDownloadProfile(profilesPrefs).profile
	const profiles = current && !enabled.some(profile => profile.id === current.id) ? [current, ...enabled] : enabled
	const activeRef = downloadProfileRefFor(activeProfile, profilesPrefs)
	return {
		activeProfile,
		activeRef,
		ActiveIcon: PROFILE_ICONS[activeProfile.icon],
		activeSummary: quickProfileSummary(activeProfile),
		options: profiles.map(profile => ({profile, ref: downloadProfileRefFor(profile, profilesPrefs), Icon: PROFILE_ICONS[profile.icon], label: downloadProfileLabel(profile), active: profile.id === activeProfile.id}))
	}
}
