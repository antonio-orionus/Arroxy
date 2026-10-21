// Which profile a client's link is prepared with. A named profile must exist
// and be enabled (links.add answers profile_unavailable otherwise, never
// falling back), and it is never made active. Without one, the active profile
// is the one the window shows, as the hotkey takes it.

import {allDownloadProfiles, downloadProfileRefFor, resolveActiveDownloadProfile, resolveChosenDownloadProfile} from '@shared/downloadProfiles.js'
import type {AppSettings, DownloadProfileRef} from '@shared/types.js'

// The window saves a profile pick through a queue of settings writes, so main's
// settings may not hold it yet; a profile disabled since falls back as it does
// for every row.
export function activeProfileRef(settings: AppSettings, windowProfile: DownloadProfileRef | undefined): DownloadProfileRef {
	return windowProfile ? resolveChosenDownloadProfile(windowProfile, settings.profiles).ref : resolveActiveDownloadProfile(settings.profiles).ref
}

// The named profile, if it exists under that kind and is enabled.
export function enabledProfileRef(settings: AppSettings, ref: DownloadProfileRef): DownloadProfileRef | null {
	const profile = allDownloadProfiles(settings.profiles).find(candidate => candidate.enabled && candidate.id === ref.id && downloadProfileRefFor(candidate, undefined).kind === ref.kind)
	return profile ? ref : null
}
