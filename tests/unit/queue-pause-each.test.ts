// @vitest-environment node

import {describe, it, expect} from 'vite-plus/test'
import {pauseEach} from '@main/services/download/queuePauseEach.js'
import {ok} from '@shared/result.js'
import type {QueueItemStatus} from '@shared/schemas.js'

function run(statuses: Record<string, QueueItemStatus | undefined>) {
	return pauseEach(Object.keys(statuses), {pause: () => Promise.resolve(ok(undefined)), statusOf: itemId => statuses[itemId]})
}

describe('pauseEach', () => {
	it('counts a row that went back to pending mid-pass and was held as done', async () => {
		const outcome = await run({held: 'paused-held', active: 'paused-active'})

		expect(outcome).toEqual({done: ['held', 'active'], failed: []})
	})

	it('reports a row that a successful pause left unpaused as failed with the validation kind', async () => {
		const outcome = await run({stillRunning: 'running', gone: undefined})

		expect(outcome.done).toEqual([])
		expect(outcome.failed).toEqual([
			{itemId: 'stillRunning', error: expect.objectContaining({code: 'validation'})},
			{itemId: 'gone', error: expect.objectContaining({code: 'validation'})}
		])
	})
})
