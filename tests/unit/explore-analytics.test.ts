// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import type {YtDlpResult} from '@main/services/YtDlp.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {JobAuth} from '@shared/types.js'

vi.mock('@main/services/analytics', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/analytics.js')>()
	return {...actual, trackMain: vi.fn(() => true)}
})

import {trackMain} from '@main/services/analytics.js'
import {DownloadService} from '@main/services/DownloadService.js'
import {ProbeService} from '@main/services/ProbeService.js'

const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
const AGE_GATE = 'ERROR: [youtube] abc: Sign in to confirm your age. This video may be inappropriate for some users.'
const JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '18', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

function exitError(rawError: string): YtDlpResult {
	return {kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError, stdout: '', stderr: rawError}
}

function eventProps(name: string): Record<string, unknown>[] {
	return vi
		.mocked(trackMain)
		.mock.calls.filter(([event]) => event === name)
		.map(([, props]) => props ?? {})
}

afterEach(() => {
	vi.clearAllMocks()
	vi.useRealTimers()
})

describe('probe_failed carries whether the probe escalated', () => {
	function probeService(results: YtDlpResult[], canEscalate: boolean): ProbeService {
		const run = vi.fn(async () => {
			const next = results.shift()
			if (!next) throw new Error('unexpected yt-dlp run')
			return next
		})
		return new ProbeService({run} as never, false, undefined, {exploreGate: {canEscalate: vi.fn(async () => canEscalate)}})
	}

	it('marks a probe that failed signed in as escalated', async () => {
		await probeService([exitError(AGE_GATE), exitError(AGE_GATE)], true).probe(VIDEO_URL, {cookiesMode: 'explore', playlistMode: 'video'})
		expect(eventProps('probe_failed')).toEqual([expect.objectContaining({cookies_mode: 'explore', escalated: true})])
	})

	it('marks an anonymous probe failure as not escalated', async () => {
		await probeService([exitError(AGE_GATE)], false).probe(VIDEO_URL, {cookiesMode: 'explore', playlistMode: 'video'})
		expect(eventProps('probe_failed')).toEqual([expect.objectContaining({escalated: false})])
	})
})

describe('download events carry whether the job escalated', () => {
	function downloadService(prepare: () => Promise<void>): DownloadService {
		return new DownloadService({prepare} as never, {push: async () => undefined} as never, true)
	}

	it.each<[JobAuth | undefined, boolean]>([
		['exploreSession', true],
		['anonymous', false],
		[undefined, false]
	])('download_started for auth %s → escalated %s', async (auth, escalated) => {
		vi.useFakeTimers()
		const svc = downloadService(async () => undefined)
		const result = await svc.start({url: VIDEO_URL, outputDir: '/tmp', job: JOB, cookiesMode: 'explore', ...(auth ? {auth} : {})})
		expect(eventProps('download_started')).toEqual([expect.objectContaining({cookies_mode: 'explore', escalated})])
		if (result.ok) await svc.cancel(result.data.job.id)
	})

	it.each<[JobAuth | undefined, boolean]>([
		['exploreSession', true],
		[undefined, false]
	])('download_failed for auth %s → escalated %s', async (auth, escalated) => {
		const svc = downloadService(async () => {
			throw new Error('setup broke')
		})
		await svc.start({url: VIDEO_URL, outputDir: '/tmp', job: JOB, ...(auth ? {auth} : {})})
		expect(eventProps('download_failed')).toEqual([expect.objectContaining({escalated})])
	})
})
