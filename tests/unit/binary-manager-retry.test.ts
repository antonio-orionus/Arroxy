import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {BinaryManager} from '@main/services/BinaryManager.js'
import type {RuntimeBinaryIndexProvider} from '@main/services/binary/RuntimeBinaryIndexService.js'
import type {RuntimeBinaryMaterializer} from '@main/services/binary/RuntimeBinaryMaterializer.js'
import type {DependencyDiagnostic, DependencyId, DependencySource, RuntimeBinaryManifestEntry} from '@shared/types.js'

function entry(patch: Partial<RuntimeBinaryManifestEntry> = {}): RuntimeBinaryManifestEntry {
	return {id: 'yt-dlp', channel: 'nightly', provider: 'github', version: '2026.06.12', platform: 'linux', arch: 'x64', url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux', mirrors: [], size: 10, sha256: 'a'.repeat(64), format: 'raw', executablePath: 'yt-dlp', ...patch}
}

async function tempDir(prefix = 'bm-manifest-'): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), prefix))
}

function indexProvider(entries: RuntimeBinaryManifestEntry[]): RuntimeBinaryIndexProvider {
	return {candidatesFor: vi.fn(async id => entries.filter(candidate => candidate.id === id))}
}

function materializer(run: (candidate: RuntimeBinaryManifestEntry) => Promise<string>): RuntimeBinaryMaterializer {
	return {materialize: vi.fn(async candidate => ({executablePath: await run(candidate), cacheKey: `${candidate.id}-${candidate.channel}-${candidate.provider}`, metadataPath: '/metadata.json', manifest: candidate}))} as unknown as RuntimeBinaryMaterializer
}

async function makeMgr(options: {entries?: RuntimeBinaryManifestEntry[]; materialize?: (candidate: RuntimeBinaryManifestEntry) => Promise<string>} = {}): Promise<BinaryManager> {
	const dir = await tempDir()
	return new BinaryManager(dir, {runtimeBinaryIndex: indexProvider(options.entries ?? []), runtimeBinaryMaterializer: materializer(options.materialize ?? (async candidate => `/managed/${candidate.id}-${candidate.channel}-${candidate.provider}`))})
}

