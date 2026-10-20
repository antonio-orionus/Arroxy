import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'
import {SUPPORTED_LANGS} from '../../src/shared/i18n/index.js'

// The footer's left side holds settings (zoom, theme, look, language) and
// clips whatever does not fit; the right side holds labelled actions. The
// labels give way to their icons before any setting is cut off, in every
// locale at the minimum window. Where everything fits, the labels stay. (The
// UI zoom scales the content above the footer, never the footer itself.)

const MIN_WINDOW = {width: 720, height: 760}
const DEFAULT_WINDOW = {width: 1024, height: 860}

async function openFooter(page: Page, locale: string, viewport: {width: number; height: number}): Promise<void> {
	await page.setViewportSize(viewport)
	await page.goto(`/?scenario=settings&locale=${locale}&theme=dark`)
	await page.waitForSelector('[data-testid="footer-left-controls"]', {timeout: 15_000})
	await page.waitForFunction(expected => document.documentElement.lang === expected, locale, {timeout: 15_000})
	await page.evaluate(async () => document.fonts.ready)
}

// Settings on the left that the footer cuts off, in px past the left side's edge.
async function clippedSettings(page: Page): Promise<{label: string; spillPx: number}[]> {
	return page.evaluate(() => {
		const left = document.querySelector<HTMLElement>('[data-testid="footer-left-controls"]')
		if (!left) return [{label: 'footer-left-controls missing', spillPx: 0}]
		const edge = left.getBoundingClientRect()
		const controls = [...left.querySelectorAll<HTMLElement>(':scope > :not([aria-hidden]):not([data-testid="footer-language-picker"])'), ...left.querySelectorAll<HTMLElement>('[data-slot="select-trigger"]')]
		return controls.flatMap(control => {
			const rect = control.getBoundingClientRect()
			const spillPx = Math.round(Math.max(rect.right - edge.right, edge.left - rect.left))
			return spillPx > 1 ? [{label: control.getAttribute('aria-label') ?? control.dataset.testid ?? control.className.slice(0, 32), spillPx}] : []
		})
	})
}

async function hiddenLabels(page: Page): Promise<string[]> {
	return page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-testid="footer-actions"] button > span')].filter(label => label.getBoundingClientRect().width <= 1).map(label => label.textContent ?? ''))
}

for (const locale of SUPPORTED_LANGS) {
	test(`[min-window][${locale}] the footer keeps every setting in view`, async ({page}) => {
		await openFooter(page, locale, MIN_WINDOW)
		await expect.poll(() => clippedSettings(page)).toEqual([])
	})
}

for (const locale of SUPPORTED_LANGS) {
	test(`[default-window][${locale}] the footer actions keep their labels where they fit`, async ({page}) => {
		await openFooter(page, locale, DEFAULT_WINDOW)
		await expect.poll(() => hiddenLabels(page)).toEqual([])
		expect(await clippedSettings(page)).toEqual([])
	})
}

// Resizing works both ways: the labels give way on the narrow window and come
// back once it is wide enough again.
test('the footer labels come back when the window widens', async ({page}) => {
	await openFooter(page, 'fr', MIN_WINDOW)
	await expect.poll(() => hiddenLabels(page)).not.toEqual([])
	await page.setViewportSize(DEFAULT_WINDOW)
	await expect.poll(() => hiddenLabels(page)).toEqual([])
	await page.setViewportSize(MIN_WINDOW)
	await expect.poll(() => hiddenLabels(page)).not.toEqual([])
	expect(await clippedSettings(page)).toEqual([])
})

// Icon-only, every action still names itself on hover.
test('each footer action shows its name on hover once its label gives way', async ({page}) => {
	await openFooter(page, 'en', MIN_WINDOW)
	await expect.poll(() => hiddenLabels(page)).not.toEqual([])
	for (const [id, name] of [
		['btn-share', 'Share'],
		['btn-discord', 'Discord'],
		['btn-feedback', 'Feedback']
	] as const) {
		const tip = page.locator('[data-slot="tooltip-content"]:not([data-testid="style-hint"])')
		await page.getByTestId(id).hover()
		await expect(tip).toContainText(name)
		await page.mouse.move(0, 0)
		await expect(tip).toHaveCount(0)
	}
})
