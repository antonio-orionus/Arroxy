import '@testing-library/jest-dom/vitest'
import {vi} from 'vitest'
import {initI18n} from '@shared/i18n/index.js'

initI18n('en')

if (typeof window !== 'undefined') {
	window.appVersion = '0.0.0-test'
}

// jsdom doesn't implement matchMedia — stub it globally for all tests that need it
if (typeof window !== 'undefined' && !window.matchMedia) {
	Object.defineProperty(window, 'matchMedia', {writable: true, value: vi.fn().mockImplementation((query: string) => ({matches: false, media: query, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()}))})
}

// Node ≥23 exposes `globalThis.localStorage` whose getter returns `undefined`
// unless `--localstorage-file` is set. Vitest's jsdom environment setup skips
// copying jsdom's storage getter for keys already present on the Node global,
// so `window.localStorage` is undefined in every renderer test file. Restore
// it with the real jsdom window's Storage (vitest keeps the live JSDOM at
// `globalThis.jsdom`).
if (typeof window !== 'undefined' && !window.localStorage) {
	interface JsdomGlobal {
		jsdom?: {window: Window}
	}
	const jsdomWindow = (globalThis as JsdomGlobal).jsdom?.window
	if (jsdomWindow) {
		Object.defineProperty(window, 'localStorage', {configurable: true, get: () => jsdomWindow.localStorage})
	}
}
