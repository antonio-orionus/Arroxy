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

import {registerExploreHandlers} from '@main/ipc/exploreHandlers.js'
import {registerSettingsHandlers} from '@main/ipc/settingsHandlers.js'
import {ExploreEventBridge} from '@main/services/explore/ExploreEventBridge.js'
import log from 'electron-log/main.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {exploreViewStateSchema} from '@shared/schemas.js'
import {EXPLORE_SNAPSHOT_MAX_CHARS, exploreNavigateCommandSchema} from '@shared/exploreSchemas.js'
import type {ExploreViewState} from '@shared/types.js'
import {EXPLORE_ADDRESS_MAX, exploreAddressScope} from '@shared/sites/exploreAddress.js'
import {youtubeSite} from '@shared/sites/youtube.js'

const STATE: ExploreViewState = {url: 'https://www.youtube.com/', title: 'YouTube', canGoBack: false, canGoForward: false, loading: false, signedIn: true, error: null, adBlock: 'off'}
// The whole renderer-visible surface. A cookie, token or header field must never join this list.
const ALLOWED_STATE_KEYS = ['adBlock', 'canGoBack', 'canGoForward', 'error', 'loading', 'signedIn', 'title', 'url']

function makeHost() {
	if (!youtubeSite.explore) throw new Error('youtube has no Explore capability')
	const addressScope = exploreAddressScope(youtubeSite.explore)
	return {
		addressScope,
		navigate: vi.fn().mockResolvedValue(undefined),
		setBounds: vi.fn(),
		setVisible: vi.fn().mockResolvedValue(undefined),
		setActive: vi.fn(),
		signOut: vi.fn().mockResolvedValue(undefined),
		getState: vi.fn().mockReturnValue(STATE),
		capture: vi.fn<() => Promise<string | null>>().mockResolvedValue(null),
		destroy: vi.fn(),
		applyProxySetting: vi.fn().mockResolvedValue(undefined),
		applyAdBlockSetting: vi.fn().mockResolvedValue(undefined),
		applyIdleUnloadSetting: vi.fn()
	}
}

async function invoke(channel: string, payload?: unknown): Promise<{ok: boolean; data?: unknown; error?: {code: string}}> {
	const fn = handlers.get(channel)
	if (!fn) throw new Error(`no handler for ${channel}`)
	return (await fn({}, payload)) as {ok: boolean; data?: unknown; error?: {code: string}}
}

