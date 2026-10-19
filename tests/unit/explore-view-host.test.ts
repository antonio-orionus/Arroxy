// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views, type FakeView} from '../shared/exploreViewFakes.js'
import {lastState, makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

type FakeViewInstance = FakeView

// The view host's lifecycle, kill switch, proxy fail-closed and load errors,
// proxy logins, zoom, the main window reloading, and audio. Navigation wiring,
// state and sign-out, the last page, proxy refusal and capture have their own files.

beforeEach(() => {
	views.length = 0
})

describe('ExploreViewHost lifecycle', () => {
	it('creates nothing until the view is first shown', async () => {
		const h = makeHarness()
		h.host.setBounds({x: 0, y: 40, width: 800, height: 600})
		await h.host.setVisible(false)
		await h.host.navigate({kind: 'home'})
		expect(views).toHaveLength(0)
		expect(h.session.getSession).not.toHaveBeenCalled()
		expect(h.window.contentView.addChildView).not.toHaveBeenCalled()
	})

	it('creates one locked-down view on the Explore session on first show and opens home', async () => {
		const h = makeHarness()
		h.host.setBounds({x: 10.4, y: 40.6, width: 800.2, height: 600})
		await h.host.setVisible(true)
		await h.host.setVisible(true)

		const view = onlyView()
		expect(view.options.webPreferences).toEqual({session: h.session.getSession(), sandbox: true, contextIsolation: true, nodeIntegration: false, devTools: true, backgroundThrottling: true})
		expect(view.options.webPreferences).not.toHaveProperty('preload')
		expect(h.window.contentView.addChildView).toHaveBeenCalledTimes(1)
		expect(h.window.contentView.addChildView).toHaveBeenCalledWith(view)
		expect(view.setBounds).toHaveBeenLastCalledWith({x: 10, y: 41, width: 801, height: 600})
		expect(view.webContents.loadURL).toHaveBeenCalledTimes(1)
		expect(view.webContents.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
	})

	it('disables devtools in a packaged build', async () => {
		const h = makeHarness({isPackaged: true})
		await h.host.setVisible(true)
		expect(onlyView().options.webPreferences.devTools).toBe(false)
	})

	it('hides and re-shows the same view', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const view = onlyView()
		await h.host.setVisible(false)
		expect(view.setVisible).toHaveBeenLastCalledWith(false)
		await h.host.setVisible(true)
		expect(view.setVisible).toHaveBeenLastCalledWith(true)
		expect(views).toHaveLength(1)
		expect(view.webContents.loadURL).toHaveBeenCalledTimes(1)
	})

	it('applies bounds sent after creation', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		h.host.setBounds({x: 0, y: 0, width: 640.5, height: 480.5})
		expect(onlyView().setBounds).toHaveBeenLastCalledWith({x: 0, y: 0, width: 641, height: 481})
	})

	it('opens the E2E home override instead of YouTube', async () => {
		const h = makeHarness({homeUrlOverride: 'http://127.0.0.1:4567/explore/home'})
		await h.host.setVisible(true)
		expect(onlyView().webContents.loadURL).toHaveBeenCalledWith('http://127.0.0.1:4567/explore/home')
	})

	it('tears the view down when the window closes and never recreates it', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const view = onlyView()
		h.closeWindow()
		expect(view.webContents.close).toHaveBeenCalled()
		expect(h.cookieListenerCount()).toBe(0)
		await h.host.setVisible(true)
		expect(views).toHaveLength(1)
	})
})

describe('ExploreViewHost kill switch', () => {
	it('refuses to show the view while Explore is disabled', async () => {
		const h = makeHarness({settings: {exploreEnabled: false}})
		await h.host.setVisible(true)
		expect(views).toHaveLength(0)
	})

	it('destroys a live view once Explore is disabled', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const view = onlyView()
		h.setSettings({exploreEnabled: false})
		await h.host.setVisible(true)
		expect(view.webContents.close).toHaveBeenCalled()
		expect(h.window.contentView.removeChildView).toHaveBeenCalledWith(view)
		expect(h.cookieListenerCount()).toBe(0)
		expect(lastState(h.emit)).toEqual({url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'})
	})

	it('destroy() is idempotent and a re-enabled Explore gets a fresh view', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		h.host.destroy()
		h.host.destroy()
		expect(views[0]?.webContents.close).toHaveBeenCalledTimes(1)
		await h.host.setVisible(true)
		expect(views).toHaveLength(2)
	})
})

