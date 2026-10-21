// The one rule every profile picker follows: the user's saved order, with a
// profile that is in use but hidden still offered, first, so whatever a
// download or a row already uses can always be seen and kept.

import {allDownloadProfiles, downloadProfileRefFor} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import type {LucideIcon} from 'lucide-react'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'

export interface ProfilePickerOption {
	profile: DownloadProfile
	ref: DownloadProfileRef
	Icon: LucideIcon
	// The one profile the picker marks as chosen; none when the targets differ.
	current: boolean
	hidden: boolean
}

export interface ProfilePickerOptionsInput {
	current: DownloadProfile | null
	// Profiles what the picker acts on already uses; the current one counts too.
	inUse?: readonly DownloadProfile[]
}

export function profilePickerOptions(prefs: DownloadProfilesPrefs | undefined, {current, inUse = []}: ProfilePickerOptionsInput): ProfilePickerOption[] {
	const used = new Set([...(current ? [current.id] : []), ...inUse.map(profile => profile.id)])
	const saved = allDownloadProfiles(prefs)
	// A current profile deleted since it was picked is no longer saved at all; it still shows.
	const unsaved = current && !saved.some(profile => profile.id === current.id) ? [current] : []
	const hiddenInUse = saved.filter(profile => !profile.enabled && used.has(profile.id))
	const ordered = [...unsaved, ...hiddenInUse, ...saved.filter(profile => profile.enabled)]
	return ordered.map(profile => ({profile, ref: downloadProfileRefFor(profile, prefs), Icon: PROFILE_ICONS[profile.icon], current: profile.id === current?.id, hidden: !profile.enabled || unsaved.includes(profile)}))
}