describe('explore IPC handlers', () => {
	let host: ReturnType<typeof makeHost>

	beforeEach(() => {
		handlers.clear()
		host = makeHost()
		registerExploreHandlers({exploreView: host})
	})

	describe('navigate', () => {
		it.each(['back', 'forward', 'reload', 'home'] as const)('forwards %s', async kind => {
			expect((await invoke(IPC_CHANNELS.exploreNavigate, {kind})).ok).toBe(true)
			expect(host.navigate).toHaveBeenCalledWith({kind})
		})

		// The old `url` command is gone: a typed address is `address`, checked here and not only in the renderer.
		it.each(['https://www.youtube.com/watch?v=abc', 'https://m.youtube.com/', 'https://www.youtube.com/results?search_query=lofi+beats', 'https://example.com/watch?v=abc', 'http://www.youtube.com/watch?v=abc', 'https://www.youtube.com:8443/', 'http://127.0.0.1:4567/next'])(
			'forwards the typed address %s',
			async url => {
				expect((await invoke(IPC_CHANNELS.exploreNavigate, {kind: 'address', url})).ok).toBe(true)
				expect(host.navigate).toHaveBeenCalledWith({kind: 'address', url})
			}
		)

		it.each([
			['https://user:secret@www.youtube.com/', 'www.youtube.com'],
			['ftp://example.com/watch', 'example.com'],
			['https://accounts.google.com/ServiceLogin', 'accounts.google.com'],
			['https://myaccount.google.com/', 'myaccount.google.com'],
			['https://accounts.youtube.com/', 'accounts.youtube.com'],
			['https://consent.youtube.com/m', 'consent.youtube.com'],
			['https://consent.google.fr/', 'consent.google.fr'],
			['javascript:alert(1)', ''],
			['data:text/html,x', ''],
			[`https://www.youtube.com/watch?v=${'a'.repeat(EXPLORE_ADDRESS_MAX)}`, '']
		])('refuses the typed address %s and logs the host only', async (url, host_) => {
			vi.mocked(log.info).mockClear()
			const result = await invoke(IPC_CHANNELS.exploreNavigate, {kind: 'address', url})
			expect(result.ok).toBe(false)
			expect(result.error?.code).toBe('validation')
			expect(host.navigate).not.toHaveBeenCalled()
			const logged = JSON.stringify(vi.mocked(log.info).mock.calls)
			if (host_) expect(logged).toContain(host_)
			expect(logged).not.toContain('secret')
			expect(logged).not.toContain('watch')
		})

		it.each([[undefined], [{}], [{kind: 'url'}], [{kind: 'address'}], [{kind: 'address', url: 42}], [{kind: 'url', url: 'https://www.youtube.com/watch?v=abc'}], [{kind: 'url', url: 'javascript:alert(1)'}], [{kind: 'eval'}], [{kind: 'back', url: 'https://x.test'}], ['back']])('rejects %j', async payload => {
			const result = await invoke(IPC_CHANNELS.exploreNavigate, payload)
			expect(result.ok).toBe(false)
			expect(result.error?.code).toBe('validation')
			expect(host.navigate).not.toHaveBeenCalled()
		})
	})

	describe('setBounds', () => {
		it('forwards a valid rect', async () => {
			expect((await invoke(IPC_CHANNELS.exploreSetBounds, {x: 0, y: 48, width: 900.5, height: 600})).ok).toBe(true)
			expect(host.setBounds).toHaveBeenCalledWith({x: 0, y: 48, width: 900.5, height: 600})
		})

		it.each([[undefined], [{}], [{x: -1, y: 0, width: 10, height: 10}], [{x: 0, y: 0, width: 16385, height: 10}], [{x: 0, y: 0, width: Number.POSITIVE_INFINITY, height: 10}], [{x: 0, y: 0, width: Number.NaN, height: 10}], [{x: 0, y: 0, width: '10', height: 10}], [{x: 0, y: 0, width: 10}]])(
			'rejects %j',
			async payload => {
				const result = await invoke(IPC_CHANNELS.exploreSetBounds, payload)
				expect(result.ok).toBe(false)
				expect(host.setBounds).not.toHaveBeenCalled()
			}
		)

		it('accepts the 16384 upper bound', async () => {
			expect((await invoke(IPC_CHANNELS.exploreSetBounds, {x: 0, y: 0, width: 16384, height: 16384})).ok).toBe(true)
		})
	})

	describe('setVisible', () => {
		it.each([true, false])('forwards %s and awaits the host', async visible => {
			expect((await invoke(IPC_CHANNELS.exploreSetVisible, {visible})).ok).toBe(true)
			expect(host.setVisible).toHaveBeenCalledWith(visible)
		})

		it.each([[undefined], [{}], [{visible: 'yes'}], [{visible: 1}]])('rejects %j', async payload => {
			expect((await invoke(IPC_CHANNELS.exploreSetVisible, payload)).ok).toBe(false)
			expect(host.setVisible).not.toHaveBeenCalled()
		})
	})

	describe('setActive', () => {
		it.each([true, false])('forwards %s', async active => {
			expect((await invoke(IPC_CHANNELS.exploreSetActive, {active})).ok).toBe(true)
			expect(host.setActive).toHaveBeenCalledWith(active)
		})

		it.each([[undefined], [{}], [{active: 'yes'}], [{visible: true}]])('rejects %j', async payload => {
			expect((await invoke(IPC_CHANNELS.exploreSetActive, payload)).ok).toBe(false)
			expect(host.setActive).not.toHaveBeenCalled()
		})
	})

	it('signOut calls the host', async () => {
		expect((await invoke(IPC_CHANNELS.exploreSignOut)).ok).toBe(true)
		expect(host.signOut).toHaveBeenCalledOnce()
	})

	it('a host failure becomes a failed Result, not a thrown error', async () => {
		host.signOut.mockRejectedValue(new Error('boom'))
		const result = await invoke(IPC_CHANNELS.exploreSignOut)
		expect(result.ok).toBe(false)
	})

	it('getState returns the host state', async () => {
		const result = await invoke(IPC_CHANNELS.exploreGetState)
		expect(result).toEqual({ok: true, data: STATE})
	})

	it('getState never returns a key outside the allowed list', async () => {
		host.getState.mockReturnValue({...STATE, cookies: [{name: 'SID', value: 'secret'}], authorization: 'Bearer x'})
		const result = await invoke(IPC_CHANNELS.exploreGetState)
		expect(Object.keys(result.data as object).sort()).toEqual(ALLOWED_STATE_KEYS)
		expect(JSON.stringify(result)).not.toContain('secret')
	})

	// P2-R35: a picture of the page to show while an overlay hides the view.
	describe('capture', () => {
		const JPEG = `data:image/jpeg;base64,${'/9j/4AAQSkZJRg'.padEnd(64, 'A')}==`

		it('returns the JPEG data URL the host captured', async () => {
			host.capture.mockResolvedValue(JPEG)
			expect(await invoke(IPC_CHANNELS.exploreCapture)).toEqual({ok: true, data: JPEG})
		})

		it('accepts a full-resolution capture of a large HiDPI view', async () => {
			// A 5K, noise-heavy page encodes to ~15M base64 chars at quality 85.
			const large = `data:image/jpeg;base64,${'A'.repeat(15_000_000)}`
			host.capture.mockResolvedValue(large)
			expect((await invoke(IPC_CHANNELS.exploreCapture)).data).toBe(large)
		})

		it('returns null when there is nothing to capture', async () => {
			expect(await invoke(IPC_CHANNELS.exploreCapture)).toEqual({ok: true, data: null})
		})

		it.each([
			['a PNG', 'data:image/png;base64,AAAA'],
			['an SVG, which can carry script', 'data:image/svg+xml;base64,PHN2Zz4='],
			['a remote URL', 'https://www.youtube.com/thumb.png'],
			['a data URL that is not base64', 'data:image/jpeg,<b>'],
			['a data URL with junk after the image', 'data:image/jpeg;base64,AAAA"onerror="x']
		])('returns null rather than %s', async (_name, value) => {
			host.capture.mockResolvedValue(value)
			expect(await invoke(IPC_CHANNELS.exploreCapture)).toEqual({ok: true, data: null})
		})

		it('returns null for an image over the size cap', async () => {
			host.capture.mockResolvedValue(`data:image/jpeg;base64,${'A'.repeat(EXPLORE_SNAPSHOT_MAX_CHARS)}`)
			expect(await invoke(IPC_CHANNELS.exploreCapture)).toEqual({ok: true, data: null})
		})

		it('logs nothing of the image', async () => {
			host.capture.mockResolvedValue(JPEG)
			for (const fn of [log.info, log.warn, log.error, log.debug]) vi.mocked(fn).mockClear()
			await invoke(IPC_CHANNELS.exploreCapture)
			const logged = JSON.stringify([log.info, log.warn, log.error, log.debug].flatMap(fn => vi.mocked(fn).mock.calls))
			expect(logged).not.toContain('base64')
		})
	})

	it('re-registering does not stack handlers', () => {
		registerExploreHandlers({exploreView: host})
		expect(handlers.size).toBe(7)
	})
})

