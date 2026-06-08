import {describe, expect, it, vi} from 'vitest'
import {JobLifecycle} from '@main/services/JobLifecycle.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveJob} from '@main/services/phases/types.js'
import type {DownloadJob, StartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'
import type {RecentJobsStore} from '@main/stores/RecentJobsStore.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const PREPARED: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}

function makeJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
}

function makeActive(disposableFns: (() => Promise<void> | void)[] = []): ActiveJob {
	const controller = new AbortController()
	const input: StartDownloadInput = {url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', job: PREPARED}
	const stack = new AsyncStack()
	for (const fn of disposableFns) {
		stack.defer(async () => {
			try {
				await fn()
			} catch {}
		})
	}
	return {job: makeJob(), input, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: stack}
}

function makeStore(): RecentJobsStore & {pushed: unknown[]} {
	const pushed: unknown[] = []
	return {
		push: vi.fn(async (job: unknown) => {
			pushed.push(job)
		}),
		list: vi.fn(),
		pushed
	} as unknown as RecentJobsStore & {pushed: unknown[]}
}

describe('JobLifecycle.drain', () => {
	it('drains disposables in LIFO order', async () => {
		const order: string[] = []
		const active = makeActive([
			() => {
				order.push('a')
			},
			() => {
				order.push('b')
			},
			() => {
				order.push('c')
			}
		])

		await new JobLifecycle(makeStore()).drain(active)

		expect(order).toEqual(['c', 'b', 'a'])
		expect(active.disposables.disposed).toBe(true)
	})

	it('continues drain when one disposable throws', async () => {
		const order: string[] = []
		const active = makeActive([
			() => {
				order.push('first')
			},
			() => {
				throw new Error('boom')
			},
			() => {
				order.push('last')
			}
		])

		await new JobLifecycle(makeStore()).drain(active)

		expect(order).toEqual(['last', 'first'])
	})

	it('is a no-op for empty disposables stack', async () => {
		const active = makeActive([])
		await new JobLifecycle(makeStore()).drain(active)
		expect(active.disposables.disposed).toBe(true)
	})
})

describe('JobLifecycle.finalize', () => {
	it('writes one RecentJob entry per call', async () => {
		const store = makeStore()
		const active = makeActive([])

		await new JobLifecycle(store).finalize(active.job, 'completed')

		expect(store.push).toHaveBeenCalledOnce()
	})

	it('persists error.kind on failed jobs', async () => {
		const store = makeStore()
		const active = makeActive([])

		await new JobLifecycle(store).finalize(active.job, 'failed', {kind: 'botBlock', raw: 'sign-in'})

		const pushed = (store as unknown as {pushed: {status: string; error?: {kind: string}}[]}).pushed
		expect(pushed[0].status).toBe('failed')
		expect(pushed[0].error?.kind).toBe('botBlock')
	})
})
