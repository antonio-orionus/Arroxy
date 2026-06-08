// @vitest-environment node

import {describe, expect, it, vi} from 'vitest'
import worker from '../../workers/feedback-upload/src/index.js'

type PutFn = (key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions) => Promise<R2Object>
type LimitFn = (options: RateLimitOptions) => Promise<RateLimitOutcome>

function makeBucket(): {bucket: R2Bucket; put: ReturnType<typeof vi.fn<PutFn>>} {
	const put = vi.fn<PutFn>(async key => makeR2Object(key))
	const bucket: R2Bucket = {
		head: async () => null,
		get: async () => null,
		put,
		createMultipartUpload: async key => makeMultipartUpload(key),
		resumeMultipartUpload: (key, uploadId) => makeMultipartUpload(key, uploadId),
		delete: async () => undefined,
		list: async () => ({delimitedPrefixes: [], objects: [], truncated: false})
	}
	return {bucket, put}
}

function makeR2Object(key: string): R2Object {
	return {key, version: 'test', size: 0, etag: 'test', httpEtag: '"test"', checksums: {toJSON: () => ({})}, uploaded: new Date(0), storageClass: 'Standard', writeHttpMetadata: () => undefined}
}

function makeMultipartUpload(key: string, uploadId = 'test-upload'): R2MultipartUpload {
	return {key, uploadId, uploadPart: async partNumber => ({etag: 'test', partNumber}), abort: async () => undefined, complete: async () => makeR2Object(key)}
}

function makeRateLimit(success = true): {rateLimit: RateLimit; limit: ReturnType<typeof vi.fn<LimitFn>>} {
	const limit = vi.fn<LimitFn>(async () => ({success}))
	return {rateLimit: {limit}, limit}
}

function makeEnv(bucket: R2Bucket, rateLimit: RateLimit = makeRateLimit().rateLimit): Env {
	return {FEEDBACK_LOGS: bucket, FEEDBACK_UPLOAD_RATE_LIMIT: rateLimit}
}

describe('feedback upload Worker', () => {
	const reportId = '11111111-1111-4111-8111-111111111111'

	it('stores valid gzip diagnostics in R2 and returns a report id', async () => {
		const {bucket, put} = makeBucket()
		const {rateLimit, limit} = makeRateLimit()
		const response = await worker.fetch(
			new Request('https://arroxy.orionus.dev/api/feedback-diagnostics', {
				method: 'POST',
				headers: {'x-arroxy-upload': 'feedback-diagnostic-v1', 'x-arroxy-report-id': reportId, 'content-type': 'application/gzip', 'content-encoding': 'gzip', 'x-arroxy-raw-bytes': '42', 'x-arroxy-truncated': 'false'},
				body: new Uint8Array([31, 139, 8, 0])
			}),
			makeEnv(bucket, rateLimit)
		)

		const data: {report_id?: string; diagnostic_key?: string; diagnostic_url?: string | null} = await response.json()
		expect(response.status).toBe(201)
		expect(data.report_id).toBe(reportId)
		expect(data.diagnostic_key).toMatch(new RegExp(`^feedback/\\d{4}-\\d{2}-\\d{2}/${reportId}\\.log\\.gz$`))
		expect(data.diagnostic_url).toBeNull()
		expect(limit).toHaveBeenCalledWith({key: '/api/feedback-diagnostics:unknown'})
		expect(put).toHaveBeenCalledWith(data.diagnostic_key, expect.any(ArrayBuffer), expect.objectContaining({httpMetadata: {contentType: 'application/gzip', contentEncoding: 'gzip'}, customMetadata: expect.objectContaining({reportId, rawBytes: '42', compressedBytes: '4', truncated: 'false'})}))
	})

	it('rejects browser-style or oversized requests before writing to R2', async () => {
		const {bucket, put} = makeBucket()
		const missingMarker = await worker.fetch(new Request('https://arroxy.orionus.dev/api/feedback-diagnostics', {method: 'POST', headers: {'content-type': 'application/gzip', 'content-encoding': 'gzip'}, body: new Uint8Array([1])}), makeEnv(bucket))
		const tooLarge = await worker.fetch(
			new Request('https://arroxy.orionus.dev/api/feedback-diagnostics', {method: 'POST', headers: {'x-arroxy-upload': 'feedback-diagnostic-v1', 'x-arroxy-report-id': reportId, 'content-type': 'application/gzip', 'content-encoding': 'gzip', 'content-length': '1500001'}, body: new Uint8Array([1])}),
			{...makeEnv(bucket)}
		)

		expect(missingMarker.status).toBe(400)
		expect(tooLarge.status).toBe(413)
		expect(put).not.toHaveBeenCalled()
	})

	it('rate limits upload attempts before reading or writing diagnostics', async () => {
		const {bucket, put} = makeBucket()
		const {rateLimit} = makeRateLimit(false)
		const response = await worker.fetch(
			new Request('https://arroxy.orionus.dev/api/feedback-diagnostics', {method: 'POST', headers: {'x-arroxy-upload': 'feedback-diagnostic-v1', 'x-arroxy-report-id': reportId, 'content-type': 'application/gzip', 'content-encoding': 'gzip', 'cf-connecting-ip': '203.0.113.10'}, body: new Uint8Array([31, 139, 8, 0])}),
			makeEnv(bucket, rateLimit)
		)

		expect(response.status).toBe(429)
		expect(response.headers.get('retry-after')).toBe('60')
		expect(await response.json()).toEqual({error: 'rate_limited'})
		expect(put).not.toHaveBeenCalled()
	})

	it('rejects invalid report ids before writing to R2', async () => {
		const {bucket, put} = makeBucket()
		const response = await worker.fetch(
			new Request('https://arroxy.orionus.dev/api/feedback-diagnostics', {method: 'POST', headers: {'x-arroxy-upload': 'feedback-diagnostic-v1', 'x-arroxy-report-id': 'report-123', 'content-type': 'application/gzip', 'content-encoding': 'gzip'}, body: new Uint8Array([31, 139, 8, 0])}),
			makeEnv(bucket)
		)

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({error: 'invalid_report_id'})
		expect(put).not.toHaveBeenCalled()
	})
})
