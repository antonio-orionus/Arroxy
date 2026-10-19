import {EventEmitter} from 'node:events'
import {expect, vi} from 'vite-plus/test'
import type {BrowserWindow, Session} from 'electron'
import type {CommonSettings, ExploreViewState} from '@shared/types.js'
import type {ExploreAdBlockStatus, ExploreSignInState} from '@shared/schemas.js'
import {ExploreViewHost, type ExploreViewHostDeps} from '@main/services/explore/ExploreViewHost.js'
import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import {views, type FakeView} from './exploreViewFakes.js'

// The ExploreViewHost under test, wired to fakes. A test file using it mocks
// electron's WebContentsView with FakeView first:
//   vi.mock('electron', async () => ({WebContentsView: (await import('../shared/exploreViewFakes.js')).FakeView}))

export interface NavEvent {
	url: string
	isMainFrame: boolean
	preventDefault: ReturnType<typeof vi.fn>
}

export function makeHarness(opts: {settings?: Partial<CommonSettings>; isPackaged?: boolean; homeUrlOverride?: string; idleUnloadDelayMs?: number} = {}) {
	const cookieListeners = new Set<(...args: unknown[]) => void>()
	const fakeSession = {cookies: {on: vi.fn((_event: string, listener: (...args: unknown[]) => void) => cookieListeners.add(listener)), off: vi.fn((_event: string, listener: (...args: unknown[]) => void) => cookieListeners.delete(listener))}}
	const closedListeners: Array<() => void> = []
	let windowDestroyed = false
	let zoomFactor = 1
	const mainWebContents = Object.assign(new EventEmitter(), {getZoomFactor: () => zoomFactor})
	const window = {
		webContents: mainWebContents,
		contentView: {addChildView: vi.fn(), removeChildView: vi.fn()},
		on: vi.fn((event: string, listener: () => void) => {
			if (event === 'closed') closedListeners.push(listener)
		}),
		isDestroyed: () => windowDestroyed
	}
	let settings: CommonSettings = {defaultOutputDir: '/downloads', rememberLastOutputDir: false, ...opts.settings} as CommonSettings
	// One promise, as the real session keeps: whenReady() returns the current one until a proxy change replaces it.
	const sessionReady = Promise.resolve()
	const session = {
		getSession: vi.fn(() => fakeSession as unknown as Session),
		whenReady: vi.fn((): Promise<void> => sessionReady),
		hasAuthCookies: vi.fn((_scope: ExploreCookieScope): Promise<boolean> => Promise.resolve(false)),
		verifySignedIn: vi.fn((_scope: ExploreCookieScope): Promise<ExploreSignInState> => Promise.resolve('unknown')),
		signOut: vi.fn((): Promise<void> => Promise.resolve())
	}
	// The ad blocker as the host sees it: apply() answers whether blocking switched.
	const adBlockListeners = new Set<(status: ExploreAdBlockStatus) => void>()
	let adBlockStatus: ExploreAdBlockStatus = 'off'
	const adBlock = {
		apply: vi.fn((_enabled: boolean): Promise<boolean> => Promise.resolve(false)),
		getStatus: vi.fn(() => adBlockStatus),
		onStatusChange: vi.fn((listener: (status: ExploreAdBlockStatus) => void) => {
			adBlockListeners.add(listener)
			return () => adBlockListeners.delete(listener)
		})
	}
	const emit = vi.fn<(state: ExploreViewState) => void>()
	const pointerEntered = vi.fn<() => void>()
	const linkMenu = vi.fn<(linkURL: string) => void>()
	// Main stores the last page in the settings; the fake keeps it where settings() reads it.
	const saveLastPage = vi.fn((url: string | undefined) => {
		settings = {...settings, exploreLastUrl: url}
	})
	const deps: ExploreViewHostDeps = {
		window: window as unknown as BrowserWindow,
		session,
		settings: () => settings,
		saveLastPage,
		adBlock,
		isPackaged: opts.isPackaged ?? false,
		emit,
		pointerEntered,
		linkMenu,
		...(opts.homeUrlOverride === undefined ? {} : {homeUrlOverride: opts.homeUrlOverride}),
		...(opts.idleUnloadDelayMs === undefined ? {} : {idleUnloadDelayMs: opts.idleUnloadDelayMs})
	}
	const host = new ExploreViewHost(deps)
	return {
		host,
		window,
		session,
		emit,
		pointerEntered,
		linkMenu,
		saveLastPage,
		fakeSession,
		adBlock,
		setAdBlockStatus: (status: ExploreAdBlockStatus) => {
			adBlockStatus = status
			for (const listener of adBlockListeners) listener(status)
		},
		settings: () => settings,
		setSettings: (patch: Partial<CommonSettings>) => {
			settings = {...settings, ...patch}
		},
		changeCookie: (domain: string) => {
			for (const listener of cookieListeners) listener({}, {name: 'SID', value: 'secret-value', domain}, 'explicit', false)
		},
		closeWindow: () => {
			windowDestroyed = true
			for (const listener of closedListeners) listener()
		},
		cookieListenerCount: () => cookieListeners.size,
		setZoomFactor: (factor: number) => {
			zoomFactor = factor
		},
		// The main window's own renderer starts a navigation; the main window cancels every renderer one.
		mainStartNavigation: (details: {isMainFrame: boolean; isSameDocument: boolean}) => {
			mainWebContents.emit('did-start-navigation', details)
		},
		// The main window commits a new document (Cmd+R, the crash dialog's Reload).
		mainCommit: () => {
			mainWebContents.emit('did-navigate', {}, 'file:///index.html', 200, 'OK')
		},
		mainInPage: () => {
			mainWebContents.emit('did-navigate-in-page', {}, 'file:///index.html#explore', true)
		}
	}
}

export function onlyView(): FakeView {
	expect(views).toHaveLength(1)
	const view = views[0]
	if (!view) throw new Error('no view')
	return view
}

export function navEvent(url: string, isMainFrame = true): NavEvent {
	return {url, isMainFrame, preventDefault: vi.fn()}
}

export function lastState(emit: ReturnType<typeof makeHarness>['emit']): ExploreViewState {
	const call = emit.mock.calls.at(-1)
	if (!call) throw new Error('nothing emitted')
	return call[0]
}
