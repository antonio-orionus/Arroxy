// Two callers reach the yt-dlp resolver on a cold start and neither knows about
// the other: the splash's warmup, and QueueService's boot-time respawn pass.
// `this.resolved` only memoizes *completed* resolutions, so both used to run the
// whole chain and both used to call materialize(). The artifact lock stopped
// them corrupting the cache, but the second caller blocked on that lock emitting
// no progress at all — a frozen splash — and once a slow link pushed the first
// download past the lock timeout, the second was handed a fabricated 'timeout'
// attempt and fell through to the next mirror, downloading the same binary
// twice. These tests hold the resolver to one run per dependency.

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi} from 'vitest'
import {BinaryManager, type RuntimeBinaryMaterializerPort} from '@main/services/BinaryManager.js'
import type {RuntimeBinaryIndexProvider} from '@main/services/binary/RuntimeBinaryIndexService.js'
import type {ProbeVerdictStore} from '@main/services/binary/ProbeVerdictCache.js'
import {runtimeBinaryArchFor, runtimeBinaryPlatformFor} from '@shared/runtimeBinaryManifest.js'
import type {RuntimeBinaryManifestEntry, WarmupProgressEvent} from '@shared/types.js'

function entry(patch: Partial<RuntimeBinaryManifestEntry> = {}): RuntimeBinaryManifestEntry {
	const platform = runtimeBinaryPlatformFor()
	const arch = runtimeBinaryArchFor()
	if (!platform || !arch) throw new Error('unsupported test platform')
	return {id: 'yt-dlp', channel: 'nightly', provider: 'github', version: '2026.06.12', platform, arch, url: 'https://example.invalid/yt-dlp', mirrors: [], size: 10, sha256: 'a'.repeat(64), format: 'raw', executablePath: 'yt-dlp', ...patch}
}

function noProbeMemo(): ProbeVerdictStore {
	return {get: async () => null, record: async () => undefined, forget: async () => undefined, clear: async () => undefined}
}

// A real executable, so the probe that follows materialize() is a real spawn and
// the resolution the callers share is a genuine one.
async function fixture(): Promise<{dir: string; executablePath: string}> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-inflight-'))
	const executablePath = path.join(dir, 'yt-dlp')
	await fs.writeFile(executablePath, '#!/bin/sh\necho "2026.06.12"\n', {mode: 0o755})
	return {dir, executablePath}
}

interface Gate {
	materialize: RuntimeBinaryMaterializerPort['materialize']
	calls: () => number
	release: () => void
	started: Promise<void>
}

// Blocks inside materialize until released, so both callers are provably in the
// resolver at the same time rather than merely racing.
function gatedMaterializer(executablePath: string): Gate {
	let releaseGate = (): void => {}
	const gate = new Promise<void>(resolve => {
		releaseGate = resolve
	})
	let announceStart = (): void => {}
	const started = new Promise<void>(resolve => {
		announceStart = resolve
	})
	let calls = 0
	const materialize: RuntimeBinaryMaterializerPort['materialize'] = async (manifest, options) => {
		calls += 1
		announceStart()
		options.onDownloadProgress?.(5, 10)
		await gate
		options.onExtracting?.()
		return {executablePath, cacheKey: 'cache-key', metadataPath: path.join(path.dirname(executablePath), 'metadata.json'), manifest}
	}
	return {materialize, calls: () => calls, release: () => releaseGate(), started}
}

async function manager(materialize: RuntimeBinaryMaterializerPort['materialize']): Promise<BinaryManager> {
	const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-inflight-ud-'))
	const index: RuntimeBinaryIndexProvider = {candidatesFor: vi.fn(async id => (id === 'yt-dlp' ? [entry()] : []))}
	return new BinaryManager(userData, {runtimeBinaryIndex: index, runtimeBinaryMaterializer: {materialize}, probeVerdicts: noProbeMemo()})
}

