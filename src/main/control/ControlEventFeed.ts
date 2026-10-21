// The event feed behind events.subscribe. Each subscription hears the queue,
// the intake registry and the app's status, turns what changed into public
// events projected for its caller (artifact paths only with paths.read), and
// hands them to its outbox, which numbers, paces and, when the subscriber
// falls too far behind, cuts them off.

import log from 'electron-log/main.js'
import type {QueueItemView} from 'arroxy-control'
import type {YtDlpErrorKind} from 'ytdlp-errors'
import type {QueueRemovalReason} from '@main/services/download/queueMutation.js'
import type {QueueItem} from '@shared/types.js'
import {ControlFeedOutbox, type ControlFeedEvent} from './controlFeedOutbox.js'
import {takePage} from './controlPaging.js'
import {intakeView, type ItemProjection, queueItemView} from './controlProjections.js'
import type {ControlStatus} from './controlStatus.js'
import type {ControlFeed, ControlFeedOptions, ControlFeedSubscription, ControlSink} from './controlTypes.js'
import type {IntakeRecord, IntakeRegistry} from './IntakeRegistry.js'

const logger = log.scope('control')

type Unsubscribe = () => void

// QueueService's row events, as the feed hears them.
export interface ControlFeedQueue {
	snapshot(): readonly QueueItem[]
	onAdded(listener: (items: readonly QueueItem[]) => void): Unsubscribe
	onUpdated(listener: (item: QueueItem) => void): Unsubscribe
	onRemoved(listener: (itemId: string, reason: QueueRemovalReason) => void): Unsubscribe
}

// What the event feed is built from.
export interface ControlFeedSources {
	queue: ControlFeedQueue
	registry: {readonly bootId: string; onChange: IntakeRegistry['onChange']}
	status: Pick<ControlStatus, 'current' | 'onChange'>
	// The label the user gave a client when allowing it; null once removed.
	clientLabel(clientId: string): string | null
	// A yt-dlp failure in the user's words, in English.
	errorText(kind: YtDlpErrorKind): string
}

export class ControlEventFeed implements ControlFeed {
	constructor(private readonly sources: ControlFeedSources) {}

	subscribe(sink: ControlSink, options: ControlFeedOptions): ControlFeedSubscription {
		return new Subscription(this.sources, sink, options)
	}
}

class Subscription implements ControlFeedSubscription {
	private readonly outbox: ControlFeedOutbox
	private readonly projection: ItemProjection
	private starting: NodeJS.Immediate | null
	private stops: Unsubscribe[] = []
	// Each row as this subscriber last heard it, to tell a progress tick from a change.
	private readonly views = new Map<string, QueueItemView>()
	private status = ''
	// A placeholder just removed as replaced, until the rows replacing it arrive.
	private replacing: string | null = null
	// Intake changes heard this turn. The registry hears the queue before this
	// subscription does, so an intake naming its rows waits for them.
	private intakes: IntakeRecord[] = []
	private closed = false

	constructor(
		private readonly sources: ControlFeedSources,
		sink: ControlSink,
		private readonly options: ControlFeedOptions
	) {
		this.outbox = new ControlFeedOutbox(sink, sources.registry.bootId, () => this.close())
		this.projection = {clientLabel: clientId => sources.clientLabel(clientId), errorText: kind => sources.errorText(kind), pathsRead: options.context.rules.includes('paths.read')}
		// After the current turn, so the events.subscribe response goes out first.
		this.starting = setImmediate(() => this.start())
	}

	close(): void {
		if (this.closed) return
		this.closed = true
		if (this.starting) clearImmediate(this.starting)
		this.starting = null
		for (const stop of this.stops) stop()
		this.stops = []
		this.views.clear()
		this.intakes = []
		this.outbox.close()
	}

