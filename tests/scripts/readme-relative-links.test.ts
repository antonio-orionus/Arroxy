import {describe, expect, it} from 'vite-plus/test'
import {rebaseRelativeLinks} from '../../readme-src/build.mjs'

const TRANSLATED = 'docs/readme/README.de.md'

describe('rebaseRelativeLinks', () => {
	it('climbs back to the repo root for a translated README', () => {
		const out = rebaseRelativeLinks('[Licence](LICENSE) <img src="build/a.png" /> <a href="CHANGELOG.md">', TRANSLATED)
		expect(out).toBe('[Licence](../../LICENSE) <img src="../../build/a.png" /> <a href="../../CHANGELOG.md">')
	})

	it('rebases a dark-mode srcset image', () => {
		const out = rebaseRelativeLinks('<source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" />', TRANSLATED)
		expect(out).toBe('<source media="(prefers-color-scheme: dark)" srcset="../../build/Global-hotkey-dark.png" />')
	})

	it('rebases every candidate of a srcset list, keeping its descriptors', () => {
		const out = rebaseRelativeLinks('<img srcset="build/a.png 1x, build/a@2x.png 2x" />', TRANSLATED)
		expect(out).toBe('<img srcset="../../build/a.png 1x, ../../build/a@2x.png 2x" />')
	})

	it('keeps a comma inside a srcset URL as part of that URL', () => {
		const out = rebaseRelativeLinks('<img srcset="data:image/png;base64,AAAA 1x,build/b.png 2x" />', TRANSLATED)
		expect(out).toBe('<img srcset="data:image/png;base64,AAAA 1x,../../build/b.png 2x" />')
	})

	it('leaves absolute, anchor and root-relative targets alone', () => {
		const text = '<source srcset="https://api.star-history.com/chart?repos=a&theme=dark" /> [top](#top) <img src="/x.png" />'
		expect(rebaseRelativeLinks(text, TRANSLATED)).toBe(text)
	})

	it('changes nothing for the root README', () => {
		const text = '<source srcset="build/Global-hotkey-dark.png" /> <img src="build/a.png" />'
		expect(rebaseRelativeLinks(text, 'README.md')).toBe(text)
	})
})
