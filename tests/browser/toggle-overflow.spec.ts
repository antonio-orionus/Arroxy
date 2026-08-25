import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

interface OverflowReport {
	label: string
	overflowPx: number
	spillPx: number
}

interface Screen {
	name: string
	query: string
	hash: string
	ready: string
	open?: {trigger: string; wait: string}
}

const LOCALES = ['en', 'el', 'fr', 'my', 'ur'] as const

const VIEWPORTS = [
	{name: 'min-window', width: 720, height: 680},
	{name: 'min-window-zoom-150', width: 480, height: 453}
] as const

const SCREENS: readonly Screen[] = [
	{name: 'profile-editor', query: 'scenario=profiles-editor', hash: '', ready: '[data-testid="profiles-editor-name"]'},
	{name: 'settings', query: '', hash: 'settings', ready: '[data-testid="native-audio-preference"]'},
	{name: 'settings-limit-rate', query: '', hash: 'settings', ready: '[data-testid="profiles-settings-limit-rate-trigger"]', open: {trigger: '[data-testid="profiles-settings-limit-rate-trigger"]', wait: '[data-testid="limit-rate-picker"]'}},
	{name: 'wizard-formats', query: 'scenario=single-normal&mockStep=formats', hash: '', ready: '[data-testid="step-formats"]'},
	{name: 'wizard-subtitles', query: 'scenario=single-normal&mockStep=subtitles', hash: '', ready: '[data-testid="step-subtitles"]'},
	{name: 'wizard-sponsorblock', query: 'scenario=single-normal&mockStep=sponsorblock', hash: '', ready: '[data-testid="step-sponsorblock"]'},
	{name: 'wizard-folder', query: 'scenario=single-normal&mockStep=folder', hash: '', ready: '[data-testid="step-folder"]'},
	{name: 'playlist-presets', query: 'scenario=playlist-normal&mockStep=playlistPresets', hash: '', ready: '[data-testid="step-playlist-presets"]'},
	{name: 'playlist-scope-dialog', query: 'scenario=playlist-normal&mockStep=playlistItems', hash: '', ready: '[data-testid="playlist-scope-change"]', open: {trigger: '[data-testid="playlist-scope-change"]', wait: '[data-testid="playlist-scope-dialog"]'}}
]

function urlFor(screen: Screen, locale: string): string {
	const params = new URLSearchParams(screen.query)
	params.set('locale', locale)
	params.set('theme', 'dark')
	return `/?${params.toString()}${screen.hash ? `#${screen.hash}` : ''}`
}

async function openScreen(page: Page, screen: Screen, locale: string): Promise<void> {
	await page.goto(urlFor(screen, locale))
	await page.waitForSelector(screen.ready, {timeout: 15_000})
	// The persisted language lands after the async settings bootstrap. Without
	// this barrier the sweep measures the English first paint and passes blind.
	await page.waitForFunction(expected => document.documentElement.lang === expected, locale, {timeout: 15_000})
	if (screen.open) {
		await page.click(screen.open.trigger)
		await page.waitForSelector(screen.open.wait, {timeout: 10_000})
	}
	await page.evaluate(async () => document.fonts.ready)
}

async function overflowingToggles(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		for (const node of document.querySelectorAll('[data-slot="toggle-group-item"]')) {
			const el = node as HTMLElement
			const group = el.closest('[data-slot="toggle-group"]')
			if (!group) continue
			const rect = el.getBoundingClientRect()
			if (rect.width === 0) continue
			const groupRect = group.getBoundingClientRect()
			const overflowPx = el.scrollWidth - el.clientWidth
			const spillPx = Math.round(Math.max(rect.right - groupRect.right, groupRect.left - rect.left))
			if (overflowPx > 1 || spillPx > 1) found.push({label: (el.textContent ?? '').trim().slice(0, 32), overflowPx, spillPx})
		}
		return found
	})
}

async function overflowingGroups(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		for (const node of document.querySelectorAll('[data-slot="toggle-group"]')) {
			const group = node as HTMLElement
			const parent = group.parentElement
			if (!parent) continue
			const groupRect = group.getBoundingClientRect()
			if (groupRect.width === 0) continue
			const parentRect = parent.getBoundingClientRect()
			const spillPx = Math.round(Math.max(groupRect.right - parentRect.right, parentRect.left - groupRect.left))
			if (spillPx > 1) found.push({label: (group.textContent ?? '').trim().slice(0, 32), overflowPx: 0, spillPx})
		}
		return found
	})
}

async function overflowingRadioTitles(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		for (const node of document.querySelectorAll('[role="radio"] [data-slot="item-title"]')) {
			const el = node as HTMLElement
			const row = el.closest('[role="radio"]')
			if (!row) continue
			const rect = el.getBoundingClientRect()
			if (rect.width === 0) continue
			const rowRect = row.getBoundingClientRect()
			const spillPx = Math.round(Math.max(rect.right - rowRect.right, rowRect.left - rect.left))
			if (spillPx > 1) found.push({label: (el.textContent ?? '').trim().slice(0, 32), overflowPx: 0, spillPx})
		}
		return found
	})
}

for (const viewport of VIEWPORTS) {
	for (const locale of LOCALES) {
		for (const screen of SCREENS) {
			test(`[${viewport.name}][${locale}] ${screen.name}: toggles stay inside their tracks`, async ({page}) => {
				await page.setViewportSize({width: viewport.width, height: viewport.height})
				await openScreen(page, screen, locale)
				expect(await overflowingToggles(page)).toEqual([])
				expect(await overflowingGroups(page)).toEqual([])
				expect(await overflowingRadioTitles(page)).toEqual([])
			})
		}
	}
}
