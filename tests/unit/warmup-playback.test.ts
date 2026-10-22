import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {playSetupScript, simulateFirstLaunchDownloads} from '@renderer/dev/warmupPlayback.js'
import {buildSetupScript, SETUP_SCENARIOS} from '@renderer/dev/scenarios/setupScenarios.js'
import {EMPTY_WARMUP_DOWNLOADS, estimateSecondsLeft, summarizeSetup, trackWarmupDownloads} from '@renderer/store/warmupDownloads.js'
import type {DependencyId, WarmupProgressEvent} from '@shared/types.js'

describe('dev-mock warmup playback', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('plays a setup scenario script and reports that it did', async () => {
		const events: WarmupProgressEvent[] = []
		const played = playSetupScript({id: 'setup-new-both-minutes'}, event => events.push(event))
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

// Each Setup scenario must end on the moment its id names, or the matrix
// shows a different screen than the one it claims to.
describe('setup scenario matrix', () => {
	const STAGE_OF = {connecting: 'connecting', started: 'downloading', minutes: 'downloading', 'under-minute': 'downloading', unpacking: 'unpacking', checking: 'checking'} as const

	it.each(SETUP_SCENARIOS.map(scenario => [scenario.id, scenario] as const))('%s ends on its moment', (_id, scenario) => {
		const script = buildSetupScript(scenario) ?? []
		let progress: Partial<Record<DependencyId, WarmupProgressEvent>> = {}
		let downloads = EMPTY_WARMUP_DOWNLOADS
		let at = 0
		for (const step of script) {
			at += step.delayMs
			progress = {...progress, [step.event.binary]: step.event}
			downloads = trackWarmupDownloads(downloads, progress, at)
		}
		const setup = summarizeSetup(downloads.ledger, progress)

		expect(setup?.stage).toBe(STAGE_OF[scenario.moment])
		expect(setup?.groups).toEqual(scenario.tools === 'both' ? ['engine', 'media'] : [scenario.tools])
		const secondsLeft = setup ? estimateSecondsLeft(downloads.samples, setup.total - setup.downloaded) : null
		if (scenario.moment === 'started') expect(secondsLeft).toBeNull()
		if (scenario.moment === 'minutes') expect(secondsLeft).toBeGreaterThanOrEqual(60)
		if (scenario.moment === 'under-minute') expect(secondsLeft).toBeLessThan(60)
	})
})
