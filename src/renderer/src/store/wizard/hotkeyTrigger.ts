import {parseBulkUrls} from '@shared/bulkUrls.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {UrlIntent} from '@shared/urlIntent.js'
import {rewriteYouTubeChannelRoot} from './urlIntake.js'
import {enqueueActiveProfileProbeResult} from './quickDownloadPreparation.js'
import {WizardCommands} from './commands.js'
import type {HotkeyOutcome, HotkeyTriggerPayload, ProbeError, ProbePlaylistMode, ProbeResult, QueueItem, QuickDownloadStatus} from '@shared/types.js'
import type {GetState, SetState} from '../types.js'

// Renderer-side hotkey orchestration. Main presses the bell (a pre-classified
// trigger); this module runs the same active-profile quick-download pipeline
// the omnibox uses — probe → prepare → queue add — and derives exactly one
// outcome for every attempt so main can notify on hidden windows.
//
// Hidden-window constraints shape the flow: the renderer cannot read the
// clipboard (main already did), must not open dialogs or pop the window, and
// must never touch the omnibox draft. Anything needing user review — mixed
// intent, playlists that want the review step, incomplete cookies setup —
// ends as `needs-review` instead of navigating the UI.

const LIVE_STATUSES: ReadonlySet<QueueItem['status']> = new Set(['pending', 'running', 'paused-held', 'paused-active'])

export type HotkeyIntake = {kind: 'run'; url: string; intent: UrlIntent; playlistMode: ProbePlaylistMode} | {kind: 'outcome'; outcome: HotkeyOutcome}

// Pure: trigger + the two store fields that gate it → run or outcome.
export function intakeHotkeyTrigger(trigger: HotkeyTriggerPayload, state: {quickDownloadStatus: QuickDownloadStatus; queue: QueueItem[]}): HotkeyIntake {
	if (state.quickDownloadStatus === 'preparing') return {kind: 'outcome', outcome: 'busy'}
	if (trigger.kind === 'empty') return {kind: 'outcome', outcome: 'invalid-clipboard'}
	if (trigger.kind === 'multiple') return {kind: 'outcome', outcome: 'multiple-urls'}

	// Mirror the main-side classifier: parseBulkUrls is the shared notion of
	// "is there a usable media URL here" (extraction, non-media filtering,
	// cleaning). Bare text or direct non-media file links end here.
	const parsed = parseBulkUrls(trigger.url.trim())
	const candidate = parsed.accepted[0]?.url
	if (!candidate) return {kind: 'outcome', outcome: 'invalid-clipboard'}
	const url = rewriteYouTubeChannelRoot(candidate)

	// Dedupe against live queue items only — completed/failed downloads never
	// block a fresh hotkey request.
	const live = state.queue.some(item => LIVE_STATUSES.has(item.status) && item.url === url)
	if (live) return {kind: 'outcome', outcome: 'already-queued'}

	const intent = classifyUrlIntent(url)
	// Mixed intent genuinely needs a human choice. "Unknown" is every
	// non-YouTube site — the wizard probes those happily, so the hotkey does
	// too; only an unparseable URL is invalid.
	if (intent.kind === 'mixed') return {kind: 'outcome', outcome: 'needs-review'}
	const playlistMode = intent.kind === 'obvious-single' ? ('video' as const) : intent.kind === 'obvious-collection' ? ('playlist' as const) : ('auto' as const)
	return {kind: 'run', url, intent, playlistMode}
}

// Outcome for a failed probe. Cookies-config failures need the settings
// dialog (a human), everything else is a plain submission failure.
export function outcomeForProbeError(error: ProbeError): HotkeyOutcome {
	if (error.kind === 'other' && error.code === 'cookies_config') return 'needs-review'
	return 'submission-failed'
}

export function outcomeForProbe(probe: ProbeResult, intent: UrlIntent): HotkeyOutcome | null {
	// Playlists only auto-queue when the URL obviously is one; anything else
	// goes to the wizard's review step instead.
	if (probe.kind === 'playlist' && intent.kind !== 'obvious-collection') return 'needs-review'
	return null
}

export async function handleHotkeyTrigger(trigger: HotkeyTriggerPayload, set: SetState, get: GetState): Promise<void> {
	const report = (outcome: HotkeyOutcome, url?: string): void => {
		void window.appApi.hotkey.reportOutcome({outcome, ...(url ? {url} : {})})
	}

	const intake = intakeHotkeyTrigger(trigger, {quickDownloadStatus: get().quickDownloadStatus, queue: get().queue})
	if (intake.kind === 'outcome') {
		report(intake.outcome, trigger.kind === 'single' ? trigger.url : undefined)
		return
	}

	// The submission machinery reads wizard scratch state, so the handler runs
	// inside it — then leaves no trace: resetAll wipes pipeline residue and the
	// user's in-progress omnibox draft is restored. Cancel any in-flight
	// wizard probe first, mirroring every other submit path.
	const draft = get().wizardUrl
	set({wizardUrl: intake.url})
	try {
		void window.appApi.downloads.probeCancel()
		const result = await window.appApi.downloads.probe({url: intake.url, playlistMode: intake.playlistMode})
		if (!result.ok) {
			report(outcomeForProbeError(result.error), intake.url)
			return
		}
		const review = outcomeForProbe(result.data, intake.intent)
		if (review) {
			report(review, intake.url)
			return
		}
		const ids = await enqueueActiveProfileProbeResult(result.data, set, get)
		if (!ids || ids.length === 0) {
			report('submission-failed', intake.url)
			return
		}
		report('queued', intake.url)
	} catch {
		report('submission-failed', intake.url)
	} finally {
		WizardCommands.resetAll(set)
		set({wizardUrl: draft})
	}
}
