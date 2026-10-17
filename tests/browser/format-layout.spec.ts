import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

interface AudioListBox {
	listHeight: number
	viewportBottom: number
	rootBottom: number
	stripTop: number
	listScrolls: boolean
	pageScrolls: boolean
}

async function openAudioMode(page: Page): Promise<void> {
	await page.goto('/?scenario=single-normal&mockStep=formats&theme=dark')
	await page.waitForSelector('[data-testid="step-formats"]')
	await page.getByRole('button', {name: 'Audio', exact: true}).click()
	await page.waitForSelector('[data-testid="audio-bitrate-strip"]')
}

async function audioListBox(page: Page): Promise<AudioListBox | null> {
	return page.evaluate(() => {
		const root = document.querySelector('[data-testid="step-formats"] [data-slot="scroll-area"]')
		const viewport = root?.querySelector('[data-slot="scroll-area-viewport"]')
		const strip = document.querySelector('[data-testid="audio-bitrate-strip"]')
		const panel = document.querySelector('[data-testid="wizard-panel"]')?.parentElement
		if (!root || !viewport || !strip || !panel) return null
		return {
			listHeight: root.getBoundingClientRect().height,
			viewportBottom: viewport.getBoundingClientRect().bottom,
			rootBottom: root.getBoundingClientRect().bottom,
			stripTop: strip.getBoundingClientRect().top,
			listScrolls: viewport.scrollHeight > viewport.clientHeight,
			pageScrolls: panel.scrollHeight > panel.clientHeight
		}
	})
}

test('in Audio mode the list takes the free height of the default window', async ({page}) => {
	await page.setViewportSize({width: 1024, height: 860})
	await openAudioMode(page)

	const box = await audioListBox(page)
	expect(box).not.toBeNull()
	expect(box?.listHeight).toBeGreaterThan(240)
	expect(box?.listScrolls).toBe(false)
	expect(box?.pageScrolls).toBe(false)
})

test('in a short window the Audio list scrolls inside its box instead of spilling over the rows below', async ({page}) => {
	await page.setViewportSize({width: 720, height: 560})
	await openAudioMode(page)

	const box = await audioListBox(page)
	expect(box).not.toBeNull()
	expect(box?.listScrolls).toBe(true)
	expect(box?.viewportBottom).toBeLessThanOrEqual((box?.rootBottom ?? 0) + 0.5)
	expect(box?.viewportBottom).toBeLessThanOrEqual((box?.stripTop ?? 0) + 0.5)
})

test('the Review format strip centres its thumbnail instead of treating it as a card cover', async ({page}) => {
	await page.goto('/?scenario=single-normal&mockStep=confirm&theme=dark')
	await page.waitForSelector('[data-testid="review-format-strip"]')

	const gaps = await page.evaluate(() => {
		const strip = document.querySelector('[data-testid="review-format-strip"]')
		const thumb = strip?.querySelector('img')
		if (!strip || !thumb) return null
		const outer = strip.getBoundingClientRect()
		const inner = thumb.getBoundingClientRect()
		return {top: inner.top - outer.top, bottom: outer.bottom - inner.bottom}
	})
	expect(gaps).not.toBeNull()
	expect(gaps?.top).toBeGreaterThan(4)
	expect(Math.abs((gaps?.top ?? 0) - (gaps?.bottom ?? 0))).toBeLessThanOrEqual(1)
})
