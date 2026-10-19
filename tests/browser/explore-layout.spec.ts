import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

// The native Explore view is positioned from `setBounds` calls. This asserts
// the rect main would receive matches where the placeholder really is on
// screen under the content wrapper's CSS `zoom` (not double- or under-scaled).
// The oracle is Playwright's own box model, independent of the renderer's
// `getBoundingClientRect` path.

const ZOOM_LEVELS = [1, 1.25, 1.5] as const
const ZOOM_STEP = 0.05

interface Rect {
	x: number
	y: number
	width: number
	height: number
}

async function lastBounds(page: Page): Promise<Rect | null> {
	return page.evaluate(() => window.__exploreMockCalls?.setBounds.at(-1) ?? null)
}

for (const zoom of ZOOM_LEVELS) {
	test(`explore view bounds equal the placeholder's screen rect at uiZoom ${zoom}`, async ({page}) => {
		await page.setViewportSize({width: 1100, height: 900})
		await page.goto('/?scenario=explore-browsing&theme=dark')
		const viewport = page.getByTestId('explore-viewport')
		await expect(viewport).toBeVisible({timeout: 15_000})

		const clicks = Math.round((zoom - 1) / ZOOM_STEP)
		for (let i = 0; i < clicks; i++) await page.getByRole('button', {name: 'Zoom in'}).click()
		await expect(page.getByText(`${Math.round(zoom * 100)}%`, {exact: true})).toBeVisible()

		// Settle: the layout transition and the rAF-scheduled send both land after the last click.
		await expect
			.poll(
				async () => {
					const [box, sent] = [await viewport.boundingBox(), await lastBounds(page)]
					if (!box || !sent) return null
					return [box.x - sent.x, box.y - sent.y, box.width - sent.width, box.height - sent.height].map(delta => Math.round(Math.abs(delta)))
				},
				{timeout: 5_000}
			)
			.toEqual([0, 0, 0, 0])

		const sent = await lastBounds(page)
		if (!sent) throw new Error('Explore never sent bounds')
		const inner = await page.evaluate(() => ({width: window.innerWidth, height: window.innerHeight}))
		expect(sent.x + sent.width).toBeLessThanOrEqual(inner.width)
		expect(sent.y + sent.height).toBeLessThanOrEqual(inner.height)

		// The placeholder itself fills the window whatever the zoom, so it cannot show that
		// zoom applied. A toolbar button has a fixed layout height, so its screen height over
		// its unzoomed computed height is the zoom actually in effect.
		const button = page.getByTestId('explore-download')
		const screenHeight = (await button.boundingBox())?.height ?? 0
		const layoutHeight = await button.evaluate(node => parseFloat(getComputedStyle(node).height))
		expect(screenHeight / layoutHeight).toBeCloseTo(zoom, 1)
		expect(await page.evaluate(() => window.__exploreMockCalls?.setVisible.at(-1))).toBe(true)
	})
}

// Each Explore scenario lands on the Explore tab in its own state.
const SCENARIO_SURFACES = [
	{id: 'explore-notice', visible: 'explore-notice', absent: ['explore-toolbar', 'explore-viewport']},
	{id: 'explore-browsing', visible: 'explore-mock-page', absent: ['explore-notice', 'explore-mode-nudge', 'explore-error']},
	{id: 'explore-nudge', visible: 'explore-mode-nudge', absent: ['explore-notice', 'explore-error']},
	{id: 'explore-proxy-error', visible: 'explore-error', absent: ['explore-notice', 'explore-mock-page']},
	{id: 'explore-address-refused', visible: 'explore-address-hint', absent: ['explore-notice', 'explore-error']}
] as const

for (const surface of SCENARIO_SURFACES) {
	test(`${surface.id} shows its Explore surface`, async ({page}) => {
		await page.goto(`/?scenario=${surface.id}&theme=dark`)
		await expect(page.getByTestId(surface.visible)).toBeVisible({timeout: 15_000})
		for (const id of surface.absent) await expect(page.getByTestId(id)).toHaveCount(0)
	})
}

