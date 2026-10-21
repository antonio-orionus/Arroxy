// Intake outcomes on their way to the Control API. Every outcome passes
// through here, so the Control side can follow the intakes its clients
// started whoever acts on them next (a Retry in the window on a client's row
// too). The outcomes a Control client caused are taken here and never reach
// the window's Downloads toasts, the way the hotkey's are taken by its intake.

import log from 'electron-log/main.js'
import type {IntakeEvent} from '@shared/intake/intakeEvents.js'

const logger = log.scope('intake')

export type IntakeOutcomeEvent = Extract<IntakeEvent, {kind: 'outcome'}>

export class ControlOutcomes {
	private listener: (event: IntakeOutcomeEvent) => void = () => undefined

	// The Control side plugs in here; until then outcomes go nowhere.
	listen(listener: (event: IntakeOutcomeEvent) => void): void {
		this.listener = listener
	}

	// An intake event from IntakeService. True when a Control client caused
	// it, which this takes; anything else goes on to its own caller.
	hear(event: IntakeEvent): boolean {
		if (event.kind !== 'outcome') return false
		try {
			this.listener(event)
		} catch (error) {
			// A Control-side bug must not fail the intake's own write.
			logger.error('the Control API could not take an intake outcome', {intakeId: event.intakeId, error: error instanceof Error ? error.message : String(error)})
		}
		return event.origin === 'localClient'
	}
}
