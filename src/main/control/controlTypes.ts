// What an entry point hands the Control API (who is calling, and where that
// caller's events go) and what ControlService is built on. The event feed
// behind events.subscribe is a seam, so ControlService stays free of how
// events are coalesced and written.

import type {ControlRule} from 'arroxy-control'
import type {YtDlpErrorKind} from 'ytdlp-errors'
import type {IntakeService} from '@main/intake/IntakeService.js'
import type {Result} from '@shared/result.js'
import type {AppSettings, DownloadProfile, QueueItem, QueueSchedulerCommandResult} from '@shared/types.js'
import type {ControlStatus} from './controlStatus.js'
import type {IntakeRegistry} from './IntakeRegistry.js'

// Established by the entry point's handshake before any request reaches the service.
export interface ControlContext {
	readonly clientId: string
	readonly kind: 'localClient'
	// What the user saw when they allowed the client.
	readonly label: string
	readonly rules: readonly ControlRule[]
}

// One connection's outgoing events, one serialized event envelope per write.
// `write` answers false once the connection is full (it still takes the
// line); `onDrain` tells when it has room again.
export interface ControlSink {
	write(line: string): boolean
	onDrain(listener: () => void): () => void
}

export interface ControlFeedOptions {
	readonly context: ControlContext
	// Send the queue first, as queue.snapshot pages.
	readonly snapshot: boolean
}

export interface ControlFeedSubscription {
	close(): void
}

// The event feed (ControlEventFeed). A subscription starts writing after the
// current turn, so the events.subscribe response goes out before its first
// event, and ends itself after writing events.resync.
export interface ControlFeed {
	subscribe(sink: ControlSink, options: ControlFeedOptions): ControlFeedSubscription
}

type Unsubscribe = () => void

// The queue of record, as the Control API uses it (QueueService).
export interface ControlQueue {
	snapshot(): readonly QueueItem[]
	pause(itemId: string): Promise<Result<void>>
	resume(itemId: string): Promise<Result<void>>
	cancel(itemId: string): Promise<Result<void>>
	retry(itemId: string): Promise<Result<void>>
	remove(itemId: string): Promise<Result<void>>
	pauseAll(): Promise<QueueSchedulerCommandResult>
	resumeAll(): Promise<QueueSchedulerCommandResult>
	// Any row added, changed or removed.
	onChange(listener: () => void): Unsubscribe
}

export interface ControlServiceDeps {
	intake: Pick<IntakeService, 'add' | 'choose' | 'retry' | 'windowProfile'>
	queue: ControlQueue
	registry: Pick<IntakeRegistry, 'bootId' | 'get' | 'probingCapReached' | 'adoptLive' | 'onChange'>
	settings(): Promise<AppSettings>
	status: Pick<ControlStatus, 'current'>
	feed: ControlFeed
	// The label the user gave a client when allowing it; null once removed.
	clientLabel(clientId: string): string | null
	// A profile's name as the window shows it.
	profileName(profile: DownloadProfile): string
	// A yt-dlp failure in the user's words, in English.
	errorText(kind: YtDlpErrorKind): string
	newId(): string
	now(): number
}
