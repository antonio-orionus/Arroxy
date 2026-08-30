import type {JourneyVerdict} from './runJourney.js'

/**
 * Exit code alone is never the pass signal. A tier declares the journeys that
 * must report; a missing verdict is a failure, so "the step ran nothing" and
 * "the step passed" can never produce the same result.
 */
export function checkVerdicts(expectedIds: readonly string[], verdicts: readonly JourneyVerdict[]): string[] {
	const byId = new Map(verdicts.map(verdict => [verdict.id, verdict]))
	const reasons: string[] = []

	for (const id of expectedIds) {
		const verdict = byId.get(id)
		if (!verdict) {
			reasons.push(`${id}: no verdict reported — the journey never ran`)
			continue
		}
		if (verdict.outcome === 'pass') continue

		const violations = verdict.violations.map(violation => `${violation.kind}: ${violation.detail}`).join('; ')
		reasons.push([`${id}: ${verdict.error ?? 'failed'}`, violations].filter(Boolean).join(' | '))
	}

	return reasons
}