describe('explore schemas', () => {
	it('view state key list is exactly the allowed surface', () => {
		expect(Object.keys(exploreViewStateSchema.shape).sort()).toEqual(ALLOWED_STATE_KEYS)
	})

	it('navigate schema is a discriminated union on kind', () => {
		expect(exploreNavigateCommandSchema.safeParse({kind: 'home'}).success).toBe(true)
		expect(exploreNavigateCommandSchema.safeParse({kind: 'url', url: 'https://youtu.be/abc'}).success).toBe(false)
		expect(exploreNavigateCommandSchema.safeParse({kind: 'address', url: 'https://www.youtube.com/'}).success).toBe(true)
		expect(exploreNavigateCommandSchema.safeParse({kind: 'address', url: 'x'.repeat(EXPLORE_ADDRESS_MAX + 1)}).success).toBe(false)
		expect(exploreNavigateCommandSchema.safeParse({kind: 'nope'}).success).toBe(false)
	})
})

describe('ExploreEventBridge', () => {
	function makeWindow(destroyed = false) {
		return {isDestroyed: vi.fn().mockReturnValue(destroyed), webContents: {send: vi.fn()}}
	}

	it('sends state on explore:stateChanged', () => {
		const win = makeWindow()
		new ExploreEventBridge(win as never).emit(STATE)
		expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.exploreStateChanged, STATE)
	})

	it('signals the pointer entering the view on explore:pointerInView, with no payload', () => {
		const win = makeWindow()
		new ExploreEventBridge(win as never).pointerInView()
		expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.explorePointerInView)
		expect(vi.mocked(win.webContents.send).mock.calls[0]).toHaveLength(1)
	})

	it('drops the pointer signal once the window is destroyed', () => {
		const win = makeWindow(true)
		new ExploreEventBridge(win as never).pointerInView()
		expect(win.webContents.send).not.toHaveBeenCalled()
	})

	it('drops state silently once the window is destroyed', () => {
		const win = makeWindow(true)
		new ExploreEventBridge(win as never).emit(STATE)
		expect(win.webContents.send).not.toHaveBeenCalled()
	})

	it('drops a state that does not parse with a warning, and never throws into the caller', () => {
		const win = makeWindow()
		// The mocked logger shares one spy across scopes and levels.
		const warn = vi.mocked(log.warn)
		warn.mockClear()
		const bridge = new ExploreEventBridge(win as never)
		expect(() => bridge.emit({...STATE, url: 42} as unknown as ExploreViewState)).not.toThrow()
		expect(win.webContents.send).not.toHaveBeenCalled()
		expect(warn).toHaveBeenCalled()
	})

	it('strips any key outside the allowed list before it crosses IPC', () => {
		const win = makeWindow()
		new ExploreEventBridge(win as never).emit({...STATE, cookies: ['SID=secret']} as ExploreViewState)
		const sent = win.webContents.send.mock.calls[0][1] as object
		expect(Object.keys(sent).sort()).toEqual(ALLOWED_STATE_KEYS)
	})
})

