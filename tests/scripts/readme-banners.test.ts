import {createHash} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {basename, dirname, resolve} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {LOCALES} from '../../readme-src/strings.mjs'

describe('published README banners', () => {
	for (const locale of LOCALES) {
		it(`${locale.code} uses its own content-addressed banner and localized alt text`, () => {
			const readme = readFileSync(locale.filename, 'utf8')
			const image = /<img src="([^"]+)" alt="([^"]+)" width="1200"/.exec(readme)
			if (!image) throw new Error(`${locale.code}: README banner missing`)
			const file = resolve(dirname(locale.filename), image[1])
			expect(existsSync(file)).toBe(true)
			const digest = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10)
			expect(basename(file)).toBe(`${locale.code}-${digest}.jpg`)
			expect(image[2]).toBe(locale.strings.hero_image_alt)
			expect(locale.strings.hero_banner_line1).toBeTruthy()
			expect(locale.strings.hero_banner_line2).toBeTruthy()
		})
	}
})
