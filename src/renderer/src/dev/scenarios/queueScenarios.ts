import {QUEUE_STATUS, STATUS_KEY} from '@shared/schemas.js'
import type {QueueItem} from '@shared/types.js'

interface ScenarioLike {
	id: string
}

export function buildQueueItems(scenario: ScenarioLike): QueueItem[] {
	switch (scenario.id) {
		case 'queue-tab-tip':
			return [queueItem({id: 'queue-tab-tip-1', title: 'First queued download - Downloads tab onboarding', status: QUEUE_STATUS.pending, progressPercent: 0, progressDetail: null, lastStatus: null})]
		case 'queue-active':
			return [queueItem({id: 'queue-active-1', status: QUEUE_STATUS.running, progressPercent: 42, progressDetail: 'Downloading 42%', lastJobId: 'mock-active-job'})]
		case 'queue-pending':
			return [
				queueItem({id: 'queue-pending-1', title: 'Pending Download - Longform Interview', status: QUEUE_STATUS.pending, progressPercent: 0, progressDetail: null, lastStatus: null}),
				queueItem({id: 'queue-pending-2', title: 'Pending Download - Field Recording', status: QUEUE_STATUS.pending, progressPercent: 0, progressDetail: null, lastStatus: null})
			]
		case 'queue-mixed-selection':
			return buildMultiQueueItems()
		case 'queue-artifacts':
			return [queueItem({id: 'queue-artifacts-1', status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, finishedAt: '2026-05-31T12:00:00.000Z', artifacts: buildArtifactItems()})]
		case 'queue-errors':
			return [
				queueItem({id: 'queue-errors-1', title: 'Failed Download - Bot Block', status: QUEUE_STATUS.error, progressPercent: 17, progressDetail: null, error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}, finishedAt: '2026-05-31T12:00:00.000Z'}),
				queueItem({id: 'queue-errors-2', title: 'Cancelled Download - User Cancelled', status: QUEUE_STATUS.cancelled, progressPercent: 23, progressDetail: null, finishedAt: '2026-05-31T11:30:00.000Z'})
			]
		case 'queue-columns':
			return [
				queueItem({id: 'queue-columns-1', title: 'Column Fixture - Newest Pending', status: QUEUE_STATUS.pending, addedAt: '2026-05-31T12:00:00.000Z', lastStatus: null}),
				queueItem({id: 'queue-columns-2', title: 'Column Fixture - Finished Yesterday', status: QUEUE_STATUS.done, progressPercent: 100, addedAt: '2026-05-30T09:00:00.000Z', finishedAt: '2026-05-31T09:00:00.000Z'}),
				queueItem({id: 'queue-columns-3', title: 'Column Fixture - Failed Earlier', status: QUEUE_STATUS.error, progressPercent: 12, addedAt: '2026-05-29T08:00:00.000Z', finishedAt: '2026-05-29T09:15:00.000Z', error: {kind: 'network', raw: 'Fixture network failure'}})
			]
		case 'queue-large':
			return buildLargeQueueItems()
		default:
			return []
	}
}

