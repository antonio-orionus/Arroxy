// @vitest-environment jsdom

import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {installBrowserMock} from '@renderer/browserMock.js'
import type {AppApi} from '@shared/api.js'

describe('browser mock updater events', () => {
	afterEach(() => {
		vi.useRealTimers()
		delete (window as unknown as {appApi?: AppApi}).appApi
		delete (window as unknown as {appVersion?: string}).appVersion
	})

	it('does not emit a scheduled scenario update after unsubscribe', () => {
		vi.useFakeTimers()
		window.history.replaceState(null, '', '/?scenario=update-direct')
		installBrowserMock()
		const listener = vi.fn()

		const unsubscribe = window.appApi.updater.onUpdateAvailable(listener)
		unsubscribe()
		vi.advanceTimersByTime(250)

		expect(listener).not.toHaveBeenCalled()
	})

	// The mock stands in for main's hotkey intake: Test takes a link in as the
	// hotkey and acknowledges it as a focused-window toast.
	it('acknowledges a Test press through the hotkey outcome toast', async () => {
		installBrowserMock()
		const listener = vi.fn()
		window.appApi.events.onHotkeyOutcome(listener)

		await window.appApi.hotkey.testPress()

		expect(listener).toHaveBeenCalledOnce()
		expect(listener).toHaveBeenCalledWith({outcome: 'queued', intakeId: expect.any(String), toast: true})
	})
})
