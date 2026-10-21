// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views, type FakeWebContents} from '../shared/exploreViewFakes.js'
import {lastState, makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// The page's contents going away outside idle unload (the page closing
// itself, or Electron destroying them): the view is released and a fresh one
// opens, as after an idle unload. A crashed renderer keeps its contents: the
// page error's Retry reloads it in place.

const HOME = 'https://www.youtube.com/'
const SEARCH = 'https://www.youtube.com/results?search_query=cats'

beforeEach(() => {
	views.length = 0
})

// Explore open on the search results, with Back enabled.
async function browsing() {
	const h = makeHarness()
	h.host.setActive(true)
	await h.host.setVisible(true)
	const wc = onlyView().webContents
	wc.entries = [HOME, SEARCH]
	wc.url = SEARCH
	wc.back = true
	wc.emit('did-navigate', {}, SEARCH, 200, 'OK')
	expect(lastState(h.emit)).toMatchObject({url: SEARCH, canGoBack: true})
	return {h, wc}
}

function secondView(): FakeWebContents {
	expect(views).toHaveLength(2)
	const view = views[1]
	if (!view) throw new Error('no second view')
	return view.webContents
}

describe('ExploreViewHost contents gone', () => {
	it('contents gone while shown: the view is released and a fresh one opens on the start page', async () => {
		const {h, wc} = await browsing()
		const first = onlyView()
		first.dropContentsWhenDestroyed()

		wc.finishClose()
		await vi.waitFor(() => expect(views).toHaveLength(2))

		expect(h.window.contentView.removeChildView).toHaveBeenCalledWith(first)
		expect(h.emit.mock.calls.some(([state]) => state.url === '' && !state.canGoBack)).toBe(true)
		await vi.waitFor(() => expect(secondView().loadURL).toHaveBeenCalledWith(SEARCH))
		expect(lastState(h.emit)).toMatchObject({url: SEARCH, canGoBack: false})
	})

	it('contents gone while away: no page is reported, and the next visit opens a fresh view', async () => {
		const {h, wc} = await browsing()
		h.host.setActive(false)
		await h.host.setVisible(false)

		wc.finishClose()

		expect(h.window.contentView.removeChildView).toHaveBeenCalledWith(views[0])
		expect(lastState(h.emit)).toMatchObject({url: '', canGoBack: false, canGoForward: false, loading: false})
		expect(views).toHaveLength(1)
		await expect(h.host.navigate({kind: 'back'})).resolves.toBeUndefined()

		h.host.setActive(true)
		await h.host.setVisible(true)
		expect(secondView().loadURL).toHaveBeenCalledWith(SEARCH)
	})

	it('a crashed renderer keeps its view and history: Retry reloads the page in place', async () => {
		const {h, wc} = await browsing()

		wc.emit('render-process-gone', {}, {reason: 'oom', exitCode: 1})
		expect(lastState(h.emit)).toMatchObject({error: 'load', url: SEARCH, canGoBack: true})

		await h.host.navigate({kind: 'reload'})
		expect(wc.reload).toHaveBeenCalledTimes(1)
		expect(views).toHaveLength(1)
		expect(lastState(h.emit).error).toBeNull()
	})
})
