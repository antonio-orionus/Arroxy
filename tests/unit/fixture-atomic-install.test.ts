import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'
import {installAtomically} from '../e2e/fixtureHarness.js'

// Playwright workers are separate processes, so the per-process memo in
// prepareFixtureRuntime does not serialize them. On a cold cache several
// workers reach the same fixed destination path at once. Writing there
// directly means one worker can read a half-written binary, or delete the
// file another worker is verifying.

const dirs: string[] = []

function tempDir(): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-atomic-test-'))
	dirs.push(dir)
	return dir
}

afterEach(() => {
	for (const dir of dirs.splice(0)) fs.rmSync(dir, {recursive: true, force: true})
})

/** Writes in two chunks with a gap, so a torn read is observable. */
async function writeSlowly(staging: string, body: string): Promise<void> {
	const half = Math.floor(body.length / 2)
	await fs.promises.writeFile(staging, body.slice(0, half))
	await new Promise(resolve => setTimeout(resolve, 20))
	await fs.promises.appendFile(staging, body.slice(half))
}

describe('installAtomically', () => {
	it('produces the finished file at the destination', async () => {
		const destination = path.join(tempDir(), 'yt-dlp')
		await installAtomically(destination, staging => writeSlowly(staging, 'COMPLETE-PAYLOAD'))
		expect(fs.readFileSync(destination, 'utf8')).toBe('COMPLETE-PAYLOAD')
	})

	it('creates the destination directory when it does not exist', async () => {
		const destination = path.join(tempDir(), 'nested', 'deeper', 'yt-dlp')
		await installAtomically(destination, staging => fs.promises.writeFile(staging, 'x'))
		expect(fs.existsSync(destination)).toBe(true)
	})

	it('never exposes a partial file to a concurrent reader', async () => {
		// Eight writers race on one destination while a reader polls it. Every
		// observation must be the whole payload — never a prefix.
		const destination = path.join(tempDir(), 'yt-dlp')
		const payload = 'A'.repeat(4096)
		const seen: string[] = []
		let polling = true
		const reader = (async () => {
			while (polling) {
				try {
					seen.push(fs.readFileSync(destination, 'utf8'))
				} catch {
					// Absent is fine; partial is not.
				}
				await new Promise(resolve => setTimeout(resolve, 1))
			}
		})()

		await Promise.all(Array.from({length: 8}, () => installAtomically(destination, staging => writeSlowly(staging, payload))))
		polling = false
		await reader

		expect(seen.length).toBeGreaterThan(0)
		expect(seen.every(content => content === payload)).toBe(true)
	})

	it('leaves no staging files behind', async () => {
		const dir = tempDir()
		const destination = path.join(dir, 'yt-dlp')
		await Promise.all(Array.from({length: 4}, () => installAtomically(destination, staging => writeSlowly(staging, 'payload'))))
		expect(fs.readdirSync(dir)).toEqual(['yt-dlp'])
	})

	it('cleans up staging and rethrows when the producer fails', async () => {
		const dir = tempDir()
		const destination = path.join(dir, 'yt-dlp')
		let raised: unknown
		try {
			await installAtomically(destination, async staging => {
				await fs.promises.writeFile(staging, 'partial')
				throw new Error('checksum mismatch')
			})
		} catch (error) {
			raised = error
		}
		expect((raised as Error | undefined)?.message).toBe('checksum mismatch')
		// A failed download must not leave debris that a later run mistakes for a
		// cached binary.
		expect(fs.readdirSync(dir)).toEqual([])
	})
})
