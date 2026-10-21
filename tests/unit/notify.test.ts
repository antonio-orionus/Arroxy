import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
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
		notify.clipboard('Filled 3 links from your clipboard')
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

describe('toasts with actions', () => {
	it('sends no actions argument for a plain notification', () => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.clipboard('Link filled')
		expect(sink.mock.calls[0]).toHaveLength(3)
	})

	it('offers View on an added quick download and runs the caller’s command', () => {
		const sink = vi.fn()
		setNotificationSink(sink)
		const view = vi.fn()
		notify.quickDownloadAdded('Fixture Video 1', view)
		const [level, message, , actions] = sink.mock.calls[0] ?? []
		expect(level).toBe('info')
		expect(message).toBe('Added: Fixture Video 1')
		expect(actions).toHaveLength(1)
		expect(actions[0].label).toBe('View')
		actions[0].onClick()
		expect(view).toHaveBeenCalledTimes(1)
	})

	it('collapses repeated adds and already-queued answers under one id each', () => {
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.quickDownloadAdded('one', vi.fn())
		notify.quickDownloadAdded('two', vi.fn())
		notify.quickDownloadAlreadyQueued(vi.fn())
		notify.quickDownloadAlreadyQueued(vi.fn())
		const ids = sink.mock.calls.map(call => call[2])
		expect(ids[0]).toBe(ids[1])
		expect(ids[2]).toBe(ids[3])
		expect(ids[0]).not.toBe(ids[2])
		expect(sink.mock.calls[2]?.[1]).toBe('Already in the queue')
		expect(sink.mock.calls[2]?.[3]?.[0]?.label).toBe('View')
	})

	it('puts the failure’s main action first and View second, one toast per row', () => {
		const sink = vi.fn()
		setNotificationSink(sink)
		const retry = vi.fn()
		const view = vi.fn()
		notify.quickDownloadFailed('row-1', 'https://example.com/a', {kind: 'retry', run: retry}, view)
		notify.quickDownloadFailed('row-2', 'Other', {kind: 'sign-in', run: vi.fn()}, vi.fn())
		notify.quickDownloadFailed('row-1', 'https://example.com/a', {kind: 'retry', run: retry}, view)
		const [level, message, id, actions] = sink.mock.calls[0] ?? []
		expect(level).toBe('error')
		expect(message).toBe("Couldn't prepare example.com/a")
		expect(actions.map((action: {label: string}) => action.label)).toEqual(['Retry', 'View'])
		actions[0].onClick()
		actions[1].onClick()
		expect(retry).toHaveBeenCalledTimes(1)
		expect(view).toHaveBeenCalledTimes(1)
		expect(sink.mock.calls[1]?.[3]?.[0]?.label).toBe('Sign in in Explore')
		expect(sink.mock.calls[1]?.[2]).not.toBe(id)
		expect(sink.mock.calls[2]?.[2]).toBe(id)
	})

	it('raises a quick download toast without View when the caller has none', () => {
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.quickDownloadAdded('Video')
		notify.quickDownloadFailed('row', 'Video', {kind: 'retry', run: vi.fn()})
		expect(sink.mock.calls[0]).toHaveLength(3)
		expect(sink.mock.calls[1]?.[3]?.map((action: {label: string}) => action.label)).toEqual(['Retry'])
	})

	it('asks how many videos to queue for a list past the load limit', () => {
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.quickDownloadNeedsChoice('row-1', {kind: 'list-size', loaded: 100, capped: true}, vi.fn())
		expect(sink.mock.calls[0]?.[1]).toBe('100+ videos — choose how many')
		expect(sink.mock.calls[0]?.[3]?.[0]?.label).toBe('View')
	})

	// A list under the limit offers All and Review, so the toast asks what to
	// download rather than offering only a review.
	it('asks what to download from a list under the load limit', () => {
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.quickDownloadNeedsChoice('row-2', {kind: 'list-size', loaded: 12, capped: false}, vi.fn())
		notify.quickDownloadNeedsChoice('row-3', {kind: 'list-size', loaded: 1, capped: false}, vi.fn())
		expect(sink.mock.calls.map(call => call[1])).toEqual(['12 videos in this list — choose what to download', '1 video in this list — choose what to download'])
	})
})

// A toast names the item by its title; a link the probe has not titled yet
// reads as a short host + id (or a one-line, ellipsized address), so a URL
// never wraps mid-word in the toast.
describe('the item a quick download toast names', () => {
	it.each([
		['Fixture Video 1', 'Fixture Video 1'],
		['https://www.youtube.com/watch?v=nighttrain3', 'youtube.com · nighttrain3'],
		['https://m.youtube.com/watch?v=abc&list=PL1', 'youtube.com · abc'],
		['https://youtu.be/dQw4w9WgXcQ?t=42', 'youtu.be · dQw4w9WgXcQ'],
		['https://www.youtube.com/shorts/short123', 'youtube.com · short123'],
		['https://www.youtube.com/playlist?list=PLmock_capped', 'youtube.com · PLmock_capped'],
		['https://www.youtube.com/watch?v=abc&list=PLmock', 'youtube.com · abc'],
		['https://example.com/a', 'example.com/a'],
		['https://media.example/course/42/lessons/an-extremely-long-lesson-slug-that-goes-on', 'media.example/course/42/lessons/an-extre…']
	])('%s reads as %s', (title, shown) => {
		const sink = vi.fn()
		setNotificationSink(sink)
		notify.quickDownloadAdded(title)
		notify.quickDownloadFailed('row', title, {kind: 'retry', run: vi.fn()})
		expect(sink.mock.calls.map(call => call[1])).toEqual([`Added: ${shown}`, `Couldn't prepare ${shown}`])
	})
})
