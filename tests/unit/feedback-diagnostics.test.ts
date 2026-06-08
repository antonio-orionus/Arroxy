// @vitest-environment node

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {gunzipSync} from 'node:zlib'
import {describe, expect, it, vi} from 'vitest'
import {createFeedbackDiagnosticPayload, FEEDBACK_DIAGNOSTIC_TAIL_BYTES, uploadFeedbackDiagnostic} from '@main/services/FeedbackDiagnostics.js'

describe('FeedbackDiagnostics', () => {
	it('tails, redacts, and gzips the diagnostic log payload', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-feedback-diagnostics-'))
		const logPath = path.join(tempDir, 'main.log')
		const head = Buffer.alloc(FEEDBACK_DIAGNOSTIC_TAIL_BYTES, 0x61)
		const tail = Buffer.from('path=/home/alice/Videos\nurl=https://example.com/watch?token=secret&ok=1\n')
		await fs.writeFile(logPath, Buffer.concat([head, tail]))

		try {
			const payload = await createFeedbackDiagnosticPayload({logPath})
			const unzipped = gunzipSync(payload.body).toString('utf8')

			expect(payload.rawBytes).toBe(FEEDBACK_DIAGNOSTIC_TAIL_BYTES)
			expect(payload.truncated).toBe(true)
			expect(payload.compressedBytes).toBe(payload.body.byteLength)
			expect(unzipped).toContain('/home/<user>/Videos')
			expect(unzipped).toContain('token=<redacted>')
			expect(unzipped).not.toContain('alice')
			expect(unzipped).not.toContain('token=secret')
		} finally {
			await fs.rm(tempDir, {force: true, recursive: true})
		}
	})

	it('uploads the compressed diagnostic payload and returns the Worker report id', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-feedback-diagnostics-upload-'))
		const logPath = path.join(tempDir, 'main.log')
		await fs.writeFile(logPath, 'diagnostic log\n')
		const reportId = '11111111-1111-4111-8111-111111111111'
		const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({report_id: reportId, diagnostic_url: null}), {status: 201, headers: {'content-type': 'application/json'}}))

		try {
			const result = await uploadFeedbackDiagnostic({endpoint: 'https://arroxy.orionus.dev/api/feedback-diagnostics', fetchImpl, logPath, reportId})

			expect(result).toMatchObject({reportId, diagnosticUrl: null, rawBytes: 15, truncated: false})
			expect(result.compressedBytes).toBeGreaterThan(0)
			expect(fetchImpl).toHaveBeenCalledWith(
				'https://arroxy.orionus.dev/api/feedback-diagnostics',
				expect.objectContaining({method: 'POST', body: expect.any(ArrayBuffer), headers: expect.objectContaining({'x-arroxy-upload': 'feedback-diagnostic-v1', 'x-arroxy-report-id': reportId, 'content-type': 'application/gzip', 'content-encoding': 'gzip'})})
			)
		} finally {
			await fs.rm(tempDir, {force: true, recursive: true})
		}
	})

	it('aborts diagnostic uploads that do not complete before the timeout', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-feedback-diagnostics-timeout-'))
		const logPath = path.join(tempDir, 'main.log')
		await fs.writeFile(logPath, 'diagnostic log\n')
		const reportId = '11111111-1111-4111-8111-111111111111'
		let markFetchStarted!: () => void
		const fetchStarted = new Promise<void>(resolve => {
			markFetchStarted = resolve
		})
		const fetchImpl = vi.fn((_endpoint: RequestInfo | URL, init?: RequestInit) => {
			markFetchStarted()
			return new Promise<Response>((_resolve, reject) => {
				init?.signal?.addEventListener('abort', () => {
					const error = new Error('Aborted')
					error.name = 'AbortError'
					reject(error)
				})
			})
		})

		try {
			vi.useFakeTimers()
			const upload = uploadFeedbackDiagnostic({endpoint: 'https://arroxy.orionus.dev/api/feedback-diagnostics', fetchImpl, logPath, reportId, timeoutMs: 1})
			const rejectedUpload = expect(upload).rejects.toThrow('Diagnostic upload timed out')
			await fetchStarted
			await vi.advanceTimersByTimeAsync(1)
			await rejectedUpload
			expect(fetchImpl).toHaveBeenCalledOnce()
			expect(fetchImpl.mock.calls[0][1]!.signal?.aborted).toBe(true)
		} finally {
			vi.useRealTimers()
			await fs.rm(tempDir, {force: true, recursive: true})
		}
	})

	it('rejects invalid report ids before reading or uploading logs', async () => {
		const fetchImpl = vi.fn()

		await expect(uploadFeedbackDiagnostic({endpoint: 'https://arroxy.orionus.dev/api/feedback-diagnostics', fetchImpl, logPath: '/tmp/does-not-matter.log', reportId: 'report-123'})).rejects.toThrow('Invalid feedback report id')
		expect(fetchImpl).not.toHaveBeenCalled()
	})

	it('rejects upload responses that do not echo the requested report id', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-feedback-diagnostics-mismatch-'))
		const logPath = path.join(tempDir, 'main.log')
		await fs.writeFile(logPath, 'diagnostic log\n')
		const reportId = '11111111-1111-4111-8111-111111111111'
		const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({report_id: '22222222-2222-4222-8222-222222222222', diagnostic_url: null}), {status: 201, headers: {'content-type': 'application/json'}}))

		try {
			await expect(uploadFeedbackDiagnostic({endpoint: 'https://arroxy.orionus.dev/api/feedback-diagnostics', fetchImpl, logPath, reportId})).rejects.toThrow('Diagnostic upload response report_id did not match request')
		} finally {
			await fs.rm(tempDir, {force: true, recursive: true})
		}
	})
})
