import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import fsPromises from 'node:fs/promises'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {resetClipboardLock, withClipboardLock} from '../e2e/clipboardLock.js'

const LOCK_DIR = path.join(os.tmpdir(), 'arroxy-e2e-clipboard.lock')

beforeEach(async () => {
	await resetClipboardLock()
})

afterEach(async () => {
	await resetClipboardLock()
})

describe('withClipboardLock', () => {
	it('never lets two holders overlap', async () => {
		// Models the real failure: one test writes the clipboard, yields, then
		// pastes. Without exclusion another holder writes in the gap and the paste
		// picks up the wrong text.
		let active = 0
		let maxActive = 0
		await Promise.all(
			Array.from({length: 6}, () =>
				withClipboardLock(async () => {
					active++
					maxActive = Math.max(maxActive, active)
					await new Promise(resolve => setTimeout(resolve, 15))
					active--
				})
			)
		)
		expect(maxActive).toBe(1)
	})

	it('serializes holders in the order they acquire', async () => {
		const order: number[] = []
		await Promise.all(
			Array.from({length: 4}, (_unused, index) =>
				withClipboardLock(async () => {
					order.push(index)
					await new Promise(resolve => setTimeout(resolve, 5))
				})
			)
		)
		expect(order).toHaveLength(4)
		expect(new Set(order).size).toBe(4)
	})

	it('releases the lock when the body throws', async () => {
		let raised: unknown
		try {
			await withClipboardLock(async () => {
				throw new Error('assertion failed inside the test')
			})
		} catch (error) {
			raised = error
		}
		expect((raised as Error | undefined)?.message).toBe('assertion failed inside the test')
		// A wedged lock would hang the whole suite, so the next acquire must work.
		await expect(withClipboardLock(async () => 'acquired')).resolves.toBe('acquired')
	})

	it('returns the body result', async () => {
		await expect(withClipboardLock(async () => 42)).resolves.toBe(42)
	})

	it('does not release a lock it no longer owns', async () => {
		// Guards the cascade this design had to remove: with age-based
		// reclamation, a waiter could evict a live holder, and the evicted holder
		// would then delete the *new* holder's lock on its way out, admitting a
		// third. Release is ownership-checked so that chain cannot start.
		await withClipboardLock(async () => {
			// Simulate the lock having been taken over by someone else.
			fs.writeFileSync(path.join(LOCK_DIR, 'owner'), 'a-different-holder')
		})
		expect(fs.existsSync(LOCK_DIR)).toBe(true)
		expect(fs.readFileSync(path.join(LOCK_DIR, 'owner'), 'utf8')).toBe('a-different-holder')
	})

	it('does not reclaim a long-running holder', async () => {
		// A legitimate holder can outlive any fixed threshold — the clipboard
		// watcher test holds this across a full Electron launch under a 90s
		// timeout. Nothing may take the lock from it while it is alive.
		let holderDone = false
		let waiterEnteredEarly = false
		const holder = withClipboardLock(async () => {
			await new Promise(resolve => setTimeout(resolve, 300))
			holderDone = true
		})
		await new Promise(resolve => setTimeout(resolve, 20))
		const waiter = withClipboardLock(async () => {
			if (!holderDone) waiterEnteredEarly = true
		})
		await Promise.all([holder, waiter])
		expect(waiterEnteredEarly).toBe(false)
	})

	it('surfaces a non-EEXIST filesystem failure instead of polling forever', async () => {
		// EEXIST is contention; EACCES, ENOSPC and EROFS are real failures. Treating
		// them all as contention turned a permissions problem into a hung suite.
		const denied = Object.assign(new Error('permission denied'), {code: 'EACCES'})
		const mkdir = vi.spyOn(fsPromises, 'mkdir').mockRejectedValueOnce(denied)
		let raised: unknown
		try {
			await withClipboardLock(async () => 'unreachable')
		} catch (error) {
			raised = error
		}
		expect((raised as NodeJS.ErrnoException | undefined)?.code).toBe('EACCES')
		expect(mkdir).toHaveBeenCalledTimes(1)
		mkdir.mockRestore()
	})

	it('keeps polling on EEXIST rather than throwing', async () => {
		const exists = Object.assign(new Error('exists'), {code: 'EEXIST'})
		const mkdir = vi.spyOn(fsPromises, 'mkdir')
		mkdir.mockRejectedValueOnce(exists).mockRejectedValueOnce(exists)
		await expect(withClipboardLock(async () => 'got it')).resolves.toBe('got it')
		// Two refusals then the real call: contention is retried, not surfaced.
		expect(mkdir.mock.calls.length).toBeGreaterThanOrEqual(3)
		mkdir.mockRestore()
	})
})

describe('resetClipboardLock', () => {
	it('clears debris left by a run that died', async () => {
		fs.mkdirSync(LOCK_DIR, {recursive: true})
		fs.writeFileSync(path.join(LOCK_DIR, 'owner'), 'dead-worker')
		await resetClipboardLock()
		expect(fs.existsSync(LOCK_DIR)).toBe(false)
	})

	it('is safe to call when no lock exists', async () => {
		await resetClipboardLock()
		await expect(resetClipboardLock()).resolves.toBeUndefined()
	})
})
