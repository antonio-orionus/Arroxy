import {describe, expect, it, vi, afterEach} from 'vitest'

vi.mock('@main/services/analytics', () => ({trackMain: vi.fn()}))

import {BinaryManager} from '@main/services/BinaryManager.js'
import {trackMain} from '@main/services/analytics.js'
import type {DependencyAttempt, DependencySource} from '@shared/types.js'

afterEach(() => {
	vi.clearAllMocks()
})

describe('BinaryManager analytics', () => {
	it('emits the stable ARX code for classified managed-download failures', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'default', url: 'https://example.com/ffmpeg.zip'}

		const ok = await (mgr as unknown as {tryManagedDownload: (id: 'ffmpeg', attempts: DependencyAttempt[], source: DependencySource, onProgress: undefined, run: () => Promise<void>) => Promise<boolean>}).tryManagedDownload('ffmpeg', attempts, source, undefined, async () => {
			throw new Error('checksum mismatch')
		})

		expect(ok).toBe(false)
		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', {binary: 'ffmpeg', phase: 'hash_failed', code: 'ARX-003', operation: 'managed-download', setup_step: 'unknown', source_kind: 'managed', source_channel: 'default', elapsed_ms: expect.any(Number)})
	})

	it('classifies signal-driven managed-download aborts as timeout', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'default', url: 'https://example.com/ffmpeg.zip'}

		const ok = await (mgr as unknown as {tryManagedDownload: (id: 'ffmpeg', attempts: DependencyAttempt[], source: DependencySource, onProgress: undefined, run: () => Promise<void>) => Promise<boolean>}).tryManagedDownload('ffmpeg', attempts, source, undefined, async () => {
			throw new DOMException('Cancelled', 'AbortError')
		})

		expect(ok).toBe(false)
		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', {binary: 'ffmpeg', phase: 'timeout', code: 'ARX-008', operation: 'managed-download', setup_step: 'unknown', source_kind: 'managed', source_channel: 'default', elapsed_ms: expect.any(Number)})
	})

	it('does not treat a benign "aborted by server" message as cancel', async () => {
		const mgr = new BinaryManager('/tmp/arroxy-binary-analytics')
		const attempts: DependencyAttempt[] = []
		const source: DependencySource = {kind: 'managed', channel: 'default', url: 'https://example.com/ffmpeg.zip'}

		const ok = await (mgr as unknown as {tryManagedDownload: (id: 'ffmpeg', attempts: DependencyAttempt[], source: DependencySource, onProgress: undefined, run: () => Promise<void>) => Promise<boolean>}).tryManagedDownload('ffmpeg', attempts, source, undefined, async () => {
			throw new Error('Request aborted by server during redirect')
		})

		expect(ok).toBe(false)
		expect(trackMain).toHaveBeenCalledWith('binary_setup_failed', {binary: 'ffmpeg', phase: 'download_failed', code: 'ARX-001', operation: 'managed-download', setup_step: 'unknown', source_kind: 'managed', source_channel: 'default', elapsed_ms: expect.any(Number)})
	})
})
