// What a quick download's placeholder row becomes once its probe answers.
// Pure: the pipeline applies the result to the queue. One rule set serves
// every entry point (the URL tab, Explore, the global hotkey); they differ
// only in how a link is taken in and how the user hears about it.

import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {PinnedDownloadProfile} from './intakeSchemas.js'
import {PLAYLIST_PROBE_LIMIT_MAX, type QueueChoice, type QuickProbeTake} from '@shared/schemas.js'
import type {Result} from '@shared/result.js'
import type {LocalizedError, PlaylistProbeResult, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult} from '@shared/types.js'
import {preparePinnedProfileQueueSubmission, type PreparedQueueSubmission, type QueuePreparationEnv, type QueuePreparationInputs} from '@shared/queueSubmission.js'
import {DownloadProfileOutputMissingError} from '@shared/downloadProfiles.js'

export type QuickProbeResolution =
	| {kind: 'queue'; prepared: PreparedQueueSubmission}
	// Every video was already live in the queue: nothing failed, nothing to add.
	| {kind: 'nothing-new'; skippedAlreadyQueued: number}
	| {kind: 'needs-choice'; choice: QueueChoice; title: string; probe: PlaylistProbeResult}
	// `probeError` is null when the probe succeeded and preparing the rows failed.
	| {kind: 'failed'; error: LocalizedError; probeError: ProbeError | null}

// How far a probe looks for a take: exactly N, or as wide as the load ceiling.
export function scopeForTake(take: QuickProbeTake): PlaylistScope {
	return {items: {kind: 'first', count: take.kind === 'first' ? take.count : PLAYLIST_PROBE_LIMIT_MAX}}
}

// A list that skips a video looks one entry further, so a count (the load
// limit, or First N) still holds once the video is left out.
export function widenForSkip(scope: PlaylistScope): PlaylistScope {
	if (scope.items.kind !== 'first') return scope
	return {items: {kind: 'first', count: Math.min(scope.items.count + 1, PLAYLIST_PROBE_LIMIT_MAX)}}
}

export interface QuickProbeContext {
	// The row's link: names the video when the probe gives no page, and with
	// the mode decides whether a list under the load limit is asked about.
	url: string
	// The mode the probe ran with: `playlist` on a mixed link is the user's
	// answer to "this video or the whole playlist?".
	playlistMode: ProbePlaylistMode
	// The load limit the probe ran with. It fetches one entry past it, so a
	// longer result means the collection goes on.
	limit: number
	// What the user chose to keep (their answer to a needs-choice row, or the
	// count picked at intake): applied to a fresh or kept probe, and it
	// settles the size question, so a collection that goes on is not asked about.
	take?: QuickProbeTake
	// The profile the row was placed with; the active one when it is unknown
	// (a row restored after a restart).
	profile?: PinnedDownloadProfile
	// A list placed by a row's list offer: the video the hotkey already took,
	// left out of every answer (All, First N, Review).
	skipVideoId?: string
}

/** Preparation's host, plus the words for a failure that brings none of its own. */
export interface QuickProbeEnv extends QueuePreparationEnv {
	probeFailedText(): string
	prepareFailedText(): string
	outputMissingText(): string
}

// Lossless: a non-yt-dlp failure keeps its details, so the row's guidance
// (built from this error) reads what the toast's did (DPAPI detection).
function localizedProbeError(error: ProbeError, env: QuickProbeEnv): LocalizedError {
	if (error.kind === 'ytdlp') return error.error
	const raw = [error.message, error.details].filter(part => part !== undefined && part.trim() !== '').join('\n')
	return {kind: 'unknown', raw: raw === '' ? env.probeFailedText() : raw}
}

// A list the link did not announce is asked about whatever its size: a link
// that was not obviously a collection (another site's list, a video link that
// probed as one), unless the user answered "the whole playlist" on a mixed link.
function asksWhateverItsSize(context: QuickProbeContext): boolean {
	const intent = classifyUrlIntent(context.url)
	if (intent.kind === 'obvious-collection') return false
	return !(intent.kind === 'mixed' && context.playlistMode === 'playlist')
}

function prepareFailure(message: string): QuickProbeResolution {
	return {kind: 'failed', error: {kind: 'unknown', raw: message}, probeError: null}
}

function takenEntries(probe: PlaylistProbeResult, context: QuickProbeContext): PlaylistProbeResult['entries'] {
	const count = context.take?.kind === 'first' ? context.take.count : context.limit
	return probe.entries.slice(0, count)
}

// The one size question (All · Review, plus First N when capped). A row that
// carries a take raises none, Review included: the count is part of the
// user's answer, so nothing asks again, not after a Retry nor a restart.
function needsChoice(probe: PlaylistProbeResult, context: QuickProbeContext): QuickProbeResolution | null {
	if (context.take) return null
	const capped = probe.entries.length > context.limit
	if (!capped && !asksWhateverItsSize(context)) return null
	const loaded = Math.min(probe.entries.length, context.limit)
	return {kind: 'needs-choice', choice: {kind: 'list-size', loaded, capped}, title: probe.playlistTitle || probe.webpageUrl, probe}
}

// A list placed by a row's list offer, without the video the hotkey already took.
export function withoutSkipped<T extends ProbeResult>(probe: T, skipVideoId: string | undefined): T {
	if (probe.kind !== 'playlist' || skipVideoId === undefined) return probe
	return {...probe, entries: probe.entries.filter(entry => entry.videoId !== skipVideoId)}
}

// The caller settles which profile prepares the rows before resolving.
export function resolvePinnedQuickProbe(result: Result<ProbeResult, ProbeError>, context: QuickProbeContext & {profile: PinnedDownloadProfile}, inputs: QueuePreparationInputs, env: QuickProbeEnv): QuickProbeResolution {
	if (!result.ok) return {kind: 'failed', error: localizedProbeError(result.error, env), probeError: result.error}
	const probe = withoutSkipped(result.data, context.skipVideoId)
	if (probe.kind === 'playlist') {
		const choice = needsChoice(probe, context)
		if (choice) return choice
	}
	const forQueue: ProbeResult = probe.kind === 'playlist' ? {...probe, entries: takenEntries(probe, context)} : probe
	let prepared: PreparedQueueSubmission | null
	try {
		// Background preparation names nothing after the wizard's state.
		prepared = preparePinnedProfileQueueSubmission(forQueue, inputs, 'normal', {url: context.url, playlistTitle: ''}, context.profile, env)
	} catch (error) {
		// A profile with a fixed folder left blank cannot resolve its output.
		return prepareFailure(error instanceof DownloadProfileOutputMissingError ? env.outputMissingText() : error instanceof Error ? error.message : String(error))
	}
	if (!prepared) return prepareFailure(env.prepareFailedText())
	if (prepared.items.length === 0) return {kind: 'nothing-new', skippedAlreadyQueued: prepared.skippedAlreadyQueued}
	return {kind: 'queue', prepared}
}
