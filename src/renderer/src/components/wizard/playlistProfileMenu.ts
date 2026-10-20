// The profile menu on the playlist-profiles step acts on a set of rows: the
// selection (toolbar), or a row and the selection it belongs to (the row's
// profile and its right-click menu). It checks the profile those rows share
// and edits that one; rows on different profiles check nothing and offer no
// Edit. A hidden profile any of the rows use still shows, first.

import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import {profilePickerOptions, type ProfilePickerOption} from './profilePickerOptions.js'

export interface PlaylistProfileMenuModel {
	options: ProfilePickerOption[]
	sharedProfile: DownloadProfile | null
}

export function playlistProfileMenuModel(prefs: DownloadProfilesPrefs | undefined, targetProfiles: readonly DownloadProfile[]): PlaylistProfileMenuModel {
	const first = targetProfiles[0]
	const sharedProfile = first && targetProfiles.every(profile => profile.id === first.id) ? first : null
	return {options: profilePickerOptions(prefs, {current: sharedProfile, inUse: targetProfiles}), sharedProfile}
}

// A row's menu acts on the whole selection when the row is in it, like its
// right-click menu, and on that row alone otherwise.
export function rowMenuTargets(rowId: string, selectedIds: ReadonlySet<string>, selectedItemIds: readonly string[]): string[] {
	return selectedIds.has(rowId) ? [...selectedItemIds] : [rowId]
}
