// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import type {IpcMainInvokeEvent, Session} from 'electron'
import log from 'electron-log/main.js'
import {ElectronBlocker} from '@ghostery/adblocker-electron'
import {ExploreAdBlocker, type AdBlockEngine} from '@main/services/explore/ExploreAdBlocker.js'
import type {ExploreAdBlockStatus} from '@shared/schemas.js'
import {EXPLORE_SIGN_IN_PAGES} from '@shared/sites/signInPages.js'

type Handler = (event: unknown, ...args: unknown[]) => unknown
const ipcHandlers = vi.hoisted(() => new Map<string, Handler>())

vi.mock('electron', () => ({ipcMain: {handle: vi.fn((channel: string, handler: Handler) => ipcHandlers.set(channel, handler)), removeHandler: vi.fn((channel: string) => ipcHandlers.delete(channel))}}))

// P2-R36: the Explore ad blocker is off until the user turns it on, loads its
// engine only then, hooks only the Explore session, and never acts on sign-in.

const INJECT = '@ghostery/adblocker/inject-cosmetic-filters'
const PRELOAD = '/app/out/main/explore-adblock-preload.cjs'

type RequestListener = (details: Record<string, unknown>, callback: (response: Record<string, unknown>) => void) => void

function fakeSession() {
	const listeners: {beforeRequest: RequestListener | null; headersReceived: RequestListener | null} = {beforeRequest: null, headersReceived: null}
	const ses = {
		webRequest: {
			onBeforeRequest: vi.fn((filterOrNull: unknown, listener?: RequestListener) => {
				listeners.beforeRequest = filterOrNull === null ? null : (listener ?? null)
			}),
			onHeadersReceived: vi.fn((filterOrNull: unknown, listener?: RequestListener) => {
				listeners.headersReceived = filterOrNull === null ? null : (listener ?? null)
			})
		},
		registerPreloadScript: vi.fn(() => 'preload-1'),
		unregisterPreloadScript: vi.fn()
	}
	return {ses, listeners, session: ses as unknown as Session}
}

function fakeEngine(): AdBlockEngine & Record<keyof AdBlockEngine, ReturnType<typeof vi.fn>> {
	return {
		onBeforeRequest: vi.fn((_details: unknown, callback: (response: Record<string, unknown>) => void) => callback({cancel: true})),
		onHeadersReceived: vi.fn((_details: unknown, callback: (response: Record<string, unknown>) => void) => callback({})),
		onInjectCosmeticFilters: vi.fn(() => Promise.resolve()),
		onIsMutationObserverEnabled: vi.fn(() => Promise.resolve(true))
	}
}

function makeBlocker(loadEngine: () => Promise<AdBlockEngine | null>, refreshEngine?: () => Promise<AdBlockEngine | null>) {
	const {ses, listeners, session} = fakeSession()
	const statuses: ExploreAdBlockStatus[] = []
	const load = vi.fn(loadEngine)
	const blocker = new ExploreAdBlocker({session: () => session, loadEngine: load, preloadPath: PRELOAD, signInPages: EXPLORE_SIGN_IN_PAGES, ...(refreshEngine ? {refreshEngine} : {})})
	blocker.onStatusChange(status => statuses.push(status))
	return {blocker, ses, listeners, session, statuses, load}
}

function request(listener: RequestListener | null, details: Record<string, unknown>): Record<string, unknown> {
	if (!listener) throw new Error('no listener hooked')
	let answer: Record<string, unknown> | undefined
	listener(details, response => (answer = response))
	if (!answer) throw new Error('the listener never answered')
	return answer
}

function pageAt(url: string) {
	return {getURL: () => url, isDestroyed: () => false}
}

beforeEach(() => {
	ipcHandlers.clear()
})

