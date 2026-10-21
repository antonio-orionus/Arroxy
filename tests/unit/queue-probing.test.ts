// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {queueItemSchema} from '@shared/queueItemSchema.js'
import type {QueueItem} from '@shared/types.js'
import {transition, illegalTransition} from '@shared/queueTransition.js'
import {canApplyQueueAction, isLiveQueueItem} from '@shared/queueActions.js'
import {makeItem} from '../shared/fixtures.js'

const REAL_JOB: QueueItem['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}

function probingItem(overrides: Partial<QueueItem> = {}): QueueItem {
	return makeItem({id: 'p1', status: 'probing', job: UNRESOLVED, probeMode: 'video', ...overrides})
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
		expect(queueItemSchema.safeParse(rawCandidate({status: 'pending', job: UNRESOLVED, probeMode: 'video'})).success).toBe(false)
		expect(queueItemSchema.safeParse(rawCandidate({status: 'running', lastJobId: 'j', job: UNRESOLVED, probeMode: 'video'})).success).toBe(false)
		expect(queueItemSchema.safeParse(rawCandidate({status: 'done', finishedAt: '2026-01-01T00:00:00.000Z', job: UNRESOLVED, probeMode: 'video'})).success).toBe(false)
		expect(queueItemSchema.safeParse(rawCandidate({status: 'cancelled', job: UNRESOLVED, probeMode: 'video'})).success).toBe(false)
	})

	it('schema accepts a terminal probe-error row that keeps its unresolved job', () => {
		// probe-failed finalizes the row as an error the user can remove; the
		// unresolved job stays because a probe never produced a real job.
		const failed = {...probingItem(), status: 'error', error: {kind: 'unknown', raw: 'probe failed'}} as const
		const parsed = queueItemSchema.safeParse(failed)
		expect(parsed.success).toBe(true)
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

// A placeholder whose probe found something the user must decide (P2-R38).
describe('needs-choice queue-item contract', () => {
	const CAP_CHOICE = {kind: 'playlist-cap', loaded: 100} as const

	function choiceItem(overrides: Partial<QueueItem> = {}): QueueItem {
		return makeItem({id: 'c1', status: 'needs-choice', job: UNRESOLVED, probeMode: 'video', choice: CAP_CHOICE, ...overrides})
	}

	it('schema accepts a needs-choice row with an unresolved job and its choice', () => {
		expect(queueItemSchema.safeParse(choiceItem()).success).toBe(true)
		expect(queueItemSchema.safeParse(choiceItem({choice: {kind: 'playlist-review', count: 12}})).success).toBe(true)
	})

	it('schema rejects a needs-choice row without a choice or with a real job', () => {
		expect(queueItemSchema.safeParse(rawCandidate({status: 'needs-choice'})).success).toBe(false)
		expect(queueItemSchema.safeParse(rawCandidate({status: 'needs-choice', choice: CAP_CHOICE, job: REAL_JOB})).success).toBe(false)
	})

	it('schema rejects a choice on any other row', () => {
		expect(queueItemSchema.safeParse(rawCandidate({choice: CAP_CHOICE})).success).toBe(false)
	})

	// A Retry probes the way the row was submitted; a placeholder without its
	// mode could only guess.
	it('schema rejects a placeholder without its probe mode', () => {
		const {probeMode: _probeMode, ...withoutMode} = probingItem()
		expect(queueItemSchema.safeParse(withoutMode).success).toBe(false)
		expect(queueItemSchema.safeParse({...withoutMode, status: 'error', error: {kind: 'network', raw: 'x'}}).success).toBe(false)
	})

	it('schema accepts the probe mode a placeholder was submitted with', () => {
		expect(queueItemSchema.safeParse(probingItem({probeMode: 'playlist'})).success).toBe(true)
		expect(queueItemSchema.safeParse(rawCandidate({probeMode: 'sideways' as never})).success).toBe(false)
	})

	it('moves probing → needs-choice with the resolved title', () => {
		const next = transition(probingItem(), {kind: 'needs-choice', choice: CAP_CHOICE, title: 'Road trip mix'})
		expect(next).toMatchObject({status: 'needs-choice', choice: CAP_CHOICE, title: 'Road trip mix'})
		expect(queueItemSchema.safeParse(next).success).toBe(true)
	})

	it('refuses needs-choice on anything but a probing row', () => {
		expect(illegalTransition(choiceItem(), {kind: 'needs-choice', choice: CAP_CHOICE, title: 'x'})).toBeTruthy()
		expect(illegalTransition(makeItem({id: 'a', status: 'pending'}), {kind: 'needs-choice', choice: CAP_CHOICE, title: 'x'})).toBeTruthy()
	})

	it('restarts the probe of a needs-choice row or a probe-error row', () => {
		const restarted = transition(choiceItem(), {kind: 'probe-restarted'})
		expect(restarted.status).toBe('probing')
		expect(restarted.choice).toBeUndefined()
		expect(queueItemSchema.safeParse(restarted).success).toBe(true)

		const failed = transition(probingItem(), {kind: 'probe-failed', error: {kind: 'network', raw: 'x'}})
		const retried = transition(failed, {kind: 'probe-restarted'})
		expect(retried).toMatchObject({status: 'probing', error: null})
		expect(queueItemSchema.safeParse(retried).success).toBe(true)
	})

	// A choice's answer rides on the row, so a Retry and a restart keep to it.
	it('a restart with an answer stores it as the row count, and one without keeps the count it had', () => {
		const answered = transition(choiceItem({probeTake: {kind: 'first', count: 2}}), {kind: 'probe-restarted', probeTake: {kind: 'all'}})
		expect(answered).toMatchObject({status: 'probing', probeTake: {kind: 'all'}})
		expect(queueItemSchema.safeParse(answered).success).toBe(true)

		const failed = transition(answered, {kind: 'probe-failed', error: {kind: 'network', raw: 'x'}})
		expect(transition(failed, {kind: 'probe-restarted'}).probeTake).toEqual({kind: 'all'})
	})

	it('restarts no probe on a row that has a real job', () => {
		expect(illegalTransition(makeItem({id: 'a', status: 'error', error: {kind: 'network', raw: 'x'}}), {kind: 'probe-restarted'})).toBeTruthy()
		expect(illegalTransition(probingItem(), {kind: 'probe-restarted'})).toBeTruthy()
	})

	it('keeps a needs-choice row live, cancellable and removable, never startable', () => {
		expect(isLiveQueueItem(choiceItem())).toBe(true)
		expect(canApplyQueueAction('cancel', 'needs-choice')).toBe(true)
		expect(canApplyQueueAction('remove', 'needs-choice')).toBe(true)
		expect(canApplyQueueAction('retry', 'needs-choice')).toBe(false)
		expect(canApplyQueueAction('pull-now', 'needs-choice')).toBe(false)
		expect(illegalTransition(choiceItem(), {kind: 'started', lastJobId: 'j'})).toBeTruthy()
	})
})