// P2-R36: each ad blocker scenario shows its shield state, and the mock's
// toggle round-trips through the settings like the real one.
for (const [id, adBlock] of [
	['explore-browsing', 'on'],
	['explore-adblock-off', 'off'],
	['explore-adblock-unavailable', 'unavailable']
] as const) {
	test(`${id} shows the ad blocker ${adBlock}`, async ({page}) => {
		await page.goto(`/?scenario=${id}&theme=dark`)
		const shield = page.getByTestId('explore-adblock')
		await expect(shield).toHaveAttribute('data-adblock', adBlock, {timeout: 15_000})
		await expect(shield).toHaveAttribute('aria-pressed', String(adBlock !== 'off'))
		await shield.hover()
		await expect(page.locator('[data-slot="tooltip-content"]')).toContainText('YouTube may push back on ad blockers')
	})
}

test('the shield toggles the ad blocker', async ({page}) => {
	await page.goto('/?scenario=explore-browsing&theme=dark')
	const shield = page.getByTestId('explore-adblock')
	await expect(shield).toHaveAttribute('data-adblock', 'on', {timeout: 15_000})
	await shield.click()
	await expect(shield).toHaveAttribute('data-adblock', 'off')
	await shield.click()
	await expect(shield).toHaveAttribute('data-adblock', 'on')
})

test('the proxy error keeps the native view hidden', async ({page}) => {
	await page.goto('/?scenario=explore-proxy-error&theme=dark')
	await expect(page.getByTestId('explore-error')).toBeVisible({timeout: 15_000})
	expect(await page.evaluate(() => window.__exploreMockCalls?.setVisible.includes(true))).toBe(false)
})

// The address hint takes a row of its own under the toolbar, so the native
// view shrinks below it (it never hides it, and never paints over it), and the
// typed address round-trips through the mock's rule.
test('the address hint shrinks the view, and the address bar routes Enter', async ({page}) => {
	await page.setViewportSize({width: 900, height: 760})
	await page.goto('/?scenario=explore-address-refused&theme=dark')
	const hint = page.getByTestId('explore-address-hint')
	await expect(hint).toBeVisible({timeout: 15_000})
	const viewport = page.getByTestId('explore-viewport')
	await expect.poll(async () => (await lastBounds(page))?.y ?? 0).toBeGreaterThanOrEqual(Math.floor(((await hint.boundingBox())?.y ?? 0) + ((await hint.boundingBox())?.height ?? 0)))
	expect(await page.evaluate(() => window.__exploreMockCalls?.setVisible.at(-1))).toBe(true)
	const withHint = (await viewport.boundingBox())?.height ?? 0

	const address = page.getByTestId('explore-address')
	await address.click()
	await page.keyboard.press('Escape')
	await expect(hint).toHaveCount(0)
	await expect.poll(async () => (await viewport.boundingBox())?.height ?? 0).toBeGreaterThan(withHint)

	await address.fill('youtu.be/abc123')
	await address.press('Enter')
	await expect(address).toHaveValue('https://www.youtube.com/watch?v=abc123')

	// A link on another site loads in the view too.
	await address.fill('videos.example.com/watch/42')
	await address.press('Enter')
	await expect(address).toHaveValue('https://videos.example.com/watch/42')
	await expect(hint).toHaveCount(0)

	// A dotted word is a search; a typed sign-in page gets the hint and stays in the bar.
	await address.fill('node.js')
	await address.press('Enter')
	await expect(address).toHaveValue('https://www.youtube.com/results?search_query=node.js')
	await address.fill('accounts.google.com/signin')
	await address.press('Enter')
	await expect(hint).toBeVisible()
	await expect(address).toHaveValue('accounts.google.com/signin')

	// Leaving the tab clears the hint.
	await page.getByRole('tab', {name: 'Settings'}).click()
	await page.getByRole('tab', {name: /Explore/}).click()
	await expect(page.getByTestId('explore-address')).toHaveValue('https://www.youtube.com/results?search_query=node.js')
	await expect(hint).toHaveCount(0)
})

