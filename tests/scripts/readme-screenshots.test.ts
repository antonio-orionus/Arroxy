import {describe, expect, it} from 'vite-plus/test'
import {localizeScreenshots} from '../../readme-src/build.mjs'

const TEMPLATE = '<img src="build/screenshots/en/Main-screenshot.webp" /> <img src="build/screenshots/en/Explore-screenshot.webp" /> <img src="build/Global-hotkey.png" />'

describe('localizeScreenshots', () => {
	it("shows each README its own language's shot", () => {
		const {text, missing} = localizeScreenshots(TEMPLATE, 'de', () => true)
		expect(text).toContain('build/screenshots/de/Main-screenshot.webp')
		expect(text).toContain('build/screenshots/de/Explore-screenshot.webp')
		expect(text).not.toContain('build/screenshots/en/')
		expect(missing).toEqual([])
	})

	it('keeps the English shot where the language has none, and names it', () => {
		const {text, missing} = localizeScreenshots(TEMPLATE, 'ja', path => path !== 'build/screenshots/ja/Explore-screenshot.webp')
		expect(text).toContain('build/screenshots/ja/Main-screenshot.webp')
		expect(text).toContain('build/screenshots/en/Explore-screenshot.webp')
		expect(missing).toEqual(['Explore-screenshot.webp'])
	})

	it('names a missing shot once, however often the README shows it', () => {
		const {missing} = localizeScreenshots(`${TEMPLATE} ${TEMPLATE}`, 'fr', path => !path.endsWith('Main-screenshot.webp'))
		expect(missing).toEqual(['Main-screenshot.webp'])
	})

	it('leaves images that are not screenshots alone', () => {
		expect(localizeScreenshots(TEMPLATE, 'fr', () => true).text).toContain('build/Global-hotkey.png')
	})

	it('keeps the English README on the English shots', () => {
		expect(localizeScreenshots(TEMPLATE, 'en', () => true)).toEqual({text: TEMPLATE, missing: []})
	})
})
