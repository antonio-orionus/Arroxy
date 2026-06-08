import {describe, expect, it} from 'vitest'

import {knobUrl, readKnobs} from '@renderer/dev/browserMockKnobs.js'

describe('browser mock knobs', () => {
	it('reads known knob values from URL', () => {
		const dark = readKnobs(new URL('http://localhost:5173/?theme=dark'))
		expect(dark.theme).toBe('dark')
		expect(dark.locale).toBeNull()
		expect(dark.platform).toBeNull()

		const light = readKnobs(new URL('http://localhost:5173/?theme=light'))
		expect(light.theme).toBe('light')

		const ar = readKnobs(new URL('http://localhost:5173/?locale=ar'))
		expect(ar.locale).toBe('ar')

		const win = readKnobs(new URL('http://localhost:5173/?platform=win32'))
		expect(win.platform).toBe('win32')

		const mac = readKnobs(new URL('http://localhost:5173/?platform=darwin'))
		expect(mac.platform).toBe('darwin')
	})

	it('returns nulls for empty or invalid params', () => {
		const empty = readKnobs(new URL('http://localhost:5173/'))
		expect(empty.theme).toBeNull()
		expect(empty.locale).toBeNull()
		expect(empty.platform).toBeNull()

		const invalid = readKnobs(new URL('http://localhost:5173/?theme=blurple&locale=xx&platform=amiga'))
		expect(invalid.theme).toBeNull()
		expect(invalid.locale).toBeNull()
		expect(invalid.platform).toBeNull()
	})

	function parseKnobUrl(rel: string): URL {
		return new URL('http://localhost:5173' + rel)
	}

	it('knobUrl round-trips theme, locale, platform', () => {
		const base = {href: 'http://localhost:5173/?scenario=default'}

		const withDark = parseKnobUrl(knobUrl({theme: 'dark'}, base))
		expect(withDark.searchParams.get('theme')).toBe('dark')
		expect(withDark.searchParams.get('scenario')).toBe('default')

		const withLocale = parseKnobUrl(knobUrl({locale: 'ar'}, base))
		expect(withLocale.searchParams.get('locale')).toBe('ar')

		const withPlatform = parseKnobUrl(knobUrl({platform: 'win32'}, base))
		expect(withPlatform.searchParams.get('platform')).toBe('win32')
	})

	it('knobUrl clears params when null is passed', () => {
		const base = {href: 'http://localhost:5173/?theme=dark&locale=ar&platform=darwin'}

		const cleared = parseKnobUrl(knobUrl({theme: null, locale: null, platform: null}, base))
		expect(cleared.searchParams.get('theme')).toBeNull()
		expect(cleared.searchParams.get('locale')).toBeNull()
		expect(cleared.searchParams.get('platform')).toBeNull()
	})
})