describe('ExploreAdBlocker lifecycle', () => {
	it('loads nothing and hooks nothing while the setting is off', async () => {
		const h = makeBlocker(() => Promise.resolve(fakeEngine()))
		expect(await h.blocker.apply(false)).toBe(false)
		expect(h.load).not.toHaveBeenCalled()
		expect(h.ses.webRequest.onBeforeRequest).not.toHaveBeenCalled()
		expect(h.ses.registerPreloadScript).not.toHaveBeenCalled()
		expect(h.blocker.getStatus()).toBe('off')
	})

	it('turning it on loads the engine, then hooks requests, headers and the cosmetic preload on the Explore session', async () => {
		const h = makeBlocker(() => Promise.resolve(fakeEngine()))
		expect(await h.blocker.apply(true)).toBe(true)
		expect(h.load).toHaveBeenCalledTimes(1)
		expect(h.ses.webRequest.onBeforeRequest).toHaveBeenCalledWith({urls: ['<all_urls>']}, expect.any(Function))
		expect(h.ses.webRequest.onHeadersReceived).toHaveBeenCalledWith({urls: ['<all_urls>']}, expect.any(Function))
		expect(h.ses.registerPreloadScript).toHaveBeenCalledWith({type: 'frame', filePath: PRELOAD})
		expect(h.statuses).toEqual(['starting', 'on'])
	})

	it('turning it off clears exactly its own listeners and preload, and keeps the engine for the next turn-on', async () => {
		const h = makeBlocker(() => Promise.resolve(fakeEngine()))
		await h.blocker.apply(true)
		expect(await h.blocker.apply(false)).toBe(true)
		expect(h.ses.webRequest.onBeforeRequest).toHaveBeenLastCalledWith(null)
		expect(h.ses.webRequest.onHeadersReceived).toHaveBeenLastCalledWith(null)
		expect(h.ses.unregisterPreloadScript).toHaveBeenCalledWith('preload-1')
		expect(h.blocker.getStatus()).toBe('off')
		expect(await h.blocker.apply(false)).toBe(false)

		expect(await h.blocker.apply(true)).toBe(true)
		expect(h.load).toHaveBeenCalledTimes(1)
		expect(h.statuses).toEqual(['starting', 'on', 'off', 'starting', 'on'])
	})

	it('an engine that cannot be had leaves it unavailable, blocking nothing, and is tried again at the next turn-on', async () => {
		const h = makeBlocker(() => Promise.resolve(null))
		expect(await h.blocker.apply(true)).toBe(false)
		expect(h.blocker.getStatus()).toBe('unavailable')
		expect(h.ses.webRequest.onBeforeRequest).not.toHaveBeenCalled()
		expect(h.ses.registerPreloadScript).not.toHaveBeenCalled()

		await h.blocker.apply(false)
		await h.blocker.apply(true)
		expect(h.load).toHaveBeenCalledTimes(2)
	})

	it('a loader that throws counts as unavailable', async () => {
		const h = makeBlocker(() => Promise.reject(new Error('disk on fire')))
		await h.blocker.apply(true)
		expect(h.blocker.getStatus()).toBe('unavailable')
	})

	it('turned off while the engine loads, it never hooks the session', async () => {
		let resolve: (engine: AdBlockEngine) => void = () => undefined
		const h = makeBlocker(() => new Promise(r => (resolve = r)))
		const on = h.blocker.apply(true)
		await h.blocker.apply(false)
		resolve(fakeEngine())
		expect(await on).toBe(false)
		expect(h.ses.webRequest.onBeforeRequest).not.toHaveBeenCalled()
		expect(h.blocker.getStatus()).toBe('off')
	})

	it('a repeated turn-on hooks once', async () => {
		const h = makeBlocker(() => Promise.resolve(fakeEngine()))
		await Promise.all([h.blocker.apply(true), h.blocker.apply(true)])
		expect(h.ses.webRequest.onBeforeRequest).toHaveBeenCalledTimes(1)
		expect(h.ses.registerPreloadScript).toHaveBeenCalledTimes(1)
	})
})

