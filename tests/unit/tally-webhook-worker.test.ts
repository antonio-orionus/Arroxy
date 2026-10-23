// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import worker from '../../workers/feedback-upload/src/index.js'

type PutFn = (key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions) => Promise<R2Object>

const SECRET = 'test-signing-secret'
const REPORT_ID = '0f7559ce-10de-4122-801a-97d39a366fa4'
const URL_PATH = 'https://orionus.dev/arroxy/api/tally-webhook'

// `secret: null` leaves the signing secret unset.
function makeEnv(secret: string | null = SECRET): {env: Env & {TALLY_SIGNING_SECRET?: string}; put: ReturnType<typeof vi.fn<PutFn>>; limit: ReturnType<typeof vi.fn>} {
	const put = vi.fn<PutFn>(async key => ({key}) as R2Object)
	const limit = vi.fn(async () => ({success: true}))
	const bucket = {put} as unknown as R2Bucket
	return {env: {FEEDBACK_LOGS: bucket, FEEDBACK_UPLOAD_RATE_LIMIT: {limit}, ...(secret === null ? {} : {TALLY_SIGNING_SECRET: secret})}, put, limit}
}

async function sign(body: string, secret = SECRET): Promise<string> {
	const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
	const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
	return btoa(String.fromCharCode(...new Uint8Array(mac)))
}

function submission(hidden: Record<string, string> = {report_id: REPORT_ID, app_version: '0.7.4'}): Record<string, unknown> {
	return {
		eventId: 'evt-1',
		eventType: 'FORM_RESPONSE',
		createdAt: '2026-10-23T09:38:56.000Z',
		data: {
			responseId: 'resp-1',
			submissionId: 'OQqzjXk',
			respondentId: 'resp-x',
			formId: 'Ek6M8B',
			formName: 'Arroxy feedback or bug report',
			createdAt: '2026-10-23T09:38:55.000Z',
			fields: [
				...Object.entries(hidden).map(([label, value]) => ({key: `question_hidden_${label}`, label, type: 'HIDDEN_FIELDS', value})),
				{
					key: 'question_kind',
					label: 'What are you sending?',
					type: 'MULTIPLE_CHOICE',
					value: ['opt-idea'],
					options: [
						{id: 'opt-bug', text: "Something's not working"},
						{id: 'opt-idea', text: 'I have an idea'}
					]
				},
				{key: 'question_text', label: 'What would you like to tell us?', type: 'TEXTAREA', value: 'a frameless mode, please'},
				{key: 'question_shot', label: 'Screenshot', type: 'FILE_UPLOAD', value: [{id: 'f1', name: 'shot.jpg', url: 'https://storage.tally.so/private/shot.jpg', mimeType: 'image/jpeg', size: 30839}]},
				{key: 'question_email', label: 'Your email (only if you want a reply)', type: 'INPUT_EMAIL', value: null}
			]
		}
	}
}

async function post(body: string, headers: Record<string, string>, env: Env): Promise<Response> {
	return worker.fetch(new Request(URL_PATH, {method: 'POST', headers: {'content-type': 'application/json', ...headers}, body}), env)
}

