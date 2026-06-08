// @vitest-environment node
import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import {EventEmitter} from 'node:events'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {QueueItem} from '@shared/types.js'
import type {QueueItemStatus} from '@shared/schemas.js'
import type {PreparedJob} from '@shared/types.js'

const mockTrayInstance = {setToolTip: vi.fn(), setContextMenu: vi.fn(), on: vi.fn(), destroy: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false)}

vi.mock('electron', () => {
	class MockTray {
		setToolTip = mockTrayInstance.setToolTip
		setContextMenu = mockTrayInstance.setContextMenu
		on = mockTrayInstance.on
		destroy = mockTrayInstance.destroy
		isDestroyed = mockTrayInstance.isDestroyed
	}
	const Menu = {buildFromTemplate: vi.fn().mockImplementation(items => ({_items: items}))}
	const nativeImage = {createFromPath: vi.fn().mockReturnValue({isEmpty: vi.fn().mockReturnValue(false)})}
	return {Tray: MockTray, Menu, nativeImage}
})

import {Menu, nativeImage} from 'electron'
import {TrayManager} from '@main/services/TrayManager.js'

class FakeQueueService extends EventEmitter {
	items: QueueItem[] = []
	snapshot(): QueueItem[] {
		return [...this.items]
	}
}

function makeItem(overrides: {id?: string; status: QueueItemStatus; progressPercent: number; finishedAt?: string}): QueueItem {
	return {
		id: overrides.id ?? 'item-1',
		url: 'https://youtube.com/watch?v=test',
		title: 'Test Video',
		thumbnail: '',
		outputDir: '/tmp',
		formatLabel: 'video',
		status: overrides.status,
		lane: 'normal',
		progressPercent: overrides.progressPercent,
		progressDetail: null,
		lastStatus: null,
		error: null,
		finishedAt: overrides.finishedAt ?? null,
		writeM3u: true,
		job: {} as PreparedJob
	}
}

function makeWindow(visible = true) {
	return {isDestroyed: vi.fn().mockReturnValue(false), isVisible: vi.fn().mockReturnValue(visible), show: vi.fn(), focus: vi.fn(), hide: vi.fn()}
}

function makeLanguageRef(lang: SupportedLang = 'en') {
	return {current: lang}
}

