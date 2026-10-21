// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// Every removal says why the row went: a placeholder the user cancelled or
// removed is gone for good, while one its probe swapped for prepared rows, or
// for none, lives on as its intake's outcome.

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}

class FakeDownloadService extends EventEmitter {
	start = vi.fn().mockResolvedValue(ok({job: {id: 'j', url: ''}}))
	cancel = vi.fn().mockResolvedValue(ok(undefined))
	pause = vi.fn()
	resume = vi.fn()
}

function makeService(): {qs: QueueService; removals: unknown[]} {
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const qs = new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
	void qs.pauseAll()
	const removals: unknown[] = []
	qs.on('removed', event => removals.push(event))
	return {qs, removals}
}

function placeholder(id: string, status: 'probing' | 'needs-choice' = 'probing'): QueueItem {
	return makeItem({id, status, url: `https://youtube.com/playlist?list=${id}`, job: UNRESOLVED, probeMode: 'playlist', ...(status === 'needs-choice' ? {choice: {kind: 'playlist-cap', loaded: 2}} : {})})
}

describe("QueueService 'removed' reasons", () => {
	it('a cancelled placeholder, probing or waiting for a choice, is cancelled', async () => {
		const {qs, removals} = makeService()
		qs.add([placeholder('p1'), placeholder('p2', 'needs-choice')])
		await qs.cancel('p1')
		await qs.cancel('p2')
		expect(removals).toEqual([
			{itemId: 'p1', reason: 'cancelled'},
			{itemId: 'p2', reason: 'cancelled'}
		])
	})

	it('Cancel all takes placeholders out as cancelled', async () => {
		const {qs, removals} = makeService()
		qs.add([placeholder('p1')])
		await qs.cancel(null)
		expect(removals).toEqual([{itemId: 'p1', reason: 'cancelled'}])
	})

	it('a removed placeholder or row, and Clear completed, are removed', async () => {
		const {qs, removals} = makeService()
		qs.add([placeholder('p1'), makeItem({id: 'r1', status: 'pending'}), makeItem({id: 'd1', status: 'done', progressPercent: 100, finishedAt: '2026-01-01T00:00:00.000Z'})])
		await qs.remove('p1')
		await qs.remove('r1')
		await qs.clearCompleted()
		expect(removals).toEqual([
			{itemId: 'p1', reason: 'removed'},
			{itemId: 'r1', reason: 'removed'},
			{itemId: 'd1', reason: 'removed'}
		])
	})

	it('a placeholder swapped for prepared rows is replaced, and for none is nothingNew', async () => {
		const {qs, removals} = makeService()
		qs.add([placeholder('p1'), placeholder('p2')])
		expect((await qs.replaceProbing('p1', [makeItem({id: 'p1', status: 'pending', url: 'https://youtu.be/v1'})])).ok).toBe(true)
		expect((await qs.replaceProbing('p2', [])).ok).toBe(true)
		expect(removals).toEqual([
			{itemId: 'p1', reason: 'replaced'},
			{itemId: 'p2', reason: 'nothingNew'}
		])
	})
})
