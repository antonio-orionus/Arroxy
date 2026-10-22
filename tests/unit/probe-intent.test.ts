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
const KNOWN_VIOLATIONS: Record<string, Partial<Record<ProbeSourceId, string[]>>> = {}

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
