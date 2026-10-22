// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vite-plus/test'

const logger = vi.hoisted(() => ({debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}))
vi.mock('electron-log/main.js', () => ({default: {...logger, scope: () => logger}}))

import {QueueTitleBackfill, type QueueTitleBackfillDeps, type TitleLookup} from '@main/services/download/queueTitleBackfill.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

interface Harness {
	backfill: QueueTitleBackfill
	items: QueueItem[]
	probeTitle: ReturnType<typeof vi.fn<(url: string, admit: () => boolean) => Promise<TitleLookup>>>
	patched: {itemId: string; reason: string}[]
}

const found = (title: string): TitleLookup => ({kind: 'found', title})
const NONE: TitleLookup = {kind: 'none'}

function makeHarness(probeTitle: (url: string, admit: () => boolean) => Promise<TitleLookup>, initial: QueueItem[] = [], retryDelayMs = 10): Harness {
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
		const harness = track(makeHarness(async () => found('Real Title'), [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a', expect.any(Function)))
		await vi.waitFor(() => expect(harness.patched).toEqual([{itemId: 'a', reason: 'title-backfill'}]))
		expect(harness.items[0]?.title).toBe('Real Title')
		expect(harness.items[0]?.titleIsPlaceholder).toBeUndefined()
	})

	it('leaves the row for the artifact backstop when the probe fails', async () => {
		const harness = track(makeHarness(async () => NONE, [flagged('a')]))

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

	it('skips rows without the flag', async () => {
		const harness = track(makeHarness(async () => found('Real Title'), [makeItem({id: 'real', status: 'pending', title: 'Real'})]))

		harness.backfill.enqueueForItems(harness.items)

		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.probeTitle).not.toHaveBeenCalled()
	})

	it('skips rows resolved between enqueue and probe', async () => {
		let release: (lookup: TitleLookup) => void = () => undefined
		const gate = new Promise<TitleLookup>(resolve => {
			release = resolve
		})
		const harness = track(makeHarness(() => gate, [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		// Layer 2 lands first while the probe is still in flight.
		const current = harness.items[0]
		if (current) harness.items[0] = {...current, title: 'Artifact Title', titleIsPlaceholder: undefined}
		release(found('Probe Title'))

		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.patched).toEqual([])
		expect(harness.items[0]?.title).toBe('Artifact Title')
	})

	it('pauses while any download is running and resumes after', async () => {
		const running = makeItem({id: 'dl', status: 'running', lastJobId: 'job-1'})
		const harness = track(makeHarness(async () => found('Real Title'), [running, flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await new Promise(resolve => setTimeout(resolve, 40))
		expect(harness.probeTitle).not.toHaveBeenCalled()

		harness.items[0] = {...running, status: 'done'}

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a', expect.any(Function)))
		await vi.waitFor(() => expect(harness.items[1]?.title).toBe('Real Title'))
	})

	it('a paused item does not block the backfill — only running downloads do', async () => {
		const paused = makeItem({id: 'paused', status: 'paused-active', lastJobId: 'job-1'})
		const harness = track(makeHarness(async () => found('Real Title'), [paused, flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a', expect.any(Function)))
	})

	it('probes one target at a time in enqueue order', async () => {
		const inFlight: string[] = []
		let maxInFlight = 0
		const releases = new Map<string, (lookup: TitleLookup) => void>()
		const finish = (url: string, title: string): void => {
			inFlight.splice(inFlight.indexOf(url), 1)
			releases.get(url)?.(found(title))
		}
		const harness = track(
			makeHarness(
				url =>
					new Promise<TitleLookup>(resolve => {
						inFlight.push(url)
						maxInFlight = Math.max(maxInFlight, inFlight.length)
						releases.set(url, resolve)
					}),
				[flagged('a'), flagged('b', 'https://example.com/b')]
			)
		)

		harness.backfill.enqueueForItems(harness.items)
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		expect(harness.probeTitle).toHaveBeenCalledWith('https://example.com/a', expect.any(Function))
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
		const harness = track(makeHarness(async () => found('Real Title'), [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)
		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		await vi.waitFor(() => expect(harness.patched).toHaveLength(1))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.probeTitle).toHaveBeenCalledTimes(1)
	})

	it('asks the probe to start only while no download runs', async () => {
		// The lookup is still waiting for its slot when the check is asked.
		const harness = track(makeHarness(() => new Promise<TitleLookup>(() => undefined), [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		const admit = harness.probeTitle.mock.calls[0]?.[1]
		expect(admit?.()).toBe(true)
		harness.items.push(makeItem({id: 'dl', status: 'running', lastJobId: 'job-1'}))
		expect(admit?.()).toBe(false)
	})

	it('puts a lookup deferred by a download back first, and looks it up once downloads stop', async () => {
		const running = makeItem({id: 'dl', status: 'running', lastJobId: 'job-1'})
		const lookups: TitleLookup[] = [{kind: 'deferred'}]
		const harness = track(
			makeHarness(
				async url => {
					// The download started while the lookup waited for its slot.
					if (lookups.length > 0 && !harness.items.includes(running)) harness.items.push(running)
					return lookups.shift() ?? found(`Title of ${url}`)
				},
				[flagged('a'), flagged('b')]
			)
		)

		harness.backfill.enqueueForItems(harness.items)
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 40))
		expect(harness.probeTitle).toHaveBeenCalledTimes(1)

		harness.items.splice(harness.items.indexOf(running), 1)
		await vi.waitFor(() => expect(harness.patched).toHaveLength(2))
		expect(harness.probeTitle.mock.calls.map(call => call[0])).toEqual(['https://example.com/a', 'https://example.com/a', 'https://example.com/b'])
	})

	it('logs a cancelled lookup and goes on to the next row', async () => {
		const harness = track(makeHarness(async url => (url.endsWith('/a') ? {kind: 'cancelled'} : found('Title B')), [flagged('a'), flagged('b')]))

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.patched).toEqual([{itemId: 'b', reason: 'title-backfill'}]))
		expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('cancelled'), expect.objectContaining({itemId: 'a'}))
		expect(harness.items[0]?.titleIsPlaceholder).toBe(true)
	})

	it('asks the probe to start only while its row is still there and untitled', async () => {
		// The lookup is still waiting for its slot when the check is asked.
		const harness = track(makeHarness(() => new Promise<TitleLookup>(() => undefined), [flagged('a')]))

		harness.backfill.enqueueForItems(harness.items)
		await vi.waitFor(() => expect(harness.probeTitle).toHaveBeenCalledTimes(1))
		const admit = harness.probeTitle.mock.calls[0]?.[1]
		expect(admit?.()).toBe(true)
		const row = harness.items[0]
		if (row) harness.items[0] = {...row, title: 'Artifact Title', titleIsPlaceholder: undefined}
		expect(admit?.()).toBe(false)
		harness.items.splice(0, 1)
		expect(admit?.()).toBe(false)
	})

	it.each([
		['removed', (items: QueueItem[]) => void items.splice(0, 1)],
		['titled by its file', (items: QueueItem[]) => void (items[0] = {...items[0], title: 'Artifact Title', titleIsPlaceholder: undefined})]
	])('drops a lookup declined because its row was %s while it waited, and goes on', async (_case, change) => {
		const harness = track(
			makeHarness(
				async url => {
					if (url.endsWith('/a')) {
						// The row went while the lookup waited; its probe declined the slot.
						change(harness.items)
						return {kind: 'deferred'}
					}
					return found('Title B')
				},
				[flagged('a'), flagged('b')],
				// A requeue would wait this long before `b`; a dropped lookup goes straight on.
				60_000
			)
		)

		harness.backfill.enqueueForItems(harness.items)

		await vi.waitFor(() => expect(harness.patched).toEqual([{itemId: 'b', reason: 'title-backfill'}]))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(harness.probeTitle.mock.calls.map(call => call[0])).toEqual(['https://example.com/a', 'https://example.com/b'])
	})
})
