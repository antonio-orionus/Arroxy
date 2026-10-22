import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'
import {SUPPORTED_LANGS} from '../../src/shared/i18n/index.js'

// The playlist-profiles table's column headers never clip their label in any
// locale at the minimum window: an uppercase, letter-spaced header cut off
// mid-word ("ДЛИТЕЛЬНОС" in Russian) reads as a different word. A label too
// long for its column ends in an ellipsis, and its hint shows the whole label.

const MIN_WINDOW = {width: 720, height: 760}
const LABEL = '[data-testid="playlist-profile-column-label"]'

async function openProfiles(page: Page, locale: string): Promise<void> {
	await page.setViewportSize(MIN_WINDOW)
	await page.goto(`/?scenario=playlist-multi-profile&locale=${locale}&theme=dark`)
	await page.waitForSelector('[data-testid="playlist-profile-scroll"] th', {timeout: 15_000})
	await page.waitForFunction(expected => document.documentElement.lang === expected, locale, {timeout: 15_000})
	await page.evaluate(async () => document.fonts.ready)
}

interface HeaderLabel {
	text: string
	// The label is wider than the space it is given.
	truncated: boolean
	ellipsis: boolean
	// The label reaches past its header cell's content box, in px.
	spillPx: number
}

async function headerLabels(page: Page): Promise<HeaderLabel[]> {
	return page.evaluate(() =>
		[...document.querySelectorAll<HTMLElement>('[data-testid="playlist-profile-scroll"] th')].flatMap(cell => {
			const text = cell.textContent ?? ''
			if (text === '') return []
			const label = cell.querySelector<HTMLElement>('[data-testid="playlist-profile-column-label"]')
			const style = getComputedStyle(cell)
			const cellRect = cell.getBoundingClientRect()
			const contentLeft = cellRect.left + Number.parseFloat(style.paddingLeft)
			const contentRight = cellRect.right - Number.parseFloat(style.paddingRight)
			const range = document.createRange()
			range.selectNodeContents(cell)
			// A clipped label's box is its cell's; its text's box is the whole label.
			const labelRect = label ? label.getBoundingClientRect() : range.getBoundingClientRect()
			const spillPx = Math.round(Math.max(labelRect.right - contentRight, contentLeft - labelRect.left, 0))
			return [{text, truncated: label ? label.scrollWidth > label.clientWidth : spillPx > 0, ellipsis: label ? getComputedStyle(label).textOverflow === 'ellipsis' : false, spillPx}]
		})
	)
}

for (const locale of SUPPORTED_LANGS) {
	test(`[min-window][${locale}] playlist profiles: every column header shows its whole label, or an ellipsis and a hint with it`, async ({page}) => {
		await openProfiles(page, locale)
		const labels = await headerLabels(page)
		expect(labels.length).toBe(3)
		for (const label of labels) {
			expect(label, `${label.text} stays inside its header cell`).toMatchObject({spillPx: 0})
			if (!label.truncated) continue
			expect(label, `${label.text} ends in an ellipsis`).toMatchObject({ellipsis: true})
			const hint = page.locator('[data-slot="tooltip-content"][data-open]', {hasText: label.text})
			await page.locator(LABEL, {hasText: label.text}).hover()
			await expect(hint).toHaveText(label.text)
		}
	})
}

// The locale the cut-off header was reported in shows the whole word.
test('[min-window][ru] playlist profiles: the Duration header is not shortened', async ({page}) => {
	await openProfiles(page, 'ru')
	expect((await headerLabels(page)).filter(label => label.truncated).map(label => label.text)).toEqual([])
})
