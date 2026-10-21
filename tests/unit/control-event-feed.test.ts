// @vitest-environment node

import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {type AppStatus, type ControlEventName, type ControlRule, parseControlEvent, controlEventEnvelopeSchema} from 'arroxy-control'
import {ControlEventFeed, type ControlFeedQueue} from '@main/control/ControlEventFeed.js'
import {CONTROL_FEED_BACKLOG_BYTES, CONTROL_FEED_BACKLOG_EVENTS} from '@main/control/controlFeedOutbox.js'
import type {ControlFeedSubscription, ControlSink} from '@main/control/controlTypes.js'
import type {IntakeRecord} from '@main/control/IntakeRegistry.js'
import type {QueueRemovalReason} from '@main/services/download/queueMutation.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

const logged = vi.hoisted(() => ({error: vi.fn()}))
vi.mock('electron-log/main.js', () => {
	const logger = {debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: logged.error}
	return {default: {...logger, scope: () => logger}}
})

// The event feed behind events.subscribe: a paged snapshot, then deltas, each
// numbered per subscriber when written; progress coalesced and dropped first
// when the subscriber falls behind, and the subscription cut with
// events.resync once its backlog passes the cap.

const BOOT_ID = 'boot-1'
const READY: AppStatus = {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []}

interface Written {
	event: ControlEventName
	seq: number
	data: Record<string, unknown>
}

function fakes() {
	const rows: QueueItem[] = []
	const added = new Set<(items: readonly QueueItem[]) => void>()
	const updated = new Set<(item: QueueItem) => void>()
	const removed = new Set<(itemId: string, reason: QueueRemovalReason) => void>()
	const listen =
		<T>(set: Set<T>) =>
		(listener: T) => {
			set.add(listener)
			return () => {
				set.delete(listener)
			}
		}
	const queue: ControlFeedQueue = {snapshot: () => [...rows], onAdded: listen(added), onUpdated: listen(updated), onRemoved: listen(removed)}
	const registryListeners = new Set<(record: IntakeRecord) => void>()
	const registry = {bootId: BOOT_ID, onChange: listen(registryListeners)}
	const statusListeners = new Set<() => void>()
	let current = READY
	const status = {current: () => current, onChange: listen(statusListeners)}
	const lines: string[] = []
	const drains = new Set<() => void>()
	// Whether the sink answers "full" to its next write.
	const flow = {full: false}
	const sink = {
		write: vi.fn((line: string): boolean => {
			lines.push(line)
			return !flow.full
		}),
		onDrain: listen(drains)
	} satisfies ControlSink
	const feed = new ControlEventFeed({queue, registry, status, clientLabel: () => 'Claude Code', errorText: kind => `Text for ${kind}`})
	return {
		rows,
		sink,
		flow,
		feed,
		subscribe: (options: {snapshot?: boolean; rules?: ControlRule[]} = {}): ControlFeedSubscription => feed.subscribe(sink, {context: {clientId: 'client-1', kind: 'localClient', label: 'Claude Code', rules: options.rules ?? ['trusted']}, snapshot: options.snapshot ?? true}),
		add: (...items: QueueItem[]) => {
			rows.push(...items)
			for (const listener of [...added]) listener(items)
		},
		update: (item: QueueItem) => {
			rows[rows.findIndex(row => row.id === item.id)] = item
			for (const listener of [...updated]) listener(item)
		},
		remove: (itemId: string, reason: QueueRemovalReason) => {
			rows.splice(
				rows.findIndex(row => row.id === itemId),
				1
			)
			for (const listener of [...removed]) listener(itemId, reason)
		},
		intake: (record: IntakeRecord) => {
			for (const listener of [...registryListeners]) listener(record)
		},
		setStatus: (next: AppStatus) => {
			current = next
			for (const listener of [...statusListeners]) listener()
		},
		drain: () => {
			flow.full = false
			for (const listener of [...drains]) listener()
		},
		listeners: () => added.size + updated.size + removed.size + registryListeners.size + statusListeners.size + drains.size,
		// Every line written, checked against the envelope and the event's own schema.
		written: (): Written[] =>
			lines.map(line => {
				const envelope = controlEventEnvelopeSchema.parse(JSON.parse(line))
				expect(envelope.bootId).toBe(BOOT_ID)
				const parsed = parseControlEvent(envelope)
				if (parsed.status !== 'event') throw new Error(`invalid ${envelope.event}`)
				return {event: parsed.event.event, seq: parsed.event.seq, data: parsed.event.data}
			})
	}
}

