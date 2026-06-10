import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

interface RectSnapshot {
	bottom: number
	height: number
	left: number
	right: number
	top: number
	width: number
	x: number
	y: number
}

const PROFILE_LAYOUT_PARTS = ['card', 'picker', 'summary', 'title-row', 'description', 'detail', 'actions', 'check'] as const
type ProfileLayoutPart = (typeof PROFILE_LAYOUT_PARTS)[number]
type ProfileLayoutSnapshot = Record<ProfileLayoutPart, RectSnapshot>

async function openProfiles(page: Page): Promise<void> {
	await page.goto('/?theme=light#profiles')
	await page.waitForSelector('[data-testid="profiles-manage-tab"]')
	await page.evaluate(async () => document.fonts.ready)
}

async function waitForStableProfileLayout(page: Page, profileId: string): Promise<void> {
	await expect
		.poll(
			async () => {
				const before = await profileLayout(page, profileId)
				await page.evaluate(
					() =>
						new Promise<void>(resolve => {
							requestAnimationFrame(() => {
								requestAnimationFrame(() => resolve())
							})
						})
				)
				const after = await profileLayout(page, profileId)
				return JSON.stringify(after) === JSON.stringify(before)
			},
			{intervals: [0, 16, 32, 64, 128], timeout: 2_000}
		)
		.toBe(true)
}

async function profileLayout(page: Page, profileId: string): Promise<ProfileLayoutSnapshot> {
	return page.evaluate(
		({parts, profileId}) => {
			const rectFor = (testId: string): RectSnapshot => {
				const element = document.querySelector(`[data-testid="${testId}"]`)
				if (!element) throw new Error(`Missing ${testId}`)
				const rect = element.getBoundingClientRect()
				return {bottom: Number(rect.bottom.toFixed(2)), height: Number(rect.height.toFixed(2)), left: Number(rect.left.toFixed(2)), right: Number(rect.right.toFixed(2)), top: Number(rect.top.toFixed(2)), width: Number(rect.width.toFixed(2)), x: Number(rect.x.toFixed(2)), y: Number(rect.y.toFixed(2))}
			}
			const prefix = `profiles-manage-card-${profileId}`
			return Object.fromEntries(parts.map(part => [part, rectFor(part === 'card' ? prefix : `${prefix}-${part}`)])) as ProfileLayoutSnapshot
		},
		{parts: PROFILE_LAYOUT_PARTS, profileId}
	)
}

test('profile selection does not move card content or resize the grid row', async ({page}) => {
	await page.setViewportSize({width: 1005, height: 1036})
	await openProfiles(page)
	await waitForStableProfileLayout(page, 'hd-1080')

	const before = {balanced: await profileLayout(page, 'balanced'), hd1080: await profileLayout(page, 'hd-1080')}

	await page.getByTestId('profiles-manage-card-hd-1080-picker').click()
	await expect(page.getByTestId('profiles-manage-card-hd-1080')).toHaveAttribute('data-active', 'true')
	await expect(page.getByTestId('profiles-manage-card-balanced')).not.toHaveAttribute('data-active', 'true')
	await waitForStableProfileLayout(page, 'hd-1080')

	expect(await profileLayout(page, 'hd-1080')).toEqual(before.hd1080)
	expect(await profileLayout(page, 'balanced')).toEqual(before.balanced)
})
