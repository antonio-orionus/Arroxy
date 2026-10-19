import {describe, expect, it, vi, beforeEach} from 'vite-plus/test'

const handlers = new Map<string, (e: unknown, payload: unknown) => Promise<unknown>>()

vi.mock('electron', () => ({
	app: {getPath: vi.fn().mockReturnValue('/tmp')},
	ipcMain: {
		handle: vi.fn((channel: string, fn: (e: unknown, payload: unknown) => Promise<unknown>) => {
			handlers.set(channel, fn)
		}),
		removeHandler: vi.fn((channel: string) => {
			handlers.delete(channel)
		})
	}
}))

import {registerSettingsHandlers} from '@main/ipc/settingsHandlers.js'
import {IPC_CHANNELS} from '@shared/ipc.js'

async function update(payload: unknown): Promise<void> {
	const fn = handlers.get(IPC_CHANNELS.settingsUpdate)
	if (!fn) throw new Error('settings update handler not registered')
	await fn({}, payload)
}

describe('settings update reaches the queue', () => {
	const queueService = {setConcurrentDownloads: vi.fn(), setAutoRetryAttempts: vi.fn(), setAutoRemoveCompleted: vi.fn()}

	function setup(autoRemoveCompleted: boolean | undefined): void {
		handlers.clear()
		vi.clearAllMocks()
		const settingsStore = {get: vi.fn(), update: vi.fn().mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false, autoRemoveCompleted}, playlist: {}, profiles: {}})}
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: queueService as never, hotkeyService: {apply: vi.fn()} as never, exploreView: {destroy: vi.fn()} as never})
	}

	beforeEach(() => {
		setup(true)
	})

	it('passes the new auto-remove value to the queue', async () => {
		await update({common: {autoRemoveCompleted: true}})
		expect(queueService.setAutoRemoveCompleted).toHaveBeenCalledWith(true)
	})

	it('treats a stored value that is missing as off', async () => {
		setup(undefined)
		await update({common: {autoRemoveCompleted: false}})
		expect(queueService.setAutoRemoveCompleted).toHaveBeenCalledWith(false)
	})

	it('leaves the queue alone when the patch does not touch the setting', async () => {
		await update({common: {clipboardWatchEnabled: false}})
		expect(queueService.setAutoRemoveCompleted).not.toHaveBeenCalled()
	})
})

describe('settings update reaches the native theme', () => {
	const onThemeChanged = vi.fn()

	beforeEach(() => {
		handlers.clear()
		vi.clearAllMocks()
		const settingsStore = {get: vi.fn(), update: vi.fn().mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false, uiTheme: 'dark'}, playlist: {}, profiles: {}})}
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: {} as never, hotkeyService: {apply: vi.fn()} as never, exploreView: {destroy: vi.fn()} as never, onThemeChanged})
	})

	it('applies the saved theme when the patch changes it', async () => {
		await update({common: {uiTheme: 'dark'}})
		expect(onThemeChanged).toHaveBeenCalledWith('dark')
	})

	it('leaves the native theme alone when the patch does not touch it', async () => {
		await update({common: {clipboardWatchEnabled: false}})
		expect(onThemeChanged).not.toHaveBeenCalled()
	})
})

// Cooldowns are kept per network route, so a new proxy setting changes which
// ones apply: the queue's hold and the rate-limit alert must hear of it.
describe('settings update reaches the rate-limit cooldowns', () => {
	const onProxyChanged = vi.fn()

	beforeEach(() => {
		handlers.clear()
		vi.clearAllMocks()
		const settingsStore = {get: vi.fn(), update: vi.fn().mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false, proxyUrl: 'http://proxy:8080'}, playlist: {}, profiles: {}})}
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: {} as never, hotkeyService: {apply: vi.fn()} as never, exploreView: {destroy: vi.fn(), applyProxySetting: vi.fn().mockResolvedValue(undefined)} as never, onProxyChanged})
	})

	it('tells them when the patch changes the proxy', async () => {
		await update({common: {proxyUrl: 'http://proxy:8080'}})
		expect(onProxyChanged).toHaveBeenCalledOnce()
	})

	it('leaves them alone when the patch does not touch the proxy', async () => {
		await update({common: {clipboardWatchEnabled: false}})
		expect(onProxyChanged).not.toHaveBeenCalled()
	})
})
