// Browser-mock stand-in for main's global hotkey (HotkeyService and
// HotkeyIntake): the Settings Test press takes a fixed link in as the hotkey,
// through the intake mock, and answers with the same ack and follow-up rules.
// The mock window is always focused, so every outcome arrives as a toast.

import type {AppApi} from '@shared/api.js'
import {hotkeyAck, hotkeyFollowUp, intakeHotkeyTrigger} from '@shared/intake/hotkeyIntake.js'
import {ok} from '@shared/result.js'
import type {HotkeyOutcomeEvent, HotkeyState, HotkeyTriggerPayload} from '@shared/types.js'
import type {HotkeyIntakeMock} from './intakeMock.js'

const TEST_PRESS_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

export interface HotkeyMock {
	api: AppApi['hotkey']
	onOutcome: AppApi['events']['onHotkeyOutcome']
	// One press with the clipboard main would have read, as HotkeyIntake.take.
	press(trigger: HotkeyTriggerPayload): Promise<void>
}

export function createHotkeyMock(deps: {intake: HotkeyIntakeMock; state: () => HotkeyState}): HotkeyMock {
	const listeners = new Set<(event: HotkeyOutcomeEvent) => void>()
	const send = (event: Omit<HotkeyOutcomeEvent, 'toast'>): void => listeners.forEach(listener => listener({...event, toast: true}))
	deps.intake.onEvent(({intakeId, outcome}) => {
		const followUp = hotkeyFollowUp(outcome)
		if (followUp) send({outcome: followUp, ...(intakeId ? {intakeId} : {})})
	})

	async function press(trigger: HotkeyTriggerPayload): Promise<void> {
		const intake = intakeHotkeyTrigger(trigger)
		if (intake.kind === 'outcome') {
			send({outcome: intake.outcome})
			return
		}
		const profile = deps.intake.windowProfile()
		const placement = await deps.intake.add({requestId: crypto.randomUUID(), url: intake.url, playlistMode: intake.playlistMode, ...(intake.listOffer ? {listOffer: intake.listOffer} : {}), ...(profile ? {profile} : {})})
		send({outcome: hotkeyAck(placement), ...(placement.kind === 'added' ? {intakeId: placement.intakeId} : {})})
	}

	return {
		api: {
			getState: () => Promise.resolve(ok(deps.state())),
			testPress: async () => {
				await press({kind: 'single', url: TEST_PRESS_URL})
				return ok(undefined)
			},
			rendererReady: () => Promise.resolve(ok(undefined))
		},
		onOutcome: listener => {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
		press
	}
}
