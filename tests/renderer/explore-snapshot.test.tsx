import {act, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {ExploreViewport} from '@renderer/components/explore/ExploreViewport.js'
import {fail, ok, type Result} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// P2-R35: an overlay (menu, popover, dialog, the progress dialog) still hides
// the native view, but the page stays on screen as a picture: the renderer
// asks main for a snapshot, shows it in the placeholder, and only then hides
// the view. On close the live view comes back first, then the picture goes.
// A snapshot that fails or is late never holds the overlay up.

const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q=='

// What the DOM looked like each time the view was shown or hidden.
interface VisibilityCall {
	visible: boolean
	snapshotShown: boolean
}

let calls: VisibilityCall[] = []

function snapshot(): HTMLImageElement | null {
	return document.querySelector<HTMLImageElement>('[data-testid="explore-snapshot"]')
}

function openOverlay(role = 'menu'): HTMLElement {
	const overlay = document.createElement('div')
	overlay.setAttribute('role', role)
	overlay.dataset.testOverlay = ''
	act(() => {
		document.body.appendChild(overlay)
	})
	return overlay
}

function closeOverlay(overlay: HTMLElement): void {
	act(() => {
		overlay.remove()
	})
}

function deferred<T>(): {promise: Promise<T>; resolve: (value: T) => void} {
	let resolve: (value: T) => void = () => undefined
	const promise = new Promise<T>(r => {
		resolve = r
	})
	return {promise, resolve}
}

async function renderShown(): Promise<void> {
	render(<ExploreViewport error={null} onRetry={() => undefined} onOpenSettings={() => undefined} />)
	await waitFor(() => expect(calls.map(call => call.visible)).toEqual([true]))
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	calls = []
	vi.mocked(window.appApi.explore.setVisible).mockImplementation(visible => {
		calls.push({visible, snapshotShown: snapshot() !== null})
		return Promise.resolve(ok(undefined))
	})
})

afterEach(() => {
	document.querySelectorAll('[data-test-overlay]').forEach(node => node.remove())
	vi.restoreAllMocks()
	vi.useRealTimers()
})