describe.skipIf(process.platform === 'win32')('BinaryManager concurrent resolution', () => {
	it('runs one resolution for concurrent yt-dlp callers instead of two downloads', async () => {
		const {executablePath} = await fixture()
		const gate = gatedMaterializer(executablePath)
		const mgr = await manager(gate.materialize)

		const first = mgr.resolveYtDlp()
		await gate.started
		const second = mgr.resolveYtDlp()
		gate.release()
		const [a, b] = await Promise.all([first, second])

		expect(gate.calls()).toBe(1)
		expect(a.state).toBe('runnable')
		expect(b.state).toBe('runnable')
		expect(b.resolvedPath).toBe(a.resolvedPath)
	})

	// The frozen splash: the joining caller used to sit on the artifact lock with
	// nothing to show for it. It now sees the run it is actually waiting on.
	it('fans progress out to every caller, not just the one that started the run', async () => {
		const {executablePath} = await fixture()
		const gate = gatedMaterializer(executablePath)
		const mgr = await manager(gate.materialize)

		const firstEvents: WarmupProgressEvent[] = []
		const secondEvents: WarmupProgressEvent[] = []
		const first = mgr.resolveYtDlp({onProgress: event => firstEvents.push(event)})
		await gate.started
		const second = mgr.resolveYtDlp({onProgress: event => secondEvents.push(event)})
		gate.release()
		await Promise.all([first, second])

		expect(secondEvents.map(event => event.phase)).toContain('extracting')
		expect(secondEvents.map(event => event.phase)).toContain('done')
		expect(firstEvents.map(event => event.phase)).toContain('done')
	})

	it('starts a fresh resolution once the shared one has settled', async () => {
		const {executablePath} = await fixture()
		const gate = gatedMaterializer(executablePath)
		const mgr = await manager(gate.materialize)

		gate.release()
		await mgr.resolveYtDlp()
		mgr.invalidateResolved()
		await mgr.resolveYtDlp()

		expect(gate.calls()).toBe(2)
	})

	// Warmup's Cancel must return immediately even when a queue respawn is still
	// waiting on the same download — and must not take that download down with it.
	it('lets one caller cancel out without aborting a run another caller still wants', async () => {
		const {executablePath} = await fixture()
		const gate = gatedMaterializer(executablePath)
		const mgr = await manager(gate.materialize)

		const keeper = mgr.resolveYtDlp()
		await gate.started
		const controller = new AbortController()
		const quitter = mgr.resolveYtDlp({signal: controller.signal})
		controller.abort()

		const quitterDiag = await quitter
		expect(quitterDiag.state).toBe('failed')

		gate.release()
		const keeperDiag = await keeper
		expect(keeperDiag.state).toBe('runnable')
		expect(gate.calls()).toBe(1)
	})

	it('aborts the shared run once its last interested caller has cancelled', async () => {
		const {executablePath} = await fixture()
		const gate = gatedMaterializer(executablePath)
		let observed: AbortSignal | undefined
		const mgr = await manager(async (manifest, options) => {
			observed = options.signal
			return gate.materialize(manifest, options)
		})

		const controller = new AbortController()
		const only = mgr.resolveYtDlp({signal: controller.signal})
		await gate.started
		controller.abort()
		// The last joiner leaving now awaits the run's real unwind instead of
		// resolving early, so the gate has to open for `only` to settle.
		gate.release()
		const diag = await only

		expect(observed?.aborted).toBe(true)
		expect(diag.state).toBe('failed')
	})

	// A user-cancelled solo caller used to get a fabricated empty diagnostic — no
	// attempts, and lastDiagnostics never updated — so the repair panel it landed
	// on after Cancel showed no history of what had already been tried.
	it("carries the accumulated attempts into a solo caller's cancelled diagnostic", async () => {
		const {executablePath} = await fixture()
		const gate = gatedMaterializer(executablePath)
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-inflight-ud-'))
		const index: RuntimeBinaryIndexProvider = {candidatesFor: vi.fn(async () => [entry({channel: 'nightly'}), entry({channel: 'stable'})])}
		let materializeCalls = 0
		const materialize: RuntimeBinaryMaterializerPort['materialize'] = async (manifest, options) => {
			materializeCalls += 1
			if (materializeCalls === 1) throw new Error('mirror unreachable')
			return gate.materialize(manifest, options)
		}
		const mgr = new BinaryManager(userData, {runtimeBinaryIndex: index, runtimeBinaryMaterializer: {materialize}, probeVerdicts: noProbeMemo()})

		const controller = new AbortController()
		const only = mgr.resolveYtDlp({signal: controller.signal})
		await gate.started
		controller.abort()
		gate.release()
		const diag = await only

		expect(diag.state).toBe('failed')
		expect(diag.attempts).toHaveLength(1)
		expect(diag.attempts[0]?.source.kind === 'managed' && diag.attempts[0].source.channel).toBe('nightly')
		expect(mgr.getLastDiagnostic('yt-dlp')).toEqual(diag)
	})

	it('shares one ffmpeg pair resolution across concurrent callers', async () => {
		const {executablePath} = await fixture()
		const mgr = await manager(async () => {
			throw new Error('ffmpeg is embedded, never materialized')
		})
		const probeCalls: string[] = []
		vi.spyOn(mgr as unknown as {probeAndAccept: (...args: unknown[]) => Promise<unknown>}, 'probeAndAccept').mockImplementation(async (...args) => {
			const id = args[0] as string
			const source = args[1] as {kind: string}
			probeCalls.push(id)
			await new Promise(resolve => setTimeout(resolve, 5))
			return {kind: 'accepted', diagnostic: {id, state: 'runnable', source, resolvedPath: executablePath, attempts: []}}
		})

		const [a, b] = await Promise.all([mgr.resolveFFmpegPair(), mgr.resolveFFmpegPair()])

		expect(probeCalls).toEqual(['ffmpeg', 'ffprobe'])
		expect(a.ffmpeg.resolvedPath).toBe(b.ffmpeg.resolvedPath)
	})
})
