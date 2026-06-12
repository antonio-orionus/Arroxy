import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi, afterEach} from 'vitest'

vi.mock('@main/services/analytics', () => ({trackMain: vi.fn()}))

import {BinaryManager} from '@main/services/BinaryManager.js'
import {trackMain} from '@main/services/analytics.js'
import {ArtifactMaterializeError} from '@main/services/binary/RuntimeBinaryMaterializer.js'
import type {DependencyAttempt, DependencySource, RuntimeBinaryManifestEntry} from '@shared/types.js'

afterEach(() => {
	vi.clearAllMocks()
})

async function makeYtDlpVersionStub(): Promise<string> {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-ytdlp-probe-'))
	const stubPath = path.join(tempDir, process.platform === 'win32' ? 'yt-dlp.cmd' : 'yt-dlp')
	const body = process.platform === 'win32' ? '@echo off\r\necho 2026.06.12\r\n' : '#!/bin/sh\necho "2026.06.12"\n'
	await fs.writeFile(stubPath, body)
	if (process.platform !== 'win32') await fs.chmod(stubPath, 0o755)
	return stubPath
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
			} as never
		})

		await mgr.resolveYtDlp()
	} finally {
		process.env.PATH = originalPath
	}
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
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.com/yt-dlp.exe'}

		const diag = await (mgr as unknown as {probeAndAccept: (id: 'yt-dlp', source: DependencySource, candidatePath: string, attempts: DependencyAttempt[]) => Promise<unknown>}).probeAndAccept('yt-dlp', source, path.join('/tmp', 'arroxy-missing-yt-dlp.exe'), attempts)

		expect(diag).toBeNull()
		expect(trackMain).toHaveBeenCalledWith('binary_probe_anomaly', {binary: 'ytdlp', outcome: 'failed', failure_kind: 'spawn_failed', code: 'ARX-004', source_kind: 'managed', source_channel: 'nightly', source_provider: 'github', elapsed_ms: expect.any(Number), timeout_ms: 30_000})
	})

	it('emits sanitized telemetry for slow successful binary version probes', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.com/yt-dlp'}
		const now = vi.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(32_500)
		const ytDlpStub = await makeYtDlpVersionStub()

		try {
			const diag = await (mgr as unknown as {probeAndAccept: (id: 'yt-dlp', source: DependencySource, candidatePath: string, attempts: DependencyAttempt[]) => Promise<unknown>}).probeAndAccept('yt-dlp', source, ytDlpStub, attempts)

			expect(diag).not.toBeNull()
			expect(trackMain).toHaveBeenCalledWith('binary_probe_anomaly', {binary: 'ytdlp', outcome: 'slow_success', source_kind: 'managed', source_channel: 'nightly', source_provider: 'github', elapsed_ms: 31_500, timeout_ms: 30_000})
		} finally {
			now.mockRestore()
		}
	})
})
