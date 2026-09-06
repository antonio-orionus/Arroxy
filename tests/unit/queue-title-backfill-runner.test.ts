// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vitest'
import {QueueTitleBackfill, type QueueTitleBackfillDeps} from '@main/services/download/queueTitleBackfill.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

interface Harness {
	backfill: QueueTitleBackfill
	items: QueueItem[]
	probeTitle: ReturnType<typeof vi.fn<(url: string) => Promise<string | null>>>
	patched: {itemId: string; reason: string}[]
}

function makeHarness(probeTitle: (url: string) => Promise<string | null>, initial: QueueItem[] = [], retryDelayMs = 10): Harness {
	const items = [...initial]
	const patched: {itemId: string; reason: string}[] = []
	const probe = vi.fn(probeTitle)
	const deps: QueueTitleBackfillDeps = {
		items: () => items,
		patch: (itemId, reason, patcher) => {
			const idx = items.findIndex(item => item.id === itemId)
			if (idx < 0) return
			const current = items[idx]
			if (!current) return
			items[idx] = patcher(current)
			patched.push({itemId, reason})
		},
		probeTitle: probe,
		retryDelayMs
	}
	return {backfill: new QueueTitleBackfill(deps), items, probeTitle: probe, patched}
}

function flagged(id: string, url = `https://example.com/${id}`): QueueItem {
	return makeItem({id, status: 'pending', url, title: 'Untitled · #1', titleIsPlaceholder: true})
}

let harnesses: Harness[] = []
afterEach(() => {
	for (const harness of harnesses) harness.backfill.dispose()
	harnesses = []
})

function track(harness: Harness): Harness {
	harnesses.push(harness)
	return harness
}

describe('QueueTitleBackfill', () => {
	it('patches the probed title and clears the flag', async () => {
		const harness = track(makeHarness(async () => 'Real Title', [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a'))
		await vi.waitFor(() => expect(harness.patched).toEqual([{itemId: 'a', reason: 'title-backfill'}]))
		expect(harness.items[0]?.title).toBe('Real Title')
		expect(harness.items[0]?.titleIsPlaceholder).toBeUndefined()
	})

	it('leaves the row for the artifact backstop when the probe fails', async () => {
		const harness = track(makeHarness(async () => null, [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.patched).toEqual([])
		expect(harness.items[0]?.title).toBe('Untitled · #1')
		expect(harness.items[0]?.titleIsPlaceholder).toBe(true)
	})

	it('treats a throwing probe as a silent miss', async () => {
		const harness = track(
			makeHarness(async () => {
				throw new Error('network down')
			}, [flagged('a')])
		)

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.patched).toEqual([])
	})

	it('ignores blank probed titles', async () => {
		const harness = track(makeHarness(async () => '   ', [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.patched).toEqual([])
	})

	it('skips rows without the flag', async () => {
		const harness = track(makeHarness(async () => 'Real Title', [makeItem({id: 'real', status: 'pending', title: 'Real'})]))

		harness.backfill.enqueueForItems(harness.items)

		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.probeTitle).not.toHaveBeenCalled()
	})

	it('skips rows resolved between enqueue and probe', async () => {
		let release: (title: string | null) => void = () => undefined
		const gate = new Promise<string | null>(resolve => {
			release = resolve
		})
		const harness = track(makeHarness(() => gate, [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		// Layer 2 lands first while the probe is still in flight.
		const current = harness.items[0]
		if (current) harness.items[0] = {...current, title: 'Artifact Title', titleIsPlaceholder: undefined}
		release('Probe Title')

		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.patched).toEqual([])
		expect(harness.items[0]?.title).toBe('Artifact Title')
	})

	it('pauses while any download is running and resumes after', async () => {
		const running = makeItem({id: 'dl', status: 'running', lastJobId: 'job-1'})
		const harness = track(makeHarness(async () => 'Real Title', [running, flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await new Promise(resolve => setTimeout(resolve, 40))
		expect(harness.probeTitle).not.toHaveBeenCalled()

		harness.items[0] = {...running, status: 'done'}

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a'))
		await vi.waitFor(() => expect(harness.items[1]?.title).toBe('Real Title'))
	})

	it('a paused item does not block the backfill — only running downloads do', async () => {
		const paused = makeItem({id: 'paused', status: 'paused-active', lastJobId: 'job-1'})
		const harness = track(makeHarness(async () => 'Real Title', [paused, flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a'))
	})

	it('probes one target at a time in enqueue order', async () => {
		const inFlight: string[] = []
		let maxInFlight = 0
		const releases = new Map<string, (title: string | null) => void>()
		const finish = (url: string, title: string | null): void => {
			inFlight.splice(inFlight.indexOf(url), 1)
			releases.get(url)?.(title)
		}
		const harness = track(
			makeHarness(
				url =>
					new Promise<string | null>(resolve => {
						inFlight.push(url)
						maxInFlight = Math.max(maxInFlight, inFlight.length)
						releases.set(url, resolve)
					}),
				[flagged('a'), flagged('b', 'https://example.com/b')]
			)
		)

		harness.backfill.enqueueForItems(harness.items)
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a')
		expect(maxInFlight).toBe(1)

		finish('https://example.com/a', 'Title A')
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(2))
		expect(maxInFlight).toBe(1)

		finish('https://example.com/b', 'Title B')
		await vi.waitFor(() => expect(harness.patched).toHaveLength(2))
		expect(harness.items[0]?.title).toBe('Title A')
		expect(harness.items[1]?.title).toBe('Title B')
	})

	it('dedupes repeat enqueues of the same row', async () => {
		const harness = track(makeHarness(async () => 'Real Title', [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)
		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		await vi.waitFor(() => expect(harness.patched).toHaveLength(1))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.probeTitle).toHaveBeenCalledTimes(1)
	})
})
