import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {gzip} from 'node:zlib'
import {promisify} from 'node:util'

const gzipAsync = promisify(gzip)

export const FEEDBACK_DIAGNOSTIC_TAIL_BYTES = 1024 * 1024
const FEEDBACK_DIAGNOSTIC_UPLOAD_TIMEOUT_MS = 10_000
const DEFAULT_FEEDBACK_DIAGNOSTICS_ENDPOINT = 'https://arroxy.orionus.dev/api/feedback-diagnostics'
const REPORT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export interface FeedbackDiagnosticPayloadInput {
	logPath: string
}

export interface FeedbackDiagnosticPayload {
	body: Buffer
	rawBytes: number
	compressedBytes: number
	truncated: boolean
	sha256: string
}

export interface UploadFeedbackDiagnosticInput {
	endpoint?: string
	fetchImpl?: typeof fetch
	logPath: string
	reportId: string
	timeoutMs?: number
}

export interface UploadFeedbackDiagnosticResult {
	reportId: string
	diagnosticUrl: string | null
	rawBytes: number
	compressedBytes: number
	truncated: boolean
	sha256: string
}

interface WorkerUploadResponse {
	report_id?: unknown
	diagnostic_url?: unknown
}

export async function createFeedbackDiagnosticPayload({logPath}: FeedbackDiagnosticPayloadInput): Promise<FeedbackDiagnosticPayload> {
	const stat = await fs.stat(logPath)
	const rawBytes = Math.min(stat.size, FEEDBACK_DIAGNOSTIC_TAIL_BYTES)
	const start = Math.max(0, stat.size - rawBytes)
	const handle = await fs.open(logPath, 'r')

	try {
		const buffer = Buffer.alloc(rawBytes)
		if (rawBytes > 0) {
			await handle.read(buffer, 0, rawBytes, start)
		}
		const redacted = redactDiagnosticLog(buffer.toString('utf8'))
		const body = await gzipAsync(Buffer.from(redacted, 'utf8'), {level: 9})
		return {body, rawBytes, compressedBytes: body.byteLength, truncated: stat.size > rawBytes, sha256: createHash('sha256').update(body).digest('hex')}
	} finally {
		await handle.close()
	}
}

export async function uploadFeedbackDiagnostic({endpoint = process.env.ARROXY_FEEDBACK_DIAGNOSTICS_URL ?? DEFAULT_FEEDBACK_DIAGNOSTICS_ENDPOINT, fetchImpl = fetch, logPath, reportId, timeoutMs = FEEDBACK_DIAGNOSTIC_UPLOAD_TIMEOUT_MS}: UploadFeedbackDiagnosticInput): Promise<UploadFeedbackDiagnosticResult> {
	const normalizedReportId = normalizeReportId(reportId)
	const payload = await createFeedbackDiagnosticPayload({logPath})
	const controller = new AbortController()
	const timeout = setTimeout(() => {
		controller.abort()
	}, timeoutMs)
	let response: Response

	try {
		response = await fetchImpl(endpoint, {
			method: 'POST',
			headers: {
				'x-arroxy-upload': 'feedback-diagnostic-v1',
				'x-arroxy-report-id': normalizedReportId,
				'content-type': 'application/gzip',
				'content-encoding': 'gzip',
				'x-arroxy-raw-bytes': String(payload.rawBytes),
				'x-arroxy-compressed-bytes': String(payload.compressedBytes),
				'x-arroxy-truncated': String(payload.truncated),
				'x-arroxy-sha256': payload.sha256
			},
			body: bufferToArrayBuffer(payload.body),
			signal: controller.signal
		})
	} catch (error) {
		if (isAbortError(error)) {
			throw new Error('Diagnostic upload timed out')
		}
		throw error
	} finally {
		clearTimeout(timeout)
	}

	if (!response.ok) {
		throw new Error(`Diagnostic upload failed (${response.status})`)
	}

	const data: WorkerUploadResponse = await response.json()
	if (typeof data.report_id !== 'string' || data.report_id.length === 0) {
		throw new Error('Diagnostic upload response did not include report_id')
	}
	if (data.report_id !== normalizedReportId) {
		throw new Error('Diagnostic upload response report_id did not match request')
	}

	return {reportId: normalizedReportId, diagnosticUrl: typeof data.diagnostic_url === 'string' && data.diagnostic_url.length > 0 ? data.diagnostic_url : null, rawBytes: payload.rawBytes, compressedBytes: payload.compressedBytes, truncated: payload.truncated, sha256: payload.sha256}
}

function normalizeReportId(reportId: string): string {
	const normalized = reportId.trim().toLowerCase()
	if (!REPORT_ID_PATTERN.test(normalized)) {
		throw new Error('Invalid feedback report id')
	}
	return normalized
}

function redactDiagnosticLog(value: string): string {
	return value
		.replace(/\/home\/[^/\s]+/g, '/home/<user>')
		.replace(/\/Users\/[^/\s]+/g, '/Users/<user>')
		.replace(/[A-Z]:\\Users\\[^\\\r\n]+/g, 'C:\\Users\\<user>')
		.replace(/([?&](?:access_)?token=)[^&\s]+/gi, '$1<redacted>')
		.replace(/([?&](?:api_)?key=)[^&\s]+/gi, '$1<redacted>')
		.replace(/([?&](?:password|passwd|secret|session|auth|cookie)=)[^&\s]+/gi, '$1<redacted>')
}

function isAbortError(error: unknown): boolean {
	return typeof DOMException !== 'undefined' && error instanceof DOMException ? error.name === 'AbortError' : error instanceof Error && error.name === 'AbortError'
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
	const copy = new Uint8Array(buffer.byteLength)
	copy.set(buffer)
	return copy.buffer
}
