// A successful version probe is a durable fact about one exact file. Re-proving
// it on every launch is what made a cold macOS start wait ~30s for yt-dlp to
// unpack and be scanned before the window would open.

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {ProbeVerdictCache} from '@main/services/binary/ProbeVerdictCache.js'

let root = ''
let binaryPath = ''

async function writeBinary(contents: string): Promise<void> {
	await fs.writeFile(binaryPath, contents)
}

beforeEach(async () => {
	root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-verdict-'))
	binaryPath = path.join(root, 'yt-dlp')
	await writeBinary('#!/bin/sh\n')
})

describe('ProbeVerdictCache', () => {
	it('returns nothing for a binary it has never seen', async () => {
		const cache = new ProbeVerdictCache(root)

		await expect(cache.get(binaryPath)).resolves.toBeNull()
	})

	it('replays a recorded verdict for the same file', async () => {
		const cache = new ProbeVerdictCache(root)
		await cache.record(binaryPath, '2026.08.27')

		await expect(cache.get(binaryPath)).resolves.toBe('2026.08.27')
	})

	it('survives a fresh instance, which is the whole point', async () => {
		await new ProbeVerdictCache(root).record(binaryPath, '2026.08.27')

		await expect(new ProbeVerdictCache(root).get(binaryPath)).resolves.toBe('2026.08.27')
	})

	// The verdict is about the bytes, not the path. An upgrade in place has to
	// re-probe, or a broken replacement would inherit its predecessor's pass.
	it('forgets the verdict once the file changes', async () => {
		await new ProbeVerdictCache(root).record(binaryPath, '2026.08.27')
		await new Promise(resolve => setTimeout(resolve, 10))
		await writeBinary('#!/bin/sh\n# different build\n')

		await expect(new ProbeVerdictCache(root).get(binaryPath)).resolves.toBeNull()
	})

	it('forgets the verdict once the file is gone', async () => {
		await new ProbeVerdictCache(root).record(binaryPath, '2026.08.27')
		await fs.rm(binaryPath)

		await expect(new ProbeVerdictCache(root).get(binaryPath)).resolves.toBeNull()
	})

	// The repair panel's "check again" has to be able to notice a binary the OS
	// started blocking after we recorded it as good.
	it('drops everything on clear', async () => {
		const cache = new ProbeVerdictCache(root)
		await cache.record(binaryPath, '2026.08.27')

		await cache.clear()

		await expect(cache.get(binaryPath)).resolves.toBeNull()
		await expect(new ProbeVerdictCache(root).get(binaryPath)).resolves.toBeNull()
	})

	it('starts empty rather than throwing when the file on disk is corrupt', async () => {
		await fs.writeFile(path.join(root, 'probe-verdicts.json'), '{not json')

		await expect(new ProbeVerdictCache(root).get(binaryPath)).resolves.toBeNull()
	})

	it('ignores entries that are not shaped like a verdict', async () => {
		await fs.writeFile(path.join(root, 'probe-verdicts.json'), JSON.stringify({[binaryPath]: {size: 'huge'}}))

		await expect(new ProbeVerdictCache(root).get(binaryPath)).resolves.toBeNull()
	})

	it('never records a verdict for a file it cannot stat', async () => {
		const cache = new ProbeVerdictCache(root)

		await expect(cache.record(path.join(root, 'absent'), '2026.08.27')).resolves.toBeUndefined()
		await expect(cache.get(path.join(root, 'absent'))).resolves.toBeNull()
	})
})

describe('ProbeVerdictCache write ordering', () => {
	// invalidateResolved() fires clear() without awaiting it, then immediately
	// re-resolves. A slow unlink would otherwise land after the record that
	// follows and delete the verdict the re-probe just paid ~30s for — losing the
	// memo on exactly the path that most needs it. The delay here forces the
	// interleaving that real disk latency only sometimes produces.
	it('does not let a slow fire-and-forget clear swallow the verdict recorded after it', async () => {
		const realRm = fs.rm.bind(fs)
		const rm = vi.spyOn(fs, 'rm').mockImplementation(async (...args: Parameters<typeof fs.rm>) => {
			await new Promise(resolve => setTimeout(resolve, 50))
			return realRm(...args)
		})

		try {
			const cache = new ProbeVerdictCache(root)
			await cache.record(binaryPath, 'stale')

			void cache.clear()
			await cache.record(binaryPath, '2026.08.27')

			// Outlast the delayed unlink, so the assertion sees the final state of
			// disk rather than a window before the clear has landed.
			await new Promise(resolve => setTimeout(resolve, 120))

			expect(rm).toHaveBeenCalled()
			await expect(new ProbeVerdictCache(root).get(binaryPath)).resolves.toBe('2026.08.27')
		} finally {
			rm.mockRestore()
		}
	})
})
