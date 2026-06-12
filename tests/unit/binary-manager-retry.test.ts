import {createHash} from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {BinaryManager, type RuntimeBinaryMaterializerPort} from '@main/services/BinaryManager.js'
import type {RuntimeBinaryIndexProvider} from '@main/services/binary/RuntimeBinaryIndexService.js'
import {runtimeBinaryCacheKeyHash, runtimeBinaryManifestHash} from '@main/services/binary/RuntimeBinaryMaterializer.js'
import {runtimeBinaryArchFor, runtimeBinaryPlatformFor} from '@shared/runtimeBinaryManifest.js'
import type {DependencyDiagnostic, DependencyId, DependencySource, RuntimeBinaryManifestEntry} from '@shared/types.js'

function entry(patch: Partial<RuntimeBinaryManifestEntry> = {}): RuntimeBinaryManifestEntry {
	const platform = runtimeBinaryPlatformFor()
	const arch = runtimeBinaryArchFor()
	if (!platform || !arch) throw new Error('unsupported test platform')
	return {id: 'yt-dlp', channel: 'nightly', provider: 'github', version: '2026.06.12', platform, arch, url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux', mirrors: [], size: 10, sha256: 'a'.repeat(64), format: 'raw', executablePath: 'yt-dlp', ...patch}
}

async function tempDir(prefix = 'bm-manifest-'): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), prefix))
}

function indexProvider(entries: RuntimeBinaryManifestEntry[]): RuntimeBinaryIndexProvider {
	return {candidatesFor: vi.fn(async id => entries.filter(candidate => candidate.id === id))}
}

function materializer(run: (candidate: RuntimeBinaryManifestEntry) => Promise<string>): RuntimeBinaryMaterializerPort {
	return {materialize: vi.fn(async candidate => ({executablePath: await run(candidate), cacheKey: `${candidate.id}-${candidate.channel}-${candidate.provider}`, metadataPath: '/metadata.json', manifest: candidate}))}
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

function sha256(body: Buffer): string {
	return createHash('sha256').update(body).digest('hex')
}

async function writeManagedCache(userData: string, manifestEntry: RuntimeBinaryManifestEntry, body: Buffer): Promise<string> {
	const cacheKey = runtimeBinaryCacheKeyHash(manifestEntry)
	const artifactDir = path.join(userData, 'runtime-cache', 'artifact-cache-v1', 'artifacts', cacheKey)
	const executablePath = path.join(artifactDir, manifestEntry.executablePath)
	await fs.mkdir(path.dirname(executablePath), {recursive: true})
	await fs.writeFile(executablePath, body)
	if (process.platform !== 'win32') await fs.chmod(executablePath, 0o755)
	await fs.writeFile(
		path.join(artifactDir, 'metadata.json'),
		`${JSON.stringify({cacheKey, manifest: manifestEntry, manifestHash: runtimeBinaryManifestHash(manifestEntry), executablePath: manifestEntry.executablePath, executableSize: body.length, executableSha256: sha256(body), installedAt: new Date().toISOString()}, null, 2)}\n`,
		'utf-8'
	)
	return executablePath
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

	it('uses a validated managed artifact cache before PATH when no manifest candidate is available', async () => {
		const userData = await tempDir('bm-ytdlp-managed-cache-')
		const body = Buffer.from('cached official yt-dlp')
		const executablePath = await writeManagedCache(userData, entry({size: body.length, sha256: sha256(body)}), body)
		const mgr = new BinaryManager(userData, {runtimeBinaryIndex: indexProvider([]), runtimeBinaryMaterializer: materializer(async () => '/unused')})
		stubProbe(mgr, {acceptSystemPath: false})

		const diag = await mgr.resolveYtDlp()

		expect(diag.resolvedPath).toBe(executablePath)
		expect(diag.source).toEqual({kind: 'managedCache', channel: 'nightly', provider: 'github', url: expect.any(String), path: executablePath})
	})

	it('rejects a managed artifact cache whose raw executable no longer matches its manifest hash', async () => {
		const userData = await tempDir('bm-ytdlp-corrupt-managed-cache-')
		const body = Buffer.from('cached official yt-dlp')
		const executablePath = await writeManagedCache(userData, entry({size: body.length, sha256: sha256(body)}), body)
		await fs.writeFile(executablePath, 'tampered')
		const mgr = new BinaryManager(userData, {runtimeBinaryIndex: indexProvider([]), runtimeBinaryMaterializer: materializer(async () => '/unused')})
		const acceptedSources: DependencySource[] = []
		vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<DependencyDiagnostic | null>}, 'probeAndAccept').mockImplementation(async (_id, source, _candidatePath, attempts) => {
			acceptedSources.push(source)
			attempts.push({source, failure: {kind: 'spawn_failed', message: 'disabled for test'}})
			return null
		})

		await expect(mgr.ensureYtDlp()).rejects.toThrow()
		expect(acceptedSources.some(source => source.kind === 'managedCache')).toBe(false)
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
