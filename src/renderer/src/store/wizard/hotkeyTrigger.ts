import {parseBulkUrls} from '@shared/bulkUrls.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {HotkeyOutcome, HotkeyTriggerPayload, ProbeError, ProbePlaylistMode} from '@shared/types.js'
import type {GetState} from '../types.js'
import {placeQuickDownload, type QuickDownloadFeedback} from '../quickDownload/quickDownloadPipeline.js'
import {detach} from '../quickDownload/detachedTask.js'
import {rewriteYouTubeChannelRoot} from '@shared/intake/urlIntake.js'
import {policyForUrlIntent} from '@shared/intake/urlIntentPolicy.js'

// The global hotkey's end of the background quick download. Main presses the
// bell (a pre-classified trigger); this module takes the link in and hands it
// to the same pipeline the URL tab and Explore use, then reports the outcome
// of every attempt so main can notify on a hidden window: one when the row is
// placed or refused, and a second when the probe leaves the row needing the user.
//
// Immediate acknowledgment: a valid single URL lands in Downloads as a
// placeholder row and `queued` fires at once, before the ~20s probe. A probe
// that ends as a probe-error or needs-choice row reports a second outcome;
// the row itself carries the way forward.
//
// Hidden-window constraints shape the intake: the renderer cannot read the
// clipboard (main already did), must not open dialogs or pop the window, and
// must never touch the URL tab or the wizard. So the hotkey never asks (ADR
// 0007): a mixed URL resolves to its video, and an incomplete cookies setup
// surfaces as the probe's own failure rather than a dialog.
//
// Parallel presses: probes are keyed per row, so a press on another link
// starts its own row. A press on a link already live in the queue (a
// placeholder counts) is `already-queued`. `busy` is left for the moment
// before the renderer has its settings.

export type HotkeyIntake = {kind: 'run'; url: string; playlistMode: ProbePlaylistMode} | {kind: 'outcome'; outcome: HotkeyOutcome}

// Pure: trigger → run or outcome.
export function intakeHotkeyTrigger(trigger: HotkeyTriggerPayload): HotkeyIntake {
	if (trigger.kind === 'empty') return {kind: 'outcome', outcome: 'invalid-clipboard'}
	if (trigger.kind === 'multiple') return {kind: 'outcome', outcome: 'multiple-urls'}

	// Mirror the main-side classifier: parseBulkUrls is the shared notion of
	// "is there a usable media URL here" (extraction, non-media filtering,
	// cleaning). Bare text or direct non-media file links end here.
	const parsed = parseBulkUrls(trigger.url.trim())
	const candidate = parsed.accepted[0]?.url
	if (!candidate) return {kind: 'outcome', outcome: 'invalid-clipboard'}
	const url = rewriteYouTubeChannelRoot(candidate)

	// One shared rule with the in-app entry points, read at the `hotkey` entry
	// point: it resolves a mixed URL to its video rather than bouncing the press
	// back to the app. "Unknown" is every non-YouTube site — the wizard probes
	// those happily, so the hotkey does too.
	const action = policyForUrlIntent(classifyUrlIntent(url), 'hotkey')
	if (!('playlistMode' in action)) return {kind: 'outcome', outcome: 'needs-review'}
	return {kind: 'run', url, playlistMode: action.playlistMode}
}

// Outcome for a failed preparation. A cookies-config failure needs the
// cookie settings finished first; any other failure is plain, and its row
// offers Retry.
export function outcomeForProbeError(error: ProbeError | null): HotkeyOutcome {
	if (error?.kind === 'other' && error.code === 'cookies_config') return 'cookies-setup'
	return 'submission-failed'
}

function hotkeyFeedback(report: (outcome: HotkeyOutcome) => void): QuickDownloadFeedback {
	return event => {
		switch (event.kind) {
			case 'added':
				report('queued')
				return
			case 'already-queued':
			case 'nothing-new':
				report('already-queued')
				return
			case 'not-added':
				report('submission-failed')
				return
			case 'failed':
				report(outcomeForProbeError(event.probeError))
				return
			case 'needs-choice':
				report('needs-review')
				return
			case 'queued':
				return
		}
	}
}

export async function handleHotkeyTrigger(trigger: HotkeyTriggerPayload, get: GetState): Promise<void> {
	const triggerUrl = trigger.kind === 'single' ? trigger.url : undefined
	const report = (outcome: HotkeyOutcome, url = triggerUrl): void => {
		detach(window.appApi.hotkey.reportOutcome({outcome, ...(url ? {url} : {})}), 'hotkey outcome report')
	}
	if (!get().settings) {
		report('busy')
		return
	}
	const intake = intakeHotkeyTrigger(trigger)
	if (intake.kind === 'outcome') {
		report(intake.outcome)
		return
	}
	await placeQuickDownload(
		{url: intake.url, playlistMode: intake.playlistMode},
		hotkeyFeedback(outcome => report(outcome, intake.url))
	)
}
