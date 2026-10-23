import {SignedInPacer} from '@main/services/SignedInPacer.js'
import type {SignedInPacing} from '@shared/sites/siteKeys.js'

// A signed-in pacer with the same numbers on every site: no jitter, and a
// budget no test reaches unless it asks for one.
export function testPacer(overrides: Partial<SignedInPacing> = {}, perJobCap?: number): SignedInPacer {
	const pacing: SignedInPacing = {atOnce: 2, spacingMs: 0, jitterMs: 0, windowMs: 60 * 60_000, perWindow: 1000, entriesPerLaunch: 50, ...overrides}
	return new SignedInPacer({pacing: () => pacing, ...(perJobCap === undefined ? {} : {perJobCap})})
}
