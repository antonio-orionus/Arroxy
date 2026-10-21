// @vitest-environment node

import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {CONTROL_WAITS_PER_SESSION} from '@main/control/ControlService.js'
import {makeItem} from '../shared/fixtures.js'
import {context, errorOf, harness, resultOf, SINK, type Harness} from '../helpers/controlServiceHarness.js'

// wait holds a request until its intake or item reaches `settled` or `done`,
// listening (never polling), and answers the current state at the timeout.
// events.subscribe and events.unsubscribe hand the session's sink to the
// event feed; closing the session ends both.

describe('ControlService wait', () => {
	let h: Harness
	beforeEach(() => {
		vi.useFakeTimers()
		h = harness()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	// Listeners the session holds on the queue and on the registry.
	function listening(): {queue: number; registry: () => number} {
		return {queue: h.queueListeners.size, registry: () => registryListeners}
	}
	let registryListeners = 0
	beforeEach(() => {
		registryListeners = 0
		const onChange = h.registry.onChange.bind(h.registry)
		vi.spyOn(h.registry, 'onChange').mockImplementation(listener => {
			registryListeners++
			const stop = onChange(listener)
			return () => {
				registryListeners--
				return stop()
			}
		})
	})

	async function addLink(requestId = 'r1'): Promise<{intakeId: string; placeholderId: string}> {
		return resultOf('links.add', await h.send('links.add', {requestId, url: `https://example.com/${requestId}`}))
	}

	it('answers an intake once it settles', async () => {
		const {intakeId, placeholderId} = await addLink()
		const waiting = h.send('wait', {intakeId, until: 'settled', timeoutMs: 60_000})
		await vi.advanceTimersByTimeAsync(1000)
		h.put(makeItem({id: placeholderId, status: 'pending', origin: {kind: 'localClient', clientId: 'client-1', intakeId}}))
		h.outcome(intakeId, {kind: 'queued', itemId: placeholderId, skippedAlreadyQueued: 0})
		const result = resultOf('wait', await waiting)
		expect(result).toEqual({reached: true, target: {kind: 'intake', intake: expect.objectContaining({intakeId, state: {state: 'queued', itemIds: [placeholderId]}})}})
		expect(listening().queue).toBe(0)
		expect(listening().registry()).toBe(0)
	})

	it('answers an intake done once every row it made is done', async () => {
		const {intakeId, placeholderId} = await addLink()
		const origin = {kind: 'localClient', clientId: 'client-1', intakeId} as const
		h.put(makeItem({id: placeholderId, status: 'pending', origin}))
		h.put(makeItem({id: 'second', status: 'pending', origin}))
		h.outcome(intakeId, {kind: 'queued', itemId: placeholderId, skippedAlreadyQueued: 0})
		const waiting = h.send('wait', {intakeId, until: 'done', timeoutMs: 60_000})
		let answered = false
		void waiting.then(() => {
			answered = true
		})
		h.put(makeItem({id: placeholderId, status: 'done', origin}))
		await vi.advanceTimersByTimeAsync(0)
		expect(answered).toBe(false)
		h.put(makeItem({id: 'second', status: 'done', origin}))
		expect(resultOf('wait', await waiting).reached).toBe(true)
	})

	it('counts a done row the queue took out since as done', async () => {
		const {intakeId, placeholderId} = await addLink()
		const origin = {kind: 'localClient', clientId: 'client-1', intakeId} as const
		h.put(makeItem({id: placeholderId, status: 'pending', origin}))
		h.outcome(intakeId, {kind: 'queued', itemId: placeholderId, skippedAlreadyQueued: 0})
		const waiting = h.send('wait', {intakeId, until: 'done', timeoutMs: 60_000})
		h.put(makeItem({id: placeholderId, status: 'done', origin}))
		h.drop(placeholderId, 'autoRemoved')
		expect(resultOf('wait', await waiting).reached).toBe(true)
	})

	it('never reports an intake done once one of its rows was taken out unfinished', async () => {
		const {intakeId, placeholderId} = await addLink()
		const origin = {kind: 'localClient', clientId: 'client-1', intakeId} as const
		h.put(makeItem({id: placeholderId, status: 'pending', origin}))
		h.put(makeItem({id: 'second', status: 'pending', origin}))
		h.outcome(intakeId, {kind: 'queued', itemId: placeholderId, skippedAlreadyQueued: 0})
		const waiting = h.send('wait', {intakeId, until: 'done', timeoutMs: 30_000})
		h.drop('second', 'removed')
		h.put(makeItem({id: placeholderId, status: 'done', origin}))
		h.drop(placeholderId, 'autoRemoved')
		await vi.advanceTimersByTimeAsync(30_000)
		expect(resultOf('wait', await waiting)).toMatchObject({reached: false, target: {kind: 'intake', intake: {state: {state: 'queued'}}}})
	})

	it('listens once for all its waits, and re-reads only for the targets a change touches', async () => {
		h.put(makeItem({id: 'a', status: 'running'}))
		h.put(makeItem({id: 'b', status: 'running'}))
		const first = h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 60_000})
		const second = h.send('wait', {itemId: 'a', until: 'settled', timeoutMs: 60_000})
		await vi.advanceTimersByTimeAsync(0)
		expect(h.queueListeners.size).toBe(1)
		h.queue.snapshot.mockClear()
		for (let tick = 1; tick <= 10; tick++) h.put(makeItem({id: 'b', status: 'running', progressPercent: tick}))
		expect(h.queue.snapshot).not.toHaveBeenCalled()
		h.put(makeItem({id: 'a', status: 'done'}))
		expect(resultOf('wait', await first).reached).toBe(true)
		expect(resultOf('wait', await second).reached).toBe(true)
		expect(h.queueListeners.size).toBe(0)
	})

	it(`holds at most ${CONTROL_WAITS_PER_SESSION} waits per session`, async () => {
		h.put(makeItem({id: 'a', status: 'running'}))
		const held = Array.from({length: CONTROL_WAITS_PER_SESSION}, () => h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 60_000}))
		await vi.advanceTimersByTimeAsync(0)
		const refused = errorOf(await h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 60_000}))
		expect(refused).toMatchObject({code: 'limit_exceeded', retryable: true, details: {limit: CONTROL_WAITS_PER_SESSION}})
		// Another session has its own.
		const elsewhere = h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 0}, context('client-2'))
		await vi.advanceTimersByTimeAsync(0)
		expect(resultOf('wait', await elsewhere).reached).toBe(false)
		h.put(makeItem({id: 'a', status: 'done'}))
		await Promise.all(held)
		expect(resultOf('wait', await h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 0})).reached).toBe(true)
	})

	it('answers an item settled when it stops moving on its own, done only when done', async () => {
		h.put(makeItem({id: 'a', status: 'running'}))
		const settled = h.send('wait', {itemId: 'a', until: 'settled', timeoutMs: 60_000})
		const done = h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 60_000})
		h.put(makeItem({id: 'a', status: 'paused-active', tempDir: '/tmp/x'}))
		expect(resultOf('wait', await settled)).toEqual({reached: true, target: {kind: 'item', item: expect.objectContaining({id: 'a', status: 'paused'})}})
		h.put(makeItem({id: 'a', status: 'done'}))
		expect(resultOf('wait', await done).target).toMatchObject({kind: 'item', item: {status: 'done'}})
	})

	it('answers at once when the target is already there', async () => {
		h.put(makeItem({id: 'a', status: 'done'}))
		expect(resultOf('wait', await h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 60_000})).reached).toBe(true)
		expect(listening().queue).toBe(0)
	})

	it('answers the current state with reached false at the timeout', async () => {
		h.put(makeItem({id: 'a', status: 'running', progressPercent: 10}))
		const waiting = h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 30_000})
		h.put(makeItem({id: 'a', status: 'running', progressPercent: 55}))
		await vi.advanceTimersByTimeAsync(30_000)
		const result = resultOf('wait', await waiting)
		expect(result).toEqual({reached: false, target: {kind: 'item', item: expect.objectContaining({status: 'running', progress: expect.objectContaining({percent: 55})})}})
		expect(listening().queue).toBe(0)
		expect(listening().registry()).toBe(0)
	})

	it('answers a zero timeout with the state as it is', async () => {
		const {intakeId} = await addLink()
		const waiting = h.send('wait', {intakeId, until: 'settled', timeoutMs: 0})
		await vi.advanceTimersByTimeAsync(0)
		expect(resultOf('wait', await waiting)).toMatchObject({reached: false, target: {kind: 'intake', intake: {state: {state: 'probing'}}}})
	})

	it('answers not_found for an unknown id, and for an item that left the queue', async () => {
		expect(errorOf(await h.send('wait', {itemId: 'nope', until: 'settled', timeoutMs: 1000})).code).toBe('not_found')
		expect(errorOf(await h.send('wait', {intakeId: 'nope', until: 'settled', timeoutMs: 1000})).code).toBe('not_found')
		h.put(makeItem({id: 'a', status: 'running'}))
		const waiting = h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 60_000})
		h.drop('a', 'removed')
		expect(errorOf(await waiting).code).toBe('not_found')
		expect(listening().queue).toBe(0)
	})

	it('ends its waits when the session closes', async () => {
		h.put(makeItem({id: 'a', status: 'running'}))
		const session = h.session()
		const waiting = h.send('wait', {itemId: 'a', until: 'done', timeoutMs: 60_000})
		await vi.advanceTimersByTimeAsync(10)
		expect(listening().queue).toBe(1)
		session.close()
		expect(errorOf(await waiting).code).toBe('internal')
		expect(listening().queue).toBe(0)
		expect(listening().registry()).toBe(0)
		expect(vi.getTimerCount()).toBe(0)
	})
})

