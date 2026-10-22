// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {attemptLabel, buildWarmupReportHit, durationBucket, firstFailure, sendWarmupReport, throughputBucket, WARMUP_REPORT_SITE_ID, type WarmupReportContext} from '@main/services/warmupReport.js'
import type {DependencyDiagnostic, DependencyId} from '@shared/types.js'

const CONTEXT: WarmupReportContext = {appVersion: '0.7.4', platform: 'win32', arch: 'x64', osLocale: 'zh-CN'}

function diagnostic(id: DependencyId, overrides: Partial<DependencyDiagnostic> = {}): DependencyDiagnostic {
	return {id, state: 'runnable', source: null, resolvedPath: `/x/${id}`, attempts: [], ...overrides}
}

describe('durationBucket', () => {
	it('puts the elapsed time in coarse buckets whose values carry no spaces or reserved characters', () => {
		expect(durationBucket(0)).toBe('0-10s')
		expect(durationBucket(9_999)).toBe('0-10s')
		expect(durationBucket(10_000)).toBe('10-30s')
		expect(durationBucket(30_000)).toBe('30s-2m')
		expect(durationBucket(120_000)).toBe('2-5m')
		expect(durationBucket(300_000)).toBe('5-15m')
		expect(durationBucket(900_000)).toBe('15m-plus')
	})
})

describe('throughputBucket', () => {
	it('buckets megabits per second', () => {
		// 1 MB in 20 s is 0.4 Mbit/s.
		expect(throughputBucket(1_000_000, 20_000)).toBe('0-0.5mbps')
		expect(throughputBucket(1_000_000, 5_000)).toBe('0.5-2mbps')
		expect(throughputBucket(1_000_000, 4_000)).toBe('2-10mbps')
		expect(throughputBucket(10_000_000, 10_000)).toBe('2-10mbps')
		expect(throughputBucket(40_000_000, 10_000)).toBe('10mbps-plus')
	})

	it('reports nothing measurable as unknown rather than a misleading speed', () => {
		expect(throughputBucket(0, 0)).toBe('unknown')
		expect(throughputBucket(100_000, 50)).toBe('unknown')
	})
})

describe('attemptLabel', () => {
	it('counts attempts as a1, a2 and a3-plus', () => {
		expect(attemptLabel(1)).toBe('a1')
		expect(attemptLabel(2)).toBe('a2')
		expect(attemptLabel(3)).toBe('a3-plus')
		expect(attemptLabel(9)).toBe('a3-plus')
	})
})

describe('firstFailure', () => {
	it('names the first managed download that failed, even when a fallback then worked', () => {
		const ytDlp = diagnostic('yt-dlp', {attempts: [{source: {kind: 'managed', channel: 'default', provider: 'github', url: 'https://example.test/y'}, failure: {kind: 'timeout', message: 'stalled'}}, {source: {kind: 'systemPath', path: '/usr/bin/yt-dlp'}}]})
		expect(firstFailure({'yt-dlp': ytDlp, ffmpeg: diagnostic('ffmpeg'), ffprobe: diagnostic('ffprobe')})).toBe('yt-dlp:timeout')
	})

	it('falls back to a blocking failure with no recorded attempt', () => {
		const ffmpeg = diagnostic('ffmpeg', {state: 'failed', failure: {kind: 'download_failed', message: 'x'}})
		expect(firstFailure({'yt-dlp': diagnostic('yt-dlp'), ffmpeg, ffprobe: diagnostic('ffprobe')})).toBe('ffmpeg:download_failed')
	})

	it('says none when nothing failed', () => {
		expect(firstFailure({'yt-dlp': diagnostic('yt-dlp'), ffmpeg: diagnostic('ffmpeg'), ffprobe: diagnostic('ffprobe')})).toBe('none')
	})
})

describe('buildWarmupReportHit', () => {
	it('maps a started report onto Counterscale fields of its own site, with no identifier', () => {
		expect(buildWarmupReportHit({kind: 'first', stage: 'started', attempt: 1, manifestSource: 'remote'}, CONTEXT)).toEqual({sid: WARMUP_REPORT_SITE_ID, h: 'https://desktop.arroxy', p: '/0.7.4/first/a1/started', r: '', us: 'zh-CN', um: 'win32-x64', uc: 'remote', ut: '', uco: '', ht: '1'})
	})

	it('adds duration, failure and throughput to an outcome', () => {
		expect(buildWarmupReportHit({kind: 'update', stage: 'failed', attempt: 2, manifestSource: 'bundled', elapsedMs: 400_000, failure: 'ffmpeg:timeout', throughput: '0-0.5mbps'}, CONTEXT)).toEqual({
			sid: WARMUP_REPORT_SITE_ID,
			h: 'https://desktop.arroxy',
			p: '/0.7.4/update/a2/failed',
			r: '5-15m',
			us: 'zh-CN',
			um: 'win32-x64',
			uc: 'bundled',
			ut: 'ffmpeg:timeout',
			uco: '0-0.5mbps',
			ht: '1'
		})
	})
})

describe('sendWarmupReport', () => {
	const HIT = buildWarmupReportHit({kind: 'first', stage: 'ok', attempt: 1, manifestSource: 'remote', elapsedMs: 20_000, failure: 'none', throughput: '2-10mbps'}, CONTEXT)

	it('sends one GET to the collector with the hit as its query, and reports delivery', async () => {
		const fetchImpl = vi.fn(async () => new Response('gif', {status: 200}))
		await expect(sendWarmupReport('https://stats.example.test/collect', HIT, {fetchImpl})).resolves.toBe(true)
		expect(fetchImpl).toHaveBeenCalledTimes(1)
		const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
		const sent = new URL(url)
		expect(`${sent.origin}${sent.pathname}`).toBe('https://stats.example.test/collect')
		expect(Object.fromEntries(sent.searchParams)).toEqual(HIT)
		expect(init.method).toBe('GET')
	})

	it('reports a refused or failed request as not delivered, and never throws', async () => {
		await expect(sendWarmupReport('https://stats.example.test/collect', HIT, {fetchImpl: vi.fn(async () => new Response('', {status: 429}))})).resolves.toBe(false)
		await expect(sendWarmupReport('https://stats.example.test/collect', HIT, {fetchImpl: vi.fn(async () => Promise.reject(new Error('ECONNRESET')))})).resolves.toBe(false)
	})

	it('gives up after its timeout', async () => {
		const fetchImpl = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))))
		await expect(sendWarmupReport('https://stats.example.test/collect', HIT, {fetchImpl, timeoutMs: 10})).resolves.toBe(false)
	})
})
