import {resolveActiveDownloadProfile, resolveChosenDownloadProfile} from '@shared/downloadProfiles.js'
import type {PinnedDownloadProfile} from '@shared/intake/intakeSchemas.js'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import type {AppState} from '../types.js'

// The profile and folders a Downloads row was placed with, while the wizard
// reviews that row's list; undefined otherwise.
export function reviewedRowPinnedProfile(state: Pick<AppState, 'queue' | 'reviewSourceRowId'>): PinnedDownloadProfile | undefined {
	return state.reviewSourceRowId ? state.queue.find(item => item.id === state.reviewSourceRowId)?.pinnedProfile : undefined
}

// The profile a batch's rows start from: the reviewed row's own (#665), else
// the active profile. A pinned profile hidden since falls back to the active
// one, as main does when it prepares the row.
export function playlistBaselineProfile(state: Pick<AppState, 'settings' | 'queue' | 'reviewSourceRowId'>): {profile: DownloadProfile; ref: DownloadProfileRef} {
	const pinned = reviewedRowPinnedProfile(state)
	return pinned ? resolveChosenDownloadProfile(pinned.ref, state.settings?.profiles) : resolveActiveDownloadProfile(state.settings?.profiles)
}
