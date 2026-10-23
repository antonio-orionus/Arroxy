import {resolveActiveDownloadProfile, resolveChosenDownloadProfile, type DownloadProfileOutputContext} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import type {AppState} from '../types.js'

// The profile a batch's rows start from: a reviewed row's own (#665), else the
// active profile. A pinned profile hidden since falls back to the active one,
// as main does when it prepares the row.
export function playlistBaselineProfile(state: Pick<AppState, 'settings' | 'reviewPinnedProfile'>): {profile: DownloadProfile; ref: DownloadProfileRef} {
	const pinned = state.reviewPinnedProfile
	return pinned ? resolveChosenDownloadProfile(pinned.ref, state.settings?.profiles) : resolveActiveDownloadProfile(state.settings?.profiles)
}

// The folders a batch's profiles resolve against: those a reviewed row was
// placed with, else the wizard's folder and the default one.
export function playlistOutputContext(state: Pick<AppState, 'settings' | 'wizardOutputDir' | 'reviewPinnedProfile'>): DownloadProfileOutputContext {
	return state.reviewPinnedProfile?.outputContext ?? {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}
}
