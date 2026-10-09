import {readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {cn} from '@renderer/lib/utils.js'

// `cn` resolves conflicts with tailwind-merge, which only knows Tailwind's
// default scale. Every custom font size and shadow declared in styles.css must
// be registered in lib/utils.ts, or tailwind-merge reads `text-label` as a
// colour and silently drops it next to `text-muted-foreground`. These lists
// come from the stylesheet, so a new token that is not registered fails here.
// Only @theme blocks declare the scale; elsewhere `--text-subtle` is a colour.
const THEME = [...readFileSync(path.resolve('src/renderer/src/styles.css'), 'utf8').matchAll(/@theme(?: inline)? \{([\s\S]*?)\n\}/g)].map(match => match[1]).join('\n')
const FONT_SIZES = [...THEME.matchAll(/^\s*--text-([a-z]+):/gm)].map(match => `text-${match[1]}`)
const SHADOWS = [...THEME.matchAll(/^\s*--shadow-([a-z]+):/gm)].map(match => `shadow-${match[1]}`)

describe('cn with the project design tokens', () => {
	it('finds the custom tokens in styles.css', () => {
		expect(FONT_SIZES).toEqual(expect.arrayContaining(['text-label', 'text-caption', 'text-title']))
		expect(SHADOWS).toEqual(expect.arrayContaining(['shadow-glow', 'shadow-selected']))
	})

	it('keeps every custom font size next to a text colour', () => {
		for (const size of FONT_SIZES) expect(cn(size, 'text-subtle-foreground').split(' ')).toEqual([size, 'text-subtle-foreground'])
	})

	it('lets a later font size replace an earlier one, custom or default', () => {
		for (const size of FONT_SIZES) {
			expect(cn('text-sm', size)).toBe(size)
			expect(cn(size, 'text-xs')).toBe('text-xs')
		}
	})

	it('treats every custom shadow as a shadow', () => {
		for (const shadow of SHADOWS) {
			expect(cn(shadow, 'shadow-none')).toBe('shadow-none')
			expect(cn('shadow-lg', shadow)).toBe(shadow)
		}
	})
})
