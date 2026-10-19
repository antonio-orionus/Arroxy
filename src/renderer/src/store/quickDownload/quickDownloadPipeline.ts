// The background quick download (P2-R37/R38), shared by every entry point:
// the global hotkey, the URL tab's Quick Download, Explore's Download, and the
// Downloads tab's own Retry and choices.
//
// A link becomes a placeholder row in Downloads at once; its probe runs in the
// background, keyed by the row's id so cancelling the row aborts exactly that
// probe (never the wizard's). When the probe answers, main swaps the row for
// the prepared items, or turns it into a probe-error or needs-choice row the
// Downloads tab resolves. Several links prepare in parallel.
//
// Entry points differ only in how a link is taken in (their own intake) and in
// how the user hears about it: the `QuickDownloadFeedback` they pass.

import {QUEUE_STATUS, PLAYLIST_PROBE_LIMIT_MAX, type QueueChoice} from '@shared/schemas.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import {downloadProfileLabel, resolveChosenDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import type {PlaylistProbeResult, PlaylistScope, ProbeError, ProbePlaylistMode, QueueItem} from '@shared/types.js'
import type {AppState, GetState} from '../types.js'
import {generateId} from '../helpers.js'
import {detach} from './detachedTask.js'
import {pinActiveDownloadProfile, type PinnedDownloadProfile} from '../wizard/queueSubmission.js'
import {resolveQuickProbe, type QuickProbeResolution, type QuickProbeTake} from './quickProbeResolution.js'

export interface QuickDownloadRequest {
	// Cleaned, and already through the entry point's intake policy.
	url: string
	playlistMode: ProbePlaylistMode
	// The row's title until the probe knows the real one (Explore's page title).
	title?: string
}

// What the user hears about. Rows the event names are already in the queue.
export type QuickDownloadEvent =
	| {kind: 'added'; itemId: string; title: string}
	| {kind: 'already-queued'; itemId: string | null}
	| {kind: 'not-added'}
	| {kind: 'queued'; itemId: string; skippedAlreadyQueued: number}
	| {kind: 'nothing-new'; skippedAlreadyQueued: number}
	| {kind: 'failed'; itemId: string; title: string; probeError: ProbeError | null}
	| {kind: 'needs-choice'; itemId: string; choice: QueueChoice; capped: boolean}

export type QuickDownloadFeedback = (event: QuickDownloadEvent) => void

interface PlaceholderProbe {
	url: string
	playlistMode: ProbePlaylistMode
	title: string
	// A needs-choice answer that needs a fresh probe: how wide to look, and what to keep.
	scope?: PlaylistScope
	take?: QuickProbeTake
}

// Collection probes a needs-choice row asked about, kept so First N and Review
// need no second probe. Lost on a reload or a restart; the choices then probe again.
const choiceProbes = new Map<string, PlaylistProbeResult>()

// The profile each placeholder was placed with, for its probe, its Retry and
// its choices. Lost on a reload or a restart; the row then prepares with the
// active profile.
const placedProfiles = new Map<string, PinnedDownloadProfile>()

export function keptChoiceProbe(itemId: string): PlaylistProbeResult | undefined {
	return choiceProbes.get(itemId)
}

export function placedProfile(itemId: string): PinnedDownloadProfile | undefined {
	return placedProfiles.get(itemId)
}

// Called when a row probes again: the kept probe no longer answers it.
export function forgetChoiceProbe(itemId: string): void {
	choiceProbes.delete(itemId)
}

// Called when a row is cancelled, removed, or resolved.
export function forgetPlaceholder(itemId: string): void {
	choiceProbes.delete(itemId)
	placedProfiles.delete(itemId)
}

export function forgetAllPlaceholders(): void {
	choiceProbes.clear()
	placedProfiles.clear()
}

// A review that queued nothing new still settles its row: drop it, unless it
// is no longer a placeholder (the swap refuses then, and nothing is lost).
export async function settlePlaceholder(itemId: string): Promise<void> {
	await window.appApi.queue.cmd.replaceProbing({itemId, items: []})
	forgetPlaceholder(itemId)
}