describe('Explore snapshot behind overlays', () => {
	it('shows the snapshot before hiding the view, and shows the view before dropping it', async () => {
		vi.mocked(window.appApi.explore.capture).mockResolvedValue(ok(JPEG))
		await renderShown()

		const menu = openOverlay()
		await waitFor(() => expect(calls.map(call => call.visible)).toEqual([true, false]))
		expect(window.appApi.explore.capture).toHaveBeenCalledTimes(1)
		expect(calls[1]).toEqual({visible: false, snapshotShown: true})
		expect(snapshot()).toHaveAttribute('src', JPEG)
		expect(vi.mocked(window.appApi.explore.capture).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(window.appApi.explore.setVisible).mock.invocationCallOrder[1] ?? 0)

		closeOverlay(menu)
		await waitFor(() => expect(snapshot()).toBeNull())
		expect(calls[2]).toEqual({visible: true, snapshotShown: true})
	})

	it('applies to dialogs too', async () => {
		vi.mocked(window.appApi.explore.capture).mockResolvedValue(ok(JPEG))
		await renderShown()

		openOverlay('dialog')

		await waitFor(() => expect(calls.at(-1)).toEqual({visible: false, snapshotShown: true}))
	})

	it.each([
		['main has nothing to capture', () => Promise.resolve(ok(null))],
		['the capture fails', () => Promise.resolve(fail({code: 'unknown', message: 'capture failed'}))],
		['the IPC call rejects', () => Promise.reject(new Error('ipc gone'))]
	] satisfies [string, () => Promise<Result<string | null>>][])('hides the view at once when %s', async (_name, answer) => {
		vi.mocked(window.appApi.explore.capture).mockImplementation(answer)
		await renderShown()

		openOverlay()

		await waitFor(() => expect(calls.at(-1)).toEqual({visible: false, snapshotShown: false}))
		expect(snapshot()).toBeNull()
	})

	it('does not wait for a slow capture, and drops it when it comes', async () => {
		const late = deferred<Result<string | null>>()
		vi.mocked(window.appApi.explore.capture).mockReturnValue(late.promise)
		await renderShown()

		openOverlay()
		// Hidden within the ~300 ms the overlay may wait, without the picture.
		await waitFor(() => expect(calls.at(-1)).toEqual({visible: false, snapshotShown: false}), {timeout: 900})

		await act(async () => {
			late.resolve(ok(JPEG))
			await late.promise
		})
		expect(snapshot()).toBeNull()
	})

	it('leaves the view up when the overlay closes before the capture lands', async () => {
		const late = deferred<Result<string | null>>()
		vi.mocked(window.appApi.explore.capture).mockReturnValue(late.promise)
		await renderShown()

		const menu = openOverlay()
		await waitFor(() => expect(window.appApi.explore.capture).toHaveBeenCalled())
		closeOverlay(menu)
		await act(async () => {
			late.resolve(ok(JPEG))
			await late.promise
		})

		expect(calls.map(call => call.visible)).not.toContain(false)
		expect(snapshot()).toBeNull()
	})

	it('leaving the tab while the snapshot is pending hides the view at once', async () => {
		const late = deferred<Result<string | null>>()
		vi.mocked(window.appApi.explore.capture).mockReturnValue(late.promise)
		const {unmount} = render(<ExploreViewport error={null} onRetry={() => undefined} onOpenSettings={() => undefined} />)
		await waitFor(() => expect(calls.map(call => call.visible)).toEqual([true]))
		openOverlay()
		await waitFor(() => expect(window.appApi.explore.capture).toHaveBeenCalled())

		unmount()
		expect(calls.map(call => call.visible)).toEqual([true, false])

		await act(async () => {
			late.resolve(ok(JPEG))
			await late.promise
		})
		expect(calls.map(call => call.visible)).toEqual([true, false])
	})

	// Open → close → open again before main has answered the show: the second
	// hide must not leave the first picture up when it has none of its own.
	it('a fast reopen never shows the previous picture', async () => {
		vi.mocked(window.appApi.explore.capture).mockResolvedValueOnce(ok(JPEG)).mockResolvedValue(ok(null))
		await renderShown()
		const first = openOverlay()
		await waitFor(() => expect(calls.at(-1)).toEqual({visible: false, snapshotShown: true}))

		const shown = deferred<Result<void>>()
		vi.mocked(window.appApi.explore.setVisible).mockImplementationOnce(visible => {
			calls.push({visible, snapshotShown: snapshot() !== null})
			return shown.promise
		})
		closeOverlay(first)
		await waitFor(() => expect(calls.at(-1)?.visible).toBe(true))
		openOverlay()
		await waitFor(() => expect(calls.at(-1)?.visible).toBe(false))
		await act(async () => {
			shown.resolve(ok(undefined))
			await shown.promise
		})

		expect(calls.at(-1)).toEqual({visible: false, snapshotShown: false})
		expect(snapshot()).toBeNull()
	})

	it('drops the picture when showing the view again fails', async () => {
		vi.mocked(window.appApi.explore.capture).mockResolvedValue(ok(JPEG))
		await renderShown()
		const menu = openOverlay()
		await waitFor(() => expect(snapshot()).not.toBeNull())

		vi.mocked(window.appApi.explore.setVisible).mockRejectedValueOnce(new Error('ipc gone'))
		closeOverlay(menu)

		await waitFor(() => expect(snapshot()).toBeNull())
	})

	it('hides at once, with no snapshot, for the error surface', async () => {
		const {rerender} = render(<ExploreViewport error={null} onRetry={() => undefined} onOpenSettings={() => undefined} />)
		await waitFor(() => expect(calls.map(call => call.visible)).toEqual([true]))

		rerender(<ExploreViewport error="proxy" onRetry={() => undefined} onOpenSettings={() => undefined} />)

		expect(calls.map(call => call.visible)).toEqual([true, false])
		expect(window.appApi.explore.capture).not.toHaveBeenCalled()
		expect(screen.getByTestId('explore-error')).toBeInTheDocument()
	})
})
