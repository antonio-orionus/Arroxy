import {describe, expect, it} from 'vitest'
import {buildQueueDrawerView, rowStride} from '@renderer/store/queueDrawerView.js'
import {makeItem} from '../shared/fixtures.js'

describe('QueueDrawerView', () => {
	it('orders active items before finished items and derives aggregate drawer state', () => {
		const running = makeItem({id: 'running', status: 'running', progressPercent: 30})
		const pending = makeItem({id: 'pending', status: 'pending'})
		const done = makeItem({id: 'done', status: 'done', progressPercent: 100})
		const cancelled = makeItem({id: 'cancelled', status: 'cancelled'})

		const view = buildQueueDrawerView([done, running, cancelled, pending], {shareHighValueBannerDismissed: true})

		expect(view.orderedQueue.map(item => item.id)).toEqual(['running', 'pending', 'done', 'cancelled'])
		expect(view.activeCount).toBe(1)
		expect(view.totalCount).toBe(4)
		expect(view.hasCompleted).toBe(true)
		expect(view.hasInFlight).toBe(true)
		expect(view.headerProgress).toBe(30)
		expect(view.showShareBanner).toBe(false)
	})

	it('averages progress across running items only', () => {
		const view = buildQueueDrawerView([makeItem({id: 'a', status: 'running', progressPercent: 25}), makeItem({id: 'b', status: 'running', progressPercent: 75}), makeItem({id: 'paused', status: 'paused-active', progressPercent: 99})], {shareHighValueBannerDismissed: false})

		expect(view.activeCount).toBe(2)
		expect(view.aggregatePercent).toBe(50)
		expect(view.headerProgress).toBe(50)
		expect(view.hasPaused).toBe(true)
	})

	it('shows the high-value share banner only after a successful completion', () => {
		const highValue = {formatLabel: '2160p 4K HDR'}
		const notSuccessful = buildQueueDrawerView([makeItem({id: 'cancelled', status: 'cancelled', ...highValue}), makeItem({id: 'failed', status: 'error', ...highValue}), makeItem({id: 'running', status: 'running', ...highValue})], {shareHighValueBannerDismissed: false})
		const successful = buildQueueDrawerView([makeItem({id: 'done', status: 'done', ...highValue})], {shareHighValueBannerDismissed: false})

		expect(notSuccessful.hasHighValueCompletion).toBe(false)
		expect(notSuccessful.showShareBanner).toBe(false)
		expect(successful.hasHighValueCompletion).toBe(true)
		expect(successful.showShareBanner).toBe(true)
	})

	it('keeps row-size policy outside the drawer adapter', () => {
		expect(rowStride(makeItem({id: 'short', status: 'pending'}))).toBe(54)
		expect(rowStride(makeItem({id: 'running', status: 'running'}))).toBe(82)
		expect(rowStride(makeItem({id: 'failed', status: 'error'}))).toBe(82)
		expect(rowStride(makeItem({id: 'subs', status: 'done', lastStatus: {key: 'subtitlesFailed', params: {}}}))).toBe(82)
	})
})
