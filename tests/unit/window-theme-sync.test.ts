import {describe, expect, it, vi} from 'vitest'
import {BOOT_SPLASH_DARK_BACKGROUND_COLOR, BOOT_SPLASH_LIGHT_BACKGROUND_COLOR, followsSystemTheme, watchSystemThemeBackground} from '../../src/main/windowPresentation.js'

function fakeNativeTheme(initialDark: boolean) {
	const listeners = new Set<() => void>()
	return {
		shouldUseDarkColors: initialDark,
		on(_event: 'updated', listener: () => void) {
			listeners.add(listener)
		},
		off(_event: 'updated', listener: () => void) {
			listeners.delete(listener)
		},
		emitUpdated(nextDark: boolean) {
			this.shouldUseDarkColors = nextDark
			for (const listener of listeners) listener()
		},
		get listenerCount() {
			return listeners.size
		}
	}
}

function fakeWindow() {
	return {
		destroyed: false,
		setBackgroundColor: vi.fn(),
		isDestroyed(): boolean {
			return this.destroyed
		}
	}
}

describe('followsSystemTheme', () => {
	it('treats an unset uiTheme as following the system', () => {
		// A fresh install writes no uiTheme key at all, so `undefined` is the
		// real first-run value, not a defensive branch.
		expect(followsSystemTheme(undefined)).toBe(true)
		expect(followsSystemTheme('system')).toBe(true)
	})

	it('does not follow the system once the user pins a theme', () => {
		expect(followsSystemTheme('light')).toBe(false)
		expect(followsSystemTheme('dark')).toBe(false)
	})
})

describe('watchSystemThemeBackground', () => {
	it('repaints the window when the desktop portal reports dark after startup', () => {
		// Cold start on Linux: xdg-desktop-portal is D-Bus activated, so the
		// first colour-scheme query loses the race and Electron reports light.
		// The portal answering later must still correct the window.
		const nativeTheme = fakeNativeTheme(false)
		const win = fakeWindow()

		watchSystemThemeBackground(win, nativeTheme, () => undefined)
		nativeTheme.emitUpdated(true)

		expect(win.setBackgroundColor).toHaveBeenCalledWith(BOOT_SPLASH_DARK_BACKGROUND_COLOR)
	})

	it('repaints back to light when the system leaves dark mode', () => {
		const nativeTheme = fakeNativeTheme(true)
		const win = fakeWindow()

		watchSystemThemeBackground(win, nativeTheme, () => 'system')
		nativeTheme.emitUpdated(false)

		expect(win.setBackgroundColor).toHaveBeenCalledWith(BOOT_SPLASH_LIGHT_BACKGROUND_COLOR)
	})

	it('leaves a user-pinned theme alone when the system flips', () => {
		const nativeTheme = fakeNativeTheme(false)
		const win = fakeWindow()

		watchSystemThemeBackground(win, nativeTheme, () => 'light')
		nativeTheme.emitUpdated(true)

		expect(win.setBackgroundColor).not.toHaveBeenCalled()
	})

	it('does not touch a destroyed window', () => {
		const nativeTheme = fakeNativeTheme(false)
		const win = fakeWindow()

		watchSystemThemeBackground(win, nativeTheme, () => 'system')
		win.destroyed = true
		nativeTheme.emitUpdated(true)

		expect(win.setBackgroundColor).not.toHaveBeenCalled()
	})

	it('notifies the renderer on every system change, including a pinned theme', () => {
		// The renderer resolves uiTheme itself, and Chromium does not fire a
		// prefers-color-scheme change when the portal answers late, so main is
		// the only reliable source of the update.
		const nativeTheme = fakeNativeTheme(false)
		const win = fakeWindow()
		const notify = vi.fn()

		watchSystemThemeBackground(win, nativeTheme, () => 'light', notify)
		nativeTheme.emitUpdated(true)

		expect(notify).toHaveBeenCalledWith(true)
		expect(win.setBackgroundColor).not.toHaveBeenCalled()
	})

	it('does not notify once the window is gone', () => {
		const nativeTheme = fakeNativeTheme(false)
		const win = fakeWindow()
		const notify = vi.fn()

		watchSystemThemeBackground(win, nativeTheme, () => 'system', notify)
		win.destroyed = true
		nativeTheme.emitUpdated(true)

		expect(notify).not.toHaveBeenCalled()
	})

	it('detaches its listener when disposed', () => {
		const nativeTheme = fakeNativeTheme(false)
		const win = fakeWindow()

		const dispose = watchSystemThemeBackground(win, nativeTheme, () => 'system')
		expect(nativeTheme.listenerCount).toBe(1)
		dispose()

		expect(nativeTheme.listenerCount).toBe(0)
		nativeTheme.emitUpdated(true)
		expect(win.setBackgroundColor).not.toHaveBeenCalled()
	})
})
