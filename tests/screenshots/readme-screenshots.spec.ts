import {mkdir, writeFile} from 'node:fs/promises'
import {dirname} from 'node:path'
import {test} from '@playwright/test'
import type {Page} from '@playwright/test'
import sharp from 'sharp'
import {SUPPORTED_LANGS} from '../../src/shared/schemas.js'
import type {SupportedLang} from '../../src/shared/schemas.js'

// Regenerates the README screenshots from the browser-mock renderer.
//
//   bun run screenshots:readme                          every shot in every UI language
//   bun run screenshots:readme -g "Bulk URLs"            one shot, in every language
//   bun run screenshots:readme --locales de,fr          every shot in German and French only
//
// Each shot is written as WebP to build/screenshots/<locale>/, where each README
// shows its own language's shot. The shots the Flatpak metainfo lists are also
// written in English as PNG to build/, since AppStream takes no WebP. Steps find
// elements by test id, never by visible text, so every locale runs the same recipe.
//
// Each shot is a scenario from the Scenario Workbench rendered with showcase
// content (`showcase=1`: sample titles and generated artwork instead of fixture
// text) and the software WebGL backdrop (`backdropSoftware=1`, so headless
// Chromium shows the GPU look), at the default window size and 2x pixel
// density, in the dark theme. Each shot waits for its own `ready` element.
// To add a shot for a new feature: add a scenario if none shows it, add an entry
// below, run the command, and reference build/screenshots/en/<file>.webp from
// readme-src/template.md.

interface Shot {
	name: string
	// The file name without its extension.
	file: string
	// Listed in the Flatpak metainfo, which needs an English PNG in build/.
	appstream?: true
	query: string
	// The element that proves the screen finished loading (after `prepare`, if any).
	ready: string
	// A taller window than the default, for a screen whose story does not fit in 760 px.
	height?: number
	// A wider window than the default, for a dialog that does not fit in 900 px.
	width?: number
	prepare?: (page: Page) => Promise<void>
	// The elements the shot is about: one lit area covers them all, and everything around it is dimmed, as under a spotlight.
	spotlight?: readonly string[]
}

const SAMPLE_URLS = ['https://www.youtube.com/watch?v=aurora4k01', 'https://www.youtube.com/watch?v=reefdoc002', 'https://www.youtube.com/watch?v=nighttrain3']

const SHOTS: readonly Shot[] = [
	{name: 'Quick Download home', file: 'Main-screenshot', appstream: true, query: 'scenario=profiles-home-clipboard-single', ready: '[data-testid="profiles-quick-download"]:not([aria-disabled="true"])'},
	{name: 'Download profiles', file: 'Download-profiles-screenshot', query: 'scenario=default', ready: '[data-testid="profiles-manage-tab"]', prepare: page => openTab(page, 'profiles')},
	{
		name: 'Per-item playlist profiles',
		file: 'Per-item-playlist-profiles-screenshot',
		query: 'scenario=playlist-multi-profile',
		ready: '[data-testid^="profile-row-"][aria-selected="true"]',
		prepare: async page => {
			await page.locator('[data-testid^="select-row-"]').nth(1).click()
			await page.locator('[data-testid^="select-row-"]').nth(2).click()
		}
	},
	{
		name: 'Multi-language audio',
		file: 'Multi-lang-audio-support-screenshot',
		query: 'scenario=probe-audio-multilingual',
		height: 840,
		ready: '[role="option"]',
		prepare: async page => {
			// The open language list is the feature: it shows how many tracks the video carries.
			await page.getByTestId('audio-language').click()
		},
		spotlight: ['[data-testid="audio-column"]', '[role="listbox"]']
	},
	{
		name: 'Surround audio',
		file: 'Dolby-audio-support-screenshot',
		query: 'scenario=probe-audio-surround',
		height: 840,
		ready: '[data-slot="radio-group"] [data-checked]:has-text("E-AC-3")',
		prepare: async page => {
			await page.getByRole('radio', {name: /E-AC-3/}).click()
		},
		spotlight: ['[data-testid="audio-column"]']
	},
	{name: '8K HDR video', file: '8K-HDR-video-screenshot', appstream: true, query: 'scenario=single-8k-hdr', height: 840, ready: '[data-testid="video-column"] [data-checked]', spotlight: ['[data-testid="video-column"]']},
	{
		name: 'Subtitles',
		file: 'Subtitles-screenshot',
		appstream: true,
		query: 'scenario=single-review-subtitles',
		height: 840,
		ready: '[data-testid="review-row-subtitles"] [data-checked]',
		prepare: async page => {
			// A few uploaded languages and the original-language captions, as someone would pick them.
			for (const code of ['en', 'es', 'ja', 'en-orig']) await page.locator(`[data-testid="review-row-subtitles"] [id$="-${code}-label"]`).click()
		},
		spotlight: ['[data-testid="review-row-subtitles"]']
	},
	{
		name: 'Bulk URLs',
		file: 'Bulk-urls-mode-screenshot',
		query: 'scenario=profiles-bulk',
		ready: '[data-testid="bulk-url-rejected"]',
		prepare: async page => {
			// The repeated first link shows duplicate detection.
			await page.getByTestId('bulk-url-textarea').fill([...SAMPLE_URLS, SAMPLE_URLS[0]].join('\n'))
		}
	},
	{name: 'Profile editor', file: 'Profile-editor-screenshot', appstream: true, query: 'scenario=profiles-editor', width: 1100, height: 1000, ready: '[data-testid="profiles-editor-dialog"]', prepare: page => page.getByTestId('profiles-editor-video-advanced-toggle').click()},
	{name: 'Part of video', file: 'Part-of-video-screenshot', query: 'scenario=single-part', height: 1100, ready: '[data-testid="video-part-panel"]', spotlight: ['[data-testid="video-part-panel"]']},
	{name: 'Explore', file: 'Explore-screenshot', query: 'scenario=explore-notice', ready: '[data-testid="explore-notice"]'},
	{name: 'Explore browsing', file: 'Explore-browsing-screenshot', query: 'scenario=explore-browsing', ready: '[data-testid="explore-mock-page"] img'},
	{name: 'Downloads attention', file: 'Downloads-attention-screenshot', query: 'scenario=queue-attention', height: 980, ready: '[data-testid="queue-attention-qa-capped"]', prepare: page => openTab(page, 'queue')},
	{name: 'Parallel downloads', file: 'Downloading-in-parallel-screenshot', appstream: true, query: 'scenario=queue-parallel', ready: '[data-testid="queue-manager-row-queue-parallel-6"]', prepare: page => openTab(page, 'queue')}
]

