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

describe('which failures reach the user', () => {
	it('raises a notification for each user-actionable failure', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		const sink = vi.fn()
		setNotificationSink(sink)

		notify.settingsSaveFailed('share', new Error('x'))
		notify.warmupFailed('repair failed', new Error('x'))
		notify.shellActionFailed('open', new Error('x'))
		notify.folderSelectFailed(new Error('x'))
		notify.playlistFolderRejected('/tmp/x')
		notify.filenameBudgetFailed('path-too-deep', '/tmp/x')

		expect(sink).toHaveBeenCalledTimes(6)
	})

	it('does not notify for a shortened filename', () => {
		// Trimming a long title to fit is routine and happens on a large share of
		// downloads. Surfacing it would teach users to ignore the surface.
		vi.spyOn(console, 'info').mockImplementation(() => {})
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.filenameShortened('Some very long title', ['title'])
		expect(sink).not.toHaveBeenCalled()
	})

	it('passes an already-localized clipboard message straight through', () => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.clipboardAutofilled('Filled 3 links from your clipboard')
		expect(sink).toHaveBeenCalledWith('info', 'Filled 3 links from your clipboard', expect.any(String))
	})

	it('collapses repeated warmup failures under one id', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.warmupFailed('repair failed', new Error('x'))
		notify.warmupFailed('repair threw', new Error('y'))
		const ids = sink.mock.calls.map(call => call[2])
		expect(new Set(ids).size).toBe(1)
	})

	it('tells the user a too-deep folder may still fail', () => {
		// The fallback template rescues many cases but not this one, and a
		// download that fails later with a yt-dlp error explains nothing.
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.filenameBudgetFailed('path-too-deep', '/tmp/deep')
		expect(sink.mock.calls[0]?.[1]).toMatch(/shorter folder/i)
	})
})
