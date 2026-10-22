import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'
import {SUPPORTED_LANGS} from '../../src/shared/i18n/index.js'

// The list prompt's controls stay inside the dialog in every locale at the
// minimum window: the answers wrap their text, and the Limit row (or, from
// Interactive, the count inside its sentence) wraps rather than spilling past
// the dialog's edge.

const MIN_WINDOW = {width: 720, height: 760}
const SCENARIOS = ['dialog-mixed-url', 'dialog-mixed-url-quick', 'dialog-mixed-url-mix'] as const

async function openDialog(page: Page, scenario: string, locale: string): Promise<void> {
	await page.setViewportSize(MIN_WINDOW)
	await page.goto(`/?scenario=${scenario}&locale=${locale}&theme=dark`)
	await page.waitForSelector('[data-testid="mixed-playlist-probe-limit-trigger"]', {timeout: 15_000})
	await page.waitForFunction(expected => document.documentElement.lang === expected, locale, {timeout: 15_000})
	await page.evaluate(async () => document.fonts.ready)
}

// Dialog controls that reach past the dialog's edge or clip their own text, in px.
async function spillingControls(page: Page): Promise<{label: string; spillPx: number}[]> {
	return page.evaluate(() => {
		const dialog = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')
		if (!dialog) return [{label: 'dialog-content missing', spillPx: 0}]
		const edge = dialog.getBoundingClientRect()
		return [...dialog.querySelectorAll<HTMLElement>('button')].flatMap(button => {
			const rect = button.getBoundingClientRect()
			const spillPx = Math.round(Math.max(rect.right - edge.right, edge.left - rect.left, button.scrollWidth - button.clientWidth))
			return spillPx > 1 ? [{label: button.textContent ?? '', spillPx}] : []
		})
	})
}

for (const scenario of SCENARIOS) {
	for (const locale of SUPPORTED_LANGS) {
		test(`[min-window][${locale}] ${scenario}: the choices stay inside the dialog`, async ({page}) => {
			await openDialog(page, scenario, locale)
			await expect.poll(() => spillingControls(page)).toEqual([])
		})
	}
}
