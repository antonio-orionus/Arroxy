// Startup sweep for `.arroxy-temp` scratch directories that no longer belong to
// anything.
//
// Every job directory is owned by a disposable that drains when the job
// finalizes, so the steady state leaves nothing behind. A hard crash, a SIGKILL
// or a power cut skips the drain, and the directory then survives forever: no
// other code path ever looks at it again, and it sits in the user's download
// folder as visible clutter.
//
// Deleting on behalf of a crashed job is only safe because a crashed job leaves
// no claim on its directory. `QueueItem.tempDir` is written by exactly one
// transition — `paused-active` — and cleared by every other one, so a job that
// was running when the process died persists with no `tempDir` and no
// `resumeContext`: on restart it starts over into a fresh directory under a new
// job id. There is nothing to continue, and therefore nothing this sweep can
// take away. The two states that DO hold a claim are the ones this sweep is
// given as its keep set.

import {readdir, rm, rmdir, stat} from 'node:fs/promises'
import {join, resolve} from 'node:path'
import log from 'electron-log/main.js'
import type {QueueItem} from '@shared/types.js'
import {TEMP_DIR_NAME} from './cleanup.js'

const logger = log.scope('downloads')

// Job directories are named `jobId.slice(0, 8)` — the first block of a uuid.
// Anything else under `.arroxy-temp` was not put there by us, and this sweep
// does not get to delete files it cannot account for.
const JOB_DIR_NAME = /^[0-9a-f]{8}$/i

// A second Arroxy instance (another checkout, another window) can be mid-job in
// the same output folder, and it holds its claim in its own process rather than
// in our persisted queue. The age gate is what keeps that safe without a lock
// file: its directory was created when its job started, and a job whose newest
// byte is half a day old is not running any more.
const DEFAULT_MAX_AGE_MS = 12 * 60 * 60 * 1000

export interface SweepOptions {
	outputDirs: readonly string[]
	keep: ReadonlySet<string>
	now?: number
	maxAgeMs?: number
}

// The directories the persisted queue still points at: a paused-active item
// resumes into its own `.part` files, and a resumable failure retries into
// them. Both are read straight off the restored queue, so the claim survives
// the restart exactly as long as the item does.
export function collectLiveTempDirs(items: readonly QueueItem[]): Set<string> {
	const keep = new Set<string>()
	for (const item of items) {
		if (item.tempDir) keep.add(item.tempDir)
		if (item.resumeContext?.tempDir) keep.add(item.resumeContext.tempDir)
	}
	return keep
}

// Newest mtime anywhere in the directory, one level deep. The directory's own
// mtime only moves when an entry is added or removed, so a long download that
// has been appending to the same `.part` file for hours looks abandoned by that
// measure alone — the file is what proves the job is alive.
async function newestMtimeMs(dir: string, names: readonly string[]): Promise<number> {
	const own = await stat(dir)
	let newest = own.mtimeMs
	for (const name of names) {
		try {
			const child = await stat(join(dir, name))
			if (child.mtimeMs > newest) newest = child.mtimeMs
		} catch {
			// Raced with something else removing it; the remaining entries still
			// decide, and a directory we cannot fully read is one we leave alone
			// below anyway.
		}
	}
	return newest
}

async function sweepOne(outputDir: string, keep: ReadonlySet<string>, now: number, maxAgeMs: number): Promise<string[]> {
	const parent = join(outputDir, TEMP_DIR_NAME)
	let entries: string[]
	try {
		entries = await readdir(parent)
	} catch {
		return []
	}

	const removed: string[] = []
	let survivors = 0
	for (const name of entries) {
		const dir = join(parent, name)
		if (!JOB_DIR_NAME.test(name)) {
			survivors++
			continue
		}
		try {
			const children = await readdir(dir)
			if (keep.has(resolve(dir)) || now - (await newestMtimeMs(dir, children)) < maxAgeMs) {
				survivors++
				continue
			}
			await rm(dir, {recursive: true, force: true})
			removed.push(dir)
		} catch {
			// Not a directory, unreadable, or gone underneath us. Either way it is
			// not ours to delete.
			survivors++
		}
	}

	if (survivors === 0) {
		// Best-effort, and correct to skip silently when it fails: a non-empty
		// parent is the normal outcome of a partial sweep.
		await rmdir(parent).catch(() => undefined)
	}
	return removed
}

// Removes every job directory that nothing claims any more. Returns the paths
// removed. Never throws: a sweep that cannot read a folder simply leaves it.
export async function sweepStaleTempDirs(opts: SweepOptions): Promise<string[]> {
	const now = opts.now ?? Date.now()
	const maxAgeMs = opts.maxAgeMs ?? DEFAULT_MAX_AGE_MS
	const keep = new Set([...opts.keep].map(path => resolve(path)))

	const removed: string[] = []
	for (const outputDir of new Set(opts.outputDirs.filter(dir => dir.trim() !== ''))) {
		removed.push(...(await sweepOne(outputDir, keep, now, maxAgeMs)))
	}
	if (removed.length > 0) logger.info('startup temp sweep — removed abandoned job directories', {count: removed.length, dirs: removed})
	return removed
}
