import {describe, expect, it} from 'vitest'
import {cn} from '@renderer/lib/utils.js'

// `cn` resolves conflicts with tailwind-merge, which only knows Tailwind's
// default scale. Without the project's custom tokens registered it reads
// `text-label` as a colour and silently drops it next to `text-muted-foreground`.
describe('cn with the project design tokens', () => {
	it('keeps a custom font size next to a text colour', () => {
		for (const size of ['text-label', 'text-caption', 'text-title', 'text-headline', 'text-display', 'text-body']) {
			expect(cn(size, 'text-subtle-foreground').split(' ')).toEqual([size, 'text-subtle-foreground'])
		}
	})

	it('lets a later custom font size replace an earlier one', () => {
		expect(cn('text-sm', 'text-label')).toBe('text-label')
		expect(cn('text-label', 'text-xs')).toBe('text-xs')
	})

	it('treats the custom shadows as shadows', () => {
		expect(cn('shadow-glow', 'shadow-none')).toBe('shadow-none')
		expect(cn('shadow-lg', 'shadow-selected')).toBe('shadow-selected')
	})
})
