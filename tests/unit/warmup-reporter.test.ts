// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {WarmupReporter, type WarmupReporterDeps} from '@main/services/WarmupReporter.js'
import type {WarmupReportHit} from '@main/services/warmupReport.js'
import type {WarmupReportState} from '@main/stores/WarmupReportStore.js'
import {fail, ok} from '@shared/result.js'
import type {DependencyDiagnostic, DependencyId, WarmUpOutput} from '@shared/types.js'

const DAY = 86_400_000
const START = Date.parse('2026-10-22T10:00:00Z')

function diagnostic(id: DependencyId): DependencyDiagnostic {
	return {id, state: 'runnable', source: null, resolvedPath: `/x/${id}`, attempts: []}
}

function output(overrides: Partial<WarmUpOutput> = {}): WarmUpOutput {
	return {completed: true, dependencies: {'yt-dlp': diagnostic('yt-dlp'), ffmpeg: diagnostic('ffmpeg'), ffprobe: diagnostic('ffprobe')}, blockingFailures: [], cancelled: false, ...overrides}
}

function makeReporter(opts: {state?: WarmupReportState; installed?: boolean; delivered?: boolean; enabled?: boolean} = {}) {
	let state: WarmupReportState = opts.state ?? {attempt: 0, firstPending: false}
	let now = START
	const hits: WarmupReportHit[] = []
	const deps: WarmupReporterDeps = {
		state: {read: () => state, write: next => void (state = next)},
		send: vi.fn(async (hit: WarmupReportHit) => {
			hits.push(hit)
			return opts.delivered ?? true
		}),
		context: () => ({appVersion: '0.7.4', platform: 'win32', arch: 'x64', osLocale: 'zh-CN'}),
		hasManagedInstall: vi.fn(async () => opts.installed ?? false),
		manifestSource: () => 'remote',
		isEnabled: () => opts.enabled ?? true,
		now: () => now
	}
	return {reporter: new WarmupReporter(deps), hits, deps, state: () => state, advance: (ms: number) => void (now += ms)}
}

const paths = (hits: WarmupReportHit[]): string[] => hits.map(hit => hit.p)

