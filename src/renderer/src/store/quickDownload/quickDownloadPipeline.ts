// The window's end of the background quick download (P2-R37/R38). Intake runs
// in main (IntakeService): a link becomes a placeholder row at once, its probe
// runs there, and main swaps the row for the prepared items or turns it into a
// probe-error or needs-choice row. Nothing here waits on the window being
// shown or loaded.
//
// This module takes links in, answers rows, and hears the outcomes back: each
// call carries a request id, and every outcome main reports names the call
// that caused it, so it reaches that call's feedback. An outcome no call here
// is waiting for (the window reloaded meanwhile) is still shown, as from the
// Downloads tab.

import {notify} from '@renderer/lib/notify.js'
import type {IntakeEvent, IntakePlacement, QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import type {Result} from '@shared/result.js'
import type {IntakeTake} from '@shared/intake/intakeSchemas.js'
import type {DownloadProfileRef, PlaylistProbeResult, ProbePlaylistMode} from '@shared/types.js'
import {generateId} from '../helpers.js'

export type {QuickDownloadEvent} from '@shared/intake/intakeEvents.js'

export interface QuickDownloadRequest {
	// Cleaned, and already through the entry point's intake policy.
	url: string
	playlistMode: ProbePlaylistMode
	// The row's title until the probe knows the real one (Explore's page title).
	title?: string
	// The profile the window has active. A pick is saved through a queue of
	// settings writes, so main may not hold it yet; the row pins this one.
	profile?: DownloadProfileRef
}

export type QuickDownloadFeedback = (event: QuickDownloadEvent) => void

interface Waiting {
	feedback: QuickDownloadFeedback
	// Outcomes that arrived before the placement answer did, told after it.
	early: QuickDownloadEvent[] | null
}

// Calls waiting for their outcome. A call whose row is cancelled or removed
// meanwhile never hears one, so the oldest are dropped past the limit.
const WAITING_LIMIT = 200
const waiting = new Map<string, Waiting>()

function wait(requestId: string, feedback: QuickDownloadFeedback, placed: boolean): void {
	waiting.set(requestId, {feedback, early: placed ? null : []})
	for (const oldest of waiting.keys()) {
		if (waiting.size <= WAITING_LIMIT) break
		waiting.delete(oldest)
	}
}

// The placement answer arrived: tell it, then anything that came before it.
function placed(requestId: string, placement: IntakePlacement): void {
	const call = waiting.get(requestId)
	if (!call) return
	call.feedback(placement)
	const early = call.early ?? []
	call.early = null
	if (placement.kind !== 'added') waiting.delete(requestId)
	for (const outcome of early) tell(requestId, outcome)
}

function tell(requestId: string, outcome: QuickDownloadEvent): boolean {
	const call = waiting.get(requestId)
	if (!call) return false
	if (call.early) {
		call.early.push(outcome)
		return true
	}
	// One outcome settles a call.
	waiting.delete(requestId)
	call.feedback(outcome)
	return true
}

// An intake event from main. `unclaimed` hears the outcomes no call here waits for.
export function routeIntakeEvent(event: IntakeEvent, unclaimed: () => QuickDownloadFeedback): void {
	if (event.kind === 'filename-budget-failed') {
		notify.filenameBudgetFailed(event.reason, event.outputDir)
		return
	}
	if (!tell(event.requestId, event.outcome)) unclaimed()(event.outcome)
}

// Lifetime-bound: every intake outcome main reports.
export function bindIntakeEvents(unclaimed: () => QuickDownloadFeedback): () => void {
	return window.appApi.intake.onEvent(event => routeIntakeEvent(event, unclaimed))
}

// Places the row and starts its probe in main; resolves once the row is
// placed (or refused), not when the probe ends. Returns the row's id, or null.
export async function placeQuickDownload(request: QuickDownloadRequest, feedback: QuickDownloadFeedback): Promise<string | null> {
	const requestId = generateId()
	wait(requestId, feedback, false)
	const answer = await window.appApi.intake.add({requestId, url: request.url, playlistMode: request.playlistMode, ...(request.title ? {title: request.title} : {}), ...(request.profile ? {profile: request.profile} : {})}).catch((error: unknown) => {
		console.error('[quick-download] taking the link in failed', error)
		return null
	})
	const placement: IntakePlacement = answer?.ok ? answer.data : {kind: 'not-added'}
	placed(requestId, placement)
	return placement.kind === 'added' ? placement.itemId : null
}

// A row's Retry or choice, run in main. False when main refused, or the IPC
// call itself rejected: the Downloads tab calls these without waiting, so a
// transport failure is reported here and the row stays as it is.
async function answerRow(feedback: QuickDownloadFeedback, call: (requestId: string) => Promise<Result<void>>): Promise<boolean> {
	const requestId = generateId()
	wait(requestId, feedback, true)
	const answer = await call(requestId).catch((error: unknown) => {
		console.error('[quick-download] answering the row failed', error)
		return null
	})
	if (answer?.ok) return true
	waiting.delete(requestId)
	return false
}

export function retryPlaceholder(itemId: string, feedback: QuickDownloadFeedback): Promise<boolean> {
	return answerRow(feedback, requestId => window.appApi.intake.retry({requestId, itemId}))
}

export function choosePlaceholder(itemId: string, take: IntakeTake, feedback: QuickDownloadFeedback): Promise<boolean> {
	return answerRow(feedback, requestId => window.appApi.intake.choose({requestId, itemId, take}))
}

// The probe a needs-choice row asked about, kept in main for its review;
// undefined once gone (the review then probes again).
export async function keptChoiceProbe(itemId: string): Promise<PlaylistProbeResult | undefined> {
	const kept = await window.appApi.intake.keptProbe({itemId}).catch(() => null)
	return kept?.ok ? (kept.data ?? undefined) : undefined
}

// A review that queued nothing new still settles its row: drop it, unless it
// is no longer a placeholder (the swap refuses then, and nothing is lost).
export async function settlePlaceholder(itemId: string): Promise<void> {
	await window.appApi.queue.cmd.replaceProbing({itemId, items: []})
}
