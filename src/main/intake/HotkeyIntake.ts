// The global hotkey's intake, in main. Every press — the chord, the tray item,
// the Settings test — arrives here pre-classified (HotkeyService) and takes
// its link in through IntakeService as the hotkey. The press is acknowledged
// the moment its row is placed or refused, and followed up at most once more
// when the intake ends needing the user (rules: shared/intake/hotkeyIntake).
//
// Both notifications are keyed by the intake id and decided here, never in
// the window, so a window reload can neither repeat nor lose one. The
// hotkey's intake outcomes are taken here and never reach the window's
// Downloads toasts.

import log from 'electron-log/main.js'
import {hotkeyAck, hotkeyFollowUp, intakeHotkeyTrigger} from '@shared/intake/hotkeyIntake.js'
import type {IntakeEvent, IntakePlacement, QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import type {HotkeyOutcomePayload, HotkeyTriggerPayload} from '@shared/types.js'
import type {IntakeService} from './IntakeService.js'

const logger = log.scope('hotkey')

// Intakes whose follow-up went out, remembered so a repeat is dropped. An
// intake hears one outcome, so the oldest are forgotten past the limit.
const FOLLOWED_UP_LIMIT = 200

export interface HotkeyIntakeDeps {
	intake: Pick<IntakeService, 'add' | 'windowProfile'>
	// Routes one outcome to the user (a toast or an OS notification).
	notify(event: HotkeyOutcomePayload): void
	newId(): string
}

interface Outcome {
	intakeId: string | null
	outcome: QuickDownloadEvent
}

export class HotkeyIntake {
	// Presses still waiting for their placement, by request id: outcomes that
	// arrive first are held, so the ack always goes out before its follow-up.
	private readonly placing = new Map<string, Outcome[]>()
	private readonly followedUp = new Set<string>()

	constructor(private readonly deps: HotkeyIntakeDeps) {}

	// Never rejects: the chord, the tray and IPC fire it.
	async take(trigger: HotkeyTriggerPayload): Promise<void> {
		const intake = intakeHotkeyTrigger(trigger)
		if (intake.kind === 'outcome') {
			this.deps.notify({outcome: intake.outcome})
			return
		}
		const requestId = this.deps.newId()
		this.placing.set(requestId, [])
		// The profile the window shows, which main may not have saved yet;
		// without one, the row pins main's active profile.
		const profile = this.deps.intake.windowProfile()
		let placement: IntakePlacement
		try {
			placement = await this.deps.intake.add({requestId, url: intake.url, playlistMode: intake.playlistMode, ...(intake.listOffer ? {listOffer: intake.listOffer} : {}), ...(profile ? {profile} : {}), origin: {kind: 'hotkey'}})
		} catch (error) {
			logger.warn('taking the link in failed', {error: error instanceof Error ? error.message : String(error)})
			placement = {kind: 'not-added'}
		}
		const early = this.placing.get(requestId) ?? []
		this.placing.delete(requestId)
		this.deps.notify({outcome: hotkeyAck(placement), ...(placement.kind === 'added' ? {intakeId: placement.intakeId} : {})})
		for (const outcome of early) this.followUp(outcome)
	}

	// An intake event from IntakeService. True when it belongs to a hotkey
	// press, which this takes; anything else is the window's.
	hear(event: IntakeEvent): boolean {
		if (event.kind !== 'outcome' || event.origin !== 'hotkey') return false
		const early = this.placing.get(event.requestId)
		if (early) early.push(event)
		else this.followUp(event)
		return true
	}

	private followUp({intakeId, outcome}: Outcome): void {
		const followUp = hotkeyFollowUp(outcome)
		if (followUp === null) return
		// A row gone before its outcome names no intake: nothing can repeat it.
		if (intakeId !== null) {
			if (this.followedUp.has(intakeId)) return
			this.followedUp.add(intakeId)
			for (const oldest of this.followedUp) {
				if (this.followedUp.size <= FOLLOWED_UP_LIMIT) break
				this.followedUp.delete(oldest)
			}
		}
		this.deps.notify({outcome: followUp, ...(intakeId !== null ? {intakeId} : {})})
	}
}
