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

	it('throws after exhausting all 3 attempts on every fallback', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr, {acceptSystemPath: false})

		let calls = 0
		spyOnPrivate(mgr, 'attemptDownload').mockImplementation(async () => {
			calls++
			throw new Error('HTTP 503')
		})

		await expect(mgr.ensureYtDlp()).rejects.toThrow()
		// 3 attempts on nightly + 3 on stable.
		expect(calls).toBe(6)
	})

	it('does not retry on checksum mismatch — fails fast and falls through', async () => {
		const mgr = await makeMgr()
		stubProbe(mgr, {acceptSystemPath: false})

		let calls = 0
		spyOnPrivate(mgr, 'attemptDownload').mockImplementation(async () => {
			calls++
			throw new Error('yt-dlp checksum mismatch. Expected abcd1234..., got deadbeef...')
		})

		await expect(mgr.ensureYtDlp()).rejects.toThrow()
		// Checksum errors don't retry within ensureBinary, but the resolve chain
		// still falls through nightly → stable. So 1 call per managed source.
		expect(calls).toBe(2)
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
})
