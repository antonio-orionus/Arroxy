import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_PROTOCOL_MAJORS, negotiateProtocolMajor} from '../src/index'

describe('negotiateProtocolMajor', () => {
	it('speaks major 1 in this release', () => {
		expect(CONTROL_PROTOCOL_MAJORS).toEqual([1])
	})

	it('picks the highest major both sides speak', () => {
		expect(negotiateProtocolMajor([1, 2, 3], [1, 2])).toEqual({ok: true, major: 2})
		expect(negotiateProtocolMajor([1])).toEqual({ok: true, major: 1})
	})

	it('answers version_unsupported naming both ranges when none is shared', () => {
		const result = negotiateProtocolMajor([2, 3], [1])
		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.error.code).toBe('version_unsupported')
			expect(result.error.details).toEqual({clientMajors: [2, 3], serverMajors: [1]})
		}
	})
})