describe('TrayManager', () => {
	let qs: FakeQueueService
	let win: ReturnType<typeof makeWindow>
	let tray: TrayManager
	let onQuit: ReturnType<typeof vi.fn>

	beforeEach(() => {
		vi.useFakeTimers()
		vi.clearAllMocks()
		mockTrayInstance.setToolTip.mockReset()
		mockTrayInstance.setContextMenu.mockReset()
		mockTrayInstance.on.mockReset()
		mockTrayInstance.destroy.mockReset()
		mockTrayInstance.isDestroyed.mockReturnValue(false)
		qs = new FakeQueueService()
		win = makeWindow()
		onQuit = vi.fn()
		tray = new TrayManager(win as never, qs as never, makeLanguageRef(), onQuit as () => void)
		tray.start()
	})

	afterEach(() => {
		tray.destroy()
		vi.useRealTimers()
	})

	// --- status text ---

	it('initial menu shows Idle when no active downloads', () => {
		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		expect(calls.length).toBeGreaterThan(0)
		const items = calls[calls.length - 1][0]
		const header = items[0]
		expect(header.label).toContain('Idle')
		expect(header.enabled).toBe(false)
	})

	it('menu header shows count and percent after updated event with running item', () => {
		qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: 47})]
		qs.emit('updated', {item: qs.items[0]})

		vi.advanceTimersByTime(1100)

		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		const items = calls[calls.length - 1][0]
		expect(items[0].label).toMatch(/47/)
		expect(items[0].enabled).toBe(false)
	})

	it('shows aggregate percent for multiple running items', () => {
		qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: 40}), makeItem({id: 'j2', status: 'running', progressPercent: 80})]
		qs.emit('updated', {item: qs.items[0]})

		vi.advanceTimersByTime(1100)

		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		expect(calls[calls.length - 1][0][0].label).toMatch(/60/) // (40+80)/2
	})

	it('resets to Idle when updated event fires with done status', () => {
		// Running → progress shown
		qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: 50})]
		qs.emit('updated', {item: qs.items[0]})
		vi.advanceTimersByTime(1100)

		// Job completes — snapshot reflects done, event fires immediately
		const doneItem = makeItem({id: 'j1', status: 'done', progressPercent: 50, finishedAt: new Date().toISOString()})
		qs.items = [doneItem]
		qs.emit('updated', {item: doneItem})

		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		expect(calls[calls.length - 1][0][0].label).toContain('Idle')
	})

	it('resets to Idle when updated fires with error status', () => {
		qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: 30})]
		qs.emit('updated', {item: qs.items[0]})
		vi.advanceTimersByTime(1100)

		const errItem = makeItem({id: 'j1', status: 'error', progressPercent: 30})
		qs.items = [errItem]
		qs.emit('updated', {item: errItem})

		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		expect(calls[calls.length - 1][0][0].label).toContain('Idle')
	})

	it('rebuilds menu immediately for non-running status (no throttle needed)', () => {
		// Establish a running label first
		qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: 50})]
		qs.emit('updated', {item: qs.items[0]})
		vi.advanceTimersByTime(1100)

		// Job finishes — label changes Idle; must happen WITHOUT advancing timers
		const doneItem = makeItem({id: 'j1', status: 'done', progressPercent: 100, finishedAt: new Date().toISOString()})
		qs.items = [doneItem]
		const before = vi.mocked(Menu.buildFromTemplate).mock.calls.length
		qs.emit('updated', {item: doneItem})
		expect(vi.mocked(Menu.buildFromTemplate).mock.calls.length).toBeGreaterThan(before)
	})

	it('throttles running-item progress events — rebuilds once per second', () => {
		const item = makeItem({id: 'j1', status: 'running', progressPercent: 0})
		qs.items = [item]
		const before = vi.mocked(Menu.buildFromTemplate).mock.calls.length

		for (let i = 0; i < 20; i++) {
			qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: i * 5})]
			qs.emit('updated', {item: qs.items[0]})
		}

		expect(vi.mocked(Menu.buildFromTemplate).mock.calls.length - before).toBe(0)

		vi.advanceTimersByTime(1100)
		expect(vi.mocked(Menu.buildFromTemplate).mock.calls.length - before).toBe(1)
	})

	it('added event with running item shows download label', () => {
		const item = makeItem({id: 'j1', status: 'running', progressPercent: 25})
		qs.items = [item]
		qs.emit('added', {items: [item], atIdx: 0})
		vi.advanceTimersByTime(1100)
		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		expect(calls[calls.length - 1][0][0].label).toMatch(/25/)
	})

	it('removed event immediately resets label to Idle when last running item gone', () => {
		// Establish running label
		qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: 50})]
		qs.emit('updated', {item: qs.items[0]})
		vi.advanceTimersByTime(1100)

		// Remove — label must change immediately
		qs.items = []
		const before = vi.mocked(Menu.buildFromTemplate).mock.calls.length
		qs.emit('removed', {itemId: 'j1'})
		expect(vi.mocked(Menu.buildFromTemplate).mock.calls.length).toBeGreaterThan(before)
		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		expect(calls[calls.length - 1][0][0].label).toContain('Idle')
	})

	// --- window toggle ---

	it('toggleWindow hides window when visible', () => {
		win.isVisible.mockReturnValue(true)
		tray.toggleWindow()
		expect(win.hide).toHaveBeenCalledOnce()
		expect(win.show).not.toHaveBeenCalled()
	})

	it('toggleWindow shows and focuses when hidden', () => {
		win.isVisible.mockReturnValue(false)
		tray.toggleWindow()
		expect(win.show).toHaveBeenCalledOnce()
		expect(win.focus).toHaveBeenCalledOnce()
	})

	// --- destroy ---

	it('destroy removes all queueService listeners', () => {
		const before = qs.listenerCount('updated') + qs.listenerCount('added') + qs.listenerCount('removed')
		expect(before).toBeGreaterThan(0)
		tray.destroy()
		const after = qs.listenerCount('updated') + qs.listenerCount('added') + qs.listenerCount('removed')
		expect(after).toBe(0)
	})

	it('destroy calls tray.destroy() on the Electron Tray', () => {
		tray.destroy()
		expect(mockTrayInstance.destroy).toHaveBeenCalledOnce()
	})

	it('destroy clears any pending throttle timer', () => {
		qs.items = [makeItem({id: 'j1', status: 'running', progressPercent: 30})]
		qs.emit('updated', {item: qs.items[0]})
		tray.destroy()
		const countBefore = vi.mocked(Menu.buildFromTemplate).mock.calls.length
		vi.advanceTimersByTime(2000)
		expect(vi.mocked(Menu.buildFromTemplate).mock.calls.length).toBe(countBefore)
	})

	// --- quit callback ---

	it('quit menu item invokes the onQuit callback', () => {
		const calls = vi.mocked(Menu.buildFromTemplate).mock.calls
		const items = calls[calls.length - 1][0] as {label?: string; click?: () => void}[]
		const quitItem = items.find(i => i.label?.includes('Quit'))
		expect(quitItem).toBeDefined()
		expect(quitItem!.click).toBeDefined()
		quitItem!.click!()
		expect(onQuit).toHaveBeenCalledOnce()
	})

	// --- tray icon creation ---

	it('creates Tray and sets tooltip', () => {
		expect(nativeImage.createFromPath).toHaveBeenCalled()
		expect(mockTrayInstance.setToolTip).toHaveBeenCalledWith(expect.any(String))
	})
})
