import {parseBulkUrls} from '@shared/bulkUrls.js'
import i18next from 'i18next'
import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {UrlIntent} from '@shared/urlIntent.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import {HOTKEY_OUTCOME_COPY} from '@shared/hotkeyOutcomes.js'
import {downloadProfileLabel, resolveActiveDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import type {HotkeyOutcome, HotkeyTriggerPayload, LocalizedError, ProbeError, ProbePlaylistMode, ProbeResult, QueueItem, QuickDownloadStatus} from '@shared/types.js'
import type {GetState} from '../types.js'
import {generateId} from '../helpers.js'
import {rewriteYouTubeChannelRoot} from './urlIntake.js'
import {prepareActiveProfileQueueSubmission} from './queueSubmission.js'

// Renderer-side hotkey orchestration. Main presses the bell (a pre-classified
// trigger); this module runs the same active-profile quick-download pipeline
// the omnibox uses — probe → prepare → queue — and derives exactly one outcome
// for every attempt so main can notify on hidden windows.
//
// Immediate acknowledgment: a valid single URL is added to the queue as a
// `probing` placeholder row and the outcome fires right away, before the probe
// starts. The probe then runs in the background; on success the placeholder is
// swapped for the real prepared items, on failure it becomes an error row.
// The user thus sees the attempt land instantly instead of waiting out a
// ~20s yt-dlp probe in silence.
//
// Hidden-window constraints shape the flow: the renderer cannot read the
// clipboard (main already did), must not open dialogs or pop the window, and
// must never touch the omnibox or wizard state. Anything needing user review —
// mixed intent, playlists that want the review step, incomplete cookies setup —
// ends as `needs-review` instead of navigating the UI.
//
// Parallel presses: probes are keyed per queue item, so a second hotkey on a
// DIFFERENT URL starts its own probing row (no `busy`). Only a collision with
// the in-app quick-download pipeline (`quickDownloadStatus === 'preparing'`)
// reports `busy`. A second press on the SAME URL hits the live-dedupe
// (`probing` counts as live) and reports `already-queued`.

// Which playlist mode the background probe runs in, per URL intent. Keyed on
// the intent kind union so a new intent cannot silently fall through to 'auto'.
const PLAYLIST_MODE_BY_INTENT: Record<Exclude<UrlIntent['kind'], 'mixed'>, ProbePlaylistMode> = {'obvious-single': 'video', 'obvious-collection': 'playlist', unknown: 'auto'}

export type HotkeyIntake = {kind: 'run'; url: string; playlistMode: ProbePlaylistMode} | {kind: 'outcome'; outcome: HotkeyOutcome}

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

	// Dedupe against live queue items only — completed/failed/cancelled
	// downloads never block a fresh hotkey request. Probing placeholders are
	// live: a second press on the same URL is already-queued, not busy.
	const live = state.queue.some(item => isLiveQueueItem(item) && item.url === url)
	if (live) return {kind: 'outcome', outcome: 'already-queued'}

	const intent = classifyUrlIntent(url)
	// Mixed intent genuinely needs a human choice. "Unknown" is every
	// non-YouTube site — the wizard probes those happily, so the hotkey does
	// too; only an unparseable URL is invalid.
	if (intent.kind === 'mixed') return {kind: 'outcome', outcome: 'needs-review'}
	const playlistMode = PLAYLIST_MODE_BY_INTENT[intent.kind]
	return {kind: 'run', url, playlistMode}
}

// Outcome for a failed probe. Cookies-config failures need the settings
// dialog (a human), everything else is a plain submission failure.
export function outcomeForProbeError(error: ProbeError): HotkeyOutcome {
	if (error.kind === 'other' && error.code === 'cookies_config') return 'needs-review'
	return 'submission-failed'
}

export function outcomeForProbe(probe: ProbeResult): HotkeyOutcome | null {
	return probe.kind === 'playlist' ? 'needs-review' : null
}

// LocalizedError for a failed probe, reported onto the probing row. Prefers
// the ytdlp classifier's verbatim stderr; falls back to the generic probe
// failure message. The kind always maps to the probe-stage error template.
function errorForOutcome(outcome: HotkeyOutcome): LocalizedError {
	return {kind: 'unknown', raw: i18next.t(HOTKEY_OUTCOME_COPY[outcome].key)}
}

function probeErrorForQueueItem(error: ProbeError, outcome: HotkeyOutcome): LocalizedError {
	if (error.kind === 'ytdlp') return error.error
	return errorForOutcome(outcome)
}