describe('ExploreViewHost proxy fail-closed', () => {
	it('awaits whenReady before loading', async () => {
		const h = makeHarness()
		let release: () => void = () => undefined
		h.session.whenReady.mockReturnValueOnce(new Promise<void>(resolve => (release = resolve)))
		const shown = h.host.setVisible(true)
		await Promise.resolve()
		const view = onlyView()
		expect(view.webContents.loadURL).not.toHaveBeenCalled()
		release()
		await shown
		expect(view.webContents.loadURL).toHaveBeenCalledTimes(1)
	})

	it('loads nothing and reports the proxy error when whenReady rejects', async () => {
		const h = makeHarness()
		h.session.whenReady.mockRejectedValue(new Error('Explore proxy setting is not a usable proxy URL'))
		await h.host.setVisible(true)
		const view = onlyView()
		expect(view.webContents.loadURL).not.toHaveBeenCalled()
		expect(lastState(h.emit).error).toBe('proxy')
		expect(h.host.getState().error).toBe('proxy')

		for (const kind of ['home', 'reload', 'back', 'forward'] as const) await h.host.navigate({kind})
		expect(view.webContents.loadURL).not.toHaveBeenCalled()
		expect(view.webContents.reload).not.toHaveBeenCalled()
		expect(view.webContents.navigationHistory.goBack).not.toHaveBeenCalled()
		expect(view.webContents.navigationHistory.goForward).not.toHaveBeenCalled()
	})

	it('a retry after the proxy is fixed loads home and clears the error', async () => {
		const h = makeHarness()
		h.session.whenReady.mockRejectedValueOnce(new Error('no proxy'))
		await h.host.setVisible(true)
		await h.host.navigate({kind: 'reload'})
		expect(onlyView().webContents.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
		expect(h.host.getState().error).toBeNull()
	})

	it('does not load into a view destroyed while the proxy was settling', async () => {
		const h = makeHarness()
		let release: () => void = () => undefined
		h.session.whenReady.mockReturnValueOnce(new Promise<void>(resolve => (release = resolve)))
		const shown = h.host.setVisible(true)
		// Destroy only once load() is parked on the proxy wait, not earlier in the ad block wait.
		await vi.waitFor(() => expect(h.session.whenReady).toHaveBeenCalled())
		h.host.destroy()
		release()
		await shown
		expect(onlyView().webContents.loadURL).not.toHaveBeenCalled()
	})

	it('a view destroyed and recreated during the proxy wait gets exactly one start load', async () => {
		const h = makeHarness()
		let release: () => void = () => undefined
		h.session.whenReady.mockReturnValueOnce(new Promise<void>(resolve => (release = resolve)))
		const first = h.host.setVisible(true)
		await vi.waitFor(() => expect(h.session.whenReady).toHaveBeenCalled())
		h.host.destroy()
		await h.host.setVisible(true)
		release()
		await first
		expect(views).toHaveLength(2)
		expect(views[0]?.webContents.loadURL).not.toHaveBeenCalled()
		expect(views[1]?.webContents.loadURL).toHaveBeenCalledTimes(1)
	})

	it('a proxy wait that a newer refusal replaced loads nothing', async () => {
		const h = makeHarness()
		let release: () => void = () => undefined
		const refused = Promise.reject(new Error('Explore proxy setting is not a usable proxy URL'))
		refused.catch(() => undefined)
		h.session.whenReady.mockReturnValueOnce(new Promise<void>(resolve => (release = resolve))).mockReturnValue(refused)
		const shown = h.host.setVisible(true)
		await vi.waitFor(() => expect(h.session.whenReady).toHaveBeenCalled())
		release()
		await shown
		expect(onlyView().webContents.loadURL).not.toHaveBeenCalled()
		expect(h.host.getState().error).toBe('proxy')
	})
})

describe('ExploreViewHost load errors', () => {
	it('reports a main-frame load failure but not the benign ERR_ABORTED or a subframe failure', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.emit('did-fail-load', {}, -3, 'ERR_ABORTED', 'https://www.youtube.com/?themeRefresh=1', true)
		expect(h.host.getState().error).toBeNull()
		wc.emit('did-fail-load', {}, -105, 'ERR_NAME_NOT_RESOLVED', 'https://ads.example/', false)
		expect(h.host.getState().error).toBeNull()
		wc.emit('did-fail-load', {}, -105, 'ERR_NAME_NOT_RESOLVED', 'https://www.youtube.com/', true)
		expect(h.host.getState().error).toBe('load')
		expect(lastState(h.emit).error).toBe('load')
	})

	it('a later successful navigation clears the load error', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.emit('did-fail-load', {}, -105, 'ERR_NAME_NOT_RESOLVED', 'https://www.youtube.com/', true)
		wc.emit('did-navigate', {}, 'https://www.youtube.com/', 200, 'OK')
		expect(h.host.getState().error).toBeNull()
	})
})

