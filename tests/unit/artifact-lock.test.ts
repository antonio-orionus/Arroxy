import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {ArtifactMaterializeError, artifactErrorToDependencyFailureKind, withArtifactLock} from '@main/services/binary/ArtifactInstall.js'

let root: string

beforeEach(async () => {
	root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-artifact-lock-'))
})

afterEach(async () => {
	await fs.rm(root, {recursive: true, force: true})
})

// A lock owned by this (live) process is never stale, so a second caller polls.
async function holdLiveLock(cacheKey: string): Promise<void> {
	const lockDir = path.join(root, 'locks', cacheKey)
	await fs.mkdir(lockDir, {recursive: true})
	await fs.writeFile(path.join(lockDir, 'owner.json'), JSON.stringify({pid: process.pid, createdAt: new Date().toISOString()}))
}

describe('withArtifactLock', () => {
	it('stops polling a held lock as soon as the caller cancels', async () => {
		await holdLiveLock('busy')
		const controller = new AbortController()
		const waiting = withArtifactLock(root, 'busy', controller.signal, 60_000, () => Promise.resolve('ran'))
		setTimeout(() => controller.abort(new Error('user cancelled')), 50)

		const err = await waiting.catch((error: unknown) => error)

		expect(err).toBeInstanceOf(ArtifactMaterializeError)
		expect(err).toMatchObject({code: 'CANCELLED', message: 'user cancelled'})
	})

	it('runs once the holder releases the lock', async () => {
		await holdLiveLock('busy')
		setTimeout(() => void fs.rm(path.join(root, 'locks', 'busy'), {recursive: true, force: true}), 50)

		await expect(withArtifactLock(root, 'busy', undefined, 60_000, () => Promise.resolve('ran'))).resolves.toBe('ran')
		await expect(fs.readdir(path.join(root, 'locks'))).resolves.toEqual([])
	})

	// A cache folder Arroxy may not write is a permission problem; reporting it
	// as LOCK made it ARX-008, "a tool took too long… security scan".
	it.skipIf(process.platform === 'win32')('reports a lock folder it cannot create as a permission failure, not a timeout', async () => {
		const locks = path.join(root, 'locks')
		await fs.mkdir(locks, {recursive: true})
		await fs.chmod(locks, 0o500)
		try {
			const failure = await withArtifactLock(root, 'yt-dlp', undefined, 1_000, () => Promise.resolve()).then(
				() => null,
				(error: unknown) => error
			)
			expect(failure).toBeInstanceOf(ArtifactMaterializeError)
			expect(artifactErrorToDependencyFailureKind(failure)).toBe('permission_denied')
		} finally {
			await fs.chmod(locks, 0o700)
		}
	})
})
