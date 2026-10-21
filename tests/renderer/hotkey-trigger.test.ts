import {describe, expect, it, vi} from 'vite-plus/test'
import {handleHotkeyTrigger, intakeHotkeyTrigger, outcomeForProbeError} from '@renderer/store/wizard/hotkeyTrigger.js'
import type {ProbeError, QueueItem} from '@shared/types.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {armQueue} from '../shared/quickDownloadHarness.js'

const URL = 'https://www.youtube.com/watch?v=one'

function queueItem(overrides: Partial<QueueItem> = {}): QueueItem {
	return {
		id: 'q1',
		url: URL,
		title: 't',
		thumbnail: '',
		outputDir: '/tmp',
		formatLabel: 'best',
		status: 'pending',
		lane: 'normal',
		progressPercent: 0,
		progressDetail: null,
		lastStatus: null,
		error: null,
		addedAt: null,
		finishedAt: null,
		writeM3u: true,
		retryCount: 0,
		artifacts: [],
		job: {mode: 'single'} as unknown as QueueItem['job'],
		...overrides
	}
}

function run(trigger: Parameters<typeof intakeHotkeyTrigger>[0]) {
	return intakeHotkeyTrigger(trigger)
}

// A press placed through the real pipeline (main's intake), against a given live queue.
async function press(url: string, queue: QueueItem[]) {
	const api = buildMockAppApi()
	armQueue(api)
	Object.defineProperty(globalThis, 'window', {configurable: true, value: {appApi: api}})
	useAppStore.setState({settings: defaultAppSettings('/tmp'), queue, wizardOutputDir: '/tmp'})
	await handleHotkeyTrigger({kind: 'single', url}, useAppStore.getState)
	return api
}

describe('intakeHotkeyTrigger', () => {
	it('runs a single URL with video probe mode', () => {
		expect(run({kind: 'single', url: URL})).toMatchObject({kind: 'run', url: URL})
	})

	it('runs an unknown-site URL in auto mode instead of refusing it', () => {
		const intake = run({kind: 'single', url: 'https://www.tiktok.com/@user/video/123'})
		expect(intake).toMatchObject({kind: 'run', playlistMode: 'auto'})
	})

	it('runs an obvious collection URL with playlist probe mode', () => {
		const intake = run({kind: 'single', url: 'https://www.youtube.com/playlist?list=PL123'})
		expect(intake).toMatchObject({kind: 'run', playlistMode: 'playlist'})
	})

	it('reports invalid clipboard for empty and multiple payloads', () => {
		expect(run({kind: 'empty'})).toEqual({kind: 'outcome', outcome: 'invalid-clipboard'})
		expect(run({kind: 'multiple'})).toEqual({kind: 'outcome', outcome: 'multiple-urls'})
	})

	it('reports invalid clipboard for a non-URL string', () => {
		expect(run({kind: 'single', url: 'not a url at all'})).toEqual({kind: 'outcome', outcome: 'invalid-clipboard'})
	})

	// The hotkey has no way to ask. `v=` is guaranteed present and correct on a
	// mixed URL, and one unwanted video is a far cheaper mistake than one
	// unwanted 200-item playlist — so the press downloads the video it names.
	it('downloads the video for mixed intent instead of bouncing to review', () => {
		expect(run({kind: 'single', url: 'https://www.youtube.com/watch?v=one&list=PL1'})).toMatchObject({kind: 'run', playlistMode: 'video'})
	})

	it('runs a radio URL as a plain video', () => {
		expect(run({kind: 'single', url: 'https://www.youtube.com/watch?v=one&list=RDone&start_radio=1'})).toMatchObject({kind: 'run', playlistMode: 'video'})
	})
})

