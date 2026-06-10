import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import {expect, test, _electron as electron, type Page} from '@playwright/test'

function defaultExePath(): string {
	if (process.platform === 'win32') return path.join(process.cwd(), 'dist', 'win-unpacked', 'Arroxy.exe')
	if (process.platform === 'darwin') return path.join(process.cwd(), 'dist', 'mac-arm64', 'Arroxy.app', 'Contents', 'MacOS', 'Arroxy')
	return path.join(process.cwd(), 'dist', 'linux-unpacked', 'arroxy')
}

// On CI this is set by the workflow; locally falls back to the platform's default unpacked path.
const PACKAGED_EXE = process.env.PACKAGED_EXE ?? defaultExePath()

const WARMUP_TIMEOUT_MS = 12 * 60 * 1000 // yt-dlp + deno cold download

function compactText(text: string): string {
	return text.replace(/\s+/g, ' ').trim()
}

async function waitForWarmupSuccess(page: Page): Promise<void> {
	const splash = page.locator('[data-testid="splash-overlay"]')
	const blockedSplash = page.locator('[data-testid="splash-overlay"][data-state="blocked"]')
	const outcome = await Promise.race([splash.waitFor({state: 'detached', timeout: WARMUP_TIMEOUT_MS}).then(() => 'ready' as const), blockedSplash.waitFor({state: 'attached', timeout: WARMUP_TIMEOUT_MS}).then(() => 'blocked' as const)])

	if (outcome === 'blocked') {
		throw new Error(`Cold-start warmup surfaced blocking dependency repair UI: ${compactText(await splash.innerText())}`)
	}
}

test('packaged exe: downloads binaries, completes warmup, shows wizard', async () => {
	// Override the timeout for this test only — warmup downloads yt-dlp (~80 MB)
	// and deno (~120 MB) from GitHub Releases on a cold runner.
	test.setTimeout(WARMUP_TIMEOUT_MS + 60_000)

	const tmpBase = process.env.ARROXY_COLD_TMPDIR ?? os.tmpdir()
	const userDataDir = fs.mkdtempSync(path.join(tmpBase, 'arroxy-cold-'))

	const baseEnv = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => typeof e[1] === 'string'))
	delete baseEnv.ELECTRON_RUN_AS_NODE

	const app = await electron.launch({
		executablePath: PACKAGED_EXE,
		env: {
			...baseEnv,
			ELECTRON_USER_DATA: userDataDir
			// Explicitly absent: MOCK_BACKEND — we want real warmup
		}
	})

	try {
		const page = await app.firstWindow()

		// Preload bridge check — fast, confirms packaging + contextBridge OK.
		const hasApi = await page.evaluate(() => typeof window.appApi === 'object' && window.appApi !== null)
		expect(hasApi).toBe(true)

		// Wait for splash to leave the DOM. WarmupSplash returns null only after:
		//   (1) warmup IPC resolves with no blocking failures,
		//   (2) 3-second minimum display time passes,
		//   (3) CSS opacity transition completes.
		// This is the slow step on a cold runner (binary downloads). If setup
		// reaches repair UI instead, fail immediately with the visible diagnostic.
		await waitForWarmupSuccess(page)

		// Download home is now visible to the user.
		await expect(page.locator('[data-testid="profiles-main-input"]')).toBeVisible({timeout: 5_000})
	} finally {
		await app.close()

		// Copy main.log before cleanup so the CI artifact step can upload it.
		const logArchive = process.env.ARROXY_LOG_ARCHIVE
		if (logArchive) {
			const src = path.join(userDataDir, 'logs', 'main.log')
			if (fs.existsSync(src)) {
				fs.mkdirSync(logArchive, {recursive: true})
				fs.copyFileSync(src, path.join(logArchive, 'main.log'))
			}
		}

		fs.rmSync(userDataDir, {recursive: true, force: true})
	}
})
