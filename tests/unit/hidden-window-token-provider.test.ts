// The hidden YouTube window is shared: the startup warm-up and an on-demand mint
// both drive it, concurrently, by design. Destroying it out from under the other
// one throws on a destroyed webContents — and it takes no user cancel to happen,
// just a queue item respawning while warmup is still scraping.

import {beforeEach, describe, expect, it, vi} from 'vitest'
import log from 'electron-log/main.js'

const created: MockWindow[] = []
// Ordered record of proxy application and navigation, so a test can prove the
// proxy was in place before the page started loading.
const events: string[] = []
let failNextLoad: {code: number; description: string} | null = null

const {partitionSession} = vi.hoisted(() => ({
	partitionSession: {
		setProxy: vi.fn(async (config: unknown) => {
			events.push(`setProxy ${JSON.stringify(config)}`)
		}),
		closeAllConnections: vi.fn(async () => {
			events.push('closeAllConnections')
		})
	}
}))

type LoginListener = (event: {preventDefault: () => void}, details: unknown, authInfo: {isProxy: boolean}, callback: (username?: string, password?: string) => void) => void

interface MockWindow {
	destroyed: boolean
	loadedUrls: string[]
	scripts: string[]
	loginListener: LoginListener | null
	destroy: () => void
	isDestroyed: () => boolean
	setSkipTaskbar: (skip: boolean) => void
	on: (event: string, listener: () => void) => void
	loadURL: (url: string, opts?: unknown) => Promise<void>
	webContents: {once: (event: string, listener: (...args: unknown[]) => void) => void; on: (event: string, listener: LoginListener) => void; executeJavaScript: (script: string) => Promise<unknown>}
}

