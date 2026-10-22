import {describe, expect, it} from 'vite-plus/test'
import {youtubeLines} from '../../scripts/youtube-url-contract/release-notes.js'

describe('youtubeLines', () => {
	it('keeps a youtube extractor entry with the changes indented under it, and nothing else', () => {
		const body = [
			'#### Extractor changes',
			'- **vimeo**',
			'    - [Fix login](x) by a',
			'- **youtube**',
			'    - [Fix initial data extraction](x) by b',
			'    - [Add `tv_samsung` client](y) by c',
			'- **youtube:tab**',
			'    - [Support shorts lists](z) by d',
			'- **zdf**',
			'    - [Fix](w) by e',
			'- [Fix youtube cookies](v) by f'
		].join('\n')
		expect(youtubeLines(body)).toEqual(['- **youtube**', '    - [Fix initial data extraction](x) by b', '    - [Add `tv_samsung` client](y) by c', '- **youtube:tab**', '    - [Support shorts lists](z) by d', '- [Fix youtube cookies](v) by f'])
	})

	it('finds nothing in notes without YouTube entries', () => {
		expect(youtubeLines('- **vimeo**\n    - [Fix](x)')).toEqual([])
	})
})
