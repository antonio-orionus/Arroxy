import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import {expect, test, _electron as electron, type ElectronApplication} from '@playwright/test'

function buildEnv(userDataDir: string, extra: Record<string, string> = {}): Record<string, string> {
	const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
	env.MOCK_BACKEND = '1'
	env.ELECTRON_USER_DATA = userDataDir
	delete env.ELECTRON_RUN_AS_NODE
	return {...env, ...extra}
}

async function launchApp(userDataDir: string, options: {args?: string[]; env?: Record<string, string>} = {}): Promise<ElectronApplication> {
	return electron.launch({args: [path.join(process.cwd(), 'out/main/index.js'), ...(options.args ?? [])], env: buildEnv(userDataDir, options.env)})
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

// Lines logged before app-ready (boot identity, Chromium switches, GPU mode)
// must land in the same profile log as the rest of the session. Otherwise a run
// with a scratch ELECTRON_USER_DATA leaks them into electron-log's default file,
// which on Windows is the real install's main.log.
test('pre-ready log lines go to the ELECTRON_USER_DATA profile log', async () => {
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-boot-log-'))
	const app = await launchApp(userDataDir)
	const page = await app.firstWindow()

	await expect(page.locator('[data-testid="app-root"]')).toBeVisible({timeout: 15_000})
	await app.close()

	const mainLog = fs.readFileSync(path.join(userDataDir, 'logs', 'main.log'), 'utf8')
	expect(mainLog).toMatch(/\[info\]\s+boot \{/)
	expect(mainLog).toMatch(/\[info\]\s+Session started/)
})

// Chromium's application locale (app.getLocale(), navigator.language) only
// resolves to locales Chromium ships, so an OS set to Khmer reads as en-US. The
// first launch must follow the OS's own preference list instead. macOS takes a
// per-process -AppleLanguages override; Linux reads LANGUAGE through GLib.
test('first launch follows an OS language Chromium ships no locale for', async () => {
	test.skip(process.platform === 'win32', 'Windows has no per-process override for the preferred UI languages')
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-system-language-'))
	const app = await launchApp(userDataDir, process.platform === 'darwin' ? {args: ['-AppleLanguages', '(km-KH, en-US)']} : {env: {LANGUAGE: 'km_KH:en_US'}})
	const page = await app.firstWindow()

	await expect(page.locator('[data-testid="app-root"]')).toBeVisible({timeout: 15_000})
	await expect(page.locator('html')).toHaveAttribute('lang', 'km')
	expect(await app.evaluate(({app: electronApp}) => electronApp.getLocale())).toBe('en-US')

	await app.close()
})