describe('WarmupReporter', () => {
	it('reports nothing for a warmup that only verifies', async () => {
		const {reporter, hits} = makeReporter({installed: true})
		const run = reporter.runStarted()
		run.progress({binary: 'yt-dlp', phase: 'probing'})
		await run.settled(ok(output()))
		expect(hits).toEqual([])
	})

	it('sends started at the first download and one outcome when the warmup settles', async () => {
		const {reporter, hits, advance, state} = makeReporter({installed: false})
		const run = reporter.runStarted()
		run.progress({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 0, totalBytes: 40_000_000})
		run.progress({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0, totalBytes: 18_000_000})
		advance(20_000)
		run.progress({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 20_000_000, totalBytes: 40_000_000})
		await run.settled(ok(output()))
		expect(paths(hits)).toEqual(['/0.7.4/first/a1/started', '/0.7.4/first/a1/ok'])
		expect(hits[1]).toMatchObject({r: '10-30s', uc: 'remote', ut: 'none', uco: '2-10mbps', us: 'zh-CN'})
		// A finished setup starts the count again.
		expect(state()).toEqual({attempt: 0, firstPending: false})
	})

	it('labels a warmup on an install that already has managed binaries as an update', async () => {
		const {reporter, hits} = makeReporter({installed: true})
		const run = reporter.runStarted()
		run.progress({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0})
		await run.settled(ok(output()))
		expect(paths(hits)).toEqual(['/0.7.4/update/a1/started', '/0.7.4/update/a1/ok'])
	})

	it('keeps a failed first setup first on the next try, even once part of it is on disk', async () => {
		const {reporter, hits, state} = makeReporter({installed: false})
		const first = reporter.runStarted()
		first.progress({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 0})
		await first.settled(ok(output({completed: false, blockingFailures: ['ffmpeg']})))
		expect(state()).toEqual({attempt: 1, firstPending: true})

		const again = makeReporter({state: state(), installed: true})
		const retry = again.reporter.runStarted()
		retry.progress({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 0})
		await retry.settled(ok(output()))
		expect(paths(hits)).toEqual(['/0.7.4/first/a1/started', '/0.7.4/first/a1/failed'])
		expect(paths(again.hits)).toEqual(['/0.7.4/first/a2/started', '/0.7.4/first/a2/ok'])
	})

	it('reports a stopped warmup and a warmup that failed before any diagnostics', async () => {
		const stopped = makeReporter()
		const run = stopped.reporter.runStarted()
		run.progress({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0})
		await run.settled(ok(output({completed: false, cancelled: true})))
		expect(paths(stopped.hits)).toEqual(['/0.7.4/first/a1/started', '/0.7.4/first/a1/stopped'])

		const broken = makeReporter()
		const brokenRun = broken.reporter.runStarted()
		brokenRun.progress({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0})
		await brokenRun.settled(fail({code: 'binary', message: 'EACCES', recoverable: true}))
		expect(broken.hits.at(-1)).toMatchObject({p: '/0.7.4/first/a1/failed', ut: 'unknown'})
	})

	it('sends quit for a warmup still downloading when the app quits, and nothing after it', async () => {
		const {reporter, hits, advance} = makeReporter()
		const run = reporter.runStarted()
		run.progress({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 0})
		advance(200_000)
		await reporter.quit()
		await run.settled(ok(output({completed: false, cancelled: true})))
		expect(paths(hits)).toEqual(['/0.7.4/first/a1/started', '/0.7.4/first/a1/quit'])
		expect(hits[1]?.r).toBe('2-5m')
	})

	it('measures a resumed download from its first byte count, not from zero', async () => {
		const {reporter, hits, advance} = makeReporter()
		const run = reporter.runStarted()
		// The download start carries no byte count; the resume begins at 30 MB.
		run.progress({binary: 'ffmpeg', phase: 'downloading'})
		run.progress({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 30_000_000})
		advance(10_000)
		run.progress({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 31_000_000})
		await run.settled(ok(output()))
		// 1 MB in 10 s, not 31 MB.
		expect(hits[1]?.uco).toBe('0.5-2mbps')
	})

	it('never rejects into the warmup or the quit when the state cannot be written', async () => {
		const {reporter, deps} = makeReporter()
		deps.state.write = () => {
			throw new Error('disk full')
		}
		const run = reporter.runStarted()
		run.progress({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0})
		await expect(reporter.quit()).resolves.toBeUndefined()
		await expect(run.settled(ok(output()))).resolves.toBeUndefined()
	})

	it('has nothing to send on quit when no warmup is downloading', () => {
		const {reporter} = makeReporter()
		reporter.runStarted()
		expect(reporter.quit()).toBeNull()
	})

	it('keeps a report the collector did not take and sends it once at the next launch', async () => {
		const offline = makeReporter({delivered: false})
		const run = offline.reporter.runStarted()
		run.progress({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0})
		await run.settled(ok(output()))
		const kept = offline.state().undelivered
		expect(kept?.hit.p).toBe('/0.7.4/first/a1/ok')

		const next = makeReporter({state: offline.state(), delivered: false})
		await next.reporter.retryUndelivered()
		expect(paths(next.hits)).toEqual(['/0.7.4/first/a1/ok'])
		// Retried once: a second failure drops it.
		expect(next.state().undelivered).toBeUndefined()
	})

	it('drops a kept report older than seven days without sending it', async () => {
		const {reporter, hits, state} = makeReporter({state: {attempt: 0, firstPending: false, undelivered: {hit: {sid: 'arroxy-warmup', h: 'h', p: '/0.7.3/first/a1/ok', r: '', us: '', um: '', uc: '', ut: '', uco: '', ht: '1'}, at: START - 8 * DAY}}})
		await reporter.retryUndelivered()
		expect(hits).toEqual([])
		expect(state().undelivered).toBeUndefined()
	})

	it('sends nothing, and keeps nothing, while reports are turned off', async () => {
		const {reporter, hits, state} = makeReporter({enabled: false, state: {attempt: 0, firstPending: false, undelivered: {hit: {sid: 'arroxy-warmup', h: 'h', p: '/0.7.4/first/a1/ok', r: '', us: '', um: '', uc: '', ut: '', uco: '', ht: '1'}, at: START}}})
		await reporter.retryUndelivered()
		const run = reporter.runStarted()
		run.progress({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0})
		await run.settled(ok(output()))
		expect(hits).toEqual([])
		expect(state().undelivered).toBeUndefined()
	})
})