	// The snapshot is the queue as it stands when the listeners attach, so
	// every later change arrives as a delta after its final page. A failure
	// here would leave the client subscribed to nothing, so it is told to resync.
	private start(): void {
		this.starting = null
		try {
			const {queue, registry, status} = this.sources
			const views = queue.snapshot().map(row => this.view(row))
			for (const view of views) this.views.set(view.id, view)
			this.status = JSON.stringify(status.current())
			// Kept one by one, so a source that fails to attach leaves none behind.
			this.stops.push(queue.onAdded(guarded(items => this.added(items))))
			this.stops.push(queue.onUpdated(guarded(item => this.updated(item))))
			this.stops.push(queue.onRemoved(guarded((itemId, reason) => this.removed(itemId, reason))))
			this.stops.push(registry.onChange(guarded(record => this.intakeChanged(record))))
			this.stops.push(status.onChange(guarded(() => this.statusChanged())))
			if (this.options.snapshot) this.outbox.lead(snapshotPages(views))
		} catch (error) {
			logger.error('the Control API event feed failed to start', {error: error instanceof Error ? error.message : String(error)})
			this.outbox.resync()
			this.close()
		}
	}

	private push(event: ControlFeedEvent): void {
		if (!this.closed) this.outbox.push(event)
	}

	private view(item: QueueItem): QueueItemView {
		return queueItemView(item, this.projection)
	}

	// The queue removes a placeholder as replaced and adds the rows replacing
	// it in one synchronous swap, so the next rows added belong to it.
	private added(items: readonly QueueItem[]): void {
		const fromId = this.replacing
		this.replacing = null
		if (fromId !== null) this.push({event: 'queue.replaced', data: {fromId, toIds: items.map(item => item.id)}})
		for (const item of items) {
			const view = this.view(item)
			this.views.set(item.id, view)
			this.push({event: 'queue.item', data: {item: view}})
		}
	}

	private updated(item: QueueItem): void {
		const view = this.view(item)
		const before = this.views.get(item.id)
		this.views.set(item.id, view)
		if (before && sameJson({...before, progress: null}, {...view, progress: null})) {
			if (sameJson(before.progress, view.progress)) return
			if (view.progress) {
				this.push({event: 'queue.progress', data: {itemId: item.id, progress: view.progress}})
				return
			}
		}
		this.push({event: 'queue.item', data: {item: view}})
	}

	private removed(itemId: string, reason: QueueRemovalReason): void {
		this.views.delete(itemId)
		this.push({event: 'queue.removed', data: {itemId, reason}})
		if (reason !== 'replaced') return
		this.replacing = itemId
		// The swap is synchronous; rows added on a later turn are not its.
		queueMicrotask(() => {
			if (this.replacing === itemId) this.replacing = null
		})
	}

	private intakeChanged(record: IntakeRecord): void {
		this.intakes.push(record)
		if (this.intakes.length > 1) return
		queueMicrotask(
			guarded(() => {
				const records = this.intakes
				this.intakes = []
				for (const held of records) this.push({event: 'intake.updated', data: {intake: intakeView(held)}})
			})
		)
	}

	// Status sources also fire for changes a client cannot see.
	private statusChanged(): void {
		const status = this.sources.status.current()
		const seen = JSON.stringify(status)
		if (seen === this.status) return
		this.status = seen
		this.push({event: 'app.status', data: {status}})
	}
}

function* snapshotPages(views: readonly QueueItemView[]): Generator<ControlFeedEvent> {
	let start = 0
	do {
		const page = takePage(views, view => view, start, Number.POSITIVE_INFINITY)
		start = page.next
		yield {event: 'queue.snapshot', data: {items: page.items, final: start >= views.length}}
	} while (start < views.length)
}

function sameJson(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b)
}

// The feed listens inside the queue's and the registry's emits; a bug here
// is logged and never thrown into them.
function guarded<A extends unknown[]>(listener: (...args: A) => void): (...args: A) => void {
	return (...args) => {
		try {
			listener(...args)
		} catch (error) {
			logger.error('the Control API event feed failed on a change', {error: error instanceof Error ? error.message : String(error)})
		}
	}
}
