import {describe, expect, it} from 'vite-plus/test'
import {UI_STYLES} from '@shared/schemas.js'
import {BASE_STYLE, resolveEffectiveStyle, STYLES} from '../../src/renderer/src/styles/registry.js'

describe('style registry', () => {
	it('registers every style in the enum', () => {
		expect(Object.keys(STYLES).sort()).toEqual([...UI_STYLES].sort())
	})

	it('has a base style that never needs a backdrop', () => {
		expect(STYLES[BASE_STYLE].backdrop).toBeNull()
	})

	it('gives every backdrop style a scene for both color schemes', () => {
		for (const style of UI_STYLES) {
			const backdrop = STYLES[style].backdrop
			if (!backdrop) continue
			expect(backdrop.light.id).toBeTruthy()
			expect(backdrop.dark.id).toBeTruthy()
		}
	})
})

describe('resolveEffectiveStyle', () => {
	const backdropStyle = UI_STYLES.find(style => STYLES[style].backdrop !== null)
	if (!backdropStyle) throw new Error('expected a style with a backdrop')

	it('keeps a style that needs no backdrop whatever the GPU says', () => {
		for (const availability of ['unknown', 'available', 'blocked'] as const) {
			expect(resolveEffectiveStyle(BASE_STYLE, availability)).toBe(BASE_STYLE)
		}
	})

	it('keeps a backdrop style while hardware WebGL is available', () => {
		expect(resolveEffectiveStyle(backdropStyle, 'available')).toBe(backdropStyle)
	})

	it('keeps a backdrop style while availability is not known yet, so startup does not flash the base style', () => {
		expect(resolveEffectiveStyle(backdropStyle, 'unknown')).toBe(backdropStyle)
	})

	it('falls back to the base style when hardware WebGL is blocked', () => {
		expect(resolveEffectiveStyle(backdropStyle, 'blocked')).toBe(BASE_STYLE)
	})
})
