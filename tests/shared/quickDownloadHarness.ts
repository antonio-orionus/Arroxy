// The quick-download pipeline's test harness: fixture probe results, and the
// queue as main keeps it, projected straight into the store. Queue commands
// apply through the real state machine, and the probe-stage swap through
// main's own probe lifecycle, so admission rules are the real ones.

import {vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {illegalTransition, transition, type QueueEvent} from '@shared/queueTransition.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {AppApi} from '@shared/api.js'
import type {AppSettings, PlaylistEntry, ProbeError, ProbeInput, ProbeResult, QueueItem} from '@shared/types.js'
import type {IntakeOrigin} from '@shared/intake/intakeSchemas.js'
import {QueueProbeLifecycle} from '@main/services/download/QueueProbeLifecycle.js'
import {IntakeService} from '@main/intake/IntakeService.js'
import {admitAgainstLive} from '@shared/queueActions.js'
import {routeIntakeEvent} from '@renderer/store/quickDownload/quickDownloadPipeline.js'
import {quickDownloadToasts} from '@renderer/store/quickDownload/quickDownloadToasts.js'
import {defaultAppSettings} from '@shared/constants.js'

export const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
export const OTHER_URL = 'https://www.youtube.com/watch?v=def'
export const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'

export const VIDEO: ProbeResult = {
	kind: 'video',
	videoId: 'abc',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	webpageUrl: VIDEO_URL,
	isAudioOnlySource: false,
	formats: [{formatId: '22', label: '720p | mp4', ext: 'mp4', resolution: '720p', fps: 30, isVideoOnly: false, isAudioOnly: false}],
	title: 'Fixture Video',
	thumbnail: '',
	subtitles: {},
	automaticCaptions: {},
	isLive: false,
	hasDrm: false
} as unknown as ProbeResult

export function entries(count: number): PlaylistEntry[] {
	return Array.from({length: count}, (_, index) => ({id: `e${index + 1}`, title: `Entry ${index + 1}`, url: `https://youtu.be/v${index + 1}`, thumbnail: '', duration: 60, playlistIndex: index + 1, videoId: `v${index + 1}`}))
}

export function playlist(count: number): ProbeResult {
	return {kind: 'playlist', extractor: 'youtube:tab', extractorKey: 'YoutubeTab', webpageUrl: PLAYLIST_URL, isAudioOnlySource: false, playlistTitle: 'Road trip mix', playlistId: 'PLtest', isMultiVideo: false, entries: entries(count)}
}

export const BOT_BLOCK = {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'Sign in to confirm you are not a bot'}} satisfies ProbeError

export function queue(): QueueItem[] {
	return useAppStore.getState().queue
}

export function row(id: string): QueueItem | undefined {
	return queue().find(item => item.id === id)
}

function applyEvent(itemId: string, evt: QueueEvent): Result<void> {
	const item = row(itemId)
	if (!item || illegalTransition(item, evt)) return fail({code: 'validation', message: `${evt.kind} is stale`, recoverable: true})
	useAppStore.setState({queue: queue().map(candidate => (candidate.id === itemId ? transition(candidate, evt) : candidate))})
	return ok(undefined)
}

function addToQueue(items: QueueItem[]): Result<{ids: string[]; skippedAlreadyQueued: number}> {
	const admission = admitAgainstLive(items, queue())
	if (!admission.ok) return fail({code: 'conflict' as const, message: 'already active', recoverable: true})
	useAppStore.setState({queue: [...queue(), ...admission.admitted]})
	return ok({ids: admission.admitted.map(item => item.id), skippedAlreadyQueued: admission.skippedAlreadyQueued})
}

export interface ArmQueueOptions {
	// Main's settings, when they should differ from the window's (a save still
	// in flight); by default main reads the store's.
	mainSettings?: () => AppSettings
	// The intake admission limit main's queue applies to a probe-stage swap.
	rowsPerIntake?: (origin: IntakeOrigin) => number | null
}

