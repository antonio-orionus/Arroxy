import {describe, expect, it} from 'vitest'
import {canApplyQueueActionToItem, planQueueAction} from '@shared/queueActions.js'
import {makeItem} from '../shared/fixtures.js'

describe('planQueueAction', () => {
	it('pauses pending and running items while skipping invalid statuses', () => {
		const result = planQueueAction('pause', [makeItem({id: 'pending', status: 'pending'}), makeItem({id: 'running', status: 'running'}), makeItem({id: 'done', status: 'done'}), makeItem({id: 'paused', status: 'paused-active'})])

		expect(result.applicableIds).toEqual(['pending', 'running'])
		expect(result.skipped).toEqual([
			{itemId: 'done', status: 'done', reason: 'invalid-status'},
			{itemId: 'paused', status: 'paused-active', reason: 'invalid-status'}
		])
	})

	it('resumes both pause states only', () => {
		const result = planQueueAction('resume', [makeItem({id: 'held', status: 'paused-held'}), makeItem({id: 'active', status: 'paused-active'}), makeItem({id: 'running', status: 'running'})])

		expect(result.applicableIds).toEqual(['held', 'active'])
		expect(result.skipped).toEqual([{itemId: 'running', status: 'running', reason: 'invalid-status'}])
	})

	it('cancels in-flight queue items only', () => {
		const result = planQueueAction('cancel', [makeItem({id: 'pending', status: 'pending'}), makeItem({id: 'running', status: 'running'}), makeItem({id: 'held', status: 'paused-held'}), makeItem({id: 'active', status: 'paused-active'}), makeItem({id: 'error', status: 'error'})])

		expect(result.applicableIds).toEqual(['pending', 'running', 'held', 'active'])
		expect(result.skipped).toEqual([{itemId: 'error', status: 'error', reason: 'invalid-status'}])
	})

	it('retries error and cancelled items only', () => {
		const result = planQueueAction('retry', [makeItem({id: 'error', status: 'error'}), makeItem({id: 'cancelled', status: 'cancelled'}), makeItem({id: 'done', status: 'done'})])

		expect(result.applicableIds).toEqual(['error', 'cancelled'])
		expect(result.skipped).toEqual([{itemId: 'done', status: 'done', reason: 'invalid-status'}])
	})

	it('removes non-running items only', () => {
		const result = planQueueAction('remove', [makeItem({id: 'pending', status: 'pending'}), makeItem({id: 'running', status: 'running'}), makeItem({id: 'done', status: 'done'})])

		expect(result.applicableIds).toEqual(['pending', 'done'])
		expect(result.skipped).toEqual([{itemId: 'running', status: 'running', reason: 'invalid-status'}])
	})

	it('changes output target only for pending queue items that never started', () => {
		const result = planQueueAction('change-output-target', [
			makeItem({id: 'fresh', status: 'pending', lastJobId: undefined, tempDir: undefined, progressPercent: 0}),
			makeItem({id: 'started-pending', status: 'pending', lastJobId: 'job-old', progressPercent: 0}),
			makeItem({id: 'resume-pending', status: 'pending', progressPercent: 0, resumeContext: {kind: 'media-retry', tempDir: '/tmp/.arroxy-temp/resume', reason: 'media-transfer', failureKind: 'network'}}),
			makeItem({id: 'running', status: 'running'}),
			makeItem({id: 'active', status: 'paused-active'}),
			makeItem({id: 'held', status: 'paused-held'}),
			makeItem({id: 'done', status: 'done'}),
			makeItem({id: 'cancelled', status: 'cancelled'})
		])

		expect(result.applicableIds).toEqual(['fresh'])
		expect(result.skipped).toEqual([
			{itemId: 'started-pending', status: 'pending', reason: 'invalid-status'},
			{itemId: 'resume-pending', status: 'pending', reason: 'invalid-status'},
			{itemId: 'running', status: 'running', reason: 'invalid-status'},
			{itemId: 'active', status: 'paused-active', reason: 'invalid-status'},
			{itemId: 'held', status: 'paused-held', reason: 'invalid-status'},
			{itemId: 'done', status: 'done', reason: 'invalid-status'},
			{itemId: 'cancelled', status: 'cancelled', reason: 'invalid-status'}
		])
	})

	it('keeps output-target planning out of the generic queue command action set', () => {
		expect(canApplyQueueActionToItem('change-output-target', makeItem({id: 'fresh', status: 'pending', lastJobId: undefined, tempDir: undefined, progressPercent: 0}))).toBe(true)
	})
})