function buildLargeQueueItems(): QueueItem[] {
	return Array.from({length: 5000}, (_, index) => {
		const n = index + 1
		const status = n % 17 === 0 ? QUEUE_STATUS.error : n % 11 === 0 ? QUEUE_STATUS.pausedActive : n % 5 === 0 ? QUEUE_STATUS.done : QUEUE_STATUS.pending
		return queueItem({
			id: `queue-large-${n}`,
			title: `Large Queue Fixture ${n.toString().padStart(4, '0')}`,
			status,
			progressPercent: status === QUEUE_STATUS.done ? 100 : status === QUEUE_STATUS.pending ? 0 : (n * 7) % 100,
			progressDetail: status === QUEUE_STATUS.pending || status === QUEUE_STATUS.done ? null : `Waiting in large queue ${n}`,
			lastStatus: null,
			addedAt: new Date(Date.UTC(2026, 5, 19, 10, 0, index)).toISOString(),
			finishedAt: status === QUEUE_STATUS.done || status === QUEUE_STATUS.error ? new Date(Date.UTC(2026, 5, 19, 11, 0, index)).toISOString() : null,
			error: status === QUEUE_STATUS.error ? {kind: 'network', raw: 'Large queue fixture failure'} : null,
			artifacts: status === QUEUE_STATUS.done ? [artifact({id: `ql-media-${n}`, kind: 'media', path: `/home/user/Downloads/large-queue-${n}.webm`, fileName: `large-queue-${n}.webm`, sizeBytes: 24_000_000 + n})] : [],
			...(status === QUEUE_STATUS.pausedActive ? {lastJobId: `large-job-${n}`, tempDir: `/tmp/arroxy-large-${n}`} : {})
		})
	})
}

function buildMultiQueueItems(): QueueItem[] {
	return [
		queueItem({id: 'mq-1', title: 'Running Download - Lo-fi Hip Hop Radio', status: QUEUE_STATUS.running, progressPercent: 61, progressDetail: 'Downloading 61%', lastJobId: 'mock-running-job'}),
		queueItem({id: 'mq-2', title: 'Pending Item - Waiting in Queue', status: QUEUE_STATUS.pending, progressPercent: 0, progressDetail: null, lastStatus: null}),
		queueItem({id: 'mq-3', title: 'Paused Held - Never Started', status: QUEUE_STATUS.pausedHeld, progressPercent: 0, progressDetail: null}),
		queueItem({id: 'mq-4', title: 'Completed Download - Archive Recording', status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, finishedAt: '2026-05-31T11:00:00.000Z'}),
		queueItem({id: 'mq-5', title: 'Failed Download - Bot Block', status: QUEUE_STATUS.error, progressPercent: 12, progressDetail: null, error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}, finishedAt: '2026-05-31T10:30:00.000Z'}),
		queueItem({id: 'mq-6', title: 'Cancelled Item - User Cancelled', status: QUEUE_STATUS.cancelled, progressPercent: 45, progressDetail: null, finishedAt: '2026-05-31T10:00:00.000Z'})
	]
}

function buildArtifactItems(): QueueItem['artifacts'] {
	return [
		artifact({id: 'qa-media', kind: 'media', path: '/home/user/Downloads/scenario-video.mkv', fileName: 'scenario-video.mkv', sizeBytes: 143_250_432}),
		artifact({id: 'qa-subtitle', kind: 'subtitle', path: '/home/user/Downloads/scenario-video.en.vtt', fileName: 'scenario-video.en.vtt', sizeBytes: 18_204}),
		artifact({id: 'qa-probe-info', kind: 'unknown', path: '/tmp/arroxy/probe/scenario.info.json', fileName: 'scenario.info.json', internal: true})
	]
}

function artifact(overrides: Omit<QueueItem['artifacts'][number], 'discoveredAt'> & {discoveredAt?: string}): QueueItem['artifacts'][number] {
	return {discoveredAt: '2026-05-31T12:00:00.000Z', ...overrides}
}

function queueItem(overrides: Partial<QueueItem> & {id?: string}): QueueItem {
	return {
		id: overrides.id ?? 'scenario-queue-item',
		url: 'https://www.youtube.com/watch?v=scenario',
		title: 'Scenario Queue Item - visual regression fixture',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg',
		outputDir: '/home/user/Downloads',
		formatLabel: '1080p | mp4 | 30fps',
		status: QUEUE_STATUS.pending,
		lane: 'normal',
		progressPercent: 0,
		progressDetail: null,
		lastStatus: {key: STATUS_KEY.startingYtdlp},
		error: null,
		addedAt: '2026-05-31T10:00:00.000Z',
		artifacts: [],
		finishedAt: null,
		writeM3u: true,
		job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}},
		...overrides
	}
}