// Chrome that belongs to the workbench or to first-run moments, not to the feature being shown.
const HIDE = ['[data-testid="scenario-gallery"]', '[data-testid="queue-tab-first-run-cue"]', '[data-testid="feedback-nudge"]', '[data-testid="style-hint"]', '[data-testid="format-profile-callout"]', '[data-testid="video-part-callout"]', '[data-testid="explore-link-callout"]']

async function openTab(page: Page, tab: 'profiles' | 'queue'): Promise<void> {
	await page.getByTestId(`home-tab-${tab}`).click()
}

// `ARROXY_SHOT_LOCALES` (set by `--locales`): a comma-separated list, or `all`.
function shotLocales(): SupportedLang[] {
	const raw = process.env.ARROXY_SHOT_LOCALES?.trim() ?? ''
	if (raw === '' || raw === 'all') return [...SUPPORTED_LANGS]
	return raw.split(',').map(code => {
		const locale = SUPPORTED_LANGS.find(lang => lang === code.trim())
		if (!locale) throw new Error(`Unknown locale "${code}". Supported: ${SUPPORTED_LANGS.join(', ')}`)
		return locale
	})
}

const LOCALES = shotLocales()

// Lossy WebP at 2x pixel density reads as sharp as the PNG for UI text, at about a fifteenth of the size.
const WEBP = {quality: 80, effort: 6} as const

async function save(locale: SupportedLang, file: string, png: Buffer, appstream = false): Promise<void> {
	const path = `build/screenshots/${locale}/${file}.webp`
	await mkdir(dirname(path), {recursive: true})
	await sharp(png).webp(WEBP).toFile(path)
	if (appstream && locale === 'en') await writeFile(`build/${file}.png`, png)
}

// English keeps the bare name; `-g "Bulk URLs"` matches every language's title.
function titled(name: string, locale: SupportedLang): string {
	return locale === 'en' ? name : `${name} [${locale}]`
}

const BACKDROP_ATTEMPTS = 3

// Opens a scenario with showcase content and waits until it has settled.
async function settle(page: Page, query: string, ready: string, options: {locale: SupportedLang; theme?: 'dark' | 'light'; style?: 'aurora' | 'minimal'; prepare?: Shot['prepare']}): Promise<void> {
	const {locale, theme = 'dark', style, prepare} = options
	const url = `/?${query}&locale=${locale}&theme=${theme}${style ? `&style=${style}` : ''}&showcase=1&backdropSoftware=1`
	// Minimal draws no backdrop, so only Aurora has a WebGL scene to wait for. With
	// several pages rendering at once, the backdrop's start-up timing can judge
	// software WebGL too slow and fall back to the CSS look; a fresh load retries it.
	for (let attempt = 1; ; attempt++) {
		await page.goto(url)
		await page.waitForSelector('[data-testid="app-root"]')
		if (style === 'minimal') break
		const webgl = await page
			.waitForSelector('body.backdrop-webgl-active', {state: 'attached', timeout: 10_000})
			.then(() => true)
			.catch(() => false)
		if (webgl) break
		if (attempt === BACKDROP_ATTEMPTS) throw new Error(`The WebGL backdrop did not start after ${BACKDROP_ATTEMPTS} loads: ${url}`)
	}
	await page.addStyleTag({content: `${HIDE.join(',')}{display:none!important}`})
	if (prepare) {
		// Probe scenarios land on their step only after the mock's probe delay.
		await page.waitForSelector('[data-testid="profiles-tabs"], [data-testid="wizard-panel"] [data-testid^="step-"]')
		await prepare(page)
	}
	await page.waitForSelector(ready)
	await page.waitForFunction(() => [...document.images].every(image => image.complete))
	// Let entrance transitions finish so nothing is caught mid-fade.
	await page.waitForTimeout(600)
}

