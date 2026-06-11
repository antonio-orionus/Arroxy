import {pathToFileURL} from 'node:url'

const BTBN_API_BASE = 'https://api.github.com/repos/BtbN/FFmpeg-Builds'

type BtbnArchiveExtension = 'tar.xz' | 'zip'

export interface BtbnTarget {
	combo: string
	platform: 'win32' | 'linux'
	arch: 'x64' | 'arm64'
	btbnArch: string
	ext: BtbnArchiveExtension
}

export interface BtbnReleaseAsset {
	name: string
	browserDownloadUrl: string
}

export interface BtbnRelease {
	tagName: string
	draft: boolean
	assets: BtbnReleaseAsset[]
}

export interface BtbnAssetResolution {
	tagName: string
	assetName: string
	assetUrl: string
	checksumsUrl: string
}

interface GithubAsset {
	name: string
	browser_download_url: string
}

interface GithubRelease {
	tag_name: string
	draft?: boolean
	assets?: GithubAsset[]
}

const BTBN_TARGETS = [
	{combo: 'win32-x64', platform: 'win32', arch: 'x64', btbnArch: 'win64', ext: 'zip'},
	{combo: 'win32-arm64', platform: 'win32', arch: 'arm64', btbnArch: 'winarm64', ext: 'zip'},
	{combo: 'linux-x64', platform: 'linux', arch: 'x64', btbnArch: 'linux64', ext: 'tar.xz'},
	{combo: 'linux-arm64', platform: 'linux', arch: 'arm64', btbnArch: 'linuxarm64', ext: 'tar.xz'}
] as const satisfies readonly BtbnTarget[]

export function btbnTargets(): BtbnTarget[] {
	return BTBN_TARGETS.map(target => ({...target}))
}

export function btbnTargetFor(platform: string, arch: string): BtbnTarget | undefined {
	const target = BTBN_TARGETS.find(candidate => candidate.platform === platform && candidate.arch === arch)
	return target ? {...target} : undefined
}

