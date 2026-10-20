import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

interface FormatBox {
	hasScrollArea: boolean
	pageScrolls: boolean
	pageScrollsSideways: boolean
	chipsPastEdge: number
}

async function openFormats(page: Page, scenario: string): Promise<void> {
	await page.goto(`/?scenario=${scenario}&mockStep=formats&theme=light&style=minimal`)
	await page.waitForSelector('[data-testid="step-formats"] [data-slot="radio-group-chip"]')
}

async function formatBox(page: Page): Promise<FormatBox | null> {
	return page.evaluate(() => {
		const step = document.querySelector('[data-testid="step-formats"]')
		const panel = document.querySelector('[data-testid="wizard-panel"]')?.parentElement
		if (!step || !panel) return null
		const edge = panel.getBoundingClientRect().right
		const chips = [...step.querySelectorAll('[data-slot="radio-group-chip"]')]
		return {hasScrollArea: step.querySelector('[data-slot="scroll-area"]') !== null, pageScrolls: panel.scrollHeight > panel.clientHeight, pageScrollsSideways: panel.scrollWidth > panel.clientWidth, chipsPastEdge: chips.filter(chip => chip.getBoundingClientRect().right > edge + 0.5).length}
	})
}

// The lists are as tall as their streams: no box of their own scrolls ahead of
// time, and the default window holds a whole two-column video with room to spare.
test('in Audio mode the list grows with its streams instead of scrolling inside a box', async ({page}) => {
	await page.setViewportSize({width: 1024, height: 860})
	await openFormats(page, 'single-normal')
	await page.getByRole('button', {name: 'Audio only', exact: true}).click()

	const box = await formatBox(page)
	expect(box).not.toBeNull()
	expect(box?.hasScrollArea).toBe(false)
	expect(box?.pageScrolls).toBe(false)
})

// The narrowest window stacks each chip's size under its label, so HDR and SDR
// columns beside a column of codecs still fit without scrolling sideways.
test('at the minimum window, HDR and SDR columns fit without sideways scrolling', async ({page}) => {
	await page.setViewportSize({width: 720, height: 760})
	await openFormats(page, 'single-codec-mix')

	const box = await formatBox(page)
	expect(box).not.toBeNull()
	expect(box?.pageScrollsSideways).toBe(false)
	expect(box?.chipsPastEdge).toBe(0)
})

test('the Review format strip centres its thumbnail instead of treating it as a card cover', async ({page}) => {
	await page.goto('/?scenario=single-normal&mockStep=confirm&theme=dark')
	await page.waitForSelector('[data-testid="review-format-strip"]')

	const gaps = await page.evaluate(() => {
		const strip = document.querySelector('[data-testid="review-format-strip"]')
		const thumb = strip?.querySelector('img')
		if (!strip || !thumb) return null
		const outer = strip.getBoundingClientRect()
		const inner = thumb.getBoundingClientRect()
		return {top: inner.top - outer.top, bottom: outer.bottom - inner.bottom}
	})
	expect(gaps).not.toBeNull()
	expect(gaps?.top).toBeGreaterThan(4)
	expect(Math.abs((gaps?.top ?? 0) - (gaps?.bottom ?? 0))).toBeLessThanOrEqual(1)
})
