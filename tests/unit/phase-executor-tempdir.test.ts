import {describe, expect, it, vi} from 'vitest'
import {PhaseExecutor} from '@main/services/phases/PhaseExecutor.js'
import {JobLifecycle} from '@main/services/JobLifecycle.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {Phase, PhaseContext, PhaseOutcome, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, LocalizedError, StartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const DEFAULT_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}

function makeJob(id = 'job-1'): DownloadJob {
	return {id, url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
}

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
	const input: StartDownloadInput = {url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', job: DEFAULT_JOB}
	const controller = new AbortController()
	return {job: makeJob(), input, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack(), ...overrides}
}

function makeCtx(active: ActiveDownload): PhaseContext {
	return {
		active,
		signal: active.signal,
		register: d =>
			active.disposables.defer(async () => {
				try {
					await d()
				} catch {}
			}),
		ytDlp: {} as never,
		emitStatus: vi.fn(),
		safeConsume: vi.fn()
	}
}

function stubPhase(outcome: PhaseOutcome, beforeReturn?: (ctx: PhaseContext) => void): Phase {
	return {
		kind: 'stub',
		run: vi.fn().mockImplementation(async (ctx: PhaseContext) => {
			beforeReturn?.(ctx)
			return outcome
		})
	}
}

// PhaseExecutor returns the resolved outcome; cleanup is now the caller's
// responsibility (DownloadService routes outcomes through JobLifecycle.drain).
// These tests verify the contract at both seams.

describe('PhaseExecutor — outcome propagation', () => {
	it('hard-failed outcome propagates with error payload', async () => {
		const ctx = makeCtx(makeActive())
		const error: LocalizedError = {kind: 'outOfDiskSpace', raw: ''}
		const phase = stubPhase({kind: 'hard-failed', error})

		const outcome = await new PhaseExecutor().run(ctx, [phase])

		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.error).toEqual(error)
	})

	it('cancelled outcome — executor emits cancelled status', async () => {
		const ctx = makeCtx(makeActive())
		const phase = stubPhase({kind: 'cancelled'})

		const outcome = await new PhaseExecutor().run(ctx, [phase])

		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('error', STATUS_KEY.cancelled)
		expect(outcome.kind).toBe('cancelled')
	})

	it('completed outcome — executor emits done/complete', async () => {
		const ctx = makeCtx(makeActive())
		const phase = stubPhase({kind: 'completed'})

		const outcome = await new PhaseExecutor().run(ctx, [phase])

		expect(vi.mocked(ctx.emitStatus)).toHaveBeenCalledWith('done', STATUS_KEY.complete)
		expect(outcome.kind).toBe('completed')
	})

	it('paused outcome — no terminal emitStatus, disposables untouched', async () => {
		const active = makeActive()
		const ctx = makeCtx(active)
		const cleanup = vi.fn()
		ctx.register(cleanup)
		const phase = stubPhase({kind: 'paused'})

		const outcome = await new PhaseExecutor().run(ctx, [phase])

		expect(outcome.kind).toBe('paused')
		expect(vi.mocked(ctx.emitStatus)).not.toHaveBeenCalled()
		expect(cleanup).not.toHaveBeenCalled()
		expect(active.disposables.disposed).toBe(false)
	})
})

describe('JobLifecycle.drain — disposables', () => {
	it('drains LIFO (last pushed, first run)', async () => {
		const recentJobsStore = {push: vi.fn()} as never
		const lifecycle = new JobLifecycle(recentJobsStore)
		const order: string[] = []
		const active = makeActive()
		const ctx = makeCtx(active)
		ctx.register(() => {
			order.push('a')
		})
		ctx.register(() => {
			order.push('b')
		})
		ctx.register(() => {
			order.push('c')
		})

		await lifecycle.drain(active)

		expect(order).toEqual(['c', 'b', 'a'])
		expect(active.disposables.disposed).toBe(true)
	})

	it('one disposable throwing does not block the next', async () => {
		const recentJobsStore = {push: vi.fn()} as never
		const lifecycle = new JobLifecycle(recentJobsStore)
		const order: string[] = []
		const active = makeActive()
		const ctx = makeCtx(active)
		ctx.register(() => {
			order.push('a')
		})
		ctx.register(() => {
			throw new Error('b broke')
		})
		ctx.register(() => {
			order.push('c')
		})

		await lifecycle.drain(active)

		expect(order).toEqual(['c', 'a'])
	})
})
