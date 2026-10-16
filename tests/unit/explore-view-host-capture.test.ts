// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {fakeImage, views} from '../shared/exploreViewFakes.js'
import {makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// P2-R35: a picture of the shown page, for the renderer to put in its place
// while an overlay hides the view. A JPEG at the display's scale factor (the
// capture's own device pixels), so it is sharp on HiDPI and quick to encode.

function jpegOf(width: number): string {
	return `data:image/jpeg;base64,${Buffer.from(`w${width}q85`).toString('base64')}`
}

beforeEach(() => {
	views.length = 0
})

async function shownAt(width: number) {
	const h = makeHarness()
	h.host.setBounds({x: 0, y: 40, width, height: 500})
	await h.host.setVisible(true)
	return {h, wc: onlyView().webContents}
}

describe('ExploreViewHost.capture', () => {
	it('captures the shown page as a quality-85 JPEG data URL at full device resolution', async () => {
		// An 800 DIP view on a 2x display: 1600 device px, kept as captured.
		const {h, wc} = await shownAt(800)
		wc.capturePage.mockResolvedValue(fakeImage(1600, 1000))

		expect(await h.host.capture()).toBe(jpegOf(1600))
	})

	it('has nothing to capture before the view exists, while it is hidden, or behind an error', async () => {
		const h = makeHarness()
		expect(await h.host.capture()).toBeNull()

		await h.host.setVisible(true)
		const wc = onlyView().webContents
		await h.host.setVisible(false)
		expect(await h.host.capture()).toBeNull()

		await h.host.setVisible(true)
		wc.emit('did-fail-load', {}, -105, 'ERR_NAME_NOT_RESOLVED', 'https://www.youtube.com/', true)
		expect(await h.host.capture()).toBeNull()
		expect(wc.capturePage).not.toHaveBeenCalled()
	})

	it('answers null when the capture fails or comes back empty', async () => {
		const {h, wc} = await shownAt(800)
		wc.capturePage.mockRejectedValueOnce(new Error('GPU process gone'))
		expect(await h.host.capture()).toBeNull()

		wc.capturePage.mockResolvedValueOnce(fakeImage(0, 0, true))
		expect(await h.host.capture()).toBeNull()
	})
})