function makeWindow(): MockWindow {
	const win: MockWindow = {
		destroyed: false,
		loadedUrls: [],
		scripts: [],
		loginListener: null,
		destroy: () => {
			win.destroyed = true
		},
		isDestroyed: () => win.destroyed,
		setSkipTaskbar: () => undefined,
		on: () => undefined,
		loadURL: async url => {
			events.push('loadURL')
			win.loadedUrls.push(url)
		},
		webContents: {
			once: (event, listener) => {
				const failure = failNextLoad
				// Load settles on the next tick, as a real navigation would.
				if (failure && event === 'did-fail-load') {
					failNextLoad = null
					setTimeout(() => listener({}, failure.code, failure.description), 0)
				}
				if (!failure && event === 'did-finish-load') setTimeout(() => listener(), 0)
			},
			on: (event, listener) => {
				if (event === 'login') win.loginListener = listener
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
	session: {fromPartition: () => partitionSession},
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
	events.length = 0
	failNextLoad = null
	vi.clearAllMocks()
})

// The page load is what reaches YouTube, so it has to go through the proxy the
// user configured. Without it a network where YouTube is only reachable through
// that proxy never loads the page, no token is minted, and every download runs
// on the no-token fallback (issue #222).
describe('HiddenWindowTokenProvider proxy', () => {
	it('applies the configured proxy before loading the page', async () => {
		const provider = new HiddenWindowTokenProvider(() => '127.0.0.1:10808')
		provider.acquireWindow()

		await provider.ensureReady()

		expect(events.slice(0, 2)).toEqual(['setProxy {"proxyRules":"http://127.0.0.1:10808"}', 'loadURL'])
	})

	it('leaves the system proxy in charge when none is configured', async () => {
		const provider = new HiddenWindowTokenProvider(() => '')
		provider.acquireWindow()

		await provider.ensureReady()

		expect(partitionSession.setProxy).toHaveBeenCalledWith({mode: 'system'})
	})

	it('falls back to the system proxy and says so when the setting is unusable', async () => {
		const provider = new HiddenWindowTokenProvider(() => 'ftp://proxy.example:21')
		provider.acquireWindow()

		await provider.ensureReady()

		expect(partitionSession.setProxy).toHaveBeenCalledWith({mode: 'system'})
		expect(log.warn).toHaveBeenCalledWith('PoT scrape: proxy setting is not a usable proxy URL — using the system proxy')
	})

	it('reloads the page through the new proxy after the setting changes', async () => {
		let proxy = 'http://10.0.0.1:3128'
		const provider = new HiddenWindowTokenProvider(() => proxy)
		provider.acquireWindow()
		await provider.ensureReady()

		proxy = 'socks5://10.0.0.2:1080'
		await provider.ensureReady()

		expect(partitionSession.setProxy).toHaveBeenLastCalledWith({proxyRules: 'socks5://10.0.0.2:1080'})
		expect(partitionSession.closeAllConnections).toHaveBeenCalledOnce()
		expect(created[0].loadedUrls).toHaveLength(2)
	})

	it('does not reload while the proxy is unchanged', async () => {
		const provider = new HiddenWindowTokenProvider(() => 'http://10.0.0.1:3128')
		provider.acquireWindow()
		await provider.ensureReady()

		await provider.ensureReady()

		expect(created[0].loadedUrls).toHaveLength(1)
		expect(partitionSession.setProxy).toHaveBeenCalledOnce()
	})

	it('answers proxy authentication with the credentials from the setting', async () => {
		const provider = new HiddenWindowTokenProvider(() => 'http://user:secret@10.0.0.1:3128')
		provider.acquireWindow()
		await provider.ensureReady()

		const proxyCallback = vi.fn()
		const proxyEvent = {preventDefault: vi.fn()}
		created[0].loginListener?.(proxyEvent, {}, {isProxy: true}, proxyCallback)
		const siteCallback = vi.fn()
		const siteEvent = {preventDefault: vi.fn()}
		created[0].loginListener?.(siteEvent, {}, {isProxy: false}, siteCallback)

		expect(proxyEvent.preventDefault).toHaveBeenCalledOnce()
		expect(proxyCallback).toHaveBeenCalledWith('user', 'secret')
		// A site asking for credentials is not ours to answer.
		expect(siteEvent.preventDefault).not.toHaveBeenCalled()
		expect(siteCallback).not.toHaveBeenCalled()
	})

	it('logs why the page failed to load, with the proxy redacted', async () => {
		failNextLoad = {code: -108, description: 'ERR_ADDRESS_INVALID'}
		const provider = new HiddenWindowTokenProvider(() => 'http://user:secret@10.0.0.1:3128')
		provider.acquireWindow()

		await expect(provider.ensureReady()).rejects.toThrow('YouTube failed to load: ERR_ADDRESS_INVALID (-108)')
		expect(log.warn).toHaveBeenCalledWith('PoT scrape: YouTube failed to load', {code: -108, description: 'ERR_ADDRESS_INVALID', proxy: 'http://***:***@10.0.0.1:3128'})
	})
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
		expect(created[0].loadedUrls).toHaveLength(1)
	})

	// destroyWindow() unconditionally clears `readying`, so a fresh run can start
	// right after it — by design. But the run being torn down settles later, on
	// its own listener, and its `.finally()` used to null `readying`
	// unconditionally too. That clobbers whatever newer run had since taken its
	// place, and lets a caller arriving after that start a second, unwanted
	// loadURL() on the replacement window.
	it('does not let a settling run clear a newer run that replaced it after destroyWindow()', async () => {
		const provider = new HiddenWindowTokenProvider()

		provider.acquireWindow()
		const runA = provider.ensureReady()

		// Destroys window[0] and clears `readying` while run A is still in
		// flight — its did-finish-load listener is queued but hasn't fired yet.
		provider.releaseWindow()

		provider.acquireWindow()
		const runB = provider.ensureReady()

		// Window[0] is destroyed, so run A's WebPoClient poll throws once its
		// did-finish-load fires. Awaiting it here guarantees its `.finally()`
		// has already run — before run B's own did-finish-load gets a chance to.
		await expect(runA).rejects.toThrow()

		provider.acquireWindow()
		const runC = provider.ensureReady()

		// A buggy clear lets this reach loadUntilReady() again on the still-live
		// window[1] instead of joining run B, pushing a second navigation.
		expect(created[1]?.loadedUrls).toHaveLength(1)

		await Promise.all([runB, runC])
		expect(created).toHaveLength(2)
	})
})
