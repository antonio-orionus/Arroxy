// @vitest-environment node

import {describe, expect, it, vi, beforeEach} from 'vitest'
import {createPreloadApi, type PreloadIpcRenderer} from '@preload/createPreloadApi.js'
import {IPC_CHANNELS} from '@shared/ipc.js'

function makeIpcRenderer() {
	const invoke = vi.fn().mockResolvedValue(undefined)
	const on = vi.fn()
	const removeListener = vi.fn()
	const send = vi.fn()
	const ipcRenderer: PreloadIpcRenderer = {invoke: invoke as PreloadIpcRenderer['invoke'], on: on as PreloadIpcRenderer['on'], removeListener: removeListener as PreloadIpcRenderer['removeListener'], send: send as PreloadIpcRenderer['send']}
	return {ipcRenderer, invoke, on, removeListener, send}
}

let ipc: ReturnType<typeof makeIpcRenderer>

beforeEach(() => {
	ipc = makeIpcRenderer()
})

describe('invoke methods → correct IPC channel', () => {
	it('app.warmUp', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.app.warmUp({})
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.appWarmUp, {})
	})

	it('app.warmUp with no arg passes empty object', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.app.warmUp()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.appWarmUp, {})
	})

	it('app.cancelWarmup', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.app.cancelWarmup()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.appCancelWarmup)
	})

	it('app.getGraphicsPolicy', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.app.getGraphicsPolicy()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.appGetGraphicsPolicy)
	})

	it('app.installYtDlpWithHomebrew', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.app.installYtDlpWithHomebrew()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.appInstallYtDlpHomebrew)
	})

	it('app.installYtDlpWithWinget', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.app.installYtDlpWithWinget()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.appInstallYtDlpWinget)
	})

	it('downloads.probe', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const input = {url: 'https://youtube.com/watch?v=x'}
		void api.downloads.probe(input)
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.downloadsProbe, input)
	})

	it('downloads.start calls the correct channel', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.downloads.probe({url: 'https://x.com'})
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.downloadsProbe, {url: 'https://x.com'})
	})

	it('settings.get', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.settings.get()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.settingsGet)
	})

	it('settings.update', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const patch = {common: {defaultOutputDir: '/new'}}
		void api.settings.update(patch)
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.settingsUpdate, patch)
	})

	it('shell.openExternal', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.shell.openExternal('https://example.com')
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.shellOpenExternal, 'https://example.com')
	})

	it('logs.uploadFeedbackDiagnostic', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const input = {reportId: '11111111-1111-4111-8111-111111111111'}
		void api.logs.uploadFeedbackDiagnostic(input)
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.logsUploadFeedbackDiagnostic, input)
	})

	it('dialog.chooseFolder', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.dialog.chooseFolder()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.chooseFolder, undefined)
	})

	it('queue.cmd.add', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.queue.cmd.add([])
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.queueCmdAdd, [])
	})

	it('queue.cmd.cancel', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.queue.cmd.cancel({itemId: 'abc'})
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.queueCmdCancel, {itemId: 'abc'})
	})

	it('updater.install', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		void api.updater.install()
		expect(ipc.invoke).toHaveBeenCalledWith(IPC_CHANNELS.updaterInstall)
	})
})

describe('send methods → correct IPC channel', () => {
	it('analytics.track', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		api.analytics.track('app_started', {install_channel: 'direct'})
		expect(ipc.send).toHaveBeenCalledWith(IPC_CHANNELS.analyticsTrack, {name: 'app_started', props: {install_channel: 'direct'}})
	})
})

