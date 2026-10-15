import {readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {BOOT_SPLASH_DARK_BACKGROUND_COLOR, BOOT_SPLASH_LIGHT_BACKGROUND_COLOR, resolveMainWindowBackgroundColor} from '@main/windowPresentation.js'

const mainSource = readFileSync(path.resolve('src/main/index.ts'), 'utf8')

describe('main window startup presentation', () => {
	it('uses a theme-aware native background without delaying the initial window show', () => {
		expect(mainSource).toContain('resolveMainWindowBackgroundColor(initialSettings.common.uiTheme, nativeTheme.shouldUseDarkColors)')
		expect(mainSource).toContain('backgroundColor,')
		expect(mainSource).not.toContain('show: false')
		expect(mainSource).not.toContain('paintWhenInitiallyHidden: true')
		expect(mainSource).not.toContain("window.once('ready-to-show'")
	})

	it('matches the native pre-paint color to explicit and system themes', () => {
		expect(resolveMainWindowBackgroundColor('dark', false)).toBe(BOOT_SPLASH_DARK_BACKGROUND_COLOR)
		expect(resolveMainWindowBackgroundColor('light', true)).toBe(BOOT_SPLASH_LIGHT_BACKGROUND_COLOR)
		expect(resolveMainWindowBackgroundColor('system', true)).toBe(BOOT_SPLASH_DARK_BACKGROUND_COLOR)
		expect(resolveMainWindowBackgroundColor('system', false)).toBe(BOOT_SPLASH_LIGHT_BACKGROUND_COLOR)
		expect(resolveMainWindowBackgroundColor(undefined, true)).toBe(BOOT_SPLASH_DARK_BACKGROUND_COLOR)
	})
})
