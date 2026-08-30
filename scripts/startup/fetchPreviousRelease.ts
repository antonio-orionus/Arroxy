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

/**
 * Unpacks the downloaded asset to a runnable executable path, per platform.
 * Each branch reconstructs an unpacked app so playwright attaches to the real
 * executable — never to a wrapper whose stdio it cannot see.
 */
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
	// The Windows portable target is an NSIS self-extractor: playwright resolves
	// the CDP endpoint from the launched process's stderr ("DevTools listening
	// on ws://…"), and the inner app's stderr does not survive the wrapper's
	// ExecWait — the beta.3 gate timed out there after the pid was spawned.
	// Extract the app payload with 7-Zip (preinstalled on the runners) and launch
	// the real executable directly, the same trick as the darwin branch.
	const sevenZip = findSevenZip()
	const unpacked = path.join(workDir, 'portable-unpacked')
	execFileSync(sevenZip, ['x', '-y', `-o${unpacked}`, assetPath], {stdio: 'ignore'})
	// 7-Zip versions that do not recurse into the embedded payload leave it as
	// a nested archive — extract it into place before looking for the exe.
	const nestedPayload = shallowestNamed(unpacked, /^app-(?:64|32|ARM64)\.7z$/i)
	if (nestedPayload) {
		execFileSync(sevenZip, ['x', '-y', `-o${unpacked}`, nestedPayload], {stdio: 'ignore'})
	}
	const exe = shallowestNamed(unpacked, /^Arroxy\.exe$/i)
	if (!exe) throw new Error(`no Arroxy.exe reconstructed from ${assetPath}`)
	return exe
}

function findSevenZip(): string {
	for (const candidate of ['C:\\Program Files\\7-Zip\\7z.exe', '7z']) {
		try {
			execFileSync(candidate, ['i'], {stdio: 'ignore'})
			return candidate
		} catch {
			// not usable — try the next candidate
		}
	}
	throw new Error('no usable 7-Zip: neither the runner-preinstalled path nor a 7z on PATH')
}

/** Shallowest file under root whose basename matches, so a payload root wins over stray copies. */
function shallowestNamed(root: string, name: RegExp): string | null {
	const matches = fs
		.readdirSync(root, {recursive: true})
		.map(entry => String(entry))
		.filter(entry => name.test(path.basename(entry)))
		.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length)
	return matches[0] ? path.join(root, matches[0]) : null
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
	if (process.platform === 'linux') {
		// CI runners ship without libfuse2, so the AppImage cannot mount itself —
		// beta.3's gate died in "Process failed to launch!" exactly there. The
		// AppImageKit runtime honours this switch by extracting and exec'ing
		// AppRun instead (runtime.c), which keeps the launch attachable.
		env.APPIMAGE_EXTRACT_AND_RUN = '1'
	}

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