// Neither map is pruned against the store's queue: that is a projection
// flushed on animation frames, which do not run while the window is hidden, so
// a row main already holds can be missing from it. Entries leave with their
// row instead (cancel, remove, resolve, clear: forgetPlaceholder).
function keepChoiceProbe(itemId: string, probe: PlaylistProbeResult): void {
	choiceProbes.set(itemId, probe)
}

// The profile placed with supplies format label and folder so the row never
// lies about where the download will land. The unresolved job keeps the
// scheduler off it (schema and DownloadService both refuse it).
function placeholderRow(request: QuickDownloadRequest, pinned: PinnedDownloadProfile, state: AppState): QueueItem {
	const {profile} = resolveChosenDownloadProfile(pinned.ref, state.settings?.profiles)
	const titleHint = request.title?.trim() ?? ''
	let outputDir = ''
	try {
		outputDir = resolveDownloadProfileOutputDir(profile, pinned.outputContext)
	} catch {
		// A fixed folder left blank: the probe's preparation reports it on the row.
	}
	return {
		id: generateId(),
		url: request.url,
		title: titleHint.length > 0 ? titleHint : request.url,
		thumbnail: '',
		outputDir,
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
		probeMode: request.playlistMode,
		job: {kind: 'unresolved', extractor: '', extractorKey: ''}
	}
}

function liveRowFor(url: string, queue: readonly QueueItem[]): QueueItem | undefined {
	return queue.find(item => isLiveQueueItem(item) && item.url === url)
}

// Places the row and starts its probe; resolves once the row is placed (or
// refused), not when the probe ends. Returns the row's id, or null.
export async function placeQuickDownload(request: QuickDownloadRequest, get: GetState, feedback: QuickDownloadFeedback): Promise<string | null> {
	const live = liveRowFor(request.url, get().queue)
	if (live) {
		feedback({kind: 'already-queued', itemId: live.id})
		return null
	}
	const pinned = pinActiveDownloadProfile(get())
	const row = placeholderRow(request, pinned, get())
	const added = await window.appApi.queue.cmd.add([row]).catch((error: unknown) => {
		console.error('[quick-download] placing the row failed', error)
		return null
	})
	if (!added?.ok) {
		// Main is the queue of record: a conflict means another row holds the link.
		feedback(added?.error.code === 'conflict' ? {kind: 'already-queued', itemId: liveRowFor(request.url, get().queue)?.id ?? null} : {kind: 'not-added'})
		return null
	}
	placedProfiles.set(row.id, pinned)
	feedback({kind: 'added', itemId: row.id, title: row.title})
	detach(runPlaceholderProbe(row.id, {url: row.url, playlistMode: request.playlistMode, title: row.title}, get, feedback), 'background probe')
	return row.id
}

// Runs (or re-runs) the probe of a placeholder that is `probing` in main.
export async function runPlaceholderProbe(itemId: string, probe: PlaceholderProbe, get: GetState, feedback: QuickDownloadFeedback): Promise<void> {
	let resolution: QuickProbeResolution
	// Read before the probe, as main reads it: the result is one entry past
	// this limit when the collection goes on, whatever the setting is by then.
	const limit = probe.take?.kind === 'all' ? PLAYLIST_PROBE_LIMIT_MAX : probe.take?.kind === 'first' ? probe.take.count : resolvePlaylistProbeLimit(get().settings?.common)
	try {
		const result = await window.appApi.downloads.probe({url: probe.url, playlistMode: probe.playlistMode, ownerKey: itemId, ...(probe.scope ? {playlistScope: probe.scope} : {})})
		const profile = placedProfile(itemId)
		resolution = resolveQuickProbe(result, {url: probe.url, playlistMode: probe.playlistMode, limit, ...(probe.take ? {take: probe.take} : {}), ...(profile ? {profile} : {})}, get())
	} catch (error) {
		console.error('[quick-download] probe failed', error)
		resolution = failedResolution(error)
	}
	await applyResolution(itemId, probe.title, resolution, get, feedback)
}

