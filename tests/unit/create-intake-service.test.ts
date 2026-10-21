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
// intake (and on to the user's notifications), everything else to the window.

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
	const {intake, hotkey} = createIntakeService({
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
	return {intake, hotkey, probe, send, hotkeyFeedback, window, windowEvents}
}

describe('createIntakeService routing', () => {
	it("sends a hotkey press's outcome to the hotkey intake, never to the window", async () => {
		const h = wired(OFFLINE)
		await h.hotkey.take({kind: 'single', url: URL})
		await vi.waitFor(() => expect(h.hotkeyFeedback.mock.calls.map(([event]) => event.outcome)).toEqual(['queued', 'submission-failed']))
		expect(h.probe).toHaveBeenCalledTimes(1)
		expect(h.send).not.toHaveBeenCalled()
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

	it('drops window events once the window is destroyed', async () => {
		const h = wired(OFFLINE)
		h.window.destroyed = true
		await h.intake.add({requestId: 'w1', url: URL, playlistMode: 'video', origin: {kind: 'window'}})
		await vi.waitFor(() => expect(h.probe).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(h.send).not.toHaveBeenCalled()
	})
})
