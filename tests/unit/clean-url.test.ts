import {describe, expect, it} from 'vite-plus/test'
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

	// A YouTube "show" page is a playlist under another address. yt-dlp reads
	// that address as a playlist titled "show", without its channel and with
	// videos missing, so it goes in as the playlist it is.
	describe('YouTube show pages', () => {
		const PLAYLIST = 'https://www.youtube.com/playlist?list=PLoSWVnSA9vG_s-XT40oPKF0iWFGw8pOp2'

		it.each([
			'https://www.youtube.com/show/VLPLoSWVnSA9vG_s-XT40oPKF0iWFGw8pOp2?sbp=Kgt2OVF0TTZxbkc1MEAB',
			'https://www.youtube.com/show/VLPLoSWVnSA9vG_s-XT40oPKF0iWFGw8pOp2',
			'https://m.youtube.com/show/VLPLoSWVnSA9vG_s-XT40oPKF0iWFGw8pOp2/',
			'https://youtube.com/show/VLPLoSWVnSA9vG_s-XT40oPKF0iWFGw8pOp2?si=tracker'
		])('takes %s as its playlist', url => {
			expect(cleanUrl(url)).toBe(PLAYLIST)
		})

		it.each(['https://www.youtube.com/show/SCabcdefghijklmnop', 'https://www.youtube.com/show/VL', 'https://www.youtube.com/show/VLPL1/extra', 'https://example.com/show/VLPL1'])('leaves %s alone', url => {
			expect(cleanUrl(url)).toBe(url)
		})
	})

	// yt-dlp hands these to its playlist extractor, which drops the video, so
	// --no-playlist cannot single it out; only watch?v=…&list=… honours it.
	describe('a video address carrying a list', () => {
		const WATCH = 'https://www.youtube.com/watch?v=HL1UzIK-flA&list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd'

		it.each([
			'https://www.youtube.com/shorts/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd',
			'https://www.youtube.com/live/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd',
			'https://www.youtube.com/embed/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd',
			'https://www.youtube.com/v/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd',
			'https://www.youtube.com/e/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd',
			'https://m.youtube.com/shorts/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd',
			'https://www.youtube-nocookie.com/embed/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd'
		])('reads %s as its watch address', url => {
			expect(cleanUrl(url)).toBe(WATCH)
		})

		it('keeps the position in the list', () => {
			expect(cleanUrl('https://www.youtube.com/embed/HL1UzIK-flA?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd&index=3')).toBe(`${WATCH}&index=3`)
		})

		it.each(['https://www.youtube.com/embed/videoseries?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd', 'https://www.youtube.com/shorts/HL1UzIK-flA', 'https://www.youtube.com/clip/UgkxSlug?list=PL_5Bp3hQ_Iu30q5d6qXbZct8zseCSdGzd', 'https://example.com/embed/HL1UzIK-flA?list=PL1'])('leaves %s alone', url => {
			expect(cleanUrl(url)).toBe(url)
		})
	})
})
