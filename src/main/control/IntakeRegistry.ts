// The intakes Control API clients started, by intake id, so a client can read
// or wait on what its links.add became. In memory only: the boot id changes
// every launch, which tells a client the app forgot them.
//
// A client's placeholder row starts its intake (the row names the client and
// the intake); intake outcomes move it on, whoever caused them; the queue
// tells when the placeholder probes again or was cancelled or removed. An
// intake is kept while it can still move or its rows are in the queue (so a
// client can wait for them to finish), then for a retention window; the map
// is bounded, forgetting the oldest of those first and never a live one.

import {randomUUID} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
import log from 'electron-log/main.js'
import type {IntakeState, IntakeView} from 'arroxy-control'
import {errorKindMetadata} from 'ytdlp-errors'
import type {IntakeOutcomeEvent} from '@main/intake/ControlOutcomes.js'
import {CONTROL_PROBING_INTAKES_PER_CLIENT} from './intakeAdmission.js'
import type {QueueRemovalReason} from '@main/services/download/queueMutation.js'
import {QUEUE_STATUS, type QueueChoice} from '@shared/schemas.js'
import type {ProbeError, ProbeOtherErrorCode, QueueItem} from '@shared/types.js'

const logger = log.scope('control')

export const INTAKE_RETENTION_MS = 30 * 60_000
export const INTAKE_RECORDS_MAX = 1000

// Probe failures a later retry of the same link cannot fix.
const LASTING_PROBE_FAILURES: ReadonlySet<ProbeOtherErrorCode> = new Set<ProbeOtherErrorCode>(['invalid_url', 'no_formats', 'parse', 'playlist_empty', 'redirect_loop', 'schema'])

export type IntakeRecord = IntakeView & {clientId: string}

export interface IntakeRegistryDeps {
	// The queue of record, for the rows an intake made.
	rows(): readonly QueueItem[]
	now(): number
	newId(): string
	// Runs work once intake has had its turn (default: the next macrotask).
	defer?: (run: () => void) => void
}

interface Entry {
	record: IntakeRecord
	// When the intake became forgettable: it ended, a probe failure's row is
	// gone (until then a Retry can still pick it up), and a queued intake's
	// rows are all gone. Null while live.
	releasedAt: number | null
	// A queued intake's rows still in the queue.
	rows: Set<string>
}

export class IntakeRegistry {
	readonly bootId = randomUUID()
	private readonly entries = new Map<string, Entry>()
	// Placeholder row id → intake id, for removals, which name only the row.
	private readonly byPlaceholder = new Map<string, string>()
	// Row id → the queued intakes waiting on it, for removals.
	private readonly byRow = new Map<string, Set<string>>()
	private readonly listeners = new Set<(record: IntakeRecord) => void>()

	constructor(private readonly deps: IntakeRegistryDeps) {}

	get(intakeId: string): IntakeRecord | undefined {
		this.prune()
		return this.entries.get(intakeId)?.record
	}

	// Whether the client already has as many intakes probing as it may
	// (links.add answers limit_exceeded then).
	probingCapReached(clientId: string): boolean {
		let count = 0
		for (const {record} of this.entries.values()) if (record.clientId === clientId && record.state.state === 'probing') count++
		return count >= CONTROL_PROBING_INTAKES_PER_CLIENT
	}

	// links.add found the link already live: a fresh intake, queued on that
	// row, so the client can wait on it like any other.
	adoptLive(clientId: string, itemId: string): IntakeRecord {
		const record: IntakeRecord = {intakeId: this.deps.newId(), placeholderId: itemId, clientId, state: {state: 'queued', itemIds: [itemId]}, updatedAt: this.deps.now()}
		const entry: Entry = {record, releasedAt: null, rows: new Set()}
		this.entries.set(record.intakeId, entry)
		this.hold(entry)
		this.changed(record)
		return record
	}

