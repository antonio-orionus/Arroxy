// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {parseControlRequest, type ControlMethod} from 'arroxy-control'
import {createControlService} from '@main/control/createControlService.js'
import {controlRowsPerIntake} from '@main/control/intakeAdmission.js'
import type {ControlFeed, ControlSink} from '@main/control/controlTypes.js'
import {ControlOutcomes} from '@main/intake/ControlOutcomes.js'
import {IntakeService} from '@main/intake/IntakeService.js'
import {QueueService} from '@main/services/QueueService.js'
import {SiteRequestState} from '@main/services/SiteRequestState.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok, type Result} from '@shared/result.js'
import type {ProbeError, ProbeResult} from '@shared/types.js'

vi.mock('electron-log/main.js', () => {
	const logger = {debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}
	return {default: {...logger, scope: () => logger}}
})

// The Control API's composition: the real queue, intake and registry, wired
// so a client's link moves from links.add to a queued intake it can wait on.

const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
const VIDEO = {kind: 'video', videoId: 'abc', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: VIDEO_URL, isAudioOnlySource: false, formats: [], title: 'Fixture Video', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false} as unknown as ProbeResult
const SINK: ControlSink = {write: () => true, onDrain: () => () => undefined}

class FakeDownloadService extends EventEmitter {
	start = vi.fn().mockResolvedValue(ok({job: {id: 'j', url: ''}}))
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
	setMaxConcurrent = vi.fn()
}

function wired(options: {realFeed?: boolean; sink?: ControlSink; probe?: () => Promise<Result<ProbeResult, ProbeError>>} = {}) {
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const queueService = new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
	void queueService.pauseAll()
	const admission = vi.spyOn(queueService, 'onIntakeAdmission')
	const settings = defaultAppSettings('/downloads')
	const outcomes = new ControlOutcomes()
	let id = 0
	const probe = options.probe ?? ((): Promise<Result<ProbeResult, ProbeError>> => Promise.resolve(ok(VIDEO)))
	const intake = new IntakeService({queue: queueService, probe, registerManifest: () => Promise.resolve(), settings: () => Promise.resolve(settings), text: key => key, profileFormatLabel: () => 'Best', emit: event => outcomes.hear(event), platform: 'linux', newId: () => `id-${++id}`})
	const siteRequests = new SiteRequestState()
	const feed: ControlFeed = {subscribe: vi.fn(() => ({close: vi.fn()}))}
	const createFeed = vi.fn(() => feed)
	const control = createControlService({
		queueService,
		intake,
		outcomes,
		settingsStore: {get: () => Promise.resolve(settings)},
		siteRequests,
		binaries: {current: () => ({ytDlp: 'ready', ffmpeg: 'ready'}), onChange: () => () => undefined},
		languageRef: {current: 'en'},
		clientLabel: clientId => (clientId === 'client-1' ? 'Claude Code' : null),
		...(options.realFeed ? {} : {createFeed})
	})
	const session = control.service.openSession({clientId: 'client-1', kind: 'localClient', label: 'Claude Code', rules: ['trusted']}, options.sink ?? SINK)
	let requests = 0
	const send = async (method: ControlMethod, params: Record<string, unknown>) => {
		const parsed = parseControlRequest({type: 'request', id: `req-${++requests}`, method, params})
		if (!parsed.ok) throw new Error(parsed.error.message)
		const response = await session.handle(parsed.request)
		if (!response.ok) throw new Error(`${method}: ${response.error.code}`)
		return response.result
	}
	return {control, send, admission, createFeed, feed, siteRequests}
}

