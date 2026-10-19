// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import log from 'electron-log/main.js'
import {views} from '../shared/exploreViewFakes.js'
import {makeHarness, navEvent, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// The view host's navigation wiring: every main-frame navigation, redirect
// and window.open goes through the navigation policy. Any web page loads in
// the view; nothing is handed to the system browser.

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

	it.each(['https://accounts.google.co.in/accounts/SetSID', 'https://example.com/article', 'http://example.com/', 'https://login.microsoftonline.com/common/oauth2'])('lets a web navigation to %s through, clicked or not', async url => {
		const {wc} = await shown()
		for (const event of ['will-frame-navigate', 'will-navigate', 'will-redirect'] as const) {
			const ev = navEvent(url)
			wc.emit(event, ev)
			expect(ev.preventDefault).not.toHaveBeenCalled()
		}
	})

	it('blocks a main-frame navigation to a non-web scheme, even on a click', async () => {
		const {wc} = await shown()
		wc.emit('input-event', {}, {type: 'mouseUp'})
		for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'zoommtg://zoom.us/join?confno=1', 'mailto:someone@example.com']) {
			const ev = navEvent(url)
			wc.emit('will-navigate', ev)
			expect(ev.preventDefault).toHaveBeenCalled()
		}
	})

	it('logs only the host of a blocked navigation', async () => {
		const {wc} = await shown()
		for (const fn of [log.info, log.warn, log.error, log.debug]) vi.mocked(fn).mockClear()
		wc.emit('will-redirect', navEvent('zoommtg://zoom.us/join?pwd=session-material'))
		const logged = JSON.stringify([log.info, log.warn, log.error, log.debug].flatMap(fn => vi.mocked(fn).mock.calls))
		expect(logged).toContain('zoom.us')
		expect(logged).not.toContain('pwd')
		expect(logged).not.toContain('/join')
	})

	it('leaves subframe navigations to the page', async () => {
		const {wc} = await shown()
		const ev = navEvent('javascript:void(0)', false)
		wc.emit('will-frame-navigate', ev)
		wc.emit('will-redirect', ev)
		expect(ev.preventDefault).not.toHaveBeenCalled()
	})

	it('never lets the page open a window: a clicked web target loads in the view', async () => {
		const {wc} = await shown()
		const handler = wc.openHandler
		if (!handler) throw new Error('no window-open handler')
		wc.emit('input-event', {}, {type: 'mouseUp'})
		expect(handler({url: 'javascript:alert(1)'})).toEqual({action: 'deny'})
		expect(handler({url: 'https://example.com/'})).toEqual({action: 'deny'})
		await vi.waitFor(() => expect(wc.loadURL).toHaveBeenCalledWith('https://example.com/'))
		expect(wc.loadURL).toHaveBeenCalledTimes(1)
	})

	it('a popup without user input opens nothing', async () => {
		vi.useFakeTimers()
		const {wc} = await shown()
		wc.emit('input-event', {}, {type: 'mouseUp'})
		vi.advanceTimersByTime(5_000)
		expect(wc.openHandler?.({url: 'https://example.com/'})).toEqual({action: 'deny'})
		wc.emit('input-event', {}, {type: 'mouseMove'})
		expect(wc.openHandler?.({url: 'https://example.org/'})).toEqual({action: 'deny'})
		await Promise.resolve()
		expect(wc.loadURL).not.toHaveBeenCalled()
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

	it('loads a typed address once the proxy is ready', async () => {
		const {host, wc, session} = await shown()
		let ready: () => void = () => undefined
		session.whenReady.mockImplementationOnce(() => new Promise<void>(resolve => (ready = resolve)))
		const navigating = host.navigate({kind: 'address', url: 'https://www.youtube.com/watch?v=typed'})
		expect(wc.loadURL).not.toHaveBeenCalled()
		ready()
		await navigating
		expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=typed')
	})

	// What loads is the parsed address, never the raw string that was checked.
	it('loads the normalised form of a typed address', async () => {
		const {host, wc} = await shown()
		await host.navigate({kind: 'address', url: 'https://WWW.YouTube.COM/watch?v=a b'})
		expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=a%20b')
	})

	it.each(['https://example.com/', 'http://example.com/page', 'http://127.0.0.1:4567/explore/next'])('loads the typed address %s on another site', async url => {
		const {host, wc} = await shown()
		await host.navigate({kind: 'address', url})
		expect(wc.loadURL).toHaveBeenCalledWith(url)
	})

	it('refuses a typed address that is no web page, or a sign-in page, even when it got past IPC', async () => {
		const {host, wc} = await shown()
		for (const url of ['https://user:pw@www.youtube.com/', 'javascript:alert(1)', 'file:///etc/passwd', 'https://accounts.google.com/ServiceLogin', 'https://myaccount.google.com/', 'https://consent.youtube.com/m', 'https://consent.google.com/']) await host.navigate({kind: 'address', url})
		expect(wc.loadURL).not.toHaveBeenCalled()
	})

	// Typed, sign-in pages are refused; clicked on a page, they still load.
	it('still lets a page navigate to sign-in', async () => {
		const {wc} = await shown()
		const ev = navEvent('https://accounts.google.com/ServiceLogin?continue=x')
		wc.emit('will-navigate', ev)
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
	it('loads a popup in the view only after a click', async () => {
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
