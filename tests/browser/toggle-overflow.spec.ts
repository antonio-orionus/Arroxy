import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

interface OverflowReport {
	label: string
	overflowPx: number
	spillPx: number
	// Vertical counterpart of `spillPx`, set by the tab-bar check only.
	spillYPx?: number
}

interface Screen {
	name: string
	query: string
	hash: string
	ready: string
	open?: {trigger: string; wait: string}
}

const LOCALES = ['en', 'el', 'fr', 'my', 'ur', 'it', 'pl', 'fa', 'th', 'ko', 'zh-Hant'] as const
// The locales whose labels run longest (measured 1.5-2x English).
const LONG_LOCALES = ['el', 'fr', 'my', 'pl'] as const

const VIEWPORTS = [
	{name: 'min-window', width: 720, height: 680},
	{name: 'min-window-zoom-150', width: 480, height: 453},
	// The real minimum window with the UI zoom at its maximum: the viewport stays 720px, the content lays out in 480.
	{name: 'min-window-uizoom-150', width: 720, height: 680, zoom: 1.5}
] as const

const SCREENS: readonly Screen[] = [
	{name: 'profile-editor', query: 'scenario=profiles-editor', hash: '', ready: '[data-testid="profiles-editor-name"]'},
	{name: 'settings', query: '', hash: 'settings', ready: '[data-testid="native-audio-preference"]'},
	{name: 'settings-limit-rate', query: '', hash: 'settings', ready: '[data-testid="profiles-settings-limit-rate-trigger"]', open: {trigger: '[data-testid="profiles-settings-limit-rate-trigger"]', wait: '[data-testid="limit-rate-picker"]'}},
	{name: 'wizard-formats', query: 'scenario=single-normal&mockStep=formats', hash: '', ready: '[data-testid="step-formats"]'},
	{name: 'wizard-formats-multilingual-audio', query: 'scenario=probe-audio-multilingual', hash: '', ready: '[data-testid="step-formats"]'},
	{name: 'wizard-review', query: 'scenario=single-normal&mockStep=confirm', hash: '', ready: '[data-testid="step-review"]'},
	{name: 'wizard-review-subtitles', query: 'scenario=single-review-subtitles', hash: '', ready: '[data-testid="subtitle-fields"]'},
	{name: 'wizard-subtitles-kind', query: 'scenario=single-subtitles-kind', hash: '', ready: '[data-testid="subtitle-fields"]'},
	{name: 'playlist-sponsorblock', query: 'scenario=playlist-normal&mockStep=sponsorblock', hash: '', ready: '[data-testid="step-sponsorblock"]'},
	{name: 'playlist-folder', query: 'scenario=playlist-normal&mockStep=folder', hash: '', ready: '[data-testid="step-folder"]'},
	{name: 'playlist-presets', query: 'scenario=playlist-normal&mockStep=playlistPresets', hash: '', ready: '[data-testid="step-playlist-presets"]'},
	{name: 'explore-notice', query: 'scenario=explore-notice', hash: '', ready: '[data-testid="explore-notice"]'},
	{name: 'explore-browsing', query: 'scenario=explore-browsing', hash: '', ready: '[data-testid="explore-toolbar"]'},
	{name: 'explore-nudge', query: 'scenario=explore-nudge', hash: '', ready: '[data-testid="explore-mode-nudge"]'},
	{name: 'explore-proxy-error', query: 'scenario=explore-proxy-error', hash: '', ready: '[data-testid="explore-error"]'},
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

// Format chips: every chip stays inside its line, and its label, tags and size
// stay inside the chip, in both directions.
async function overflowingRadioChips(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		const spill = (inner: DOMRect, outer: DOMRect): number => Math.round(Math.max(inner.right - outer.right, outer.left - inner.left))
		for (const chip of document.querySelectorAll<HTMLElement>('[data-slot="radio-group-chip"]')) {
			const chipRect = chip.getBoundingClientRect()
			const line = chip.parentElement?.getBoundingClientRect()
			if (chipRect.width === 0 || !line) continue
			const chipSpill = spill(chipRect, line)
			if (chipSpill > 1) found.push({label: (chip.textContent ?? '').trim().slice(0, 32), overflowPx: 0, spillPx: chipSpill})
			// Skip Base UI's visually hidden native input, and the profile dot that sits on the chip's corner by design.
			for (const part of chip.querySelectorAll<HTMLElement>(':scope > :not(input):not([aria-hidden])')) {
				const partRect = part.getBoundingClientRect()
				if (partRect.width === 0) continue
				const partSpill = spill(partRect, chipRect)
				if (partSpill > 1) found.push({label: (part.textContent ?? '').trim().slice(0, 32), overflowPx: 0, spillPx: partSpill})
			}
		}
		return found
	})
}

