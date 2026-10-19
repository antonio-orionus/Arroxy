// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {views} from '../shared/exploreViewFakes.js'
import {lastState, makeHarness, onlyView} from '../shared/exploreViewHostHarness.js'

vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

// P2-R36 in the view host: the blocker follows the setting from the first
// show on, a toggle reloads the page shown so it takes effect, and the
// renderer is told the blocker's status with the rest of the view state.

const WATCH = 'https://www.youtube.com/watch?v=abc'

beforeEach(() => {
	views.length = 0
})

describe('ExploreViewHost and the ad blocker', () => {
	it('an unset setting is off: the blocker is never started', async () => {
		const h = makeHarness()
		expect(h.settings().exploreAdBlock).toBeUndefined()
		await h.host.setVisible(true)
		expect(h.adBlock.apply).toHaveBeenCalledWith(false)
		expect(h.adBlock.apply).not.toHaveBeenCalledWith(true)
	})

	it('an explicit false stays off', async () => {
		const h = makeHarness({settings: {exploreAdBlock: false}})
		await h.host.setVisible(true)
		expect(h.adBlock.apply).toHaveBeenCalledWith(false)
		expect(h.adBlock.apply).not.toHaveBeenCalledWith(true)
	})

	it('applies the setting before the first page loads', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		let release: (changed: boolean) => void = () => undefined
		h.adBlock.apply.mockReturnValueOnce(new Promise<boolean>(resolve => (release = resolve)))

		const shown = h.host.setVisible(true)
		await vi.waitFor(() => expect(h.adBlock.apply).toHaveBeenCalledWith(true))
		expect(onlyView().webContents.loadURL).not.toHaveBeenCalled()
		release(true)
		await shown

		expect(onlyView().webContents.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
		expect(onlyView().webContents.reload).not.toHaveBeenCalled()
	})

	it('does not hold the first page for a blocker that takes long to start', async () => {
		vi.useFakeTimers()
		try {
			const h = makeHarness({settings: {exploreAdBlock: true}})
			h.adBlock.apply.mockReturnValueOnce(new Promise<boolean>(() => undefined))
			const shown = h.host.setVisible(true)
			await vi.advanceTimersByTimeAsync(5_000)
			await shown
			expect(onlyView().webContents.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
		} finally {
			vi.useRealTimers()
		}
	})

	it('a page typed during the blocker start wait is not overwritten by the start page', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		let release: (changed: boolean) => void = () => undefined
		h.adBlock.apply.mockReturnValueOnce(new Promise<boolean>(resolve => (release = resolve)))

		const shown = h.host.setVisible(true)
		await vi.waitFor(() => expect(h.adBlock.apply).toHaveBeenCalledWith(true))
		await h.host.navigate({kind: 'address', url: WATCH})
		release(false)
		await shown

		const loads = onlyView().webContents.loadURL.mock.calls.map(call => call[0])
		expect(loads).toEqual([WATCH])
	})

	it('a view destroyed and recreated during the blocker start wait gets exactly one start load', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		let releaseFirst: (changed: boolean) => void = () => undefined
		h.adBlock.apply.mockReturnValueOnce(new Promise<boolean>(resolve => (releaseFirst = resolve)))

		const first = h.host.setVisible(true)
		await vi.waitFor(() => expect(h.adBlock.apply).toHaveBeenCalledWith(true))
		h.host.destroy()
		const second = h.host.setVisible(true)
		await second
		releaseFirst(false)
		await first

		expect(views).toHaveLength(2)
		expect(views[0]?.webContents.loadURL).not.toHaveBeenCalled()
		expect(views[1]?.webContents.loadURL).toHaveBeenCalledTimes(1)
	})

	it('a blocker that starts after the page loaded reloads it', async () => {
		vi.useFakeTimers()
		try {
			const h = makeHarness({settings: {exploreAdBlock: true}})
			let release: (changed: boolean) => void = () => undefined
			h.adBlock.apply.mockReturnValueOnce(new Promise<boolean>(resolve => (release = resolve)))
			const shown = h.host.setVisible(true)
			await vi.advanceTimersByTimeAsync(5_000)
			await shown
			release(true)
			await vi.waitFor(() => expect(onlyView().webContents.reload).toHaveBeenCalledTimes(1))
		} finally {
			vi.useRealTimers()
		}
	})

	it('a toggle applies the new setting and reloads the page shown', async () => {
		const h = makeHarness({settings: {exploreAdBlock: false}})
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		await wc.loadURL(WATCH)
		h.setSettings({exploreAdBlock: true})
		h.adBlock.apply.mockResolvedValueOnce(true)

		await h.host.applyAdBlockSetting()

		expect(h.adBlock.apply).toHaveBeenLastCalledWith(true)
		expect(wc.reload).toHaveBeenCalledTimes(1)
	})

	it('a toggle that changes nothing (the blocker is unavailable) reloads nothing', async () => {
		const h = makeHarness({settings: {exploreAdBlock: false}})
		await h.host.setVisible(true)
		h.setSettings({exploreAdBlock: true})
		await h.host.applyAdBlockSetting()
		expect(onlyView().webContents.reload).not.toHaveBeenCalled()
	})

	it('a toggle reloads nothing while the proxy setting is refused', async () => {
		const h = makeHarness({settings: {exploreAdBlock: false}})
		await h.host.setVisible(true)
		const wc = onlyView().webContents
		await wc.loadURL(WATCH)
		h.session.whenReady.mockRejectedValue(new Error('refused'))
		await h.host.applyProxySetting()
		h.adBlock.apply.mockResolvedValueOnce(true)

		await h.host.applyAdBlockSetting()

		expect(wc.reload).not.toHaveBeenCalled()
		expect(h.host.getState().error).toBe('proxy')
	})

	it('before Explore has a view, a toggle starts nothing', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		await h.host.applyAdBlockSetting()
		expect(h.adBlock.apply).not.toHaveBeenCalled()
		expect(views).toHaveLength(0)
	})

	it('the kill switch unhooks the blocker from the partition', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		await h.host.setVisible(true)
		h.setSettings({exploreEnabled: false})
		await h.host.setVisible(true)
		expect(views[0]?.webContents.close).toHaveBeenCalled()
		expect(h.adBlock.apply).toHaveBeenLastCalledWith(false)
	})

	it('a closed window unhooks the blocker too', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		await h.host.setVisible(true)
		h.closeWindow()
		expect(h.adBlock.apply).toHaveBeenLastCalledWith(false)
	})

	it('without a view, an unset setting is off', () => {
		const h = makeHarness()
		expect(h.host.getState().adBlock).toBe('off')
	})

	it('without a view, the status follows the setting: off, or starting once a view opens', async () => {
		const h = makeHarness({settings: {exploreAdBlock: false}})
		expect(h.host.getState().adBlock).toBe('off')
		h.setSettings({exploreAdBlock: true})
		await h.host.applyAdBlockSetting()
		expect(h.host.getState().adBlock).toBe('starting')
		expect(lastState(h.emit).adBlock).toBe('starting')

		// After the kill switch the blocker itself is off, but the setting still is not.
		await h.host.setVisible(true)
		h.setAdBlockStatus('on')
		h.setSettings({exploreEnabled: false})
		await h.host.setVisible(true)
		h.setAdBlockStatus('off')
		expect(h.host.getState().adBlock).toBe('starting')
	})

	it('a proxy setting that applies retries a blocker left unavailable', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		await h.host.setVisible(true)
		h.setAdBlockStatus('unavailable')
		h.adBlock.apply.mockClear()

		await h.host.applyProxySetting()

		expect(h.adBlock.apply).toHaveBeenCalledWith(true)
	})

	it.each([
		['on', true],
		['off', false]
	] as const)('a proxy setting that applies leaves a blocker that is %s alone', async (status, setting) => {
		const h = makeHarness({settings: {exploreAdBlock: setting}})
		await h.host.setVisible(true)
		h.setAdBlockStatus(status)
		h.adBlock.apply.mockClear()

		await h.host.applyProxySetting()

		expect(h.adBlock.apply).not.toHaveBeenCalled()
	})

	it('a refused proxy setting retries nothing', async () => {
		const h = makeHarness({settings: {exploreAdBlock: true}})
		await h.host.setVisible(true)
		h.setAdBlockStatus('unavailable')
		h.adBlock.apply.mockClear()
		h.session.whenReady.mockRejectedValue(new Error('refused'))

		await h.host.applyProxySetting()

		expect(h.adBlock.apply).not.toHaveBeenCalled()
	})

	it("reports the blocker's status in the view state as it changes", async () => {
		const h = makeHarness({settings: {exploreAdBlock: false}})
		await h.host.setVisible(true)
		expect(h.host.getState().adBlock).toBe('off')

		h.setAdBlockStatus('unavailable')

		expect(lastState(h.emit).adBlock).toBe('unavailable')
		expect(h.host.getState().adBlock).toBe('unavailable')
	})
})
