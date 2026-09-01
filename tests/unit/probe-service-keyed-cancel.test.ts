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

type HangingProcess = EventEmitter & {stdout: EventEmitter; stderr: EventEmitter; kill: ReturnType<typeof vi.fn>; spawned: Promise<void>}

function hangingProcess(): HangingProcess {
	const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()}) as HangingProcess
	// Resolved when the probe pipeline attaches its stdout consumer (the point
	// where the probe is fully wired and cancellable) — replaces a fixed sleep
	// that could race cancelProbe ahead of setup under slow scheduling.
	let signalSpawned: () => void = () => {}
	proc.spawned = new Promise<void>(resolve => {
		signalSpawned = resolve
	})
	// YtDlp.run wires `proc.stdout.on('data', …)` after registering its abort
	// listener, so this fires strictly after cancellation becomes observable.
	proc.stdout.once('newListener', (event: string) => {
		if (event === 'data') signalSpawned()
	})
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
		const first = svc.probe('https://a.example/1', {cookiesMode: 'off', playlistMode: 'video', ownerKey: 'item-1'}).then(r => {
			firstSettled = true
			return r
		})
		const second = svc.probe('https://b.example/2', {cookiesMode: 'off', playlistMode: 'video', ownerKey: 'item-2'})
		// Synchronize on both probes reaching the cancellable state (yt-dlp
		// spawned + stdout attached) before cancelling — a fixed delay could
		// race cancelProbe ahead of registration under slow scheduling.
		await firstProc.spawned
		await secondProc.spawned
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

	it('a duplicate ownerKey supersedes the in-flight probe', async () => {
		const firstProc = hangingProcess()
		const secondProc = hangingProcess()
		vi.mocked(spawnYtDlp)
			.mockReturnValueOnce(firstProc as never)
			.mockReturnValueOnce(secondProc as never)
		const svc = new ProbeService(makeYtDlp())

		const first = svc.probe('https://a.example/1', {cookiesMode: 'off', playlistMode: 'video', ownerKey: 'item-1'})
		await firstProc.spawned
		const second = svc.probe('https://b.example/2', {cookiesMode: 'off', playlistMode: 'video', ownerKey: 'item-1'})
		await secondProc.spawned

		// Only the newest probe is reachable through the key: cancelling the
		// owner aborts the replacement, and the superseded probe was already
		// aborted at supersede time — never left running untracked.
		svc.cancelProbe('item-1')
		const secondResult = await second
		expect(secondResult.ok).toBe(false)
		if (!secondResult.ok && secondResult.error.kind === 'other') expect(secondResult.error.code).toBe('cancelled')
		const firstResult = await first
		expect(firstResult.ok).toBe(false)
		if (!firstResult.ok && firstResult.error.kind === 'other') expect(firstResult.error.code).toBe('cancelled')
	})
})