// A session that runs for days: the lists are checked daily and a newer engine
// replaces the old one in place, with no re-hooking and no reload.
describe('ExploreAdBlocker list refresh', () => {
	const DAY_MS = 24 * 60 * 60 * 1000
	const adRequest = {id: 1, url: 'https://ads.example/x.js', resourceType: 'script', referrer: '', webContents: pageAt('https://www.youtube.com/')}

	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('checks at most daily, and swaps in a newer engine without re-hooking', async () => {
		const first = fakeEngine()
		const second = fakeEngine()
		const refresh = vi.fn((): Promise<AdBlockEngine | null> => Promise.resolve(second))
		const h = makeBlocker(() => Promise.resolve(first), refresh)
		await h.blocker.apply(true)

		await vi.advanceTimersByTimeAsync(DAY_MS - 60_000)
		expect(refresh).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(60_000)
		expect(refresh).toHaveBeenCalledTimes(1)

		request(h.listeners.beforeRequest, adRequest)
		expect(second.onBeforeRequest).toHaveBeenCalledTimes(1)
		expect(first.onBeforeRequest).not.toHaveBeenCalled()
		expect(h.ses.webRequest.onBeforeRequest).toHaveBeenCalledTimes(1)
		expect(h.ses.registerPreloadScript).toHaveBeenCalledTimes(1)
		expect(h.blocker.getStatus()).toBe('on')
	})

	it('keeps the engine in use when there is nothing newer', async () => {
		const first = fakeEngine()
		const h = makeBlocker(
			() => Promise.resolve(first),
			() => Promise.resolve(null)
		)
		await h.blocker.apply(true)
		await vi.advanceTimersByTimeAsync(DAY_MS)
		request(h.listeners.beforeRequest, adRequest)
		expect(first.onBeforeRequest).toHaveBeenCalledTimes(1)
	})

	it('never holds requests while a refresh is under way', async () => {
		const first = fakeEngine()
		const h = makeBlocker(
			() => Promise.resolve(first),
			() => new Promise(() => undefined)
		)
		await h.blocker.apply(true)
		await vi.advanceTimersByTimeAsync(DAY_MS)
		expect(request(h.listeners.beforeRequest, adRequest)).toEqual({cancel: true})
	})

	it('stops checking once turned off, and a late refresh hooks nothing', async () => {
		let resolve: (engine: AdBlockEngine) => void = () => undefined
		const refresh = vi.fn((): Promise<AdBlockEngine | null> => new Promise(r => (resolve = r)))
		const h = makeBlocker(() => Promise.resolve(fakeEngine()), refresh)
		await h.blocker.apply(true)
		await vi.advanceTimersByTimeAsync(DAY_MS)
		await h.blocker.apply(false)
		resolve(fakeEngine())
		await vi.advanceTimersByTimeAsync(3 * DAY_MS)

		expect(refresh).toHaveBeenCalledTimes(1)
		expect(h.listeners.beforeRequest).toBeNull()
		expect(h.blocker.getStatus()).toBe('off')
	})

	// The refresh has already rewritten the cache: dropping its engine would
	// leave the next turn-on on the stale one until a restart.
	it('the next turn-on uses an engine refreshed while it was off', async () => {
		const stale = fakeEngine()
		const fresh = fakeEngine()
		let resolve: (engine: AdBlockEngine) => void = () => undefined
		const h = makeBlocker(
			() => Promise.resolve(stale),
			() => new Promise(r => (resolve = r))
		)
		await h.blocker.apply(true)
		await vi.advanceTimersByTimeAsync(DAY_MS)
		await h.blocker.apply(false)
		resolve(fresh)
		await vi.advanceTimersByTimeAsync(0)

		await h.blocker.apply(true)
		request(h.listeners.beforeRequest, adRequest)

		expect(fresh.onBeforeRequest).toHaveBeenCalledTimes(1)
		expect(stale.onBeforeRequest).not.toHaveBeenCalled()
		expect(h.load).toHaveBeenCalledTimes(1)
	})
})