// The top tab bar: every trigger keeps its label (and badge) inside itself, and
// the list keeps inside its container. Triggers wrap long labels rather than
// grow, so this catches a label that outgrows its share of the row.
async function overflowingTabs(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number; spillYPx: number}[] = []
		// Sub-pixel layout rounds, so half a pixel is the tolerance for containment.
		const EPSILON = 0.5
		for (const node of document.querySelectorAll('[data-slot="tabs-list"]')) {
			const list = node as HTMLElement
			const listRect = list.getBoundingClientRect()
			if (listRect.width === 0) continue
			const parentRect = list.parentElement?.getBoundingClientRect()
			const listSpill = parentRect ? Math.round(Math.max(listRect.right - parentRect.right, parentRect.left - listRect.left)) : 0
			if (listSpill > 1 || list.scrollWidth - list.clientWidth > 1) found.push({label: 'tabs-list', overflowPx: list.scrollWidth - list.clientWidth, spillPx: listSpill, spillYPx: 0})
			for (const trigger of list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')) {
				const rect = trigger.getBoundingClientRect()
				if (rect.width === 0) continue
				const overflowPx = Math.max(trigger.scrollWidth - trigger.clientWidth, trigger.scrollHeight - trigger.clientHeight)
				let spillPx = Math.round(Math.max(rect.right - listRect.right, listRect.left - rect.left))
				let spillYPx = 0
				// Anything inside the trigger (icon, label, badge) sticking out of it, either way.
				for (const part of trigger.querySelectorAll<HTMLElement | SVGElement>('*')) {
					const partRect = part.getBoundingClientRect()
					if (partRect.width === 0 && partRect.height === 0) continue
					spillPx = Math.max(spillPx, Math.round(Math.max(partRect.right - rect.right, rect.left - partRect.left)))
					spillYPx = Math.max(spillYPx, partRect.bottom - rect.bottom, rect.top - partRect.top)
				}
				if (overflowPx > 1 || spillPx > 1 || spillYPx > EPSILON) found.push({label: (trigger.textContent ?? '').trim().slice(0, 32), overflowPx, spillPx, spillYPx: Math.round(spillYPx * 10) / 10})
			}
		}
		return found
	})
}

// The rail must sit inside its parent and inside the window in screen pixels,
// whatever the UI zoom does to `vw`-based and percentage widths.
async function railOutsideBounds(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		for (const node of document.querySelectorAll('[data-slot="tabs-list"]')) {
			const rect = node.getBoundingClientRect()
			if (rect.width === 0) continue
			const parent = node.parentElement?.getBoundingClientRect()
			const outer = {left: Math.max(0, parent?.left ?? 0), right: Math.min(window.innerWidth, parent?.right ?? window.innerWidth)}
			const spillPx = Math.round(Math.max(rect.right - outer.right, outer.left - rect.left))
			if (spillPx > 1) found.push({label: 'tabs-list', overflowPx: 0, spillPx})
		}
		return found
	})
}

