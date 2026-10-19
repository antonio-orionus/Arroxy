import type {AppApi} from '@shared/api.js'
import {fail} from '@shared/result.js'
import {exploreAddressScope, isExploreAddress} from '@shared/sites/exploreAddress.js'
import {youtubeSite} from '@shared/sites/youtube.js'
import type {ExploreViewBounds, ExploreViewState} from '@shared/types.js'

const HOME_URL = 'https://www.youtube.com/'

// Every call the renderer made to the fake view, for browser tests to read.
// Exists only in browser-mock: this module is imported nowhere else.
export interface ExploreMockCalls {
	setBounds: ExploreViewBounds[]
	setVisible: boolean[]
	setActive: boolean[]
	capture: number
}

declare global {
	interface Window {
		__exploreMockCalls?: ExploreMockCalls
	}
}

// browser-mock stand-in for the native Explore view: no page is ever loaded,
// but the address, history and signed-in flag behave enough to drive the toolbar.
// `initial` is the state a scenario starts in (a loaded page, an error, ...).
// `setAdBlock` follows the mock settings' ad blocker toggle; a scenario whose
// blocker is unavailable stays unavailable while it is on.
export function createExploreMock(initial: ExploreViewState): {api: AppApi['explore']; setAdBlock: (enabled: boolean) => void} {
	const listeners = new Set<(state: ExploreViewState) => void>()
	const calls: ExploreMockCalls = {setBounds: [], setVisible: [], setActive: [], capture: 0}
	window.__exploreMockCalls = calls
	// A page that can go back starts with an earlier entry behind it.
	let history: string[] = initial.url ? (initial.canGoBack ? [HOME_URL, initial.url] : [initial.url]) : []
	let index = history.length - 1
	let visible = false
	let signedIn = initial.signedIn
	let adBlock = initial.adBlock

	const state = (): ExploreViewState => ({url: history[index] ?? '', title: history[index] ? initial.title || 'Sample page' : '', canGoBack: index > 0, canGoForward: index >= 0 && index < history.length - 1, loading: initial.loading, signedIn, error: initial.error, adBlock})
	const publish = (): void => {
		const snapshot = state()
		for (const listener of listeners) listener(snapshot)
	}
	const visit = (url: string): void => {
		history = [...history.slice(0, index + 1), url]
		index = history.length - 1
	}

	const done = Promise.resolve({ok: true as const, data: undefined})

	const setAdBlock = (enabled: boolean): void => {
		adBlock = enabled ? (initial.adBlock === 'unavailable' ? 'unavailable' : 'on') : 'off'
		publish()
	}

	const api: AppApi['explore'] = {
		navigate: command => {
			if (!visible) return done
			switch (command.kind) {
				case 'home':
					visit(HOME_URL)
					break
				case 'back':
					index = Math.max(0, index - 1)
					break
				case 'forward':
					index = Math.min(history.length - 1, index + 1)
					break
				case 'reload':
					break
				case 'address':
					// Main's rule: any web page, never a sign-in or consent page.
					if (youtubeSite.explore === undefined || !isExploreAddress(command.url, exploreAddressScope(youtubeSite.explore))) return Promise.resolve(fail({code: 'validation', message: 'Explore does not load that address'}))
					visit(command.url)
					break
			}
			publish()
			return done
		},
		setBounds: rect => {
			calls.setBounds.push(rect)
			return done
		},
		setVisible: next => {
			calls.setVisible.push(next)
			visible = next
			if (next && history.length === 0) {
				visit(HOME_URL)
				publish()
			}
			return done
		},
		setActive: active => {
			calls.setActive.push(active)
			return done
		},
		signOut: () => {
			signedIn = false
			publish()
			return done
		},
		getState: () => Promise.resolve({ok: true, data: state()}),
		// No native view to picture: the placeholder already shows the stand-in page.
		capture: () => {
			calls.capture += 1
			return Promise.resolve({ok: true, data: null})
		},
		onStateChanged: listener => {
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
			}
		},
		// The mock page is renderer DOM: the pointer never enters a native view.
		onPointerInView: () => () => undefined,
		// The mock page has no native link menu to pick from.
		onLinkAction: () => () => undefined
	}
	return {api, setAdBlock}
}
