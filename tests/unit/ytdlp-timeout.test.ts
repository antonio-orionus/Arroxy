import {describe, expect, it, vi, beforeEach} from 'vitest'
import {YtDlp, type YtDlpRequest} from '@main/services/YtDlp.js'
import {createHangingProcess} from '../helpers/processTranscript.js'

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'

const URL = 'https://www.bilibili.com/video/BV1bK411W797?p=1'

function makeYtDlp() {
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: 'tok', visitorData: 'vd', fromCache: false}), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null), forgetProbeVerdict: vi.fn().mockResolvedValue(undefined)}
	const settingsStore = {get: vi.fn().mockResolvedValue({})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
}

function probeRequest(): YtDlpRequest {
	return {kind: 'probe', url: URL, selection: {playlistMode: 'video'}}
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('YtDlp — probe timeout override', () => {
	it('kills a hung probe after the caller-supplied timeoutMs', async () => {
		const proc = createHangingProcess()
		vi.mocked(spawnYtDlp).mockReturnValue(proc as never)

		const result = await makeYtDlp().run(probeRequest(), {timeoutMs: 50})

		expect(proc.kill).toHaveBeenCalledWith('SIGKILL')
		expect(result.kind).toBe('exit-error')
		if (result.kind === 'exit-error') {
			expect(result.exitCode).toBe(-1)
			expect(result.rawError).toBe('Probe timed out')
		}
	})
})
