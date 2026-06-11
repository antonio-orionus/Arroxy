import path from 'node:path'
import {parseShaLine} from './BinaryDownloader.js'
import type {ManagedFileSourcePlan} from './ManagedSourcePlan.js'

export const YT_DLP_SOURCES = {
	nightlyGithub: {provider: 'github', download: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download', latest: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest'},
	stableGithub: {provider: 'github', download: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download', latest: 'https://github.com/yt-dlp/yt-dlp/releases/latest'},
	stableSourceForge: {provider: 'sourceforge', files: 'https://sourceforge.net/projects/yt-dlp.mirror/files', rss: 'https://sourceforge.net/projects/yt-dlp.mirror/rss?path=/'}
} as const

type AssetPlatform = 'win32' | 'darwin' | 'linux'
type AssetArch = 'arm64' | 'x64'

const YT_DLP_ASSETS: Record<AssetPlatform, Record<AssetArch, string>> = {win32: {x64: 'yt-dlp.exe', arm64: 'yt-dlp.exe'}, darwin: {x64: 'yt-dlp_macos', arm64: 'yt-dlp_macos'}, linux: {x64: 'yt-dlp_linux', arm64: 'yt-dlp_linux_aarch64'}}

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

function ytDlpManagedBinaryName(channel: 'nightly' | 'stable', platform: NodeJS.Platform = process.platform): string {
	const ext = platform === 'win32' ? '.exe' : ''
	return channel === 'nightly' ? `yt-dlp${ext}` : `yt-dlp-stable${ext}`
}

function sourceForgeYtDlpDownloadUrl(version: string, assetName: string): string {
	return `${YT_DLP_SOURCES.stableSourceForge.files}/${version}/${assetName}/download`
}

export function parseSourceForgeLatestYtDlpVersion(content: string): string | null {
	const versions = content.match(/\/yt-dlp\.mirror\/files\/([0-9]{4}\.[0-9]{2}\.[0-9]{2})\//g) ?? []
	for (const raw of versions) {
		const match = /([0-9]{4}\.[0-9]{2}\.[0-9]{2})/.exec(raw)
		if (match) return match[1]
	}
	return null
}

export async function fetchSourceForgeLatestYtDlpVersion(fetchText: (url: string, signal?: AbortSignal) => Promise<string>, signal?: AbortSignal): Promise<string | null> {
	try {
		return parseSourceForgeLatestYtDlpVersion(await fetchText(YT_DLP_SOURCES.stableSourceForge.rss, signal))
	} catch {
		return null
	}
}

function githubPlan(cacheDir: string, channel: 'nightly' | 'stable', assetName: string, platform: NodeJS.Platform): ManagedFileSourcePlan {
	const sourceConfig = channel === 'nightly' ? YT_DLP_SOURCES.nightlyGithub : YT_DLP_SOURCES.stableGithub
	const downloadUrl = `${sourceConfig.download}/${assetName}`
	return {
		id: 'yt-dlp',
		name: 'yt-dlp',
		source: {kind: 'managed', channel, provider: sourceConfig.provider, url: downloadUrl},
		destinationPath: path.join(cacheDir, ytDlpManagedBinaryName(channel, platform)),
		downloadUrl,
		checksumUrl: `${sourceConfig.download}/SHA2-256SUMS`,
		requiredChecksum: true,
		parseChecksum: content => parseShaLine(content, assetName),
		installKind: 'file',
		versionCheck: {kind: 'githubLatest', latestUrl: sourceConfig.latest}
	}
}

function sourceForgePlan(cacheDir: string, assetName: string, version: string, platform: NodeJS.Platform): ManagedFileSourcePlan {
	const downloadUrl = sourceForgeYtDlpDownloadUrl(version, assetName)
	return {
		id: 'yt-dlp',
		name: 'yt-dlp',
		source: {kind: 'managed', channel: 'stable', provider: YT_DLP_SOURCES.stableSourceForge.provider, url: downloadUrl},
		destinationPath: path.join(cacheDir, ytDlpManagedBinaryName('stable', platform)),
		downloadUrl,
		checksumUrl: sourceForgeYtDlpDownloadUrl(version, 'SHA2-256SUMS'),
		requiredChecksum: true,
		parseChecksum: content => parseShaLine(content, assetName),
		installKind: 'file',
		versionCheck: {kind: 'exactTag', tag: version}
	}
}

export function ytDlpManagedSourcePlans(cacheDir: string, opts: {platform?: NodeJS.Platform; arch?: NodeJS.Architecture; sourceForgeVersion: string | null}): ManagedFileSourcePlan[] {
	const platform = opts.platform ?? process.platform
	const arch = opts.arch ?? process.arch
	const assetName = ytDlpAssetName(platform, arch)
	if (!assetName) return []

	const plans = [githubPlan(cacheDir, 'nightly', assetName, platform), githubPlan(cacheDir, 'stable', assetName, platform)]
	if (opts.sourceForgeVersion) {
		plans.push(sourceForgePlan(cacheDir, assetName, opts.sourceForgeVersion, platform))
	}
	return plans
}
