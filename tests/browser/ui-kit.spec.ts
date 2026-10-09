import {expect, test} from '@playwright/test'

// The UI Kit (`?kit`) renders every design-system primitive in every variant.
// It is the review surface for primitive changes, so it must keep rendering in
// both skies and both directions, without errors and without horizontal overflow.

const SECTIONS = ['typography', 'colour-tokens', 'buttons', 'segmented-controls', 'form-controls', 'badges', 'alerts', 'surfaces', 'progress-and-loading', 'navigation-and-overlays', 'empty-state']

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
