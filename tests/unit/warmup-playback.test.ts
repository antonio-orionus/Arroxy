import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {playSetupScript, simulateFirstLaunchDownloads} from '@renderer/dev/warmupPlayback.js'
import type {WarmupProgressEvent} from '@shared/types.js'

describe('dev-mock warmup playback', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('plays a setup scenario script and reports that it did', async () => {
		const events: WarmupProgressEvent[] = []
		const played = playSetupScript({id: 'setup-first-run'}, event => events.push(event))
		await vi.runAllTimersAsync()

		await expect(played).resolves.toBe(true)
		expect(events.some(event => event.binary === 'yt-dlp' && event.phase === 'downloading')).toBe(true)
		expect(events.some(event => event.binary === 'ffmpeg' && event.phase === 'downloading')).toBe(true)
	})

	it('leaves other scenarios to the ordinary warmup', async () => {
		const events: WarmupProgressEvent[] = []

		await expect(playSetupScript({id: 'default'}, event => events.push(event))).resolves.toBe(false)
		expect(events).toEqual([])
	})

	// The package carries ffprobe too, so only the ffmpeg row reports bytes.
	it('simulates a first launch with one package download for the media tools', async () => {
		const events: WarmupProgressEvent[] = []
		const done = simulateFirstLaunchDownloads(event => events.push(event))
		await vi.runAllTimersAsync()
		await done

		expect(events.filter(event => event.phase === 'downloading' && event.binary === 'ffprobe')).toEqual([])
		expect(events.filter(event => event.phase === 'done').map(event => event.binary)).toEqual(['yt-dlp', 'ffmpeg', 'ffprobe'])
		expect(events.find(event => event.binary === 'ffmpeg' && event.phase === 'extracting')).toBeDefined()
	})
})
