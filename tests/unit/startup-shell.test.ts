import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

const root = process.cwd()

describe('renderer startup shell', () => {
	it('ships a branded boot splash before the React app mounts', () => {
		const html = readFileSync(join(root, 'src/renderer/index.html'), 'utf8')

		expect(html).toContain('id="boot-splash"')
		expect(html).toContain('Arroxy')
		expect(html).toContain('/mascot-main.png')
		expect(html).toContain('Starting Arroxy')
		expect(html).not.toContain('Arroxy is warming up')
		expect(html).toContain('id="root"')
		expect(html.indexOf('id="boot-splash"')).toBeGreaterThanOrEqual(html.indexOf('id="root"'))
	})

	it('ships theme-aware boot splash styles before settings load', () => {
		const html = readFileSync(join(root, 'src/renderer/index.html'), 'utf8')

		expect(html).toContain('@media (prefers-color-scheme: light)')
		expect(html).toContain('color-scheme: light')
		expect(html).toContain('--boot-splash-bg')
		expect(html).toContain('--boot-splash-bar-track')
	})

	it('suppresses the static boot splash in browser-mock screen scenarios', () => {
		const html = readFileSync(join(root, 'src/renderer/index.html'), 'utf8')

		expect(html).toContain('data-app-mode="%MODE%"')
		expect(html).toContain("html[data-app-mode='browser-mock'] #boot-splash")
	})

	it('keeps the post-boot body background on the active app sky', () => {
		const css = readFileSync(join(root, 'src/renderer/src/styles.css'), 'utf8')

		const unlayeredBackgroundOverride = ':root,\nbody {\n\tbackground: var(--background);\n}'

		expect(css).toContain(unlayeredBackgroundOverride)
		expect(css.indexOf(unlayeredBackgroundOverride)).toBeLessThan(css.indexOf('@layer base'))
	})

	it('references a packaged-safe mascot asset', () => {
		const html = readFileSync(join(root, 'src/renderer/index.html'), 'utf8')
		const match = /src="\/([^"]*mascot[^"]*)"/.exec(html)

		expect(match?.[1]).toBe('mascot-main.png')
		expect(existsSync(join(root, 'src/renderer/public', match?.[1] ?? ''))).toBe(true)
	})
})
