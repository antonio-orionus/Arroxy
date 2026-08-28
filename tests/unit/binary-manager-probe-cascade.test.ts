// The download loop: yt-dlp's version probe ran past its 30s budget on a cold
// macOS launch, the resolver read that as "this binary is broken", and moved to
// the next manifest entry — buying a second download that was always going to
// hit the same scanner. These tests hold the chain to the distinction.

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi} from 'vitest'
import {BinaryManager, type ProbeOutcome, type RuntimeBinaryMaterializerPort} from '@main/services/BinaryManager.js'
import type {RuntimeBinaryIndexProvider} from '@main/services/binary/RuntimeBinaryIndexService.js'
import type {ProbeVerdictStore} from '@main/services/binary/ProbeVerdictCache.js'
import {isEnvironmentFatalFailure} from '@shared/dependencyPolicy.js'
import {runtimeBinaryArchFor, runtimeBinaryPlatformFor} from '@shared/runtimeBinaryManifest.js'
import type {DependencyFailureKind, DependencyId, DependencySource, RuntimeBinaryManifestEntry} from '@shared/types.js'

function entry(patch: Partial<RuntimeBinaryManifestEntry> = {}): RuntimeBinaryManifestEntry {
	const platform = runtimeBinaryPlatformFor()
	const arch = runtimeBinaryArchFor()
	if (!platform || !arch) throw new Error('unsupported test platform')
	return {id: 'yt-dlp', channel: 'nightly', provider: 'github', version: '2026.06.12', platform, arch, url: 'https://example.invalid/yt-dlp', mirrors: [], size: 10, sha256: 'a'.repeat(64), format: 'raw', executablePath: 'yt-dlp', ...patch}
}

function noProbeMemo(): ProbeVerdictStore {
	return {get: async () => null, record: async () => undefined, clear: async () => undefined}
}

async function makeMgr(entries: RuntimeBinaryManifestEntry[], materialize: RuntimeBinaryMaterializerPort['materialize']): Promise<BinaryManager> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-cascade-'))
	const indexProvider: RuntimeBinaryIndexProvider = {candidatesFor: vi.fn(async id => entries.filter(candidate => candidate.id === id))}
	return new BinaryManager(dir, {runtimeBinaryIndex: indexProvider, runtimeBinaryMaterializer: {materialize}, probeVerdicts: noProbeMemo()})
}

// Stubs the probe at the boundary the chain actually branches on, so each test
// states a failure kind and asserts what the chain does with it.
function stubProbeFailures(mgr: BinaryManager, verdict: (source: DependencySource) => DependencyFailureKind | 'ok'): {probedPaths: string[]} {
	const probedPaths: string[] = []
	vi.spyOn(mgr as unknown as {probeAndAccept: (id: DependencyId, source: DependencySource, p: string, attempts: unknown[]) => Promise<ProbeOutcome>}, 'probeAndAccept').mockImplementation(async (id, source, candidatePath, attempts) => {
		probedPaths.push(candidatePath)
		const kind = verdict(source)
		if (kind === 'ok') {
			attempts.push({source})
			return {kind: 'accepted', diagnostic: {id, state: 'runnable', source, resolvedPath: candidatePath, attempts: attempts as never}}
		}
		attempts.push({source, failure: {kind, message: `${kind} for test`}})
		// Defer to the real policy rather than restating it, so a test can never
		// assert against a classification the production chain does not use.
		return isEnvironmentFatalFailure(kind, source) ? {kind: 'environmentFatal'} : {kind: 'rejected'}
	})
	return {probedPaths}
}