// Format chips: anything clipped inside a chip must be plain text cut with an
// ellipsis. Overflow clips an inline box mid-word with no ellipsis, which the
// spill checks above cannot see.
async function clippedWithoutEllipsis(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		for (const chip of document.querySelectorAll<HTMLElement>('[data-slot="radio-group-chip"]')) {
			for (const el of chip.querySelectorAll<HTMLElement>('*')) {
				const overflowPx = el.scrollWidth - el.clientWidth
				if (overflowPx <= 1 || el.clientWidth === 0) continue
				const style = getComputedStyle(el)
				if (style.overflowX === 'visible') continue
				const clipsBox = [...el.children].some(child => getComputedStyle(child).display !== 'inline')
				if (style.textOverflow !== 'ellipsis' || clipsBox) found.push({label: (el.textContent ?? '').trim().slice(0, 32), overflowPx, spillPx: 0})
			}
		}
		return found
	})
}

interface TabPaintGaps {
	// Painted gap between each pair of neighbouring triggers, in screen px.
	gaps: number[]
	// What each trigger paints, for a failure message.
	painted: string[]
}

// What each home tab trigger paints, in screen px: its pill (the `::before`,
// inset from the trigger box) widened by any outward shadow or ring it shows,
// and the trigger's own focus ring or outline. A pill that is not shown
// (opacity 0) still marks where one would paint, without its shadow. The gap
// is measured between those outer edges, in reading order on screen.
async function tabPaintGaps(page: Page): Promise<TabPaintGaps> {
	return page.evaluate(() => {
		// Horizontal reach of the outward layers of a computed box-shadow list.
		function shadowReach(value: string): number {
			if (value === 'none' || value === '') return 0
			let reach = 0
			for (const layer of value.split(/,(?![^(]*\))/)) {
				if (/\binset\b/.test(layer)) continue
				const lengths = [...layer.replace(/\w+\([^)]*\)/g, '').matchAll(/-?[\d.]+px/g)].map(match => parseFloat(match[0]))
				const [x = 0, , blur = 0, spread = 0] = lengths
				reach = Math.max(reach, Math.abs(x) + blur + spread)
			}
			return reach
		}
		const rail = document.querySelector<HTMLElement>('[data-testid="profiles-tabs"]')
		if (!rail) return {gaps: [], painted: ['rail missing']}
		const rects = [...rail.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')]
			.map(trigger => {
				const box = trigger.getBoundingClientRect()
				const style = getComputedStyle(trigger)
				// CSS `zoom` (the UI zoom) scales the box but not computed lengths.
				const zoom = box.width / parseFloat(style.width)
				const pill = getComputedStyle(trigger, '::before')
				const pillShown = pill.content !== 'none' && parseFloat(pill.opacity) > 0
				const pillReach = pillShown ? shadowReach(pill.boxShadow) : 0
				const left = box.left + (parseFloat(pill.left) - pillReach) * zoom
				const right = box.right - (parseFloat(pill.right) - pillReach) * zoom
				const outline = style.outlineStyle === 'none' ? 0 : parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
				const ring = Math.max(shadowReach(style.boxShadow), outline) * zoom
				// A ring around the trigger box counts only while it shows.
				return ring > 0 ? {label: (trigger.textContent ?? '').trim(), left: Math.min(left, box.left - ring), right: Math.max(right, box.right + ring)} : {label: (trigger.textContent ?? '').trim(), left, right}
			})
			.sort((a, b) => a.left - b.left)
		const gaps = rects.slice(1).map((rect, i) => Math.round((rect.left - (rects[i]?.right ?? 0)) * 10) / 10)
		return {gaps, painted: rects.map(rect => `${rect.label}: ${Math.round(rect.left)}-${Math.round(rect.right)}`)}
	})
}

