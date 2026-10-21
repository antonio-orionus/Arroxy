import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import {expect, test, _electron as electron, type ElectronApplication} from '@playwright/test'
import {ensureYtDlpPath} from './fixtureHarness.js'
import {waitForStartupSplashToLeave} from './fixtureWorkflow.js'

function buildEnv(userDataDir: string, ytDlpPath: string): Record<string, string> {
	const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
	env.MOCK_BACKEND = '1'
	env.ELECTRON_USER_DATA = userDataDir
	// MOCK_BACKEND still runs the real runtime warmup. Without a runnable yt-dlp
	// a fresh profile downloads one behind the first-time setup splash, which
	// covers the shell. The global setup has already warmed this one.
	env.ARROXY_YT_DLP_PATH = ytDlpPath
	delete env.ELECTRON_RUN_AS_NODE
	return env
}

async function launchApp(userDataDir: string): Promise<ElectronApplication> {
	return electron.launch({args: [path.join(process.cwd(), 'out/main/index.js')], env: buildEnv(userDataDir, await ensureYtDlpPath())})
}

test('corrupted settings.json → app still reaches shell', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-corrupt-settings-'))
	fs.writeFileSync(path.join(userDataDir, 'settings.json'), 'not valid json', 'utf-8')

	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	// App must reach the shell despite corrupt settings — falls back to defaults.
	await expect(page.locator('[data-testid="app-root"]')).toBeVisible({timeout: 15_000})
	await expect(page.locator('[data-testid="profiles-main-input"]')).toBeVisible()

	await app.close()
})

test('corrupted queue.json → app still reaches shell', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-corrupt-queue-'))
	fs.writeFileSync(path.join(userDataDir, 'queue.json'), '{ broken', 'utf-8')

	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	await expect(page.locator('[data-testid="app-root"]')).toBeVisible({timeout: 15_000})
	await expect(page.locator('[data-testid="profiles-main-input"]')).toBeVisible()

	await app.close()
})

test('seeded pending queue → Queue Manager hydrates from persisted store', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-seeded-queue-'))

	// Write a queue.json that has one pending item — simulates an unfinished
	// download from a previous session. The app should re-hydrate it in Queue
	// Manager. The queue was quit paused, so the boot-time spawn pass leaves the
	// row pending instead of running it straight through the mock backend.
	const outputDir = os.tmpdir()
	const queueData = {
		schedulerPaused: true,
		items: [
			{
				id: 'test-item-1',
				url: 'https://www.youtube.com/watch?v=seeded',
				title: 'Seeded pending item',
				thumbnail: '',
				outputDir,
				formatLabel: '720p · mp4',
				status: 'pending',
				lane: 'normal',
				progressPercent: 0,
				progressDetail: null,
				lastStatus: null,
				error: null,
				finishedAt: null,
				writeM3u: true,
				job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
			}
		]
	}
	fs.writeFileSync(path.join(userDataDir, 'queue.json'), JSON.stringify(queueData), 'utf-8')

	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	await expect(page.locator('[data-testid="app-root"]')).toBeVisible({timeout: 15_000})
	await waitForStartupSplashToLeave(page, 30_000)
	// The queue lives behind the Downloads tab; its class is locale-independent.
	await page.locator('.downloads-tab-trigger').click()
	await expect(page.locator('[data-testid="queue-manager-tab"]')).toBeVisible()
	await expect(page.locator('[data-testid="queue-manager-row-test-item-1"]')).toHaveAttribute('data-status', 'pending')
	await expect(page.locator('[data-testid="queue-manager-row-test-item-1"] [data-testid="queue-title"]')).toContainText('Seeded pending item')

	await app.close()
})
