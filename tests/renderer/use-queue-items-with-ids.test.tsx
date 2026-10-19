import {renderHook} from '@testing-library/react'
import {describe, expect, it, vi} from 'vite-plus/test'
import type {QueueItem} from '@shared/types.js'
import {useQueueItemsWithIds} from '@renderer/components/queue/useQueueItemsWithIds.js'
import {makeItem} from '../shared/fixtures.js'

function item(id: string, progressPercent = 0): QueueItem {
	return makeItem({id, status: 'running', progressPercent})
}

describe('useQueueItemsWithIds', () => {
	it('does not rescan the queue when re-rendered with the same queue and ids', () => {
		const queue = [item('a'), item('b')]
		const ids = new Set(['a'])
		const scan = vi.spyOn(queue, 'filter')
		const {result, rerender} = renderHook(() => useQueueItemsWithIds(queue, ids))
		const first = result.current
		rerender()
		rerender()
		expect(result.current).toBe(first)
		expect(scan).toHaveBeenCalledTimes(1)
	})

	it('keeps the previous array when a new queue holds the same matching items', () => {
		const a = item('a')
		const ids = new Set(['a'])
		const {result, rerender} = renderHook(({queue}: {queue: QueueItem[]}) => useQueueItemsWithIds(queue, ids), {initialProps: {queue: [a, item('b', 10)]}})
		const first = result.current
		rerender({queue: [a, item('b', 20)]})
		expect(result.current).toBe(first)
		expect(result.current).toEqual([a])
	})

	it('returns a new array when a matching item changes or the ids change', () => {
		const a = item('a')
		const b = item('b')
		const {result, rerender} = renderHook(({queue, ids}: {queue: QueueItem[]; ids: ReadonlySet<string>}) => useQueueItemsWithIds(queue, ids), {initialProps: {queue: [a, b], ids: new Set(['a'])}})
		const first = result.current
		const changedA = {...a, progressPercent: 50}
		rerender({queue: [changedA, b], ids: new Set(['a'])})
		expect(result.current).not.toBe(first)
		expect(result.current).toEqual([changedA])
		rerender({queue: [changedA, b], ids: new Set(['a', 'b'])})
		expect(result.current).toEqual([changedA, b])
	})
})
