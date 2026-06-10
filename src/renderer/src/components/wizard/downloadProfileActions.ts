import {allDownloadProfiles, downloadProfileLabel, downloadProfileRefFor, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
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
			const tier = profile.media.tiers[0] ?? 'best'
			const video = tier === 'best' ? 'best video' : `${tier}p`
			const audio = profile.media.audio.format === 'm4a' ? 'AAC audio' : 'best audio'
			return `${video} · ${audio}`
		}
		case 'video-only': {
			const tier = profile.media.tiers[0] ?? 'best'
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

export function buildDownloadProfileActionModel(profilesPrefs: DownloadProfilesPrefs | undefined): DownloadProfileActionModel {
	const profiles = allDownloadProfiles(profilesPrefs)
	const resolved = resolveActiveDownloadProfile(profilesPrefs)
	const activeRef = downloadProfileRefFor(resolved.profile, profilesPrefs)
	return {
		activeProfile: resolved.profile,
		activeRef,
		ActiveIcon: PROFILE_ICONS[resolved.profile.icon],
		activeSummary: quickProfileSummary(resolved.profile),
		options: profiles.map(profile => ({profile, ref: downloadProfileRefFor(profile, profilesPrefs), Icon: PROFILE_ICONS[profile.icon], label: downloadProfileLabel(profile), active: profile.id === resolved.profile.id}))
	}
}
