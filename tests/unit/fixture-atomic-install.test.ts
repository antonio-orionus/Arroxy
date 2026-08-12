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
		// Deterministic rather than timing-based: the producer is held open at the
		// exact moment its staging file is half-written, so the observation below
		// happens at the only instant a partial file could leak. A polling reader
		// racing a fixed delay could miss that window entirely under load and
		// report success without having checked anything.
		const destination = path.join(tempDir(), 'yt-dlp')
		const payload = 'A'.repeat(4096)

		let releaseProducer: () => void = () => {}
		const producerHeld = new Promise<void>(resolve => {
			releaseProducer = resolve
		})
		let reachedHalfWay: () => void = () => {}
		const halfWritten = new Promise<void>(resolve => {
			reachedHalfWay = resolve
		})

		const install = installAtomically(destination, async staging => {
			await fs.promises.writeFile(staging, payload.slice(0, payload.length / 2))
			reachedHalfWay()
			await producerHeld
			await fs.promises.appendFile(staging, payload.slice(payload.length / 2))
		})

		await halfWritten
		// Half the payload exists on disk right now, and the destination must not
		// show any of it.
		expect(fs.existsSync(destination)).toBe(false)

		releaseProducer()
		await install
		expect(fs.readFileSync(destination, 'utf8')).toBe(payload)
	})

	it('leaves the destination whole when many writers race', async () => {
		// Concurrency still gets coverage, but the assertion is on the settled
		// result rather than on catching a moment.
		const destination = path.join(tempDir(), 'yt-dlp')
		const payload = 'B'.repeat(2048)
		await Promise.all(Array.from({length: 8}, () => installAtomically(destination, staging => writeSlowly(staging, payload))))
		expect(fs.readFileSync(destination, 'utf8')).toBe(payload)
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
