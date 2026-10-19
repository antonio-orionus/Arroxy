// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import {compactSize, humanSize} from '@shared/format.js'

describe('humanSize', () => {
	it('names 1024-based sizes with binary units and keeps one decimal', () => {
		expect(humanSize(1536)).toBe('1.5 KiB')
		expect(humanSize(143_250_432)).toBe('136.6 MiB')
		expect(humanSize(3 * 1024 ** 3)).toBe('3.0 GiB')
		expect(humanSize(1023 * 1024 ** 2)).toBe('1023.0 MiB')
	})

	it('formats the number for the UI locale', () => {
		expect(humanSize(143_250_432, 'de')).toBe('136,6 MiB')
		expect(humanSize(1023 * 1024 ** 2, 'de')).toBe('1.023,0 MiB')
	})
})

describe('compactSize', () => {
	it('uses binary units and about three significant digits', () => {
		expect(compactSize(512)).toBe('512 B')
		expect(compactSize(1536)).toBe('1.5 KiB')
		expect(compactSize(143_250_432)).toBe('137 MiB')
		expect(compactSize(3 * 1024 ** 3)).toBe('3 GiB')
		expect(compactSize(1023 * 1024 ** 2)).toBe('1023 MiB')
	})

	it('formats the number for the UI locale', () => {
		expect(compactSize(1536, 'de')).toBe('1,5 KiB')
	})
})