function stubProbe(mgr: BinaryManager, options: {acceptSystemPath?: boolean; acceptManaged?: boolean} = {}): void {
	const {acceptSystemPath = true, acceptManaged = true} = options
	vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (id, source, candidatePath, attempts) => {
		if (source.kind === 'systemPath' && !acceptSystemPath) {
			attempts.push({source, failure: {kind: 'spawn_failed', message: 'system PATH disabled for test'}})
			return null
		}
		if (source.kind === 'managed' && !acceptManaged) {
			attempts.push({source, failure: {kind: 'spawn_failed', message: 'managed disabled for test'}})
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

describe('BinaryManager manifest resolution', () => {
	it('keeps manual and env overrides ahead of manifest candidates', async () => {
		const managed = entry()
		const mgr = await makeMgr({entries: [managed]})
		stubProbe(mgr)
		const materialize = (mgr as unknown as {runtimeBinaryMaterializer: {materialize: ReturnType<typeof vi.fn>}}).runtimeBinaryMaterializer.materialize

		await expect(mgr.resolveYtDlp({overrides: {ytDlp: '/manual/yt-dlp'}})).resolves.toMatchObject({source: {kind: 'manualOverride'}})
		expect(materialize).not.toHaveBeenCalled()
	})

	it('tries approved yt-dlp manifest candidates in order', async () => {
		const candidates = [
			entry({channel: 'nightly', provider: 'github', url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux', sha256: 'a'.repeat(64)}),
			entry({channel: 'stable', provider: 'github', url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.10/yt-dlp_linux', sha256: 'b'.repeat(64)}),
			entry({channel: 'stable', provider: 'sourceforge', url: 'https://sourceforge.net/projects/yt-dlp.mirror/files/2026.06.10/yt-dlp_linux/download', sha256: 'c'.repeat(64)})
		]
		const attempted: string[] = []
		const mgr = await makeMgr({
			entries: candidates,
			materialize: async candidate => {
				attempted.push(candidate.url)
				if (candidate.provider !== 'sourceforge') throw new Error('candidate unavailable')
				return '/managed/sourceforge/yt-dlp'
			}
		})
		stubProbe(mgr, {acceptSystemPath: false})

		await expect(mgr.ensureYtDlp()).resolves.toBe('/managed/sourceforge/yt-dlp')
		expect(attempted).toEqual(candidates.map(candidate => candidate.url))
	})

	it('falls through current manifest entries to a previous known-good candidate', async () => {
		const current = entry({version: '2026.06.12', sha256: 'a'.repeat(64)})
		const previous = entry({version: '2026.06.10', sha256: 'b'.repeat(64), url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.10/yt-dlp_linux'})
		const mgr = await makeMgr({
			entries: [current, previous],
			materialize: async candidate => {
				if (candidate.version === current.version) throw new Error('new artifact unavailable')
				return '/managed/previous/yt-dlp'
			}
		})
		stubProbe(mgr, {acceptSystemPath: false})

		await expect(mgr.ensureYtDlp()).resolves.toBe('/managed/previous/yt-dlp')
	})

	it('uses cached deno before manifest materialization', async () => {
		const userData = await tempDir('bm-deno-cache-')
		const denoEntry = entry({id: 'deno', channel: 'default', provider: 'deno-land', url: 'https://dl.deno.land/release/v2.8.3/deno-x86_64-unknown-linux-gnu.zip', format: 'zip', executablePath: 'deno'})
		const mgr = new BinaryManager(userData, {runtimeBinaryIndex: indexProvider([denoEntry]), runtimeBinaryMaterializer: materializer(async () => '/managed/deno')})
		const denoPath = mgr.getDenoPath()
		await fs.mkdir(path.dirname(denoPath), {recursive: true})
		await fs.writeFile(denoPath, 'fake-deno')
		if (process.platform !== 'win32') await fs.chmod(denoPath, 0o755)
		stubProbe(mgr)
		const materialize = (mgr as unknown as {runtimeBinaryMaterializer: {materialize: ReturnType<typeof vi.fn>}}).runtimeBinaryMaterializer.materialize

		await expect(mgr.ensureDeno()).resolves.toBe(denoPath)
		expect(materialize).not.toHaveBeenCalled()
	})

	it('resolves deno from approved manifest entries without upstream latest lookup', async () => {
		const denoEntry = entry({id: 'deno', channel: 'default', provider: 'deno-land', url: 'https://dl.deno.land/release/v2.8.3/deno-x86_64-unknown-linux-gnu.zip', format: 'zip', executablePath: 'deno'})
		const mgr = await makeMgr({entries: [denoEntry], materialize: async () => '/managed/deno'})
		stubProbe(mgr)

		await expect(mgr.ensureDeno()).resolves.toBe('/managed/deno')
	})

	it('does not probe a packaged-resource deno path', async () => {
		const mgr = await makeMgr()
		const acceptedSources: DependencySource[] = []
		vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (_id, source, _candidatePath, attempts) => {
			acceptedSources.push(source)
			attempts.push({source, failure: {kind: 'spawn_failed', message: 'not usable in this test'}})
			return null
		})

		await expect(mgr.ensureDeno()).rejects.toThrow()
		expect(acceptedSources.some(source => source.kind === 'bundled')).toBe(false)
	})

	it('falls back to ffmpeg and ffprobe on PATH when bundled binaries are unusable', async () => {
		const temp = await tempDir('bm-path-')
		const exeExt = process.platform === 'win32' ? '.exe' : ''
		const ffmpegPath = path.join(temp, `ffmpeg${exeExt}`)
		const ffprobePath = path.join(temp, `ffprobe${exeExt}`)
		await fs.writeFile(ffmpegPath, 'fake-ffmpeg')
		await fs.writeFile(ffprobePath, 'fake-ffprobe')
		if (process.platform !== 'win32') {
			await fs.chmod(ffmpegPath, 0o755)
			await fs.chmod(ffprobePath, 0o755)
		}
		const originalPath = process.env.PATH
		process.env.PATH = `${temp}${path.delimiter}${originalPath ?? ''}`
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