// Dims the window around the elements with one soft-edged cut-out over all of
// them, and lights that area faintly, so the eye lands on the feature first.
async function spotlight(page: Page, selectors: readonly string[]): Promise<void> {
	const boxes = await Promise.all(
		selectors.map(async selector => {
			const box = await page.locator(selector).boundingBox()
			if (!box) throw new Error(`spotlight target not visible: ${selector}`)
			return box
		})
	)
	const left = Math.min(...boxes.map(box => box.x))
	const top = Math.min(...boxes.map(box => box.y))
	const area = {x: left, y: top, width: Math.max(...boxes.map(box => box.x + box.width)) - left, height: Math.max(...boxes.map(box => box.y + box.height)) - top}
	await page.evaluate(({x, y, width, height}) => {
		const pad = 20
		const light = document.createElement('div')
		light.style.cssText = [
			'position:fixed',
			'pointer-events:none',
			'z-index:2147483647',
			`left:${x - pad}px`,
			`top:${y - pad}px`,
			`width:${width + pad * 2}px`,
			`height:${height + pad * 2}px`,
			'border-radius:28px',
			// The huge spread is the dimmed room; the blur feathers its edge into the light.
			'box-shadow:0 0 0 200vmax rgb(3 5 14 / 0.66)',
			'filter:blur(22px)',
			// A faint beam from above, as from a projector.
			'background:radial-gradient(ellipse 70% 60% at 50% 0%, rgb(170 200 255 / 0.10), transparent 70%)'
		].join(';')
		document.body.appendChild(light)
	}, area)
}

// Opens the page and takes the shot. The backdrop rechecks its speed about two
// seconds after it starts and may fall back to the CSS look then, so an Aurora
// shot counts only when WebGL was still on both before and after the capture.
async function capture(page: Page, open: () => Promise<void>, take: () => Promise<Buffer>, webgl: boolean): Promise<Buffer> {
	const webglOn = (): Promise<boolean> => page.evaluate(() => document.body.classList.contains('backdrop-webgl-active'))
	for (let attempt = 1; ; attempt++) {
		await open()
		if (!webgl) return take()
		if (await webglOn()) {
			const image = await take()
			if (await webglOn()) return image
		}
		if (attempt === BACKDROP_ATTEMPTS) throw new Error(`The WebGL backdrop fell back during ${BACKDROP_ATTEMPTS} captures: ${page.url()}`)
	}
}

for (const locale of LOCALES) {
	for (const shot of SHOTS) {
		test(titled(shot.name, locale), async ({page}) => {
			if (shot.height || shot.width) await page.setViewportSize({width: shot.width ?? 900, height: shot.height ?? 760})
			const open = async (): Promise<void> => {
				await settle(page, shot.query, shot.ready, {locale, prepare: shot.prepare})
				if (shot.spotlight) await spotlight(page, shot.spotlight)
			}
			await save(locale, shot.file, await capture(page, open, () => page.screenshot(), true), shot.appstream)
		})
	}
}

// The main screen in both themes and both styles, captured one by one and laid out as a 2x2 grid:
// Aurora on the top row, Minimal below; dark on the left, light on the right.
const LOOKS = [
	{style: 'aurora', theme: 'dark'},
	{style: 'aurora', theme: 'light'},
	{style: 'minimal', theme: 'dark'},
	{style: 'minimal', theme: 'light'}
] as const

for (const locale of LOCALES) {
	test(titled('Themes and styles', locale), async ({page, context}) => {
		const frames: string[] = []
		for (const look of LOOKS) {
			const open = (): Promise<void> => settle(page, 'scenario=profiles-home-clipboard-single', '[data-testid="profiles-quick-download"]:not([aria-disabled="true"])', {...look, locale})
			const image = await capture(page, open, () => page.screenshot({omitBackground: true}), look.style === 'aurora')
			frames.push(image.toString('base64'))
		}
		const grid = await context.newPage()
		await grid.setViewportSize({width: 1000, height: 800})
		await grid.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(2,480px);gap:20px;width:max-content;background:transparent">${frames.map(frame => `<img src="data:image/png;base64,${frame}" style="width:480px;display:block;border-radius:14px">`).join('')}</body>`)
		await grid.waitForFunction(() => [...document.images].every(image => image.complete))
		await save(locale, 'Themes-and-styles-screenshot', await grid.locator('body').screenshot({omitBackground: true}))
	})
}
