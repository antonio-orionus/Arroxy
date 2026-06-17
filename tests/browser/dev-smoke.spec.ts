import {expect, test} from '@playwright/test'

test('browser-mock dev server boots the app shell', async ({page}) => {
	await page.goto('/?scenario=default')

	await expect(page.getByTestId('app-root')).toBeVisible()
	await expect(page.getByTestId('scenario-gallery')).toBeVisible()
	await expect(page.getByTestId('splash-overlay')).toHaveCount(0)
})
