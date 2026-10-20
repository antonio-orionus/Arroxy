import {test} from '@playwright/test'
import type {Page} from '@playwright/test'

// Regenerates the README screenshots in build/ from the browser-mock renderer.
//
//   bun run screenshots:readme                      every shot
//   bun run screenshots:readme -g "Bulk URLs"        one shot
//
// Each shot is a scenario from the Scenario Workbench rendered with showcase
// content (`showcase=1`: sample titles and generated artwork instead of fixture
// text) and the software WebGL backdrop (`backdropSoftware=1`, so headless
// Chromium shows the GPU look), at the default window size and 2x pixel
// density, in the dark theme. Each shot waits for its own `ready` element.
// To add a shot for a new feature: add a scenario if none shows it, add an entry
// below, run the command, and reference build/<file> from readme-src/template.md.

interface Shot {
	name: string
	file: string
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
	{name: 'Quick Download home', file: 'Main-screenshot.png', query: 'scenario=profiles-home-clipboard-single', ready: '[data-testid="profiles-quick-download"]:not([disabled])'},
	{name: 'Download profiles', file: 'Download-profiles-screenshot.png', query: 'scenario=default', ready: '[data-testid="profiles-manage-tab"]', prepare: page => openTab(page, 'Profiles')},
	{
		name: 'Per-item playlist profiles',
		file: 'Per-item-playlist-profiles-screenshot.png',
		query: 'scenario=playlist-multi-profile',
		ready: '[data-testid^="profile-row-"][aria-selected="true"]',
		prepare: async page => {
			await page.locator('[data-testid^="select-row-"]').nth(1).click()
			await page.locator('[data-testid^="select-row-"]').nth(2).click()
		}
	},
	{
		name: 'Multi-language audio',
		file: 'Multi-lang-audio-support-screenshot.png',
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
		file: 'Dolby-audio-support-screenshot.png',
		query: 'scenario=probe-audio-surround',
		height: 840,
		ready: '[data-slot="radio-group"] [data-checked]:has-text("E-AC-3")',
		prepare: async page => {
			await page.getByRole('radio', {name: /E-AC-3/}).click()
		},
		spotlight: ['[data-testid="audio-column"]']
	},
	{name: '8K HDR video', file: '8K-HDR-video-screenshot.png', query: 'scenario=single-8k-hdr', height: 840, ready: '[data-testid="video-column"] [data-checked]', spotlight: ['[data-testid="video-column"]']},
	{
		name: 'Subtitles',
		file: 'Subtitles-screenshot.png',
		query: 'scenario=single-review-subtitles',
		height: 840,
		ready: '[data-testid="review-row-subtitles"] [data-checked]',
		prepare: async page => {
			// A few uploaded languages and the original-language captions, as someone would pick them.
			for (const language of ['English', 'Spanish', 'Japanese', 'English (Original)']) await page.getByRole('checkbox', {name: language, exact: true}).click()
		},
		spotlight: ['[data-testid="review-row-subtitles"]']
	},
	{
		name: 'Bulk URLs',
		file: 'Bulk-urls-mode-screenshot.png',
		query: 'scenario=profiles-bulk',
		ready: 'text=Duplicate',
		prepare: async page => {
			// The repeated first link shows duplicate detection.
			await page.getByTestId('bulk-url-textarea').fill([...SAMPLE_URLS, SAMPLE_URLS[0]].join('\n'))
		}
	},
	{name: 'Profile editor', file: 'Profile-editor-screenshot.png', query: 'scenario=profiles-editor', width: 1100, height: 1000, ready: '[data-testid="profiles-editor-dialog"]', prepare: page => page.getByRole('button', {name: 'Advanced'}).click()},
	{name: 'Part of video', file: 'Part-of-video-screenshot.png', query: 'scenario=single-part', height: 1100, ready: '[data-testid="video-part-panel"]', spotlight: ['[data-testid="video-part-panel"]']},
	{name: 'Explore', file: 'Explore-screenshot.png', query: 'scenario=explore-notice', ready: '[data-testid="explore-notice"]'},
	{name: 'Explore browsing', file: 'Explore-browsing-screenshot.png', query: 'scenario=explore-browsing', ready: '[data-testid="explore-mock-page"] img'},
	{name: 'Downloads attention', file: 'Downloads-attention-screenshot.png', query: 'scenario=queue-attention', height: 980, ready: '[data-testid="queue-attention-qa-capped"]', prepare: page => openTab(page, 'Downloads')},
	{name: 'Parallel downloads', file: 'Downloading-in-parallel-screenshot.png', query: 'scenario=queue-parallel', ready: '[data-testid="queue-manager-row-queue-parallel-6"]', prepare: page => openTab(page, 'Downloads')}
]

// Chrome that belongs to the workbench or to first-run moments, not to the feature being shown.
const HIDE = ['[data-testid="scenario-gallery"]', '[data-testid="queue-tab-first-run-cue"]', '[data-testid="feedback-nudge"]', '[data-testid="style-hint"]', '[data-testid="format-profile-callout"]', '[data-testid="video-part-callout"]', '[data-testid="explore-link-callout"]']

async function openTab(page: Page, name: string): Promise<void> {
	await page
		.getByRole('tab', {name: new RegExp(name)})
		.first()
		.click()
}

// Opens a scenario with showcase content and waits until it has settled.
async function settle(page: Page, query: string, ready: string, options: {theme?: 'dark' | 'light'; style?: 'aurora' | 'minimal'; prepare?: Shot['prepare']} = {}): Promise<void> {
	const {theme = 'dark', style, prepare} = options
	await page.goto(`/?${query}&theme=${theme}${style ? `&style=${style}` : ''}&showcase=1&backdropSoftware=1`)
	await page.waitForSelector('[data-testid="app-root"]')
	await page.addStyleTag({content: `${HIDE.join(',')}{display:none!important}`})
	// Minimal draws no backdrop, so only Aurora has a WebGL scene to wait for.
	if (style !== 'minimal') await page.waitForSelector('body.backdrop-webgl-active')
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

for (const shot of SHOTS) {
	test(shot.name, async ({page}) => {
		if (shot.height || shot.width) await page.setViewportSize({width: shot.width ?? 900, height: shot.height ?? 760})
		await settle(page, shot.query, shot.ready, {prepare: shot.prepare})
		if (shot.spotlight) await spotlight(page, shot.spotlight)
		await page.screenshot({path: `build/${shot.file}`})
	})
}

// The main screen in both themes and both styles, captured one by one and laid out as a 2x2 grid:
// Aurora on the top row, Minimal below; dark on the left, light on the right.
const LOOKS = [
	{style: 'aurora', theme: 'dark'},
	{style: 'aurora', theme: 'light'},
	{style: 'minimal', theme: 'dark'},
	{style: 'minimal', theme: 'light'}
] as const

test('Themes and styles', async ({page, context}) => {
	const frames: string[] = []
	for (const look of LOOKS) {
		await settle(page, 'scenario=profiles-home-clipboard-single', '[data-testid="profiles-quick-download"]:not([disabled])', look)
		frames.push((await page.screenshot({omitBackground: true})).toString('base64'))
	}
	const grid = await context.newPage()
	await grid.setViewportSize({width: 1000, height: 800})
	await grid.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(2,480px);gap:20px;width:max-content;background:transparent">${frames.map(frame => `<img src="data:image/png;base64,${frame}" style="width:480px;display:block;border-radius:14px">`).join('')}</body>`)
	await grid.waitForFunction(() => [...document.images].every(image => image.complete))
	await grid.locator('body').screenshot({path: 'build/Themes-and-styles-screenshot.png', omitBackground: true})
})
