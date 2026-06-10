import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

const root = process.cwd()

describe('renderer startup shell', () => {
	it('ships a branded boot splash before the React app mounts', () => {
		const html = readFileSync(join(root, 'src/renderer/index.html'), 'utf8')

		expect(html).toContain('id="boot-splash"')
		expect(html).toContain('Arroxy')
		expect(html).toContain('Arroxy is warming up')
		expect(html).toContain('id="root"')
		expect(html.indexOf('id="boot-splash"')).toBeGreaterThanOrEqual(html.indexOf('id="root"'))
	})
})
