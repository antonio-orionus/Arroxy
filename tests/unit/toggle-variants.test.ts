import {describe, expect, it} from 'vitest'
import {toggleVariants} from '@renderer/components/ui/toggle.variants.js'

describe('toggleVariants', () => {
	it('lets a default label shrink and wrap', () => {
		const classes = toggleVariants({}).split(' ')
		expect(classes).toContain('min-w-0')
		expect(classes).toContain('wrap-anywhere')
		expect(classes).not.toContain('whitespace-nowrap')
		expect(classes).not.toContain('shrink-0')
	})

	it('never pins a fixed height, so a wrapped label can grow the control', () => {
		for (const size of ['default', 'sm', 'lg'] as const) {
			const classes = toggleVariants({size}).split(' ')
			expect(classes.filter(c => /^h-\d/.test(c))).toEqual([])
			expect(classes.some(c => /^min-h-\d/.test(c))).toBe(true)
		}
	})

	it('never pins a minimum width, so a narrow track can squeeze the control', () => {
		for (const size of ['default', 'sm', 'lg'] as const) {
			expect(
				toggleVariants({size})
					.split(' ')
					.filter(c => /^min-w-[1-9]/.test(c))
			).toEqual([])
		}
	})

	it('keeps single-line behaviour available through shape="chip"', () => {
		const classes = toggleVariants({shape: 'chip'}).split(' ')
		expect(classes).toContain('shrink-0')
		expect(classes).toContain('whitespace-nowrap')
	})

	it('owns the pressed-state brand styling so call sites never restate it', () => {
		const base = toggleVariants({})
		for (const token of ['aria-pressed:border-[var(--brand)]', 'aria-pressed:bg-[var(--brand-dim)]', 'aria-pressed:text-[var(--brand)]', 'data-[state=on]:border-[var(--brand)]', 'data-[state=on]:bg-[var(--brand-dim)]', 'data-[state=on]:text-[var(--brand)]']) {
			expect(base).toContain(token)
		}
	})
})