function btbnTargetForCombo(combo: string): BtbnTarget | undefined {
	const target = BTBN_TARGETS.find(candidate => candidate.combo === combo)
	return target ? {...target} : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function toString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

function toGithubRelease(value: unknown): GithubRelease | undefined {
	if (!isRecord(value)) {
		return undefined
	}

	const tagName = toString(value.tag_name)
	const assets = Array.isArray(value.assets) ? value.assets : undefined
	if (!tagName || !assets) {
		return undefined
	}

	const parsedAssets = assets
		.map(asset => {
			if (!isRecord(asset)) {
				return undefined
			}

			const name = toString(asset.name)
			const browserDownloadUrl = toString(asset.browser_download_url)
			return name && browserDownloadUrl ? {name, browser_download_url: browserDownloadUrl} : undefined
		})
		.filter((asset): asset is GithubAsset => asset !== undefined)

	return {tag_name: tagName, draft: value.draft === true, assets: parsedAssets}
}

function toBtbnRelease(release: GithubRelease): BtbnRelease {
	return {tagName: release.tag_name, draft: release.draft === true, assets: (release.assets ?? []).map(asset => ({name: asset.name, browserDownloadUrl: asset.browser_download_url}))}
}

function parseGithubReleaseList(value: unknown): BtbnRelease[] {
	if (!Array.isArray(value)) {
		throw new Error('BtbN releases API returned a non-array payload')
	}

	return value
		.map(toGithubRelease)
		.filter((release): release is GithubRelease => release !== undefined)
		.map(toBtbnRelease)
}

function normalizeExtension(ext: string): BtbnArchiveExtension {
	if (ext === 'tar.xz' || ext === 'zip') {
		return ext
	}

	throw new Error(`unsupported BtbN archive extension: ${ext}`)
}

export function floatingLatestAssetName(btbnArch: string, ext: BtbnArchiveExtension): string {
	return `ffmpeg-master-latest-${btbnArch}-gpl-shared.${ext}`
}

export function isTimestampedMasterAssetName(name: string, btbnArch: string, ext: BtbnArchiveExtension): boolean {
	return name.startsWith('ffmpeg-N-') && name.endsWith(`-${btbnArch}-gpl-shared.${ext}`)
}

function isFloatingLatestAssetName(name: string, btbnArch: string, ext: BtbnArchiveExtension): boolean {
	return name === floatingLatestAssetName(btbnArch, ext)
}

function findChecksums(release: BtbnRelease): BtbnReleaseAsset | undefined {
	return release.assets.find(asset => asset.name === 'checksums.sha256')
}

function findArchive(release: BtbnRelease, btbnArch: string, ext: BtbnArchiveExtension, includeFloatingLatest: boolean): BtbnReleaseAsset | undefined {
	return release.assets.find(asset => {
		if (release.tagName === 'latest') {
			return includeFloatingLatest && isFloatingLatestAssetName(asset.name, btbnArch, ext)
		}

		return isTimestampedMasterAssetName(asset.name, btbnArch, ext)
	})
}

export function selectBtbnAsset(releases: BtbnRelease[], btbnArch: string, ext: BtbnArchiveExtension, options: {includeFloatingLatest?: boolean} = {}): BtbnAssetResolution | undefined {
	const includeFloatingLatest = options.includeFloatingLatest === true

	for (const release of releases) {
		if (release.draft) {
			continue
		}

		if (release.tagName === 'latest' && !includeFloatingLatest) {
			continue
		}

		const checksums = findChecksums(release)
		const archive = findArchive(release, btbnArch, ext, includeFloatingLatest)
		if (!checksums || !archive) {
			continue
		}

		return {tagName: release.tagName, assetName: archive.name, assetUrl: archive.browserDownloadUrl, checksumsUrl: checksums.browserDownloadUrl}
	}

	return undefined
}

export function githubHeaders(env: Record<string, string | undefined> = process.env): HeadersInit {
	const headers: HeadersInit = {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'}

	const token = env.BTBN_GITHUB_TOKEN?.trim()
	if (token) {
		headers.Authorization = `Bearer ${token}`
	}

	return headers
}

async function fetchJson(url: string): Promise<unknown> {
	const response = await fetch(url, {headers: githubHeaders()})
	if (!response.ok) {
		throw new Error(`GitHub API request failed (${response.status}): ${url}`)
	}

	return response.json()
}

async function fetchReleaseList(apiBase: string): Promise<BtbnRelease[]> {
	const payload = await fetchJson(`${apiBase}/releases?per_page=20`)
	return parseGithubReleaseList(payload)
}

async function fetchReleaseByTag(apiBase: string, tagName: string): Promise<BtbnRelease> {
	const payload = await fetchJson(`${apiBase}/releases/tags/${encodeURIComponent(tagName)}`)
	const parsed = toGithubRelease(payload)
	if (!parsed) {
		throw new Error(`BtbN release ${tagName} API payload was not a release`)
	}

	return toBtbnRelease(parsed)
}

function shellQuote(value: string): string {
	return `'${value.replaceAll("'", "'\\''")}'`
}

function normalizeFileUrlForComparison(href: string): string {
	return href.replace(/^file:\/\/\/([a-zA-Z]):/, (_match, drive: string) => `file:///${drive.toUpperCase()}:`)
}

export function windowsPathToFileUrl(value: string): string {
	if (!/^[a-zA-Z]:[\\/]/.test(value)) {
		throw new Error(`Invalid Windows path: ${value}`)
	}

	const normalized = value.replaceAll('\\', '/')
	const drive = normalized[0].toUpperCase()
	const rest = normalized.slice(3)
	return `file:///${drive}:/${rest.split('/').map(encodeURIComponent).join('/')}`
}

function pathLikeToFileUrl(value: string): string {
	if (/^[a-zA-Z]:[\\/]/.test(value)) return windowsPathToFileUrl(value)
	return pathToFileURL(value).href
}

export function isCliEntrypoint(meta: Pick<ImportMeta, 'url'> & {main?: boolean}, argvPath: string | undefined = process.argv[1]): boolean {
	if (meta.main === true) return true
	if (!argvPath) return false
	return normalizeFileUrlForComparison(meta.url) === normalizeFileUrlForComparison(pathLikeToFileUrl(argvPath))
}

export function formatShellEnv(resolution: BtbnAssetResolution, target?: BtbnTarget): string {
	return [
		...(target ? [`BTBN_TARGET=${shellQuote(target.combo)}`, `BTBN_ARCH=${shellQuote(target.btbnArch)}`, `BTBN_ARCHIVE_EXT=${shellQuote(target.ext)}`] : []),
		`BTBN_ASSET_NAME=${shellQuote(resolution.assetName)}`,
		`BTBN_ASSET_URL=${shellQuote(resolution.assetUrl)}`,
		`BTBN_CHECKSUMS_URL=${shellQuote(resolution.checksumsUrl)}`,
		`BTBN_RESOLVED_RELEASE_TAG=${shellQuote(resolution.tagName)}`
	].join('\n')
}

async function resolveFromGithub(btbnArch: string, ext: BtbnArchiveExtension): Promise<BtbnAssetResolution> {
	const apiBase = process.env.BTBN_API_BASE ?? BTBN_API_BASE
	const pinnedTag = process.env.BTBN_RELEASE_TAG?.trim()
	const releases = pinnedTag ? [await fetchReleaseByTag(apiBase, pinnedTag)] : await fetchReleaseList(apiBase)
	const resolution = selectBtbnAsset(releases, btbnArch, ext, {includeFloatingLatest: pinnedTag === 'latest'})

	if (!resolution) {
		const source = pinnedTag ? `tag ${pinnedTag}` : 'recent releases'
		throw new Error(`no complete BtbN ${btbnArch} gpl-shared ${ext} archive found in ${source}`)
	}

	return resolution
}

async function main(args: string[]): Promise<void> {
	if (args[0] === '--list-targets') {
		console.log(BTBN_TARGETS.map(target => target.combo).join('\n'))
		return
	}
	if (args[0] === '--target') {
		const target = args.length === 2 ? btbnTargetForCombo(args[1]) : btbnTargetFor(args[1], args[2])
		if (!target) {
			throw new Error('usage: bun scripts/build/btbnResolver.ts --target <platform>-<arch> | --target <platform> <arch>')
		}
		const resolution = await resolveFromGithub(target.btbnArch, target.ext)
		console.log(formatShellEnv(resolution, target))
		return
	}

	const [btbnArch, rawExt] = args
	if (!btbnArch || !rawExt) {
		throw new Error('usage: bun scripts/build/btbnResolver.ts <btbn-arch> <zip|tar.xz> | --target <platform>-<arch> | --list-targets')
	}

	const resolution = await resolveFromGithub(btbnArch, normalizeExtension(rawExt))
	console.log(formatShellEnv(resolution))
}

if (isCliEntrypoint(import.meta)) {
	main(process.argv.slice(2)).catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	})
}
