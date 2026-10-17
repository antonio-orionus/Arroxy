import {DEFAULTS} from '@shared/constants.js'
import {resolveHdrSetting, type ResolvedHdr} from '@shared/hdrSetting.js'
import type {HdrSetting} from '@shared/types.js'

// Whether the screen this window is on shows HDR. Chromium answers it through
// the `dynamic-range` media query (true on an HDR display with HDR on, false
// otherwise), per window, so it follows the monitor the window sits on.
// Anything that cannot answer reads as SDR, which looks right everywhere.
function displayShowsHdr(): boolean {
	try {
		return window.matchMedia('(dynamic-range: high)').matches
	} catch {
		return false
	}
}

// The app-wide HDR setting, with Auto settled against the screen right now.
export function resolveAppHdr(setting: HdrSetting | undefined): ResolvedHdr {
	return resolveHdrSetting(setting ?? DEFAULTS.hdrPreference, displayShowsHdr())
}
