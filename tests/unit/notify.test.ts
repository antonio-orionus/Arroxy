import {afterEach, describe, expect, it, vi} from 'vitest'
import {notify, setNotificationSink} from '@renderer/lib/notify.js'

afterEach(() => {
	setNotificationSink(null)
	vi.restoreAllMocks()
})

describe('notification sink', () => {
	it('emits nothing when no sink is registered', () => {
		// Node-hosted tests import this module transitively and must not crash.
		vi.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => {
			notify.folderSelectFailed(new Error('boom'))
		}).not.toThrow()
	})

	it('forwards to a registered sink with a stable id', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.folderSelectFailed(new Error('boom'))
		expect(sink).toHaveBeenCalledTimes(1)
		expect(sink.mock.calls[0]?.[0]).toBe('error')
		expect(typeof sink.mock.calls[0]?.[2]).toBe('string')
	})

	it('still writes the console line, which is the diagnostic record', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		setNotificationSink(vi.fn())
		notify.folderSelectFailed(new Error('boom'))
		expect(error).toHaveBeenCalled()
	})
})