// The queue as main keeps it, projected straight into the store, and main's
// own IntakeService on it: the window's intake calls reach it as over IPC, and
// its outcomes come back through the window's own routing.
export function armQueue(api: AppApi, options: ArmQueueOptions = {}): IntakeService {
	api.queue.cmd.add = vi.fn((items: QueueItem[]) => Promise.resolve(addToQueue(items)))
	// The swap runs through main's own probe lifecycle, so placeholder checks
	// and duplicate admission are the real rules, not a permissive stand-in.
	const lifecycle = new QueueProbeLifecycle({
		items: queue,
		patch: () => undefined,
		commitEvent: () => undefined,
		abortProbe: () => undefined,
		commitRemove: itemId => useAppStore.setState({queue: queue().filter(item => item.id !== itemId)}),
		commitAdd: items => useAppStore.setState({queue: [...queue(), ...items]}),
		rowsPerIntake: options.rowsPerIntake ?? (() => null)
	})
	api.queue.cmd.replaceProbing = vi.fn(({itemId, items}: {itemId: string; items: QueueItem[]}) => Promise.resolve(lifecycle.replaceProbing(itemId, items)))
	const drop = vi.fn(({itemId}: {itemId: string | null}) => {
		useAppStore.setState({queue: queue().filter(item => item.id !== itemId)})
		return Promise.resolve(ok(undefined))
	})
	api.queue.cmd.cancel = drop
	api.queue.cmd.remove = drop
	const intake = new IntakeService({
		queue: {
			snapshot: queue,
			add: addToQueue,
			// Through the IPC mock, so a test can read the swaps main made.
			replaceProbing: (itemId, items) => api.queue.cmd.replaceProbing({itemId, items}),
			needsChoice: (itemId, choice, title) => applyEvent(itemId, {kind: 'needs-choice', choice, title}),
			probeFailed: (itemId, error, auth) => applyEvent(itemId, {kind: 'probe-failed', error, ...(auth ? {auth} : {})}),
			reprobe: itemId => {
				const item = row(itemId)
				if (item?.status !== 'needs-choice' && !(item?.status === 'error' && item.job.kind === 'unresolved')) return fail({code: 'validation', message: `queue item ${itemId} has no probe to restart`, recoverable: true})
				return applyEvent(itemId, {kind: 'probe-restarted'})
			}
		},
		probe: ({url, playlistMode, ownerKey, playlistScope}) => api.downloads.probe({url, playlistMode, ownerKey, ...(playlistScope ? {playlistScope} : {})}),
		registerManifest: async manifest => {
			await api.playlist.registerManifest(manifest)
		},
		settings: () => Promise.resolve(options.mainSettings?.() ?? useAppStore.getState().settings ?? defaultAppSettings('/tmp')),
		text: key => key,
		emit: event => routeIntakeEvent(event, () => quickDownloadToasts('downloads', useAppStore.getState)),
		platform: 'linux',
		newId: () => crypto.randomUUID()
	})
	api.intake.add = vi.fn(async input => ok(await intake.add({...input, origin: {kind: 'window'}})))
	api.intake.retry = vi.fn(input => Promise.resolve(intake.retry({...input, origin: 'window'})))
	api.intake.choose = vi.fn(input => Promise.resolve(intake.choose({...input, origin: 'window'})))
	api.intake.keptProbe = vi.fn(({itemId}: {itemId: string}) => Promise.resolve(ok(intake.keptProbe(itemId))))
	api.intake.setWindowContext = vi.fn(context => {
		intake.setWindowContext(context)
		return Promise.resolve(ok(undefined))
	})
	return intake
}

export interface DeferredProbe {
	resolve: (result: Result<ProbeResult, ProbeError>) => void
	calls: ProbeInput[]
}

// A probe that answers only when the test says so.
export function deferredProbe(api: AppApi): DeferredProbe {
	const pending: ((result: Result<ProbeResult, ProbeError>) => void)[] = []
	const calls: ProbeInput[] = []
	api.downloads.probe = vi.fn((input: ProbeInput) => {
		calls.push(input)
		return new Promise<Result<ProbeResult, ProbeError>>(resolve => pending.push(resolve))
	})
	return {resolve: result => pending.shift()?.(result), calls}
}
