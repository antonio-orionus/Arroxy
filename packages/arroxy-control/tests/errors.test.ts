import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_ERROR_CODES, CONTROL_ERROR_TABLE, controlError, controlErrorSchema} from '../src/index'

describe('error table', () => {
	it('has the v1 codes', () => {
		expect([...CONTROL_ERROR_CODES].sort()).toEqual(['not_found', 'invalid_state', 'invalid_request', 'profile_unavailable', 'desktop_required', 'approval_pending', 'unauthorized', 'rate_limited', 'limit_exceeded', 'unsupported_site', 'probe_failed', 'version_unsupported', 'handshake_timeout', 'internal'].sort())
	})

	it('gives every code a retryable flag and a one-line next step', () => {
		for (const code of CONTROL_ERROR_CODES) {
			const entry = CONTROL_ERROR_TABLE[code]
			expect(typeof entry.retryable).toBe('boolean')
			expect(entry.next.length).toBeGreaterThan(0)
			expect(entry.next).not.toContain('\n')
		}
	})

	it('retries only what can succeed unchanged later', () => {
		const retryable = CONTROL_ERROR_CODES.filter(code => CONTROL_ERROR_TABLE[code].retryable).sort()
		expect(retryable).toEqual(['approval_pending', 'handshake_timeout', 'internal', 'probe_failed', 'rate_limited'])
	})
})

describe('controlError', () => {
	it('fills retryable and next from the table', () => {
		const error = controlError('not_found', 'No queue item q9.')
		expect(error).toEqual({code: 'not_found', message: 'No queue item q9.', retryable: false, next: CONTROL_ERROR_TABLE.not_found.next})
		expect(controlErrorSchema.parse(error)).toEqual(error)
	})

	it('lets an instance override retryable, as a probe failure does per yt-dlp kind', () => {
		const error = controlError('probe_failed', 'Video unavailable.', {retryable: false, details: {ytdlpKind: 'unavailable'}})
		expect(error.retryable).toBe(false)
		expect(error.details).toEqual({ytdlpKind: 'unavailable'})
	})

	it('names both ranges when no major is shared', () => {
		const error = controlError('version_unsupported', 'No common protocol major.', {details: {clientMajors: [2], serverMajors: [1]}})
		expect(controlErrorSchema.parse(error).details).toEqual({clientMajors: [2], serverMajors: [1]})
	})

	it('bounds an approval id as auth does', () => {
		const error = {code: 'approval_pending', message: 'Waiting for Allow.', retryable: true, next: 'y'}
		expect(controlErrorSchema.safeParse({...error, details: {approvalId: 'a'.repeat(128)}}).success).toBe(true)
		expect(controlErrorSchema.safeParse({...error, details: {approvalId: 'a'.repeat(129)}}).success).toBe(false)
	})

	it('refuses an unknown code', () => {
		expect(controlErrorSchema.safeParse({code: 'teapot', message: 'x', retryable: false, next: 'y'}).success).toBe(false)
	})
})
