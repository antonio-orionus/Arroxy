// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {CONTROL_FEED_BACKLOG_EVENTS, ControlFeedOutbox} from '@main/control/controlFeedOutbox.js'
import type {ControlSink} from '@main/control/controlTypes.js'

vi.mock('electron-log/main.js', () => {
	const logger = {debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}
	return {default: {...logger, scope: () => logger}}
})

// What the outbox keeps while a subscriber is slow: only what still waits,
// never what it already wrote or dropped.

const PROGRESS = {percent: 10, downloadedBytes: null, totalBytes: null, speedBytesPerSecond: null, etaSeconds: null}

// A sink that is full after every write and takes one more line per drain.
function slowSink() {
	const drains = new Set<() => void>()
	const lines: string[] = []
	const sink: ControlSink = {
		write: line => {
			lines.push(line)
			return false
		},
		onDrain: listener => {
			drains.add(listener)
			return () => {
				drains.delete(listener)
			}
		}
	}
	return {sink, lines, drain: () => drains.forEach(listener => listener())}
}

const removal = (index: number) => ({event: 'queue.removed', data: {itemId: `row-${index}`, reason: 'removed'}}) as const

describe('ControlFeedOutbox', () => {
	it('frees what it wrote while a steadily slow subscriber keeps a backlog', () => {
		const slow = slowSink()
		const outbox = new ControlFeedOutbox(slow.sink, 'boot', () => undefined)
		outbox.push(removal(0))
		outbox.push(removal(1))
		for (let index = 2; index < 20_000; index++) {
			outbox.push(removal(index))
			slow.drain()
		}
		expect(slow.lines).toHaveLength(19_999)
		expect(outbox.retainedForTests()).toBeLessThan(2100)
	})

	it('holds no progress past the cap, and keeps the subscriber while only progress would pass it', () => {
		const slow = slowSink()
		const onClosed = vi.fn()
		const outbox = new ControlFeedOutbox(slow.sink, 'boot', onClosed)
		for (let index = 0; index <= CONTROL_FEED_BACKLOG_EVENTS; index++) outbox.push(removal(index))
		for (let index = 0; index < 5000; index++) outbox.push({event: 'queue.progress', data: {itemId: `p-${index}`, progress: PROGRESS}})
		expect(outbox.retainedForTests()).toBe(CONTROL_FEED_BACKLOG_EVENTS)
		expect(onClosed).not.toHaveBeenCalled()
	})

	it('frees a dropped progress at once', () => {
		const slow = slowSink()
		const outbox = new ControlFeedOutbox(slow.sink, 'boot', () => undefined)
		outbox.push(removal(0))
		for (let index = 0; index < 5000; index++) {
			outbox.push({event: 'queue.progress', data: {itemId: `p-${index}`, progress: PROGRESS}})
			outbox.push({event: 'queue.removed', data: {itemId: `p-${index}`, reason: 'cancelled'}})
		}
		expect(outbox.retainedForTests()).toBe(5000)
	})
})