// The probing placeholder. Title is the URL until the probe resolves the real
// one; thumbnail empty renders the existing shimmer. The active download
// profile supplies format label and output target so the row never lies about
// where the download will land. `job` is the unresolved placeholder — the
// scheduler cannot start it (schema + DownloadService both refuse).
function hotkeyProbingItem(url: string, get: GetState): QueueItem {
	const {profile} = resolveActiveDownloadProfile(get().settings?.profiles)
	return {
		id: generateId(),
		url,
		title: url,
		thumbnail: '',
		outputDir: resolveDownloadProfileOutputDir(profile, {currentOutputDir: '', defaultOutputDir: get().settings?.common?.defaultOutputDir ?? ''}),
		formatLabel: downloadProfileLabel(profile),
		status: QUEUE_STATUS.probing,
		lane: 'normal',
		progressPercent: 0,
		progressDetail: null,
		lastStatus: null,
		error: null,
		addedAt: new Date().toISOString(),
		finishedAt: null,
		artifacts: [],
		writeM3u: false,
		retryCount: 0,
		job: {kind: 'unresolved', extractor: '', extractorKey: ''}
	}
}

export async function handleHotkeyTrigger(trigger: HotkeyTriggerPayload, get: GetState): Promise<void> {
	const report = (outcome: HotkeyOutcome, url?: string): void => {
		void window.appApi.hotkey.reportOutcome({outcome, ...(url ? {url} : {})})
	}

	const intake = intakeHotkeyTrigger(trigger, {quickDownloadStatus: get().quickDownloadStatus, queue: get().queue})
	if (intake.kind === 'outcome') {
		report(intake.outcome, trigger.kind === 'single' ? trigger.url : undefined)
		return
	}

	// Add the placeholder FIRST, then acknowledge. The row reaches the
	// Downloads view via the ordinary queue snapshot/added events.
	const placeholder = hotkeyProbingItem(intake.url, get)
	const addResult = await window.appApi.queue.cmd.add([placeholder])
	if (!addResult.ok) {
		report(addResult.error.code === 'conflict' ? 'already-queued' : 'submission-failed', intake.url)
		return
	}
	// Immediate acknowledgment — the press is now visible in Downloads.
	report('queued', intake.url)

	// Probe in the background, keyed by item id so cancel/remove of this row
	// aborts exactly this probe. No probeCancel() here: the wizard's probes
	// are unrelated and must survive.
	const itemId = placeholder.id
	try {
		const result = await window.appApi.downloads.probe({url: intake.url, playlistMode: intake.playlistMode, ownerKey: itemId})
		if (!result.ok) {
			const outcome = outcomeForProbeError(result.error)
			const failed = await window.appApi.queue.cmd.probeFailed({itemId, error: probeErrorForQueueItem(result.error, outcome)})
			if (failed.ok) report(outcome, intake.url)
			return
		}
		const review = outcomeForProbe(result.data)
		// Background hotkeys never open or mutate wizard review state. Playlist
		// preparation can require cap/selection UI, so leave it as a terminal
		// needs-review row instead of calling the interactive quick-download path.
		if (review) {
			const failed = await window.appApi.queue.cmd.probeFailed({itemId, error: errorForOutcome('needs-review')})
			if (failed.ok) report('needs-review', intake.url)
			return
		}
		// Prepare directly from the active profile. Reusing the interactive quick-
		// download orchestrator here would leak failures into wizard state.
		const prepared = prepareActiveProfileQueueSubmission(result.data, get(), 'normal')
		if (!prepared || prepared.items.length === 0) {
			const failed = await window.appApi.queue.cmd.probeFailed({itemId, error: errorForOutcome('submission-failed')})
			if (failed.ok) report('submission-failed', intake.url)
			return
		}
		// The main-process swap is the commit point. A stale placeholder means the
		// user already cancelled/removed the attempt, so do not emit a late error.
		const replaced = await window.appApi.queue.cmd.replaceProbing({itemId, items: prepared.items})
		if (!replaced.ok) {
			const failed = await window.appApi.queue.cmd.probeFailed({itemId, error: errorForOutcome('submission-failed')})
			if (failed.ok) report('submission-failed', intake.url)
		}
	} catch (error) {
		console.error('[hotkey] submission failed', error)
		const failed = await window.appApi.queue.cmd.probeFailed({itemId, error: errorForOutcome('submission-failed')})
		if (failed.ok) report('submission-failed', intake.url)
	}
}
