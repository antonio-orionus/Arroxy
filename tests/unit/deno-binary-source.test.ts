import {describe, expect, it} from 'vitest'
import {denoAssetName, denoExecutableName, denoGithubDownloadUrl, denoLandDownloadUrl, denoTargetFor, denoTargets, formatDenoShellEnv, parseDenoLatestVersion, parseDenoSha256} from '@main/services/binary/DenoBinarySource.js'

describe('DenoBinarySource', () => {
	it('maps supported platform/arch pairs to Deno release triples', () => {
		expect(denoTargetFor('win32', 'x64')?.triple).toBe('x86_64-pc-windows-msvc')
		expect(denoTargetFor('darwin', 'x64')?.triple).toBe('x86_64-apple-darwin')
		expect(denoTargetFor('darwin', 'arm64')?.triple).toBe('aarch64-apple-darwin')
		expect(denoTargetFor('linux', 'x64')?.triple).toBe('x86_64-unknown-linux-gnu')
		expect(denoTargetFor('linux', 'arm64')?.triple).toBe('aarch64-unknown-linux-gnu')
		expect(denoTargetFor('win32', 'arm64')).toBeUndefined()
	})

	it('lists every runtime-managed Deno target', () => {
		expect(denoTargets().map(target => target.combo)).toEqual(['win32-x64', 'darwin-x64', 'darwin-arm64', 'linux-x64', 'linux-arm64'])
	})

	it('builds asset and executable names from target facts', () => {
		const target = denoTargetFor('linux', 'arm64')
		if (!target) throw new Error('expected target')

		expect(denoAssetName(target)).toBe('deno-aarch64-unknown-linux-gnu.zip')
		expect(denoExecutableName(target)).toBe('deno')

		const windowsTarget = denoTargetFor('win32', 'x64')
		if (!windowsTarget) throw new Error('expected win32-x64 deno target')
		expect(denoExecutableName(windowsTarget)).toBe('deno.exe')
	})

	it('validates latest-version documents from dl.deno.land', () => {
		expect(parseDenoLatestVersion('v2.8.2\n')).toBe('v2.8.2')
		expect(parseDenoLatestVersion('v2.8.2+build.1')).toBe('v2.8.2+build.1')
		expect(parseDenoLatestVersion('2.8.2')).toBeNull()
		expect(parseDenoLatestVersion('latest')).toBeNull()
	})

	it('builds dl.deno.land and GitHub fallback download URLs', () => {
		const target = denoTargetFor('darwin', 'arm64')!
		const assetName = denoAssetName(target)

		expect(denoLandDownloadUrl('v2.8.2', assetName)).toBe('https://dl.deno.land/release/v2.8.2/deno-aarch64-apple-darwin.zip')
		expect(denoGithubDownloadUrl(assetName)).toBe('https://github.com/denoland/deno/releases/latest/download/deno-aarch64-apple-darwin.zip')
	})

	it('parses Deno checksum formats used across platforms', () => {
		const sha = '25f9871f5c1d9e999d60071f8069767134495fd601d2e2c7ce1e8c641487bda0'
		expect(parseDenoSha256(`${sha}  deno-aarch64-apple-darwin.zip`)).toBe(sha)
		expect(parseDenoSha256(`SHA256: ${sha}`)).toBe(sha)
		expect(parseDenoSha256(`Algorithm : SHA256\nHash      : ${sha.toUpperCase()}\n`)).toBe(sha)
		expect(parseDenoSha256('not a hash')).toBeNull()
	})

	it('formats shell env for scripts without duplicating source facts in shell', () => {
		const target = denoTargetFor('linux', 'x64')!
		const env = formatDenoShellEnv(target, 'v2.8.2')

		expect(env).toContain("DENO_TARGET='linux-x64'")
		expect(env).toContain("DENO_TRIPLE='x86_64-unknown-linux-gnu'")
		expect(env).toContain("DENO_ASSET_NAME='deno-x86_64-unknown-linux-gnu.zip'")
		expect(env).toContain("DENO_ASSET_URL='https://dl.deno.land/release/v2.8.2/deno-x86_64-unknown-linux-gnu.zip'")
		expect(env).toContain("DENO_CHECKSUM_URL='https://dl.deno.land/release/v2.8.2/deno-x86_64-unknown-linux-gnu.zip.sha256sum'")
	})
})
