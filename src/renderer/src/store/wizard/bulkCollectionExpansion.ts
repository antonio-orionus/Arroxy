// Bulk intake expands collection URLs before any row exists.
//
// A bulk row becomes exactly one download job, and a job carries one filename
// bound before it runs. So a collection URL sitting in a bulk row is not a
// cosmetic problem: `--no-playlist` is inert on a bare `/playlist?list=…`,
// `@channel` or `/results?search_query=…`, and yt-dlp downloads the whole set
// under that one name. Quick Download already expands these (it probes with
// `playlistMode: 'playlist'` and queues one job per entry); this gives the bulk
// list the same treatment so the two paths agree.
//
// Expansion runs before projection rather than during hydration because
// hydration addresses rows by position — splicing entries in mid-run would
// shift every later row out from under its in-flight worker.

import type {PlaylistEntry, PlaylistScope, ProbeError, ProbeResult} from '@shared/types.js'
import type {Result} from '@shared/result.js'
import {isCollectionUrl} from '@shared/urlIntent.js'
import {bulkLogger, redactUrlForLog} from '@renderer/lib/bulkLogger.js'
import type {BulkEntrySeed} from './probeResultProjection.js'

export interface BulkExpansion {
	urls: string[]
	/** Metadata the playlist probe already resolved, keyed by row URL. */
	seeds: Map<string, BulkEntrySeed>
	/** Collection URLs whose probe failed; dropped rather than queued whole. */
	dropped: string[]
	/** Last probe failure, so a run that drops everything can say why. */
	error?: ProbeError
	/** True when the run was superseded or cancelled part-way through. */
	aborted: boolean
}

type ProbeFn = (input: {url: string; playlistMode: 'playlist'; playlistScope?: PlaylistScope}) => Promise<Result<ProbeResult, ProbeError>>

function seedFor(entry: PlaylistEntry): BulkEntrySeed {
	return {
		title: entry.title,
		thumbnail: entry.thumbnail,
		duration: entry.duration,
		videoId: entry.videoId,
		uploader: entry.uploader,
		uploadDate: entry.uploadDate,
		timestamp: entry.timestamp,
		...(entry.isContainer === true ? {isContainer: true as const} : {}),
		...(entry.titleIsPlaceholder === true ? {titleIsPlaceholder: true as const} : {})
	}
}

export function hasCollectionUrl(urls: readonly string[]): boolean {
	return urls.some(isCollectionUrl)
}

/**
 * Replace every collection URL with its entries, preserving input order.
 *
 * A collection whose probe fails is dropped, not passed through — passing it
 * through is exactly the bug this exists to prevent. Container entries are
 * dropped for the same reason: a channel's Playlists tab expands into more
 * collections, and one level of expansion does not make those downloadable.
 * Duplicate URLs collapse, since two playlists can share a video and a repeated
 * row would download it twice.
 */
export async function expandBulkCollectionUrls(urls: readonly string[], probe: ProbeFn, playlistScope: PlaylistScope, isActive: () => boolean = () => true): Promise<BulkExpansion> {
	const out: string[] = []
	const seeds = new Map<string, BulkEntrySeed>()
	const dropped: string[] = []
	const seen = new Set<string>()
	let error: ProbeError | undefined

	const push = (url: string, seed?: BulkEntrySeed): void => {
		if (seen.has(url)) return
		seen.add(url)
		out.push(url)
		if (seed) seeds.set(url, seed)
	}

	for (const url of urls) {
		// Probes run one at a time and a channel can take seconds, so a user who
		// starts a new list must not be left waiting on the old one's remaining
		// URLs. `probeCancel` already aborts the in-flight probe; this stops the
		// loop from marching on through the rest.
		if (!isActive()) return {urls: out, seeds, dropped, aborted: true, ...(error ? {error} : {})}
		if (!isCollectionUrl(url)) {
			push(url)
			continue
		}

		bulkLogger.info('Bulk collection URL expanding', {url: redactUrlForLog(url)})
		const result = await probe({url, playlistMode: 'playlist', playlistScope})
		if (!result.ok || result.data.kind !== 'playlist') {
			bulkLogger.warn('Bulk collection URL could not be expanded', {url: redactUrlForLog(url), ok: result.ok})
			if (!result.ok) error = result.error
			dropped.push(url)
			// Kept as a row rather than removed: a URL the user pasted that simply
			// disappears is the same silent drop this whole change exists to end.
			// Marking it a playlist row is accurate and reuses the badge, the
			// disabled state and the hint — it is a playlist, it just could not be
			// read, and "paste its link on its own" is still the way to get it.
			push(url, {title: '', thumbnail: '', videoId: null, isContainer: true})
			continue
		}

		const entries = result.data.entries.filter(entry => entry.isContainer !== true)
		bulkLogger.info('Bulk collection URL expanded', {url: redactUrlForLog(url), entries: entries.length})
		for (const entry of entries) push(entry.url, seedFor(entry))
	}

	return {urls: out, seeds, dropped, aborted: false, ...(error ? {error} : {})}
}
