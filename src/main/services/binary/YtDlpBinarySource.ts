export const YT_DLP_SOURCES = {
	nightlyGithub: {provider: 'github', api: 'https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds', release: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download'},
	stableGithub: {provider: 'github', api: 'https://api.github.com/repos/yt-dlp/yt-dlp', release: 'https://github.com/yt-dlp/yt-dlp/releases/download'},
	stableSourceForge: {provider: 'sourceforge', files: 'https://sourceforge.net/projects/yt-dlp.mirror/files', rss: 'https://sourceforge.net/projects/yt-dlp.mirror/rss?path=/'}
} as const

type AssetPlatform = 'win32' | 'darwin' | 'linux'
type AssetArch = 'arm64' | 'x64'

const YT_DLP_ASSETS: Record<AssetPlatform, Record<AssetArch, string>> = {win32: {x64: 'yt-dlp.exe', arm64: 'yt-dlp.exe'}, darwin: {x64: 'yt-dlp_macos', arm64: 'yt-dlp_macos'}, linux: {x64: 'yt-dlp_linux', arm64: 'yt-dlp_linux_aarch64'}}

export interface YtDlpTarget {
	combo: string
	platform: AssetPlatform
	arch: AssetArch
	assetName: string
	executableName: 'yt-dlp.exe' | 'yt-dlp'
}

function assetTarget(platform: string, arch: string): {platform: AssetPlatform; arch: AssetArch} | null {
	if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') return null
	if (arch !== 'arm64' && arch !== 'x64') return null
	return {platform, arch}
}

export function ytDlpAssetName(platform: NodeJS.Platform = process.platform, arch: NodeJS.Architecture = process.arch): string | null {
	const target = assetTarget(platform, arch)
	if (!target) return null
	return YT_DLP_ASSETS[target.platform][target.arch]
}

export function ytDlpTargets(): YtDlpTarget[] {
	return (['win32', 'darwin', 'linux'] as const).flatMap(platform => (['x64', 'arm64'] as const).map(arch => ({combo: `${platform}-${arch}`, platform, arch, assetName: YT_DLP_ASSETS[platform][arch], executableName: platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'})))
}

export function sourceForgeYtDlpDownloadUrl(version: string, assetName: string): string {
	return `${YT_DLP_SOURCES.stableSourceForge.files}/${version}/${assetName}/download`
}

export function githubYtDlpDownloadUrl(channel: 'nightly' | 'stable', version: string, assetName: string): string {
	const source = channel === 'nightly' ? YT_DLP_SOURCES.nightlyGithub : YT_DLP_SOURCES.stableGithub
	return `${source.release}/${version}/${assetName}`
}

export function parseSourceForgeLatestYtDlpVersion(content: string): string | null {
	const versions = content.match(/\/yt-dlp\.mirror\/files\/([0-9]{4}\.[0-9]{2}\.[0-9]{2})\//g) ?? []
	for (const raw of versions) {
		const match = /([0-9]{4}\.[0-9]{2}\.[0-9]{2})/.exec(raw)
		if (match) return match[1]
	}
	return null
}
