// @vitest-environment node
import {describe, expect, it, vi} from 'vitest'
import {ProbeService} from '@main/services/ProbeService.js'
import type {YtDlpResult, YtDlpSignal} from '@main/services/YtDlp.js'

const TIMEOUT_RESULT: YtDlpResult = {kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Probe timed out', stdout: '', stderr: ''}
const BLOCKED_RESULT: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError: 'ERROR: [BiliBili] BV1: Unable to download webpage: HTTP Error 412', stdout: '', stderr: 'ERROR'}

function videoStdout(url: string): YtDlpResult {
	return {kind: 'success', stdout: JSON.stringify({_type: 'video', id: 'BV1_p1', title: 'Part 1', extractor: 'bilibili', extractor_key: 'BiliBili', webpage_url: url, formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a'}]}), stderr: '', usedExtractorFallback: false}
}

function makeService(run: ReturnType<typeof vi.fn>): {service: ProbeService; run: ReturnType<typeof vi.fn>} {
	return {service: new ProbeService({run} as never), run}
}

describe('ProbeService — retry on probe timeout', () => {
	it('retries once when the first attempt times out, then returns the retry result', async () => {
		const url = 'https://www.bilibili.com/video/BV1bK411W797?p=1'
		const run = vi.fn().mockResolvedValueOnce(TIMEOUT_RESULT).mockResolvedValueOnce(videoStdout(url))
		const {service} = makeService(run)

		const result = await service.probe(url, {playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(2)
		expect(result.ok).toBe(true)
		if (result.ok && result.data.kind === 'video') expect(result.data.title).toBe('Part 1')
	})

	it('gives up after the retry also times out (exactly two attempts)', async () => {
		const run = vi.fn().mockResolvedValue(TIMEOUT_RESULT)
		const {service} = makeService(run)

		const result = await service.probe('https://www.bilibili.com/video/BV1?p=1', {playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(2)
		expect(result.ok).toBe(false)
	})

	it('does not retry non-timeout failures', async () => {
		const run = vi.fn().mockResolvedValue(BLOCKED_RESULT)
		const {service} = makeService(run)

		const result = await service.probe('https://www.bilibili.com/video/BV1', {playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(1)
		expect(result.ok).toBe(false)
	})
})

describe('ProbeService — probe timeout override', () => {
	it('forwards timeoutMs to the yt-dlp run signal', async () => {
		const url = 'https://www.bilibili.com/video/BV1bK411W797?p=1'
		const run = vi.fn().mockResolvedValue(videoStdout(url))
		const {service} = makeService(run)

		await service.probe(url, {playlistMode: 'video', timeoutMs: 180_000})

		expect(run).toHaveBeenCalledTimes(1)
		const signal = run.mock.calls[0]?.[1] as YtDlpSignal | undefined
		expect(signal?.timeoutMs).toBe(180_000)
	})

	it('leaves the signal timeout unset when no override is given (YtDlp default applies)', async () => {
		const url = 'https://www.bilibili.com/video/BV1bK411W797?p=1'
		const run = vi.fn().mockResolvedValue(videoStdout(url))
		const {service} = makeService(run)

		await service.probe(url, {playlistMode: 'video'})

		const signal = run.mock.calls[0]?.[1] as YtDlpSignal | undefined
		expect(signal?.timeoutMs).toBeUndefined()
	})
})
