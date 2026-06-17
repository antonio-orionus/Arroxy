import {afterEach, describe, expect, it, vi} from 'vitest'

import {btbnTargetFor, btbnTargets, floatingLatestAssetName, formatShellEnv, githubHeaders, isCliEntrypoint, isTimestampedMasterAssetName, resolveBtbnAsset, selectBtbnAsset, windowsPathToFileUrl, type BtbnRelease} from '../../scripts/build/btbnResolver.js'

function release(tagName: string, assetNames: string[], draft = false): BtbnRelease {
	return {tagName, draft, assets: assetNames.map(name => ({name, browserDownloadUrl: `https://example.invalid/${tagName}/${name}`}))}
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('BtbN release resolver', () => {
	it('recognizes timestamped master gpl-shared assets for the requested platform archive', () => {
		expect(isTimestampedMasterAssetName('ffmpeg-N-124941-g54749da98a-linux64-gpl-shared.tar.xz', 'linux64', 'tar.xz')).toBe(true)
		expect(isTimestampedMasterAssetName('ffmpeg-N-124941-g54749da98a-win64-gpl-shared.zip', 'win64', 'zip')).toBe(true)
		expect(isTimestampedMasterAssetName('ffmpeg-n8.1.1-11-ge4c7fbf6c0-linux64-gpl-shared-8.1.tar.xz', 'linux64', 'tar.xz')).toBe(false)
		expect(isTimestampedMasterAssetName('ffmpeg-N-124941-g54749da98a-linux64-lgpl-shared.tar.xz', 'linux64', 'tar.xz')).toBe(false)
	})

	it('skips the floating latest release by default and selects the newest complete timestamped release', () => {
		const resolution = selectBtbnAsset(
			[
				release('latest', ['checksums.sha256', floatingLatestAssetName('linux64', 'tar.xz')]),
				release('autobuild-2026-06-10-14-29', ['checksums.sha256', 'ffmpeg-N-124941-g54749da98a-linux64-gpl-shared.tar.xz']),
				release('autobuild-2026-06-09-15-17', ['checksums.sha256', 'ffmpeg-N-124881-g6028720d70-linux64-gpl-shared.tar.xz'])
			],
			'linux64',
			'tar.xz'
		)

		expect(resolution).toEqual({
			tagName: 'autobuild-2026-06-10-14-29',
			assetName: 'ffmpeg-N-124941-g54749da98a-linux64-gpl-shared.tar.xz',
			assetUrl: 'https://example.invalid/autobuild-2026-06-10-14-29/ffmpeg-N-124941-g54749da98a-linux64-gpl-shared.tar.xz',
			checksumsUrl: 'https://example.invalid/autobuild-2026-06-10-14-29/checksums.sha256'
		})
	})

	it('falls back past incomplete releases instead of trusting a half-published release', () => {
		const resolution = selectBtbnAsset(
			[release('autobuild-2026-06-10-14-29', ['ffmpeg-N-124941-g54749da98a-win64-gpl-shared.zip']), release('autobuild-2026-06-09-15-17', ['checksums.sha256']), release('autobuild-2026-06-08-14-24', ['checksums.sha256', 'ffmpeg-N-124881-g6028720d70-win64-gpl-shared.zip'])],
			'win64',
			'zip'
		)

		expect(resolution?.tagName).toBe('autobuild-2026-06-08-14-24')
		expect(resolution?.assetName).toBe('ffmpeg-N-124881-g6028720d70-win64-gpl-shared.zip')
	})

	it('can intentionally resolve the floating latest release when explicitly allowed', () => {
		const resolution = selectBtbnAsset([release('latest', ['checksums.sha256', floatingLatestAssetName('win64', 'zip')])], 'win64', 'zip', {includeFloatingLatest: true})

		expect(resolution?.tagName).toBe('latest')
		expect(resolution?.assetName).toBe('ffmpeg-master-latest-win64-gpl-shared.zip')
	})

	it('prints sourceable shell assignments for fetch-embedded.sh', () => {
		const output = formatShellEnv({tagName: 'autobuild-2026-06-10-14-29', assetName: 'ffmpeg-N-test-linux64-gpl-shared.tar.xz', assetUrl: "https://example.invalid/archive's.tar.xz", checksumsUrl: 'https://example.invalid/checksums.sha256'})

		expect(output).toContain("BTBN_ASSET_NAME='ffmpeg-N-test-linux64-gpl-shared.tar.xz'")
		expect(output).toContain("BTBN_ASSET_URL='https://example.invalid/archive'\\''s.tar.xz'")
		expect(output).toContain("BTBN_CHECKSUMS_URL='https://example.invalid/checksums.sha256'")
		expect(output).toContain("BTBN_RESOLVED_RELEASE_TAG='autobuild-2026-06-10-14-29'")
	})

	it('owns the build/smoke BtbN target matrix', () => {
		expect(btbnTargets().map(target => target.combo)).toEqual(['win32-x64', 'win32-arm64', 'linux-x64', 'linux-arm64'])
		expect(btbnTargetFor('linux', 'arm64')).toMatchObject({combo: 'linux-arm64', btbnArch: 'linuxarm64', ext: 'tar.xz'})
		expect(btbnTargetFor('darwin', 'arm64')).toBeUndefined()
	})

	it('prints target metadata with resolved asset metadata', () => {
		const target = btbnTargetFor('win32', 'x64')
		if (!target) throw new Error('missing target')
		const output = formatShellEnv({tagName: 'autobuild-2026-06-10-14-29', assetName: 'ffmpeg-N-test-win64-gpl-shared.zip', assetUrl: 'https://example.invalid/archive.zip', checksumsUrl: 'https://example.invalid/checksums.sha256'}, target)

		expect(output).toContain("BTBN_TARGET='win32-x64'")
		expect(output).toContain("BTBN_ARCH='win64'")
		expect(output).toContain("BTBN_ARCHIVE_EXT='zip'")
	})

	it('recognizes Bun CLI execution and Windows argv paths', () => {
		expect(isCliEntrypoint({url: 'file:///not-this-script.ts', main: true}, undefined)).toBe(true)
		expect(isCliEntrypoint({url: 'file:///D:/a/Arroxy/Arroxy/scripts/build/btbnResolver.ts'}, 'D:\\a\\Arroxy\\Arroxy\\scripts\\build\\btbnResolver.ts')).toBe(true)
		expect(isCliEntrypoint({url: 'file:///D:/a/Arroxy/Arroxy/scripts/build/btbnResolver.ts'}, 'D:\\a\\Arroxy\\Arroxy\\scripts\\build\\other.ts')).toBe(false)
	})

	it('validates Windows paths before converting them to file URLs', () => {
		expect(windowsPathToFileUrl('d:\\a\\Arroxy\\some file.ts')).toBe('file:///D:/a/Arroxy/some%20file.ts')
		expect(() => windowsPathToFileUrl('D:')).toThrow('Invalid Windows path')
		expect(() => windowsPathToFileUrl('relative\\path.ts')).toThrow('Invalid Windows path')
	})

	it('authenticates BtbN API calls only with the dedicated token env var', () => {
		expect(githubHeaders({BTBN_GITHUB_TOKEN: 'btbn-token'})).toMatchObject({Authorization: 'Bearer btbn-token'})
		expect(githubHeaders({GITHUB_TOKEN: 'generic-token'})).not.toHaveProperty('Authorization')
	})

	it('treats a blank BTBN_API_BASE override as unset', async () => {
		const fetchMock = vi.fn<typeof fetch>(
			async () =>
				new Response(
					JSON.stringify([
						{
							tag_name: 'autobuild-2026-06-10-14-29',
							assets: [
								{name: 'checksums.sha256', browser_download_url: 'https://example.invalid/checksums.sha256'},
								{name: 'ffmpeg-N-124941-g54749da98a-linux64-gpl-shared.tar.xz', browser_download_url: 'https://example.invalid/archive.tar.xz'}
							]
						}
					])
				)
		)
		vi.stubGlobal('fetch', fetchMock)

		await expect(resolveBtbnAsset('linux64', 'tar.xz', {BTBN_API_BASE: '   '})).resolves.toMatchObject({tagName: 'autobuild-2026-06-10-14-29'})

		expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.github.com/repos/BtbN/FFmpeg-Builds/releases?per_page=20')
	})

	it('passes a timeout signal to BtbN GitHub API requests', async () => {
		const fetchMock = vi.fn<typeof fetch>(
			async () =>
				new Response(
					JSON.stringify([
						{
							tag_name: 'autobuild-2026-06-10-14-29',
							assets: [
								{name: 'checksums.sha256', browser_download_url: 'https://example.invalid/checksums.sha256'},
								{name: 'ffmpeg-N-124941-g54749da98a-linux64-gpl-shared.tar.xz', browser_download_url: 'https://example.invalid/archive.tar.xz'}
							]
						}
					])
				)
		)
		vi.stubGlobal('fetch', fetchMock)

		await resolveBtbnAsset('linux64', 'tar.xz', {BTBN_API_BASE: 'https://api.example.invalid/repos/BtbN/FFmpeg-Builds'})

		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({signal: expect.any(AbortSignal)})
	})
})
