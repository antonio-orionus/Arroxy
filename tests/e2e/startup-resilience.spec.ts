import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import {expect, test, _electron as electron, type ElectronApplication} from '@playwright/test'
import {openQueueTab} from './fixtureWorkflow.js'

function buildEnv(userDataDir: string): Record<string, string> {
	const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
	env.MOCK_BACKEND = '1'
	env.ELECTRON_USER_DATA = userDataDir
	delete env.ELECTRON_RUN_AS_NODE
	return env
}

async function launchApp(userDataDir: string): Promise<ElectronApplication> {
	return electron.launch({args: [path.join(process.cwd(), 'out/main/index.js')], env: buildEnv(userDataDir)})
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
	// Manager. The queue was quit paused: an unpaused scheduler restarts the row
	// at boot and the mock backend finishes it before any assertion could see
	// it pending, so the paused flag is what makes the restored state observable.
	const outputDir = os.tmpdir()
	const queueData = {
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
		],
		schedulerPaused: true
	}
	fs.writeFileSync(path.join(userDataDir, 'queue.json'), JSON.stringify(queueData), 'utf-8')

	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	await expect(page.locator('[data-testid="app-root"]')).toBeVisible({timeout: 15_000})
	await openQueueTab(page)
	const row = page.locator('[data-testid="queue-manager-row-test-item-1"]')
	await expect(row).toHaveAttribute('data-status', 'pending')
	await expect(row.locator('[data-testid="queue-title"]')).toContainText('Seeded pending item')
	await expect(page.getByTestId('queue-paused-banner')).toBeVisible()

	// The restored row is a live job, not a display-only leftover: resuming the
	// queue runs it to completion.
	await page.getByTestId('queue-resume-from-banner').click()
	await expect(row).toHaveAttribute('data-status', 'done', {timeout: 30_000})

	await app.close()
})
