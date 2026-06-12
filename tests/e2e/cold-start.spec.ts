import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import crypto from 'node:crypto'
import {expect, test, _electron as electron, type Page} from '@playwright/test'

function defaultExePath(): string {
	if (process.platform === 'win32') return path.join(process.cwd(), 'dist', 'win-unpacked', 'Arroxy.exe')
	if (process.platform === 'darwin') return path.join(process.cwd(), 'dist', 'mac-arm64', 'Arroxy.app', 'Contents', 'MacOS', 'Arroxy')
	return path.join(process.cwd(), 'dist', 'linux-unpacked', 'arroxy')
}

// On CI this is set by the workflow; locally falls back to the platform's default unpacked path.
const PACKAGED_EXE = process.env.PACKAGED_EXE ?? defaultExePath()

const WARMUP_TIMEOUT_MS = 12 * 60 * 1000 // yt-dlp cold download plus binary probes

function compactText(text: string): string {
	return text.replace(/\s+/g, ' ').trim()
}

function sha256ForFile(filePath: string): string {
	return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

function maybeReadWindowsStream(filePath: string, streamName: string): string | null {
	if (process.platform !== 'win32') return null
	try {
		return fs.readFileSync(`${filePath}:${streamName}`, 'utf8')
	} catch {
		return null
	}
}

function captureColdStartDiagnostics(userDataDir: string, logArchive: string | undefined): void {
	if (!logArchive) return

	fs.mkdirSync(logArchive, {recursive: true})

	const logPath = path.join(userDataDir, 'logs', 'main.log')
	if (fs.existsSync(logPath)) {
		fs.copyFileSync(logPath, path.join(logArchive, 'main.log'))
	}

	const binaryDir = path.join(userDataDir, 'runtime-cache', 'binaries')
	const lines = [`capturedAt=${new Date().toISOString()}`, `platform=${process.platform}`, `arch=${process.arch}`, `pid=${process.pid}`, `packagedExe=${PACKAGED_EXE}`, `userDataDir=${userDataDir}`, `binaryDir=${binaryDir}`]

	if (!fs.existsSync(binaryDir)) {
		lines.push('binaryDirExists=false')
		fs.writeFileSync(path.join(logArchive, 'binary-diagnostics.txt'), `${lines.join(os.EOL)}${os.EOL}`)
		return
	}

	lines.push('binaryDirExists=true')
	for (const entry of fs.readdirSync(binaryDir, {withFileTypes: true})) {
		if (!entry.isFile()) continue
		const filePath = path.join(binaryDir, entry.name)
		const stat = fs.statSync(filePath)
		lines.push('')
		lines.push(`[${entry.name}]`)
		lines.push(`path=${filePath}`)
		lines.push(`size=${stat.size}`)
		lines.push(`mode=${stat.mode.toString(8)}`)
		lines.push(`birthtime=${stat.birthtime.toISOString()}`)
		lines.push(`mtime=${stat.mtime.toISOString()}`)
		lines.push(`sha256=${sha256ForFile(filePath)}`)

		const zoneIdentifier = maybeReadWindowsStream(filePath, 'Zone.Identifier')
		lines.push(`zoneIdentifier=${zoneIdentifier === null ? 'absent' : zoneIdentifier.replace(/\r?\n/g, '\\n')}`)
	}

	fs.writeFileSync(path.join(logArchive, 'binary-diagnostics.txt'), `${lines.join(os.EOL)}${os.EOL}`)
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
	// Override the timeout for this test only — warmup downloads yt-dlp from
	// GitHub Releases on a cold runner.
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

		// Copy diagnostics before cleanup so the CI artifact step can upload them.
		captureColdStartDiagnostics(userDataDir, process.env.ARROXY_LOG_ARCHIVE)

		fs.rmSync(userDataDir, {recursive: true, force: true})
	}
})
