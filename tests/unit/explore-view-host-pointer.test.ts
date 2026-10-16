// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views} from '../shared/exploreViewFakes.js'
import {makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// The pointer can move from a toolbar button straight onto the native view,
// and the renderer then never sees the button's mouseleave: a toolbar tooltip
// would stay open over the page. The host tells the renderer once each time
// the pointer enters the view, never on every move.

beforeEach(() => {
	views.length = 0
})

function mouse(type: 'mouseEnter' | 'mouseMove' | 'mouseDown' | 'mouseLeave'): void {
	onlyView().webContents.emit('before-mouse-event', {}, {type, x: 10, y: 10, modifiers: []})
}

describe('ExploreViewHost pointer', () => {
	it('signals once per entry into the view', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		await h.host.setVisible(true)

		mouse('mouseMove')
		mouse('mouseMove')
		mouse('mouseDown')
		expect(h.pointerEntered).toHaveBeenCalledTimes(1)

		mouse('mouseLeave')
		expect(h.pointerEntered).toHaveBeenCalledTimes(1)
		mouse('mouseEnter')
		mouse('mouseMove')
		expect(h.pointerEntered).toHaveBeenCalledTimes(2)
	})

	it('starts over with a new view', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		await h.host.setVisible(true)
		mouse('mouseMove')

		h.setSettings({exploreEnabled: false})
		await h.host.setVisible(true)
		h.setSettings({exploreEnabled: true})
		await h.host.setVisible(true)
		views.splice(0, 1)
		mouse('mouseMove')

		expect(h.pointerEntered).toHaveBeenCalledTimes(2)
	})

	// Hidden under an overlay, a dialog or another tab, the view may never see the pointer leave.
	it('signals again after the view was hidden and shown with the pointer over it', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		await h.host.setVisible(true)
		mouse('mouseMove')

		await h.host.setVisible(false)
		await h.host.setVisible(true)
		mouse('mouseMove')

		expect(h.pointerEntered).toHaveBeenCalledTimes(2)
	})

	it('treats mouseEnter as an entry even when no leave was seen', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		await h.host.setVisible(true)
		mouse('mouseMove')

		mouse('mouseEnter')
		mouse('mouseMove')

		expect(h.pointerEntered).toHaveBeenCalledTimes(2)
	})
})