describe('ExploreViewHost proxy authentication', () => {
	type LoginCallback = ReturnType<typeof vi.fn>
	function login(wc: FakeViewInstance['webContents'], isProxy: boolean): {event: {preventDefault: ReturnType<typeof vi.fn>}; callback: LoginCallback} {
		const event = {preventDefault: vi.fn()}
		const callback = vi.fn()
		wc.emit('login', event, {url: 'https://www.youtube.com/'}, {isProxy, scheme: 'basic', host: 'proxy.example', port: 8080, realm: ''}, callback)
		return {event, callback}
	}

	it('answers a proxy challenge with the configured credentials', async () => {
		const h = makeHarness({settings: {proxyUrl: 'http://user:p%40ss@proxy.example:8080'}})
		await h.host.setVisible(true)
		const {event, callback} = login(onlyView().webContents, true)
		expect(event.preventDefault).toHaveBeenCalled()
		expect(callback).toHaveBeenCalledWith('user', 'p@ss')
	})

	it('never answers a site login', async () => {
		const h = makeHarness({settings: {proxyUrl: 'http://user:pass@proxy.example:8080'}})
		await h.host.setVisible(true)
		const {event, callback} = login(onlyView().webContents, false)
		expect(event.preventDefault).not.toHaveBeenCalled()
		expect(callback).not.toHaveBeenCalled()
	})

	it('leaves a proxy challenge alone when no credentials are configured', async () => {
		const h = makeHarness({settings: {proxyUrl: 'http://proxy.example:8080'}})
		await h.host.setVisible(true)
		const {event, callback} = login(onlyView().webContents, true)
		expect(event.preventDefault).not.toHaveBeenCalled()
		expect(callback).not.toHaveBeenCalled()
	})
})

describe('ExploreViewHost main window zoom', () => {
	it('scales the renderer rect by the main window zoom factor', async () => {
		const h = makeHarness()
		h.setZoomFactor(1.5)
		h.host.setBounds({x: 10, y: 20, width: 100, height: 50})
		await h.host.setVisible(true)
		expect(onlyView().setBounds).toHaveBeenLastCalledWith({x: 15, y: 30, width: 150, height: 75})

		h.setZoomFactor(0.8)
		h.host.setBounds({x: 10, y: 20, width: 100, height: 50})
		expect(onlyView().setBounds).toHaveBeenLastCalledWith({x: 8, y: 16, width: 80, height: 40})
	})
})

describe('ExploreViewHost and the main window reloading', () => {
	it('hides and mutes the view once the main window has committed a new page', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		h.host.setActive(true)
		const view = onlyView()

		h.mainCommit()

		expect(view.setVisible).toHaveBeenLastCalledWith(false)
		expect(view.webContents.setAudioMuted).toHaveBeenLastCalledWith(true)
		// The renderer that comes back shows it again through the usual calls.
		await h.host.setVisible(true)
		expect(view.setVisible).toHaveBeenLastCalledWith(true)
	})

	// The main window cancels every navigation its renderer starts (a dropped
	// link, a stray location change): did-start-navigation fires for those too,
	// before will-navigate cancels them, and the page stays.
	it('leaves the view shown and audible for a navigation the main window cancels', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		h.host.setActive(true)
		const view = onlyView()
		view.setVisible.mockClear()
		view.webContents.setAudioMuted.mockClear()

		h.mainStartNavigation({isMainFrame: true, isSameDocument: false})

		expect(view.setVisible).not.toHaveBeenCalled()
		expect(view.webContents.setAudioMuted).not.toHaveBeenCalled()
	})

	it('ignores in-page navigations of the main window', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const view = onlyView()
		view.setVisible.mockClear()

		h.mainInPage()
		h.mainStartNavigation({isMainFrame: true, isSameDocument: true})

		expect(view.setVisible).not.toHaveBeenCalled()
	})
})

