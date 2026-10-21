// Caller limits on what a Control API client may take in. Past either one the
// client hears limit_exceeded with the limit, so a runaway script stops before
// it spends the user's queue and the sites' rate-limit budget.

import type {IntakeOrigin} from '@shared/intake/intakeSchemas.js'
import {PLAYLIST_PROBE_LIMIT_MAX} from '@shared/schemas.js'

// Intakes one client may have still probing at once (links.add checks it).
export const CONTROL_PROBING_INTAKES_PER_CLIENT = 20

// Rows one client's intake may become: the most one link can bring in through
// the window, the load-limit setting's ceiling, which is also what an "all"
// answer loads. The user's own load limit (100 by default) already stops a
// longer playlist at a choice, so a cap at that setting would refuse the
// whole-playlist answer the window accepts; this one only catches an intake
// that slipped past the load limit.
export const CONTROL_ROWS_PER_INTAKE = PLAYLIST_PROBE_LIMIT_MAX

// For QueueService.onIntakeAdmission: the window and the hotkey take no cap.
export function controlRowsPerIntake(origin: IntakeOrigin): number | null {
	return origin.kind === 'localClient' ? CONTROL_ROWS_PER_INTAKE : null
}
