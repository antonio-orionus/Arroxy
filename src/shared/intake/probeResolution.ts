// What a quick download's placeholder row becomes once its probe answers.
// Pure: the pipeline applies the result to the queue. One rule set serves
// every entry point (the URL tab, Explore, the global hotkey); they differ
// only in how a link is taken in and how the user hears about it.

import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {QueueChoice} from '@shared/schemas.js'
import type {Result} from '@shared/result.js'
import type {LocalizedError, PlaylistProbeResult, ProbeError, ProbePlaylistMode, ProbeResult} from '@shared/types.js'
import type {PinnedDownloadProfile} from '@shared/schemas.js'
import {preparePinnedProfileQueueSubmission, type PreparedQueueSubmission, type QueuePreparationEnv, type QueuePreparationInputs} from '@shared/queueSubmission.js'

// The user's answer to a needs-choice row, applied to a fresh or kept probe.
export type QuickProbeTake = {kind: 'first'; count: number} | {kind: 'all'}

export type QuickProbeResolution =
	| {kind: 'queue'; prepared: PreparedQueueSubmission}
	// Every video was already live in the queue: nothing failed, nothing to add.
	| {kind: 'nothing-new'; skippedAlreadyQueued: number}
	// `capped`: the probe stopped at the load limit, so the count is a lower bound.
	| {kind: 'needs-choice'; choice: QueueChoice; capped: boolean; title: string; probe: PlaylistProbeResult}
	// `probeError` is null when the probe succeeded and preparing the rows failed.
	| {kind: 'failed'; error: LocalizedError; probeError: ProbeError | null}

export interface QuickProbeContext {
	// The row's link: names the video when the probe gives no page, and with
	// the mode decides whether a collection result needs a review.
	url: string
	// The mode the probe ran with: `playlist` on a mixed link is the user's
	// answer to "this video or the whole playlist?".
	playlistMode: ProbePlaylistMode
	// The load limit the probe ran with. It fetches one entry past it, so a
	// longer result means the collection goes on.
	limit: number
	take?: QuickProbeTake
	// The profile the row was placed with; the active one when it is unknown
	// (a row restored after a restart).
	profile?: PinnedDownloadProfile
}

/** Preparation's host, plus the words for a failure that brings none of its own. */
export interface QuickProbeEnv extends QueuePreparationEnv {
	probeFailedText(): string
	prepareFailedText(): string
}

// Lossless: a non-yt-dlp failure keeps its details, so the row's guidance
// (built from this error) reads what the toast's did (DPAPI detection).
function localizedProbeError(error: ProbeError, env: QuickProbeEnv): LocalizedError {
	if (error.kind === 'ytdlp') return error.error
	const raw = [error.message, error.details].filter(part => part !== undefined && part.trim() !== '').join('\n')
	return {kind: 'unknown', raw: raw === '' ? env.probeFailedText() : raw}
}

// A collection result is reviewed unless the link said it was a collection,
// or the user answered "the whole playlist" on a mixed link.
function reviewsCollection(context: QuickProbeContext): boolean {
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

function needsChoice(probe: PlaylistProbeResult, context: QuickProbeContext): QuickProbeResolution | null {
	if (context.take) return null
	const capped = probe.entries.length > context.limit
	const loaded = Math.min(probe.entries.length, context.limit)
	const title = probe.playlistTitle || probe.webpageUrl
	if (reviewsCollection(context)) return {kind: 'needs-choice', choice: {kind: 'playlist-review', count: loaded}, capped, title, probe}
	if (capped) return {kind: 'needs-choice', choice: {kind: 'playlist-cap', loaded}, capped, title, probe}
	return null
}

// The caller settles which profile prepares the rows before resolving.
export function resolvePinnedQuickProbe(result: Result<ProbeResult, ProbeError>, context: QuickProbeContext & {profile: PinnedDownloadProfile}, inputs: QueuePreparationInputs, env: QuickProbeEnv): QuickProbeResolution {
	if (!result.ok) return {kind: 'failed', error: localizedProbeError(result.error, env), probeError: result.error}
	const probe = result.data
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
		return prepareFailure(error instanceof Error ? error.message : String(error))
	}
	if (!prepared) return prepareFailure(env.prepareFailedText())
	if (prepared.items.length === 0) return {kind: 'nothing-new', skippedAlreadyQueued: prepared.skippedAlreadyQueued}
	return {kind: 'queue', prepared}
}
