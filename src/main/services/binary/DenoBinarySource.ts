import type {DependencyFailure} from '@shared/types.js'

export const DENO_SOURCES = {denoLand: {provider: 'deno-land', latest: 'https://dl.deno.land/release-latest.txt', release: 'https://dl.deno.land/release'}, denoGithub: {provider: 'github', release: 'https://github.com/denoland/deno/releases/download'}} as const

export interface DenoTarget {
	combo: string
	platform: 'win32' | 'darwin' | 'linux'
	arch: 'x64' | 'arm64'
	triple: string
	executableName: 'deno.exe' | 'deno'
}

const DENO_TARGETS = [
	{combo: 'win32-x64', platform: 'win32', arch: 'x64', triple: 'x86_64-pc-windows-msvc', executableName: 'deno.exe'},
	{combo: 'darwin-x64', platform: 'darwin', arch: 'x64', triple: 'x86_64-apple-darwin', executableName: 'deno'},
	{combo: 'darwin-arm64', platform: 'darwin', arch: 'arm64', triple: 'aarch64-apple-darwin', executableName: 'deno'},
	{combo: 'linux-x64', platform: 'linux', arch: 'x64', triple: 'x86_64-unknown-linux-gnu', executableName: 'deno'},
	{combo: 'linux-arm64', platform: 'linux', arch: 'arm64', triple: 'aarch64-unknown-linux-gnu', executableName: 'deno'}
] as const satisfies readonly DenoTarget[]

function shellQuote(value: string): string {
	return `'${value.replaceAll("'", "'\\''")}'`
}

export function denoTargets(): DenoTarget[] {
	return DENO_TARGETS.map(target => ({...target}))
}

export function denoTargetFor(platform: string, arch: string): DenoTarget | undefined {
	const target = DENO_TARGETS.find(candidate => candidate.platform === platform && candidate.arch === arch)
	return target ? {...target} : undefined
}

export function currentDenoTarget(platform: NodeJS.Platform = process.platform, arch: NodeJS.Architecture = process.arch): DenoTarget | undefined {
	const normalizedArch = arch === 'arm64' ? 'arm64' : arch === 'x64' ? 'x64' : arch
	return denoTargetFor(platform, normalizedArch)
}

export function denoExecutableName(targetOrPlatform: DenoTarget | NodeJS.Platform = currentDenoTarget() ?? process.platform): string {
	if (typeof targetOrPlatform !== 'string') return targetOrPlatform.executableName
	return targetOrPlatform === 'win32' ? 'deno.exe' : 'deno'
}

export function denoAssetName(target: DenoTarget): string {
	return `deno-${target.triple}.zip`
}

export function parseDenoLatestVersion(content: string): string | null {
	const version = content.trim()
	return /^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version) ? version : null
}

export function denoLandDownloadUrl(version: string, assetName: string): string {
	return `${DENO_SOURCES.denoLand.release}/${version}/${assetName}`
}

export function denoGithubDownloadUrl(version: string, assetName: string): string {
	return `${DENO_SOURCES.denoGithub.release}/${version}/${assetName}`
}

export function denoChecksumUrl(downloadUrl: string): string {
	return `${downloadUrl}.sha256sum`
}

export function parseDenoSha256(content: string): string | null {
	const firstToken = content.trim().split(/\s+/)[0] ?? ''
	if (/^[a-fA-F0-9]{64}$/.test(firstToken)) return firstToken.toLowerCase()
	const labelled = /\b([a-fA-F0-9]{64})\b/.exec(content)
	return labelled ? labelled[1].toLowerCase() : null
}

export function unsupportedDenoFailure(platform: string = process.platform, arch: string = process.arch): DependencyFailure {
	return {kind: 'spawn_failed', message: `No deno build for this platform/arch: ${platform}-${arch}`}
}

export function formatDenoShellEnv(target: DenoTarget, version: string): string {
	const assetName = denoAssetName(target)
	const downloadUrl = denoLandDownloadUrl(version, assetName)
	return [
		`DENO_TARGET=${shellQuote(target.combo)}`,
		`DENO_TRIPLE=${shellQuote(target.triple)}`,
		`DENO_ASSET_NAME=${shellQuote(assetName)}`,
		`DENO_EXECUTABLE_NAME=${shellQuote(target.executableName)}`,
		`DENO_VERSION=${shellQuote(version)}`,
		`DENO_ASSET_URL=${shellQuote(downloadUrl)}`,
		`DENO_CHECKSUM_URL=${shellQuote(denoChecksumUrl(downloadUrl))}`
	].join('\n')
}