// The native view paints over any DOM under the toolbar, so a toolbar tooltip
// must open above its button, fully inside the window, never over the view.
// The blocked Forward button covers the focusable-when-blocked buttons; the shield is the tallest (two lines).
for (const [width, zoom] of [
	[720, 1],
	[720, 1.5],
	[1100, 1]
] as const) {
	test(`toolbar tooltips open above the toolbar at ${width}px wide, uiZoom ${zoom}`, async ({page}) => {
		await page.setViewportSize({width, height: 760})
		await page.goto('/?scenario=explore-browsing&theme=dark')
		const viewport = page.getByTestId('explore-viewport')
		await expect(viewport).toBeVisible({timeout: 15_000})
		for (let i = 0; i < Math.round((zoom - 1) / ZOOM_STEP); i++) await page.getByRole('button', {name: 'Zoom in'}).click()
		await expect(page.getByText(`${Math.round(zoom * 100)}%`, {exact: true})).toBeVisible()

		for (const target of [page.getByTestId('explore-adblock'), page.getByTestId('explore-toolbar').getByRole('button', {name: 'Forward', exact: true}), page.getByTestId('explore-download'), page.getByTestId('explore-interactive')]) {
			await target.hover()
			const tip = page.locator('[data-slot="tooltip-content"]')
			await expect(tip).toBeVisible()
			await expect(tip).toHaveAttribute('data-side', 'top')
			// The popup slides in; measure once it has settled above its button.
			await expect.poll(async () => ((await tip.boundingBox())?.y ?? 0) + ((await tip.boundingBox())?.height ?? 0) <= ((await target.boundingBox())?.y ?? 0) + 1).toBe(true)
			const [tipBox, targetBox, viewBox, inner] = [await tip.boundingBox(), await target.boundingBox(), await viewport.boundingBox(), await page.evaluate(() => ({width: window.innerWidth, height: window.innerHeight}))]
			if (!tipBox || !targetBox || !viewBox) throw new Error('missing box')
			expect(tipBox.y + tipBox.height).toBeLessThanOrEqual(targetBox.y + 1)
			expect(tipBox.y + tipBox.height).toBeLessThanOrEqual(viewBox.y)
			expect(tipBox.x).toBeGreaterThanOrEqual(0)
			expect(tipBox.y).toBeGreaterThanOrEqual(0)
			expect(tipBox.x + tipBox.width).toBeLessThanOrEqual(inner.width)
			// Hovering a tooltip never hides the native view.
			expect(await page.evaluate(() => window.__exploreMockCalls?.setVisible.at(-1))).toBe(true)
			await page.mouse.move(0, 0)
			await expect(tip).toHaveCount(0)
		}
	})
}

// A blocked button (aria-disabled, still focusable for its tooltip) does not
// nudge down on press the way a working one does.
test('a blocked toolbar button does not move when pressed', async ({page}) => {
	await page.goto('/?scenario=explore-browsing&theme=dark')
	await expect(page.getByTestId('explore-viewport')).toBeVisible({timeout: 15_000})
	const toolbar = page.getByTestId('explore-toolbar')
	const pressedTranslate = async (name: string): Promise<string> => {
		const button = toolbar.getByRole('button', {name, exact: true})
		await button.hover()
		await page.mouse.down()
		// Read once the press transition (transition-all) has had time to finish.
		const translate = await button.evaluate(el => new Promise<string>(resolve => setTimeout(() => resolve(getComputedStyle(el).translate), 400)))
		await page.mouse.up()
		await page.mouse.move(0, 0)
		return translate
	}
	await expect(toolbar.getByRole('button', {name: 'Forward', exact: true})).toHaveAttribute('aria-disabled', 'true')
	expect(await pressedTranslate('Forward')).toMatch(/^(none|0px)$/)
	// A working button still gives the press feedback.
	expect(await pressedTranslate('Reload')).not.toMatch(/^(none|0px)$/)
})
