import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'
import {SUPPORTED_LANGS} from '../../src/shared/i18n/index.js'

// A dialog's footer actions stay inside the dialog in every locale at the
// minimum window. The mixed-URL prompt opened from the URL tab carries the
// longest pair ("Download this video" / "Download whole playlist"), which ran
// past the dialog's edge when the actions could not wrap.

const MIN_WINDOW = {width: 720, height: 760}
const SCENARIOS = ['dialog-mixed-url', 'dialog-mixed-url-quick'] as const

async function openDialog(page: Page, scenario: string, locale: string): Promise<void> {
	await page.setViewportSize(MIN_WINDOW)
	await page.goto(`/?scenario=${scenario}&locale=${locale}&theme=dark`)
	await page.waitForSelector('[data-slot="dialog-footer"] button', {timeout: 15_000})
	await page.waitForFunction(expected => document.documentElement.lang === expected, locale, {timeout: 15_000})
	await page.evaluate(async () => document.fonts.ready)
}

// Footer actions that reach past the dialog's edge, in px.
async function spillingActions(page: Page): Promise<{label: string; spillPx: number}[]> {
	return page.evaluate(() => {
		const dialog = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')
		if (!dialog) return [{label: 'dialog-content missing', spillPx: 0}]
		const edge = dialog.getBoundingClientRect()
		return [...dialog.querySelectorAll<HTMLElement>('[data-slot="dialog-footer"] button')].flatMap(button => {
			const rect = button.getBoundingClientRect()
			const spillPx = Math.round(Math.max(rect.right - edge.right, edge.left - rect.left, button.scrollWidth - button.clientWidth))
			return spillPx > 1 ? [{label: button.textContent ?? '', spillPx}] : []
		})
	})
}

for (const scenario of SCENARIOS) {
	for (const locale of SUPPORTED_LANGS) {
		test(`[min-window][${locale}] ${scenario}: the footer actions stay inside the dialog`, async ({page}) => {
			await openDialog(page, scenario, locale)
			await expect.poll(() => spillingActions(page)).toEqual([])
		})
	}
}
