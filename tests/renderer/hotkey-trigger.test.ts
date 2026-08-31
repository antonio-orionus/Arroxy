import {describe, expect, it} from 'vitest'
import {intakeHotkeyTrigger, outcomeForProbe, outcomeForProbeError} from '@renderer/store/wizard/hotkeyTrigger.js'
import type {ProbeError, ProbeResult, QueueItem} from '@shared/types.js'

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

	it('reports needs-review for mixed intent', () => {
		expect(run({kind: 'single', url: 'https://www.youtube.com/watch?v=one&list=PL1'})).toEqual({kind: 'outcome', outcome: 'needs-review'})
	})

	it('dedupes against live queue items by cleaned URL', () => {
		const queue = [queueItem({status: 'running'}), queueItem({id: 'q2', status: 'pending', url: 'https://other.example/x'})]
		expect(run({kind: 'single', url: URL}, {queue})).toEqual({kind: 'outcome', outcome: 'already-queued'})
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
		expect(outcomeForProbe(playlist, {kind: 'unknown', url: URL})).toBe('needs-review')
	})

	it('lets obvious collections queue directly', () => {
		const playlist = {kind: 'playlist', entries: []} as unknown as ProbeResult
		expect(outcomeForProbe(playlist, {kind: 'obvious-collection', url: URL, collection: 'playlist'})).toBeNull()
	})
})