describe('ExploreAdBlocker cosmetic IPC', () => {
	function cosmeticEvent(session: unknown, frameUrl: string) {
		return {sender: {session, insertCSS: vi.fn(), executeJavaScript: vi.fn(), isDestroyed: () => false, getURL: () => frameUrl}, senderFrame: {url: frameUrl}, frameId: 1, processId: 1}
	}

	it('answers an Explore page only, and only while blocking is on', async () => {
		const engine = fakeEngine()
		const h = makeBlocker(() => Promise.resolve(engine))
		await h.blocker.apply(true)
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')

		await inject(cosmeticEvent({}, 'https://www.youtube.com/'), 'https://www.youtube.com/')
		expect(engine.onInjectCosmeticFilters).not.toHaveBeenCalled()

		await inject(cosmeticEvent(h.session, 'https://www.youtube.com/'), 'https://www.youtube.com/')
		expect(engine.onInjectCosmeticFilters).toHaveBeenCalledTimes(1)

		await h.blocker.apply(false)
		await inject(cosmeticEvent(h.session, 'https://www.youtube.com/'), 'https://www.youtube.com/')
		expect(engine.onInjectCosmeticFilters).toHaveBeenCalledTimes(1)
	})

	it('drops a malformed DOM report from the page', async () => {
		const engine = fakeEngine()
		const h = makeBlocker(() => Promise.resolve(engine))
		await h.blocker.apply(true)
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')

		await inject(cosmeticEvent(h.session, 'https://www.youtube.com/'), 'https://www.youtube.com/', {classes: 'not-a-list'})
		expect(engine.onInjectCosmeticFilters).not.toHaveBeenCalled()
		await inject(cosmeticEvent(h.session, 'https://www.youtube.com/'), 'https://www.youtube.com/', {type: 'features', classes: ['a'], hrefs: [], ids: []})
		expect(engine.onInjectCosmeticFilters).toHaveBeenCalledWith(expect.anything(), 'https://www.youtube.com/', {classes: ['a'], hrefs: [], ids: [], lifecycle: 'dom-update'})
	})

	// A newer preload's lifecycle value must not silently turn cosmetics off.
	it('still filters a DOM report with a lifecycle it does not know, and says so once', async () => {
		const engine = fakeEngine()
		const h = makeBlocker(() => Promise.resolve(engine))
		await h.blocker.apply(true)
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')
		vi.mocked(log.warn).mockClear()

		for (let i = 0; i < 2; i++) await inject(cosmeticEvent(h.session, 'https://www.youtube.com/'), 'https://www.youtube.com/', {classes: ['a'], hrefs: [], ids: [], lifecycle: 'dom-settled'})

		expect(engine.onInjectCosmeticFilters).toHaveBeenCalledTimes(2)
		expect(engine.onInjectCosmeticFilters).toHaveBeenLastCalledWith(expect.anything(), 'https://www.youtube.com/', {classes: ['a'], hrefs: [], ids: [], lifecycle: 'dom-update'})
		expect(vi.mocked(log.warn).mock.calls.filter(call => String(call[0]).includes('lifecycle'))).toHaveLength(1)
	})

	// The library calls executeJavaScript without awaiting it: a scriptlet that
	// throws in the page would reject with nobody listening (main.log: "Script
	// failed to execute", several per page load). Contained in Arroxy's wiring,
	// logged once per page, and the scriptlet and styles still reach the page.
	it('contains a scriptlet that fails in the page: no unhandled rejection, one debug line per page', async () => {
		const engine = ElectronBlocker.parse('youtube.com##.ad-banner')
		vi.spyOn(engine, 'getCosmeticsFilters').mockReturnValue({active: true, styles: '.ad-banner{display:none!important}', scripts: ['throw new Error("scriptlet")', 'throw new Error("again")'], extended: []})
		const h = makeBlocker(() => Promise.resolve(engine))
		await h.blocker.apply(true)
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')
		const unhandled = vi.fn()
		process.on('unhandledRejection', unhandled)
		vi.mocked(log.debug).mockClear()
		try {
			// Plain functions, not vi.fn: a mock's result tracking would itself handle the promise.
			const scripts: unknown[][] = []
			const styles: unknown[][] = []
			const executeJavaScript = (...args: unknown[]): Promise<unknown> => {
				scripts.push(args)
				return Promise.reject(new Error('Script failed to execute'))
			}
			const insertCSS = (...args: unknown[]): Promise<string> => {
				styles.push(args)
				return Promise.reject(new Error('frame gone'))
			}
			const event = {sender: {session: h.session, insertCSS, executeJavaScript, isDestroyed: () => false, getURL: () => 'https://www.youtube.com/watch?v=a'}, senderFrame: {url: 'https://www.youtube.com/watch?v=a'}, frameId: 1, processId: 1}
			await inject(event, 'https://www.youtube.com/watch?v=a')
			await inject(event, 'https://www.youtube.com/watch?v=a')
			await new Promise(resolve => setTimeout(resolve, 10))

			expect(unhandled).not.toHaveBeenCalled()
			expect(scripts).toEqual([
				['throw new Error("scriptlet")', true],
				['throw new Error("again")', true],
				['throw new Error("scriptlet")', true],
				['throw new Error("again")', true]
			])
			expect(styles[0]).toEqual(['.ad-banner{display:none!important}', {cssOrigin: 'user'}])
			const lines = vi.mocked(log.debug).mock.calls.filter(call => String(call[0]).includes('cosmetic'))
			expect(lines).toHaveLength(1)
			// The host only: a page's path and query never reach the log.
			expect(JSON.stringify(lines[0])).not.toContain('watch')

			await inject({...event, senderFrame: {url: 'https://www.youtube.com/watch?v=b'}}, 'https://www.youtube.com/watch?v=b')
			await new Promise(resolve => setTimeout(resolve, 10))
			expect(vi.mocked(log.debug).mock.calls.filter(call => String(call[0]).includes('cosmetic'))).toHaveLength(2)
		} finally {
			process.off('unhandledRejection', unhandled)
		}
	})
})

