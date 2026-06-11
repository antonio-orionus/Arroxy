import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {BinaryManager} from '@main/services/BinaryManager.js'
import type {DependencyDiagnostic, DependencyId, DependencySource} from '@shared/types.js'

async function makeMgr(): Promise<BinaryManager> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-retry-'))
	// Zero delays so tests run instantly
	return new BinaryManager(dir, {retryDelays: [0, 0]})
}

// Spy on a private method without TS complaining about access.
function spyOnPrivate(target: BinaryManager, method: string): ReturnType<typeof vi.spyOn> {
	return vi.spyOn(target as unknown as Record<string, (...args: unknown[]) => unknown>, method)
}

// Stub probe instead of spawning a real binary. Retry tests only exercise the
// inner attemptDownload retry loop; probe success is asserted elsewhere. Tests
// that expect managed resolution to fail can reject system PATH candidates so
// host-installed binaries do not affect the outcome.
function stubProbe(mgr: BinaryManager, options: {acceptSystemPath?: boolean} = {}): void {
	const {acceptSystemPath = true} = options
	vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (id, source, candidatePath, attempts) => {
		if (source.kind === 'systemPath' && !acceptSystemPath) {
			attempts.push({source, failure: {kind: 'spawn_failed', message: 'system PATH disabled for retry test'}})
			return null
		}
		attempts.push({source})
		;(mgr as unknown as {resolved: Record<string, string>}).resolved[id] = candidatePath
		return {id, state: 'runnable', source, resolvedPath: candidatePath, attempts: attempts as never}
	})
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('BinaryManager download retry', () => {
	it('retries once on network error and succeeds on second attempt', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr, {acceptSystemPath: false})

		let calls = 0
		spyOnPrivate(mgr, 'attemptDownload').mockImplementation(async () => {
			calls++
			if (calls === 1) throw new Error('connect ECONNREFUSED')
		})

		await mgr.ensureYtDlp()
		expect(calls).toBe(2)
	})

	it('throws after exhausting all 3 attempts on every managed yt-dlp source', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr, {acceptSystemPath: false})

		let calls = 0
		spyOnPrivate(mgr, 'attemptDownload').mockImplementation(async () => {
			calls++
			throw new Error('HTTP 503')
		})
		spyOnPrivate(mgr, 'getSourceForgeLatestYtDlpVersion').mockResolvedValue('2026.06.09')

		await expect(mgr.ensureYtDlp()).rejects.toThrow()
		// 3 attempts on nightly GitHub + 3 on stable GitHub + 3 on stable SourceForge.
		expect(calls).toBe(9)
	})

	it('does not retry on checksum mismatch — fails fast and falls through', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr, {acceptSystemPath: false})

		let calls = 0
		spyOnPrivate(mgr, 'attemptDownload').mockImplementation(async () => {
			calls++
			throw new Error('yt-dlp checksum mismatch. Expected abcd1234..., got deadbeef...')
		})
		spyOnPrivate(mgr, 'getSourceForgeLatestYtDlpVersion').mockResolvedValue('2026.06.09')

		await expect(mgr.ensureYtDlp()).rejects.toThrow()
		// Checksum errors don't retry within ensureBinary, but the resolve chain
		// still falls through nightly → stable GitHub → stable SourceForge.
		expect(calls).toBe(3)
	})

	it('falls back to the SourceForge stable mirror after GitHub yt-dlp sources fail', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr, {acceptSystemPath: false})
		const urls: string[] = []

		spyOnPrivate(mgr, 'attemptDownload').mockImplementation(async (config: {downloadUrl: string}) => {
			const downloadUrl = config.downloadUrl
			urls.push(downloadUrl)
			if (!downloadUrl.includes('sourceforge.net/projects/yt-dlp.mirror')) {
				throw new Error('GitHub release asset failed')
			}
		})
		spyOnPrivate(mgr, 'getSourceForgeLatestYtDlpVersion').mockResolvedValue('2026.06.09')

		await expect(mgr.ensureYtDlp()).resolves.toContain('yt-dlp-stable')
		const firstNightly = urls.findIndex(url => url.includes('yt-dlp-nightly-builds'))
		const firstStableGithub = urls.findIndex(url => url.includes('github.com/yt-dlp/yt-dlp/releases/latest/download'))
		const firstSourceForge = urls.findIndex(url => url.includes('sourceforge.net/projects/yt-dlp.mirror/files/'))
		expect(firstNightly).toBeGreaterThanOrEqual(0)
		expect(firstStableGithub).toBeGreaterThan(firstNightly)
		expect(firstSourceForge).toBeGreaterThan(firstStableGithub)
	})

	it('uses cached deno before managed downloads', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-deno-cache-'))
		const mgr = new BinaryManager(tempDir, {retryDelays: [0, 0]})
		const denoPath = mgr.getDenoPath()
		await fs.mkdir(path.dirname(denoPath), {recursive: true})
		await fs.writeFile(denoPath, 'fake-deno')
		if (process.platform !== 'win32') await fs.chmod(denoPath, 0o755)
		const acceptedSources: DependencySource[] = []
		vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (id, source, candidatePath, attempts) => {
			acceptedSources.push(source)
			attempts.push({source})
			return {id, state: 'runnable', source, resolvedPath: candidatePath, attempts: attempts as never}
		})
		const downloadSpy = spyOnPrivate(mgr, 'tryManagedDownload')

		await expect(mgr.ensureDeno()).resolves.toBe(denoPath)

		expect(acceptedSources[0]).toEqual({kind: 'cache', path: denoPath})
		expect(downloadSpy).not.toHaveBeenCalled()
	})

	it('does not probe a packaged-resource deno path', async () => {
		const mgr = await makeMgr()
		const acceptedSources: DependencySource[] = []
		vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (_id, source, _candidatePath, attempts) => {
			acceptedSources.push(source)
			attempts.push({source, failure: {kind: 'spawn_failed', message: 'not usable in this test'}})
			return null
		})
		spyOnPrivate(mgr, 'getDenoLandLatestVersion').mockResolvedValue(null)
		spyOnPrivate(mgr, 'tryManagedDownload').mockResolvedValue(false)

		await expect(mgr.ensureDeno()).rejects.toThrow()

		expect(acceptedSources.some(source => source.kind === 'bundled')).toBe(false)
	})

	it('resolves deno from managed runtime downloads', async () => {
		const mgr = await makeMgr()
		const probeSources: DependencySource[] = []
		vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (id, source, candidatePath, attempts) => {
			probeSources.push(source)
			if (source.kind !== 'managed') {
				attempts.push({source, failure: {kind: 'spawn_failed', message: 'not usable in this test'}})
				return null
			}
			attempts.push({source})
			return {id, state: 'runnable', source, resolvedPath: candidatePath, attempts: attempts as never}
		})
		spyOnPrivate(mgr, 'getDenoLandLatestVersion').mockResolvedValue('v2.8.2')
		spyOnPrivate(mgr, 'tryManagedDownload').mockResolvedValue(true)

		await expect(mgr.ensureDeno()).resolves.toContain('deno')

		expect(probeSources.at(-1)).toMatchObject({kind: 'managed', provider: 'deno-land'})
	})

	it('skips download when binary exists and version is current', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr)
		const binaryPath = mgr.getYtDlpPath()
		await fs.mkdir(path.dirname(binaryPath), {recursive: true})
		await fs.writeFile(binaryPath, 'fake-binary')
		if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755)

		spyOnPrivate(mgr, 'getLocalYtDlpVersion').mockResolvedValue('2025.01.15')
		spyOnPrivate(mgr, 'getRemoteYtDlpVersion').mockResolvedValue({tag: '2025.01.15', reason: null})

		const spy = spyOnPrivate(mgr, 'attemptDownload')
		await mgr.ensureYtDlp()

		expect(spy).not.toHaveBeenCalled()
	})

	it('re-downloads yt-dlp when local version is outdated', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr)
		const binaryPath = mgr.getYtDlpPath()
		await fs.mkdir(path.dirname(binaryPath), {recursive: true})
		await fs.writeFile(binaryPath, 'fake-binary')
		if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755)

		spyOnPrivate(mgr, 'getLocalYtDlpVersion').mockResolvedValue('2024.11.01')
		spyOnPrivate(mgr, 'getRemoteYtDlpVersion').mockResolvedValue({tag: '2025.01.15', reason: null})

		const spy = spyOnPrivate(mgr, 'attemptDownload').mockResolvedValue(undefined)
		await mgr.ensureYtDlp()

		expect(spy).toHaveBeenCalledOnce()
	})

	it('keeps the existing yt-dlp when an update download fails', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr)
		const binaryPath = mgr.getYtDlpPath()
		await fs.mkdir(path.dirname(binaryPath), {recursive: true})
		await fs.writeFile(binaryPath, 'fake-binary')
		if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755)

		spyOnPrivate(mgr, 'getLocalYtDlpVersion').mockResolvedValue('2024.11.01')
		spyOnPrivate(mgr, 'getRemoteYtDlpVersion').mockResolvedValue({tag: '2025.01.15', reason: null})
		spyOnPrivate(mgr, 'attemptDownload').mockRejectedValue(new Error('HTTP 503'))

		await expect(mgr.ensureYtDlp()).resolves.toBe(binaryPath)
	})

	it('re-downloads yt-dlp when local version cannot be determined', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr)
		const binaryPath = mgr.getYtDlpPath()
		await fs.mkdir(path.dirname(binaryPath), {recursive: true})
		await fs.writeFile(binaryPath, 'fake-binary')
		if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755)

		spyOnPrivate(mgr, 'getLocalYtDlpVersion').mockResolvedValue(null)
		spyOnPrivate(mgr, 'getRemoteYtDlpVersion').mockResolvedValue({tag: '2025.01.15', reason: null})

		const spy = spyOnPrivate(mgr, 'attemptDownload').mockResolvedValue(undefined)
		await mgr.ensureYtDlp()

		expect(spy).toHaveBeenCalledOnce()
	})

	it('skips download when remote version is unreachable', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr)
		const binaryPath = mgr.getYtDlpPath()
		await fs.mkdir(path.dirname(binaryPath), {recursive: true})
		await fs.writeFile(binaryPath, 'fake-binary')
		if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755)

		spyOnPrivate(mgr, 'getLocalYtDlpVersion').mockResolvedValue('2025.01.15')
		spyOnPrivate(mgr, 'getRemoteYtDlpVersion').mockResolvedValue({tag: null, reason: 'rate_limited'})

		const spy = spyOnPrivate(mgr, 'attemptDownload')
		await mgr.ensureYtDlp()

		expect(spy).not.toHaveBeenCalled()
	})

	it('does not version-check ffmpeg on Linux (no isUpToDate configured)', async () => {
		if (process.platform === 'win32') return // Windows uses pair download, not single ffmpeg
		const mgr = await makeMgr()
		stubProbe(mgr)
		const ffmpegPath = mgr.getFfmpegPath()
		const ffprobePath = mgr.getFfprobePath()
		await fs.mkdir(path.dirname(ffmpegPath), {recursive: true})
		await fs.writeFile(ffmpegPath, 'fake-ffmpeg')
		await fs.writeFile(ffprobePath, 'fake-ffprobe')
		await fs.chmod(ffmpegPath, 0o755)
		await fs.chmod(ffprobePath, 0o755)

		const spy = spyOnPrivate(mgr, 'attemptDownload')
		await mgr.ensureFFmpeg()

		expect(spy).not.toHaveBeenCalled()
	})

	it('falls back to ffmpeg and ffprobe on PATH when bundled binaries are unusable', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-path-'))
		const exeExt = process.platform === 'win32' ? '.exe' : ''
		const ffmpegPath = path.join(tempDir, `ffmpeg${exeExt}`)
		const ffprobePath = path.join(tempDir, `ffprobe${exeExt}`)
		await fs.writeFile(ffmpegPath, 'fake-ffmpeg')
		await fs.writeFile(ffprobePath, 'fake-ffprobe')
		if (process.platform !== 'win32') {
			await fs.chmod(ffmpegPath, 0o755)
			await fs.chmod(ffprobePath, 0o755)
		}
		const originalPath = process.env.PATH
		process.env.PATH = `${tempDir}${path.delimiter}${originalPath ?? ''}`
		try {
			const mgr = await makeMgr()
			vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (id, source, candidatePath, attempts) => {
				if (source.kind !== 'systemPath') {
					attempts.push({source, failure: {kind: 'spawn_failed', message: 'bundled disabled for test'}})
					return null
				}
				attempts.push({source})
				return {id, state: 'runnable', source, resolvedPath: candidatePath, attempts: attempts as never}
			})

			const result = await mgr.resolveFFmpegPair()

			expect(result.ffmpeg.source).toEqual({kind: 'systemPath', path: ffmpegPath})
			expect(result.ffprobe.source).toEqual({kind: 'systemPath', path: ffprobePath})
		} finally {
			process.env.PATH = originalPath
		}
	})
})
