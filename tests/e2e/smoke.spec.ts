import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import {expect, test, _electron as electron} from '@playwright/test'

function buildEnv(userDataDir: string): Record<string, string> {
	const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
	env.MOCK_BACKEND = '1'
	env.ELECTRON_USER_DATA = userDataDir
	delete env.ELECTRON_RUN_AS_NODE
	return env
}

async function launchApp(userDataDir: string) {
	return electron.launch({args: [path.join(process.cwd(), 'out/main/index.js')], env: buildEnv(userDataDir)})
}

test('app shell renders with expected structure', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-shell-'))
	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	await expect(page.locator('[data-testid="app-root"]')).toBeVisible({timeout: 15_000})
	await expect(page.locator('[data-testid="app-content"]')).toBeVisible()
	await expect(page.locator('[data-testid="profiles-main-input"]')).toBeVisible()

	await app.close()
})

test('preload exposes appApi, platform, and appVersion', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-preload-'))
	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	await page.locator('[data-testid="app-root"]').waitFor({timeout: 15_000})

	const hasAppApi = await page.evaluate(() => typeof window.appApi === 'object' && window.appApi !== null)
	const hasPlatform = await page.evaluate(() => typeof window.platform === 'string' && window.platform.length > 0)
	const hasAppVersion = await page.evaluate(() => typeof window.appVersion === 'string' && window.appVersion.length > 0)

	expect(hasAppApi).toBe(true)
	expect(hasPlatform).toBe(true)
	expect(hasAppVersion).toBe(true)

	await app.close()
})

test('window.require is NOT exposed (context isolation enforced)', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-isolation-'))
	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	await page.locator('[data-testid="app-root"]').waitFor({timeout: 15_000})

	const requireExposed = await page.evaluate(() => typeof (window as Window & {require?: unknown}).require !== 'undefined')
	expect(requireExposed).toBe(false)

	await app.close()
})

test('URL input is interactive', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-url-'))
	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	const input = page.locator('[data-testid="profiles-main-input"]')
	await input.waitFor({timeout: 15_000})

	await input.fill('https://www.youtube.com/watch?v=test')
	const value = await input.inputValue()
	expect(value).toBe('https://www.youtube.com/watch?v=test')

	await app.close()
})