// A real engine from the library: the sign-in rule must hold against filters
// that would otherwise block or hide something on those hosts.
// Every sign-in host below has a filter that would block it: the guard, not a
// gap in the list, is what lets the request through.
const FILTERS = ['||ads.example^', '||accounts.google.com^$script', '||accounts.google.co.uk^', '||accounts.youtube.com^', '||myaccount.google.com^', 'youtube.com##.ad-banner', 'accounts.google.com##.promo-slot', '/ajax/bz?_', '||instagram.com^/ajax/bz', 'facebook.com##.ego_section'].join('\n')

describe('ExploreAdBlocker never acts on sign-in', () => {
	async function realEngine() {
		const h = makeBlocker(() => Promise.resolve(ElectronBlocker.parse(FILTERS)))
		await h.blocker.apply(true)
		return h
	}

	it('blocks an ad on the site (control)', async () => {
		const h = await realEngine()
		expect(request(h.listeners.beforeRequest, {id: 1, url: 'https://ads.example/banner.js', resourceType: 'script', referrer: 'https://www.youtube.com/', webContents: pageAt('https://www.youtube.com/')})).toEqual({cancel: true})
	})

	it('the filters do match every sign-in host (control for the cases below)', () => {
		const engine = ElectronBlocker.parse(FILTERS)
		for (const url of ['https://accounts.google.com/gsi/client', 'https://accounts.google.co.uk/x.js', 'https://myaccount.google.com/', 'https://accounts.youtube.com/accounts/CheckConnection']) {
			let answer: unknown
			engine.onBeforeRequest({id: 9, url, resourceType: 'script', referrer: 'https://www.youtube.com/'} as Parameters<ElectronBlocker['onBeforeRequest']>[0], response => (answer = response))
			expect(answer, url).toEqual({cancel: true})
		}
	})

	it.each(['https://accounts.google.com/gsi/client', 'https://accounts.google.co.uk/x.js', 'https://myaccount.google.com/', 'https://accounts.youtube.com/accounts/CheckConnection'])('never blocks a request to the sign-in host %s', async url => {
		const h = await realEngine()
		expect(request(h.listeners.beforeRequest, {id: 2, url, resourceType: 'script', referrer: 'https://www.youtube.com/', webContents: pageAt('https://www.youtube.com/')})).toEqual({})
	})

	it.each(['https://accounts.google.com/ServiceLogin', 'https://accounts.google.com.br/signin'])('blocks nothing a sign-in page at %s loads', async pageUrl => {
		const h = await realEngine()
		expect(request(h.listeners.beforeRequest, {id: 3, url: 'https://ads.example/banner.js', resourceType: 'script', referrer: '', webContents: pageAt(pageUrl)})).toEqual({})
		expect(request(h.listeners.headersReceived, {id: 4, url: 'https://ads.example/frame.html', resourceType: 'subFrame', referrer: '', webContents: pageAt(pageUrl), responseHeaders: {}})).toEqual({})
	})

	it('blocks nothing an embedded sign-in frame loads', async () => {
		const h = await realEngine()
		expect(request(h.listeners.beforeRequest, {id: 5, url: 'https://ads.example/banner.js', resourceType: 'script', referrer: '', webContents: pageAt('https://www.youtube.com/'), frame: {url: 'https://accounts.google.com/RotateCookiesPage'}})).toEqual({})
	})

	it('injects nothing when the sender frame is gone', async () => {
		const h = await realEngine()
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')
		const gone = {sender: {session: h.session, insertCSS: vi.fn(), executeJavaScript: vi.fn(), isDestroyed: () => false, getURL: () => 'https://www.youtube.com/'}, senderFrame: null, frameId: 1, processId: 1}
		await inject(gone, 'https://www.youtube.com/')
		expect(gone.sender.insertCSS).not.toHaveBeenCalled()

		const detached = {
			...gone,
			senderFrame: Object.defineProperty({}, 'url', {
				get: () => {
					throw new Error('Render frame was disposed')
				}
			})
		}
		await inject(detached, 'https://www.youtube.com/')
		expect(gone.sender.insertCSS).not.toHaveBeenCalled()
	})

	it('injects nothing when the page moved to a sign-in host after the report', async () => {
		const h = await realEngine()
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')
		let pageUrl = 'https://www.youtube.com/watch?v=a'
		const event = {sender: {session: h.session, insertCSS: vi.fn(), executeJavaScript: vi.fn(), isDestroyed: () => false, getURL: () => pageUrl}, senderFrame: {url: 'https://www.youtube.com/watch?v=a'}, frameId: 1, processId: 1}
		pageUrl = 'https://accounts.google.com/ServiceLogin'
		await inject(event, 'https://www.youtube.com/watch?v=a')
		expect(event.sender.insertCSS).not.toHaveBeenCalled()
		expect(event.sender.executeJavaScript).not.toHaveBeenCalled()
	})

	it('hides nothing on a sign-in page, and hides ads on the site (control)', async () => {
		const h = await realEngine()
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')
		const event = (url: string) => ({sender: {session: h.session, insertCSS: vi.fn(), executeJavaScript: vi.fn(), isDestroyed: () => false, getURL: () => url}, senderFrame: {url}, frameId: 1, processId: 1}) satisfies Partial<Record<keyof IpcMainInvokeEvent, unknown>>

		const signIn = event('https://accounts.google.com/ServiceLogin')
		await inject(signIn, 'https://accounts.google.com/ServiceLogin')
		expect(signIn.sender.insertCSS).not.toHaveBeenCalled()

		// A page that reports a site URL from a sign-in frame is still a sign-in page.
		const spoofed = event('https://accounts.google.com/ServiceLogin')
		await inject(spoofed, 'https://www.youtube.com/')
		expect(spoofed.sender.insertCSS).not.toHaveBeenCalled()

		const site = event('https://www.youtube.com/')
		await inject(site, 'https://www.youtube.com/')
		expect(site.sender.insertCSS).toHaveBeenCalledWith(expect.stringContaining('.ad-banner'), {cssOrigin: 'user'})
	})
})

