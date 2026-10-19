// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views} from '../shared/exploreViewFakes.js'
import {lastState, makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// What the view host tells the renderer: navigation state with no cookie
// data, the signed-in flag (cookie presence, or a verified sign-out), and the
// sign-out itself.

beforeEach(() => {
	views.length = 0
})

afterEach(() => {
	vi.useRealTimers()
})

describe('ExploreViewHost state', () => {
	it('reads a sign-in kept from an earlier launch without building the view', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		h.session.hasAuthCookies.mockResolvedValue(true)

		h.host.readSignedIn()

		await vi.waitFor(() => expect(lastState(h.emit).signedIn).toBe(true))
		expect(h.host.getState().signedIn).toBe(true)
		expect(h.window.contentView.addChildView).not.toHaveBeenCalled()
	})

	it('reads no sign-in while Explore was never opened', async () => {
		const h = makeHarness()
		h.session.hasAuthCookies.mockResolvedValue(true)

		h.host.readSignedIn()
		await Promise.resolve()

		expect(h.session.hasAuthCookies).not.toHaveBeenCalled()
		expect(h.host.getState().signedIn).toBe(false)
	})

	it('reads a stored sign-in with the Explore tab turned off, without building the view', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true, exploreEnabled: false}})
		h.session.hasAuthCookies.mockResolvedValue(true)

		h.host.readSignedIn()

		await vi.waitFor(() => expect(lastState(h.emit).signedIn).toBe(true))
		expect(views).toHaveLength(0)
	})

	it('signs out with the Explore tab turned off and no view', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true, exploreEnabled: false}})
		h.session.hasAuthCookies.mockResolvedValue(true)
		h.host.readSignedIn()
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))

		await h.host.signOut()

		expect(h.session.signOut).toHaveBeenCalledTimes(1)
		expect(lastState(h.emit).signedIn).toBe(false)
		expect(views).toHaveLength(0)
	})

	it('keeps the sign-in through the kill switch and a re-enable in the same launch', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		h.session.hasAuthCookies.mockResolvedValue(true)
		await h.host.setVisible(true)
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))

		h.setSettings({exploreEnabled: false})
		await h.host.setVisible(true)
		expect(views[0]?.webContents.close).toHaveBeenCalled()
		expect(lastState(h.emit).signedIn).toBe(true)

		h.setSettings({exploreEnabled: true})
		await h.host.setVisible(true)
		expect(views).toHaveLength(2)
		await vi.waitFor(() => expect(h.session.hasAuthCookies).toHaveBeenCalledTimes(2))
		expect(lastState(h.emit).signedIn).toBe(true)
	})

	it('a sign-in read at launch with the tab off survives turning the tab on', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true, exploreEnabled: false}})
		h.session.hasAuthCookies.mockResolvedValue(true)
		h.host.readSignedIn()
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))

		h.setSettings({exploreEnabled: true})
		await h.host.setVisible(true)

		expect(views).toHaveLength(1)
		expect(lastState(h.emit).signedIn).toBe(true)
	})

	it('emits navigation state with no cookie data', async () => {
		const h = makeHarness()
		h.session.hasAuthCookies.mockResolvedValue(true)
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.url = 'https://www.youtube.com/watch?v=abc'
		wc.title = 'A video - YouTube'
		wc.back = true
		wc.emit('did-navigate', {}, wc.url, 200, 'OK')
		await vi.waitFor(() => expect(lastState(h.emit).signedIn).toBe(true))

		const state = lastState(h.emit)
		expect(state).toEqual({url: 'https://www.youtube.com/watch?v=abc', title: 'A video - YouTube', canGoBack: true, canGoForward: false, loading: false, signedIn: true, error: null, adBlock: 'off'})
		expect(Object.keys(state).sort()).toEqual(['adBlock', 'canGoBack', 'canGoForward', 'error', 'loading', 'signedIn', 'title', 'url'])
		expect(JSON.stringify(h.emit.mock.calls)).not.toMatch(/secret-value|SID|SAPISID|cookie/i)
	})

	it('reports loading and title changes', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.loading = true
		wc.emit('did-start-loading')
		expect(lastState(h.emit).loading).toBe(true)
		wc.loading = false
		wc.title = 'Home'
		wc.emit('did-stop-loading')
		wc.emit('page-title-updated', {}, 'Home', true)
		expect(lastState(h.emit)).toMatchObject({loading: false, title: 'Home'})
	})

	it('getState returns a fresh snapshot', async () => {
		const h = makeHarness()
		const before = h.host.getState()
		before.url = 'mutated'
		expect(h.host.getState().url).toBe('')
	})

	it('refreshes signed-in on in-page navigation', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		h.session.hasAuthCookies.mockResolvedValue(true)
		onlyView().webContents.emit('did-navigate-in-page', {}, 'https://www.youtube.com/feed', true)
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))
		expect(h.session.hasAuthCookies).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'})
	})

	it('refreshes signed-in on site cookie changes, debounced', async () => {
		vi.useFakeTimers()
		const h = makeHarness()
		await h.host.setVisible(true)
		h.session.hasAuthCookies.mockClear()
		h.session.hasAuthCookies.mockResolvedValue(true)
		h.changeCookie('.youtube.com')
		h.changeCookie('.youtube.com')
		h.changeCookie('www.youtube.com')
		expect(h.session.hasAuthCookies).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(500)
		expect(h.session.hasAuthCookies).toHaveBeenCalledTimes(1)
		expect(h.host.getState().signedIn).toBe(true)
	})

	it('ignores cookie changes off the site', async () => {
		vi.useFakeTimers()
		const h = makeHarness()
		await h.host.setVisible(true)
		h.session.hasAuthCookies.mockClear()
		h.changeCookie('.doubleclick.net')
		await vi.advanceTimersByTimeAsync(1_000)
		expect(h.session.hasAuthCookies).not.toHaveBeenCalled()
	})

	it('a verified sign-out sticks over cookie presence until the site says signed in again', async () => {
		const h = makeHarness()
		h.session.hasAuthCookies.mockResolvedValue(true)
		await h.host.setVisible(true)
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))

		h.host.markSignedOutAfterVerify()
		expect(lastState(h.emit).signedIn).toBe(false)

		const wc = onlyView().webContents
		await vi.waitFor(() => expect(h.session.verifySignedIn).toHaveBeenCalledTimes(1))
		h.session.verifySignedIn.mockClear()
		h.session.verifySignedIn.mockResolvedValue('signedOut')
		wc.emit('did-navigate-in-page', {}, 'https://www.youtube.com/feed', true)
		// Sign-in hops are not the site: no check until the flow lands back on it.
		wc.emit('did-navigate', {}, 'https://accounts.google.com/ServiceLogin', 200, 'OK')
		wc.emit('did-navigate', {}, 'https://accounts.google.co.in/accounts/SetSID', 200, 'OK')
		expect(h.session.verifySignedIn).not.toHaveBeenCalled()
		wc.emit('did-navigate', {}, 'https://www.youtube.com/', 200, 'OK')
		await vi.waitFor(() => expect(h.session.verifySignedIn).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'}))
		await Promise.resolve()
		expect(h.host.getState().signedIn).toBe(false)

		h.session.verifySignedIn.mockResolvedValue('signedIn')
		wc.emit('did-navigate', {}, 'https://www.youtube.com/', 200, 'OK')
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))
	})

	it('a verified sign-out with no view yet is reported', () => {
		const h = makeHarness()
		h.host.markSignedOutAfterVerify()
		expect(lastState(h.emit).signedIn).toBe(false)
		expect(views).toHaveLength(0)
	})

	it('re-checks at once when marked, so a wrong mark corrects itself', async () => {
		const h = makeHarness()
		h.session.hasAuthCookies.mockResolvedValue(true)
		await h.host.setVisible(true)
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))
		h.session.verifySignedIn.mockResolvedValue('signedIn')

		h.host.markSignedOutAfterVerify()

		expect(h.session.verifySignedIn).toHaveBeenCalledWith({kind: 'site', siteId: 'youtube'})
		expect(h.emit.mock.calls.some(([state]) => !state.signedIn)).toBe(true)
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(true))
		// The mark is gone: cookie presence counts again.
		h.session.hasAuthCookies.mockResolvedValue(false)
		onlyView().webContents.emit('did-navigate-in-page', {}, 'https://www.youtube.com/feed', true)
		await vi.waitFor(() => expect(h.host.getState().signedIn).toBe(false))
	})

	it('keeps the mark when the immediate re-check says signed out or cannot tell', async () => {
		for (const verdict of ['signedOut', 'unknown'] as const) {
			views.length = 0
			const h = makeHarness()
			h.session.hasAuthCookies.mockResolvedValue(true)
			h.session.verifySignedIn.mockResolvedValue(verdict)
			await h.host.setVisible(true)
			h.host.markSignedOutAfterVerify()
			await vi.waitFor(() => expect(h.session.verifySignedIn).toHaveBeenCalled())
			onlyView().webContents.emit('did-navigate-in-page', {}, 'https://www.youtube.com/feed', true)
			await new Promise(resolve => setTimeout(resolve, 0))
			expect(h.host.getState().signedIn).toBe(false)
		}
	})

	it("never reports a sign-in URL's query or fragment", async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		for (const raw of ['https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fwww.youtube.com&sidt=secret#frag', 'https://accounts.youtube.com/accounts/SetSID?ssdc=1&sidt=secret', 'https://accounts.google.co.in/accounts/SetSID?sidt=secret']) {
			wc.url = raw
			wc.emit('did-navigate', {}, raw, 200, 'OK')
			expect(h.host.getState().url).not.toMatch(/[?#]|secret/)
			expect(lastState(h.emit).url).not.toMatch(/[?#]|secret/)
		}
		expect(h.host.getState().url).toBe('https://accounts.google.co.in/accounts/SetSID')
		wc.url = 'https://www.youtube.com/watch?v=abc&t=10#x'
		wc.emit('did-navigate', {}, wc.url, 200, 'OK')
		expect(h.host.getState().url).toBe('https://www.youtube.com/watch?v=abc&t=10#x')
	})
})

describe('ExploreViewHost.signOut', () => {
	it('clears the session and reloads home', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.loadURL.mockClear()
		await h.host.signOut()
		expect(h.session.signOut).toHaveBeenCalled()
		expect(wc.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
		expect(lastState(h.emit).signedIn).toBe(false)
	})

	it('signs out without creating a view', async () => {
		const h = makeHarness()
		await h.host.signOut()
		expect(h.session.signOut).toHaveBeenCalled()
		expect(views).toHaveLength(0)
	})
})
