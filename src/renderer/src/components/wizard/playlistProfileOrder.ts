// Screen-local profile ordering for the playlist-profiles step. The catalog
// order from `allDownloadProfiles` (and therefore `buildDownloadProfileActionModel`)
// is builtins-then-custom, which buries a user's own profiles near the bottom
// of the action bar's dropdown. This re-sorts to baseline-first, then the
// user's custom profiles, then builtins, without touching the shared model
// builder (the home-screen picker still wants catalog order).

import type {DownloadProfileRef} from '@shared/types.js'
import {sameProfileRef} from '../../store/wizard/playlistProfileAssignments.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'

export function orderProfileOptionsForAssignment(options: readonly DownloadProfileActionOption[], baselineRef: DownloadProfileRef): DownloadProfileActionOption[] {
	const baseline = options.find(option => sameProfileRef(option.ref, baselineRef))
	const rest = options.filter(option => !sameProfileRef(option.ref, baselineRef))
	const custom = rest.filter(option => option.ref.kind === 'custom')
	const builtin = rest.filter(option => option.ref.kind === 'builtin')
	return baseline ? [baseline, ...custom, ...builtin] : [...custom, ...builtin]
}
