// The hidden YouTube window is shared: the startup warm-up and an on-demand mint
// both drive it, concurrently, by design. Destroying it out from under the other
// one throws on a destroyed webContents — and it takes no user cancel to happen,
// just a queue item respawning while warmup is still scraping.

import {beforeEach, describe, expect, it, vi} from 'vitest'

const created: MockWindow[] = []

interface MockWindow {
	destroyed: boolean
	loadedUrls: string[]
	scripts: string[]
	destroy: () => void
	isDestroyed: () => boolean
	setSkipTaskbar: (skip: boolean) => void
	on: (event: string, listener: () => void) => void
	loadURL: (url: string, opts?: unknown) => Promise<void>
	webContents: {once: (event: string, listener: (...args: unknown[]) => void) => void; executeJavaScript: (script: string) => Promise<unknown>}
}

function makeWindow(): MockWindow {
	const win: MockWindow = {
		destroyed: false,
		loadedUrls: [],
		scripts: [],
		destroy: () => {
			win.destroyed = true
		},
		isDestroyed: () => win.destroyed,
		setSkipTaskbar: () => undefined,
		on: () => undefined,
		loadURL: async url => {
			win.loadedUrls.push(url)
		},
		webContents: {
			once: (event, listener) => {
				// Load succeeds on the next tick, as a real navigation would.
				if (event === 'did-finish-load') setTimeout(() => listener(), 0)
			},
			executeJavaScript: async script => {
				if (win.destroyed) throw new Error('Object has been destroyed')
				win.scripts.push(script)
				// The WebPoClient poll and the visitor-data read share one entry point.
				return script.includes('VISITOR_DATA') ? 'visitor-xyz' : true
			}
		}
	}
	return win
}

vi.mock('electron', () => ({
	session: {fromPartition: () => ({})},
	// A plain function, not an arrow: BrowserWindow is invoked with `new`, and an
	// arrow function cannot be a constructor. Returning an object from a
	// constructor call substitutes that object for the usual `this`.
	BrowserWindow: vi.fn().mockImplementation(function () {
		const win = makeWindow()
		created.push(win)
		return win
	})
}))

const {HiddenWindowTokenProvider} = await import('@main/token/providers/HiddenWindowTokenProvider.js')

beforeEach(() => {
	created.length = 0
})

describe('HiddenWindowTokenProvider window leases', () => {
	it('keeps the window alive while another lease is outstanding', async () => {
		const provider = new HiddenWindowTokenProvider()
		provider.acquireWindow()
		provider.acquireWindow()
		await provider.ensureReady()

		provider.releaseWindow()

		expect(created).toHaveLength(1)
		expect(created[0].destroyed).toBe(false)
		// The second holder can still drive the page.
		await expect(provider.getVisitorData()).resolves.toBe('visitor-xyz')
	})

	it('destroys the window when the last lease is released', async () => {
		const provider = new HiddenWindowTokenProvider()
		provider.acquireWindow()
		provider.acquireWindow()
		await provider.ensureReady()

		provider.releaseWindow()
		provider.releaseWindow()

		expect(created[0].destroyed).toBe(true)
	})

	it('an unbalanced release never drives the lease count negative', async () => {
		const provider = new HiddenWindowTokenProvider()
		provider.releaseWindow()
		provider.releaseWindow()

		provider.acquireWindow()
		await provider.ensureReady()
		provider.releaseWindow()

		expect(created).toHaveLength(1)
		expect(created[0].destroyed).toBe(true)
	})

	// Shutdown does not get to wait for stragglers: a live hidden BrowserWindow
	// keeps the process up.
	it('dispose tears the window down regardless of outstanding leases', async () => {
		const provider = new HiddenWindowTokenProvider()
		provider.acquireWindow()
		provider.acquireWindow()
		await provider.ensureReady()

		provider.dispose()

		expect(created[0].destroyed).toBe(true)
	})

	it('loads the page once for callers that arrive together', async () => {
		const provider = new HiddenWindowTokenProvider()
		provider.acquireWindow()
		provider.acquireWindow()

		await Promise.all([provider.ensureReady(), provider.ensureReady()])

		expect(created).toHaveLength(1)
		expect(created[0].loadedUrls.length).toBeLessThanOrEqual(1)
	})
})