describe('settings update tears the Explore view down when it is switched off', () => {
	function setup(updatedExploreEnabled: boolean | undefined) {
		handlers.clear()
		const host = makeHost()
		const settingsStore = {get: vi.fn(), update: vi.fn().mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false, exploreEnabled: updatedExploreEnabled}, playlist: {}, profiles: {}})}
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: {setConcurrentDownloads: vi.fn(), setAutoRetryAttempts: vi.fn()} as never, hotkeyService: {apply: vi.fn()} as never, exploreView: host})
		return host
	}

	it('destroys the view when the patch sets exploreEnabled false', async () => {
		const host = setup(false)
		const result = await invoke(IPC_CHANNELS.settingsUpdate, {common: {exploreEnabled: false}})
		expect(result.ok).toBe(true)
		expect(host.destroy).toHaveBeenCalledOnce()
	})

	it('keeps the view when the patch sets exploreEnabled true', async () => {
		const host = setup(true)
		await invoke(IPC_CHANNELS.settingsUpdate, {common: {exploreEnabled: true}})
		expect(host.destroy).not.toHaveBeenCalled()
	})

	it('keeps the view when the patch does not touch exploreEnabled', async () => {
		const host = setup(false)
		await invoke(IPC_CHANNELS.settingsUpdate, {common: {clipboardWatchEnabled: false}})
		expect(host.destroy).not.toHaveBeenCalled()
	})

	it('keeps the view when the store rejected the patch and the result is still enabled', async () => {
		const host = setup(undefined)
		await invoke(IPC_CHANNELS.settingsUpdate, {common: {exploreEnabled: false}})
		expect(host.destroy).not.toHaveBeenCalled()
	})
})

describe('settings update re-applies a changed proxy to the Explore view', () => {
	function setup() {
		handlers.clear()
		const host = makeHost()
		const settingsStore = {get: vi.fn(), update: vi.fn().mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false, proxyUrl: 'http://proxy.example:8080'}, playlist: {}, profiles: {}})}
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: {setConcurrentDownloads: vi.fn(), setAutoRetryAttempts: vi.fn()} as never, hotkeyService: {apply: vi.fn()} as never, exploreView: host})
		return host
	}

	it.each(['http://proxy.example:8080', ''])('re-applies when the patch sets proxyUrl to %j', async proxyUrl => {
		const host = setup()
		expect((await invoke(IPC_CHANNELS.settingsUpdate, {common: {proxyUrl}})).ok).toBe(true)
		expect(host.applyProxySetting).toHaveBeenCalledOnce()
	})

	it('leaves the view alone when the patch does not touch proxyUrl', async () => {
		const host = setup()
		await invoke(IPC_CHANNELS.settingsUpdate, {common: {clipboardWatchEnabled: false}})
		expect(host.applyProxySetting).not.toHaveBeenCalled()
	})
})

describe('settings update applies a toggled ad blocker to the Explore view', () => {
	function setup() {
		handlers.clear()
		const host = makeHost()
		const settingsStore = {get: vi.fn(), update: vi.fn().mockResolvedValue({common: {clipboardWatchEnabled: false, hotkeyEnabled: false, exploreAdBlock: true}, playlist: {}, profiles: {}})}
		registerSettingsHandlers({settingsStore: settingsStore as never, clipboardWatcher: {setEnabled: vi.fn()} as never, queueService: {setConcurrentDownloads: vi.fn(), setAutoRetryAttempts: vi.fn()} as never, hotkeyService: {apply: vi.fn()} as never, exploreView: host})
		return host
	}

	it.each([true, false])('applies it when the patch sets exploreAdBlock to %s', async exploreAdBlock => {
		const host = setup()
		expect((await invoke(IPC_CHANNELS.settingsUpdate, {common: {exploreAdBlock}})).ok).toBe(true)
		expect(host.applyAdBlockSetting).toHaveBeenCalledOnce()
	})

	it('leaves the blocker alone when the patch does not touch it', async () => {
		const host = setup()
		await invoke(IPC_CHANNELS.settingsUpdate, {common: {proxyUrl: ''}})
		expect(host.applyAdBlockSetting).not.toHaveBeenCalled()
	})

	it.each([true, false])('applies idle unload when the patch sets exploreIdleUnload to %s', async exploreIdleUnload => {
		const host = setup()
		expect((await invoke(IPC_CHANNELS.settingsUpdate, {common: {exploreIdleUnload}})).ok).toBe(true)
		expect(host.applyIdleUnloadSetting).toHaveBeenCalledOnce()
		expect(host.applyAdBlockSetting).not.toHaveBeenCalled()
	})
})
