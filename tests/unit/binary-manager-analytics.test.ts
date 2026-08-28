import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi, afterEach} from 'vitest'

vi.mock('@main/services/analytics', () => ({trackMain: vi.fn()}))

import {BinaryManager, type ProbeOutcome} from '@main/services/BinaryManager.js'
import {trackMain} from '@main/services/analytics.js'
import {ArtifactMaterializeError} from '@main/services/binary/RuntimeBinaryMaterializer.js'
import type {DependencyAttempt, DependencySource, RuntimeBinaryManifestEntry} from '@shared/types.js'

afterEach(() => {
	vi.clearAllMocks()
})

// A binary that exits 0 for `--version`. The probe under test only cares that
// the spawn succeeds — the version string never reaches the assertions — and the
// obvious alternative, a shell-script stub, has to be a .cmd on Windows, which
// execFile() refuses to launch without a shell. process.execPath is a real
// executable on every platform, so it sidesteps that without a platform branch.
function versionAnsweringExecutable(): string {
	return process.execPath
}

function ytDlpEntry(): RuntimeBinaryManifestEntry {
	return {id: 'yt-dlp', channel: 'nightly', provider: 'github', version: '2026.06.12', platform: 'linux', arch: 'x64', url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux', mirrors: [], size: 10, sha256: 'a'.repeat(64), format: 'raw', executablePath: 'yt-dlp'}
}

async function runFailingManifestResolution(err: unknown): Promise<void> {
	const originalPath = process.env.PATH
	const emptyPathDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-empty-path-'))
	process.env.PATH = emptyPathDir
	try {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics', {
			runtimeBinaryIndex: {candidatesFor: vi.fn(async () => [ytDlpEntry()])},
			runtimeBinaryMaterializer: {
				materialize: vi.fn(async () => {
					throw err
				})
			}
		})

		await mgr.resolveYtDlp()
	} finally {
		process.env.PATH = originalPath
	}
}

// Resolution memoizes successful probes to disk. These tests assert on the probe
// itself, so they opt out rather than depend on whatever a previous run left in
// the shared temp directory.
function noProbeMemo(): {get: () => Promise<null>; record: () => Promise<void>; clear: () => Promise<void>} {
	return {get: async () => null, record: async () => undefined, clear: async () => undefined}
}

describe('BinaryManager analytics', () => {
	it('emits the stable ARX code for classified managed-download failures', async () => {
		await runFailingManifestResolution(new ArtifactMaterializeError('CHECKSUM', 'checksum mismatch'))

		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', expect.objectContaining({binary: 'ytdlp', phase: 'hash_failed', code: 'ARX-003', operation: 'managed-download', setup_step: 'checksum_verify', source_kind: 'managed', source_channel: 'nightly', source_provider: 'github', elapsed_ms: expect.any(Number)}))
	})

	it('classifies signal-driven managed-download aborts as timeout', async () => {
		await runFailingManifestResolution(new ArtifactMaterializeError('TIMEOUT', 'Download exceeded timeout'))

		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', expect.objectContaining({binary: 'ytdlp', phase: 'timeout', code: 'ARX-008', operation: 'managed-download', setup_step: 'download', source_kind: 'managed', source_channel: 'nightly', source_provider: 'github', elapsed_ms: expect.any(Number)}))
	})

	it('does not treat a benign "aborted by server" message as cancel', async () => {
		await runFailingManifestResolution(new Error('Request aborted by server during redirect'))

		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', {binary: 'ytdlp', phase: 'download_failed', code: 'ARX-001', operation: 'managed-download', setup_step: 'unknown', source_kind: 'managed', source_channel: 'nightly', source_provider: 'github', elapsed_ms: expect.any(Number)})
	})

	it('emits sanitized telemetry for binary version probe failures', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics', {probeVerdicts: noProbeMemo()})
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.com/yt-dlp.exe'}

		const diag = await (mgr as unknown as {probeAndAccept: (id: 'yt-dlp', source: DependencySource, candidatePath: string, attempts: DependencyAttempt[]) => Promise<ProbeOutcome>}).probeAndAccept('yt-dlp', source, path.join('/tmp', 'arroxy-missing-yt-dlp.exe'), attempts)

		expect(diag).toEqual({kind: 'rejected'})
		expect(trackMain).toHaveBeenCalledWith('binary_probe_anomaly', {binary: 'ytdlp', outcome: 'failed', failure_kind: 'spawn_failed', code: 'ARX-004', source_kind: 'managed', source_channel: 'nightly', source_provider: 'github', elapsed_ms: expect.any(Number), timeout_ms: 120_000, attempt_index: 0})
	})

	it('emits sanitized telemetry for slow successful binary version probes', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics', {probeVerdicts: noProbeMemo()})
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.com/yt-dlp'}
		const now = vi.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(32_500)
		const ytDlpStub = versionAnsweringExecutable()

		try {
			const diag = await (mgr as unknown as {probeAndAccept: (id: 'yt-dlp', source: DependencySource, candidatePath: string, attempts: DependencyAttempt[]) => Promise<ProbeOutcome>}).probeAndAccept('yt-dlp', source, ytDlpStub, attempts)

			expect(diag).toMatchObject({kind: 'accepted'})
			expect(trackMain).toHaveBeenCalledWith('binary_probe_anomaly', {binary: 'ytdlp', outcome: 'slow_success', source_kind: 'managed', source_channel: 'nightly', source_provider: 'github', elapsed_ms: 31_500, timeout_ms: 120_000, attempt_index: 0})
		} finally {
			now.mockRestore()
		}
	})
})
