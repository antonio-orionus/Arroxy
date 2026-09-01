// @vitest-environment node

import {describe, expect, it} from 'vitest'
import {queueItemSchema} from '@shared/schemas.js'
import type {QueueItem} from '@shared/types.js'
import {transition, illegalTransition} from '@shared/queueTransition.js'
import {canApplyQueueAction} from '@shared/queueActions.js'
import {makeItem} from '../shared/fixtures.js'

const REAL_JOB: QueueItem['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}

function probingItem(overrides: Partial<QueueItem> = {}): QueueItem {
	return makeItem({id: 'p1', status: 'probing', job: UNRESOLVED, ...overrides})
}

// Raw candidate for invalid-shape tests — the validating fixture would throw
// before safeParse could observe the rejection.
function rawCandidate(overrides: Partial<QueueItem>): ReturnType<() => Record<string, unknown>> {
	const base = probingItem()
	return {...base, ...overrides}
}

describe('probing queue-item contract', () => {
	it('schema accepts a probing item with an unresolved job', () => {
		const parsed = queueItemSchema.safeParse(probingItem())
		expect(parsed.success).toBe(true)
	})

	it('schema rejects a probing item with a real job', () => {
		const parsed = queueItemSchema.safeParse(rawCandidate({job: REAL_JOB}))
		expect(parsed.success).toBe(false)
	})

	it('schema rejects a non-probing item with an unresolved job', () => {
		expect(queueItemSchema.safeParse(rawCandidate({status: 'pending', job: UNRESOLVED})).success).toBe(false)
		expect(queueItemSchema.safeParse(rawCandidate({status: 'running', lastJobId: 'j', job: UNRESOLVED})).success).toBe(false)
		expect(queueItemSchema.safeParse(rawCandidate({status: 'done', finishedAt: '2026-01-01T00:00:00.000Z', job: UNRESOLVED})).success).toBe(false)
	})
})

describe('probe-failed transition', () => {
	it('moves probing → error with the probe error attached', () => {
		const next = transition(probingItem(), {kind: 'probe-failed', error: {kind: 'unknown', raw: 'no formats'}})
		expect(next.status).toBe('error')
		expect(next.error).toEqual({kind: 'unknown', raw: 'no formats'})
	})

	it('refuses probe-failed on items that never probed', () => {
		expect(illegalTransition(makeItem({id: 'a', status: 'pending'}), {kind: 'probe-failed', error: {kind: 'unknown', raw: 'x'}})).toBeTruthy()
		expect(illegalTransition(makeItem({id: 'a', status: 'running', lastJobId: 'j'}), {kind: 'probe-failed', error: {kind: 'unknown', raw: 'x'}})).toBeTruthy()
		expect(illegalTransition(makeItem({id: 'a', status: 'error', error: {kind: 'network', raw: 'x'}}), {kind: 'probe-failed', error: {kind: 'unknown', raw: 'x'}})).toBeTruthy()
	})

	it('allows only cancel and probe-failed on a probing item', () => {
		expect(illegalTransition(probingItem(), {kind: 'probe-failed', error: {kind: 'unknown', raw: 'x'}})).toBeNull()
		expect(illegalTransition(probingItem(), {kind: 'cancelled'})).toBeNull()
		expect(illegalTransition(probingItem(), {kind: 'started', lastJobId: 'j'})).toBeTruthy()
		expect(illegalTransition(probingItem(), {kind: 'progress', percent: 10})).toBeTruthy()
		expect(illegalTransition(probingItem(), {kind: 'paused-held'})).toBeTruthy()
		expect(illegalTransition(probingItem(), {kind: 'retry-reset'})).toBeTruthy()
	})
})

describe('queue actions on probing items', () => {
	it('cancel and remove apply to probing items', () => {
		expect(canApplyQueueAction('cancel', 'probing')).toBe(true)
		expect(canApplyQueueAction('remove', 'probing')).toBe(true)
	})

	it('pause, retry, pull-now do not apply to probing items', () => {
		expect(canApplyQueueAction('pause', 'probing')).toBe(false)
		expect(canApplyQueueAction('retry', 'probing')).toBe(false)
		expect(canApplyQueueAction('pull-now', 'probing')).toBe(false)
	})
})