// Even spacing on the home tab bar: no painted pill, glow or ring reaches its
// neighbour, and every neighbouring pair is as far apart as every other.
async function expectEvenTabSpacing(page: Page): Promise<void> {
	// The selected pill fades and scales in; measure once finite animations settle.
	// Spinners loop forever, so only animations that end are awaited.
	await page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
				.map(animation => animation.finished.catch(() => undefined))
		)
	)
	const {gaps, painted} = await tabPaintGaps(page)
	const zoom = await page.evaluate(() => {
		const rail = document.querySelector<HTMLElement>('[data-testid="profiles-tabs"]')
		return rail ? rail.getBoundingClientRect().height / parseFloat(getComputedStyle(rail).height) : 1
	})
	expect(gaps.length, painted.join(' | ')).toBeGreaterThan(0)
	expect(Math.min(...gaps), painted.join(' | ')).toBeGreaterThanOrEqual(8 * zoom)
	expect(Math.max(...gaps) - Math.min(...gaps), painted.join(' | ')).toBeLessThanOrEqual(1)
}

// uiZoom is CSS `zoom` on the content wrapper, so the window keeps its real
// size while content lays out in fewer CSS px. Driven through the footer
// buttons (the first two are zoom out / zoom in), exactly as a user does.
async function setUiZoom(page: Page, zoom: number): Promise<void> {
	const steps = Math.round((zoom - 1) / 0.05)
	for (let i = 0; i < steps; i++) await page.locator('[data-testid="footer-left-controls"] button').nth(1).click()
	await expect(page.getByText(`${Math.round(zoom * 100)}%`, {exact: true})).toBeVisible()
	await page.evaluate(async () => document.fonts.ready)
}

// Same mechanism the app uses (CSS `zoom` on the content wrapper), set directly so it also works
// on screens that open a modal dialog at load, which blocks the footer zoom buttons.
async function applyUiZoomToWrapper(page: Page, zoom: number): Promise<void> {
	await page.evaluate(value => {
		const wrapper = document.querySelector('[data-testid="wizard-scrollport"]')?.parentElement
		if (!wrapper) throw new Error('content wrapper not found')
		wrapper.style.zoom = String(value)
	}, zoom)
	await page.evaluate(async () => document.fonts.ready)
}

const ZOOM_LEVELS = [1.25, 1.5] as const
const TAB_BAR_SCREENS = SCREENS.filter(screen => ['settings', 'explore-notice', 'explore-browsing', 'explore-proxy-error'].includes(screen.name))

// The real minimum window (720x680) at the zoom levels users can pick: the
// viewport stays 720px wide, so only container-based rules see the narrowing.
for (const zoom of ZOOM_LEVELS) {
	for (const locale of LOCALES) {
		for (const screen of TAB_BAR_SCREENS) {
			test(`[min-window][uiZoom ${zoom}][${locale}] ${screen.name}: the tab bar fits the zoomed window`, async ({page}) => {
				await page.setViewportSize({width: 720, height: 680})
				await openScreen(page, screen, locale)
				await setUiZoom(page, zoom)
				expect(await overflowingTabs(page)).toEqual([])
				expect(await railOutsideBounds(page)).toEqual([])
				await expectEvenTabSpacing(page)
			})
		}
	}
}

// The tab bar's spacing with the badges that widen triggers: Explore selected
// next to a working Downloads tab with its count, with Explore's "New" badge
// shown and then gone (Continue on the notice), and with a keyboard focus ring
// on the tab beside the selected one. Every window size and UI zoom a user can
// pick, in the longest locales.
const SPACING_VIEWPORTS = [
	{width: 720, height: 760},
	{width: 900, height: 760},
	{width: 1280, height: 800}
] as const
const SPACING_ZOOMS = [1, 1.25, 1.5] as const

