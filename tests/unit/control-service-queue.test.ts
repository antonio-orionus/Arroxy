// @vitest-environment node

import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {fail} from '@shared/result.js'
import type {QueueItemStatus} from '@shared/schemas.js'
import type {QueueItem} from '@shared/types.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {makeItem} from '../shared/fixtures.js'
import {errorOf, harness, resultOf, UNRESOLVED, type Harness} from '../helpers/controlServiceHarness.js'

// One item at a time through the queue of record, refused up front when the
// item is unknown or its status does not allow the action, and the whole
// queue's pause and resume with their partial outcomes.

function row(id: string, status: QueueItemStatus): QueueItem {
	if (status === 'probing') return makeItem({id, status, job: UNRESOLVED, probeMode: 'video'})
	if (status === 'needs-choice') return makeItem({id, status, job: UNRESOLVED, probeMode: 'video', choice: {kind: 'list-size', loaded: 3, capped: true}})
	if (status === 'error') return makeItem({id, status, error: {kind: 'network', raw: 'x'}})
	return makeItem({id, status})
}

type ItemMethod = 'queue.pause' | 'queue.resume' | 'queue.cancel' | 'queue.retry' | 'queue.remove'
type QueueCommand = 'pause' | 'resume' | 'cancel' | 'retry' | 'remove'

const ALLOWED: Record<ItemMethod, {command: QueueCommand; allowed: QueueItemStatus[]}> = {
	'queue.pause': {command: 'pause', allowed: ['pending', 'running']},
	'queue.resume': {command: 'resume', allowed: ['paused-held', 'paused-active']},
	'queue.cancel': {command: 'cancel', allowed: ['probing', 'needs-choice', 'pending', 'running', 'paused-held', 'paused-active']},
	'queue.retry': {command: 'retry', allowed: ['error', 'cancelled']},
	'queue.remove': {command: 'remove', allowed: ['probing', 'needs-choice', 'pending', 'paused-held', 'paused-active', 'done', 'error', 'cancelled']}
}
const STATUSES: QueueItemStatus[] = ['probing', 'needs-choice', 'pending', 'running', 'paused-held', 'paused-active', 'done', 'error', 'cancelled']

describe('ControlService queue commands', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	for (const [method, {command, allowed}] of Object.entries(ALLOWED) as [ItemMethod, (typeof ALLOWED)[ItemMethod]][]) {
		describe(method, () => {
			it.each(STATUSES)(`from %s`, async status => {
				h.put(row('a', status))
				const response = await h.send(method, {itemId: 'a'})
				if (allowed.includes(status)) {
					expect(response.ok).toBe(true)
					expect(h.queue[command]).toHaveBeenCalledWith('a')
				} else {
					expect(errorOf(response).code).toBe('invalid_state')
					expect(h.queue[command]).not.toHaveBeenCalled()
				}
			})

			it('answers not_found for an unknown item', async () => {
				expect(errorOf(await h.send(method, {itemId: 'nope'})).code).toBe('not_found')
			})
		})
	}

	it('answers the item as it is after the command', async () => {
		h.put(row('a', 'running'))
		h.queue.pause.mockImplementationOnce(itemId => {
			h.put(row(itemId, 'paused-active'))
			return Promise.resolve({ok: true, data: undefined})
		})
		expect(resultOf('queue.pause', await h.send('queue.pause', {itemId: 'a'})).item).toMatchObject({id: 'a', status: 'paused'})
	})

	it('answers a cancelled placeholder as cancelled, though the queue dropped its row', async () => {
		h.put(row('p', 'probing'))
		expect(resultOf('queue.cancel', await h.send('queue.cancel', {itemId: 'p'})).item).toMatchObject({id: 'p', status: 'cancelled', progress: null})
	})

	it('sends a probe failure to intake.retry, never resetting its row', async () => {
		h.put(makeItem({id: 'pf', status: 'error', job: UNRESOLVED, probeMode: 'video', error: {kind: 'network', raw: 'x'}}))
		expect(errorOf(await h.send('queue.retry', {itemId: 'pf'})).code).toBe('invalid_state')
		expect(h.queue.retry).not.toHaveBeenCalled()
	})

	it('answers queue.remove with the item id', async () => {
		h.put(row('d', 'done'))
		expect(resultOf('queue.remove', await h.send('queue.remove', {itemId: 'd'}))).toEqual({itemId: 'd'})
	})

	it("answers the queue's refusal through the error table, without its message", async () => {
		h.put(row('a', 'paused-active'))
		h.queue.resume.mockResolvedValueOnce(fail(createAppError('conflict', 'The download is still pausing; job /tmp/arroxy-1')))
		const error = errorOf(await h.send('queue.resume', {itemId: 'a'}))
		expect(error).toMatchObject({code: 'invalid_state', retryable: true})
		expect(error.message).not.toContain('/tmp/')
	})

	it('answers internal when the queue throws', async () => {
		h.put(row('a', 'pending'))
		h.queue.pause.mockRejectedValueOnce(new Error('boom'))
		expect(errorOf(await h.send('queue.pause', {itemId: 'a'})).code).toBe('internal')
	})

	it('pauses the whole queue with its partial outcome, failures by public code', async () => {
		h.queue.pauseAll.mockResolvedValueOnce({scheduler: 'paused', done: ['a'], failed: [{itemId: 'b', error: createAppError('download', 'kill failed /tmp/x')}]})
		expect(resultOf('queue.pauseAll', await h.send('queue.pauseAll', {}))).toEqual({scheduler: 'paused', done: ['a'], failed: [{itemId: 'b', code: 'internal'}]})
	})

	it('resumes the whole queue', async () => {
		h.queue.resumeAll.mockResolvedValueOnce({scheduler: 'running', done: ['a', 'b'], failed: []})
		expect(resultOf('queue.resumeAll', await h.send('queue.resumeAll', {}))).toEqual({scheduler: 'running', done: ['a', 'b'], failed: []})
	})
})