function failedResolution(error: unknown): QuickProbeResolution {
	return {kind: 'failed', error: {kind: 'unknown', raw: error instanceof Error ? error.message : String(error)}, probeError: null}
}

// Never rejects. A write that rejects (the IPC transport, not a refusal) is
// reported, and the row, if main still holds it as probing, settles as a
// probe error the user can retry rather than stay stuck.
export async function applyResolution(itemId: string, title: string, resolution: QuickProbeResolution, get: GetState, feedback: QuickDownloadFeedback): Promise<void> {
	try {
		await writeResolution(itemId, title, resolution, get, feedback)
	} catch (error) {
		console.error("[quick-download] recording the probe's outcome failed", error)
		if (resolution.kind !== 'failed') await applyResolution(itemId, title, failedResolution(error), get, feedback)
	}
}

// Every write is refused once the row is gone (cancelled or removed while the
// probe ran), and a refused write says nothing: the user already moved on.
async function writeResolution(itemId: string, title: string, resolution: QuickProbeResolution, get: GetState, feedback: QuickDownloadFeedback): Promise<void> {
	switch (resolution.kind) {
		case 'queue': {
			const {prepared} = resolution
			if (prepared.manifest) {
				const registered = await window.appApi.playlist.registerManifest(prepared.manifest).catch((error: unknown) => ({ok: false as const, error}))
				if (!registered.ok) console.warn('[quick-download] playlist manifest registration failed; M3U will be skipped', registered.error)
			}
			// The first row keeps the placeholder's id, so a View raised by the
			// "Added" toast still finds it after the swap.
			const [first, ...rest] = prepared.items
			const items = first ? [{...first, id: itemId}, ...rest] : []
			const replaced = await window.appApi.queue.cmd.replaceProbing({itemId, items})
			if (replaced.ok) {
				// Main leaves out what went live while this was prepared (an
				// overlapping playlist), so both counts are already-queued videos.
				forgetPlaceholder(itemId)
				feedback({kind: 'queued', itemId, skippedAlreadyQueued: prepared.skippedAlreadyQueued + replaced.data.skippedAlreadyQueued})
				return
			}
			if (replaced.error.code === 'conflict') {
				// Every row went live in another form while the probe ran: nothing
				// new remains, which no Retry could fix. Drop the row and say so.
				const dropped = await window.appApi.queue.cmd.replaceProbing({itemId, items: []})
				if (!dropped.ok) return
				forgetPlaceholder(itemId)
				const urls = new Set(items.map(item => item.url))
				feedback({kind: 'already-queued', itemId: get().queue.find(item => item.id !== itemId && isLiveQueueItem(item) && urls.has(item.url))?.id ?? null})
				return
			}
			await applyResolution(itemId, title, {kind: 'failed', error: {kind: 'unknown', raw: replaced.error.message}, probeError: null}, get, feedback)
			return
		}
		case 'nothing-new': {
			const removed = await window.appApi.queue.cmd.replaceProbing({itemId, items: []})
			if (!removed.ok) return
			forgetPlaceholder(itemId)
			feedback({kind: 'nothing-new', skippedAlreadyQueued: resolution.skippedAlreadyQueued})
			return
		}
		case 'needs-choice': {
			const parked = await window.appApi.queue.cmd.needsChoice({itemId, choice: resolution.choice, title: resolution.title})
			if (!parked.ok) return
			keepChoiceProbe(itemId, resolution.probe)
			feedback({kind: 'needs-choice', itemId, choice: resolution.choice, capped: resolution.capped})
			return
		}
		case 'failed': {
			const auth = resolution.probeError?.kind === 'ytdlp' ? resolution.probeError.auth : undefined
			const failed = await window.appApi.queue.cmd.probeFailed({itemId, error: resolution.error, ...(auth ? {auth} : {})})
			if (failed.ok) feedback({kind: 'failed', itemId, title, probeError: resolution.probeError})
			return
		}
	}
}
