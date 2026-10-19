import {describe, expect, it} from 'vite-plus/test'
import {classifyClipboardText} from '@shared/clipboardLinks.js'

describe('classifyClipboardText', () => {
	it('takes a bare http(s) link as a single link', () => {
		expect(classifyClipboardText('https://vimeo.com/12345')).toEqual({kind: 'single', url: 'https://vimeo.com/12345'})
		expect(classifyClipboardText('http://example.com/video/1')).toEqual({kind: 'single', url: 'http://example.com/video/1'})
	})

	it('ignores whitespace around the link', () => {
		expect(classifyClipboardText('  \n https://youtu.be/abc \n')).toEqual({kind: 'single', url: 'https://youtu.be/abc'})
	})

	it('returns the cleaned link', () => {
		expect(classifyClipboardText('https://www.youtube.com/watch?v=abc&si=tracking')).toEqual({kind: 'single', url: 'https://www.youtube.com/watch?v=abc'})
	})

	it('does not take a link inside other text', () => {
		expect(classifyClipboardText('watch this later: https://vimeo.com/12345')).toEqual({kind: 'none'})
		expect(classifyClipboardText('https://vimeo.com/12345 is great')).toEqual({kind: 'none'})
	})

	it('does not take a link to an obvious non-media file', () => {
		expect(classifyClipboardText('https://example.com/photo.jpg')).toEqual({kind: 'none'})
		expect(classifyClipboardText('https://example.com/report.pdf')).toEqual({kind: 'none'})
	})

	it('does not take other schemes or plain text', () => {
		expect(classifyClipboardText('ftp://example.com/video.mp4')).toEqual({kind: 'none'})
		expect(classifyClipboardText('youtube.com/watch?v=abc')).toEqual({kind: 'none'})
		expect(classifyClipboardText('not a url')).toEqual({kind: 'none'})
		expect(classifyClipboardText('   ')).toEqual({kind: 'none'})
	})

	it('takes several links in any text as a bulk list', () => {
		expect(classifyClipboardText('Grab https://example.com/one, https://example.com/two')).toEqual({kind: 'bulk', urls: ['https://example.com/one', 'https://example.com/two']})
	})

	it('counts a repeated link once', () => {
		expect(classifyClipboardText('https://example.com/one\nhttps://example.com/one')).toEqual({kind: 'none'})
	})
})
