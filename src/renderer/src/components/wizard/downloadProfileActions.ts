import {downloadProfileRefFor, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import type {LucideIcon} from 'lucide-react'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import {profilePickerOptions, type ProfilePickerOption} from './profilePickerOptions.js'

export interface DownloadProfileActionModel {
	activeProfile: DownloadProfile
	activeRef: DownloadProfileRef
	ActiveIcon: LucideIcon
	options: ProfilePickerOption[]
}

// `current` is the profile to mark as chosen instead of the app's active one: a
// download that started from another profile shows that one, even if it was
// hidden since (profilePickerOptions).
export function buildDownloadProfileActionModel(profilesPrefs: DownloadProfilesPrefs | undefined, current?: DownloadProfile): DownloadProfileActionModel {
	const activeProfile = current ?? resolveActiveDownloadProfile(profilesPrefs).profile
	return {activeProfile, activeRef: downloadProfileRefFor(activeProfile, profilesPrefs), ActiveIcon: PROFILE_ICONS[activeProfile.icon], options: profilePickerOptions(profilesPrefs, {current: activeProfile})}
}