for (const viewport of SPACING_VIEWPORTS) {
	for (const zoom of SPACING_ZOOMS) {
		for (const locale of ['en', ...LONG_LOCALES]) {
			test(`[${viewport.width}x${viewport.height}][uiZoom ${zoom}][${locale}] the home tabs are evenly spaced, badges and rings included`, async ({page}) => {
				await page.setViewportSize(viewport)
				await openScreen(page, {name: 'queue-parallel', query: 'scenario=queue-parallel', hash: '', ready: '[data-testid="profiles-tabs"]'}, locale)
				if (zoom !== 1) await setUiZoom(page, zoom)
				await expectEvenTabSpacing(page)

				await page.locator('.explore-tab-trigger').click()
				await expect(page.getByTestId('explore-notice')).toBeVisible()
				await expectEvenTabSpacing(page)

				// Keyboard focus moves to the URL tab, beside the selected Explore pill.
				await page.keyboard.press('ArrowLeft')
				await expectEvenTabSpacing(page)

				await page.getByTestId('explore-notice-continue').click()
				await expect(page.locator('.explore-tab-trigger [data-slot="badge"]')).toHaveCount(0)
				await expectEvenTabSpacing(page)
			})
		}
	}
}

// Explore screens carry no toggle group: their tab bar has its own real-zoom
// sweep above, and the toolbar its own below. The 150% UI-zoom case is the
// slowest and the narrowest, so it runs on the toggle-bearing screens in the
// long locales only; the other viewports sweep everything.
const TOGGLE_SCREENS = SCREENS.filter(screen => !screen.name.startsWith('explore-'))

function sweepFor(viewport: (typeof VIEWPORTS)[number]): {locales: readonly string[]; screens: readonly Screen[]} {
	return 'zoom' in viewport ? {locales: LONG_LOCALES, screens: TOGGLE_SCREENS} : {locales: LOCALES, screens: SCREENS}
}

for (const viewport of VIEWPORTS) {
	const {locales, screens} = sweepFor(viewport)
	for (const locale of locales) {
		for (const screen of screens) {
			test(`[${viewport.name}][${locale}] ${screen.name}: toggles and tabs stay inside their tracks`, async ({page}) => {
				await page.setViewportSize({width: viewport.width, height: viewport.height})
				await openScreen(page, screen, locale)
				if ('zoom' in viewport) await applyUiZoomToWrapper(page, viewport.zoom)
				expect(await overflowingToggles(page)).toEqual([])
				expect(await overflowingGroups(page)).toEqual([])
				expect(await overflowingRadioChips(page)).toEqual([])
				expect(await clippedWithoutEllipsis(page)).toEqual([])
				expect(await overflowingTabs(page)).toEqual([])
			})
		}
	}
}

// The Explore toolbar: every control stays inside the toolbar, the toolbar
// inside its card, and no button outgrows itself. A long profile name
// truncates inside the Download split (min-w-0 + truncate) and stays whole in
// its native title, so the split never pushes past the window.
async function overflowingToolbar(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		const toolbar = document.querySelector<HTMLElement>('[data-testid="explore-toolbar"]')
		if (!toolbar) return [{label: 'explore-toolbar missing', overflowPx: 0, spillPx: 0}]
		const bar = toolbar.getBoundingClientRect()
		const card = toolbar.parentElement?.getBoundingClientRect()
		const spill = (inner: DOMRect, outer: {left: number; right: number}): number => Math.round(Math.max(inner.right - outer.right, outer.left - inner.left))
		if (card && spill(bar, card) > 1) found.push({label: 'toolbar', overflowPx: toolbar.scrollWidth - toolbar.clientWidth, spillPx: spill(bar, card)})
		if (spill(bar, {left: 0, right: window.innerWidth}) > 1) found.push({label: 'toolbar vs window', overflowPx: 0, spillPx: spill(bar, {left: 0, right: window.innerWidth})})
		for (const control of toolbar.querySelectorAll<HTMLElement>('button, input')) {
			const rect = control.getBoundingClientRect()
			if (rect.width === 0) continue
			// The address scrolls its own text, by design; it must only stay inside the bar.
			const overflowPx = control instanceof HTMLInputElement ? 0 : control.scrollWidth - control.clientWidth
			const spillPx = spill(rect, bar)
			if (overflowPx > 1 || spillPx > 1) found.push({label: (control.getAttribute('aria-label') ?? control.textContent ?? '').trim().slice(0, 32), overflowPx, spillPx})
		}
		// The off-site address hint (P2-R45), when shown: its row and its Download button stay in the card.
		const hint = document.querySelector<HTMLElement>('[data-testid="explore-address-hint"]')
		if (hint && card) {
			if (spill(hint.getBoundingClientRect(), card) > 1) found.push({label: 'address hint', overflowPx: hint.scrollWidth - hint.clientWidth, spillPx: spill(hint.getBoundingClientRect(), card)})
			for (const button of hint.querySelectorAll<HTMLElement>('button')) {
				const overflowPx = button.scrollWidth - button.clientWidth
				const spillPx = spill(button.getBoundingClientRect(), hint.getBoundingClientRect())
				if (overflowPx > 1 || spillPx > 1) found.push({label: (button.textContent ?? '').trim().slice(0, 32), overflowPx, spillPx})
			}
		}
		return found
	})
}