describe('createControlService', () => {
	it("caps a client's intake rows", () => {
		const h = wired()
		expect(h.admission).toHaveBeenCalledWith(controlRowsPerIntake)
	})

	it('takes a link in and follows its intake to queued', async () => {
		const h = wired()
		const added = await h.send('links.add', {requestId: 'r1', url: VIDEO_URL})
		expect(added).toEqual({intakeId: expect.any(String), placeholderId: expect.any(String)})
		const {intakeId, placeholderId} = added as {intakeId: string; placeholderId: string}
		const waited = await h.send('wait', {intakeId, until: 'settled', timeoutMs: 5000})
		expect(waited).toMatchObject({reached: true, target: {kind: 'intake', intake: {state: {state: 'queued', itemIds: [placeholderId]}}}})
		expect(await h.send('queue.get', {itemId: placeholderId})).toMatchObject({item: {status: 'pending', origin: {kind: 'localClient', clientId: 'client-1', label: 'Claude Code'}, intakeId}})
	})

	it('follows a placeholder row through its probe swap', async () => {
		let finishProbe = (): void => undefined
		const probed = new Promise<Result<ProbeResult, ProbeError>>(resolve => {
			finishProbe = () => resolve(ok(VIDEO))
		})
		const h = wired({probe: () => probed})
		const {placeholderId} = (await h.send('links.add', {requestId: 'r1', url: VIDEO_URL})) as {intakeId: string; placeholderId: string}
		expect(await h.send('queue.get', {itemId: placeholderId})).toMatchObject({item: {status: 'probing'}})
		const waiting = h.send('wait', {itemId: placeholderId, until: 'settled', timeoutMs: 200})
		// The swap removes the placeholder and adds its row under the same id in one step.
		finishProbe()
		const waited = await waiting
		expect(waited).toMatchObject({reached: false, target: {kind: 'item', item: {id: placeholderId, status: 'pending'}}})
	})

	it("reports the queue's scheduler and the sites cooling down", async () => {
		const h = wired()
		h.siteRequests.recordRateLimit('youtube', 'rateLimited')
		const status = await h.send('status', {})
		expect(status).toMatchObject({ready: true, scheduler: 'paused', cooldowns: [{site: 'youtube', until: expect.any(Number)}]})
		await expect(h.send('links.add', {requestId: 'r2', url: VIDEO_URL})).rejects.toThrow('rate_limited')
	})

	it('hands the event feed its sources and the session sink', async () => {
		const h = wired()
		expect(h.createFeed).toHaveBeenCalledWith(expect.objectContaining({queue: expect.objectContaining({snapshot: expect.any(Function)}), registry: h.control.registry, status: h.control.status}))
		expect(await h.send('events.subscribe', {})).toEqual({bootId: h.control.registry.bootId})
		expect(h.feed.subscribe).toHaveBeenCalledWith(SINK, expect.objectContaining({snapshot: true}))
	})

	it("pairs a placeholder's swap on the real queue's event feed", async () => {
		const lines: string[] = []
		const h = wired({realFeed: true, sink: {write: line => lines.push(line) > 0, onDrain: () => () => undefined}})
		await h.send('events.subscribe', {snapshot: false})
		await new Promise(resolve => setImmediate(resolve))
		const {intakeId, placeholderId} = (await h.send('links.add', {requestId: 'r1', url: VIDEO_URL})) as {intakeId: string; placeholderId: string}
		await h.send('wait', {intakeId, until: 'settled', timeoutMs: 5000})
		const events = lines.map(line => JSON.parse(line) as {event: string; seq: number; bootId: string; data: Record<string, unknown>})
		expect(events.map(event => event.seq)).toEqual(events.map((_, index) => index))
		expect(new Set(events.map(event => event.bootId))).toEqual(new Set([h.control.registry.bootId]))
		const queueEvents = events.filter(event => event.event.startsWith('queue.')).map(event => [event.event, event.data])
		expect(queueEvents).toEqual([
			['queue.item', {item: expect.objectContaining({id: placeholderId, status: 'probing', intakeId})}],
			['queue.removed', {itemId: placeholderId, reason: 'replaced'}],
			['queue.replaced', {fromId: placeholderId, toIds: [placeholderId]}],
			['queue.item', {item: expect.objectContaining({id: placeholderId, status: 'pending', origin: {kind: 'localClient', clientId: 'client-1', label: 'Claude Code'}})}]
		])
		// The intake names its rows only after the client has heard them.
		const queued = events.findIndex(event => event.event === 'intake.updated' && (event.data.intake as {state: {state: string}}).state.state === 'queued')
		expect(events[queued]?.data).toMatchObject({intake: {intakeId, state: {state: 'queued', itemIds: [placeholderId]}}})
		expect(queued).toBeGreaterThan(events.findLastIndex(event => event.event === 'queue.item'))
	})
})
