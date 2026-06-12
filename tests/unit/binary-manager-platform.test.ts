import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'
import {binaryInternals} from '@main/services/BinaryManager.js'
import {denoAssetName, denoExecutableName, denoTargetFor} from '@main/services/binary/DenoBinarySource.js'
import {githubYtDlpDownloadUrl, sourceForgeYtDlpDownloadUrl, ytDlpAssetName, ytDlpTargets} from '@main/services/binary/YtDlpBinarySource.js'

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')!
const originalArchDescriptor = Object.getOwnPropertyDescriptor(process, 'arch')!

function setPlatform(platform: string, arch: string): void {
	Object.defineProperty(process, 'platform', {value: platform, configurable: true})
	Object.defineProperty(process, 'arch', {value: arch, configurable: true})
}

afterEach(() => {
	Object.defineProperty(process, 'platform', originalPlatformDescriptor)
	Object.defineProperty(process, 'arch', originalArchDescriptor)
})

describe('ytDlpAssetName', () => {
	it('lists every runtime-managed yt-dlp target', () => {
		expect(ytDlpTargets().map(target => target.combo)).toEqual(['win32-x64', 'win32-arm64', 'darwin-x64', 'darwin-arm64', 'linux-x64', 'linux-arm64'])
	})

	it('win32 → yt-dlp.exe (arch ignored)', () => {
		setPlatform('win32', 'x64')
		expect(ytDlpAssetName()).toBe('yt-dlp.exe')
	})

	it('darwin arm64 → yt-dlp_macos', () => {
		setPlatform('darwin', 'arm64')
		expect(ytDlpAssetName()).toBe('yt-dlp_macos')
	})

	it('darwin x64 → yt-dlp_macos (universal binary, _legacy was removed upstream)', () => {
		setPlatform('darwin', 'x64')
		expect(ytDlpAssetName()).toBe('yt-dlp_macos')
	})

	it('linux x64 → yt-dlp_linux', () => {
		setPlatform('linux', 'x64')
		expect(ytDlpAssetName()).toBe('yt-dlp_linux')
	})

	it('linux arm64 → yt-dlp_linux_aarch64', () => {
		setPlatform('linux', 'arm64')
		expect(ytDlpAssetName()).toBe('yt-dlp_linux_aarch64')
	})

	it('unknown platform → null', () => {
		setPlatform('freebsd', 'x64')
		expect(ytDlpAssetName()).toBeNull()
	})

	it('unsupported arch → null', () => {
		setPlatform('linux', 'ia32')
		expect(ytDlpAssetName()).toBeNull()
	})

	it('builds immutable yt-dlp download URLs from resolved versions', () => {
		expect(githubYtDlpDownloadUrl('nightly', '2026.06.12', 'yt-dlp_linux')).toBe('https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux')
		expect(githubYtDlpDownloadUrl('stable', '2026.06.10', 'yt-dlp.exe')).toBe('https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.10/yt-dlp.exe')
		expect(sourceForgeYtDlpDownloadUrl('2026.06.10', 'yt-dlp_linux')).toBe('https://sourceforge.net/projects/yt-dlp.mirror/files/2026.06.10/yt-dlp_linux/download')
	})
})

describe('denoAssetName', () => {
	it('win32 x64 → MSVC zip', () => {
		expect(denoAssetName(denoTargetFor('win32', 'x64')!)).toBe('deno-x86_64-pc-windows-msvc.zip')
	})

	it('win32 arm64 → null (no upstream build)', () => {
		expect(denoTargetFor('win32', 'arm64')).toBeUndefined()
	})

	it('darwin arm64 → aarch64-apple-darwin zip', () => {
		expect(denoAssetName(denoTargetFor('darwin', 'arm64')!)).toBe('deno-aarch64-apple-darwin.zip')
	})

	it('darwin x64 → x86_64-apple-darwin zip', () => {
		expect(denoAssetName(denoTargetFor('darwin', 'x64')!)).toBe('deno-x86_64-apple-darwin.zip')
	})

	it('linux x64 → x86_64-unknown-linux-gnu zip', () => {
		expect(denoAssetName(denoTargetFor('linux', 'x64')!)).toBe('deno-x86_64-unknown-linux-gnu.zip')
	})

	it('linux arm64 → aarch64-unknown-linux-gnu zip', () => {
		expect(denoAssetName(denoTargetFor('linux', 'arm64')!)).toBe('deno-aarch64-unknown-linux-gnu.zip')
	})

	it('unknown platform → null', () => {
		expect(denoTargetFor('freebsd', 'x64')).toBeUndefined()
	})

	it('unsupported arch → null', () => {
		expect(denoTargetFor('linux', 'ia32')).toBeUndefined()
	})
})

describe('denoExecutableName', () => {
	it('win32 → deno.exe', () => {
		const target = denoTargetFor('win32', 'x64')
		if (!target) throw new Error('expected win32-x64 deno target')

		expect(denoExecutableName(target)).toBe('deno.exe')
	})

	it('darwin → deno', () => {
		const target = denoTargetFor('darwin', 'arm64')
		if (!target) throw new Error('expected darwin-arm64 deno target')

		expect(denoExecutableName(target)).toBe('deno')
	})

	it('linux → deno', () => {
		const target = denoTargetFor('linux', 'x64')
		if (!target) throw new Error('expected linux-x64 deno target')

		expect(denoExecutableName(target)).toBe('deno')
	})
})

describe('fallbackPathCandidates', () => {
	const originalEnv = {...process.env}

	afterEach(() => {
		process.env = {...originalEnv}
	})

	it('adds Homebrew bin fallbacks on macOS', () => {
		expect(binaryInternals.fallbackPathCandidates('yt-dlp', 'darwin')).toEqual(['/opt/homebrew/bin/yt-dlp', '/usr/local/bin/yt-dlp'])
	})

	it('adds WinGet executable fallbacks on Windows', () => {
		process.env.LOCALAPPDATA = 'C:\\Users\\tester\\AppData\\Local'
		process.env.ProgramFiles = 'C:\\Program Files'
		process.env['ProgramFiles(x86)'] = 'C:\\Program Files (x86)'

		expect(binaryInternals.fallbackPathCandidates('yt-dlp', 'win32')).toEqual([
			path.join('C:\\Users\\tester\\AppData\\Local', 'Microsoft', 'WindowsApps', 'yt-dlp.exe'),
			path.join('C:\\Users\\tester\\AppData\\Local', 'Microsoft', 'WinGet', 'Links', 'yt-dlp.exe'),
			path.join('C:\\Program Files', 'WinGet', 'Links', 'yt-dlp.exe'),
			path.join('C:\\Program Files (x86)', 'WinGet', 'Links', 'yt-dlp.exe')
		])
	})

	it('does not add package-manager fallbacks on Linux', () => {
		expect(binaryInternals.fallbackPathCandidates('yt-dlp', 'linux')).toEqual([])
	})
})
