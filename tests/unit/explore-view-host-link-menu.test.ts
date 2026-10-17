// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views} from '../shared/exploreViewFakes.js'
import {makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// A right-click in the page hands the link under the pointer (or none) to the
// link menu; the page itself gets no say in what the menu offers.

beforeEach(() => {
	views.length = 0
})

function rightClick(linkURL: string): void {
	onlyView().webContents.emit('context-menu', {}, {linkURL, linkText: 'ignored', x: 10, y: 10})
}

describe('ExploreViewHost link menu', () => {
	it('passes the right-clicked link to the link menu, and an empty link when there is none', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		await h.host.setVisible(true)

		rightClick('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
		rightClick('')

		expect(h.linkMenu.mock.calls).toEqual([['https://www.youtube.com/watch?v=dQw4w9WgXcQ'], ['']])
	})

	it('opens no menu over a page a refused proxy blanked', async () => {
		const h = makeHarness({settings: {exploreNoticeSeen: true}})
		await h.host.setVisible(true)
		h.session.whenReady.mockRejectedValue(new Error('refused'))
		await h.host.applyProxySetting()

		rightClick('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

		expect(h.linkMenu).not.toHaveBeenCalled()
	})
})