const TOOLBAR_SCREENS = SCREENS.filter(screen => screen.name === 'explore-browsing').concat(['explore-long-profile', 'explore-adblock-off', 'explore-adblock-unavailable', 'explore-address-refused'].map(name => ({name, query: `scenario=${name}`, hash: '', ready: '[data-testid="explore-toolbar"]'})))
const TOOLBAR_LOCALES = ['en', ...LONG_LOCALES] as const

for (const viewport of VIEWPORTS) {
	for (const locale of TOOLBAR_LOCALES) {
		for (const screen of TOOLBAR_SCREENS) {
			test(`[${viewport.name}][${locale}] ${screen.name}: the Explore toolbar stays inside its card`, async ({page}) => {
				await page.setViewportSize({width: viewport.width, height: viewport.height})
				await openScreen(page, screen, locale)
				// The real UI zoom, through the footer, as a user sets it.
				if ('zoom' in viewport) await setUiZoom(page, viewport.zoom)
				expect(await overflowingToolbar(page)).toEqual([])
				const download = page.getByTestId('explore-download')
				// The label truncates on a narrow row; hovering shows it whole, in a tooltip that
				// opens above the toolbar and stays inside the window.
				const label = await download.textContent()
				expect(label).not.toBeNull()
				await download.hover()
				const tip = page.locator('[data-slot="tooltip-content"]')
				await expect(tip).toHaveText(label ?? '')
				await expect(tip).toHaveAttribute('data-side', 'top')
				const [box, inner] = [await tip.boundingBox(), await page.evaluate(() => ({width: window.innerWidth}))]
				expect(box?.x ?? -1).toBeGreaterThanOrEqual(0)
				expect((box?.x ?? Infinity) + (box?.width ?? 0)).toBeLessThanOrEqual(inner.width)
			})
		}
	}
}

// The first-run notice's preview of Explore: its miniature toolbar keeps every
// control inside the row (the Download split's label truncates), and the
// preview stays inside the card, at the minimum window, at 150% UI zoom, in the
// longest locales and right to left.
async function overflowingNoticePreview(page: Page): Promise<OverflowReport[]> {
	return page.evaluate(() => {
		const found: {label: string; overflowPx: number; spillPx: number}[] = []
		const preview = document.querySelector<HTMLElement>('[data-testid="explore-preview"]')
		const card = document.querySelector<HTMLElement>('[data-testid="explore-notice"]')
		const toolbar = document.querySelector<HTMLElement>('[data-testid="explore-preview-toolbar"]')
		if (!preview || !card || !toolbar) return [{label: 'explore-preview missing', overflowPx: 0, spillPx: 0}]
		const spill = (inner: DOMRect, outer: DOMRect): number => Math.round(Math.max(inner.right - outer.right, outer.left - inner.left))
		if (spill(preview.getBoundingClientRect(), card.getBoundingClientRect()) > 1) found.push({label: 'preview', overflowPx: 0, spillPx: spill(preview.getBoundingClientRect(), card.getBoundingClientRect())})
		const row = toolbar.getBoundingClientRect()
		if (toolbar.scrollWidth - toolbar.clientWidth > 1) found.push({label: 'preview toolbar', overflowPx: toolbar.scrollWidth - toolbar.clientWidth, spillPx: 0})
		for (const part of toolbar.children) {
			const spillPx = spill(part.getBoundingClientRect(), row)
			if (spillPx > 1) found.push({label: (part.textContent ?? part.tagName).trim().slice(0, 32), overflowPx: 0, spillPx})
		}
		if (document.documentElement.scrollWidth > window.innerWidth + 1) found.push({label: 'page', overflowPx: document.documentElement.scrollWidth - window.innerWidth, spillPx: 0})
		return found
	})
}