	onChange(listener: (record: IntakeRecord) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	// Rows the queue added or updated. A client's new placeholder starts its
	// intake; a placeholder probing again (a Retry or a choice) moves it back.
	hearRows(items: readonly QueueItem[]): void {
		for (const item of items) {
			const {origin} = item
			if (origin?.kind !== 'localClient' || item.status !== QUEUE_STATUS.probing) continue
			const entry = this.entries.get(origin.intakeId)
			if (!entry) {
				if (item.job.kind === 'unresolved') this.start(origin.intakeId, origin.clientId, item.id)
				continue
			}
			const {state} = entry.record.state
			if (entry.record.placeholderId === item.id && (state === 'probeFailed' || state === 'needsYourChoice')) this.update(entry, {state: 'probing'})
		}
	}

	// A swap is followed by the intake's outcome: with prepared rows the first
	// keeps the placeholder's id (`replaced`), with none the row is gone
	// (`nothingNew`). Any other removal of a live placeholder cancels its intake.
	hearRemoved(itemId: string, reason: QueueRemovalReason): void {
		if (reason === 'replaced') return
		this.releaseRow(itemId)
		const intakeId = this.byPlaceholder.get(itemId)
		const entry = intakeId === undefined ? undefined : this.entries.get(intakeId)
		if (!entry) return
		this.byPlaceholder.delete(itemId)
		const {state} = entry.record.state
		if (reason === 'nothingNew') {
			// Intake tells the outcome in the same turn as the swap. If none came
			// (its write threw), there was nothing new, never a probe still running.
			if (state === 'probing') this.defer(() => this.settleSwap(entry))
			return
		}
		if (state === 'probing' || state === 'needsYourChoice') this.update(entry, {state: 'cancelled'})
		else if (state === 'probeFailed' && entry.releasedAt === null) entry.releasedAt = this.deps.now()
	}

	hearOutcome(event: IntakeOutcomeEvent): void {
		const entry = event.intakeId === null ? undefined : this.entries.get(event.intakeId)
		// A cancelled intake's probe writes nothing; an outcome now is stale.
		if (!entry || entry.record.state.state === 'cancelled') return
		const next = this.stateFor(event.intakeId, event.outcome)
		if (next) this.update(entry, next)
	}

	private stateFor(intakeId: string | null, outcome: IntakeOutcomeEvent['outcome']): IntakeState | null {
		switch (outcome.kind) {
			case 'added':
				return {state: 'probing'}
			case 'not-added':
				return null
			case 'queued': {
				const itemIds = this.deps.rows().flatMap(item => (item.origin?.intakeId === intakeId ? [item.id] : []))
				return {state: 'queued', itemIds: itemIds.length > 0 ? itemIds : [outcome.itemId]}
			}
			// Every video went live in another form while the probe ran.
			case 'already-queued':
				return outcome.itemId === null ? {state: 'nothingNew'} : {state: 'queued', itemIds: [outcome.itemId]}
			case 'nothing-new':
				return {state: 'nothingNew'}
			// Rows refused over the caller's row cap: the same link makes as many again.
			case 'failed':
				return {state: 'probeFailed', ...(outcome.overRowLimit ? {ytdlpKind: null, retryable: false} : probeFailure(outcome.probeError))}
			case 'needs-choice':
				return needsYourChoice(outcome.choice, outcome.capped)
		}
	}

	private start(intakeId: string, clientId: string, placeholderId: string): void {
		const record: IntakeRecord = {intakeId, placeholderId, clientId, state: {state: 'probing'}, updatedAt: this.deps.now()}
		this.entries.set(intakeId, {record, releasedAt: null, rows: new Set()})
		this.byPlaceholder.set(placeholderId, intakeId)
		this.changed(record)
	}

	private settleSwap(entry: Entry): void {
		if (this.entries.get(entry.record.intakeId) === entry && entry.record.state.state === 'probing') this.update(entry, {state: 'nothingNew'})
	}

	private update(entry: Entry, state: IntakeState): void {
		if (isDeepStrictEqual(entry.record.state, state)) return
		entry.record = {...entry.record, state, updatedAt: this.deps.now()}
		this.hold(entry)
		this.changed(entry.record)
	}

	// Whether the intake stays live: it can still move, or its rows are in the queue.
	private hold(entry: Entry): void {
		const {state} = entry.record
		let live = state.state === 'probing' || state.state === 'needsYourChoice' || (state.state === 'probeFailed' && this.byPlaceholder.has(entry.record.placeholderId))
		if (state.state === 'queued') {
			const present = new Set(this.deps.rows().map(item => item.id))
			for (const itemId of state.itemIds) {
				if (!present.has(itemId)) continue
				entry.rows.add(itemId)
				const waiting = this.byRow.get(itemId) ?? new Set<string>()
				waiting.add(entry.record.intakeId)
				this.byRow.set(itemId, waiting)
			}
			live = entry.rows.size > 0
		}
		entry.releasedAt = live ? null : this.deps.now()
	}

	// A queued intake is released once the last of its rows leaves the queue.
	private releaseRow(itemId: string): void {
		const waiting = this.byRow.get(itemId)
		if (!waiting) return
		this.byRow.delete(itemId)
		for (const intakeId of waiting) {
			const entry = this.entries.get(intakeId)
			if (!entry) continue
			entry.rows.delete(itemId)
			if (entry.rows.size === 0 && entry.releasedAt === null) entry.releasedAt = this.deps.now()
		}
	}

	private defer(run: () => void): void {
		if (this.deps.defer) this.deps.defer(run)
		else setTimeout(run, 0).unref()
	}

	// Listeners run inside the queue's own emit, so one that throws must not
	// break the queue's caller or the other listeners.
	private changed(record: IntakeRecord): void {
		this.prune()
		for (const listener of this.listeners) {
			try {
				listener(record)
			} catch (error) {
				logger.error('an intake listener failed', {intakeId: record.intakeId, error: error instanceof Error ? error.message : String(error)})
			}
		}
	}

	// Forgets ended intakes past the retention window, then the oldest ended
	// ones while over the bound. Live intakes are never forgotten.
	private prune(): void {
		const now = this.deps.now()
		const released: [string, number][] = []
		for (const [intakeId, {releasedAt}] of this.entries) {
			if (releasedAt === null) continue
			if (now - releasedAt >= INTAKE_RETENTION_MS) this.forget(intakeId)
			else released.push([intakeId, releasedAt])
		}
		if (this.entries.size <= INTAKE_RECORDS_MAX) return
		released.sort((a, b) => a[1] - b[1])
		for (const [intakeId] of released.slice(0, this.entries.size - INTAKE_RECORDS_MAX)) this.forget(intakeId)
	}

	private forget(intakeId: string): void {
		const entry = this.entries.get(intakeId)
		this.entries.delete(intakeId)
		if (!entry) return
		if (this.byPlaceholder.get(entry.record.placeholderId) === intakeId) this.byPlaceholder.delete(entry.record.placeholderId)
		for (const itemId of entry.rows) {
			const waiting = this.byRow.get(itemId)
			waiting?.delete(intakeId)
			if (waiting?.size === 0) this.byRow.delete(itemId)
		}
	}
}

// yt-dlp's kind, and whether retrying the same link can help: by yt-dlp's
// own metadata, else by the probe's code. A failure with no probe error came
// from preparing the rows (a missing folder, say), which the user can fix.
function probeFailure(error: ProbeError | null): {ytdlpKind: string | null; retryable: boolean} {
	if (error?.kind === 'ytdlp') return {ytdlpKind: error.error.kind, retryable: errorKindMetadata(error.error.kind).recoverable}
	return {ytdlpKind: null, retryable: error === null || !LASTING_PROBE_FAILURES.has(error.code)}
}

// `total` is known only when the probe saw the whole collection.
function needsYourChoice(choice: QueueChoice, capped: boolean): IntakeState {
	if (choice.kind === 'playlist-cap') return {state: 'needsYourChoice', kind: 'loadLimit', total: null, offered: choice.loaded}
	return {state: 'needsYourChoice', kind: 'playlistReview', total: capped ? null : choice.count, offered: choice.count}
}
