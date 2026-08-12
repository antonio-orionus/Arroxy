import {randomUUID} from 'node:crypto'
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
const OWNER_FILE = path.join(LOCK_DIR, 'owner')
const POLL_MS = 50

/**
 * Drop a lock left behind by a previous run.
 *
 * Call this only from globalSetup. It is the one moment when removing the lock
 * is provably safe, because no worker exists yet and therefore no live holder
 * can be destroyed.
 *
 * There is deliberately no age-based reclamation inside `withClipboardLock`:
 * a legitimate holder can run for a long time — the clipboard-watch test holds
 * this across a full Electron launch and workflow under a 90s timeout — so any
 * "the lock looks old, take it" rule eventually evicts a live holder and puts
 * two tests in the critical section, which is the exact failure the lock
 * exists to prevent. A worker killed mid-body wedges only the remainder of
 * that run, which is already failing.
 */
export async function resetClipboardLock(): Promise<void> {
	await fsPromises.rm(LOCK_DIR, {recursive: true, force: true})
}

/**
 * Run `body` with exclusive access to the system clipboard.
 *
 * Released in a `finally`, so a failing assertion inside `body` does not wedge
 * the other workers.
 */
export async function withClipboardLock<T>(body: () => Promise<T>): Promise<T> {
	// Identifies this holder so release can never remove someone else's lock.
	const token = `${process.pid}.${randomUUID()}`
	for (;;) {
		try {
			await fsPromises.mkdir(LOCK_DIR)
		} catch (error) {
			// Only EEXIST means contention. EACCES, ENOSPC and EROFS are real
			// filesystem failures, and polling on them would hang the suite
			// instead of reporting the problem.
			if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
			await new Promise(resolve => setTimeout(resolve, POLL_MS))
			continue
		}
		try {
			await fsPromises.writeFile(OWNER_FILE, token)
		} catch (error) {
			// Holding a lock nobody can prove ownership of would wedge the run.
			await fsPromises.rm(LOCK_DIR, {recursive: true, force: true})
			throw error
		}
		break
	}

	try {
		return await body()
	} finally {
		let owner: string | null = null
		try {
			owner = await fsPromises.readFile(OWNER_FILE, 'utf8')
		} catch {
			owner = null
		}
		if (owner === token) await fsPromises.rm(LOCK_DIR, {recursive: true, force: true})
	}
}