describe('event listeners — strip Electron event wrapper', () => {
	it('onStatus: listener receives only the payload, not the Electron event', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const listener = vi.fn()
		api.events.onStatus(listener)

		// ipcRenderer.on was called with a wrapped listener
		expect(ipc.on).toHaveBeenCalledWith(IPC_CHANNELS.eventsStatus, expect.any(Function))
		const [, wrapped] = ipc.on.mock.calls[0] as [string, (e: unknown, payload: unknown) => void]

		const fakeElectronEvent = {sender: {}}
		const fakePayload = {jobId: 'j1', stage: 'done', statusKey: 'complete', at: ''}
		wrapped(fakeElectronEvent, fakePayload)

		// Listener gets only the payload — no Electron event
		expect(listener).toHaveBeenCalledWith(fakePayload)
		expect(listener).not.toHaveBeenCalledWith(fakeElectronEvent, fakePayload)
	})

	it('onProgress: listener receives only the payload', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const listener = vi.fn()
		api.events.onProgress(listener)

		const [, wrapped] = ipc.on.mock.calls[0] as [string, (e: unknown, payload: unknown) => void]
		const fakePayload = {jobId: 'j1', percent: 50, speed: '1MiB/s', eta: '10s'}
		wrapped({}, fakePayload)

		expect(listener).toHaveBeenCalledWith(fakePayload)
	})

	it('onProbeProgress: listener receives only the payload', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const listener = vi.fn()
		api.events.onProbeProgress(listener)

		expect(ipc.on).toHaveBeenCalledWith(IPC_CHANNELS.downloadsProbeProgress, expect.any(Function))
		const [, wrapped] = ipc.on.mock.calls.find(([channel]) => channel === IPC_CHANNELS.downloadsProbeProgress) as [string, (e: unknown, payload: unknown) => void]
		const fakePayload = {url: 'https://www.youtube.com/playlist?list=PL1', playlistMode: 'playlist', phase: 'items', loaded: 12, total: 100, at: new Date().toISOString()}
		wrapped({}, fakePayload)

		expect(listener).toHaveBeenCalledWith(fakePayload)
	})

	it('queue.events.onSnapshot: listener receives items array', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const listener = vi.fn()
		api.queue.events.onSnapshot(listener)

		const [, wrapped] = ipc.on.mock.calls[0] as [string, (e: unknown, items: unknown[]) => void]
		wrapped({}, [{id: 'q1'}])

		expect(listener).toHaveBeenCalledWith([{id: 'q1'}])
	})

	it('window.onMaximizedChange: listener receives boolean', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const listener = vi.fn()
		api.window.onMaximizedChange(listener)

		const [, wrapped] = ipc.on.mock.calls[0] as [string, (e: unknown, isMax: boolean) => void]
		wrapped({}, true)

		expect(listener).toHaveBeenCalledWith(true)
	})
})

describe('unsubscribe — removes exact wrapper function', () => {
	it('onStatus unsubscribe removes the same function passed to on()', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const unsubscribe = api.events.onStatus(vi.fn())

		const [channel, wrappedAtRegister] = ipc.on.mock.calls[0]
		unsubscribe()

		expect(ipc.removeListener).toHaveBeenCalledWith(channel, wrappedAtRegister)
	})

	it('onProgress unsubscribe removes the correct channel', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const unsubscribe = api.events.onProgress(vi.fn())
		unsubscribe()

		expect(ipc.removeListener).toHaveBeenCalledWith(IPC_CHANNELS.eventsProgress, expect.any(Function))
	})

	it('queue.events.onAdded unsubscribe removes the correct channel', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const unsubscribe = api.queue.events.onAdded(vi.fn())
		unsubscribe()

		expect(ipc.removeListener).toHaveBeenCalledWith(IPC_CHANNELS.queueEventAdded, expect.any(Function))
	})

	it('updater.onUpdateAvailable unsubscribe uses removeListener, not removeAllListeners', () => {
		const api = createPreloadApi(ipc.ipcRenderer)
		const unsubscribe = api.updater.onUpdateAvailable(vi.fn())

		const [, wrappedAtRegister] = ipc.on.mock.calls[0]
		unsubscribe()

		expect(ipc.removeListener).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, wrappedAtRegister)
	})
})
