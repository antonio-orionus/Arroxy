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
	prepare?: (page: Page) => Promise<void>
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
			await page.locator('[data-testid^="profile-row-"]').nth(1).click()
		}
	},
	{name: 'Multi-language audio', file: 'Multi-lang-audio-support-screenshot.png', query: 'scenario=probe-audio-multilingual', ready: '[data-slot="radio-group"] [data-checked]'},
	{name: 'Surround audio', file: 'Dolby-audio-support-screenshot.png', query: 'scenario=probe-audio-surround', ready: '[data-slot="radio-group"] [data-checked]'},
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
	{name: 'Parallel downloads', file: 'Downloading-in-parallel-screenshot.png', query: 'scenario=queue-parallel', ready: '[data-testid="queue-manager-row-queue-parallel-6"]', prepare: page => openTab(page, 'Downloads')}
]

// Chrome that belongs to the workbench or to first-run moments, not to the feature being shown.
const HIDE = ['[data-testid="scenario-gallery"]', '[data-testid="queue-tab-first-run-cue"]', '[data-testid="feedback-nudge"]']

async function openTab(page: Page, name: string): Promise<void> {
	await page
		.getByRole('tab', {name: new RegExp(name)})
		.first()
		.click()
}

for (const shot of SHOTS) {
	test(shot.name, async ({page}) => {
		await page.goto(`/?${shot.query}&theme=dark&showcase=1&backdropSoftware=1`)
		await page.waitForSelector('[data-testid="app-root"]')
		await page.addStyleTag({content: `${HIDE.join(',')}{display:none!important}`})
		await page.waitForSelector('body.backdrop-webgl-active')
		if (shot.prepare) {
			// Probe scenarios land on their step only after the mock's probe delay.
			await page.waitForSelector('[data-testid="profiles-tabs"], [data-testid="wizard-panel"] [data-testid^="step-"]')
			await shot.prepare(page)
		}
		await page.waitForSelector(shot.ready)
		await page.waitForFunction(() => [...document.images].every(image => image.complete))
		// Let entrance transitions finish so nothing is caught mid-fade.
		await page.waitForTimeout(600)
		await page.screenshot({path: `build/${shot.file}`})
	})
}
