import {expect, test} from '@playwright/test'

// The UI Kit (`?kit`) renders every design-system primitive in every variant.
// It is the review surface for primitive changes, so it must keep rendering in
// both skies and both directions, without errors and without horizontal overflow.

const SECTIONS = ['typography', 'colour-tokens', 'buttons', 'segmented-controls', 'form-controls', 'badges', 'alerts', 'surfaces', 'progress-and-loading', 'navigation-and-overlays', 'composites-settings', 'composites-choices', 'profile-pickers', 'composites-identity', 'empty-state']

const VARIANTS = [
	{name: 'dark', query: 'theme=dark', dir: 'ltr'},
	{name: 'light', query: 'theme=light', dir: 'ltr'},
	{name: 'rtl', query: 'theme=dark&locale=ar', dir: 'rtl'}
] as const

for (const variant of VARIANTS) {
	test(`ui kit renders every section (${variant.name})`, async ({page}) => {
		const errors: string[] = []
		page.on('pageerror', error => errors.push(error.message))
		await page.setViewportSize({width: 900, height: 760})
		await page.goto(`/?kit&${variant.query}`)
		await expect(page.getByTestId('ui-kit')).toBeVisible()
		await expect(page.locator('html')).toHaveAttribute('dir', variant.dir)

		for (const section of SECTIONS) await expect(page.getByTestId(`kit-${section}`)).toBeVisible()

		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
		expect(overflow).toBeLessThanOrEqual(0)
		expect(errors).toEqual([])
		await page.screenshot({path: `tests/browser/screenshots/ui-kit-${variant.name}.png`})
	})
}

// A profile picker's list row answers the pointer in both skies: an unpicked row
// takes a tint on hover, and the picked row keeps its own tint rather than
// trading it for the hover's.
for (const theme of ['dark', 'light'] as const) {
	test(`profile picker list rows show hover and keep the selected tint (${theme})`, async ({page}) => {
		await page.setViewportSize({width: 900, height: 760})
		await page.goto(`/?kit&theme=${theme}`)
		// The Format step's list: QHD 1440p is picked, Full HD 1080p is not.
		const list = page.getByTestId('kit-profile-picker-list').first()
		const picked = list.getByTestId('kit-profile-option-best-1440')
		const unpicked = list.getByTestId('kit-profile-option-hd-1080')
		await expect(picked).toHaveAttribute('data-selected')
		const background = (row: typeof picked): Promise<string> => row.evaluate(element => getComputedStyle(element).backgroundColor)

		await unpicked.scrollIntoViewIfNeeded()
		const restingUnpicked = await background(unpicked)
		const restingPicked = await background(picked)
		expect(restingPicked).not.toBe(restingUnpicked)

		await unpicked.hover()
		await expect.poll(() => background(unpicked)).not.toBe(restingUnpicked)

		await picked.hover()
		// Let the hover's colour transition finish before reading the picked row.
		await expect.poll(() => picked.evaluate(element => element.getAnimations().length)).toBe(0)
		expect(await background(picked)).toBe(restingPicked)
		await expect.poll(() => background(unpicked)).toBe(restingUnpicked)
	})
}
