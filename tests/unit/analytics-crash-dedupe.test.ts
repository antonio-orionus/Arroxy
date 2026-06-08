import {beforeEach, describe, expect, it, vi} from 'vitest'

const {ctorMock, trackMock} = vi.hoisted(() => {
	const trackMock = vi.fn().mockResolvedValue(undefined)
	const identifyMock = vi.fn().mockResolvedValue(undefined)
	const setGlobalPropertiesMock = vi.fn()
	const ctorMock = vi.fn().mockImplementation(function () {
		return {track: trackMock, identify: identifyMock, setGlobalProperties: setGlobalPropertiesMock, api: {addHeader: vi.fn()}}
	})
	return {ctorMock, trackMock}
})

vi.mock('@openpanel/sdk', () => ({OpenPanel: ctorMock}))

import {setAnalyticsEnabled, setupAnalytics, trackCrashDetectedOncePerSession} from '@main/services/analytics.js'

beforeEach(() => {
	vi.clearAllMocks()
	delete process.env.ARROXY_ANALYTICS_DEBUG
})

describe('trackCrashDetectedOncePerSession', () => {
	it('emits a repeated identical child-process crash only once per session', () => {
		setupAnalytics('client-id', 'client-secret', false, 'install-id-test')
		setAnalyticsEnabled(true)

		trackCrashDetectedOncePerSession({kind: 'child', type: 'Utility', reason: 'crashed', name: 'Network Service'})
		trackCrashDetectedOncePerSession({kind: 'child', type: 'Utility', reason: 'crashed', name: 'Network Service'})

		expect(trackMock).toHaveBeenCalledTimes(1)
		expect(trackMock).toHaveBeenCalledWith('crash_detected', {type: 'Utility', reason: 'crashed'})
	})

	it('dedupes child-process crashes by type and reason even when names differ', () => {
		setupAnalytics('client-id', 'client-secret', false, 'install-id-test')
		setAnalyticsEnabled(true)

		trackCrashDetectedOncePerSession({kind: 'child', type: 'Utility', reason: 'crashed', name: 'Network Service'})
		trackCrashDetectedOncePerSession({kind: 'child', type: 'Utility', reason: 'crashed', name: 'Audio Service'})

		expect(trackMock).toHaveBeenCalledTimes(1)
	})

	it('dedupes renderer crashes by reason even when window roles differ', () => {
		setupAnalytics('client-id', 'client-secret', false, 'install-id-test')
		setAnalyticsEnabled(true)

		trackCrashDetectedOncePerSession({kind: 'renderer', windowRole: 'main-window', reason: 'crashed'})
		trackCrashDetectedOncePerSession({kind: 'renderer', windowRole: 'main-window', reason: 'crashed'})
		trackCrashDetectedOncePerSession({kind: 'renderer', windowRole: 'auxiliary-window', reason: 'crashed'})

		expect(trackMock).toHaveBeenCalledTimes(1)
		expect(trackMock).toHaveBeenCalledWith('crash_detected', {type: 'renderer', reason: 'crashed'})
	})

	it('does not poison the dedupe set while analytics is disabled or not started', () => {
		setupAnalytics('client-id', 'client-secret', false, 'install-id-test')
		setAnalyticsEnabled(false)

		const childCrash = {kind: 'child', type: 'Utility', reason: 'crashed', name: 'Network Service'} as const

		trackCrashDetectedOncePerSession(childCrash)
		expect(trackMock).not.toHaveBeenCalled()

		setAnalyticsEnabled(true)
		trackCrashDetectedOncePerSession(childCrash)
		expect(trackMock).toHaveBeenCalledTimes(1)

		vi.clearAllMocks()

		setupAnalytics(undefined, undefined, false, 'install-id-test')
		setAnalyticsEnabled(true)
		trackCrashDetectedOncePerSession(childCrash)
		expect(trackMock).not.toHaveBeenCalled()

		setupAnalytics('client-id', 'client-secret', false, 'install-id-test')
		setAnalyticsEnabled(true)
		trackCrashDetectedOncePerSession(childCrash)
		expect(trackMock).toHaveBeenCalledTimes(1)
	})

	it('clears the session dedupe state on fresh setupAnalytics()', () => {
		setupAnalytics('client-id', 'client-secret', false, 'install-id-test')
		setAnalyticsEnabled(true)

		const childCrash = {kind: 'child', type: 'Utility', reason: 'crashed', name: 'Network Service'} as const

		trackCrashDetectedOncePerSession(childCrash)
		expect(trackMock).toHaveBeenCalledTimes(1)

		setupAnalytics('client-id', 'client-secret', false, 'install-id-test')
		setAnalyticsEnabled(true)
		trackCrashDetectedOncePerSession(childCrash)

		expect(trackMock).toHaveBeenCalledTimes(2)
	})
})
