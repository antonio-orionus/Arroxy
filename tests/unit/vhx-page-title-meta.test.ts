import {describe, expect, it} from 'vite-plus/test'
import {extractPageTitleMeta} from '@main/services/vhxTitleRecovery.js'

describe('extractPageTitleMeta', () => {
	it('decodes every HTML entity a page title can carry, not just the XML five', () => {
		const html = `<meta property="og:title" content="Caf&eacute; &mdash; Live&nbsp;at &ldquo;Rock&rdquo; &#8470;&#x31; &amp; More &hellip;">
<meta property="og:site_name" content="Stra&szlig;e &copy; 2026">`

		expect(extractPageTitleMeta(html)).toEqual({title: 'Café — Live at “Rock” №1 & More …', siteName: 'Straße © 2026'})
	})

	it('leaves text that only looks like an entity alone', () => {
		const html = '<meta property="og:title" content="R&D &notanentity; done">'

		expect(extractPageTitleMeta(html).title).toBe('R&D &notanentity; done')
	})
})
