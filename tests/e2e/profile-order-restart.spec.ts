// Fixture Product E2E — download profile order across a restart.
//
// 1. User-facing risk: a user drags download profiles into their own order on
//    the Profiles tab, quits, and starts Arroxy again. The order must come back
//    as they left it. Unit and renderer tests cover the order model and the
//    settings file separately; only a real app proves the drag reaches the
//    settings file over IPC before quitting and comes back through startup.
//    Run in dark and light themes, and in a right-to-left language, where the
//    grid's columns run the other way.
//
// 2. Fixtures: none downloaded. Each case seeds its theme and language in the
//    settings file and keeps the default profiles, in catalog order.
//
// 3. Real user actions: open the Profiles tab, drag the first card by its grip
//    onto the third card with the mouse, quit, start the app again.
//
// 4. Milestones: the seeded theme and text direction are on the page; the card
//    order changes on the drop.
//
// 5. Oracles: the card order after the drop, the order saved in the settings
//    file, and the card order after the restart, which must equal both.
import fs from 'node:fs'
import path from 'node:path'
import {expect, test, type Page} from '@playwright/test'
import {allDownloadProfiles, DEFAULT_DOWNLOAD_PROFILES_PREFS} from '../../src/shared/downloadProfiles.js'
import type {SupportedLang} from '../../src/shared/i18n/index.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {isRecord} from './fixtureWorkflow.js'

const CARD_PREFIX = 'profiles-manage-card-'
const GRIP_SUFFIX = '-move'

const CASES: readonly {label: string; theme: 'dark' | 'light'; language: SupportedLang; dir: 'ltr' | 'rtl'}[] = [
	{label: 'dark theme', theme: 'dark', language: 'en', dir: 'ltr'},
	{label: 'light theme', theme: 'light', language: 'en', dir: 'ltr'},
	{label: 'a right-to-left language', theme: 'dark', language: 'ar', dir: 'rtl'}
]

// Each card's grip carries its profile id; the grips' document order is the
// card order the user sees.
async function cardOrder(page: Page): Promise<string[]> {
	const grips = page.getByTestId('profiles-manage-tab').locator(`[data-testid^="${CARD_PREFIX}"][data-testid$="${GRIP_SUFFIX}"]`)
	const testIds = await grips.evaluateAll(elements => elements.map(element => element.getAttribute('data-testid') ?? ''))
	return testIds.map(testId => testId.slice(CARD_PREFIX.length, -GRIP_SUFFIX.length))
}

async function center(page: Page, testId: string): Promise<{x: number; y: number}> {
	const box = await page.getByTestId(testId).boundingBox()
	if (!box) throw new Error(`${testId} has no layout box`)
	return {x: box.x + box.width / 2, y: box.y + box.height / 2}
}

// Picks the card up by its grip and moves it by the distance between the two
// cards' centres, so the dragged card ends centred on the target whichever way
// the grid runs.
async function dragCardOnto(page: Page, fromId: string, toId: string): Promise<void> {
	const grip = await center(page, `${CARD_PREFIX}${fromId}${GRIP_SUFFIX}`)
	const from = await center(page, `${CARD_PREFIX}${fromId}`)
	const to = await center(page, `${CARD_PREFIX}${toId}`)
	await page.mouse.move(grip.x, grip.y)
	await page.mouse.down()
	await page.mouse.move(grip.x + (to.x - from.x), grip.y + (to.y - from.y), {steps: 12})
	await page.mouse.up()
}

function savedOrder(userDataDir: string): unknown {
	const settings: unknown = JSON.parse(fs.readFileSync(path.join(userDataDir, 'settings.json'), 'utf8'))
	if (!isRecord(settings) || !isRecord(settings.profiles)) return undefined
	return settings.profiles.order
}

async function expectThemeAndDirection(page: Page, theme: 'dark' | 'light', dir: 'ltr' | 'rtl'): Promise<void> {
	await expect(page.locator('html')).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`))
	await expect(page.locator('html')).toHaveAttribute('dir', dir)
}

for (const {label, theme, language, dir} of CASES) {
	test(`Electron download profile order survives a restart in ${label}`, async () => {
		test.setTimeout(150_000)
		const catalogOrder = allDownloadProfiles(DEFAULT_DOWNLOAD_PROFILES_PREFS).map(profile => profile.id)
		const [first, second, third, ...rest] = catalogOrder
		if (!first || !second || !third) throw new Error('fewer than three built-in download profiles')
		const moved = [second, third, first, ...rest]

		await withFixtureProductApp(
			{
				userDataPrefix: `arroxy-profile-order-${theme}-${language}-user-`,
				settings: settings => {
					settings.common.uiTheme = theme
					settings.common.language = language
				}
			},
			async ({page, userDataDir, relaunch}) => {
				await expectThemeAndDirection(page, theme, dir)
				await page.getByTestId('home-tab-profiles').click()
				await expect(page.getByTestId('profiles-manage-tab')).toBeVisible()
				await expect.poll(() => cardOrder(page)).toEqual(catalogOrder)

				await dragCardOnto(page, first, third)
				await expect.poll(() => cardOrder(page)).toEqual(moved)
				await expect.poll(() => savedOrder(userDataDir)).toEqual(moved)

				const relaunched = await relaunch()
				await expectThemeAndDirection(relaunched.page, theme, dir)
				await relaunched.page.getByTestId('home-tab-profiles').click()
				await expect(relaunched.page.getByTestId('profiles-manage-tab')).toBeVisible()
				await expect.poll(() => cardOrder(relaunched.page)).toEqual(moved)
			}
		)
	})
}
