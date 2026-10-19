// Release builds ship no FFmpeg: both binaries come from one approved package.
// These tests hold the pair resolver to that contract.

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {app} from 'electron'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {BinaryManager, type FfmpegPackageMaterializerPort, type PathLookup, type ProbeOutcome} from '@main/services/BinaryManager.js'
import {ArtifactMaterializeError} from '@main/services/binary/ArtifactInstall.js'
import type {FfmpegPackageInstall} from '@main/services/binary/FfmpegPackageMaterializer.js'
import type {RuntimeBinaryIndexProvider} from '@main/services/binary/RuntimeBinaryIndexService.js'
import type {ProbeVerdictStore} from '@main/services/binary/ProbeVerdictCache.js'
import {isEnvironmentFatalFailure} from '@shared/dependencyPolicy.js'
import {runtimeBinaryArchFor, runtimeBinaryPlatformFor} from '@shared/runtimeBinaryManifest.js'
import type {DependencyFailureKind, DependencyId, DependencySource, FfmpegPackageEntry, WarmupProgressEvent} from '@shared/types.js'

function pkg(version: string): FfmpegPackageEntry {
	const platform = runtimeBinaryPlatformFor()
	const arch = runtimeBinaryArchFor()
	if (!platform || !arch) throw new Error('unsupported test platform')
	return {
		id: 'ffmpeg',
		version,
		platform,
		arch,
		url: `https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-${version}/pkg.tar.br`,
		mirrors: [],
		size: 10,
		sha256: 'a'.repeat(64),
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: 1},
			{path: 'ffprobe', size: 1}
		],
		links: []
	}
}

function installOf(entry: FfmpegPackageEntry): FfmpegPackageInstall {
	const rootDir = `/packages/${entry.version}`
	return {entry, cacheKey: entry.version, rootDir, ffmpegPath: `${rootDir}/ffmpeg`, ffprobePath: `${rootDir}/ffprobe`}
}

const noProbeMemo: ProbeVerdictStore = {get: async () => null, record: async () => undefined, forget: async () => undefined, clear: async () => undefined}

async function makeMgr(packages: FfmpegPackageEntry[], ffmpegPackageMaterializer: FfmpegPackageMaterializerPort, pathLookup: PathLookup = async () => []): Promise<BinaryManager> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-ffmpeg-package-'))
	const runtimeBinaryIndex: RuntimeBinaryIndexProvider = {candidatesFor: vi.fn(async () => []), ffmpegPackageCandidates: vi.fn(async () => packages)}
	return new BinaryManager(dir, {runtimeBinaryIndex, ffmpegPackageMaterializer, probeVerdicts: noProbeMemo, pathLookup, overridesProvider: () => undefined})
}

function stubProbes(mgr: BinaryManager, verdict: (id: DependencyId, source: DependencySource, candidatePath: string) => DependencyFailureKind | 'ok'): string[] {
	const probed: string[] = []
	vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<ProbeOutcome>}, 'probeAndAccept').mockImplementation(async (id, source, candidatePath, attempts) => {
		probed.push(`${id}:${candidatePath}`)
		const kind = verdict(id, source, candidatePath)
		if (kind === 'ok') {
			attempts.push({source})
			return {kind: 'accepted', diagnostic: {id, state: 'runnable', source, resolvedPath: candidatePath, attempts: attempts as never}}
		}
		attempts.push({source, failure: {kind, message: `${kind} for test`}})
		return isEnvironmentFatalFailure(kind, source) ? {kind: 'environmentFatal'} : {kind: 'rejected'}
	})
	return probed
}

