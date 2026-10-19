// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views, type FakeWebContents} from '../shared/exploreViewFakes.js'
import {lastState, makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// Idle unload in the view host: a while after the user leaves the Explore tab,
// an eligible page is closed (its memory goes with it), and coming back
// rebuilds the view in the same session at the same place in its history.
// Only leaving the tab counts: a dialog over the page never releases it.
// Off unless the user turns it on in Settings.

const DELAY = 10_000
const HOME = 'https://www.youtube.com/'
const SEARCH = 'https://www.youtube.com/results?search_query=cats'
const WATCH = 'https://www.youtube.com/watch?v=abc'
const CONSENT = 'https://consent.youtube.com/m?continue=https://www.youtube.com/'

beforeEach(() => {
	views.length = 0
})

afterEach(() => {
	vi.useRealTimers()
})

// Explore open on `history` (the last entry active), timers faked from here on.
const ON = {exploreIdleUnload: true}

async function browsing(history: string[] = [HOME, SEARCH], opts: Parameters<typeof makeHarness>[0] = {settings: ON}) {
	const h = makeHarness({idleUnloadDelayMs: DELAY, ...opts})
	h.host.setActive(true)
	await h.host.setVisible(true)
	const wc = onlyView().webContents
	wc.entries = [...history]
	wc.url = history.at(-1) ?? ''
	vi.useFakeTimers()
	return {h, wc}
}

type Harness = ReturnType<typeof makeHarness>

// What ExploreTab sends on unmount and ExploreViewport on its way out.
async function leave(h: Harness): Promise<void> {
	h.host.setActive(false)
	await h.host.setVisible(false)
}

async function comeBack(h: Harness): Promise<void> {
	h.host.setActive(true)
	await h.host.setVisible(true)
}

function unloaded(wc: FakeWebContents): boolean {
	return wc.destroyed
}

function secondView(): FakeWebContents {
	expect(views).toHaveLength(2)
	const view = views[1]
	if (!view) throw new Error('no second view')
	return view.webContents
}

describe('ExploreViewHost idle unload setting', () => {
	it('is off by default: a page left for any time stays', async () => {
		const {h, wc} = await browsing([HOME, SEARCH], {})
		await leave(h)
		vi.advanceTimersByTime(DELAY * 3)
		expect(unloaded(wc)).toBe(false)
	})

	it('turned on while the user is away, starts the full delay from then', async () => {
		const {h, wc} = await browsing([HOME, SEARCH], {})
		await leave(h)
		vi.advanceTimersByTime(DELAY * 2)
		h.setSettings(ON)
		h.host.applyIdleUnloadSetting()
		vi.advanceTimersByTime(DELAY - 1)
		expect(unloaded(wc)).toBe(false)
		vi.advanceTimersByTime(1)
		expect(unloaded(wc)).toBe(true)
	})

	it('turned on while the tab is shown, waits for the user to leave', async () => {
		const {h, wc} = await browsing([HOME, SEARCH], {})
		h.setSettings(ON)
		h.host.applyIdleUnloadSetting()
		vi.advanceTimersByTime(DELAY * 3)
		expect(unloaded(wc)).toBe(false)
	})

	it('turned off before the deadline, keeps the page', async () => {
		const {h, wc} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY - 1)
		h.setSettings({exploreIdleUnload: false})
		h.host.applyIdleUnloadSetting()
		vi.advanceTimersByTime(DELAY * 3)
		expect(unloaded(wc)).toBe(false)
	})
})

describe('ExploreViewHost idle unload timing', () => {
	it('keeps the page until the delay has passed, then closes it, letting the page answer beforeunload', async () => {
		const {h, wc} = await browsing()
		await leave(h)

		vi.advanceTimersByTime(DELAY - 1)
		expect(unloaded(wc)).toBe(false)

		vi.advanceTimersByTime(1)
		expect(wc.close).toHaveBeenCalledWith({waitForBeforeUnload: true})
		expect(unloaded(wc)).toBe(true)
		expect(h.window.contentView.removeChildView).toHaveBeenCalledWith(onlyView())
		expect(lastState(h.emit)).toMatchObject({url: '', canGoBack: false, loading: false})
	})

	it('coming back before the delay cancels it', async () => {
		const {h, wc} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY - 1)
		await comeBack(h)
		vi.advanceTimersByTime(DELAY * 3)
		expect(unloaded(wc)).toBe(false)
	})

	it('a repeated inactive notice does not push the deadline back', async () => {
		const {h, wc} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY / 2)
		await leave(h)
		vi.advanceTimersByTime(DELAY / 2)
		expect(unloaded(wc)).toBe(true)
	})

	it('leaving again after coming back starts a fresh full delay', async () => {
		const {h, wc} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY - 1)
		await comeBack(h)
		await leave(h)
		vi.advanceTimersByTime(DELAY - 1)
		expect(unloaded(wc)).toBe(false)
		vi.advanceTimersByTime(1)
		expect(unloaded(wc)).toBe(true)
	})

	it('a dialog hiding the page never releases it', async () => {
		const {h, wc} = await browsing()
		await h.host.setVisible(false)
		vi.advanceTimersByTime(DELAY * 3)
		expect(unloaded(wc)).toBe(false)
	})

	it('does nothing before the view was ever built', () => {
		vi.useFakeTimers()
		const h = makeHarness({idleUnloadDelayMs: DELAY, settings: ON})
		h.host.setActive(false)
		vi.advanceTimersByTime(DELAY * 3)
		expect(views).toHaveLength(0)
	})
})

