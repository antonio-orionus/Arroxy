// @vitest-environment node

import {EventEmitter} from 'node:events'
import {describe, expect, it, vi} from 'vitest'

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

vi.mock('@main/services/ytDlpJsRuntime', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/ytDlpJsRuntime.js')>()
	return {...actual, probeElectronNodeRuntime: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'
import {probeElectronNodeRuntime} from '@main/services/ytDlpJsRuntime.js'
import {ProbeService} from '@main/services/ProbeService.js'
import {YtDlp} from '@main/services/YtDlp.js'

function hangingProcess(): EventEmitter & {stdout: EventEmitter; stderr: EventEmitter; kill: ReturnType<typeof vi.fn>} {
	const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
	return proc
}

function makeYtDlp(): YtDlp {
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: 't', visitorData: 'vd'}), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {}, single: {}, playlist: {}})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
}

vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: '/mock/Arroxy', version: '24.16.0'}, output: 'v24.16.0'})

const VIDEO_JSON = JSON.stringify({_type: 'video', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=x', id: 'x', title: 't', formats: [{format_id: '18', ext: 'mp4', url: 'http://media/x.mp4', protocol: 'https'}]})

describe('ProbeService — keyed probe cancellation', () => {
	it('cancelProbe aborts only the keyed probe', async () => {
		const firstProc = hangingProcess()
		const secondProc = hangingProcess()
		vi.mocked(spawnYtDlp)
			.mockReturnValueOnce(firstProc as never)
			.mockReturnValueOnce(secondProc as never)
		const svc = new ProbeService(makeYtDlp())

		let firstSettled = false
		const first = svc.probe('https://a.example/1', 'off', 'video', undefined, 'item-1').then(r => {
			firstSettled = true
			return r
		})
		const second = svc.probe('https://b.example/2', 'off', 'video', undefined, 'item-2')
		await new Promise(resolve => setTimeout(resolve, 10))
		expect(firstSettled).toBe(false)

		svc.cancelProbe('item-1')
		const firstResult = await first
		expect(firstResult.ok).toBe(false)
		if (!firstResult.ok && firstResult.error.kind === 'other') expect(firstResult.error.code).toBe('cancelled')
		expect(firstSettled).toBe(true)

		// The second probe is untouched: release it with a valid payload and
		// expect a real probe result, not a cancellation.
		secondProc.stdout.emit('data', Buffer.from(VIDEO_JSON))
		secondProc.emit('close', 0)
		const secondResult = await second
		if (!secondResult.ok) console.log('SECOND FAILED:', JSON.stringify(secondResult.error))
		expect(secondResult.ok).toBe(true)
	})

	it('cancelProbe is safe to call for an unknown owner', () => {
		const svc = new ProbeService(makeYtDlp())
		expect(() => svc.cancelProbe('nope')).not.toThrow()
	})
})
