// Every recorded probe (`src/renderer/src/dev/probeSources/`) replayed
// through the app's mapping and profile picks, judged by the intent rules in
// `scripts/probe-intent/rules.ts`. A YouTube track keyed `en-nP7-2PuUl7o` sat
// in a recorded probe for days while every check that compared two of
// Arroxy's own answers passed over it.
//
// A violation that is a known, filed bug goes in KNOWN_VIOLATIONS with its
// issue; that list fails once the bug is fixed, so it never goes stale.

import {describe, expect, it} from 'vite-plus/test'
import {probeSourceInfo, probeSourceResult} from '@renderer/dev/probeSources/index.js'
import {PROBE_SOURCES, type ProbeSourceId} from '@renderer/dev/probeSources/sources.js'
import {rawFormats, RULES} from '../../scripts/probe-intent/rules.js'

// Filed bugs, by rule and probe; each line must still be reported.
const KNOWN_VIOLATIONS: Record<string, Partial<Record<ProbeSourceId, string[]>>> = {
	'a tiered profile picks its tier, or says what it picked instead': {
		// #654: a format with no resolution passes yt-dlp's `res` limit.
		facebook: ['small-file picks hd, of unknown size, over sized streams', 'low-240 picks hd, of unknown size, over sized streams', 'low-144 picks hd, of unknown size, over sized streams'],
		// #657: a 960x540 row is 480p, but `res:480` measures it as 540 (with #654's two).
		instagram: ['small-file picks 360p though a 480p stream it can take exists', 'low-240 picks 3, of unknown size, over sized streams', 'low-144 picks 3, of unknown size, over sized streams'],
		vimeo: ['small-file picks 360p though a 480p stream it can take exists', 'mp4-480 picks 360p though a 480p stream it can take exists']
	}
}

describe('profile picks match the user’s request on every recorded probe', () => {
	for (const [rule, check] of Object.entries(RULES)) {
		describe(rule, () => {
			for (const {id} of PROBE_SOURCES) {
				it(id, () => {
					const violations = check(probeSourceResult(id), rawFormats(probeSourceInfo(id)))
					expect(violations).toEqual(KNOWN_VIOLATIONS[rule]?.[id] ?? [])
				})
			}
		})
	}
})