describe('ExploreViewHost idle unload eligibility', () => {
	it('keeps a watch page, and does not check again until the user leaves again', async () => {
		const {h, wc} = await browsing([HOME, WATCH])
		await leave(h)
		vi.advanceTimersByTime(DELAY * 3)
		expect(unloaded(wc)).toBe(false)
		expect(wc.close).not.toHaveBeenCalled()
	})

	it('keeps a page playing media, and lets it go after a later leave once it stopped', async () => {
		const {h, wc} = await browsing()
		wc.emit('media-started-playing')
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		expect(unloaded(wc)).toBe(false)

		wc.emit('media-paused')
		await comeBack(h)
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		expect(unloaded(wc)).toBe(true)
	})

	it('a new document resets the media flag', async () => {
		const {h, wc} = await browsing()
		wc.emit('media-started-playing')
		wc.emit('did-navigate', {}, SEARCH, 200, 'OK')
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		expect(unloaded(wc)).toBe(true)
	})

	it('keeps a page still loading or showing a load error', async () => {
		const loading = await browsing()
		loading.wc.loading = true
		await leave(loading.h)
		vi.advanceTimersByTime(DELAY)
		expect(unloaded(loading.wc)).toBe(false)

		views.length = 0
		vi.useRealTimers()
		const failed = await browsing()
		failed.wc.emit('did-fail-load', {}, -105, 'ERR_NAME_NOT_RESOLVED', SEARCH, true)
		await leave(failed.h)
		vi.advanceTimersByTime(DELAY)
		expect(unloaded(failed.wc)).toBe(false)
	})

	it('a page that vetoes the close stays, owned and reusable, with no retry', async () => {
		const {h, wc} = await browsing()
		wc.beforeUnload = 'veto'
		await leave(h)
		vi.advanceTimersByTime(DELAY * 3)
		expect(wc.close).toHaveBeenCalledTimes(1)
		expect(h.window.contentView.removeChildView).not.toHaveBeenCalled()

		await comeBack(h)
		expect(views).toHaveLength(1)
		expect(onlyView().setVisible).toHaveBeenLastCalledWith(true)
		expect(h.host.getState().url).toBe(SEARCH)
	})
})

