// @vitest-environment node

import {gzipSync} from 'node:zlib'
import {describe, expect, it, vi} from 'vite-plus/test'
import {feedbackResult, readFeedback, readGzipText} from '../../workers/feedback-viewer/src/feedbackLog.js'
import worker, {type ViewerEnv} from '../../workers/feedback-viewer/src/index.js'

function makeEnv(overrides: Partial<Pick<ViewerEnv, 'CF_ACCESS_AUD' | 'CF_ACCESS_TEAM_DOMAIN'>> = {}): ViewerEnv {
	const assets = {fetch: async () => new Response('asset', {status: 200})}
	// The handler only touches ASSETS.fetch and the Access vars on these paths.
	return {ASSETS: assets as unknown as Fetcher, CF_ACCESS_TEAM_DOMAIN: 'https://team.cloudflareaccess.com', CF_ACCESS_AUD: 'aud', ...overrides}
}

const LOG_URL = 'https://orionus.dev/arroxy/api/admin/feedback-log?report_id=11111111-1111-4111-8111-111111111111'
const REPORT_ID = '0f7559ce-10de-4122-801a-97d39a366fa4'

// An R2 bucket holding `objects` by key; get() answers what readFeedback reads.
function bucketWith(objects: Record<string, string | Uint8Array>): R2Bucket {
	return {
		get: async (key: string) => {
			const value = objects[key]
			if (value === undefined) return null
			const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
			return {key, size: bytes.byteLength, uploaded: new Date('2026-10-23T09:39:00Z'), customMetadata: {rawBytes: '42', truncated: 'false', sha256: 'abc'}, body: new Blob([new Uint8Array(bytes)]).stream(), text: async () => new TextDecoder().decode(bytes)}
		}
	} as unknown as R2Bucket
}

const STORED_ANSWERS = {
	version: 1,
	reportId: REPORT_ID,
	submissionId: 'OQqzjXk',
	formId: 'Ek6M8B',
	formName: 'Arroxy feedback or bug report',
	submittedAt: '2026-10-23T09:38:55.000Z',
	answers: [
		{label: 'app_version', type: 'HIDDEN_FIELDS', value: '0.7.4'},
		{label: 'What are you sending?', type: 'MULTIPLE_CHOICE', value: ['I have an idea']},
		{label: 'Screenshot', type: 'FILE_UPLOAD', value: [{name: 'shot.jpg', url: 'https://storage.tally.so/private/shot.jpg', mimeType: 'image/jpeg', size: 30839}]}
	]
}

describe('feedback viewer Worker', () => {
	it('rejects non-GET requests to the log API', async () => {
		const response = await worker.fetch(new Request(LOG_URL, {method: 'POST'}), makeEnv())
		expect(response.status).toBe(405)
	})

	it('requires a Cloudflare Access token', async () => {
		const response = await worker.fetch(new Request(LOG_URL), makeEnv())
		expect(response.status).toBe(403)
		expect(await response.json()).toMatchObject({error: 'access_required'})
	})

	it('refuses to run without Access configuration', async () => {
		const response = await worker.fetch(new Request(LOG_URL), makeEnv({CF_ACCESS_AUD: undefined}))
		expect(response.status).toBe(503)
	})

	it('answers unknown API paths with a JSON 404 and serves other paths from assets', async () => {
		const unknown = await worker.fetch(new Request('https://orionus.dev/arroxy/api/admin/other'), makeEnv())
		expect(unknown.status).toBe(404)
		expect(await unknown.json()).toEqual({error: 'not_found'})

		const asset = await worker.fetch(new Request('https://orionus.dev/arroxy/admin/feedback/'), makeEnv())
		expect(await asset.text()).toBe('asset')
	})
})

