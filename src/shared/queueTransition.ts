// Pure transition function for queue items. Single source of truth for the
// queue state machine: every status change goes through `transition(item, evt)`
// instead of being assigned ad-hoc. Closed `QueueEvent` union — the
// exhaustive switch becomes a compile error if a new event kind appears.
//
// Lives in `src/shared` (not `src/main`) so QueueService on main and any
// renderer-side projection can call it identically.

import type {LocalizedError, QueueItem, QueueResumeContext} from './types.js'
import {QUEUE_STATUS} from './schemas.js'

// Closed union of state-change signals. Mapped 1:1 from DownloadService /
// QueueService events.
//
// `paused-held` and `paused-active` are split because the source-of-truth for
// "did a job ever spawn?" lives at the call site (QueueService.pause checks
// item.status before deciding which event to fire).
export type QueueEvent =
	| {kind: 'started'; lastJobId: string}
	| {kind: 'progress'; percent: number; detail?: string | null}
	| {kind: 'paused-active'; tempDir?: string}
	| {kind: 'paused-held'}
	| {kind: 'resumed'}
	| {kind: 'failed'; error: LocalizedError; resumeContext?: QueueResumeContext; lastStatusKey?: import('./schemas.js').StatusKey; params?: Record<string, string | number>}
	| {kind: 'completed'; lastStatusKey?: import('./schemas.js').StatusKey; params?: Record<string, string | number>; finishedAt: string}
	| {kind: 'cancelled'}
	| {kind: 'retry-reset'}

// Pure (item, event) -> item. No I/O, no IPC, no logging.
export function transition(item: QueueItem, evt: QueueEvent): QueueItem {
	switch (evt.kind) {
		case 'started':
			return {...item, status: QUEUE_STATUS.running, lastJobId: evt.lastJobId, error: null, progressPercent: 0, progressDetail: null, resumeContext: undefined}
		case 'progress':
			return {...item, progressPercent: evt.percent, ...(evt.detail !== undefined ? {progressDetail: evt.detail} : {})}
		case 'paused-active':
			return {...item, status: QUEUE_STATUS.pausedActive, progressDetail: null, ...(evt.tempDir !== undefined ? {tempDir: evt.tempDir} : {})}
		case 'paused-held':
			return {...item, status: QUEUE_STATUS.pausedHeld, progressDetail: null}
		case 'resumed':
			return {...item, status: QUEUE_STATUS.running, error: null, resumeContext: undefined}
		case 'failed':
			return {...item, status: QUEUE_STATUS.error, error: evt.error, lastJobId: undefined, tempDir: undefined, resumeContext: evt.resumeContext, ...(evt.lastStatusKey ? {lastStatus: {key: evt.lastStatusKey, params: evt.params}} : {})}
		case 'completed':
			return {...item, status: QUEUE_STATUS.done, progressPercent: 100, finishedAt: evt.finishedAt, lastJobId: undefined, tempDir: undefined, resumeContext: undefined, ...(evt.lastStatusKey ? {lastStatus: {key: evt.lastStatusKey, params: evt.params}} : {})}
		case 'cancelled':
			return {...item, status: QUEUE_STATUS.cancelled, lastJobId: undefined, tempDir: undefined, resumeContext: undefined}
		case 'retry-reset':
			return {...item, status: QUEUE_STATUS.pending, error: null, progressPercent: 0, progressDetail: null, finishedAt: null, lastJobId: undefined, tempDir: undefined}
	}
}

// Predicate: is this event illegal in the current state? Returns null when
// the transition is allowed; otherwise returns a short reason string.
export function illegalTransition(item: QueueItem, evt: QueueEvent): string | null {
	if (item.status === QUEUE_STATUS.cancelled) {
		if (evt.kind !== 'cancelled' && evt.kind !== 'retry-reset') {
			return `event ${evt.kind} on cancelled item is a stale signal`
		}
	}
	if (item.status === QUEUE_STATUS.done && evt.kind !== 'retry-reset') {
		return `event ${evt.kind} on done item is a stale signal`
	}
	if (item.status === QUEUE_STATUS.error) {
		if (evt.kind !== 'retry-reset' && evt.kind !== 'cancelled') {
			return `event ${evt.kind} on error item is a stale signal`
		}
	}
	if (item.status === QUEUE_STATUS.pausedHeld) {
		if (evt.kind === 'started' || evt.kind === 'progress' || evt.kind === 'completed' || evt.kind === 'failed') {
			return `event ${evt.kind} on paused-held item is a stale signal`
		}
	}
	return null
}
