import {afterEach, describe, expect, it, vi} from 'vite-plus/test'

import {BTBN_PINNED_RELEASE_TAG, BTBN_RELEASE_BRANCH, btbnTargetFor, btbnTargets, floatingLatestAssetName, formatShellEnv, githubHeaders, isCliEntrypoint, isReleaseBranchAssetName, resolveBtbnAsset, selectBtbnAsset, windowsPathToFileUrl, type BtbnRelease} from '../../scripts/build/btbnResolver.js'

function release(tagName: string, assetNames: string[], draft = false): BtbnRelease {
	return {tagName, draft, assets: assetNames.map(name => ({name, browserDownloadUrl: `https://example.invalid/${tagName}/${name}`}))}
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('BtbN release resolver', () => {
	it('tracks the 9.0 release branch, the same major/minor as the macOS release build', () => {
		expect(BTBN_RELEASE_BRANCH).toBe('9.0')
	})

	it('recognizes release-branch gpl-shared assets for the requested platform archive', () => {
		expect(isReleaseBranchAssetName('ffmpeg-n9.0.2-17-g2a571b6068-linux64-gpl-shared-9.0.tar.xz', 'linux64', 'tar.xz')).toBe(true)
		expect(isReleaseBranchAssetName('ffmpeg-n9.0.1-11-ge47273f4d9-win64-gpl-shared-9.0.zip', 'win64', 'zip')).toBe(true)
		expect(isReleaseBranchAssetName('ffmpeg-n9.0.3-linuxarm64-gpl-shared-9.0.tar.xz', 'linuxarm64', 'tar.xz')).toBe(true)
	})

	it('rejects master, other release branches, lgpl, other targets and the floating name', () => {
		const linux = (name: string): boolean => isReleaseBranchAssetName(name, 'linux64', 'tar.xz')

		expect(linux('ffmpeg-N-127032-g6ae491a26c-linux64-gpl-shared.tar.xz')).toBe(false)
		expect(linux('ffmpeg-master-latest-linux64-gpl-shared.tar.xz')).toBe(false)
		expect(linux('ffmpeg-n8.1.3-9-g29e619e767-linux64-gpl-shared-8.1.tar.xz')).toBe(false)
		expect(linux('ffmpeg-n9.0.2-17-g2a571b6068-linux64-lgpl-shared-9.0.tar.xz')).toBe(false)
		expect(linux('ffmpeg-n9.0.2-17-g2a571b6068-linuxarm64-gpl-shared-9.0.tar.xz')).toBe(false)
		expect(linux('ffmpeg-n9.0.2-17-g2a571b6068-linux64-gpl-shared-9.0.zip')).toBe(false)
		expect(linux('ffmpeg-n9.0-latest-linux64-gpl-shared-9.0.tar.xz')).toBe(false)
		expect(linux('ffmpeg-n9.01.2-linux64-gpl-shared-9.0.tar.xz')).toBe(false)
	})

	it('picks the release-branch build out of an autobuild that also carries master and older branches', () => {
		const resolution = selectBtbnAsset(
			[
				release('autobuild-2026-09-30-13-08', [
					'checksums.sha256',
					'ffmpeg-N-127021-ge0c94b2d1c-win64-gpl-shared.zip',
					'ffmpeg-n8.1.3-9-g29e619e767-win64-gpl-shared-8.1.zip',
					'ffmpeg-n9.0.2-17-g2a571b6068-win64-lgpl-shared-9.0.zip',
					'ffmpeg-n9.0.2-17-g2a571b6068-win64-gpl-shared-9.0.zip',
					'ffmpeg-n9.0.2-17-g2a571b6068-winarm64-gpl-shared-9.0.zip'
				])
			],
			'win64',
			'zip'
		)

		expect(resolution).toEqual({
			tagName: 'autobuild-2026-09-30-13-08',
			assetName: 'ffmpeg-n9.0.2-17-g2a571b6068-win64-gpl-shared-9.0.zip',
			assetUrl: 'https://example.invalid/autobuild-2026-09-30-13-08/ffmpeg-n9.0.2-17-g2a571b6068-win64-gpl-shared-9.0.zip',
			checksumsUrl: 'https://example.invalid/autobuild-2026-09-30-13-08/checksums.sha256'
		})
	})

	it('finds nothing in an autobuild that predates the release branch', () => {
		expect(selectBtbnAsset([release('autobuild-2026-07-31-14-10', ['checksums.sha256', 'ffmpeg-N-125821-g0123456789-linux64-gpl-shared.tar.xz', 'ffmpeg-n8.1.1-11-ge4c7fbf6c0-linux64-gpl-shared-8.1.tar.xz'])], 'linux64', 'tar.xz')).toBeUndefined()
	})

	it('skips the floating latest release by default and selects the newest complete timestamped release', () => {
		const resolution = selectBtbnAsset(
			[
				release('latest', ['checksums.sha256', floatingLatestAssetName('linux64', 'tar.xz')]),
				release('autobuild-2026-10-19-13-06', ['checksums.sha256', 'ffmpeg-n9.0.2-28-g669f5ab083-linux64-gpl-shared-9.0.tar.xz']),
				release('autobuild-2026-09-30-13-08', ['checksums.sha256', 'ffmpeg-n9.0.2-17-g2a571b6068-linux64-gpl-shared-9.0.tar.xz'])
			],
			'linux64',
			'tar.xz'
		)

		expect(resolution).toEqual({
			tagName: 'autobuild-2026-10-19-13-06',
			assetName: 'ffmpeg-n9.0.2-28-g669f5ab083-linux64-gpl-shared-9.0.tar.xz',
			assetUrl: 'https://example.invalid/autobuild-2026-10-19-13-06/ffmpeg-n9.0.2-28-g669f5ab083-linux64-gpl-shared-9.0.tar.xz',
			checksumsUrl: 'https://example.invalid/autobuild-2026-10-19-13-06/checksums.sha256'
		})
	})

	it('falls back past incomplete releases instead of trusting a half-published release', () => {
		const resolution = selectBtbnAsset(
			[release('autobuild-2026-10-19-13-06', ['ffmpeg-n9.0.2-28-g669f5ab083-win64-gpl-shared-9.0.zip']), release('autobuild-2026-10-18-13-01', ['checksums.sha256']), release('autobuild-2026-10-17-20-51', ['checksums.sha256', 'ffmpeg-n9.0.2-28-g669f5ab083-win64-gpl-shared-9.0.zip'])],
			'win64',
			'zip'
		)

		expect(resolution?.tagName).toBe('autobuild-2026-10-17-20-51')
		expect(resolution?.assetName).toBe('ffmpeg-n9.0.2-28-g669f5ab083-win64-gpl-shared-9.0.zip')
	})

	it('can intentionally resolve the floating latest release when explicitly allowed', () => {
		const resolution = selectBtbnAsset([release('latest', ['checksums.sha256', floatingLatestAssetName('win64', 'zip')])], 'win64', 'zip', {includeFloatingLatest: true})

		expect(resolution?.tagName).toBe('latest')
		expect(resolution?.assetName).toBe('ffmpeg-n9.0-latest-win64-gpl-shared-9.0.zip')
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

	// Floating to "whatever BtbN published this morning" made releases
	// irreproducible and shipped an unreviewed binary straight to users: the
	// 2026-09-01 autobuild's ffprobe.exe trips Defender's ML classifier
	// (Trojan:Win32/Wacatac.B!ml, BtbN/FFmpeg-Builds#646) and is quarantined on
	// install, which breaks probing. The embedded ffmpeg is now a reviewed pin.
	it('resolves the pinned release by tag rather than whatever is newest', async () => {
		const fetchMock = vi.fn<typeof fetch>(
			async () =>
				new Response(
					JSON.stringify({
						tag_name: BTBN_PINNED_RELEASE_TAG,
						assets: [
							{name: 'checksums.sha256', browser_download_url: 'https://example.invalid/checksums.sha256'},
							{name: 'ffmpeg-n9.0.2-17-g2a571b6068-linux64-gpl-shared-9.0.tar.xz', browser_download_url: 'https://example.invalid/archive.tar.xz'}
						]
					})
				)
		)
		vi.stubGlobal('fetch', fetchMock)

		await expect(resolveBtbnAsset('linux64', 'tar.xz', {})).resolves.toMatchObject({tagName: BTBN_PINNED_RELEASE_TAG})

		expect(fetchMock.mock.calls[0]?.[0]).toBe(`https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/tags/${BTBN_PINNED_RELEASE_TAG}`)
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
								{name: 'ffmpeg-n9.0.2-17-g2a571b6068-linux64-gpl-shared-9.0.tar.xz', browser_download_url: 'https://example.invalid/archive.tar.xz'}
							]
						}
					])
				)
		)
		vi.stubGlobal('fetch', fetchMock)

		await expect(resolveBtbnAsset('linux64', 'tar.xz', {BTBN_API_BASE: '   ', BTBN_RELEASE_TAG: 'floating'})).resolves.toMatchObject({tagName: 'autobuild-2026-06-10-14-29'})

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
								{name: 'ffmpeg-n9.0.2-17-g2a571b6068-linux64-gpl-shared-9.0.tar.xz', browser_download_url: 'https://example.invalid/archive.tar.xz'}
							]
						}
					])
				)
		)
		vi.stubGlobal('fetch', fetchMock)

		await resolveBtbnAsset('linux64', 'tar.xz', {BTBN_API_BASE: 'https://api.example.invalid/repos/BtbN/FFmpeg-Builds', BTBN_RELEASE_TAG: 'floating'})

		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({signal: expect.any(AbortSignal)})
	})
})
