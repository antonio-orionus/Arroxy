// One subscriber's outgoing events. Each is checked against the package's
// schema when queued, and numbered only when written, so what coalescing and
// dropping take out leaves no gap in `seq` (the first event is seq 0). While
// the sink is full, events wait here: progress coalesced per item (latest
// wins), written after everything else waiting and dropped first; everything
// else is kept in order until the backlog passes its cap, when the subscriber
// is told to resync and cut off. Only what still waits is held: written and
// dropped events are freed as they go.

import log from 'electron-log/main.js'
import {CONTROL_EVENTS, type ControlEventData, type ControlEventName} from 'arroxy-control'
import {PLAYLIST_PROBE_LIMIT_MAX} from '@shared/schemas.js'
import type {ControlSink} from './controlTypes.js'

const logger = log.scope('control')

// One intake may add up to PLAYLIST_PROBE_LIMIT_MAX rows in a single 'added',
// a queue.item each, all at once; a subscriber that is only slow must survive
// that burst and what follows it, so the cap holds two of them.
export const CONTROL_FEED_BACKLOG_EVENTS = 2 * PLAYLIST_PROBE_LIMIT_MAX
// About two such bursts of ~700-byte rows, and a bound on what one subscriber
// that stopped reading holds in memory before it is cut off.
export const CONTROL_FEED_BACKLOG_BYTES = 8 * 1024 * 1024

export type ControlFeedEvent = {[E in ControlEventName]: {readonly event: E; readonly data: ControlEventData<E>}}[ControlEventName]

interface Waiting {
	readonly event: ControlEventName
	readonly data: unknown
	readonly bytes: number
}

// Written slots at the front of `ordered` are cut off once they are this many
// and at least half of it, so freeing them stays cheap.
const COMPACT_AFTER = 1024

export class ControlFeedOutbox {
	private seq = 0
	// Every waiting event but progress, in order; slots before `head` are written.
	private ordered: (Waiting | undefined)[] = []
	private head = 0
	// Waiting progress per item, latest wins. It goes after everything in
	// `ordered`: any newer state of its row drops it, so it never overtakes one.
	private readonly progress = new Map<string, Waiting>()
	private bytes = 0
	private full = false
	private closed = false
	// Written before anything waiting: the snapshot's pages, pulled one at a
	// time so the sink sets the pace and deltas wait behind the final page.
	private leading: Iterator<ControlFeedEvent> | null = null
	private readonly stopDrain: () => void

	constructor(
		private readonly sink: ControlSink,
		private readonly bootId: string,
		private readonly onClosed: () => void
	) {
		this.stopDrain = sink.onDrain(() => {
			this.full = false
			this.flush()
		})
	}

	lead(events: Iterator<ControlFeedEvent>): void {
		this.leading = events
		this.flush()
	}

	push(event: ControlFeedEvent): void {
		if (this.closed) return
		const data = checked(event)
		if (data === null) return
		const waiting: Waiting = {event: event.event, data, bytes: Buffer.byteLength(JSON.stringify(data))}
		if (event.event === 'queue.progress') {
			this.dropProgress(event.data.itemId)
			// Progress is never worth growing past the cap: the row's next state carries it.
			if (this.wouldPassCap(waiting.bytes)) return
			this.progress.set(event.data.itemId, waiting)
			this.bytes += waiting.bytes
		} else {
			// A newer state of the row, or its removal, supersedes its waiting progress.
			const itemId = event.event === 'queue.item' ? event.data.item.id : event.event === 'queue.removed' ? event.data.itemId : null
			if (itemId !== null) this.dropProgress(itemId)
			this.ordered.push(waiting)
			this.bytes += waiting.bytes
			if (this.overCap()) this.shed()
		}
		this.flush()
	}

	// Ends the subscription with events.resync, whatever is waiting.
	resync(): void {
		if (this.closed) return
		this.write('events.resync', {reason: 'lagging'})
		this.close()
	}

	close(): void {
		if (this.closed) return
		this.closed = true
		this.stopDrain()
		this.ordered = []
		this.head = 0
		this.progress.clear()
		this.bytes = 0
		this.leading = null
		this.onClosed()
	}

	// Events still held, written or not: the test seam for what a slow subscriber costs.
	retainedForTests(): number {
		return this.ordered.length + this.progress.size
	}

	private get count(): number {
		return this.ordered.length - this.head + this.progress.size
	}

	private dropProgress(itemId: string): void {
		const waiting = this.progress.get(itemId)
		if (!waiting) return
		this.progress.delete(itemId)
		this.bytes -= waiting.bytes
	}

	private wouldPassCap(bytes: number): boolean {
		return this.count + 1 > CONTROL_FEED_BACKLOG_EVENTS || this.bytes + bytes > CONTROL_FEED_BACKLOG_BYTES
	}

	private overCap(): boolean {
		return this.count > CONTROL_FEED_BACKLOG_EVENTS || this.bytes > CONTROL_FEED_BACKLOG_BYTES
	}

	// Progress goes first; past the cap without it, the subscriber hears
	// events.resync ahead of everything waiting, and the subscription ends.
	private shed(): void {
		for (const itemId of [...this.progress.keys()]) this.dropProgress(itemId)
		if (!this.overCap()) return
		logger.warn('a Control API subscriber fell behind; asking it to resync', {waiting: this.count, bytes: this.bytes})
		this.resync()
	}

	private flush(): void {
		while (!this.full && !this.closed) {
			const next = this.next()
			if (!next) return
			this.write(next.event, next.data)
		}
	}

	private next(): Waiting | null {
		while (this.leading) {
			const page = this.leading.next()
			if (page.done) this.leading = null
			else {
				const data = checked(page.value)
				if (data !== null) return {event: page.value.event, data, bytes: 0}
			}
		}
		const waiting = this.ordered[this.head]
		if (waiting) {
			this.ordered[this.head++] = undefined
			this.bytes -= waiting.bytes
			this.compact()
			return waiting
		}
		const [progress] = this.progress
		if (!progress) return null
		this.dropProgress(progress[0])
		return progress[1]
	}

	private compact(): void {
		if (this.head === this.ordered.length) {
			this.ordered = []
			this.head = 0
		} else if (this.head >= COMPACT_AFTER && this.head * 2 >= this.ordered.length) {
			this.ordered.splice(0, this.head)
			this.head = 0
		}
	}

	private write(event: ControlEventName, data: unknown): void {
		const line = JSON.stringify({type: 'event', event, seq: this.seq++, bootId: this.bootId, data})
		try {
			if (!this.sink.write(line)) this.full = true
		} catch (error) {
			logger.warn('a Control API event sink failed; ending its subscription', {error: error instanceof Error ? error.message : String(error)})
			this.close()
		}
	}
}

// The event's data as its schema parses it, or null (logged, never sent)
// when it does not match: a bug answers nothing rather than an invalid event.
function checked(event: ControlFeedEvent): unknown {
	const parsed = CONTROL_EVENTS[event.event].safeParse(event.data)
	if (parsed.success) return parsed.data
	logger.error('a Control API event did not match its schema', {event: event.event, issues: parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)})
	return null
}
