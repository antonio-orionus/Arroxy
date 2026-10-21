import {describe, expect, it} from 'vite-plus/test'
import {controlEnvelopeSchema, controlEventEnvelopeSchema, controlRequestEnvelopeSchema, controlResponseEnvelopeSchema, parseControlRequest, parseControlResult} from '../src/index'

describe('envelopes', () => {
	it('accepts a request, a success, a failure and an event', () => {
		const messages = [
			{type: 'request', id: 'r1', method: 'status', params: {}},
			{type: 'response', id: 'r1', ok: true, result: {anything: 1}},
			{type: 'response', id: 'r1', ok: false, error: {code: 'not_found', message: 'No item q1.', retryable: false, next: 'Check the id.'}},
			{type: 'event', event: 'queue.removed', seq: 0, bootId: 'b1', data: {itemId: 'q1', reason: 'removed'}}
		]
		for (const message of messages) expect(controlEnvelopeSchema.safeParse(message).success).toBe(true)
	})

	it('rejects unknown envelope fields: the envelope is strict', () => {
		expect(controlRequestEnvelopeSchema.safeParse({type: 'request', id: 'r1', method: 'status', params: {}, extra: true}).success).toBe(false)
		expect(controlResponseEnvelopeSchema.safeParse({type: 'response', id: 'r1', ok: true, result: {}, extra: true}).success).toBe(false)
		expect(controlEventEnvelopeSchema.safeParse({type: 'event', event: 'app.status', seq: 1, bootId: 'b1', data: {}, extra: true}).success).toBe(false)
	})

	it('rejects a success that carries an error, and a failure that carries a result', () => {
		expect(controlResponseEnvelopeSchema.safeParse({type: 'response', id: 'r1', ok: true, error: {code: 'internal', message: 'x', retryable: true, next: 'y'}}).success).toBe(false)
		expect(controlResponseEnvelopeSchema.safeParse({type: 'response', id: 'r1', ok: false, result: {}}).success).toBe(false)
	})

	it('lets only a failure carry a null id, for the closing error that answers no request', () => {
		const timeout = {type: 'response', id: null, ok: false, error: {code: 'handshake_timeout', message: 'No hello within 2 s.', retryable: true, next: 'Connect again.'}}
		expect(controlResponseEnvelopeSchema.safeParse(timeout).success).toBe(true)
		expect(controlEnvelopeSchema.safeParse(timeout).success).toBe(true)
		expect(controlResponseEnvelopeSchema.safeParse({type: 'response', id: null, ok: true, result: {}}).success).toBe(false)
		expect(controlRequestEnvelopeSchema.safeParse({type: 'request', id: null, method: 'status'}).success).toBe(false)
		expect(controlResponseEnvelopeSchema.safeParse({type: 'response', ok: false, error: timeout.error}).success).toBe(false)
	})

	it('requires a request id and a non-negative integer event seq', () => {
		expect(controlRequestEnvelopeSchema.safeParse({type: 'request', id: '', method: 'status'}).success).toBe(false)
		expect(controlEventEnvelopeSchema.safeParse({type: 'event', event: 'app.status', seq: -1, bootId: 'b1', data: {}}).success).toBe(false)
		expect(controlEventEnvelopeSchema.safeParse({type: 'event', event: 'app.status', seq: 1.5, bootId: 'b1', data: {}}).success).toBe(false)
		expect(controlEventEnvelopeSchema.safeParse({type: 'event', event: 'app.status', seq: 1, data: {}}).success).toBe(false)
	})
})

describe('parseControlRequest', () => {
	it('types the params of a known method', () => {
		const parsed = parseControlRequest({type: 'request', id: 'r1', method: 'queue.get', params: {itemId: 'q1'}})
		expect(parsed).toEqual({ok: true, request: {type: 'request', id: 'r1', method: 'queue.get', params: {itemId: 'q1'}}})
	})

	it('treats missing params as an empty object', () => {
		expect(parseControlRequest({type: 'request', id: 'r1', method: 'status'})).toEqual({ok: true, request: {type: 'request', id: 'r1', method: 'status', params: {}}})
	})

	it('refuses null params with invalid_request: only missing params mean an empty object', () => {
		const parsed = parseControlRequest({type: 'request', id: 'r1', method: 'queue.pauseAll', params: null})
		expect(parsed.ok).toBe(false)
		if (!parsed.ok) expect(parsed.error.code).toBe('invalid_request')
	})

	it('refuses an unknown method with invalid_request', () => {
		const parsed = parseControlRequest({type: 'request', id: 'r1', method: 'probe', params: {}})
		expect(parsed.ok).toBe(false)
		if (!parsed.ok) expect(parsed.error.code).toBe('invalid_request')
	})

	it('refuses params that do not match the method with invalid_request', () => {
		const parsed = parseControlRequest({type: 'request', id: 'r1', method: 'queue.pause', params: {itemId: null}})
		expect(parsed.ok).toBe(false)
		if (!parsed.ok) {
			expect(parsed.error.code).toBe('invalid_request')
			expect(parsed.error.retryable).toBe(false)
		}
	})
})

describe('parseControlResult', () => {
	it('parses the result of a known method and drops unknown fields', () => {
		const parsed = parseControlResult('links.add', {intakeId: 'i1', placeholderId: 'q1', queuedAt: 3})
		expect(parsed.success && parsed.data).toEqual({intakeId: 'i1', placeholderId: 'q1'})
	})

	it('fails on a result that does not match the method', () => {
		expect(parseControlResult('links.add', {intakeId: 'i1'}).success).toBe(false)
	})
})
