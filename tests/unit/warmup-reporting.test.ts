// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {holdQuitForWarmupReport, warmupReportCollector, WARMUP_REPORT_QUIT_BUDGET_MS} from '@main/warmupReporting.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

type Listener = (event: {preventDefault: () => void}) => void

function fakeApp() {
	const listeners: Record<string, Listener[]> = {}
	const app = {
		on: vi.fn((event: string, listener: Listener) => {
			;(listeners[event] ??= []).push(listener)
			return app
		}),
		exit: vi.fn()
	}
	const fire = (event: string): {prevented: boolean} => {
		const outcome = {prevented: false}
		for (const listener of listeners[event] ?? []) listener({preventDefault: () => void (outcome.prevented = true)})
		return outcome
	}
	return {app, fire}
}

afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllEnvs()
	vi.resetModules()
})

describe('warmupReportCollector', () => {
	it("uses the heartbeat's collector while the warmup report flag is on", () => {
		expect(warmupReportCollector('https://stats.example.test/collect')).toBe('https://stats.example.test/collect')
		expect(warmupReportCollector(undefined)).toBeUndefined()
	})

	it('reports nowhere in a release build', async () => {
		const {warmupReportCollector: inRelease} = await importWithReleaseFlagsOff(() => import('@main/warmupReporting.js'))
		expect(inRelease('https://stats.example.test/collect')).toBeUndefined()
	})
})

describe('holdQuitForWarmupReport', () => {
	it('lets the app quit at once when no warmup is downloading', () => {
		const {app, fire} = fakeApp()
		holdQuitForWarmupReport(app, {quit: () => null})
		fire('before-quit')
		expect(fire('will-quit').prevented).toBe(false)
		expect(app.exit).not.toHaveBeenCalled()
	})

	it('holds the quit until the quit report is sent', async () => {
		const {app, fire} = fakeApp()
		let sent!: () => void
		holdQuitForWarmupReport(app, {quit: () => new Promise<void>(resolve => (sent = resolve))})
		fire('before-quit')
		expect(fire('will-quit').prevented).toBe(true)
		expect(app.exit).not.toHaveBeenCalled()
		sent()
		await vi.waitFor(() => expect(app.exit).toHaveBeenCalledWith(0))
	})

	it('quits even when the quit report fails', async () => {
		const {app, fire} = fakeApp()
		holdQuitForWarmupReport(app, {quit: () => Promise.reject(new Error('disk full'))})
		fire('before-quit')
		expect(fire('will-quit').prevented).toBe(true)
		await vi.waitFor(() => expect(app.exit).toHaveBeenCalledWith(0))
	})

	it('quits anyway once its budget runs out', async () => {
		vi.useFakeTimers()
		const {app, fire} = fakeApp()
		holdQuitForWarmupReport(app, {quit: () => new Promise<void>(() => undefined)})
		fire('before-quit')
		expect(fire('will-quit').prevented).toBe(true)
		await vi.advanceTimersByTimeAsync(WARMUP_REPORT_QUIT_BUDGET_MS)
		expect(app.exit).toHaveBeenCalledWith(0)
	})
})
