// The global hotkey's rules for taking a link in and for what the user hears
// about it, shared by main's hotkey intake and the browser mock.
//
// A press is acknowledged at once: `queued` when its row is placed, or why it
// was not. It is followed up once more only when its link ends needing the
// user (a failure, a choice) or adding nothing; a clean queue says nothing more.
//
// The hotkey fires against a window that may be hidden, so it never asks
// (ADR 0007): a mixed URL resolves to its video, and an incomplete cookies
// setup surfaces as the probe's own failure rather than a dialog.

import {parseBulkUrls} from '@shared/bulkUrls.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {HotkeyOutcome, HotkeyTriggerPayload, ProbeError, ProbePlaylistMode} from '@shared/types.js'
import type {IntakePlacement, QuickDownloadEvent} from './intakeEvents.js'
import {rewriteYouTubeChannelRoot} from './urlIntake.js'
import {policyForUrlIntent} from './urlIntentPolicy.js'

// `listOffer`: a video taken from a link that also names a list keeps that
// link, so its row can offer the list the press could not ask about.
export type HotkeyLinkIntake = {kind: 'run'; url: string; playlistMode: ProbePlaylistMode; listOffer?: string} | {kind: 'outcome'; outcome: HotkeyOutcome}

// Pure: trigger → a link to take in, or the outcome that answers the press.
export function intakeHotkeyTrigger(trigger: HotkeyTriggerPayload): HotkeyLinkIntake {
	if (trigger.kind === 'empty') return {kind: 'outcome', outcome: 'invalid-clipboard'}
	if (trigger.kind === 'multiple') return {kind: 'outcome', outcome: 'multiple-urls'}

	// Mirror the clipboard classifier: parseBulkUrls is the shared notion of
	// "is there a usable media URL here" (extraction, non-media filtering,
	// cleaning). Bare text or direct non-media file links end here.
	const candidate = parseBulkUrls(trigger.url.trim()).accepted[0]?.url
	if (!candidate) return {kind: 'outcome', outcome: 'invalid-clipboard'}
	const url = rewriteYouTubeChannelRoot(candidate)

	// One shared rule with the in-app entry points, read at the `hotkey` entry
	// point: it resolves a mixed URL to its video rather than bouncing the press
	// back to the app. "Unknown" is every non-YouTube site — the wizard probes
	// those happily, so the hotkey does too.
	const intent = classifyUrlIntent(url)
	const action = policyForUrlIntent(intent, 'hotkey')
	if (!('playlistMode' in action)) return {kind: 'outcome', outcome: 'needs-review'}
	return {kind: 'run', url, playlistMode: action.playlistMode, ...(intent.kind === 'mixed' ? {listOffer: url} : {})}
}

// Outcome for a failed preparation. A cookies-config failure needs the
// cookie settings finished first; any other failure is plain, and its row
// offers Retry.
export function outcomeForProbeError(error: ProbeError | null): HotkeyOutcome {
	if (error?.kind === 'other' && error.code === 'cookies_config') return 'cookies-setup'
	return 'submission-failed'
}

// The instant ack: where the link landed.
export function hotkeyAck(placement: IntakePlacement): HotkeyOutcome {
	switch (placement.kind) {
		case 'added':
			return 'queued'
		case 'already-queued':
			return 'already-queued'
		case 'not-added':
			return 'submission-failed'
	}
}

// The one follow-up an intake's outcome earns, or null for a clean queue.
export function hotkeyFollowUp(outcome: QuickDownloadEvent): HotkeyOutcome | null {
	switch (outcome.kind) {
		case 'failed':
			return outcomeForProbeError(outcome.probeError)
		case 'needs-choice':
			return 'needs-review'
		// Everything the link held was queued already: the ack said otherwise.
		case 'already-queued':
		case 'nothing-new':
			return 'already-queued'
		case 'queued':
			return null
		// Placements are answered by the ack, never as a later outcome.
		case 'added':
		case 'not-added':
			return null
	}
}