// How far Continue sits outside what the scroll viewport shows unscrolled, or
// null when it is fully in view.
async function continueOutOfView(page: Page): Promise<string | null> {
	return page.evaluate(() => {
		const button = document.querySelector<HTMLElement>('[data-testid="explore-notice-continue"]')
		const scrollport = document.querySelector<HTMLElement>('[data-testid="wizard-scrollport"]')
		if (!button || !scrollport) return 'continue or scrollport missing'
		if (scrollport.scrollTop !== 0) return `scrolled to ${scrollport.scrollTop}`
		const rect = button.getBoundingClientRect()
		const view = scrollport.getBoundingClientRect()
		const bottom = Math.min(view.bottom, window.innerHeight)
		const top = Math.max(view.top, 0)
		if (rect.top < top - 0.5 || rect.bottom > bottom + 0.5) return `continue ${Math.round(rect.top)}-${Math.round(rect.bottom)} outside ${Math.round(top)}-${Math.round(bottom)}`
		return null
	})
}

const NOTICE_SCREEN = SCREENS.find(screen => screen.name === 'explore-notice')
for (const viewport of [
	{name: 'min-window', width: 720, height: 760, zoom: 1},
	{name: 'min-window-uizoom-150', width: 720, height: 760, zoom: 1.5},
	{name: 'default-window', width: 900, height: 760, zoom: 1}
] as const) {
	for (const locale of ['en', ...LONG_LOCALES, 'ur']) {
		test(`[${viewport.name}][${locale}] explore-notice: the preview of Explore stays inside its card`, async ({page}) => {
			if (!NOTICE_SCREEN) throw new Error('explore-notice screen missing')
			await page.setViewportSize({width: viewport.width, height: viewport.height})
			await openScreen(page, NOTICE_SCREEN, locale)
			if (viewport.zoom !== 1) await setUiZoom(page, viewport.zoom)
			await expect(page.getByTestId('explore-preview')).toHaveAttribute('aria-hidden', 'true')
			expect(await overflowingNoticePreview(page)).toEqual([])
			// At UI zoom 1 the whole notice, Continue included, is in view without
			// scrolling; at 125% and up, scrolling to Continue is accepted.
			if (viewport.zoom === 1) expect(await continueOutOfView(page)).toBeNull()
		})
	}
}

// Windows High Contrast (forced colours) drops box-shadow rings: the focused
// home tab must keep an outline there, while it stays invisible otherwise.
test('the focused home tab keeps an outline under forced colours', async ({page}) => {
	await page.emulateMedia({forcedColors: 'active'})
	await page.setViewportSize({width: 900, height: 760})
	await openScreen(page, {name: 'explore-browsing', query: 'scenario=explore-browsing', hash: '', ready: '[data-testid="explore-toolbar"]'}, 'en')
	await page.locator('.explore-tab-trigger').click()
	await page.keyboard.press('ArrowLeft')
	const focus = await page.evaluate(() => {
		const active = document.activeElement
		if (!(active instanceof HTMLElement) || active.dataset.slot !== 'tabs-trigger') return null
		const style = getComputedStyle(active)
		return {focusVisible: active.matches(':focus-visible'), outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth}
	})
	expect(focus?.focusVisible).toBe(true)
	expect(focus?.outlineStyle).not.toBe('none')
	expect(parseFloat(focus?.outlineWidth ?? '0')).toBeGreaterThan(0)
})

