// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {INTAKE_RECORDS_MAX, INTAKE_RETENTION_MS} from '@main/control/IntakeRegistry.js'
import {LinksAddRequests} from '@main/control/LinksAddRequests.js'

// links.add's idempotency store: one call per (client, requestId), answers
// kept for a while and bounded in number, refusals and calls in flight
// treated apart.

function store() {
	const clock = {now: 0}
	return {requests: new LinksAddRequests<string>(() => clock.now), clock}
}

describe('LinksAddRequests', () => {
	it('places once per client and request id', async () => {
		const {requests} = store()
		const place = vi.fn(() => Promise.resolve('intake-1'))
		expect(await requests.run('c1', 'r1', place)).toBe('intake-1')
		expect(await requests.run('c1', 'r1', place)).toBe('intake-1')
		expect(place).toHaveBeenCalledTimes(1)
		await requests.run('c2', 'r1', () => Promise.resolve('intake-2'))
		// The key cannot be forged by joining ids.
		await requests.run('c1\u0000r', '1', () => Promise.resolve('intake-3'))
		expect(await requests.run('c2', 'r1', place)).toBe('intake-2')
	})

	it('counts calls still placing, per client', async () => {
		const {requests} = store()
		let release: (value: string) => void = () => undefined
		const pending = requests.run('c1', 'r1', () => new Promise<string>(resolve => (release = resolve)))
		expect(requests.placing('c1')).toBe(1)
		expect(requests.placing('c2')).toBe(0)
		release('intake-1')
		await pending
		expect(requests.placing('c1')).toBe(0)
	})

	it('forgets a refusal, so the same request id can be sent again', async () => {
		const {requests} = store()
		await expect(requests.run('c1', 'r1', () => Promise.reject(new Error('refused')))).rejects.toThrow('refused')
		expect(await requests.run('c1', 'r1', () => Promise.resolve('intake-1'))).toBe('intake-1')
	})

	it('forgets an answer after the retention window', async () => {
		const {requests, clock} = store()
		await requests.run('c1', 'r1', () => Promise.resolve('old'))
		clock.now += INTAKE_RETENTION_MS
		expect(await requests.run('c1', 'r1', () => Promise.resolve('new'))).toBe('new')
	})

	it('keeps at most the bound, forgetting the oldest answers first and never a call in flight', async () => {
		const {requests} = store()
		const inFlight = requests.run('c1', 'in-flight', () => new Promise<string>(() => undefined))
		for (let index = 0; index <= INTAKE_RECORDS_MAX; index++) await requests.run('c1', `r${index}`, () => Promise.resolve(`a${index}`))
		await requests.run('c1', 'trigger', () => Promise.resolve('t'))
		expect(await requests.run('c1', 'r0', () => Promise.resolve('again'))).toBe('again')
		expect(await requests.run('c1', `r${INTAKE_RECORDS_MAX}`, () => Promise.resolve('again'))).toBe(`a${INTAKE_RECORDS_MAX}`)
		expect(requests.run('c1', 'in-flight', () => Promise.resolve('again'))).toBe(inFlight)
	})
})