type Fakes = ReturnType<typeof fakes>

const pending = (id: string, overrides: Partial<QueueItem> = {}): QueueItem => makeItem({id, status: 'pending', ...overrides})
const running = (id: string, progressPercent: number): QueueItem => makeItem({id, status: 'running', progressPercent})

function events(f: Fakes): ControlEventName[] {
	return f.written().map(line => line.event)
}

function expectContinuous(f: Fakes): void {
	expect(f.written().map(line => line.seq)).toEqual(f.written().map((_, index) => index))
}

describe('ControlEventFeed', () => {
	let f: Fakes
	beforeEach(() => {
		vi.useFakeTimers()
		logged.error.mockClear()
		f = fakes()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	const turn = (): void => {
		vi.runOnlyPendingTimers()
	}

	describe('snapshot', () => {
		it('writes after the current turn, numbered from 0 with the boot id', () => {
			f.subscribe()
			expect(f.sink.write).not.toHaveBeenCalled()
			turn()
			expect(f.written()).toEqual([{event: 'queue.snapshot', seq: 0, data: {items: [], final: true}}])
		})

		it('pages the queue under the byte budget and marks the last page final', () => {
			f.add(...Array.from({length: 120}, (_, index) => pending(`row-${index}`, {title: `Title ${'x'.repeat(300)} ${index}`})))
			f.subscribe()
			turn()
			const pages = f.written()
			expect(pages.length).toBeGreaterThan(2)
			expect(pages.every(page => page.event === 'queue.snapshot')).toBe(true)
			expect(pages.map(page => page.data.final)).toEqual([...pages.slice(1).map(() => false), true])
			for (const page of pages) expect(Buffer.byteLength(JSON.stringify(page.data.items))).toBeLessThanOrEqual(12 * 1024)
			expect(pages.flatMap(page => (page.data.items as {id: string}[]).map(item => item.id))).toEqual(f.rows.map(row => row.id))
			expectContinuous(f)
		})

		it('holds deltas until the final page and sends them after it, newer than the page', () => {
			f.add(...Array.from({length: 60}, (_, index) => pending(`row-${index}`, {title: 'x'.repeat(400)})))
			f.flow.full = true
			f.subscribe()
			turn()
			expect(events(f)).toEqual(['queue.snapshot'])
			f.update(pending('row-0', {title: 'Renamed'}))
			f.update(pending('row-59', {title: 'Renamed too'}))
			f.drain()
			const written = f.written()
			const final = written.findIndex(line => line.event === 'queue.snapshot' && line.data.final === true)
			expect(final).toBe(written.length - 3)
			expect(written.slice(final + 1).map(line => [line.event, (line.data.item as {title: string}).title])).toEqual([
				['queue.item', 'Renamed'],
				['queue.item', 'Renamed too']
			])
			// The page still shows the row as it was when the snapshot was taken.
			const finalItems = written[final]?.data.items as {id: string; title: string}[]
			expect(finalItems.find(item => item.id === 'row-59')?.title).toBe('x'.repeat(400))
			expectContinuous(f)
		})

		it('sends only deltas without a snapshot', () => {
			f.add(pending('a'))
			f.subscribe({snapshot: false})
			turn()
			expect(f.written()).toEqual([])
			f.update(pending('a', {title: 'New title'}))
			expect(f.written()).toEqual([{event: 'queue.item', seq: 0, data: {item: expect.objectContaining({id: 'a', title: 'New title'})}}])
		})
	})

	describe('deltas', () => {
		beforeEach(() => {
			f.add(running('a', 10))
			f.subscribe({snapshot: false})
			turn()
		})

		it('sends an update that changed only progress as queue.progress, any other as queue.item', () => {
			f.update(running('a', 20))
			f.update({...running('a', 20), status: 'paused-active'})
			f.update({...running('a', 20), status: 'paused-active'})
			expect(f.written()).toEqual([
				{event: 'queue.progress', seq: 0, data: {itemId: 'a', progress: expect.objectContaining({percent: 20})}},
				{event: 'queue.item', seq: 1, data: {item: expect.objectContaining({id: 'a', status: 'paused'})}}
			])
		})

		it('sends added rows, removals with their reason, and intake and status changes', () => {
			f.add(pending('b'))
			f.remove('b', 'removed')
			f.intake({intakeId: 'intake-1', placeholderId: 'b', clientId: 'client-1', state: {state: 'probing'}, updatedAt: 1})
			f.setStatus({...READY, scheduler: 'paused'})
			// The same status again is not news.
			f.setStatus({...READY, scheduler: 'paused'})
			expect(f.written()).toEqual([
				{event: 'queue.item', seq: 0, data: {item: expect.objectContaining({id: 'b'})}},
				{event: 'queue.removed', seq: 1, data: {itemId: 'b', reason: 'removed'}},
				{event: 'intake.updated', seq: 2, data: {intake: {intakeId: 'intake-1', placeholderId: 'b', state: {state: 'probing'}, updatedAt: 1}}},
				{event: 'app.status', seq: 3, data: {status: {...READY, scheduler: 'paused'}}}
			])
		})

		it('pairs a placeholder removed as replaced with the rows that replace it', () => {
			f.add(makeItem({id: 'p', status: 'probing', job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'video'}))
			f.remove('p', 'replaced')
			f.add(pending('p'), pending('q'))
			expect(f.written().slice(1)).toEqual([
				{event: 'queue.removed', seq: 1, data: {itemId: 'p', reason: 'replaced'}},
				{event: 'queue.replaced', seq: 2, data: {fromId: 'p', toIds: ['p', 'q']}},
				{event: 'queue.item', seq: 3, data: {item: expect.objectContaining({id: 'p', status: 'pending'})}},
				{event: 'queue.item', seq: 4, data: {item: expect.objectContaining({id: 'q'})}}
			])
		})

		it('pairs a replacement only within the turn that removed the placeholder', async () => {
			f.remove('a', 'replaced')
			await Promise.resolve()
			f.add(pending('later'))
			expect(events(f)).toEqual(['queue.removed', 'queue.item'])
		})

		it('skips an event whose data does not match its schema, leaving no gap', () => {
			f.setStatus({...READY, cooldowns: [{site: 'youtube', until: Number.NaN}]})
			f.update(running('a', 30))
			expect(f.written()).toEqual([{event: 'queue.progress', seq: 0, data: expect.objectContaining({itemId: 'a'})}])
			expect(logged.error).toHaveBeenCalled()
		})

		it('lists artifact paths only for a subscriber holding paths.read', () => {
			const artifacts: QueueItem['artifacts'] = [{id: 'a1', kind: 'media', path: '/Videos/clip.mp4', fileName: 'clip.mp4', discoveredAt: '2026-01-01T00:00:00.000Z'}]
			const reader = fakes()
			reader.add(makeItem({id: 'd', status: 'done', artifacts}))
			reader.subscribe({rules: ['trusted', 'paths.read']})
			f.add(makeItem({id: 'd', status: 'done', artifacts}))
			turn()
			const pageItems = reader.written()[0]?.data.items as {artifacts?: unknown}[]
			expect(pageItems[0]?.artifacts).toEqual([{kind: 'media', path: '/Videos/clip.mp4'}])
			expect(f.written()[0]?.data.item).not.toHaveProperty('artifacts')
		})
	})

	describe('backpressure', () => {
		beforeEach(() => {
			f.add(running('a', 0), running('b', 0))
			f.subscribe({snapshot: false})
			turn()
		})

		it('stops writing when the sink is full and resumes on drain', () => {
			f.flow.full = true
			f.update({...running('a', 0), title: 'One'})
			f.update({...running('a', 0), title: 'Two'})
			f.update({...running('a', 0), title: 'Three'})
			expect(f.sink.write).toHaveBeenCalledTimes(1)
			f.drain()
			expect(f.written().map(line => (line.data.item as {title: string}).title)).toEqual(['One', 'Two', 'Three'])
			expectContinuous(f)
		})

		it('coalesces progress per item while waiting, latest wins', () => {
			f.flow.full = true
			f.update({...running('b', 0), title: 'Blocks the sink'})
			for (const percent of [10, 20, 30]) f.update(running('a', percent))
			f.update({...running('b', 5), title: 'Blocks the sink'})
			f.drain()
			expect(f.written().map(line => [line.event, line.data.itemId ?? null])).toEqual([
				['queue.item', null],
				['queue.progress', 'a'],
				['queue.progress', 'b']
			])
			expect(f.written()[1]?.data.progress).toMatchObject({percent: 30})
			expectContinuous(f)
		})

		it("drops an item's waiting progress once a newer state or its removal is waiting", () => {
			f.flow.full = true
			f.update({...running('b', 0), title: 'Blocks the sink'})
			f.update(running('a', 40))
			f.update({...running('a', 40), status: 'paused-active'})
			f.update({...running('b', 50), title: 'Blocks the sink'})
			f.remove('b', 'cancelled')
			f.drain()
			expect(f.written().map(line => line.event)).toEqual(['queue.item', 'queue.item', 'queue.removed'])
		})

		it('never drops a status event, however many wait', () => {
			f.flow.full = true
			for (let index = 0; index < 200; index++) f.update({...running('a', 0), title: `Title ${index}`})
			f.drain()
			expect(f.written()).toHaveLength(200)
			expectContinuous(f)
		})

		it('cuts a subscriber off with events.resync once its backlog passes the event cap', () => {
			f.flow.full = true
			// One written, then one past the cap waiting.
			for (let index = 0; index < CONTROL_FEED_BACKLOG_EVENTS + 2; index++) f.update({...running('a', 0), title: `Title ${index}`})
			expect(f.written()).toEqual([
				{event: 'queue.item', seq: 0, data: expect.anything()},
				{event: 'events.resync', seq: 1, data: {reason: 'lagging'}}
			])
			expect(f.listeners()).toBe(0)
			f.drain()
			f.update({...running('a', 0), title: 'After'})
			expect(f.written()).toHaveLength(2)
		})

		it('cuts a subscriber off once its backlog passes the byte cap', () => {
			f.flow.full = true
			const title = 'x'.repeat(8 * 1024)
			const needed = Math.ceil(CONTROL_FEED_BACKLOG_BYTES / title.length) + 1
			for (let index = 0; index < needed; index++) f.update({...running('a', 0), title: `${title} ${index}`})
			expect(events(f).at(-1)).toBe('events.resync')
			expect(f.listeners()).toBe(0)
		})

		it('drops waiting progress before cutting a subscriber off', () => {
			const half = CONTROL_FEED_BACKLOG_EVENTS / 2
			const many = Array.from({length: half}, (_, index) => running(`r${index}`, 0))
			f.add(...many)
			const before = f.written().length
			f.flow.full = true
			f.update({...running('a', 0), title: 'Blocks the sink'})
			for (const row of many) f.update(running(row.id, 10))
			for (let index = 0; index <= half; index++) f.update({...running('a', 0), title: `Title ${index}`})
			expect(events(f)).not.toContain('events.resync')
			f.drain()
			const written = events(f).slice(before)
			expect(written).not.toContain('queue.progress')
			expect(written).toHaveLength(1 + half + 1)
			expectContinuous(f)
		}, 20_000)
	})

	describe('close', () => {
		it('releases every listener and writes nothing more', () => {
			const subscription = f.subscribe()
			turn()
			expect(f.listeners()).toBeGreaterThan(0)
			subscription.close()
			subscription.close()
			expect(f.listeners()).toBe(0)
			f.add(pending('a'))
			expect(f.written()).toHaveLength(1)
		})

		it('leaves no timer behind when closed before it started', () => {
			f.subscribe().close()
			expect(vi.getTimerCount()).toBe(0)
			turn()
			expect(f.sink.write).not.toHaveBeenCalled()
			expect(f.listeners()).toBe(0)
		})

		it('closes when the sink throws', () => {
			f.subscribe({snapshot: false})
			turn()
			f.sink.write.mockImplementationOnce(() => {
				throw new Error('socket destroyed')
			})
			f.add(pending('a'))
			expect(f.listeners()).toBe(0)
		})
	})
})