// The Downloads tab's status badges: a long status ("Needs your choice", in
// the longest locales) is shown whole. It may wrap onto a second line at a
// word boundary, but never ends in an ellipsis or loses part of a word, and
// the badge stays inside its cell.
async function cutStatusBadges(page: Page): Promise<{label: string; problem: string}[]> {
	return page.evaluate(() => {
		const found: {label: string; problem: string}[] = []
		for (const badge of document.querySelectorAll<HTMLElement>('[data-testid^="queue-manager-row-"] [data-slot="badge"]')) {
			const text = (badge.textContent ?? '').trim()
			const cell = badge.closest('td')
			if (!cell || badge.getBoundingClientRect().width === 0) continue
			const rect = badge.getBoundingClientRect()
			const box = cell.getBoundingClientRect()
			if (rect.right > box.right + 1 || rect.left < box.left - 1) found.push({label: text, problem: 'outside its cell'})
			for (const el of [badge, ...badge.querySelectorAll<HTMLElement>('*')]) {
				const style = getComputedStyle(el)
				if (style.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth) found.push({label: text, problem: 'ends in an ellipsis'})
				if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) found.push({label: text, problem: 'content cut off'})
				if (style.overflowWrap === 'anywhere' || style.wordBreak === 'break-all') found.push({label: text, problem: 'may break inside a word'})
			}
			// Geometric check: every line box of the badge's text lies within the badge.
			const range = document.createRange()
			range.selectNodeContents(badge)
			for (const line of range.getClientRects()) {
				if (line.right > rect.right + 1 || line.bottom > rect.bottom + 1) found.push({label: text, problem: 'a word lies outside the badge'})
			}
			// A probing row's Cancel stays inline, beside its badge, inside the cell.
			const cancel = cell.querySelector<HTMLElement>('[data-testid^="queue-cancel-probing-"]')
			if (cancel) {
				const cancelRect = cancel.getBoundingClientRect()
				const middle = cancelRect.top + cancelRect.height / 2
				if (middle < rect.top - 1 || middle > rect.bottom + 1 || cancelRect.left < rect.right - 1) found.push({label: text, problem: 'Cancel is not inline beside the badge'})
				if (cancelRect.right > box.right + 1) found.push({label: text, problem: 'Cancel outside its cell'})
			}
		}
		return found
	})
}

// The format column's label, cut with an ellipsis when it does not fit.
async function cutFormatLabels(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const cut: string[] = []
		for (const row of document.querySelectorAll<HTMLElement>('[data-testid^="queue-manager-row-"]')) {
			const label = [...row.querySelectorAll<HTMLElement>('td span.truncate')].find(span => (span.textContent ?? '').includes('|'))
			if (label && label.scrollWidth > label.clientWidth + 1) cut.push(label.textContent ?? '')
		}
		return cut
	})
}

const QUEUE_ATTENTION_SCREEN: Screen = {name: 'queue-quick-download', query: 'scenario=queue-quick-download', hash: 'queue', ready: '[data-testid="queue-manager-row-qd-capped"]'}

for (const viewport of [
	{width: 720, height: 760},
	{width: 900, height: 760}
] as const) {
	for (const locale of ['en', ...LONG_LOCALES]) {
		test(`[${viewport.width}x${viewport.height}][${locale}] queue status badges show their whole label (needs-choice and error rows)`, async ({page}) => {
			await page.setViewportSize(viewport)
			await openScreen(page, QUEUE_ATTENTION_SCREEN, locale)
			await expect(page.getByTestId('queue-manager-row-qd-failed')).toBeVisible()
			expect(await cutStatusBadges(page)).toEqual([])
			// The default window keeps the format label whole in English.
			if (viewport.width === 900 && locale === 'en') expect(await cutFormatLabels(page)).toEqual([])
		})
	}
}
