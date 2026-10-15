import {readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'

const stylesSource = readFileSync(path.resolve('src/renderer/src/styles.css'), 'utf8')

describe('backdrop CSS emergency fallback scenery', () => {
	it('paints both fallback scenes from the reference backdrop photos', () => {
		expect(stylesSource).toContain('backdrop-static-fallback.backdrop-light-ocean::before')
		expect(stylesSource).toContain('./assets/backdrop/light-ocean.webp')
		expect(stylesSource).toContain('backdrop-static-fallback.backdrop-dark-aurora::before')
		expect(stylesSource).toContain('./assets/backdrop/dark-aurora.webp')
	})

	it('drops the retired procedural sun gradient tokens', () => {
		expect(stylesSource).not.toContain('--backdrop-light-sun')
		expect(stylesSource).not.toContain('--backdrop-light-sun-rays')
	})
})
