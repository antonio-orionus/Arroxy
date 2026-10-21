// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {routeHotkeyOutcome} from '@main/services/hotkeyFeedback.js'
import type {HotkeyWindow} from '@main/services/HotkeyService.js'
import {IPC_CHANNELS} from '@shared/ipc.js'

function fakeWindow(overrides: Partial<HotkeyWindow> = {}): HotkeyWindow & {send: ReturnType<typeof vi.fn>} {
	const send = vi.fn()
	return {isVisible: () => true, isFocused: () => true, isMinimized: () => false, isDestroyed: () => false, ...overrides, send}
}

describe('routeHotkeyOutcome', () => {
	it('forwards the event with the toast verdict attached', () => {
		const win = fakeWindow()
		routeHotkeyOutcome({outcome: 'queued'}, {lang: 'en', window: win, osNotifier: null, rendererReady: true})
		expect(win.send).toHaveBeenCalledWith(IPC_CHANNELS.eventsHotkeyOutcome, {outcome: 'queued', toast: true})
	})

	// The renderer can dedupe by intake: the ack and its follow-up name the same one.
	it('carries the intake the outcome belongs to', () => {
		const win = fakeWindow()
		routeHotkeyOutcome({outcome: 'submission-failed', intakeId: 'i1'}, {lang: 'en', window: win, osNotifier: null, rendererReady: true})
		expect(win.send).toHaveBeenCalledWith(IPC_CHANNELS.eventsHotkeyOutcome, {outcome: 'submission-failed', intakeId: 'i1', toast: true})
	})

	// A focused window that is reloading has no listener for the toast: the
	// follow-up of a press made before the reload would be lost.
	it('fires the OS notification for a focused window whose renderer is not ready', () => {
		const win = fakeWindow()
		const show = vi.fn()
		routeHotkeyOutcome({outcome: 'submission-failed', intakeId: 'i1'}, {lang: 'en', window: win, osNotifier: {show}, rendererReady: false})
		expect(winSendPayload(win)).toMatchObject({toast: false})
		expect(show).toHaveBeenCalledOnce()
	})

	it('does not fire the OS notification for a focused, on-screen window', () => {
		const show = vi.fn()
		routeHotkeyOutcome({outcome: 'queued'}, {lang: 'en', window: fakeWindow(), osNotifier: {show}, rendererReady: true})
		expect(show).not.toHaveBeenCalled()
	})

	it('fires the OS notification for a visible-but-unfocused window — the user is elsewhere', () => {
		const win = fakeWindow({isFocused: () => false})
		const show = vi.fn()
		routeHotkeyOutcome({outcome: 'queued'}, {lang: 'en', window: win, osNotifier: {show}, rendererReady: true})
		expect(winSendPayload(win)).toMatchObject({toast: false})
		expect(show).toHaveBeenCalledOnce()
	})

	it('fires the OS notification for a hidden window', () => {
		const win = fakeWindow({isVisible: () => false})
		const show = vi.fn()
		routeHotkeyOutcome({outcome: 'queued'}, {lang: 'en', window: win, osNotifier: {show}, rendererReady: true})
		expect(winSendPayload(win)).toMatchObject({toast: false})
		expect(show).toHaveBeenCalledOnce()
	})

	it('fires the OS notification for a minimized window', () => {
		const show = vi.fn()
		routeHotkeyOutcome({outcome: 'queued'}, {lang: 'en', window: fakeWindow({isMinimized: () => true}), osNotifier: {show}, rendererReady: true})
		expect(show).toHaveBeenCalledOnce()
	})

	it('drops the outcome silently when the window is gone', () => {
		const win = fakeWindow({isDestroyed: () => true})
		const show = vi.fn()
		routeHotkeyOutcome({outcome: 'queued'}, {lang: 'en', window: win, osNotifier: {show}, rendererReady: true})
		expect(win.send).not.toHaveBeenCalled()
		expect(show).not.toHaveBeenCalled()
	})
})

function winSendPayload(win: HotkeyWindow & {send: ReturnType<typeof vi.fn>}): unknown {
	return win.send.mock.calls[0]?.[1]
}
