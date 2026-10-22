import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

// The setup screen grows out of the plain splash without moving anything above
// its bar: the name keeps its place, the setup heading takes the greeting's
// slot, and the status line holds its height while it has nothing to say. The
// static boot splash in index.html lays out the same way, so the app's splash
// taking over moves nothing either. (The mascot floats, so the name is the
// fixed point measured.)

const WINDOW = {width: 800, height: 760}

async function tops(page: Page): Promise<{brand: number; slot: number; body: number}> {
	return page.evaluate(() => {
		const top = (selector: string): number => Math.round(document.querySelector(selector)?.getBoundingClientRect().top ?? -1)
		return {brand: top('.splash-anchor .splash-brand'), slot: top('[data-testid="splash-head"]'), body: top('.splash-overlay .splash-text')}
	})
}

for (const who of ['new', 'returning'] as const) {
	test(`[${who}] turning the plain splash into the setup screen moves nothing above the bar`, async ({page}) => {
		await page.setViewportSize(WINDOW)
		await page.goto(`/?scenario=setup-${who}-engine-minutes&theme=dark`)
		await page.waitForSelector('[data-testid="splash-head"][data-setup="false"]', {timeout: 15_000})
		await page.evaluate(async () => document.fonts.ready)
		const before = await tops(page)

		await page.waitForSelector('[data-testid="splash-head"][data-setup="true"]', {timeout: 15_000})
		await expect(page.getByTestId('splash-setup-status')).not.toBeEmpty({timeout: 15_000})

		expect(await tops(page)).toEqual(before)
	})
}

test('the status line keeps its height before a time left can be promised', async ({page}) => {
	await page.setViewportSize(WINDOW)
	await page.goto('/?scenario=setup-new-engine-started&theme=dark')
	const status = page.getByTestId('splash-setup-status')
	await expect(status).toBeEmpty({timeout: 15_000})
	expect((await status.boundingBox())?.height).toBeGreaterThan(10)
})

test("the boot splash puts the name where the app's splash does", async ({page}) => {
	await page.setViewportSize(WINDOW)
	await page.goto('/?scenario=boot-splash&theme=dark')
	await page.waitForSelector('#boot-splash .boot-splash__brand', {state: 'visible', timeout: 15_000})
	await page.evaluate(async () => document.fonts.ready)
	const boot = await page.evaluate(() => Math.round(document.querySelector('#boot-splash .boot-splash__brand')?.getBoundingClientRect().top ?? -1))

	await page.goto('/?scenario=setup-new-engine-minutes&theme=dark')
	await page.waitForSelector('[data-testid="splash-head"][data-setup="false"]', {timeout: 15_000})
	await page.evaluate(async () => document.fonts.ready)

	expect((await tops(page)).brand).toBe(boot)
})
