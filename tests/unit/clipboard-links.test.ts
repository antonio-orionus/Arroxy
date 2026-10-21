import {describe, expect, it} from 'vite-plus/test'
import {classifyClipboardText, classifyPastedText} from '@shared/clipboardLinks.js'

describe('classifyPastedText', () => {
	const link = 'https://www.youtube.com/watch?v=one'

	it('takes the one link out of whatever the clipboard holds', () => {
		expect(classifyPastedText(` ${link}\n`)).toEqual({kind: 'single', url: link})
		expect(classifyPastedText(`watch this ${link} later`)).toEqual({kind: 'single', url: link})
	})

	it('keeps characters inside a link that is the whole clipboard', () => {
		expect(classifyPastedText('https://media.example/clip,part1.mp4')).toEqual({kind: 'single', url: 'https://media.example/clip,part1.mp4'})
		expect(classifyPastedText('https://media.example/watch?a=1;b=2')).toEqual({kind: 'single', url: 'https://media.example/watch?a=1;b=2'})
	})

	it('hands several links to Bulk URLs as copied', () => {
		const raw = `${link}\nhttps://www.youtube.com/watch?v=two`
		expect(classifyPastedText(raw)).toEqual({kind: 'bulk', raw})
	})

	it('ignores links that do not parse', () => {
		expect(classifyPastedText('https://:bad')).toEqual({kind: 'none'})
		expect(classifyPastedText(`https://? and ${link}`)).toEqual({kind: 'single', url: link})
	})

	it('finds nothing in text without a media link', () => {
		expect(classifyPastedText('')).toEqual({kind: 'none'})
		expect(classifyPastedText('just some words')).toEqual({kind: 'none'})
		expect(classifyPastedText('https://example.com/report.pdf')).toEqual({kind: 'none'})
	})
})

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

	it('does not take a malformed link', () => {
		expect(classifyClipboardText('https://[invalid')).toEqual({kind: 'none'})
		expect(classifyClipboardText('https://example.com:bad/video')).toEqual({kind: 'none'})
		expect(classifyClipboardText('https://')).toEqual({kind: 'none'})
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
