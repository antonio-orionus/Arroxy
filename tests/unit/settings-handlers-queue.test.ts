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
