// The profile menu on the playlist-profiles step acts on a set of rows: the
// selection (toolbar), or a row and the selection it belongs to (the row's
// profile). It checks the profile those rows share and edits that one; rows
// on different profiles check nothing and offer no Edit.

import type {DownloadProfile} from '@shared/types.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'

export interface PlaylistProfileMenuModel {
	options: DownloadProfileActionOption[]
	sharedProfile: DownloadProfile | null
}

export function playlistProfileMenuModel(options: readonly DownloadProfileActionOption[], targetProfiles: readonly DownloadProfile[]): PlaylistProfileMenuModel {
	const first = targetProfiles[0]
	const sharedProfile = first && targetProfiles.every(profile => profile.id === first.id) ? first : null
	return {options: options.map(option => ({...option, active: option.profile.id === sharedProfile?.id})), sharedProfile}
}

// A row's menu acts on the whole selection when the row is in it, like its
// right-click menu, and on that row alone otherwise.
export function rowMenuTargets(rowId: string, selectedIds: ReadonlySet<string>, selectedItemIds: readonly string[]): string[] {
	return selectedIds.has(rowId) ? [...selectedItemIds] : [rowId]
}