describe('ExploreViewHost coming back to an unloaded page', () => {
	it('rebuilds the view and restores its history instead of loading a page', async () => {
		const {h, wc} = await browsing([HOME, SEARCH, 'https://www.youtube.com/results?search_query=dogs'])
		wc.activeIndex = 1
		wc.url = SEARCH
		await leave(h)
		vi.advanceTimersByTime(DELAY)

		await comeBack(h)
		const next = secondView()
		expect(next.navigationHistory.restore).toHaveBeenCalledWith({entries: [HOME, SEARCH, 'https://www.youtube.com/results?search_query=dogs'].map(url => ({url, title: '', pageState: `state:${url}`})), index: 1})
		expect(next.loadURL).not.toHaveBeenCalled()
		expect(next.setAudioMuted).toHaveBeenCalledWith(false)
		expect(h.window.contentView.addChildView).toHaveBeenCalledTimes(2)
	})

	it('leaves sign-in and consent hops out of the restored history', async () => {
		const {h} = await browsing([CONSENT, HOME, 'https://accounts.google.com/ServiceLogin?sidt=secret', SEARCH])
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		await comeBack(h)
		expect(secondView().navigationHistory.restore).toHaveBeenCalledWith({entries: [HOME, SEARCH].map(url => ({url, title: '', pageState: `state:${url}`})), index: 1})
	})

	it('restores only once: a later rebuild opens the start page', async () => {
		const {h} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		await comeBack(h)
		h.setSettings({exploreEnabled: false})
		await h.host.setVisible(true)
		h.setSettings({exploreEnabled: true})
		await h.host.setVisible(true)
		expect(views).toHaveLength(3)
		const third = views[2]?.webContents
		expect(third?.navigationHistory.restore).not.toHaveBeenCalled()
		expect(third?.loadURL).toHaveBeenCalledTimes(1)
	})

	it('a rejected restore (a page aborting its own first load) is no unhandled error', async () => {
		const {h} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		h.host.setActive(true)
		const shown = h.host.setVisible(true)
		const next = secondView()
		next.navigationHistory.restore.mockReturnValueOnce(Promise.reject(new Error('ERR_ABORTED (-3)')))
		await shown
		await Promise.resolve()
		expect(lastState(h.emit).error).toBeNull()
	})

	it('an address typed while the view is rebuilt wins over the restore', async () => {
		const {h} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		h.host.setActive(true)
		const shown = h.host.setVisible(true)
		const typed = h.host.navigate({kind: 'address', url: WATCH})
		await Promise.all([shown, typed])
		const next = secondView()
		expect(next.navigationHistory.restore).not.toHaveBeenCalled()
		expect(next.loadURL).toHaveBeenCalledWith(WATCH)
	})

	it('a refused proxy restores nothing, and the history comes back once a setting applies', async () => {
		const {h} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		h.session.whenReady.mockImplementation(() => Promise.reject(new Error('proxy refused')))
		await comeBack(h)
		const next = secondView()
		expect(next.navigationHistory.restore).not.toHaveBeenCalled()
		expect(next.loadURL).not.toHaveBeenCalled()
		expect(lastState(h.emit).error).toBe('proxy')

		const ready = Promise.resolve()
		h.session.whenReady.mockImplementation(() => ready)
		await h.host.applyProxySetting()
		expect(next.navigationHistory.restore).toHaveBeenCalledTimes(1)
		expect(next.loadURL).not.toHaveBeenCalled()
	})

	it('sign-out while unloaded forgets the history: coming back opens home', async () => {
		const {h} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		await h.host.signOut()
		await comeBack(h)
		const next = secondView()
		expect(next.navigationHistory.restore).not.toHaveBeenCalled()
		expect(next.loadURL).toHaveBeenCalledWith(HOME)
	})

	it('turning Explore off while unloaded forgets the history', async () => {
		const {h} = await browsing()
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		h.setSettings({exploreEnabled: false})
		await comeBack(h)
		h.setSettings({exploreEnabled: true})
		await comeBack(h)
		const next = secondView()
		expect(next.navigationHistory.restore).not.toHaveBeenCalled()
		expect(next.loadURL).toHaveBeenCalledTimes(1)
	})
})

describe('ExploreViewHost with a close the page has not answered yet', () => {
	it('coming back meanwhile keeps the view; once it closes, exactly one view is rebuilt', async () => {
		const {h, wc} = await browsing()
		wc.beforeUnload = 'pending'
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		expect(wc.close).toHaveBeenCalledTimes(1)
		expect(h.window.contentView.removeChildView).not.toHaveBeenCalled()

		await comeBack(h)
		expect(views).toHaveLength(1)

		wc.finishClose()
		await vi.waitFor(() => expect(secondView().navigationHistory.restore).toHaveBeenCalledTimes(1))
		expect(views).toHaveLength(2)
	})

	it('a close that completes while the user is still away rebuilds nothing', async () => {
		const {h, wc} = await browsing()
		wc.beforeUnload = 'pending'
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		wc.finishClose()
		expect(views).toHaveLength(1)
		expect(h.window.contentView.removeChildView).toHaveBeenCalledTimes(1)
	})

	it('the window closing meanwhile ends it all: nothing is rebuilt', async () => {
		const {h, wc} = await browsing()
		wc.beforeUnload = 'pending'
		await leave(h)
		vi.advanceTimersByTime(DELAY)
		h.closeWindow()
		wc.finishClose()
		await h.host.setVisible(true)
		expect(views).toHaveLength(1)
	})

	it('the window closing cancels a pending deadline', async () => {
		const {h, wc} = await browsing()
		await leave(h)
		h.closeWindow()
		const closes = wc.close.mock.calls.length
		vi.advanceTimersByTime(DELAY * 3)
		expect(wc.close).toHaveBeenCalledTimes(closes)
	})
})
