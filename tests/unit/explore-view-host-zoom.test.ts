// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views} from '../shared/exploreViewFakes.js'
import {makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// The Explore page's zoom follows the exploreZoom setting: a new view starts at
// it, a settings change applies at once, and a navigation to another host (which
// Chromium zooms separately) gets it again.

beforeEach(() => {
	views.length = 0
})

describe('ExploreViewHost page zoom', () => {
	it('starts a new view at the stored zoom', async () => {
		const h = makeHarness({settings: {exploreZoom: 1.5}})
		await h.host.setVisible(true)
		expect(onlyView().webContents.setZoomFactor).toHaveBeenCalledWith(1.5)
	})

	it('starts at 100% when no zoom was set', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		expect(onlyView().webContents.setZoomFactor).toHaveBeenCalledWith(1)
	})

	it('applies a changed setting to the open view', async () => {
		const h = makeHarness()
		await h.host.setVisible(true)
		h.setSettings({exploreZoom: 0.8})
		h.host.applyZoomSetting()
		expect(onlyView().webContents.setZoomFactor).toHaveBeenLastCalledWith(0.8)
	})

	it('applies the zoom again after a navigation commits', async () => {
		const h = makeHarness({settings: {exploreZoom: 2}})
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		wc.setZoomFactor.mockClear()
		wc.emit('did-navigate', {}, 'https://www.youtube.com/watch?v=abc')
		expect(wc.setZoomFactor).toHaveBeenCalledWith(2)
	})

	it('does nothing without a view', () => {
		const h = makeHarness({settings: {exploreZoom: 2}})
		expect(() => h.host.applyZoomSetting()).not.toThrow()
	})
})