describe('BinaryManager probe cascade', () => {
	it('stops buying downloads once a probe proves the environment hostile', async () => {
		const materialize = vi.fn(async (candidate: RuntimeBinaryManifestEntry) => ({executablePath: `/managed/${candidate.channel}`, cacheKey: candidate.channel, metadataPath: '/metadata.json', manifest: candidate}))
		const mgr = await makeMgr([entry({channel: 'nightly'}), entry({channel: 'stable'})], materialize)
		stubProbeFailures(mgr, () => 'timeout')

		const diag = await mgr.resolveYtDlp()

		// The bug: the second entry was materialized — a whole extra download —
		// only to be handed to the same scanner that had just timed the first out.
		expect(materialize).toHaveBeenCalledTimes(1)
		expect(diag.state).toBe('failed')
		expect(diag.failure?.kind).toBe('timeout')
	})

	it('still walks to the next manifest entry when the candidate itself is wrong', async () => {
		const materialize = vi.fn(async (candidate: RuntimeBinaryManifestEntry) => ({executablePath: `/managed/${candidate.channel}`, cacheKey: candidate.channel, metadataPath: '/metadata.json', manifest: candidate}))
		const mgr = await makeMgr([entry({channel: 'nightly'}), entry({channel: 'stable'})], materialize)
		stubProbeFailures(mgr, source => (source.kind === 'managed' && source.channel === 'nightly' ? 'spawn_failed' : 'ok'))

		const diag = await mgr.resolveYtDlp()

		expect(materialize).toHaveBeenCalledTimes(2)
		expect(diag.state).toBe('runnable')
	})

	// Falling through costs nothing here — these candidates are already on disk —
	// and a Homebrew yt-dlp is a plain Python entry point, so it can genuinely
	// succeed on the machine that just timed out unpacking an onefile bundle.
	it('keeps probing local candidates after an environment-fatal managed probe', async () => {
		const managedEntry = entry({channel: 'nightly'})
		const materialize = vi.fn(async (candidate: RuntimeBinaryManifestEntry) => ({executablePath: `/managed/${candidate.channel}`, cacheKey: candidate.channel, metadataPath: '/metadata.json', manifest: candidate}))
		const mgr = await makeMgr([managedEntry], materialize)
		const {probedPaths} = stubProbeFailures(mgr, source => (source.kind === 'managedCache' ? 'ok' : 'timeout'))
		vi.spyOn(mgr as unknown as {validManagedArtifactCacheEntries: () => Promise<Array<{manifest: RuntimeBinaryManifestEntry; executablePath: string; installedAt: string}>>}, 'validManagedArtifactCacheEntries').mockResolvedValue([
			{manifest: entry({channel: 'stable'}), executablePath: '/cache/yt-dlp', installedAt: '2026-08-01T00:00:00.000Z'}
		])

		const diag = await mgr.resolveYtDlp()

		expect(materialize).toHaveBeenCalledTimes(1)
		expect(probedPaths).toContain('/cache/yt-dlp')
		expect(diag.state).toBe('runnable')
		expect(diag.source).toMatchObject({kind: 'managedCache'})
	})

	it('unwinds immediately when the probe was cancelled rather than slow', async () => {
		const materialize = vi.fn(async (candidate: RuntimeBinaryManifestEntry) => ({executablePath: `/managed/${candidate.channel}`, cacheKey: candidate.channel, metadataPath: '/metadata.json', manifest: candidate}))
		const mgr = await makeMgr([entry({channel: 'nightly'}), entry({channel: 'stable'})], materialize)
		vi.spyOn(mgr as unknown as {probeAndAccept: () => Promise<ProbeOutcome>}, 'probeAndAccept').mockResolvedValue({kind: 'cancelled'})

		const diag = await mgr.resolveYtDlp()

		expect(materialize).toHaveBeenCalledTimes(1)
		expect(diag.state).toBe('failed')
	})
	// CodeRabbit caught this: classifying every refusal as environment-fatal meant
	// a 0644 file behind a manual override skipped every managed candidate — and
	// an override is exactly what someone sets to work around a broken install.
	it('still reaches the managed path when the failure is a user-supplied path being unusable', async () => {
		const materialize = vi.fn(async (candidate: RuntimeBinaryManifestEntry) => ({executablePath: `/managed/${candidate.channel}`, cacheKey: candidate.channel, metadataPath: '/metadata.json', manifest: candidate}))
		const mgr = await makeMgr([entry({channel: 'nightly'})], materialize)
		stubProbeFailures(mgr, source => (source.kind === 'manualOverride' ? 'permission_denied' : 'ok'))

		const diag = await mgr.resolveYtDlp({overrides: {ytDlp: '/not/executable/yt-dlp'}})

		expect(materialize).toHaveBeenCalledTimes(1)
		expect(diag.state).toBe('runnable')
		expect(diag.source).toMatchObject({kind: 'managed'})
	})

	it('stops for a refusal of an artifact we materialized ourselves', async () => {
		const materialize = vi.fn(async (candidate: RuntimeBinaryManifestEntry) => ({executablePath: `/managed/${candidate.channel}`, cacheKey: candidate.channel, metadataPath: '/metadata.json', manifest: candidate}))
		const mgr = await makeMgr([entry({channel: 'nightly'}), entry({channel: 'stable'})], materialize)
		stubProbeFailures(mgr, () => 'blocked_or_quarantined')

		await mgr.resolveYtDlp()

		expect(materialize).toHaveBeenCalledTimes(1)
	})

	// materialize() rejects on abort too. Without unwinding there, the chain kept
	// materializing entries the user had already asked us to stop and appended a
	// fabricated download failure for each.
	it('unwinds when materialization itself observes the abort', async () => {
		const controller = new AbortController()
		const materialize = vi.fn(async () => {
			controller.abort()
			throw Object.assign(new Error('aborted'), {name: 'AbortError'})
		})
		const mgr = await makeMgr([entry({channel: 'nightly'}), entry({channel: 'stable'})], materialize)

		const diag = await mgr.resolveYtDlp({signal: controller.signal})

		expect(materialize).toHaveBeenCalledTimes(1)
		expect(diag.state).toBe('failed')
		expect(diag.attempts.filter(a => a.failure).length).toBe(0)
	})
})
