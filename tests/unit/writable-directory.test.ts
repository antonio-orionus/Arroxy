import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {chmod, mkdtemp, readdir, rm, stat} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {checkWritableDirectory} from '@main/utils/writableDirectory.js'

// POSIX permission bits do not stop root, and Windows ignores them.
const canDenyWrites = process.platform !== 'win32' && process.getuid?.() !== 0

let root: string

beforeEach(async () => {
	root = await mkdtemp(join(tmpdir(), 'arroxy-writable-'))
})

afterEach(async () => {
	await chmod(root, 0o755).catch(() => undefined)
	await rm(root, {recursive: true, force: true})
})

describe('checkWritableDirectory', () => {
	it('accepts a writable directory and leaves no probe file behind', async () => {
		expect(await checkWritableDirectory(root)).toEqual({ok: true})
		expect(await readdir(root)).toEqual([])
	})

	it('creates a missing directory before probing it', async () => {
		const nested = join(root, 'Playlist', 'Season 1')
		expect(await checkWritableDirectory(nested)).toEqual({ok: true})
		expect((await stat(nested)).isDirectory()).toBe(true)
	})

	it.runIf(canDenyWrites)('rejects a read-only directory with the OS error', async () => {
		await chmod(root, 0o555)
		const result = await checkWritableDirectory(root)
		expect(result.ok).toBe(false)
		if (!result.ok) expect(result.error).toMatch(/EACCES|permission denied/i)
	})

	it.runIf(canDenyWrites)('rejects a missing subfolder under a read-only directory', async () => {
		await chmod(root, 0o555)
		const result = await checkWritableDirectory(join(root, 'Playlist'))
		expect(result.ok).toBe(false)
	})
})
