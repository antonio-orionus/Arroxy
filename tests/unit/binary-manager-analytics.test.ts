import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi, afterEach} from 'vitest'

vi.mock('@main/services/analytics', () => ({trackMain: vi.fn()}))

import {BinaryManager} from '@main/services/BinaryManager.js'
import {trackMain} from '@main/services/analytics.js'
import type {DependencyAttempt, DependencySource} from '@shared/types.js'

afterEach(() => {
	vi.clearAllMocks()
})

async function makeDenoVersionStub(): Promise<string> {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-deno-probe-'))
	const stubPath = path.join(tempDir, process.platform === 'win32' ? 'deno.cmd' : 'deno')
	const body = process.platform === 'win32' ? '@echo off\r\necho deno 2.8.2\r\n' : '#!/bin/sh\necho "deno 2.8.2"\n'
	await fs.writeFile(stubPath, body)
	if (process.platform !== 'win32') await fs.chmod(stubPath, 0o755)
	return stubPath
}

describe('BinaryManager analytics', () => {
	it('emits the stable ARX code for classified managed-download failures', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'default', provider: 'github', url: 'https://example.com/ffmpeg.zip'}

		const ok = await (mgr as unknown as {tryManagedDownload: (id: 'ffmpeg', attempts: DependencyAttempt[], source: DependencySource, onProgress: undefined, run: () => Promise<void>) => Promise<boolean>}).tryManagedDownload('ffmpeg', attempts, source, undefined, async () => {
			throw new Error('checksum mismatch')
		})

		expect(ok).toBe(false)
		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', {binary: 'ffmpeg', phase: 'hash_failed', code: 'ARX-003', operation: 'managed-download', setup_step: 'unknown', source_kind: 'managed', source_channel: 'default', source_provider: 'github', elapsed_ms: expect.any(Number)})
	})

	it('classifies signal-driven managed-download aborts as timeout', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'default', provider: 'github', url: 'https://example.com/ffmpeg.zip'}

		const ok = await (mgr as unknown as {tryManagedDownload: (id: 'ffmpeg', attempts: DependencyAttempt[], source: DependencySource, onProgress: undefined, run: () => Promise<void>) => Promise<boolean>}).tryManagedDownload('ffmpeg', attempts, source, undefined, async () => {
			throw new DOMException('Cancelled', 'AbortError')
		})

		expect(ok).toBe(false)
		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', {binary: 'ffmpeg', phase: 'timeout', code: 'ARX-008', operation: 'managed-download', setup_step: 'unknown', source_kind: 'managed', source_channel: 'default', source_provider: 'github', elapsed_ms: expect.any(Number)})
	})

	it('does not treat a benign "aborted by server" message as cancel', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'default', provider: 'github', url: 'https://example.com/ffmpeg.zip'}

		const ok = await (mgr as unknown as {tryManagedDownload: (id: 'ffmpeg', attempts: DependencyAttempt[], source: DependencySource, onProgress: undefined, run: () => Promise<void>) => Promise<boolean>}).tryManagedDownload('ffmpeg', attempts, source, undefined, async () => {
			throw new Error('Request aborted by server during redirect')
		})

		expect(ok).toBe(false)
		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', {binary: 'ffmpeg', phase: 'download_failed', code: 'ARX-001', operation: 'managed-download', setup_step: 'unknown', source_kind: 'managed', source_channel: 'default', source_provider: 'github', elapsed_ms: expect.any(Number)})
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
		const source: DependencySource = {kind: 'managed', channel: 'default', provider: 'github', url: 'https://example.com/deno.zip'}
		const now = vi.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(32_500)
		const denoStub = await makeDenoVersionStub()

		try {
			const diag = await (mgr as unknown as {probeAndAccept: (id: 'deno', source: DependencySource, candidatePath: string, attempts: DependencyAttempt[]) => Promise<unknown>}).probeAndAccept('deno', source, denoStub, attempts)

			expect(diag).not.toBeNull()
			expect(trackMain).toHaveBeenCalledWith('binary_probe_anomaly', {binary: 'deno', outcome: 'slow_success', source_kind: 'managed', source_channel: 'default', source_provider: 'github', elapsed_ms: 31_500, timeout_ms: 30_000})
		} finally {
			now.mockRestore()
		}
	})
})
