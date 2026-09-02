import {describe, expect, it, vi} from 'vitest'
import {handleHotkeyTrigger, intakeHotkeyTrigger, outcomeForProbe, outcomeForProbeError} from '@renderer/store/wizard/hotkeyTrigger.js'
import type {ProbeError, ProbeResult, QueueItem} from '@shared/types.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

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

function run(trigger: Parameters<typeof intakeHotkeyTrigger>[0], overrides: {preparing?: boolean; queue?: QueueItem[]} = {}) {
	return intakeHotkeyTrigger(trigger, {quickDownloadStatus: overrides.preparing ? 'preparing' : 'idle', queue: overrides.queue ?? []})
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

	it('is busy while a quick download is preparing', () => {
		expect(run({kind: 'single', url: URL}, {preparing: true})).toEqual({kind: 'outcome', outcome: 'busy'})
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

	it('dedupes against live queue items by cleaned URL', () => {
		const queue = [queueItem({status: 'running'}), queueItem({id: 'q2', status: 'pending', url: 'https://other.example/x'})]
		expect(run({kind: 'single', url: URL}, {queue})).toEqual({kind: 'outcome', outcome: 'already-queued'})
	})

	it('treats a probing placeholder as live: same URL is already-queued, not busy', () => {
		const queue = [queueItem({status: 'probing', job: {kind: 'unresolved', extractor: '', extractorKey: ''}})]
		expect(run({kind: 'single', url: URL}, {queue})).toEqual({kind: 'outcome', outcome: 'already-queued'})
	})

	it('lets a different URL run while another hotkey probe is in flight', () => {
		const queue = [queueItem({status: 'probing', url: 'https://other.example/in-flight', job: {kind: 'unresolved', extractor: '', extractorKey: ''}})]
		expect(run({kind: 'single', url: URL}, {queue})).toMatchObject({kind: 'run', url: URL})
	})

	it('ignores youtu.be/watch URL-shape differences only via cleanUrl, not canonical IDs (known v1 limitation)', () => {
		const queue = [queueItem({status: 'paused-active', url: 'https://youtu.be/one'})]
		expect(run({kind: 'single', url: 'https://www.youtube.com/watch?v=one'}, {queue})).toMatchObject({kind: 'run'})
	})

	it('does not dedupe against done, error, or cancelled items', () => {
		const statuses = ['done', 'error', 'cancelled'] as const
		for (const status of statuses) {
			expect(run({kind: 'single', url: URL}, {queue: [queueItem({status})]})).toMatchObject({kind: 'run'})
		}
	})
})

describe('probe outcome mapping', () => {
	it('maps cookies-config probe failures to needs-review', () => {
		const error: ProbeError = {kind: 'other', code: 'cookies_config', message: 'needs cookies'}
		expect(outcomeForProbeError(error)).toBe('needs-review')
	})

	it('maps other probe failures to submission-failed', () => {
		const error: ProbeError = {kind: 'other', code: 'invalid_url', message: 'bad url'}
		expect(outcomeForProbeError(error)).toBe('submission-failed')
	})

	it('sends non-obvious playlist probes to review instead of silently queueing', () => {
		const playlist = {kind: 'playlist', entries: []} as unknown as ProbeResult
		expect(outcomeForProbe(playlist)).toBe('needs-review')
	})

	it('keeps obvious collections out of the noninteractive queue path too', () => {
		const playlist = {kind: 'playlist', entries: []} as unknown as ProbeResult
		expect(outcomeForProbe(playlist)).toBe('needs-review')
	})
})

describe('handleHotkeyTrigger', () => {
	it('does not write quick-download or wizard state when the probe-stage swap fails', async () => {
		const api = buildMockAppApi()
		api.queue.cmd.add = vi.fn(async (items: QueueItem[]) => {
			useAppStore.setState({queue: items})
			return ok({ids: items.map(item => item.id)})
		})
		api.queue.cmd.replaceProbing = vi.fn().mockResolvedValue(fail({code: 'validation', message: 'placeholder cancelled', recoverable: true}))
		Object.defineProperty(globalThis, 'window', {configurable: true, value: {appApi: api}})
		useAppStore.setState({settings: defaultAppSettings('/tmp'), queue: [], quickDownloadStatus: 'idle', quickDownloadFailure: null, quickPlaylistCapDialogOpen: false, wizardOutputDir: '/tmp'})

		await handleHotkeyTrigger({kind: 'single', url: URL}, useAppStore.getState)

		expect(useAppStore.getState()).toMatchObject({quickDownloadStatus: 'idle', quickDownloadFailure: null, quickPlaylistCapDialogOpen: false})
		expect(api.queue.cmd.replaceProbing).toHaveBeenCalledOnce()
	})
})
