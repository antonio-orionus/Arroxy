import {describe, expect, it} from 'vite-plus/test'
import {defaultAppSettings, DEFAULTS} from '@shared/constants.js'
import {appSettingsSchema} from '@shared/schemas.js'

// A removed setting must not cost anyone the rest of their settings.
describe('settings saved before styles existed', () => {
	it('still parse, dropping the old backdrop render mode and keeping everything else', () => {
		const saved = {...defaultAppSettings('/persisted/downloads'), common: {...defaultAppSettings('/persisted/downloads').common, defaultOutputDir: '/persisted/downloads', backdropRenderMode: 'css-only'}}

		const parsed = appSettingsSchema.safeParse(saved)

		expect(parsed.success).toBe(true)
		if (!parsed.success) return
		expect(parsed.data.common.defaultOutputDir).toBe('/persisted/downloads')
		expect('backdropRenderMode' in parsed.data.common).toBe(false)
		expect(parsed.data.common.uiStyle ?? DEFAULTS.uiStyle).toBe(DEFAULTS.uiStyle)
	})
})
