// @vitest-environment node

import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

const fsMock = vi.hoisted(() => ({mkdir: vi.fn(), writeFile: vi.fn(), unlink: vi.fn()}))

vi.mock('node:fs/promises', () => fsMock)

describe('changeQueueOutputTarget', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('updates outputDir only for pending items that never started', async () => {
		const {changeQueueOutputTarget} = await import('@main/services/queueOutputTargetMove.js')
		let item = makeItem({id: 'fresh', status: 'pending', outputDir: '/mnt/source', progressPercent: 0})
		fsMock.mkdir.mockResolvedValue(undefined)
		fsMock.writeFile.mockResolvedValue(undefined)
		fsMock.unlink.mockResolvedValue(undefined)

		const result = await changeQueueOutputTarget(
			{
				findItem: () => item,
				patchItem: (_itemId: string, _reason: string, patcher: (item: QueueItem) => QueueItem) => {
					item = patcher(item)
				}
			},
			['cross-device'],
			'/mnt/target'
		)

		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.data.items).toEqual([{itemId: 'fresh', moved: [], missing: []}])
		expect(item.outputDir).toBe('/mnt/target')
	})

	it('does not create the output directory when no selected item can move', async () => {
		const {changeQueueOutputTarget} = await import('@main/services/queueOutputTargetMove.js')
		const done = makeItem({id: 'done', status: 'done', outputDir: '/mnt/source'})

		const result = await changeQueueOutputTarget({findItem: itemId => (itemId === done.id ? done : undefined), patchItem: vi.fn()}, ['missing', 'done'], '/mnt/target')

		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.data.items).toEqual([])
		expect(result.data.skipped).toEqual([
			{itemId: 'missing', reason: 'not-found'},
			{itemId: 'done', status: 'done', reason: 'invalid-status'}
		])
		expect(fsMock.mkdir).not.toHaveBeenCalled()
		expect(fsMock.writeFile).not.toHaveBeenCalled()
	})

	it('fails without patching when an existing output directory is not writable', async () => {
		const {changeQueueOutputTarget} = await import('@main/services/queueOutputTargetMove.js')
		let item = makeItem({id: 'fresh', status: 'pending', outputDir: '/mnt/source', progressPercent: 0})
		fsMock.mkdir.mockResolvedValue(undefined)
		fsMock.writeFile.mockRejectedValue(new Error('EACCES'))

		const result = await changeQueueOutputTarget(
			{
				findItem: () => item,
				patchItem: (_itemId: string, _reason: string, patcher: (item: QueueItem) => QueueItem) => {
					item = patcher(item)
				}
			},
			['fresh'],
			'/mnt/readonly'
		)

		expect(result.ok).toBe(false)
		expect(item.outputDir).toBe('/mnt/source')
		expect(fsMock.mkdir).toHaveBeenCalledWith('/mnt/readonly', {recursive: true})
		expect(fsMock.writeFile).toHaveBeenCalledOnce()
	})

	it('revalidates item eligibility after the async directory probe', async () => {
		const {changeQueueOutputTarget} = await import('@main/services/queueOutputTargetMove.js')
		const pending = makeItem({id: 'fresh', status: 'pending', outputDir: '/mnt/source', progressPercent: 0})
		const running = makeItem({id: 'fresh', status: 'running', outputDir: '/mnt/source', progressPercent: 12, lastJobId: 'job-1'})
		let lookupCount = 0
		const patchItem = vi.fn()
		fsMock.mkdir.mockResolvedValue(undefined)
		fsMock.writeFile.mockResolvedValue(undefined)
		fsMock.unlink.mockResolvedValue(undefined)

		const result = await changeQueueOutputTarget(
			{
				findItem: () => {
					lookupCount += 1
					return lookupCount === 1 ? pending : running
				},
				patchItem
			},
			['fresh'],
			'/mnt/target'
		)

		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.data.items).toEqual([])
		expect(result.data.skipped).toEqual([{itemId: 'fresh', status: 'running', reason: 'invalid-status'}])
		expect(patchItem).not.toHaveBeenCalled()
	})
})
