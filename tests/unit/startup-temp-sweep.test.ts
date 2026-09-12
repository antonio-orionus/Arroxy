import {mkdtemp, mkdir, readdir, stat, utimes, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {beforeEach, describe, expect, it} from 'vitest'
import {collectLiveTempDirs, sweepStaleTempDirs} from '@main/services/download/startupTempSweep.js'
import {TEMP_DIR_NAME} from '@main/services/download/cleanup.js'
import type {QueueItem} from '@shared/types.js'

const HOUR = 60 * 60 * 1000
const NOW = Date.UTC(2026, 0, 2, 12, 0, 0)

let root: string

beforeEach(async () => {
	root = await mkdtemp(join(tmpdir(), 'arroxy-sweep-'))
})

// Ages a path by rewriting both atime and mtime — the sweep reads mtime only,
// but leaving atime in the future would be a lie about the fixture.
async function age(path: string, ms: number): Promise<void> {
	const when = new Date(NOW - ms)
	await utimes(path, when, when)
}

async function makeTempDir(outputDir: string, id: string, ageMs: number, files: Record<string, string> = {}): Promise<string> {
	const dir = join(outputDir, TEMP_DIR_NAME, id)
	await mkdir(dir, {recursive: true})
	for (const [name, body] of Object.entries(files)) {
		const file = join(dir, name)
		await writeFile(file, body)
		await age(file, ageMs)
	}
	await age(dir, ageMs)
	await age(join(outputDir, TEMP_DIR_NAME), ageMs)
	return dir
}

function makeItem(overrides: Partial<QueueItem>): QueueItem {
	return {id: 'item-1', url: 'https://example.com/v', title: 'v', thumbnail: '', outputDir: root, formatLabel: 'best', status: 'pending', lane: 'normal', progressPercent: 0, progressDetail: null, lastStatus: null, error: null, addedAt: null, finishedAt: null, writeM3u: true, retryCount: 0, ...overrides} as QueueItem
}

async function entries(dir: string): Promise<string[]> {
	try {
		return (await readdir(dir)).sort()
	} catch {
		return []
	}
}

describe('collectLiveTempDirs', () => {
	it('keeps the tempDir of a paused-active item', () => {
		const keep = collectLiveTempDirs([makeItem({status: 'paused-active', tempDir: '/out/.arroxy-temp/aaaaaaaa'})])
		expect([...keep]).toEqual([join('/out', '.arroxy-temp', 'aaaaaaaa')])
	})

	it('keeps the tempDir of a resumable failure', () => {
		const keep = collectLiveTempDirs([makeItem({status: 'error', resumeContext: {kind: 'media-retry', tempDir: '/out/.arroxy-temp/bbbbbbbb', reason: 'media-transfer', failureKind: 'network'}})])
		expect([...keep]).toEqual([join('/out', '.arroxy-temp', 'bbbbbbbb')])
	})

	it('keeps nothing for an item that has neither', () => {
		expect(collectLiveTempDirs([makeItem({})]).size).toBe(0)
	})
})

describe('sweepStaleTempDirs', () => {
	it('removes an orphaned temp dir older than the age gate', async () => {
		const stale = await makeTempDir(root, '0352556f', 48 * HOUR)

		const removed = await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})

		expect(removed).toEqual([stale])
		expect(await entries(root)).toEqual([])
	})

	it('removes the .arroxy-temp parent once it is empty', async () => {
		await makeTempDir(root, '0352556f', 48 * HOUR)
		await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})
		expect(await entries(root)).toEqual([])
	})

	it('leaves the parent alone while another temp dir survives in it', async () => {
		await makeTempDir(root, '0352556f', 48 * HOUR)
		await makeTempDir(root, 'ac895e57', 1 * HOUR)

		await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})

		expect(await entries(join(root, TEMP_DIR_NAME))).toEqual(['ac895e57'])
	})

	// The age gate is the whole safety story for a second Arroxy instance
	// downloading into the same folder from another checkout: its temp dir is
	// minutes old, so it can never fall inside the window.
	it('spares a temp dir younger than the age gate', async () => {
		await makeTempDir(root, 'ac895e57', 10 * 60 * 1000)

		const removed = await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})

		expect(removed).toEqual([])
		expect(await entries(join(root, TEMP_DIR_NAME))).toEqual(['ac895e57'])
	})

	// A long download only ever touches the `.part` file, so on platforms where
	// writing a file does not bump the directory's own mtime the directory looks
	// abandoned. The freshest child is what proves the job is alive.
	it('spares an old directory whose .part file is still being written', async () => {
		const dir = await makeTempDir(root, 'ac895e57', 48 * HOUR)
		const part = join(dir, 'video.mp4.part')
		await writeFile(part, 'bytes')
		await age(part, 30 * 1000)
		// Re-age the directory last: creating the entry just bumped its own mtime,
		// and leaving that in place would make the directory look fresh for the
		// wrong reason, hiding whether the child is consulted at all.
		await age(dir, 48 * HOUR)

		const removed = await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})

		expect(removed).toEqual([])
		expect(await entries(dir)).toEqual(['video.mp4.part'])
	})

	it('spares a stale directory that the queue still points at', async () => {
		const kept = await makeTempDir(root, 'ac895e57', 48 * HOUR, {'video.mp4.part': 'bytes'})

		const removed = await sweepStaleTempDirs({outputDirs: [root], keep: new Set([kept]), now: NOW})

		expect(removed).toEqual([])
		expect(await entries(kept)).toEqual(['video.mp4.part'])
	})

	// Only the `jobId.slice(0, 8)` shape is ours. Anything else under
	// `.arroxy-temp` was put there by something that is not Arroxy, and deleting
	// a user's files is not a cleanup this feature is allowed to perform.
	it('never touches an entry that is not a job temp dir', async () => {
		const parent = join(root, TEMP_DIR_NAME)
		await mkdir(join(parent, 'my-notes'), {recursive: true})
		await writeFile(join(parent, 'stray.txt'), 'x')
		await age(join(parent, 'my-notes'), 48 * HOUR)
		await age(join(parent, 'stray.txt'), 48 * HOUR)
		await age(parent, 48 * HOUR)

		const removed = await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})

		expect(removed).toEqual([])
		expect(await entries(parent)).toEqual(['my-notes', 'stray.txt'])
	})

	it('leaves files in the output directory itself untouched', async () => {
		await writeFile(join(root, 'Real Video.mp4'), 'bytes')
		await makeTempDir(root, '0352556f', 48 * HOUR)

		await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})

		expect(await entries(root)).toEqual(['Real Video.mp4'])
	})

	it('sweeps every distinct output directory once', async () => {
		const other = await mkdtemp(join(tmpdir(), 'arroxy-sweep-b-'))
		await makeTempDir(root, '0352556f', 48 * HOUR)
		await makeTempDir(other, 'ac895e57', 48 * HOUR)

		const removed = await sweepStaleTempDirs({outputDirs: [root, other, root], keep: new Set(), now: NOW})

		expect(removed.length).toBe(2)
		expect(await entries(root)).toEqual([])
		expect(await entries(other)).toEqual([])
	})

	it('resolves keep paths so a non-normalized persisted path still protects its directory', async () => {
		const kept = await makeTempDir(root, 'ac895e57', 48 * HOUR)

		const removed = await sweepStaleTempDirs({outputDirs: [root], keep: new Set([join(root, TEMP_DIR_NAME, '.', 'ac895e57')]), now: NOW})

		expect(removed).toEqual([])
		expect(await stat(kept)).toBeTruthy()
	})

	// Observed in the wild: the job directory was reclaimed but the parent
	// survived, leaving an empty folder sitting in the download folder forever.
	it('removes a .arroxy-temp that is already empty', async () => {
		const parent = join(root, TEMP_DIR_NAME)
		await mkdir(parent, {recursive: true})

		const removed = await sweepStaleTempDirs({outputDirs: [root], keep: new Set(), now: NOW})

		expect(removed).toEqual([])
		expect(await entries(root)).toEqual([])
	})

	it('is a no-op for an output directory with no .arroxy-temp at all', async () => {
		const removed = await sweepStaleTempDirs({outputDirs: [root, join(root, 'does-not-exist')], keep: new Set(), now: NOW})
		expect(removed).toEqual([])
	})
})
