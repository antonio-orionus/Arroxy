import {readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

const root = process.cwd()

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

	it('authenticates electron-builder BtbN resolver calls in CI builds', () => {
		const release = read('.github/workflows/release.yml')
		const installer = read('.github/workflows/installer-smoke.yml')
		const coldStart = read('.github/workflows/e2e-cold-start.yml')

		expect(installer).toContain('BTBN_GITHUB_TOKEN: ${{ github.token }}')
		expect(coldStart).toContain('BTBN_GITHUB_TOKEN: ${{ github.token }}')
		expect(release).toContain('BTBN_GITHUB_TOKEN: ${{ github.token }}')
		expect(installer).not.toMatch(/^\s+GITHUB_TOKEN:\s+\$\{\{\s*github\.token\s*\}\}/m)
		expect(coldStart).not.toMatch(/^\s+GITHUB_TOKEN:\s+\$\{\{\s*github\.token\s*\}\}/m)
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

		expect(template).toContain('## <a id="install"></a>{{dl_h2}}')
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
		const readmes = readdirSync(root).filter(file => /^README(?:\.[a-z]+)?\.md$/.test(file))

		for (const file of readmes) {
			const content = read(file)

			expect(content).not.toContain('Arroxy-Setup-*.exe')
			expect(content).not.toContain('Arroxy-Portable-*.exe')
		}
	})
})
