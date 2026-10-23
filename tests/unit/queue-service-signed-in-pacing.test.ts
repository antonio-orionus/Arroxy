// @vitest-environment node

import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import {LaunchGate} from '@main/services/LaunchGate.js'
import {SiteRequestState} from '@main/services/SiteRequestState.js'
import {SignedInPacer} from '@main/services/SignedInPacer.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// A queued row that starts signed in waits for its site's signed-in pacing
// before it takes a download lane, so it never holds a lane doing nothing
// while rows for other sites wait behind it (ADR 0022).

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

function startedIds(ds: FakeDownloadService): string[] {
	return ds.start.mock.calls.map(([input]) => (input as {url: string}).url.split('/').pop() ?? '')
}

const SPACING_MS = 10_000

function setup() {
	const pacer = new SignedInPacer({pacing: () => ({atOnce: 1, spacingMs: SPACING_MS, jitterMs: 0, windowMs: 60 * 60_000, perWindow: 1000, entriesPerLaunch: 50})})
	const gate = new LaunchGate({cooldowns: new SiteRequestState({random: () => 1}), signedIn: pacer})
	const ds = new FakeDownloadService()
	ds.start.mockImplementation(async () => jobResult())
	const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 4, 4, undefined, undefined, gate)
	return {pacer, ds, qs}
}

const signedIn = (id: string, extra: Partial<QueueItem> = {}): QueueItem => makeItem({id, status: 'pending', auth: 'exploreSession', url: `https://www.instagram.com/reel/${id}`, ...extra})

describe('QueueService — signed-in pacing before the lane', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		jobCounter = 0
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('holds a signed-in row until its site’s spacing allows it, while other rows start', async () => {
		const {pacer, ds, qs} = setup()
		await pacer.run('instagram', 'earlier', () => Promise.resolve())

		qs.add([signedIn('a'), makeItem({id: 'b', status: 'pending', url: 'https://www.instagram.com/reel/b'}), makeItem({id: 'c', status: 'pending', auth: 'exploreSession', url: 'https://x.com/u/status/c'})])
		await vi.advanceTimersByTimeAsync(0)
		expect(startedIds(ds).sort()).toEqual(['b', 'c'])

		await vi.advanceTimersByTimeAsync(SPACING_MS)
		expect(startedIds(ds).sort()).toEqual(['a', 'b', 'c'])
	})

	it('holds a signed-in row while its site is full, and starts it when a slot frees', async () => {
		const {pacer, ds, qs} = setup()
		let release: () => void = () => undefined
		void pacer.run('instagram', 'holder', () => new Promise<void>(resolve => (release = resolve)))
		await vi.advanceTimersByTimeAsync(0)

		qs.add([signedIn('a', {lane: 'priority'})])
		await vi.advanceTimersByTimeAsync(SPACING_MS * 3)
		expect(ds.start).not.toHaveBeenCalled()

		release()
		await vi.advanceTimersByTimeAsync(0)
		expect(startedIds(ds)).toEqual(['a'])
	})

	it('lets a priority row skip the spacing, and tells its runs they are explicit', async () => {
		const {pacer, ds, qs} = setup()
		await pacer.run('instagram', 'earlier', () => Promise.resolve())

		qs.add([signedIn('a', {lane: 'priority'})])
		await vi.advanceTimersByTimeAsync(0)

		expect(startedIds(ds)).toEqual(['a'])
		expect(ds.start).toHaveBeenCalledWith(expect.objectContaining({auth: 'exploreSession', explicit: true}))
	})

	it('never marks a normal-lane row explicit', async () => {
		const {ds, qs} = setup()
		qs.add([signedIn('a')])
		await vi.advanceTimersByTimeAsync(0)

		expect(ds.start.mock.calls[0]?.[0]).not.toHaveProperty('explicit')
	})
})
