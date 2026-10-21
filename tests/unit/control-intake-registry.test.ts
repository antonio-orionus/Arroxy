// @vitest-environment node

import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {intakeViewSchema} from 'arroxy-control'
import {CONTROL_PROBING_INTAKES_PER_CLIENT} from '@main/control/intakeAdmission.js'
import {INTAKE_RECORDS_MAX, INTAKE_RETENTION_MS, IntakeRegistry, type IntakeRecord} from '@main/control/IntakeRegistry.js'
import type {IntakeOutcomeEvent} from '@main/intake/ControlOutcomes.js'
import type {QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import type {IntakeOrigin} from '@shared/intake/intakeSchemas.js'
import type {ProbeError, QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// The intakes Control API clients started, by intake id: placed by the queue's
// rows, moved on by intake outcomes and by the queue, kept a while after they
// end and bounded in number.

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const START = 1_000_000

interface Harness {
	registry: IntakeRegistry
	rows: QueueItem[]
	clock: {now: number}
	// Places a client's placeholder row, the way the queue reports it.
	place(itemId: string, intakeId: string, clientId?: string): void
	outcome(intakeId: string, outcome: QuickDownloadEvent): void
}

function origin(intakeId: string, clientId = 'client-1'): IntakeOrigin {
	return {kind: 'localClient', clientId, intakeId}
}

function placeholderRow(id: string, from: IntakeOrigin, status: 'probing' | 'needs-choice' | 'error' = 'probing'): QueueItem {
	return makeItem({id, status, url: `https://youtube.com/watch?v=${id}`, job: UNRESOLVED, probeMode: 'video', origin: from, ...(status === 'needs-choice' ? {choice: {kind: 'playlist-cap', loaded: 2}} : {}), ...(status === 'error' ? {error: {kind: 'network', raw: 'x'}} : {})})
}

function harness(): Harness {
	const rows: QueueItem[] = []
	const clock = {now: START}
	let id = 0
	const registry = new IntakeRegistry({rows: () => rows, now: () => clock.now, newId: () => `fresh-${++id}`})
	return {
		registry,
		rows,
		clock,
		place: (itemId, intakeId, clientId) => {
			const row = placeholderRow(itemId, origin(intakeId, clientId))
			rows.push(row)
			registry.hearRows([row])
		},
		outcome: (intakeId, outcome) => {
			const event: IntakeOutcomeEvent = {kind: 'outcome', requestId: 'r', intakeId, origin: 'localClient', outcome}
			registry.hearOutcome(event)
		}
	}
}

function state(h: Harness, intakeId: string): IntakeRecord['state'] | undefined {
	return h.registry.get(intakeId)?.state
}

const YTDLP_RATE_LIMIT: ProbeError = {kind: 'ytdlp', error: {kind: 'rateLimit', raw: 'HTTP Error 429'}}
const YTDLP_UNAVAILABLE: ProbeError = {kind: 'ytdlp', error: {kind: 'unavailable', raw: 'Video unavailable'}}

describe('IntakeRegistry', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	it('has a boot id that changes every launch', () => {
		expect(h.registry.bootId).toMatch(/^[0-9a-f-]{36}$/)
		expect(harness().registry.bootId).not.toBe(h.registry.bootId)
	})

	it("starts a client's intake probing when its placeholder row is placed", () => {
		h.place('p1', 'i1')
		const record = h.registry.get('i1')
		expect(record).toEqual({intakeId: 'i1', placeholderId: 'p1', clientId: 'client-1', state: {state: 'probing'}, updatedAt: START})
		expect(intakeViewSchema.parse(record)).toEqual({intakeId: 'i1', placeholderId: 'p1', state: {state: 'probing'}, updatedAt: START})
	})

	it('follows only rows a Control client added', () => {
		h.registry.hearRows([placeholderRow('w1', {kind: 'window', intakeId: 'iw'}), placeholderRow('k1', {kind: 'hotkey', intakeId: 'ik'}), makeItem({id: 'plain', status: 'pending'})])
		expect(h.registry.get('iw')).toBeUndefined()
		expect(h.registry.get('ik')).toBeUndefined()
	})

	it("stops a client at its cap of intakes still probing, counting only that client's", () => {
		for (let index = 1; index < CONTROL_PROBING_INTAKES_PER_CLIENT; index++) h.place(`p${index}`, `i${index}`)
		h.place('other', 'i-other', 'client-2')
		expect(h.registry.probingCapReached('client-1')).toBe(false)
		h.place('last', 'i-last')
		expect(h.registry.probingCapReached('client-1')).toBe(true)
		expect(h.registry.probingCapReached('client-2')).toBe(false)
		// An intake waiting for a choice no longer probes.
		h.outcome('i1', {kind: 'needs-choice', itemId: 'p1', choice: {kind: 'playlist-cap', loaded: 100}, capped: true})
		expect(h.registry.probingCapReached('client-1')).toBe(false)
	})

	describe('intake outcomes', () => {
		it('queues the intake with every row it made', () => {
			h.place('p1', 'i1')
			h.rows.splice(0, 1, makeItem({id: 'p1', status: 'pending', origin: origin('i1')}), makeItem({id: 'other', status: 'pending'}), makeItem({id: 'r2', status: 'pending', url: 'https://youtu.be/v2', origin: origin('i1')}))
			h.clock.now += 5
			h.outcome('i1', {kind: 'queued', itemId: 'p1', skippedAlreadyQueued: 0})
			expect(h.registry.get('i1')).toMatchObject({state: {state: 'queued', itemIds: ['p1', 'r2']}, updatedAt: START + 5})
		})

		it('a queued intake whose rows are already gone names its first row', () => {
			h.place('p1', 'i1')
			h.rows.length = 0
			h.outcome('i1', {kind: 'queued', itemId: 'p1', skippedAlreadyQueued: 0})
			expect(state(h, 'i1')).toEqual({state: 'queued', itemIds: ['p1']})
		})

		it('nothing new, or every video already queued elsewhere', () => {
			h.place('p1', 'i1')
			h.place('p2', 'i2')
			h.place('p3', 'i3')
			h.outcome('i1', {kind: 'nothing-new', skippedAlreadyQueued: 3})
			h.outcome('i2', {kind: 'already-queued', itemId: 'live-row'})
			h.outcome('i3', {kind: 'already-queued', itemId: null})
			expect(state(h, 'i1')).toEqual({state: 'nothingNew'})
			expect(state(h, 'i2')).toEqual({state: 'queued', itemIds: ['live-row']})
			expect(state(h, 'i3')).toEqual({state: 'nothingNew'})
		})

		it("a probe failure carries yt-dlp's kind and whether a retry can help", () => {
			const failures: [ProbeError | null, {ytdlpKind: string | null; retryable: boolean}][] = [
				[YTDLP_RATE_LIMIT, {ytdlpKind: 'rateLimit', retryable: true}],
				[YTDLP_UNAVAILABLE, {ytdlpKind: 'unavailable', retryable: false}],
				[
					{kind: 'other', code: 'unknown', message: 'offline'},
					{ytdlpKind: null, retryable: true}
				],
				[
					{kind: 'other', code: 'invalid_url', message: 'bad'},
					{ytdlpKind: null, retryable: false}
				],
				// The probe answered and preparing the rows failed (a missing folder, say).
				[null, {ytdlpKind: null, retryable: true}]
			]
			failures.forEach(([probeError, expected], index) => {
				h.place(`p${index}`, `i${index}`)
				h.outcome(`i${index}`, {kind: 'failed', itemId: `p${index}`, title: 't', probeError})
				expect(state(h, `i${index}`)).toEqual({state: 'probeFailed', ...expected})
			})
		})

		it('a load limit or a playlist review needs the client to choose', () => {
			h.place('p1', 'i1')
			h.place('p2', 'i2')
			h.place('p3', 'i3')
			h.outcome('i1', {kind: 'needs-choice', itemId: 'p1', choice: {kind: 'playlist-cap', loaded: 100}, capped: true})
			h.outcome('i2', {kind: 'needs-choice', itemId: 'p2', choice: {kind: 'playlist-review', count: 7}, capped: false})
			h.outcome('i3', {kind: 'needs-choice', itemId: 'p3', choice: {kind: 'playlist-review', count: 100}, capped: true})
			expect(state(h, 'i1')).toEqual({state: 'needsYourChoice', kind: 'loadLimit', total: null, offered: 100})
			expect(state(h, 'i2')).toEqual({state: 'needsYourChoice', kind: 'playlistReview', total: 7, offered: 7})
			expect(state(h, 'i3')).toEqual({state: 'needsYourChoice', kind: 'playlistReview', total: null, offered: 100})
		})

		it('ignores outcomes of intakes it does not follow', () => {
			h.outcome('unknown', {kind: 'nothing-new', skippedAlreadyQueued: 0})
			expect(h.registry.get('unknown')).toBeUndefined()
		})
	})

	describe('the queue', () => {
		it('a placeholder cancelled or removed before its intake ended cancels the intake', () => {
			h.place('p1', 'i1')
			h.place('p2', 'i2')
			h.outcome('i2', {kind: 'needs-choice', itemId: 'p2', choice: {kind: 'playlist-cap', loaded: 100}, capped: true})
			h.registry.hearRemoved('p1', 'cancelled')
			h.registry.hearRemoved('p2', 'removed')
			expect(state(h, 'i1')).toEqual({state: 'cancelled'})
			expect(state(h, 'i2')).toEqual({state: 'cancelled'})
		})

		// The probe's swap takes the placeholder out first; its outcome follows.
		it('a placeholder swapped by its probe leaves the intake probing until the outcome', () => {
			h.place('p1', 'i1')
			h.place('p2', 'i2')
			h.registry.hearRemoved('p1', 'replaced')
			h.registry.hearRemoved('p2', 'nothingNew')
			expect(state(h, 'i1')).toEqual({state: 'probing'})
			expect(state(h, 'i2')).toEqual({state: 'probing'})
			h.outcome('i2', {kind: 'nothing-new', skippedAlreadyQueued: 1})
			expect(state(h, 'i2')).toEqual({state: 'nothingNew'})
		})

		it('a cancelled intake hears no later outcome', () => {
			h.place('p1', 'i1')
			h.registry.hearRemoved('p1', 'cancelled')
			h.outcome('i1', {kind: 'failed', itemId: 'p1', title: 't', probeError: null})
			expect(state(h, 'i1')).toEqual({state: 'cancelled'})
		})

		it('a removed probe-error row keeps its failure, and a queued row going leaves the intake queued', () => {
			h.place('p1', 'i1')
			h.place('p2', 'i2')
			h.outcome('i1', {kind: 'failed', itemId: 'p1', title: 't', probeError: YTDLP_RATE_LIMIT})
			h.outcome('i2', {kind: 'queued', itemId: 'p2', skippedAlreadyQueued: 0})
			h.registry.hearRemoved('p1', 'removed')
			h.registry.hearRemoved('p2', 'autoRemoved')
			expect(state(h, 'i1')).toEqual({state: 'probeFailed', ytdlpKind: 'rateLimit', retryable: true})
			expect(state(h, 'i2')).toEqual({state: 'queued', itemIds: ['p2']})
		})

		// A Retry or a choice, from the client or the window, puts the row back to probing.
		it('a placeholder probing again moves its intake back to probing', () => {
			h.place('p1', 'i1')
			h.place('p2', 'i2')
			h.outcome('i1', {kind: 'failed', itemId: 'p1', title: 't', probeError: YTDLP_RATE_LIMIT})
			h.outcome('i2', {kind: 'needs-choice', itemId: 'p2', choice: {kind: 'playlist-cap', loaded: 100}, capped: true})
			h.registry.hearRows([placeholderRow('p1', origin('i1')), placeholderRow('p2', origin('i2'))])
			expect(state(h, 'i1')).toEqual({state: 'probing'})
			expect(state(h, 'i2')).toEqual({state: 'probing'})
		})
	})

	it('answers a link already in the queue with a fresh intake queued on that row', () => {
		const record = h.registry.adoptLive('client-1', 'live-row')
		expect(record).toEqual({intakeId: 'fresh-1', placeholderId: 'live-row', clientId: 'client-1', state: {state: 'queued', itemIds: ['live-row']}, updatedAt: START})
		expect(h.registry.get('fresh-1')).toEqual(record)
	})

	it('tells listeners about every change, until they stop listening', () => {
		const heard = vi.fn<(record: IntakeRecord) => void>()
		const stop = h.registry.onChange(heard)
		h.place('p1', 'i1')
		// The same state again is no change.
		h.registry.hearRows([placeholderRow('p1', origin('i1'))])
		h.outcome('i1', {kind: 'nothing-new', skippedAlreadyQueued: 0})
		stop()
		h.place('p2', 'i2')
		expect(heard.mock.calls.map(([record]) => [record.intakeId, record.state.state])).toEqual([
			['i1', 'probing'],
			['i1', 'nothingNew']
		])
	})

	describe('retention', () => {
		it('forgets an ended intake once the retention window has passed', () => {
			h.place('p1', 'i1')
			h.outcome('i1', {kind: 'nothing-new', skippedAlreadyQueued: 0})
			h.clock.now += INTAKE_RETENTION_MS - 1
			expect(state(h, 'i1')).toEqual({state: 'nothingNew'})
			h.clock.now += 1
			expect(h.registry.get('i1')).toBeUndefined()
		})

		it('keeps an intake probing or waiting for a choice for as long as its placeholder lives', () => {
			h.place('p1', 'i1')
			h.place('p2', 'i2')
			h.outcome('i2', {kind: 'needs-choice', itemId: 'p2', choice: {kind: 'playlist-cap', loaded: 100}, capped: true})
			h.clock.now += INTAKE_RETENTION_MS * 10
			expect(state(h, 'i1')).toEqual({state: 'probing'})
			expect(state(h, 'i2')).toMatchObject({state: 'needsYourChoice'})
		})

		it('keeps a probe failure while its row can still be retried, and a window past its removal', () => {
			h.place('p1', 'i1')
			h.outcome('i1', {kind: 'failed', itemId: 'p1', title: 't', probeError: null})
			h.clock.now += INTAKE_RETENTION_MS * 10
			expect(state(h, 'i1')).toMatchObject({state: 'probeFailed'})
			h.registry.hearRemoved('p1', 'removed')
			h.clock.now += INTAKE_RETENTION_MS - 1
			expect(state(h, 'i1')).toMatchObject({state: 'probeFailed'})
			h.clock.now += 1
			expect(h.registry.get('i1')).toBeUndefined()
		})

		it('past its bound forgets the oldest ended intakes first, never a live one', () => {
			h.place('live', 'i-live')
			for (let index = 0; index < INTAKE_RECORDS_MAX; index++) {
				h.clock.now += 1
				h.registry.adoptLive('client-1', `row-${index}`)
			}
			// One over the bound: the oldest ended intake goes, the probing one stays.
			expect(h.registry.get('i-live')).toBeDefined()
			expect(h.registry.get('fresh-1')).toBeUndefined()
			expect(h.registry.get('fresh-2')).toBeDefined()
			expect(h.registry.get(`fresh-${INTAKE_RECORDS_MAX}`)).toBeDefined()
		})
	})
})
