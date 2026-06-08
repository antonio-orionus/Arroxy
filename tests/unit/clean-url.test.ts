import {describe, expect, it} from 'vitest'
import {cleanUrl} from '@shared/cleanUrl.js'

describe('cleanUrl — ClearURLs ruleset port', () => {
	it('returns malformed URLs unchanged', () => {
		expect(cleanUrl('not-a-url')).toBe('not-a-url')
		expect(cleanUrl('')).toBe('')
	})

	it('strips utm_* params from any URL (globalRules)', () => {
		const cleaned = cleanUrl('https://example.com/post?utm_source=twitter&utm_medium=social&keep=this')
		const url = new URL(cleaned)
		expect(url.searchParams.get('utm_source')).toBeNull()
		expect(url.searchParams.get('utm_medium')).toBeNull()
		expect(url.searchParams.get('keep')).toBe('this')
	})

	it('strips fbclid from any URL', () => {
		const cleaned = cleanUrl('https://example.com/p?fbclid=abc&v=1')
		const url = new URL(cleaned)
		expect(url.searchParams.get('fbclid')).toBeNull()
		expect(url.searchParams.get('v')).toBe('1')
	})

	it('strips youtube tracking params (feature, gclid, kw, si, pp) and preserves v=', () => {
		const cleaned = cleanUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&si=tracker&pp=abc')
		const url = new URL(cleaned)
		expect(url.searchParams.get('v')).toBe('dQw4w9WgXcQ')
		expect(url.searchParams.get('feature')).toBeNull()
		expect(url.searchParams.get('si')).toBeNull()
		expect(url.searchParams.get('pp')).toBeNull()
	})

	it('preserves &list= on YouTube playlist URLs', () => {
		const cleaned = cleanUrl('https://www.youtube.com/watch?v=abc&list=PLxyz&utm_source=share')
		const url = new URL(cleaned)
		expect(url.searchParams.get('list')).toBe('PLxyz')
		expect(url.searchParams.get('v')).toBe('abc')
		expect(url.searchParams.get('utm_source')).toBeNull()
	})

	it('strips nothing when URL has no tracking params', () => {
		const input = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
		expect(cleanUrl(input)).toBe(input)
	})

	it('unwraps youtube /redirect URLs', () => {
		const cleaned = cleanUrl('https://www.youtube.com/redirect?q=https%3A%2F%2Fexample.com%2Ftarget')
		expect(cleaned).toContain('example.com/target')
	})

	describe('whitespace stripping (chat/terminal word-wrap recovery)', () => {
		it('strips a newline injected mid-querystring (terminal wrap)', () => {
			const wrapped = 'https://www.youtube.com/watch?v=sZ9Y3bpR-nc&list=PLAM7IOZnvD2Ezp4UOp26x91d-64EIs\n  9M3'
			const cleaned = cleanUrl(wrapped)
			const url = new URL(cleaned)
			expect(url.searchParams.get('list')).toBe('PLAM7IOZnvD2Ezp4UOp26x91d-64EIs9M3')
		})

		it('strips literal spaces injected mid-querystring', () => {
			const wrapped = 'https://www.youtube.com/watch?v=abc&list=PL XYZ'
			const cleaned = cleanUrl(wrapped)
			const url = new URL(cleaned)
			expect(url.searchParams.get('list')).toBe('PLXYZ')
		})

		it('strips tabs + CRLF', () => {
			const wrapped = 'https://www.youtube.com/watch?\tv=abc\r\n&list=PL1'
			const cleaned = cleanUrl(wrapped)
			const url = new URL(cleaned)
			expect(url.searchParams.get('v')).toBe('abc')
			expect(url.searchParams.get('list')).toBe('PL1')
		})

		it('leaves already-encoded %20 sequences alone (not whitespace at JS level)', () => {
			const input = 'https://example.com/path%20with%20spaces?q=1'
			expect(cleanUrl(input)).toBe(input)
		})
	})
})
