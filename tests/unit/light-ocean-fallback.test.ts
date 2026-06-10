import {readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vitest'

const fallbackSource = readFileSync(path.resolve('src/renderer/src/components/layout/background/lightOcean/fallback.ts'), 'utf8')
const stylesSource = readFileSync(path.resolve('src/renderer/src/styles.css'), 'utf8')
const cssSunTokens = stylesSource.match(/--backdrop-light-sun[^:]*:[^;]+;/g)?.join('\n') ?? ''

describe('light ocean fallback scenery', () => {
	it('keeps the Canvas2D fallback aligned with the sunny ocean scene', () => {
		expect(fallbackSource).toContain('drawSun')
		expect(fallbackSource).toContain('drawSunRays')
		expect(fallbackSource).toContain('drawSunReflection')
	})

	it('keeps the CSS emergency fallback aligned with the sunny ocean scene', () => {
		expect(stylesSource).toContain('--backdrop-light-sun')
		expect(stylesSource).toContain('--backdrop-light-sun-halo')
		expect(stylesSource).toContain('--backdrop-light-sun-reflection')
		expect(stylesSource).toContain('var(--backdrop-light-sun)')
		expect(stylesSource).not.toContain('--backdrop-light-sun-rays')
	})

	it('keeps fallback suns cool-white instead of yellow', () => {
		expect(fallbackSource).not.toMatch(/rgba\(255, 2(?:3[18]|4[246]), 1(?:26|48|70|78|90|98)/)
		expect(cssSunTokens).not.toMatch(/hsl\((?:4[6-9]|5[0-9]) 100%/)
	})
})
