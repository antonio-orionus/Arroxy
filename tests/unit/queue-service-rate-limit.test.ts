// @vitest-environment node

import {describe, expect, it, vi, beforeEach, afterEach} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import {RATE_LIMIT_BASE_MS, RATE_LIMIT_CAP_MS, SiteRequestState} from '@main/services/SiteRequestState.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// Queued starts wait out a site's rate-limit cooldown instead of spawning a
// download that would only meet the same limit; they start on their own once
// it ends. Automatic retries are never scheduled sooner than its end.

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
	setMaxConcurrent = vi.fn()
}

function fakeStore(items: QueueItem[] = []): QueueStore {
	return {load: vi.fn().mockResolvedValue(ok({items, schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
}

let jobCounter = 0
function jobResult() {
	jobCounter += 1
	return ok({job: {id: `job-${jobCounter}`, url: '', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}})
}

function startedUrls(ds: FakeDownloadService): string[] {
	return ds.start.mock.calls.map(([input]) => (input as {url: string}).url)
}

function setup(maxConcurrent = 4) {
	const siteRequests = new SiteRequestState({random: () => 1})
	const ds = new FakeDownloadService()
	ds.start.mockImplementation(async () => jobResult())
	const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, maxConcurrent, maxConcurrent, undefined, undefined, siteRequests)
	return {siteRequests, ds, qs}
}

describe('QueueService — rate-limit cooldown', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		jobCounter = 0
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('holds queued starts for a rate-limited site in both lanes, then starts them when the cooldown ends', async () => {
		const {siteRequests, ds, qs} = setup()
		siteRequests.recordRateLimit('youtube', 'rateLimited')

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'b', status: 'pending', lane: 'priority'})])
		await vi.advanceTimersByTimeAsync(RATE_LIMIT_BASE_MS - 1)
		expect(ds.start).not.toHaveBeenCalled()

		await vi.advanceTimersByTimeAsync(1)
		expect(startedUrls(ds).sort()).toEqual(['https://youtube.com/watch?v=a', 'https://youtube.com/watch?v=b'])
	})

	it('starts items for other sites meanwhile', async () => {
		const {siteRequests, ds, qs} = setup()
		siteRequests.recordRateLimit('youtube', 'rateLimited')

		qs.add([makeItem({id: 'a', status: 'pending'}), makeItem({id: 'v', status: 'pending', url: 'https://vimeo.com/1'})])
		await vi.advanceTimersByTimeAsync(0)

		expect(startedUrls(ds)).toEqual(['https://vimeo.com/1'])
	})

	it('a 429 burst: once the first job meets the limit, the rest wait for the cooldown', async () => {
		const {siteRequests, ds, qs} = setup(1)
		qs.add(['a', 'b', 'c', 'd'].map(id => makeItem({id, status: 'pending'})))
		await vi.advanceTimersByTimeAsync(0)
		expect(ds.start).toHaveBeenCalledTimes(1)

		// What the yt-dlp adapter does when the run's stderr shows the 429.
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		ds.emit('status', {jobId: 'job-1', stage: 'error', statusKey: 'failed', at: new Date().toISOString(), error: {kind: 'rateLimit', raw: 'HTTP Error 429: Too Many Requests'}})
		await vi.advanceTimersByTimeAsync(RATE_LIMIT_BASE_MS - 1)
		expect(ds.start).toHaveBeenCalledTimes(1)

		await vi.advanceTimersByTimeAsync(1)
		expect(ds.start).toHaveBeenCalledTimes(2)
	})

	it('starts held items as soon as a "Try now" request comes back clean', async () => {
		const {siteRequests, ds, qs} = setup()
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.advanceTimersByTimeAsync(0)
		expect(ds.start).not.toHaveBeenCalled()

		siteRequests.recordCleanBypass('youtube')
		await vi.advanceTimersByTimeAsync(0)
		expect(ds.start).toHaveBeenCalledOnce()
	})

	it('schedules an automatic retry no sooner than the cooldown ends', async () => {
		const {siteRequests, ds, qs} = setup()
		qs.setAutoRetryAttempts(3)
		qs.add([makeItem({id: 'a', status: 'pending'})])
		await vi.advanceTimersByTimeAsync(0)
		expect(ds.start).toHaveBeenCalledOnce()

		// A long cooldown: the fourth repeat within the window reaches the cap.
		for (let repeat = 0; repeat < 5; repeat++) {
			siteRequests.recordRateLimit('youtube', 'rateLimited')
			vi.setSystemTime(siteRequests.rateLimitedUntil('youtube')! + 1_000)
		}
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		const until = siteRequests.rateLimitedUntil('youtube')!
		expect(until - Date.now()).toBe(RATE_LIMIT_CAP_MS)

		ds.emit('status', {jobId: 'job-1', stage: 'error', statusKey: 'failed', at: new Date().toISOString(), error: {kind: 'rateLimit', raw: 'HTTP Error 429: Too Many Requests'}})
		const retryAt = qs.snapshot().find(item => item.id === 'a')?.retryAt
		expect(retryAt).toBe(new Date(until).toISOString())
	})
})
