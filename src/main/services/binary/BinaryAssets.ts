export const BINARY_SOURCES = {
	ytDlpNightly: {download: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download', latest: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest'},
	ytDlpStable: {download: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download', latest: 'https://github.com/yt-dlp/yt-dlp/releases/latest'},
	deno: {download: 'https://github.com/denoland/deno/releases/latest/download'}
} as const

type AssetPlatform = 'win32' | 'darwin' | 'linux'
type AssetArch = 'arm64' | 'x64'

const YT_DLP_ASSETS: Record<AssetPlatform, Record<AssetArch, string>> = {win32: {x64: 'yt-dlp.exe', arm64: 'yt-dlp.exe'}, darwin: {x64: 'yt-dlp_macos', arm64: 'yt-dlp_macos'}, linux: {x64: 'yt-dlp_linux', arm64: 'yt-dlp_linux_aarch64'}}

const DENO_ASSETS: Record<AssetPlatform, Record<AssetArch, string | null>> = {win32: {x64: 'x86_64-pc-windows-msvc', arm64: null}, darwin: {x64: 'x86_64-apple-darwin', arm64: 'aarch64-apple-darwin'}, linux: {x64: 'x86_64-unknown-linux-gnu', arm64: 'aarch64-unknown-linux-gnu'}}

function currentAssetTarget(): {platform: AssetPlatform; arch: AssetArch} | null {
	const platform = process.platform
	if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') return null
	const arch = process.arch
	if (arch !== 'arm64' && arch !== 'x64') return null
	return {platform, arch}
}

export function ytDlpAssetName(): string | null {
	const target = currentAssetTarget()
	if (!target) return null
	return YT_DLP_ASSETS[target.platform][target.arch]
}

export function denoAssetTarget(): string | null {
	const target = currentAssetTarget()
	if (!target) return null
	return DENO_ASSETS[target.platform][target.arch]
}

export function denoAssetName(): string | null {
	const target = denoAssetTarget()
	return target ? `deno-${target}.zip` : null
}

export function denoExecutableName(): string {
	return process.platform === 'win32' ? 'deno.exe' : 'deno'
}
