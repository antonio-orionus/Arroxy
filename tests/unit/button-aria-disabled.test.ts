import {describe, expect, it} from 'vite-plus/test'
import {buttonVariants} from '@renderer/components/ui/button.variants.js'

// A button blocked with aria-disabled (still focusable, so its tooltip can say
// why) must look like a disabled one: every `disabled:` look has an
// `aria-disabled:` twin. Pointer events are the exception: a blocked button
// keeps them for its tooltip, and its click handler is what ignores the press.
const VARIANTS = ['default', 'glow', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const

describe('button variants under aria-disabled', () => {
	it.each(VARIANTS)('%s gives every disabled look an aria-disabled twin', variant => {
		const classes = buttonVariants({variant}).split(/\s+/)
		const looks = classes.filter(name => name.startsWith('disabled:') && name !== 'disabled:pointer-events-none')
		for (const look of looks) expect(classes).toContain(`aria-${look}`)
	})

	it('gives no press nudge to a blocked button', () => {
		expect(buttonVariants()).toMatch(/(^|\s)active:[^\s]*not-aria-disabled:translate-y-px(\s|$)/)
	})
})
