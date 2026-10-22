// @vitest-environment node
// What the warmup report asks BinaryManager: is anything managed on disk yet
// (a first setup or an update), and where did the binary manifest come from.
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi} from 'vite-plus/test'
import {BinaryManager} from '@main/services/BinaryManager.js'
import type {RuntimeBinaryIndexProvider} from '@main/services/binary/RuntimeBinaryIndexService.js'
import type {FfmpegPackageEntry} from '@shared/types.js'

async function makeMgr(opts: {installed?: FfmpegPackageEntry[] | Error; index?: Partial<RuntimeBinaryIndexProvider>} = {}): Promise<{mgr: BinaryManager; dir: string}> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-managed-install-'))
	const runtimeBinaryIndex: RuntimeBinaryIndexProvider = {candidatesFor: vi.fn(async () => []), ffmpegPackageCandidates: vi.fn(async () => []), invalidate: vi.fn(), ...opts.index}
	const mgr = new BinaryManager(dir, {runtimeBinaryIndex, ffmpegPackageMaterializer: {materialize: vi.fn(), prune: vi.fn(), installed: vi.fn(async () => (opts.installed instanceof Error ? Promise.reject(opts.installed) : (opts.installed ?? [])))}})
	return {mgr, dir}
}

describe('BinaryManager.hasManagedInstall', () => {
	it('is false on an install with nothing managed on disk', async () => {
		const {mgr} = await makeMgr()
		await expect(mgr.hasManagedInstall()).resolves.toBe(false)
	})

	it('is true once a managed yt-dlp build is installed', async () => {
		const {mgr, dir} = await makeMgr()
		await fs.mkdir(path.join(dir, 'runtime-cache', 'artifact-cache-v1', 'artifacts', 'abc123'), {recursive: true})
		await expect(mgr.hasManagedInstall()).resolves.toBe(true)
	})

	it('is true once an FFmpeg package is installed', async () => {
		const {mgr} = await makeMgr({installed: [{} as FfmpegPackageEntry]})
		await expect(mgr.hasManagedInstall()).resolves.toBe(true)
	})

	it('fails, rather than reporting an empty install, when the cache cannot be read', async () => {
		const {mgr, dir} = await makeMgr()
		// A file where the folder should be: ENOTDIR, not "nothing there".
		await fs.mkdir(path.join(dir, 'runtime-cache', 'artifact-cache-v1'), {recursive: true})
		await fs.writeFile(path.join(dir, 'runtime-cache', 'artifact-cache-v1', 'artifacts'), '')
		await expect(mgr.hasManagedInstall()).rejects.toThrow()

		const {mgr: unreadablePackages} = await makeMgr({installed: new Error('EACCES')})
		await expect(unreadablePackages.hasManagedInstall()).rejects.toThrow('EACCES')
	})

	it('ignores hidden files a file manager leaves behind', async () => {
		const {mgr, dir} = await makeMgr()
		const artifacts = path.join(dir, 'runtime-cache', 'artifact-cache-v1', 'artifacts')
		await fs.mkdir(artifacts, {recursive: true})
		await fs.writeFile(path.join(artifacts, '.DS_Store'), '')
		await expect(mgr.hasManagedInstall()).resolves.toBe(false)
	})
})

describe('BinaryManager.binaryManifestSource', () => {
	it('passes on where the binary manifest came from, or null before one is chosen', async () => {
		expect((await makeMgr()).mgr.binaryManifestSource()).toBeNull()
		expect((await makeMgr({index: {selectedSource: () => 'bundled'}})).mgr.binaryManifestSource()).toBe('bundled')
	})
})
