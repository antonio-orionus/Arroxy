import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {_electron as electron} from '@playwright/test'

const STABLE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/
const REPO = 'antonio-orionus/Arroxy'
const PROFILE_WRITE_TIMEOUT_MS = 10 * 60 * 1000

function parseStable(tag: string): [number, number, number] | null {
	const match = STABLE_TAG.exec(tag)
	if (!match) return null
	return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function compare(a: readonly number[], b: readonly number[]): number {
	for (let i = 0; i < 3; i += 1) {
		const diff = (a[i] ?? 0) - (b[i] ?? 0)
		if (diff !== 0) return diff
	}
	return 0
}

/**
 * The predecessor is always a *stable* release: a beta is not what a typical
 * updating user is coming from, and electron-updater's /releases/latest excludes
 * pre-releases anyway.
 */
export function previousStableTag(tags: readonly string[], current: string): string | null {
	const currentBase = parseStable(current) ?? parseStable(current.replace(/-.*$/, ''))
	if (!currentBase) return null

	const earlier = tags
		.flatMap(tag => {
			const parsed = parseStable(tag)
			return parsed && compare(parsed, currentBase) < 0 ? [{tag, parsed}] : []
		})
		.sort((a, b) => compare(a.parsed, b.parsed))

	return earlier.at(-1)?.tag ?? null
}

/**
 * Portable/unpacked forms only. The inherited journey needs the previous version
 * merely to *write a profile*, so installer flows stay owned by
 * installer-smoke.yml rather than being rebuilt here.
 */
export function assetNameFor(platform: NodeJS.Platform, arch: string): string {
	// electron-builder substitutes ${arch} verbatim, and only x64 AppImages are
	// built — the name is 'Arroxy-linux-x64.AppImage', not the gnu triple.
	if (platform === 'linux') return `Arroxy-linux-${arch}.AppImage`
	if (platform === 'darwin') return `Arroxy-mac-${arch}.dmg`
	return `Arroxy-win-${arch}-Portable.exe`
}

function downloadAsset(tag: string, assetName: string, intoDir: string): string {
	fs.mkdirSync(intoDir, {recursive: true})
	// gh authenticates from GH_TOKEN in CI; --clobber keeps reruns idempotent.
	execFileSync('gh', ['release', 'download', tag, '--repo', REPO, '--pattern', assetName, '--dir', intoDir, '--clobber'], {stdio: 'inherit'})
	return path.join(intoDir, assetName)
}

/** Unpacks the downloaded asset to a runnable executable path, per platform. */
function unpackAsset(assetPath: string, workDir: string): string {
	if (process.platform === 'linux') {
		fs.chmodSync(assetPath, 0o755)
		return assetPath
	}
	if (process.platform === 'darwin') {
		const mount = path.join(workDir, 'mnt')
		fs.mkdirSync(mount, {recursive: true})
		execFileSync('hdiutil', ['attach', assetPath, '-mountpoint', mount, '-nobrowse', '-quiet'])
		try {
			const appName = fs.readdirSync(mount).find(entry => entry.endsWith('.app'))
			if (!appName) throw new Error(`no .app inside ${assetPath}`)
			const copied = path.join(workDir, appName)
			execFileSync('ditto', [path.join(mount, appName), copied])
			return path.join(copied, 'Contents', 'MacOS', 'Arroxy')
		} finally {
			execFileSync('hdiutil', ['detach', mount, '-quiet'])
		}
	}
	return assetPath
}

/**
 * Runs the previous release once so it writes a genuine profile — settings.json,
 * queue.json, runtime-cache, probe-info-cache-v1 — which the new build is then
 * verified against. Only the portable/unpacked form is used: installer flows stay
 * owned by installer-smoke.yml.
 */
export async function generateInheritedProfile(tag: string, workDir: string): Promise<string> {
	const asset = downloadAsset(tag, assetNameFor(process.platform, process.arch), path.join(workDir, 'download'))
	const exe = unpackAsset(asset, workDir)

	const profileDir = path.join(workDir, 'inherited-profile')
	fs.mkdirSync(profileDir, {recursive: true})

	const env: NodeJS.ProcessEnv = {...process.env, ELECTRON_USER_DATA: profileDir}
	delete env.ELECTRON_RUN_AS_NODE
	delete env.ARROXY_E2E

	const app = await electron.launch({executablePath: exe, env: env as Record<string, string>})
	try {
		const page = await app.firstWindow()
		// Wait for the previous version to finish warmup, so the profile it leaves
		// behind is the one a real user would carry into the update.
		await page.locator('[data-testid="splash-overlay"]').waitFor({state: 'detached', timeout: PROFILE_WRITE_TIMEOUT_MS})
	} finally {
		await app.close()
	}

	return profileDir
}
