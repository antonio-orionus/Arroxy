import {describe, expect, it} from 'vitest'

import {readStaticBootSplashPreviewTheme, shouldHoldStaticBootSplash} from '@renderer/bootstrapPreview.js'

describe('static boot splash preview', () => {
	it('holds the static boot shell only for explicit browser-mock preview routes', () => {
		expect(shouldHoldStaticBootSplash({mode: 'browser-mock', search: '?scenario=boot-splash'})).toBe(true)
		expect(shouldHoldStaticBootSplash({mode: 'browser-mock', search: '?bootSplash=1'})).toBe(true)
		expect(shouldHoldStaticBootSplash({mode: 'browser-mock', search: '?scenario=default'})).toBe(false)
		expect(shouldHoldStaticBootSplash({mode: 'development', search: '?scenario=boot-splash'})).toBe(false)
	})

	it('reads preview theme overrides from browser-mock knobs', () => {
		expect(readStaticBootSplashPreviewTheme('?scenario=boot-splash&theme=light')).toBe('light')
		expect(readStaticBootSplashPreviewTheme('?scenario=boot-splash&theme=dark')).toBe('dark')
		expect(readStaticBootSplashPreviewTheme('?scenario=boot-splash&theme=system')).toBeNull()
	})
})