// Dedupe lives in the shared pipeline; the hotkey hears it as already-queued.
describe('a press on a link already live in the queue', () => {
	it('dedupes against live queue items by cleaned URL', async () => {
		const api = await press(URL, [queueItem({status: 'running'}), queueItem({id: 'q2', status: 'pending', url: 'https://other.example/x'})])
		expect(api.hotkey.reportOutcome).toHaveBeenCalledWith({outcome: 'already-queued', url: URL})
		expect(useAppStore.getState().queue.map(item => item.id)).toEqual(['q1', 'q2'])
	})

	it('treats a probing placeholder as live: same URL is already-queued, not busy', async () => {
		const api = await press(URL, [queueItem({status: 'probing', job: {kind: 'unresolved', extractor: '', extractorKey: ''}})])
		expect(api.hotkey.reportOutcome).toHaveBeenCalledWith({outcome: 'already-queued', url: URL})
	})

	it('lets a different URL run while another hotkey probe is in flight', async () => {
		const api = await press(URL, [queueItem({status: 'probing', url: 'https://other.example/in-flight', job: {kind: 'unresolved', extractor: '', extractorKey: ''}})])
		expect(api.hotkey.reportOutcome).toHaveBeenCalledWith({outcome: 'queued', url: URL})
	})

	it('ignores youtu.be/watch URL-shape differences only via cleanUrl, not canonical IDs (known v1 limitation)', async () => {
		const api = await press('https://www.youtube.com/watch?v=one', [queueItem({status: 'paused-active', url: 'https://youtu.be/one'})])
		expect(api.hotkey.reportOutcome).toHaveBeenCalledWith({outcome: 'queued', url: 'https://www.youtube.com/watch?v=one'})
	})

	it('does not dedupe against done, error, or cancelled items', async () => {
		for (const status of ['done', 'error', 'cancelled'] as const) {
			const api = await press(URL, [queueItem({status, ...(status === 'error' ? {error: {kind: 'network', raw: 'x'}} : {})})])
			expect(api.hotkey.reportOutcome).toHaveBeenCalledWith({outcome: 'queued', url: URL})
		}
	})
})

describe('probe outcome mapping', () => {
	it('maps cookies-config probe failures to their own outcome', () => {
		const error: ProbeError = {kind: 'other', code: 'cookies_config', message: 'needs cookies'}
		expect(outcomeForProbeError(error)).toBe('cookies-setup')
	})

	it('maps other probe failures, and failures to prepare the rows, to submission-failed', () => {
		const error: ProbeError = {kind: 'other', code: 'invalid_url', message: 'bad url'}
		expect(outcomeForProbeError(error)).toBe('submission-failed')
		expect(outcomeForProbeError(null)).toBe('submission-failed')
	})
})

describe('handleHotkeyTrigger', () => {
	it('is busy before the renderer has its settings', async () => {
		const api = buildMockAppApi()
		Object.defineProperty(globalThis, 'window', {configurable: true, value: {appApi: api}})
		useAppStore.setState({settings: null})
		await handleHotkeyTrigger({kind: 'single', url: URL}, useAppStore.getState)
		expect(api.hotkey.reportOutcome).toHaveBeenCalledWith({outcome: 'busy', url: URL})
	})

	it('does not write quick-download or wizard state when the probe-stage swap fails', async () => {
		const api = buildMockAppApi()
		armQueue(api)
		api.queue.cmd.replaceProbing = vi.fn().mockResolvedValue(fail({code: 'validation', message: 'placeholder cancelled', recoverable: true}))
		Object.defineProperty(globalThis, 'window', {configurable: true, value: {appApi: api}})
		useAppStore.setState({settings: defaultAppSettings('/tmp'), queue: [], quickDownloadStatus: 'idle', quickDownloadFailure: null, quickPlaylistCapDialogOpen: false, wizardOutputDir: '/tmp'})

		await handleHotkeyTrigger({kind: 'single', url: URL}, useAppStore.getState)

		await vi.waitFor(() => expect(api.queue.cmd.replaceProbing).toHaveBeenCalledOnce())
		expect(useAppStore.getState()).toMatchObject({quickDownloadStatus: 'idle', quickDownloadFailure: null, quickPlaylistCapDialogOpen: false, wizardUrl: ''})
	})
})