// Meta signs in on paths of the hosts that also serve the site, so only those
// pages are spared: the same request from a Facebook feed is still blocked.
describe('ExploreAdBlocker never acts on Meta sign-in pages', () => {
	async function realEngine() {
		const h = makeBlocker(() => Promise.resolve(ElectronBlocker.parse(FILTERS)))
		await h.blocker.apply(true)
		return h
	}

	const beacon = (pageUrl: string) => ({id: 6, url: `${new URL(pageUrl).origin}/ajax/bz?__a=1`, resourceType: 'xhr', referrer: pageUrl, webContents: pageAt(pageUrl)})

	it('blocks the telemetry beacon on a Facebook or Instagram content page (control)', async () => {
		const h = await realEngine()
		for (const pageUrl of ['https://www.facebook.com/', 'https://www.instagram.com/']) expect(request(h.listeners.beforeRequest, beacon(pageUrl)), pageUrl).toEqual({cancel: true})
	})

	it.each(['https://www.facebook.com/login/', 'https://www.facebook.com/checkpoint/?next', 'https://www.instagram.com/accounts/login/', 'https://www.instagram.com/challenge/action/', 'https://www.threads.com/login'])('blocks nothing the sign-in page %s sends', async pageUrl => {
		const h = await realEngine()
		expect(request(h.listeners.beforeRequest, beacon(pageUrl))).toEqual({})
	})

	it('hides and injects nothing on the Facebook login page, and hides ads on the feed (control)', async () => {
		const h = await realEngine()
		const inject = ipcHandlers.get(INJECT)
		if (!inject) throw new Error('no cosmetic handler')
		const event = (url: string) => ({sender: {session: h.session, insertCSS: vi.fn(), executeJavaScript: vi.fn(() => Promise.resolve()), isDestroyed: () => false, getURL: () => url}, senderFrame: {url}, frameId: 1, processId: 1})

		const login = event('https://www.facebook.com/login/')
		await inject(login, 'https://www.facebook.com/login/')
		expect(login.sender.insertCSS).not.toHaveBeenCalled()
		expect(login.sender.executeJavaScript).not.toHaveBeenCalled()

		const feed = event('https://www.facebook.com/')
		await inject(feed, 'https://www.facebook.com/')
		expect(feed.sender.insertCSS).toHaveBeenCalledWith(expect.stringContaining('.ego_section'), {cssOrigin: 'user'})
	})
})
