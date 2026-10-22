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
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'

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

describe('settings update reaches the probe slots', () => {
	const onConcurrentProbesChanged = vi.fn()

	beforeEach(() => {
		handlers.clear()
		vi.clearAllMocks()
		const settingsStore = {get: vi.fn(), update: vi.fn().mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false, concurrentProbes: 3}, playlist: {}, profiles: {}})}
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: {} as never, hotkeyService: {apply: vi.fn()} as never, exploreView: {destroy: vi.fn()} as never, onConcurrentProbesChanged})
	})

	it('passes the saved links-checked-at-once count on', async () => {
		await update({common: {concurrentProbes: 3}})
		expect(onConcurrentProbesChanged).toHaveBeenCalledWith(3)
	})

	it('leaves them alone when the patch does not touch the setting', async () => {
		await update({common: {clipboardWatchEnabled: false}})
		expect(onConcurrentProbesChanged).not.toHaveBeenCalled()
	})
})

// A profile saved with a filename template that does not validate would fail
// every download it starts, so the write is refused before it reaches the store.
// A template already stored is let through, or one old typo would refuse every
// later save of the profile list.
describe('settings update refuses a new profile filename template that does not validate', () => {
	const base = BUILTIN_DOWNLOAD_PROFILES[0]
	const stored = {...base, id: 'old', name: 'Old', filename: {kind: 'custom', template: '{titel}'}}
	const settingsStore = {get: vi.fn(), update: vi.fn()}

	beforeEach(() => {
		handlers.clear()
		vi.clearAllMocks()
		settingsStore.get.mockResolvedValue({common: {}, playlist: {}, profiles: {active: {kind: 'builtin', id: base.id}, custom: [stored], overrides: [], enabledOverrides: {}}})
		settingsStore.update.mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false}, playlist: {}, profiles: {}})
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: {} as never, hotkeyService: {apply: vi.fn()} as never, exploreView: {destroy: vi.fn()} as never})
	})

	async function send(payload: unknown): Promise<unknown> {
		const fn = handlers.get(IPC_CHANNELS.settingsUpdate)
		if (!fn) throw new Error('settings update handler not registered')
		return fn({}, payload)
	}

	it.each([
		['custom', '{tittle}'],
		['overrides', 'a:b {title}']
	])('refuses a %s profile with the template %s', async (bucket, template) => {
		const result = await send({profiles: {[bucket]: [{...base, id: 'mine', name: 'Mine', filename: {kind: 'custom', template}}]}})
		expect(result).toMatchObject({ok: false, error: {code: 'validation', message: 'Download profile "Mine" has an unusable filename template'}})
		expect(settingsStore.update).not.toHaveBeenCalled()
	})

	it('names an unnamed built-in by its own name', async () => {
		const result = await send({profiles: {overrides: [{...base, filename: {kind: 'custom', template: '{tittle}'}}]}})
		expect(result).toMatchObject({ok: false, error: {code: 'validation', message: 'Download profile "Best available" has an unusable filename template'}})
	})

	it("refuses a new profile that takes on another profile's stored template", async () => {
		const result = await send({profiles: {custom: [stored, {...stored, id: 'copy', name: 'Copy'}]}})
		expect(result).toMatchObject({ok: false, error: {code: 'validation', message: 'Download profile "Copy" has an unusable filename template'}})
		expect(settingsStore.update).not.toHaveBeenCalled()
	})

	it('saves a profile whose template validates', async () => {
		const result = await send({profiles: {custom: [stored, {...base, id: 'mine', name: 'Mine', filename: {kind: 'custom', template: '{uploader} - {title}'}}]}})
		expect(result).toMatchObject({ok: true})
		expect(settingsStore.update).toHaveBeenCalled()
	})

	it('lets a profile keep its own template saved before the check', async () => {
		const result = await send({profiles: {custom: [{...stored, name: 'Renamed'}]}})
		expect(result).toMatchObject({ok: true})
		expect(settingsStore.update).toHaveBeenCalled()
	})
})
