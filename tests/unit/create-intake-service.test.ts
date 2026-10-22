// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import type {BrowserWindow} from 'electron'
import {createIntakeService} from '@main/intake/createIntakeService.js'
import type {ProbeService} from '@main/services/ProbeService.js'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {IntakeEvent} from '@shared/intake/intakeEvents.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {HotkeyOutcomePayload, ProbeError, ProbeResult} from '@shared/types.js'

vi.mock('electron-log/main.js', () => {
	const logger = {debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}
	return {default: {...logger, scope: () => logger}}
})

// The composition root routes every intake event: the hotkey's outcomes to its
// intake (and on to the user's notifications), a Control API client's to the
// Control side, everything else to the window. The Control side also hears
// every other outcome, to follow its clients' intakes whoever acts on them.

const URL = 'https://www.youtube.com/watch?v=one'
const VIDEO = {kind: 'video', videoId: 'one', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: URL, isAudioOnlySource: false, formats: [], title: 'Fixture Video', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false} as unknown as ProbeResult
const OFFLINE = fail<ProbeResult, ProbeError>({kind: 'other', code: 'unknown', message: 'offline'})

class FakeDownloadService extends EventEmitter {
	start = vi.fn().mockResolvedValue(ok({job: {id: 'j', url: ''}}))
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function wired(answer: Result<ProbeResult, ProbeError>) {
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const queueService = new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
	void queueService.pauseAll()
	const settings = defaultAppSettings('/downloads')
	const probe = vi.fn((): Promise<Result<ProbeResult, ProbeError>> => Promise.resolve(answer))
	const send = vi.fn<(channel: string, event: IntakeEvent) => void>()
	const hotkeyFeedback = vi.fn<(event: HotkeyOutcomePayload) => void>()
	const window = {destroyed: false}
	const {intake, hotkey, control} = createIntakeService({
		probeService: {probe} as unknown as ProbeService,
		queueService,
		settingsStore: {get: () => Promise.resolve(settings)} as unknown as SettingsStore,
		playlistManifestStore: {save: vi.fn().mockResolvedValue(undefined)} as unknown as PlaylistManifestStore,
		languageRef: {current: 'en'},
		mainWindow: {isDestroyed: () => window.destroyed, webContents: {send}} as unknown as BrowserWindow,
		hotkeyFeedback
	})
	intake.setWindowContext({currentOutputDir: '/wizard-folder', displayShowsHdr: false})
	const windowEvents = (): IntakeEvent[] =>
		send.mock.calls.map(([channel, event]) => {
			expect(channel).toBe(IPC_CHANNELS.intakeEvent)
			return event
		})
	const controlEvents: IntakeEvent[] = []
	control.listen(event => controlEvents.push(event))
	return {intake, hotkey, control, controlEvents, probe, send, hotkeyFeedback, window, windowEvents}
}

describe('createIntakeService routing', () => {
	it("sends a hotkey press's outcome to the hotkey intake, never to the window", async () => {
		const h = wired(OFFLINE)
		await h.hotkey.take({kind: 'single', url: URL})
		await vi.waitFor(() => expect(h.hotkeyFeedback.mock.calls.map(([event]) => event.outcome)).toEqual(['queued', 'submission-failed']))
		expect(h.probe).toHaveBeenCalledTimes(1)
		expect(h.send).not.toHaveBeenCalled()
	})

	it("runs a placeholder row's probe as an intake probe, keyed by the row", async () => {
		const h = wired(OFFLINE)
		const placement = await h.intake.add({requestId: 'w1', url: URL, playlistMode: 'video', origin: {kind: 'window'}})
		await vi.waitFor(() => expect(h.probe).toHaveBeenCalledTimes(1))
		const itemId = placement.kind === 'added' ? placement.itemId : null
		expect(h.probe).toHaveBeenCalledWith(URL, expect.objectContaining({kind: 'intake', playlistMode: 'video', ownerKey: itemId}))
	})

	it("sends a window link's outcome to the window", async () => {
		const h = wired(OFFLINE)
		await h.intake.add({requestId: 'w1', url: URL, playlistMode: 'video', origin: {kind: 'window'}})
		await vi.waitFor(() => expect(h.windowEvents()).toEqual([{kind: 'outcome', requestId: 'w1', intakeId: expect.any(String), origin: 'window', outcome: expect.objectContaining({kind: 'failed'})}]))
		expect(h.hotkeyFeedback).not.toHaveBeenCalled()
	})

	// A name that cannot fit is the window's to report, whoever took the link in.
	it('sends a filename budget failure to the window, even for a hotkey press', async () => {
		const h = wired(ok(VIDEO))
		// Past every platform's path limit (Linux allows 4096 bytes).
		const deep = `/${Array.from({length: 24}, () => 'f'.repeat(200)).join('/')}`
		h.intake.setWindowContext({currentOutputDir: deep, displayShowsHdr: false})
		await h.hotkey.take({kind: 'single', url: URL})
		await vi.waitFor(() => expect(h.windowEvents()).toEqual([{kind: 'filename-budget-failed', reason: 'path-too-deep', outputDir: expect.stringMatching(new RegExp(`^${deep}/`))}]))
		expect(h.hotkeyFeedback.mock.calls.map(([event]) => event.outcome)).toEqual(['queued'])
	})

	it("sends a Control client's outcome to the Control side, never to the window or the hotkey", async () => {
		const h = wired(OFFLINE)
		const placed = await h.intake.add({requestId: 'c1', url: URL, playlistMode: 'video', origin: {kind: 'localClient', clientId: 'client-1'}})
		expect(placed).toMatchObject({kind: 'added'})
		await vi.waitFor(() => expect(h.controlEvents).toEqual([{kind: 'outcome', requestId: 'c1', intakeId: placed.kind === 'added' ? placed.intakeId : null, origin: 'localClient', outcome: expect.objectContaining({kind: 'failed'})}]))
		expect(h.send).not.toHaveBeenCalled()
		expect(h.hotkeyFeedback).not.toHaveBeenCalled()
	})

	it('lets the Control side hear the window and hotkey outcomes too, which still reach their callers', async () => {
		const h = wired(OFFLINE)
		await h.intake.add({requestId: 'w1', url: URL, playlistMode: 'video', origin: {kind: 'window'}})
		await vi.waitFor(() => expect(h.windowEvents()).toHaveLength(1))
		await h.hotkey.take({kind: 'single', url: 'https://www.youtube.com/watch?v=two'})
		await vi.waitFor(() => expect(h.hotkeyFeedback).toHaveBeenCalledTimes(2))
		expect(h.controlEvents.map(event => (event.kind === 'outcome' ? [event.origin, event.outcome.kind] : null))).toEqual([
			['window', 'failed'],
			['hotkey', 'failed']
		])
	})

	// A bug on the Control side must not turn the window's outcome into a probe error.
	it('still sends the window its outcome when the Control listener throws', async () => {
		const h = wired(OFFLINE)
		h.control.listen(() => {
			throw new Error('broken listener')
		})
		await h.intake.add({requestId: 'w1', url: URL, playlistMode: 'video', origin: {kind: 'window'}})
		await vi.waitFor(() => expect(h.windowEvents()).toEqual([expect.objectContaining({requestId: 'w1', outcome: expect.objectContaining({kind: 'failed', probeError: expect.objectContaining({message: 'offline'})})})]))
	})

	it('drops window events once the window is destroyed', async () => {
		const h = wired(OFFLINE)
		h.window.destroyed = true
		await h.intake.add({requestId: 'w1', url: URL, playlistMode: 'video', origin: {kind: 'window'}})
		await vi.waitFor(() => expect(h.probe).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(h.send).not.toHaveBeenCalled()
	})
})