describe('ControlService events', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	it('subscribes the session sink with a snapshot by default, answering the boot id', async () => {
		expect(resultOf('events.subscribe', await h.send('events.subscribe', {}))).toEqual({bootId: h.registry.bootId})
		expect(h.feed.subscribe).toHaveBeenCalledWith(SINK, {context: context(), snapshot: true})
	})

	it('subscribes without a snapshot when asked', async () => {
		await h.send('events.subscribe', {snapshot: false})
		expect(h.feed.subscribe).toHaveBeenCalledWith(SINK, expect.objectContaining({snapshot: false}))
	})

	it('replaces the subscription on a second subscribe', async () => {
		await h.send('events.subscribe', {})
		await h.send('events.subscribe', {})
		expect(h.subscriptions[0]?.close).toHaveBeenCalledTimes(1)
		expect(h.subscriptions[1]?.close).not.toHaveBeenCalled()
	})

	it('unsubscribes, and answers an unsubscribe with nothing to end', async () => {
		expect(resultOf('events.unsubscribe', await h.send('events.unsubscribe', {}))).toEqual({})
		await h.send('events.subscribe', {})
		expect(resultOf('events.unsubscribe', await h.send('events.unsubscribe', {}))).toEqual({})
		expect(h.subscriptions[0]?.close).toHaveBeenCalledTimes(1)
	})

	it('ends the subscription when the session closes, and answers nothing after', async () => {
		await h.send('events.subscribe', {})
		h.session().close()
		expect(h.subscriptions[0]?.close).toHaveBeenCalledTimes(1)
		expect(errorOf(await h.send('status', {})).code).toBe('internal')
	})
})
