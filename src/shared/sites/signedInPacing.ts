// The signed-in pacing a site gets under the user's Pacing preset (ADR 0022).
// Balanced and Off keep the site's own numbers: Off only removes the waits
// inside a launch, never the account's protection. Careful halves the launches
// per window and doubles the spacing; Custom scales both by its signed-in pace,
// a percentage of the site's numbers.

import type {NetworkPacingPreset} from '../schemas.js'
import {knownSignedInPacing, type SignedInPacing} from './siteKeys.js'

const DEFAULT_SIGNED_IN_PACING: SignedInPacing = {atOnce: 2, spacingMs: 5000, jitterMs: 2000, windowMs: 60 * 60_000, perWindow: 120, entriesPerLaunch: 50}

const CAREFUL_PACE_PERCENT = 50

export function signedInPacingFor(siteKey: string, preset: NetworkPacingPreset, customPacePercent?: number): SignedInPacing {
	const base = {...DEFAULT_SIGNED_IN_PACING, ...knownSignedInPacing(siteKey)}
	const percent = preset === 'careful' ? CAREFUL_PACE_PERCENT : preset === 'custom' ? (customPacePercent ?? 100) : 100
	const scale = percent / 100
	return {...base, spacingMs: Math.round(base.spacingMs / scale), jitterMs: Math.round(base.jitterMs / scale), perWindow: Math.max(1, Math.round(base.perWindow * scale))}
}