describe('feedback log reading', () => {
	const stream = (bytes: Uint8Array) => new Blob([new Uint8Array(bytes)]).stream()

	it('decodes gzip logs within the cap and stops past it', async () => {
		expect(await readGzipText(stream(gzipSync(Buffer.from('line one\nline two ✓\n'))), 1024)).toBe('line one\nline two ✓\n')

		// ~1 KB compressed, 4 MB expanded: a miniature gzip bomb.
		const bomb = gzipSync(Buffer.alloc(4 * 1024 * 1024, 0x61))
		expect(bomb.byteLength).toBeLessThan(10_000)
		expect(await readGzipText(stream(bomb), 1024 * 1024)).toBeNull()
	})

	it('finds a report’s log and its Tally answers together', async () => {
		const bucket = bucketWith({[`feedback/2026-10-23/${REPORT_ID}.log.gz`]: gzipSync(Buffer.from('main.log tail\n')), [`feedback/by-report/${REPORT_ID}.answers.json`]: JSON.stringify(STORED_ANSWERS)})

		const found = await readFeedback(bucket, REPORT_ID, '2026-10-23')

		expect(found.log).toMatchObject({key: `feedback/2026-10-23/${REPORT_ID}.log.gz`, text: 'main.log tail\n', metadata: {rawBytes: '42', truncated: 'false'}})
		expect(found.answers).toEqual({key: `feedback/by-report/${REPORT_ID}.answers.json`, submission: STORED_ANSWERS})
	})

	it('finds the answers of a report that has no log', async () => {
		const found = await readFeedback(bucketWith({[`feedback/by-report/${REPORT_ID}.answers.json`]: JSON.stringify(STORED_ANSWERS)}), REPORT_ID, null)

		expect(found.log).toBeNull()
		expect(found.answers).toMatchObject({submission: {formName: 'Arroxy feedback or bug report'}})
	})

	it('reports an answers file it cannot read as unreadable, and logs it', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		try {
			const key = `feedback/by-report/${REPORT_ID}.answers.json`
			const cases = ['{"version":2}', 'not json', JSON.stringify({...STORED_ANSWERS, submissionId: 42}), JSON.stringify({...STORED_ANSWERS, answers: [{type: 'TEXTAREA', value: 'no label'}]})]
			for (const stored of cases) {
				expect(await readFeedback(bucketWith({[key]: stored}), REPORT_ID, null)).toEqual({log: null, answers: 'unreadable'})
			}
			expect(error).toHaveBeenCalledTimes(cases.length)
			expect(error).toHaveBeenNthCalledWith(1, 'feedback viewer: unreadable answers', {key})
		} finally {
			error.mockRestore()
		}
	})

	it('keeps the answers when the log is over the cap', async () => {
		const found = await readFeedback(bucketWith({[`feedback/2026-10-23/${REPORT_ID}.log.gz`]: gzipSync(Buffer.alloc(21 * 1024 * 1024, 0x61)), [`feedback/by-report/${REPORT_ID}.answers.json`]: JSON.stringify(STORED_ANSWERS)}), REPORT_ID, '2026-10-23')

		expect(found.log).toBe('too-large')
		expect(feedbackResult(REPORT_ID, found, {email: null})).toMatchObject({status: 200, body: {log: null, logProblem: 'too_large', answers: {submission: {submissionId: 'OQqzjXk'}}, answersProblem: null}})
	})

	it('keeps the answers when the log is not valid gzip, naming it corrupt and logging it', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		try {
			const found = await readFeedback(bucketWith({[`feedback/2026-10-23/${REPORT_ID}.log.gz`]: new Uint8Array([31, 139, 8, 0, 1, 2, 3]), [`feedback/by-report/${REPORT_ID}.answers.json`]: JSON.stringify(STORED_ANSWERS)}), REPORT_ID, '2026-10-23')

			expect(found.log).toBe('corrupt')
			expect(feedbackResult(REPORT_ID, found, {email: null})).toMatchObject({status: 200, body: {log: null, logProblem: 'corrupt', answers: {submission: {submissionId: 'OQqzjXk'}}}})
			expect(error.mock.calls[0]?.[0]).toBe('feedback viewer: unreadable log')
		} finally {
			error.mockRestore()
		}
	})

	it('answers 404 only when neither half exists, and 413 when only an oversized log does', () => {
		const access = {email: null}
		expect(feedbackResult(REPORT_ID, {log: null, answers: null}, access).status).toBe(404)
		expect(feedbackResult(REPORT_ID, {log: 'too-large', answers: null}, access)).toMatchObject({status: 413, body: {error: 'log_too_large'}})
		expect(feedbackResult(REPORT_ID, {log: null, answers: 'unreadable'}, access)).toMatchObject({status: 200, body: {answers: null, answersProblem: 'unreadable'}})
	})
})
