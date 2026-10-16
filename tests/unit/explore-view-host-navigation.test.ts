// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import log from 'electron-log/main.js'
import {views} from '../shared/exploreViewFakes.js'
import {makeHarness, navEvent, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// The view host's navigation wiring: every main-frame navigation, redirect
// and window.open goes through the navigation policy, and only a recent user
// input lets one leave the view for the system browser.

beforeEach(() => {
	views.length = 0
})

afterEach(() => {
	vi.useRealTimers()
})

describe('ExploreViewHost navigation policy wiring', () => {
	async function shown() {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.loadURL.mockClear()
		return {...h, wc}
	}

	it('lets allowlisted navigations through', async () => {
		const {wc, openExternal} = await shown()
		for (const event of ['will-frame-navigate', 'will-navigate', 'will-redirect'] as const) {
			const ev = navEvent('https://accounts.google.co.in/accounts/SetSID')
			wc.emit(event, ev)
			expect(ev.preventDefault).not.toHaveBeenCalled()
		}
		expect(openExternal).not.toHaveBeenCalled()
	})

	it('opens a clicked off-allowlist link in the system browser, not the view', async () => {
		const {wc, openExternal} = await shown()
		wc.emit('input-event', {}, {type: 'mouseUp'})
		const ev = navEvent('https://example.com/article')
		wc.emit('will-navigate', ev)
		expect(ev.preventDefault).toHaveBeenCalled()
		expect(openExternal).toHaveBeenCalledWith('https://example.com/article')
	})

	it('blocks a script-driven off-allowlist navigation with no recent user input', async () => {
		vi.useFakeTimers()
		const {wc, openExternal} = await shown()
		wc.emit('input-event', {}, {type: 'mouseUp'})
		vi.advanceTimersByTime(5_000)
		const ev = navEvent('https://example.com/')
		wc.emit('will-frame-navigate', ev)
		expect(ev.preventDefault).toHaveBeenCalled()
		expect(openExternal).not.toHaveBeenCalled()
	})

	it('pointer movement is not a user gesture', async () => {
		const {wc, openExternal} = await shown()
		wc.emit('input-event', {}, {type: 'mouseMove'})
		const ev = navEvent('https://example.com/')
		wc.emit('will-navigate', ev)
		expect(ev.preventDefault).toHaveBeenCalled()
		expect(openExternal).not.toHaveBeenCalled()
	})

	it('blocks a redirect off the allowlist and never hands it to the system browser', async () => {
		const {wc, openExternal} = await shown()
		wc.emit('input-event', {}, {type: 'mouseUp'})
		const ev = navEvent('https://example.com/landing?sidt=session-material')
		wc.emit('will-redirect', ev)
		expect(ev.preventDefault).toHaveBeenCalled()
		expect(openExternal).not.toHaveBeenCalled()
	})

	it('logs only the host of a blocked navigation', async () => {
		const {wc} = await shown()
		for (const fn of [log.info, log.warn, log.error, log.debug]) vi.mocked(fn).mockClear()
		wc.emit('will-redirect', navEvent('https://example.com/landing?sidt=session-material'))
		const logged = JSON.stringify([log.info, log.warn, log.error, log.debug].flatMap(fn => vi.mocked(fn).mock.calls))
		expect(logged).toContain('example.com')
		expect(logged).not.toContain('sidt')
		expect(logged).not.toContain('/landing')
	})

	it('leaves subframe navigations to the page', async () => {
		const {wc, openExternal} = await shown()
		const ev = navEvent('https://www.google.com/recaptcha/api2/anchor', false)
		wc.emit('will-frame-navigate', ev)
		wc.emit('will-redirect', ev)
		expect(ev.preventDefault).not.toHaveBeenCalled()
		expect(openExternal).not.toHaveBeenCalled()
	})

	it('never lets the page open a window', async () => {
		const {wc, openExternal} = await shown()
		const handler = wc.openHandler
		if (!handler) throw new Error('no window-open handler')
		wc.emit('input-event', {}, {type: 'mouseUp'})
		expect(handler({url: 'https://www.youtube.com/watch?v=abc'})).toEqual({action: 'deny'})
		expect(handler({url: 'https://example.com/'})).toEqual({action: 'deny'})
		expect(handler({url: 'javascript:alert(1)'})).toEqual({action: 'deny'})
		// The click was spent on the first external open: a second one needs a new click.
		expect(handler({url: 'https://example.org/'})).toEqual({action: 'deny'})
		await vi.waitFor(() => expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abc'))
		expect(openExternal).toHaveBeenCalledWith('https://example.com/')
		expect(openExternal).toHaveBeenCalledTimes(1)
		expect(wc.loadURL).toHaveBeenCalledTimes(1)
	})

	it('one click opens at most one link in the system browser', async () => {
		const {wc, openExternal} = await shown()
		wc.emit('input-event', {}, {type: 'mouseUp'})
		wc.emit('will-navigate', navEvent('https://example.com/a'))
		const second = navEvent('https://example.com/b')
		wc.emit('will-navigate', second)
		expect(second.preventDefault).toHaveBeenCalled()
		expect(openExternal).toHaveBeenCalledTimes(1)
		wc.emit('input-event', {}, {type: 'keyDown'})
		wc.emit('will-navigate', navEvent('https://example.com/c'))
		expect(openExternal).toHaveBeenCalledTimes(2)
	})

	it('a popup without user input opens nothing', async () => {
		const {wc, openExternal} = await shown()
		expect(wc.openHandler?.({url: 'https://example.com/'})).toEqual({action: 'deny'})
		expect(openExternal).not.toHaveBeenCalled()
	})

	it('drives history, reload and home on the view', async () => {
		const {host, wc} = await shown()
		wc.url = 'https://www.youtube.com/watch?v=abc'
		await host.navigate({kind: 'back'})
		await host.navigate({kind: 'forward'})
		await host.navigate({kind: 'reload'})
		await host.navigate({kind: 'home'})
		expect(wc.navigationHistory.goBack).toHaveBeenCalledTimes(1)
		expect(wc.navigationHistory.goForward).toHaveBeenCalledTimes(1)
		expect(wc.reload).toHaveBeenCalledTimes(1)
		expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
	})

	// P2-R45: a typed address loads through the proxy gate; typing it in the
	// app's own window is no input in the view, so it never opens anything in
	// the system browser, and it spends a click the page had just received.
	it('loads a typed site address once the proxy is ready, and counts it as no user gesture', async () => {
		const {host, wc, session, openExternal} = await shown()
		let ready: () => void = () => undefined
		session.whenReady.mockImplementationOnce(() => new Promise<void>(resolve => (ready = resolve)))
		wc.emit('input-event', {}, {type: 'mouseUp'})
		const navigating = host.navigate({kind: 'address', url: 'https://www.youtube.com/watch?v=typed'})
		expect(wc.loadURL).not.toHaveBeenCalled()
		ready()
		await navigating
		expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=typed')

		const ev = navEvent('https://example.com/elsewhere')
		wc.emit('will-navigate', ev)
		expect(ev.preventDefault).toHaveBeenCalled()
		expect(openExternal).not.toHaveBeenCalled()
	})

	// What loads is the parsed address, never the raw string that was checked.
	it('loads the normalised form of a typed address', async () => {
		const {host, wc} = await shown()
		await host.navigate({kind: 'address', url: 'https://WWW.YouTube.COM/watch?v=a b'})
		expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=a%20b')
	})

	it('refuses a typed address off the site even when it got past IPC', async () => {
		const {host, wc, openExternal} = await shown()
		for (const url of ['https://example.com/', 'http://www.youtube.com/', 'https://user:pw@www.youtube.com/', 'javascript:alert(1)', 'https://accounts.google.com/ServiceLogin', 'https://myaccount.google.com/', 'https://consent.youtube.com/m', 'https://consent.google.com/']) await host.navigate({kind: 'address', url})
		expect(wc.loadURL).not.toHaveBeenCalled()
		expect(openExternal).not.toHaveBeenCalled()
	})

	it('loads a typed address on the E2E override origin', async () => {
		const h = makeHarness({homeUrlOverride: 'http://127.0.0.1:4567/explore/home'})
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.loadURL.mockClear()
		await h.host.navigate({kind: 'address', url: 'http://127.0.0.1:4567/explore/next'})
		expect(wc.loadURL).toHaveBeenCalledWith('http://127.0.0.1:4567/explore/next')
		expect(h.host.addressScope.extraAllowedOrigin).toBe('http://127.0.0.1:4567')
	})

	// Typed, sign-in pages are refused; clicked on a page, they still load (the navigation allowlist).
	it('still lets a page navigate to sign-in', async () => {
		const {wc} = await shown()
		const ev = navEvent('https://accounts.google.com/ServiceLogin?continue=x')
		wc.emit('will-navigate', ev)
		expect(ev.preventDefault).not.toHaveBeenCalled()
	})

	it('allows the E2E override origin in the view', async () => {
		const h = makeHarness({homeUrlOverride: 'http://127.0.0.1:4567/explore/home'})
		await h.host.setVisible(true)
		const ev = navEvent('http://127.0.0.1:4567/explore/watch')
		onlyView().webContents.emit('will-navigate', ev)
		expect(ev.preventDefault).not.toHaveBeenCalled()
	})

	it('never runs script in the view', async () => {
		const {host, wc} = await shown()
		wc.url = 'https://accounts.google.com/ServiceLogin'
		wc.emit('did-navigate', {}, wc.url, 200, 'OK')
		await host.navigate({kind: 'reload'})
		wc.emit('did-stop-loading')
		expect(wc.executeJavaScript).not.toHaveBeenCalled()
	})
})

describe('ExploreViewHost window.open', () => {
	it('loads an allowlisted popup in the view only after a click', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.loadURL.mockClear()
		const handler = wc.openHandler
		if (!handler) throw new Error('no window-open handler')

		expect(handler({url: 'https://www.youtube.com/watch?v=pushed'})).toEqual({action: 'deny'})
		await Promise.resolve()
		expect(wc.loadURL).not.toHaveBeenCalled()

		wc.emit('input-event', {}, {type: 'mouseUp'})
		handler({url: 'https://www.youtube.com/watch?v=clicked'})
		await vi.waitFor(() => expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=clicked'))
		expect(wc.loadURL).toHaveBeenCalledTimes(1)
	})
})