describe('ExploreViewHost proxy failures', () => {
	it.each([
		[-130, 'ERR_PROXY_CONNECTION_FAILED'],
		[-111, 'ERR_TUNNEL_CONNECTION_FAILED'],
		[-127, 'ERR_PROXY_AUTH_REQUESTED'],
		[-115, 'ERR_PROXY_AUTH_UNSUPPORTED'],
		[-136, 'ERR_PROXY_CERTIFICATE_INVALID']
	])('reports a main-frame %i %s as the proxy error', async (code, name) => {
		const h = makeHarness()
		await h.host.setVisible(true)
		onlyView().webContents.emit('did-fail-load', {}, code, name, 'https://www.youtube.com/', true)
		expect(h.host.getState().error).toBe('proxy')
		expect(lastState(h.emit).error).toBe('proxy')
	})

	it('leaves a subframe proxy failure to the page', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		onlyView().webContents.emit('did-fail-load', {}, -130, 'ERR_PROXY_CONNECTION_FAILED', 'https://ads.example/', false)
		expect(h.host.getState().error).toBeNull()
	})

	it('re-applies a changed proxy setting at once and reports it when it is refused', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		h.session.whenReady.mockClear()
		h.session.whenReady.mockRejectedValueOnce(new Error('Explore proxy setting is not a usable proxy URL'))

		await h.host.applyProxySetting()

		expect(h.session.whenReady).toHaveBeenCalledTimes(1)
		expect(h.host.getState().error).toBe('proxy')
		expect(lastState(h.emit).error).toBe('proxy')
	})

	it('a proxy setting that applies leaves the page alone', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.loadURL.mockClear()

		await h.host.applyProxySetting()

		expect(h.host.getState().error).toBeNull()
		expect(wc.loadURL).not.toHaveBeenCalled()
	})

	it('touches no session before Explore has a view', async () => {
		const h = makeHarness()
		await h.host.applyProxySetting()
		expect(h.session.whenReady).not.toHaveBeenCalled()
		expect(h.session.getSession).not.toHaveBeenCalled()
	})
})

describe('ExploreViewHost audio', () => {
	it('starts muted until the Explore tab says it is active', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		expect(wc.setAudioMuted).toHaveBeenLastCalledWith(true)

		h.host.setActive(true)
		expect(wc.setAudioMuted).toHaveBeenLastCalledWith(false)
		h.host.setActive(false)
		expect(wc.setAudioMuted).toHaveBeenLastCalledWith(true)
	})

	it('a view created while the tab is active plays sound', async () => {
		const h = makeHarness()
		h.host.setActive(true)
		await h.host.setVisible(true)
		expect(onlyView().webContents.setAudioMuted).toHaveBeenLastCalledWith(false)
	})

	it('hiding the view for a dialog does not mute it', async () => {
		const h = makeHarness()
		h.host.setActive(true)
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.setAudioMuted.mockClear()

		await h.host.setVisible(false)

		expect(wc.setAudioMuted).not.toHaveBeenCalled()
	})
})

describe('ExploreViewHost.ownsWebContents', () => {
	it("recognises the view's own webContents only", async () => {
		const h = makeHarness()
		expect(h.host.ownsWebContents(h.window.webContents as never)).toBe(false)
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		expect(h.host.ownsWebContents(wc as never)).toBe(true)
		expect(h.host.ownsWebContents(h.window.webContents as never)).toBe(false)
		h.host.destroy()
		expect(h.host.ownsWebContents(wc as never)).toBe(false)
	})
})
