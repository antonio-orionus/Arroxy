import {describe, expect, it} from 'vitest'
import {checkVerdicts} from '../../scripts/startup/checkVerdicts.js'
import type {JourneyVerdict} from '../../scripts/startup/runJourney.js'

function pass(id: string): JourneyVerdict {
	return {id, outcome: 'pass', observed: 'main-screen', violations: [], elapsedMs: 1}
}

describe('checkVerdicts', () => {
	it('passes when every expected journey reported success', () => {
		expect(checkVerdicts(['a', 'b'], [pass('a'), pass('b')])).toEqual([])
	})

	it('fails when a declared journey produced no verdict at all', () => {
		const reasons = checkVerdicts(['a', 'b'], [pass('a')])
		expect(reasons).toHaveLength(1)
		expect(reasons[0]).toMatch(/b.*no verdict/i)
	})

	it('fails when a journey reported failure', () => {
		const failed: JourneyVerdict = {id: 'b', outcome: 'fail', observed: 'none', violations: [], error: 'timed out', elapsedMs: 1}
		expect(checkVerdicts(['a', 'b'], [pass('a'), failed])).toHaveLength(1)
	})

	it('reports log violations in the failure reason', () => {
		const dirty: JourneyVerdict = {id: 'a', outcome: 'fail', observed: 'main-screen', violations: [{kind: 'error-line', detail: 'boom'}], elapsedMs: 1}
		expect(checkVerdicts(['a'], [dirty])[0]).toMatch(/error-line: boom/)
	})

	it('fails when no verdicts were produced at all', () => {
		expect(checkVerdicts(['a', 'b'], [])).toHaveLength(2)
	})
})
