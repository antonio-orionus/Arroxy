// Pure transition function for queue items. Single source of truth for the
// queue state machine: every status change goes through `transition(item, evt)`
// instead of being assigned ad-hoc. Closed `QueueEvent` union — the
// exhaustive switch becomes a compile error if a new event kind appears.
//
// Lives in `src/shared` (not `src/main`) so QueueService on main and any
// renderer-side projection can call it identically.

import type {LocalizedError, QueueItem, QueueResumeContext} from './types.js'
import {QUEUE_STATUS, type JobAuth, type QueueChoice} from './schemas.js'

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
	// `auth`: who the failed probe ran as; set only when it failed signed in.
	| {kind: 'probe-failed'; error: LocalizedError; auth?: JobAuth}
	| {kind: 'needs-choice'; choice: QueueChoice; title: string}
	| {kind: 'probe-restarted'}
	| {kind: 'completed'; lastStatusKey?: import('./schemas.js').StatusKey; params?: Record<string, string | number>; finishedAt: string}
	| {kind: 'cancelled'}
	| {kind: 'retry-reset'}

function withoutProbeInfoJsonRef(item: QueueItem): QueueItem {
	const {probeInfoJsonRef: _probeInfoJsonRef, ...rest} = item
	return rest
}

// A placeholder has no job yet: its `auth` is only who its last probe ran as.
function withoutAuth(item: QueueItem): QueueItem {
	const {auth: _auth, ...rest} = item
	return rest
}

function withoutChoice(item: QueueItem): QueueItem {
	const {choice: _choice, ...rest} = item
	return rest
}

// A placeholder's probe can run again: after it failed, or once the user picked
// an answer that needs a fresh probe.
function canRestartProbe(item: QueueItem): boolean {
	return item.status === QUEUE_STATUS.needsChoice || (item.status === QUEUE_STATUS.error && item.job.kind === 'unresolved')
}

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
		case 'probe-failed':
			// The probe never produced a job, so there is no retry machinery —
			// just an error row the user can cancel or remove. The unresolved
			// job stays: the row remains schema-valid as a terminal probe-error.
			return {...withoutAuth(item), status: QUEUE_STATUS.error, error: evt.error, progressPercent: 0, progressDetail: null, ...(evt.auth ? {auth: evt.auth} : {})}
		case 'needs-choice':
			return {...item, status: QUEUE_STATUS.needsChoice, choice: evt.choice, title: evt.title, progressPercent: 0, progressDetail: null}
		case 'probe-restarted':
			return {...withoutChoice(item), status: QUEUE_STATUS.probing, error: null, progressPercent: 0, progressDetail: null, finishedAt: null}
		case 'completed':
			return {...withoutProbeInfoJsonRef(item), status: QUEUE_STATUS.done, progressPercent: 100, finishedAt: evt.finishedAt, lastJobId: undefined, tempDir: undefined, resumeContext: undefined, ...(evt.lastStatusKey ? {lastStatus: {key: evt.lastStatusKey, params: evt.params}} : {})}
		case 'cancelled':
			return {...withoutProbeInfoJsonRef(item), status: QUEUE_STATUS.cancelled, lastJobId: undefined, tempDir: undefined, resumeContext: undefined}
		case 'retry-reset':
			return {...item, status: QUEUE_STATUS.pending, error: null, progressPercent: 0, progressDetail: null, finishedAt: null, lastJobId: undefined, tempDir: undefined}
	}
}

// Predicate: is this event illegal in the current state? Returns null when
// the transition is allowed; otherwise returns a short reason string.
export function illegalTransition(item: QueueItem, evt: QueueEvent): string | null {
	// probe-failed belongs to the probe stage only — a download-side error is a
	// `failed` event, never this one.
	if (evt.kind === 'probe-failed' && item.status !== QUEUE_STATUS.probing) {
		return `event probe-failed on ${item.status} item is a stale signal`
	}
	if (evt.kind === 'needs-choice' && item.status !== QUEUE_STATUS.probing) {
		return `event needs-choice on ${item.status} item is a stale signal`
	}
	if (evt.kind === 'probe-restarted') return canRestartProbe(item) ? null : `event probe-restarted on ${item.status} item with a ${item.job.kind} job`
	// A probing item has no job yet: only its own outcome or a cancellation
	// may touch it. Everything else (started/progress/…) is a stale download
	// signal that must never resurrect the placeholder.
	if (item.status === QUEUE_STATUS.probing) {
		if (evt.kind !== 'probe-failed' && evt.kind !== 'needs-choice' && evt.kind !== 'cancelled') {
			return `event ${evt.kind} on probing item is a stale signal`
		}
	}
	// A needs-choice row waits for the user; only a cancellation touches it.
	if (item.status === QUEUE_STATUS.needsChoice && evt.kind !== 'cancelled') {
		return `event ${evt.kind} on needs-choice item is a stale signal`
	}
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
