import {describe, expect, it} from 'vitest'
import {limitsFor, measure, normalizeName, truncateTo, type LengthUnit} from '@shared/pathLimits.js'

// The numbers asserted here are not conventions — they were measured. macOS was
// probed empirically on APFS (255 UTF-16 code units, verified with 3-byte and
// 4-byte characters); Windows follows Microsoft's statement that the filesystem
// treats names as "an opaque sequence of WCHARs"; Linux counts bytes because the
// VFS treats names as opaque NUL-terminated byte strings.

describe('limitsFor', () => {
	it('counts UTF-16 code units on macOS and Windows, bytes on Linux', () => {
		expect(limitsFor('darwin').componentUnit).toBe('utf16-units')
		expect(limitsFor('win32').componentUnit).toBe('utf16-units')
		expect(limitsFor('linux').componentUnit).toBe('utf8-bytes')
	})

	it('caps every supported platform at 255 per path component', () => {
		for (const platform of ['darwin', 'win32', 'linux'] as const) {
			expect(limitsFor(platform).componentMax).toBe(255)
		}
	})

	it('carries the real per-platform total path ceiling', () => {
		// Windows MAX_PATH is the binding constraint across the whole design.
		expect(limitsFor('win32').pathMax).toBe(260)
		expect(limitsFor('darwin').pathMax).toBe(1024)
		expect(limitsFor('linux').pathMax).toBe(4096)
	})

	it('falls back to POSIX limits for other platforms', () => {
		// Every remaining NodeJS.Platform is POSIX-like, so linux limits are right.
		expect(limitsFor('freebsd')).toEqual(limitsFor('linux'))
		expect(limitsFor('android')).toEqual(limitsFor('linux'))
	})
})

describe('measure', () => {
	const cases: {value: string; unit: LengthUnit; expected: number; why: string}[] = [
		{value: 'abc', unit: 'utf8-bytes', expected: 3, why: 'ASCII is one byte each'},
		{value: 'abc', unit: 'utf16-units', expected: 3, why: 'ASCII is one code unit each'},
		{value: '日', unit: 'utf8-bytes', expected: 3, why: 'CJK is three bytes'},
		{value: '日', unit: 'utf16-units', expected: 1, why: 'CJK is one BMP code unit'},
		{value: '🎬', unit: 'utf8-bytes', expected: 4, why: 'astral is four bytes'},
		{value: '🎬', unit: 'utf16-units', expected: 2, why: 'astral is a surrogate pair'}
	]

	for (const {value, unit, expected, why} of cases) {
		it(`measures ${JSON.stringify(value)} as ${expected} ${unit} — ${why}`, () => {
			expect(measure(value, unit)).toBe(expected)
		})
	}

	it('matches the empirically observed macOS boundary', () => {
		// 127 emoji wrote fine on APFS; 128 failed with ENAMETOOLONG.
		expect(measure('🎬'.repeat(127), 'utf16-units')).toBe(254)
		expect(measure('🎬'.repeat(128), 'utf16-units')).toBe(256)
		// ...while 255 CJK chars (765 bytes) wrote fine, which a byte budget forbids.
		expect(measure('日'.repeat(255), 'utf16-units')).toBe(255)
		expect(measure('日'.repeat(255), 'utf8-bytes')).toBe(765)
	})
})

describe('truncateTo', () => {
	it('leaves a value that already fits untouched', () => {
		expect(truncateTo('Big Buck Bunny', 100, 'utf8-bytes')).toBe('Big Buck Bunny')
	})

	it('never splits a multi-byte character', () => {
		// 5 bytes of budget across 3-byte characters must yield one character, not
		// one character plus a severed byte.
		expect(truncateTo('日本語', 5, 'utf8-bytes')).toBe('日')
		expect(measure(truncateTo('日本語', 5, 'utf8-bytes'), 'utf8-bytes')).toBeLessThanOrEqual(5)
	})

	it('never splits a surrogate pair', () => {
		// An odd UTF-16 budget must drop the whole astral character rather than
		// leave a lone surrogate, which is an invalid filename on every platform.
		const out = truncateTo('🎬🎬🎬', 5, 'utf16-units')
		expect(out).toBe('🎬🎬')
		expect(out).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/)
	})

	it('keeps a ZWJ emoji sequence whole rather than cutting it into fragments', () => {
		// A family emoji is 7 code points joined by zero-width joiners. Cutting on
		// a code-point boundary is surrogate-safe but still splits it into stray
		// people, so the boundary has to be the grapheme.
		const family = '👨‍👩‍👧'
		const budget = measure(family, 'utf16-units') - 1
		expect(truncateTo(`${family}${family}`, budget, 'utf16-units')).toBe('')
		expect(truncateTo(`${family}${family}`, measure(family, 'utf16-units'), 'utf16-units')).toBe(family)
	})

	it('keeps a combining mark attached to its base character', () => {
		// "e" + combining acute is two code points but one visible character;
		// cutting between them strands the accent on whatever follows.
		const decomposed = 'é'
		expect(truncateTo(`${decomposed}${decomposed}`, 3, 'utf16-units')).toBe(decomposed)
	})

	it('honours the unit it is given', () => {
		// The same string and the same number mean different things per platform.
		expect(truncateTo('日日日日日', 3, 'utf8-bytes')).toBe('日')
		expect(truncateTo('日日日日日', 3, 'utf16-units')).toBe('日日日')
	})

	it('returns empty rather than overflowing when nothing fits', () => {
		expect(truncateTo('🎬', 1, 'utf16-units')).toBe('')
		expect(truncateTo('日', 2, 'utf8-bytes')).toBe('')
	})
})

describe('normalizeName', () => {
	it('composes to NFC so decomposed input does not cost double', () => {
		// Verified on APFS: 255 NFC "é" wrote fine, 255 NFD "é" failed — the
		// decomposed form is 510 code units for the same visible 255 characters.
		// Built from an explicit 'e' + U+0301 so this file's own encoding cannot
		// quietly compose it for us.
		const decomposed = 'e\u0301'.repeat(255)
		expect(measure(decomposed, 'utf16-units')).toBe(510)
		expect(measure(normalizeName(decomposed), 'utf16-units')).toBe(255)
	})

	it('leaves already-composed input alone', () => {
		expect(normalizeName('Big Buck Bunny')).toBe('Big Buck Bunny')
	})
})