describe('BinaryManager FFmpeg package resolution', () => {
	beforeEach(() => {
		Object.assign(app, {isPackaged: true})
		vi.stubEnv('ARROXY_FFMPEG_PATH', '')
		vi.stubEnv('ARROXY_FFPROBE_PATH', '')
	})
	afterEach(() => {
		Object.assign(app, {isPackaged: false})
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('resolves both binaries from one installed package and prunes older versions', async () => {
		const materialize = vi.fn(async (entry: FfmpegPackageEntry) => installOf(entry))
		const prune = vi.fn(async () => [])
		const mgr = await makeMgr([pkg('N-2')], {materialize, prune})
		stubProbes(mgr, () => 'ok')

		const pair = await mgr.resolveFFmpegPair()

		expect(materialize).toHaveBeenCalledTimes(1)
		expect(pair.ffmpeg.resolvedPath).toBe('/packages/N-2/ffmpeg')
		expect(pair.ffprobe.resolvedPath).toBe('/packages/N-2/ffprobe')
		expect(pair.ffmpeg.source).toEqual({kind: 'managed', channel: 'default', provider: 'github', url: pkg('N-2').url})
		await vi.waitFor(() => expect(prune).toHaveBeenCalledWith(pkg('N-2'), expect.objectContaining({cacheRoot: expect.any(String)})))
	})

	it('reports the one package download on a single row so the splash counts its bytes once', async () => {
		const materialize = vi.fn(async (entry: FfmpegPackageEntry, options: Parameters<FfmpegPackageMaterializerPort['materialize']>[1]) => {
			options.onDownloadProgress?.(5, 10)
			options.onExtracting?.()
			return installOf(entry)
		})
		const mgr = await makeMgr([pkg('N-2')], {materialize, prune: vi.fn(async () => [])})
		stubProbes(mgr, () => 'ok')
		const events: WarmupProgressEvent[] = []

		await mgr.resolveFFmpegPair({onProgress: event => events.push(event)})

		const transfer = events.filter(event => event.phase === 'downloading' || event.phase === 'extracting')
		expect(transfer.length).toBeGreaterThan(0)
		expect(new Set(transfer.map(event => event.binary))).toEqual(new Set(['ffmpeg']))
		expect(events.filter(event => event.bytesDownloaded === 5)).toHaveLength(1)
	})

	// A proxy or mirror can strip Content-Length. Without a total the splash had
	// neither a bar nor a byte count, so the manifest's exact size stands in.
	it('reports the manifest size as the total when the server sends none', async () => {
		const materialize = vi.fn(async (entry: FfmpegPackageEntry, options: Parameters<FfmpegPackageMaterializerPort['materialize']>[1]) => {
			options.onDownloadProgress?.(5, undefined)
			return installOf(entry)
		})
		const mgr = await makeMgr([pkg('N-2')], {materialize, prune: vi.fn(async () => [])})
		stubProbes(mgr, () => 'ok')
		const events: WarmupProgressEvent[] = []

		await mgr.resolveFFmpegPair({onProgress: event => events.push(event)})

		expect(events.find(event => event.bytesDownloaded === 5)?.totalBytes).toBe(pkg('N-2').size)
	})

	it('falls back to the next approved package when one cannot be installed', async () => {
		const materialize = vi.fn(async (entry: FfmpegPackageEntry) => {
			if (entry.version === 'N-2') throw new ArtifactMaterializeError('NETWORK', 'offline')
			return installOf(entry)
		})
		const mgr = await makeMgr([pkg('N-2'), pkg('N-1')], {materialize, prune: vi.fn(async () => [])})
		stubProbes(mgr, () => 'ok')

		const pair = await mgr.resolveFFmpegPair()

		expect(pair.ffmpeg.resolvedPath).toBe('/packages/N-1/ffmpeg')
		expect(pair.ffmpeg.attempts[0]?.failure?.kind).toBe('download_failed')
	})

	it('does not download a package when overrides already supply both binaries', async () => {
		const materialize = vi.fn(async (entry: FfmpegPackageEntry) => installOf(entry))
		const mgr = await makeMgr([pkg('N-2')], {materialize, prune: vi.fn(async () => [])})
		stubProbes(mgr, () => 'ok')
		vi.stubEnv('ARROXY_FFMPEG_PATH', '/custom/ffmpeg')
		vi.stubEnv('ARROXY_FFPROBE_PATH', '/custom/ffprobe')

		const pair = await mgr.resolveFFmpegPair()

		expect(materialize).not.toHaveBeenCalled()
		expect(pair.ffmpeg.resolvedPath).toBe('/custom/ffmpeg')
	})

	it('stops buying packages once the machine refuses to run one', async () => {
		const materialize = vi.fn(async (entry: FfmpegPackageEntry) => installOf(entry))
		const mgr = await makeMgr([pkg('N-2'), pkg('N-1')], {materialize, prune: vi.fn(async () => [])})
		stubProbes(mgr, (_id, source) => (source.kind === 'managed' ? 'timeout' : 'ok'))

		const pair = await mgr.resolveFFmpegPair()

		expect(materialize).toHaveBeenCalledTimes(1)
		expect(pair.ffmpeg.state).toBe('failed')
	})

	it('falls back to FFmpeg on the system PATH when no package can be installed', async () => {
		const materialize = vi.fn(async (): Promise<FfmpegPackageInstall> => {
			throw new ArtifactMaterializeError('NETWORK', 'offline')
		})
		const mgr = await makeMgr([pkg('N-2')], {materialize, prune: vi.fn(async () => [])}, async name => [`/usr/bin/${name}`])
		stubProbes(mgr, () => 'ok')

		const pair = await mgr.resolveFFmpegPair()

		expect(pair.ffmpeg.resolvedPath).toBe('/usr/bin/ffmpeg')
		expect(pair.ffprobe.source?.kind).toBe('systemPath')
	})

	it('never probes a bundled copy in a release build', async () => {
		const mgr = await makeMgr([pkg('N-2')], {materialize: vi.fn(async (entry: FfmpegPackageEntry) => installOf(entry)), prune: vi.fn(async () => [])})
		const probed = stubProbes(mgr, () => 'ok')

		await mgr.resolveFFmpegPair()

		expect(probed.every(entry => entry.includes('/packages/'))).toBe(true)
	})
})
