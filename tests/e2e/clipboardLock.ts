import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

// The system clipboard is one shared resource, and Playwright workers are
// separate processes on the same machine. Two tests that write it and then
// press Cmd/Ctrl+V will paste each other's content — a flake that only appears
// once the suite runs in parallel, and only sometimes.
//
// `mkdir` is the mutex: it is atomic and fails with EEXIST when the directory
// already exists, so exactly one holder wins. A plain file plus an existence
// check would not be atomic.
const LOCK_DIR = path.join(os.tmpdir(), 'arroxy-e2e-clipboard.lock')

// Long enough to cover a paste round-trip, short enough that a worker killed
// mid-test cannot wedge the suite.
const STALE_AFTER_MS = 60_000
const POLL_MS = 50

async function lockAgeMs(): Promise<number | null> {
	try {
		const stat = await fsPromises.stat(LOCK_DIR)
		return Date.now() - stat.mtimeMs
	} catch {
		return null
	}
}

/**
 * Run `body` with exclusive access to the system clipboard.
 *
 * Released in a `finally`, so a failing assertion inside `body` does not wedge
 * the other workers.
 */
export async function withClipboardLock<T>(body: () => Promise<T>): Promise<T> {
	for (;;) {
		try {
			await fsPromises.mkdir(LOCK_DIR)
			break
		} catch {
			// A worker that crashed without releasing would otherwise block the
			// suite forever, so an old lock is reclaimed rather than waited on.
			const age = await lockAgeMs()
			if (age !== null && age > STALE_AFTER_MS) {
				await fsPromises.rm(LOCK_DIR, {recursive: true, force: true})
				continue
			}
			await new Promise(resolve => setTimeout(resolve, POLL_MS))
		}
	}
	try {
		return await body()
	} finally {
		await fsPromises.rm(LOCK_DIR, {recursive: true, force: true})
	}
}