describe('Tally webhook route', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('stores a signed submission’s answers next to the report’s log', async () => {
		const {env, put, limit} = makeEnv()
		const body = JSON.stringify(submission())
		const response = await post(body, {'tally-signature': await sign(body)}, env)

		expect(response.status).toBe(201)
		expect(await response.json()).toEqual({report_id: REPORT_ID, answers_key: `feedback/by-report/${REPORT_ID}.answers.json`})
		expect(limit).not.toHaveBeenCalled()
		expect(put).toHaveBeenCalledOnce()
		const [key, value, options] = put.mock.calls[0] ?? []
		expect(key).toBe(`feedback/by-report/${REPORT_ID}.answers.json`)
		expect(options).toEqual({httpMetadata: {contentType: 'application/json; charset=utf-8'}, customMetadata: {reportId: REPORT_ID, submissionId: 'OQqzjXk', formId: 'Ek6M8B'}})
		expect(typeof value).toBe('string')
		expect(JSON.parse(typeof value === 'string' ? value : '')).toEqual({
			version: 1,
			reportId: REPORT_ID,
			submissionId: 'OQqzjXk',
			formId: 'Ek6M8B',
			formName: 'Arroxy feedback or bug report',
			submittedAt: '2026-10-23T09:38:55.000Z',
			answers: [
				{label: 'report_id', type: 'HIDDEN_FIELDS', value: REPORT_ID},
				{label: 'app_version', type: 'HIDDEN_FIELDS', value: '0.7.4'},
				{label: 'What are you sending?', type: 'MULTIPLE_CHOICE', value: ['I have an idea']},
				{label: 'What would you like to tell us?', type: 'TEXTAREA', value: 'a frameless mode, please'},
				{label: 'Screenshot', type: 'FILE_UPLOAD', value: [{name: 'shot.jpg', url: 'https://storage.tally.so/private/shot.jpg', mimeType: 'image/jpeg', size: 30839}]},
				{label: 'Your email (only if you want a reply)', type: 'INPUT_EMAIL', value: null}
			]
		})
	})

	it.each<[string, (body: string) => Promise<Record<string, string>>]>([
		['a missing signature', async () => ({})],
		['a signature made with another secret', async body => ({'tally-signature': await sign(body, 'another-secret')})],
		['a signature that is not base64', async () => ({'tally-signature': '%%%'})]
	])('refuses %s without writing to R2', async (_name, signatureFor) => {
		const {env, put} = makeEnv()
		const body = JSON.stringify(submission())
		const response = await post(body, await signatureFor(body), env)

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({error: 'invalid_signature'})
		expect(put).not.toHaveBeenCalled()
	})

	it('refuses a body changed after signing', async () => {
		const {env, put} = makeEnv()
		const body = JSON.stringify(submission())
		const response = await post(body.replace('frameless', 'framefull'), {'tally-signature': await sign(body)}, env)

		expect(response.status).toBe(401)
		expect(put).not.toHaveBeenCalled()
	})

	it('answers 503 while the signing secret is not configured', async () => {
		const {env, put} = makeEnv(null)
		const body = JSON.stringify(submission())
		const response = await post(body, {'tally-signature': await sign(body)}, env)

		expect(response.status).toBe(503)
		expect(await response.json()).toEqual({error: 'webhook_not_configured'})
		expect(put).not.toHaveBeenCalled()
	})

	it('acknowledges a signed submission without a report id, storing nothing and logging which form sent it', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const {env, put} = makeEnv()
		const body = JSON.stringify(submission({app_version: '0.7.4'}))
		const response = await post(body, {'tally-signature': await sign(body)}, env)

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({stored: false, reason: 'no_report_id'})
		expect(put).not.toHaveBeenCalled()
		expect(warn).toHaveBeenCalledWith('tally webhook: no report_id hidden field', {submissionId: 'OQqzjXk', formId: 'Ek6M8B', formName: 'Arroxy feedback or bug report'})
	})

	it('treats a malformed report id as missing', async () => {
		const {env, put} = makeEnv()
		const body = JSON.stringify(submission({report_id: '../../etc/passwd'}))
		const response = await post(body, {'tally-signature': await sign(body)}, env)

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({stored: false, reason: 'no_report_id'})
		expect(put).not.toHaveBeenCalled()
	})

	it.each([
		['not JSON', 'not json'],
		['not a form response', JSON.stringify({eventType: 'FORM_RESPONSE', data: {fields: 'nope'}})]
	])('rejects a signed body that is %s, logging why', async (_name, body) => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const {env, put} = makeEnv()
		const response = await post(body, {'tally-signature': await sign(body)}, env)

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({error: 'invalid_payload'})
		expect(put).not.toHaveBeenCalled()
		expect(warn).toHaveBeenCalledWith('tally webhook: invalid payload', {issues: expect.stringMatching(/./) as unknown})
	})

	it('logs a failed R2 write before answering 500, so Tally retries and the cause shows', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const {env, put} = makeEnv()
		put.mockRejectedValueOnce(new Error('R2 unavailable'))
		const body = JSON.stringify(submission())
		const response = await post(body, {'tally-signature': await sign(body)}, env)

		expect(response.status).toBe(500)
		expect(await response.json()).toEqual({error: 'internal_error'})
		expect(error).toHaveBeenCalledWith('feedback worker: unhandled error', {path: '/arroxy/api/tally-webhook', error: 'Error: R2 unavailable'})
	})

	it('accepts only POST', async () => {
		const {env, put} = makeEnv()
		const response = await worker.fetch(new Request(URL_PATH, {method: 'GET'}), env)

		expect(response.status).toBe(405)
		expect(response.headers.get('allow')).toBe('POST')
		expect(put).not.toHaveBeenCalled()
	})

	it('refuses an oversized body before reading it', async () => {
		const {env, put} = makeEnv()
		const response = await post('{}', {'tally-signature': 'x', 'content-length': '262145'}, env)

		expect(response.status).toBe(413)
		expect(put).not.toHaveBeenCalled()
	})
})
