// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views} from '../shared/exploreViewFakes.js'
import {lastState, makeHarness, navEvent, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// A refused proxy setting fails closed: the session keeps its old route until
// the setting is fixed, so the open page is stopped and replaced by a blank
// one rather than left running behind the error screen. Only a proxy that
// applies brings the page back.

const WATCH = 'https://www.youtube.com/watch?v=abc'
const REFUSED = new Error('Explore proxy setting is not a usable proxy URL')

beforeEach(() => {
	views.length = 0
})

// A view on a watch page, then a proxy setting the session refuses.
async function refusedOnWatchPage() {
	const h = makeHarness()
	await h.host.setVisible(true)
	const wc = onlyView().webContents
	await wc.loadURL(WATCH)
	wc.emit('did-navigate', {}, WATCH, 200, 'OK')
	wc.loadURL.mockClear()
	h.session.whenReady.mockRejectedValue(REFUSED)
	await h.host.applyProxySetting()
	return {h, wc}
}

describe('ExploreViewHost when the proxy setting is refused', () => {
	it('stops the page and blanks it behind the proxy error', async () => {
		const {h, wc} = await refusedOnWatchPage()

		expect(wc.stop).toHaveBeenCalled()
		expect(wc.loadURL).toHaveBeenCalledWith('about:blank')
		expect(h.host.getState()).toMatchObject({error: 'proxy', url: ''})
		expect(lastState(h.emit).error).toBe('proxy')
	})

	it('has nothing to stop when no page has loaded yet', async () => {
		const h = makeHarness()
		h.session.whenReady.mockRejectedValue(REFUSED)
		await h.host.setVisible(true)
		const wc = onlyView().webContents

		await h.host.applyProxySetting()

		expect(wc.stop).not.toHaveBeenCalled()
		expect(wc.loadURL).not.toHaveBeenCalled()
		expect(h.host.getState().error).toBe('proxy')
	})

	it('keeps the proxy error through a committed navigation while the setting is still refused', async () => {
		const {h, wc} = await refusedOnWatchPage()

		wc.emit('did-navigate', {}, 'about:blank', 200, 'OK')
		wc.emit('did-navigate', {}, 'https://www.youtube.com/feed', 200, 'OK')

		expect(h.host.getState().error).toBe('proxy')
		expect(lastState(h.emit).error).toBe('proxy')
	})

	it('keeps the proxy error through a main-frame load failure while the setting is still refused', async () => {
		const {h, wc} = await refusedOnWatchPage()

		wc.emit('did-fail-load', {}, -105, 'ERR_NAME_NOT_RESOLVED', 'https://www.youtube.com/feed', true)

		expect(h.host.getState().error).toBe('proxy')
		expect(lastState(h.emit).error).toBe('proxy')
	})

	it('keeps the proxy error when the blanked page renderer goes away', async () => {
		const {h, wc} = await refusedOnWatchPage()

		wc.emit('render-process-gone', {}, {reason: 'crashed', exitCode: 1})

		expect(h.host.getState().error).toBe('proxy')
		expect(lastState(h.emit).error).toBe('proxy')
	})

	it('a sign-out while the setting is refused forgets the page it was on: the next good load goes home', async () => {
		const {h, wc} = await refusedOnWatchPage()

		await h.host.signOut()
		h.session.whenReady.mockReturnValue(Promise.resolve())
		await h.host.applyProxySetting()

		expect(wc.loadURL).toHaveBeenLastCalledWith('https://www.youtube.com/')
		expect(wc.loadURL).not.toHaveBeenCalledWith(WATCH)
	})

	it('lets no page-initiated navigation through while the setting is refused', async () => {
		const {wc} = await refusedOnWatchPage()
		wc.emit('input-event', {}, {type: 'mouseUp'})

		const nav = navEvent('https://www.youtube.com/feed')
		wc.emit('will-frame-navigate', nav)
		wc.emit('will-navigate', nav)

		expect(nav.preventDefault).toHaveBeenCalled()
	})

	it('a setting that applies later clears the error and reloads the page it was on', async () => {
		const {h, wc} = await refusedOnWatchPage()
		h.session.whenReady.mockReturnValue(Promise.resolve())

		await h.host.applyProxySetting()

		expect(wc.loadURL).toHaveBeenLastCalledWith(WATCH)
		expect(h.host.getState().error).toBeNull()
		wc.emit('did-navigate', {}, WATCH, 200, 'OK')
		expect(h.host.getState()).toMatchObject({error: null, url: WATCH})
		// The blank page is no history entry to go Back to.
		expect(wc.entries).not.toContain('about:blank')
	})

	it('Retry once the setting is fixed reloads the page it was on', async () => {
		const {h, wc} = await refusedOnWatchPage()
		await h.host.navigate({kind: 'reload'})
		expect(wc.loadURL).toHaveBeenCalledTimes(1)
		expect(h.host.getState().error).toBe('proxy')

		h.session.whenReady.mockReturnValue(Promise.resolve())
		await h.host.navigate({kind: 'reload'})

		expect(wc.loadURL).toHaveBeenLastCalledWith(WATCH)
		expect(wc.reload).not.toHaveBeenCalled()
		expect(h.host.getState().error).toBeNull()
	})
})
