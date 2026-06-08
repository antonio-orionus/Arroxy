import {describe, expect, it} from 'vitest'
import {FAILURE_CODE} from '@shared/types.js'

// Stability snapshot. These ARX-### codes are a public contract: users see
// them in the repair UI and search for them ("ARX-006 SmartScreen") online.
// Renaming a `DependencyFailureKind` is fine, but repurposing a code is not.
// New kinds must take the next free `ARX-0NN`.
describe('FAILURE_CODE stability', () => {
	it('exact map is frozen — new kinds take next ARX-0NN, never reuse codes', () => {
		expect(FAILURE_CODE).toEqual({download_failed: 'ARX-001', extract_failed: 'ARX-002', hash_failed: 'ARX-003', spawn_failed: 'ARX-004', permission_denied: 'ARX-005', blocked_or_quarantined: 'ARX-006', bad_exit_code: 'ARX-007', timeout: 'ARX-008', pair_incomplete: 'ARX-009'})
	})

	it('every code is unique', () => {
		const codes = Object.values(FAILURE_CODE)
		expect(new Set(codes).size).toBe(codes.length)
	})

	it('every code matches ARX-### format', () => {
		for (const code of Object.values(FAILURE_CODE)) {
			expect(code).toMatch(/^ARX-\d{3}$/)
		}
	})
})
