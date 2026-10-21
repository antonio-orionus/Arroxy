import {describe, expect, it} from 'vite-plus/test'
import {localizeScreenshots} from '../../readme-src/build.mjs'

const TEMPLATE = '<img src="build/screenshots/en/Main-screenshot.webp" /> <img src="build/screenshots/en/Explore-screenshot.webp" /> <img src="build/Global-hotkey.png" />'

describe('localizeScreenshots', () => {
	it("shows each README its own language's shot", () => {
		const out = localizeScreenshots(TEMPLATE, 'de', () => true)
		expect(out).toContain('build/screenshots/de/Main-screenshot.webp')
		expect(out).toContain('build/screenshots/de/Explore-screenshot.webp')
		expect(out).not.toContain('build/screenshots/en/')
	})

	it('keeps the English shot where the language has none', () => {
		const out = localizeScreenshots(TEMPLATE, 'ja', path => path !== 'build/screenshots/ja/Explore-screenshot.webp')
		expect(out).toContain('build/screenshots/ja/Main-screenshot.webp')
		expect(out).toContain('build/screenshots/en/Explore-screenshot.webp')
	})

	it('leaves images that are not screenshots alone', () => {
		expect(localizeScreenshots(TEMPLATE, 'fr', () => true)).toContain('build/Global-hotkey.png')
	})

	it('keeps the English README on the English shots', () => {
		expect(localizeScreenshots(TEMPLATE, 'en', () => true)).toBe(TEMPLATE)
	})
})
