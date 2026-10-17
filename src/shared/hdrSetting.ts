// What the app-wide "HDR video" setting means right now. Auto follows the
// screen the app is on: HDR first only when that screen shows HDR, since HDR
// looks washed out on one that doesn't. The check itself (a media query)
// belongs to the renderer, so this module only turns its answer into a choice.

import type {HdrPreference, HdrSetting} from './schemas.js'

// Where an HDR choice comes from: the app setting, the profile, or the screen.
export type HdrSource = 'settings' | 'profile' | 'display'

export interface ResolvedHdr {
	preference: HdrPreference
	source: Exclude<HdrSource, 'profile'>
}

// A resolved choice, or a bare one that is taken as coming from Settings.
export type GlobalHdr = HdrPreference | ResolvedHdr

// What to assume when nothing is known: SDR looks right on any screen.
export const DEFAULT_HDR_PREFERENCE: HdrPreference = 'sdr'

export function resolveHdrSetting(setting: HdrSetting, displayShowsHdr: boolean): ResolvedHdr {
	if (setting === 'auto') return {preference: displayShowsHdr ? 'hdr' : 'sdr', source: 'display'}
	return {preference: setting, source: 'settings'}
}

export function asResolvedHdr(global: GlobalHdr): ResolvedHdr {
	return typeof global === 'string' ? {preference: global, source: 'settings'} : global
}
