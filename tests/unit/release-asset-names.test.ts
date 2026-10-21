import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {WINDOWS_APP_USER_MODEL_ID} from '@shared/constants.js'

const root = process.cwd()

// The block of one workflow step: from its `- name:` up to the next one. Enough
// to prove a key is attached to the step that needs it, which is the whole
// point — `continue-on-error` anywhere in the file proves nothing.
function workflowStep(workflow: string, name: string): string {
	const start = workflow.indexOf(`- name: ${name}`)
	if (start < 0) return ''
	const next = workflow.indexOf('\n      - ', start + 1)
	return workflow.slice(start, next < 0 ? undefined : next)
}

interface ElectronBuilderDmgConfig {
	background?: string
	icon?: null
	title?: string
	iconSize?: number
	iconTextSize?: number
	window?: {width: number; height: number}
	contents?: Array<{x: number; y: number; type: string; path?: string}>
}

interface ElectronBuilderConfig {
	appId?: string
	dmg?: ElectronBuilderDmgConfig
}

function read(path: string): string {
	return readFileSync(join(root, path), 'utf8')
}

describe('release asset names', () => {
	const stableAssets = ['Arroxy-win-x64-Setup.exe', 'Arroxy-win-x64-Portable.exe', 'Arroxy-mac-arm64.dmg', 'Arroxy-mac-x64.dmg', 'Arroxy-linux-x64.AppImage', 'Arroxy-linux-x64.tar.gz', 'Arroxy-linux-x64.flatpak']
	const workflowText = () =>
		readdirSync(join(root, '.github', 'workflows'))
			.filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
			.map(file => read(join('.github', 'workflows', file)))
			.join('\n')

	it('configures electron-builder to publish stable platform-prefixed artifacts', () => {
		const config = read('electron-builder.json5')

		expect(config).toContain('"artifactName": "${productName}-win-${arch}-Setup.${ext}"')
		expect(config).toContain('"artifactName": "${productName}-win-${arch}-Portable.${ext}"')
		expect(config).toContain('"artifactName": "${productName}-mac-${arch}.${ext}"')
		expect(config).toContain('"artifactName": "${productName}-linux-${arch}.${ext}"')
		expect(config).not.toContain('"artifactName": "${productName}-Setup-${version}.${ext}"')
		expect(config).not.toContain('"artifactName": "${productName}-${version}.${ext}"')
	})

	it('registers arroxy:// links on every platform', () => {
		const config = JSON.parse(read('electron-builder.json5')) as {protocols?: unknown}
		// Info.plist on macOS and the .desktop MimeType on Linux; NSIS needs its own keys.
		expect(config.protocols).toEqual([{name: 'Arroxy link', schemes: ['arroxy']}])
		expect(read('build/installer.nsh')).toContain(`WriteRegStr HKCU "\${ARROXY_LINK_KEY}\\shell\\open\\command" "" '"$appExe" -- "%1"'`)
		expect(read('flatpak/io.github.antonio_orionus.Arroxy.desktop')).toContain('MimeType=x-scheme-handler/arroxy;')
	})

	it('configures a branded drag-to-Applications DMG window', () => {
		const config = JSON.parse(read('electron-builder.json5')) as ElectronBuilderConfig

		expect(existsSync(join(root, 'build', 'dmg-background.png'))).toBe(true)
		expect(config.dmg).toMatchObject({background: 'build/dmg-background.png', icon: null, title: '${productName} Installer', iconSize: 108, iconTextSize: 13, window: {width: 600, height: 360}})
		expect(config.dmg?.contents).toEqual([
			{x: 170, y: 222, type: 'file'},
			{x: 430, y: 222, type: 'link', path: '/Applications'}
		])
	})

	it('keeps Electron runAsNode enabled for yt-dlp JS runtime smoke', () => {
		const config = read('electron-builder.json5')

		expect(config).toContain('"electronFuses"')
		expect(config).toContain('"runAsNode": true')
		expect(config).not.toContain('"runAsNode": false')
	})

	it('applies Linux Electron fuses before replacing the executable with the no-sandbox wrapper', () => {
		const afterPack = read('build/afterPack.mjs')

		expect(afterPack).toContain('context.packager.addElectronFuses(context, fuseConfig)')
		expect(afterPack).toContain('context.packager.config.electronFuses = null')
		expect(afterPack.indexOf('context.packager.addElectronFuses(context, fuseConfig)')).toBeLessThan(afterPack.indexOf('fs.renameSync(execPath, realBin)'))
		expect(afterPack).toContain('--no-sandbox')
	})

	it('ad-hoc signs the macOS bundle under the app id so OS notifications are attributed', () => {
		const afterPack = read('build/afterPack.mjs')

		// Prebuilt Electron arrives linker-signed under the identifier "Electron".
		// Without a re-sign, macOS attributes notifications to that identity —
		// permanently unauthorized — so UNUserNotificationCenter silently drops
		// every post and never shows the one-time permission prompt.
		expect(afterPack).toContain('codesign')
		expect(afterPack).toContain('--identifier')
		expect(afterPack).toContain('context.packager.appInfo.id')
		// @electron/fuses rewrites the Mach-O and resets the ad-hoc signature, so
		// the re-sign must come after the fuse flip, not before.
		expect(afterPack.indexOf('addElectronFuses')).toBeLessThan(afterPack.indexOf('codesign'))
	})

	it('sets the Windows AppUserModelID to the same appId the NSIS shortcut registers', () => {
		const config = JSON.parse(read('electron-builder.json5')) as ElectronBuilderConfig
		const main = read('src/main/index.ts')

		// electron-builder's NSIS installer stamps the Start Menu shortcut with
		// `WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"`. Windows matches a
		// toast against the AUMID the *process* declares, so if main never calls
		// setAppUserModelId the implicit exe-derived id will not match that
		// shortcut and every toast is dropped without an error.
		expect(WINDOWS_APP_USER_MODEL_ID).toBe(config.appId)
		expect(main).toContain('app.setAppUserModelId(WINDOWS_APP_USER_MODEL_ID)')
	})

	it('gates the Defender scan before release day rather than during it', () => {
		const installer = read('.github/workflows/installer-smoke.yml')
		const scan = workflowStep(installer, 'Scan packed output with Windows Defender')
		const install = workflowStep(installer, 'Install the pinned FFmpeg package')
		const ffmpegScan = workflowStep(installer, 'Scan the pinned FFmpeg package with Windows Defender')
		const advisory = workflowStep(installer, 'Surface an advisory Defender failure on tags')

		expect(scan).toContain('scan-windows-defender.ps1')
		// FFmpeg no longer ships in the installer. The pinned package is installed
		// from its release asset the way the app does it, then scanned, so a
		// flagged upstream binary still cannot reach users unnoticed.
		expect(install).toContain('ffmpegPackage.ts install --platform win32 --arch x64')
		expect(ffmpegScan).toContain('scan-windows-defender.ps1')
		expect(ffmpegScan).toContain('-Require ffmpeg.exe,ffprobe.exe')
		// The package was scanned when its pin landed, so the only way a scan fires
		// on a tag is Microsoft's classifier changing its mind about binaries that
		// passed last week. Failing there strands a draft release that already
		// holds the macOS and Linux assets, so on tags it warns and on every other
		// ref it blocks. The fix is a newly approved package, not a re-tag.
		expect(scan).toContain("continue-on-error: ${{ startsWith(github.ref, 'refs/tags/v') }}")
		expect(ffmpegScan).toContain("continue-on-error: ${{ startsWith(github.ref, 'refs/tags/v') }}")
		// The advisory notice must be gated on exactly the refs the scans let pass,
		// or a run that actually blocked still claims it was only advisory.
		expect(advisory).toContain("if: ${{ startsWith(github.ref, 'refs/tags/v') && (steps.defender.outcome == 'failure' || steps.defender-ffmpeg.outcome == 'failure') }}")
		// A schedule is what actually catches definition drift, early and cheaply.
		expect(installer).toContain('schedule:')
	})

	it('passes Defender an absolute scan path so custom scans can resolve the target', () => {
		const defender = read('scripts/test-binaries/scan-windows-defender.ps1')

		expect(defender).toContain('$scanPath = (Resolve-Path -LiteralPath $Path).Path')
		expect(defender).toContain('-File $scanPath')
	})

	it('fails the Defender gate when antivirus signatures are stale', () => {
		const defender = read('scripts/test-binaries/scan-windows-defender.ps1')

		expect(defender).toContain('$signatureUpdateExit = $LASTEXITCODE')
		expect(defender).toContain('[TimeSpan]::FromHours(48)')
		expect(defender).toContain('$status.AntivirusSignatureLastUpdated')
		expect(defender).toContain('throw "Windows Defender signatures are stale')
	})

	it('runs packaged runtime smoke before UI cold-start on every PR platform', () => {
		const coldStart = read('.github/workflows/e2e-cold-start.yml')

		expect(coldStart).toContain('Run packaged runtime smoke')
		expect(coldStart).toContain("ARROXY_RUNTIME_SMOKE: '1'")
		expect(coldStart).toContain('Arroxy Runtime Ω Cold')
		expect(coldStart).toContain('fake old node')
		expect(coldStart).toContain('fake deno')
		expect(coldStart).toContain('fake yt-dlp')
		expect(coldStart).toContain('runtime-smoke.out')
		expect(coldStart).toContain('runtime-smoke.err')
		expect(coldStart).toContain('status=$?')
		expect(coldStart).toContain('exit "$status"')
	})

	it('does not run a live YouTube probe smoke as a cold-start gate', () => {
		const coldStart = read('.github/workflows/e2e-cold-start.yml')

		expect(coldStart).not.toContain('Run packaged live probe smoke')
		expect(coldStart).not.toContain('ARROXY_SMOKE_URL')
		expect(coldStart).not.toContain('ARROXY_LIVE_CANARY_URL')
	})

	it('smoke-tests Windows installed and portable artifacts before publish', () => {
		const installer = read('.github/workflows/installer-smoke.yml')

		expect(installer).toContain('bun run dist:win')
		expect(installer).toContain('Run installed app runtime smoke')
		expect(installer).toContain('Run portable app runtime smoke')
		expect(installer).toContain('ARROXY_RUNTIME_SMOKE')
		expect(installer).toContain('Arroxy Runtime Ω Installed')
		expect(installer).toContain('Arroxy Portable Ω Path')
		expect(installer).toContain('runtime-smoke-logs')
	})

	it('blocks release on packaged runtime smoke and runs no live YouTube canary', () => {
		const release = read('.github/workflows/release.yml')

		expect(release).toContain('Run packaged runtime smoke')
		expect(release).toContain("ARROXY_RUNTIME_SMOKE: '1'")
		expect(release).toContain('libfuse2t64')
		expect(release).not.toContain('Run Linux live probe canary')
		expect(release).not.toContain('ARROXY_LIVE_CANARY_URL')
		expect(release).not.toContain('ARROXY_SMOKE_URL')
	})

	it('keeps release workflow consumers on the same stable filenames', () => {
		const release = read('.github/workflows/release.yml')
		const installer = read('.github/workflows/installer-smoke.yml')
		const winget = read('.github/workflows/release_to_winget.yml')
		const flatpak = read('.github/workflows/flatpak.yml')

		for (const asset of stableAssets) {
			expect([release, installer, winget, flatpak].join('\n')).toContain(asset)
		}

		expect(winget).toContain("installers-regex: '^Arroxy-win-x64-Setup\\.exe$'")
		expect(release).not.toContain('Arroxy-Setup-${VERSION}.exe')
		expect(release).not.toContain('Arroxy-${VERSION}-arm64.dmg')
		expect(flatpak).not.toContain('Arroxy-${VERSION}.tar.gz')
	})

	it('relies on immutable release attestations instead of workflow provenance attestations', () => {
		const release = read('.github/workflows/release.yml')

		expect(release).not.toContain('actions/attest')
		expect(release).not.toContain('attestations: write')
		expect(release).not.toContain('artifact-metadata: write')
		expect(release).not.toContain('gh attestation verify')
		expect(release).toContain('gh release edit "$REF_NAME" --draft=false $EXTRA')
	})

	it('builds release artifacts without contacting the upstream FFmpeg hosts', () => {
		const release = read('.github/workflows/release.yml')
		const installer = read('.github/workflows/installer-smoke.yml')
		const coldStart = read('.github/workflows/e2e-cold-start.yml')
		const nightly = read('.github/workflows/startup-nightly.yml')

		// Release builds bundle no FFmpeg (ADR 0010), so electron-builder fetches
		// no BtbN build and no build step needs a token for it. The startup
		// journeys' test setup does fetch the dev FFmpeg through the GitHub API,
		// which rate-limits unauthenticated calls from shared runners, so only the
		// "Verify startup" step carries the BtbN token.
		const stepsWithToken = (workflow: string): string[] =>
			workflow
				.split(/\n(?=\s+- (?:name|uses|run):)/)
				.filter(step => step.includes('BTBN_GITHUB_TOKEN'))
				.map(step => /- name: (.+)/.exec(step)?.[1] ?? step.trim().split('\n')[0])

		expect(stepsWithToken(installer)).toEqual([])
		for (const workflow of [release, coldStart, nightly]) {
			expect(stepsWithToken(workflow)).toEqual([expect.stringMatching(/^Verify startup /)])
		}
		for (const workflow of [release, installer, coldStart]) {
			expect(workflow).not.toMatch(/^\s+GITHUB_TOKEN:\s+\$\{\{\s*github\.token\s*\}\}/m)
		}
	})

	it('keeps GitHub artifact actions off Node 20-backed refs', () => {
		const workflows = workflowText()

		expect(workflows).not.toContain('actions/upload-artifact@v4')
		expect(workflows).not.toContain('actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02')
		expect(workflows).not.toContain('actions/download-artifact@v4')
		expect(workflows).not.toContain('actions/download-artifact@018cc2cf5baa6db3ef3c5f8a56943fffe632ef53')
	})

	it('does not publish runtime binary manifests from the app repository', () => {
		const workflow = read('.github/workflows/runtime-binaries.yml')

		expect(workflow).toContain('name: Runtime Binary Manifest Validation')
		expect(workflow).toContain('workflow_dispatch:')
		expect(workflow).toContain('runtimeBinaryManifest.ts generate')
		expect(workflow).toContain('--validate')
		expect(workflow).not.toContain('schedule:')
		expect(workflow).not.toContain('contents: write')
		expect(workflow).not.toContain('ARROXY_RUNTIME_INDEX_SIGNING_KEY')
		expect(workflow).not.toContain('gh release')
	})

	it('normalizes electron-builder AppImage arch names before publishing checksums', () => {
		const release = read('.github/workflows/release.yml')

		expect(release).toContain('Normalize Linux AppImage asset name')
		expect(release).toContain('Arroxy-linux-x86_64.AppImage')
		expect(release).toContain('Arroxy-linux-x64.AppImage')
		expect(release).toContain('latest-linux.yml')
		expect(release).toContain('.apiUrl')
		expect(release).toContain('${builder_api_url#https://api.github.com/}')
	})

	it('documents evergreen direct download links in the README template', () => {
		const template = read('readme-src/template.md')

		expect(template).toContain('## <a id="install"></a>📥 {{dl_h2}}')
		for (const asset of stableAssets) {
			expect(template).toContain(`https://github.com/antonio-orionus/Arroxy/releases/latest/download/${asset}`)
		}
		expect(template).toContain('https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS')
		expect(template).toContain('img.shields.io/badge/Windows-Setup-0078D4')
		expect(template).not.toContain('| 🪟 Windows')
		expect(template).not.toContain('| 🍎 macOS')
		expect(template).not.toContain('| 🐧 Linux')
	})

	it('does not document stale versioned Windows filename patterns in generated READMEs', () => {
		const localeReadmes = readdirSync(join(root, 'docs/readme')).filter(file => file.endsWith('.md'))
		const readmes = ['README.md', ...localeReadmes.map(file => `docs/readme/${file}`)]

		for (const file of readmes) {
			const content = read(file)

			expect(content).not.toContain('Arroxy-Setup-*.exe')
			expect(content).not.toContain('Arroxy-Portable-*.exe')
		}
	})
})

describe('packaged app contents', () => {
	it('ships the bundled build output and no node_modules', () => {
		// The main, preload and renderer bundles inline every npm dependency
		// (scripts/check-main-bundle.ts guards main), so copying node_modules into
		// app.asar only added ~80 MB of dead files.
		const config = JSON.parse(read('electron-builder.json5')) as {files?: string[]}

		expect(config.files).toEqual(['out/**/*', '!node_modules/**/*'])
	})
})
