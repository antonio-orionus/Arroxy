import {describe, expect, it, vi} from 'vitest'
import {applyQueueSelectionAction, type QueueSelectionActionHost} from '@main/services/queueSelectionActionApply.js'
import {ok} from '@shared/result.js'
import type {QueueSelectionAction} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

function makeHost(): QueueSelectionActionHost {
	return {
		cancel: vi.fn(async () => ok(undefined)),
		findItem: vi.fn(() => makeItem({id: 'a', status: 'pending'})),
		pause: vi.fn(async () => ok(undefined)),
		remove: vi.fn(async () => ok(undefined)),
		resume: vi.fn(async () => ok(undefined)),
		retry: vi.fn(async () => ok(undefined)),
		setLane: vi.fn(async () => ok(undefined))
	}
}

describe('applyQueueSelectionAction', () => {
	it('fails change-output-target at command level because outputDir is required', async () => {
		const host = makeHost()

		const result = await applyQueueSelectionAction(host, 'change-output-target' as QueueSelectionAction, ['a'])

		expect(result).toEqual({ok: false, error: {code: 'validation', message: 'change-output-target requires outputDir', recoverable: true}})
		expect(host.findItem).not.toHaveBeenCalled()
		expect(host.setLane).not.toHaveBeenCalled()
	})

	it('applies valid generic selection actions', async () => {
		const host = makeHost()

		const result = await applyQueueSelectionAction(host, 'pause', ['a'])

		expect(result).toEqual({ok: true, data: {action: 'pause', appliedIds: ['a'], skipped: []}})
		expect(host.pause).toHaveBeenCalledWith('a')
	})
})
