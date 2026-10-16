// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views} from '../shared/exploreViewFakes.js'
import {makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// P2-R34 in the view host: the view opens on the stored last page, records the
// pages it commits (debounced), and forgets the page on sign-out.

const WATCH = 'https://www.youtube.com/watch?v=abc'
const OVERRIDE = 'http://127.0.0.1:4567/explore/home'

beforeEach(() => {
	views.length = 0
})

afterEach(() => {
	vi.useRealTimers()
})

describe('ExploreViewHost opening the last page', () => {
	it('opens the stored page instead of home', async () => {
		const h = makeHarness({settings: {exploreLastUrl: WATCH}})
		await h.host.setVisible(true)
		expect(onlyView().webContents.loadURL).toHaveBeenCalledWith(WATCH)
		expect(onlyView().webContents.loadURL).toHaveBeenCalledTimes(1)
	})

	it('opens home when the stored page is no site page', async () => {
		const h = makeHarness({settings: {exploreLastUrl: 'https://accounts.google.com/ServiceLogin'}})
		await h.host.setVisible(true)
		expect(onlyView().webContents.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
	})

	it('Home still opens home', async () => {
		const h = makeHarness({settings: {exploreLastUrl: WATCH}})
		await h.host.setVisible(true)
		await h.host.navigate({kind: 'home'})
		expect(onlyView().webContents.loadURL).toHaveBeenLastCalledWith('https://www.youtube.com/')
	})

	it('under the E2E home override, opens the override rather than a stored site page', async () => {
		const h = makeHarness({homeUrlOverride: OVERRIDE, settings: {exploreLastUrl: WATCH}})
		await h.host.setVisible(true)
		expect(onlyView().webContents.loadURL).toHaveBeenCalledWith(OVERRIDE)
	})

	it("under the E2E home override, reopens a page on the override's origin", async () => {
		const h = makeHarness({homeUrlOverride: OVERRIDE, settings: {exploreLastUrl: 'http://127.0.0.1:4567/next'}})
		await h.host.setVisible(true)
		expect(onlyView().webContents.loadURL).toHaveBeenCalledWith('http://127.0.0.1:4567/next')
	})
})

describe('ExploreViewHost recording the last page', () => {
	async function shown() {
		const h = makeHarness()
		await h.host.setVisible(true)
		vi.useFakeTimers()
		return {h, wc: onlyView().webContents}
	}

	it('stores committed site pages, debounced, including in-page navigations', async () => {
		const {h, wc} = await shown()
		wc.emit('did-navigate', {}, 'https://www.youtube.com/', 200, 'OK')
		wc.emit('did-navigate-in-page', {}, WATCH, true)
		expect(h.saveLastPage).not.toHaveBeenCalled()

		vi.runAllTimers()

		expect(h.saveLastPage).toHaveBeenCalledTimes(1)
		expect(h.settings().exploreLastUrl).toBe(WATCH)
	})

	it("ignores a subframe's in-page navigation and sign-in pages", async () => {
		const {h, wc} = await shown()
		wc.emit('did-navigate-in-page', {}, 'https://www.youtube.com/embed/x', false)
		wc.emit('did-navigate', {}, 'https://accounts.google.com/ServiceLogin?sidt=secret', 200, 'OK')
		vi.runAllTimers()
		expect(h.saveLastPage).not.toHaveBeenCalled()
	})

	it('writes a pending page when the window closes', async () => {
		const {h, wc} = await shown()
		wc.emit('did-navigate-in-page', {}, WATCH, true)
		h.closeWindow()
		expect(h.settings().exploreLastUrl).toBe(WATCH)
	})

	it('Sign out forgets the page, including one still pending', async () => {
		const h = makeHarness({settings: {exploreLastUrl: WATCH}})
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		vi.useFakeTimers()
		wc.emit('did-navigate-in-page', {}, 'https://www.youtube.com/feed/history', true)

		await h.host.signOut()
		expect(h.settings().exploreLastUrl).toBeUndefined()
		vi.runAllTimers()
		expect(h.settings().exploreLastUrl).toBeUndefined()
	})

	it('Sign out forgets a page the view commits while the session is being cleared', async () => {
		const h = makeHarness({settings: {exploreLastUrl: WATCH}})
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		vi.useFakeTimers()
		let clear: () => void = () => undefined
		h.session.signOut.mockReturnValueOnce(new Promise<void>(resolve => (clear = resolve)))

		const signingOut = h.host.signOut()
		// YouTube keeps navigating in-page while the storage is cleared.
		wc.emit('did-navigate-in-page', {}, 'https://www.youtube.com/feed/history', true)
		clear()
		await signingOut
		vi.runAllTimers()

		expect(h.settings().exploreLastUrl).toBeUndefined()
	})

	it('Sign out with no view forgets the page too', async () => {
		const h = makeHarness({settings: {exploreLastUrl: WATCH, exploreNoticeSeen: true}})
		await h.host.signOut()
		expect(views).toHaveLength(0)
		expect(h.settings().exploreLastUrl).toBeUndefined()
	})
})
