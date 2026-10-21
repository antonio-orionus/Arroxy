import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_ROWS_PER_INTAKE, controlRowsPerIntake} from '@main/control/intakeAdmission.js'
import {PLAYLIST_PROBE_LIMIT_MAX} from '@shared/schemas.js'

// A Control client's intake may become at most as many rows as one link can
// bring in through the window; the window and the hotkey have no cap.

describe('controlRowsPerIntake', () => {
	it("caps a Control client's intake at the load limit's ceiling", () => {
		expect(CONTROL_ROWS_PER_INTAKE).toBe(PLAYLIST_PROBE_LIMIT_MAX)
		expect(controlRowsPerIntake({kind: 'localClient', clientId: 'c1', intakeId: 'i1'})).toBe(PLAYLIST_PROBE_LIMIT_MAX)
	})

	it('leaves the window and the hotkey uncapped', () => {
		expect(controlRowsPerIntake({kind: 'window', intakeId: 'i1'})).toBeNull()
		expect(controlRowsPerIntake({kind: 'hotkey', intakeId: 'i1'})).toBeNull()
	})
})
