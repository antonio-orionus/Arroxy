import {generateKeyPairSync} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vite-plus/test'
import {entriesForRuntimeBinaryValidation, findGithubAsset, githubHeaders, normalizePrivateKeyPem, parseGithubRelease, signRuntimeIndexPayload, verifyRuntimeIndexPayloadSignature} from '../../scripts/build/runtimeBinaryManifest.js'
import type {RuntimeBinaryIndex, RuntimeBinaryManifestEntry} from '@shared/types.js'

const baseEntry: RuntimeBinaryManifestEntry = {
	id: 'yt-dlp',
	channel: 'nightly',
	provider: 'github',
	version: '2026.06.13.234541',
	platform: 'linux',
	arch: 'x64',
	url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.13.234541/yt-dlp_linux',
	mirrors: [],
	size: 123,
	sha256: 'a'.repeat(64),
	format: 'raw',
	executablePath: 'yt-dlp'
}

describe('runtime binary manifest generator helpers', () => {
	it('parses GitHub release assets needed for immutable manifest entries', () => {
		const release = parseGithubRelease({
			tag_name: '2026.06.12',
			assets: [
				{name: 'yt-dlp_linux', browser_download_url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.12/yt-dlp_linux', size: 123},
				{name: 'SHA2-256SUMS', browser_download_url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.12/SHA2-256SUMS', size: 456}
			]
		})

		expect(release.tagName).toBe('2026.06.12')
		expect(findGithubAsset(release, 'yt-dlp_linux')).toEqual({name: 'yt-dlp_linux', browserDownloadUrl: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.12/yt-dlp_linux', size: 123})
		expect(() => findGithubAsset(release, 'missing')).toThrow('missing')
	})

	it('adds a GitHub bearer token only when one is available', () => {
		expect(githubHeaders({})).toEqual({Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'})
		expect(githubHeaders({GITHUB_TOKEN: 'ghs_test'})).toEqual({Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', Authorization: 'Bearer ghs_test'})
	})

	it('signs payloads with PEM secrets and verifies the exact bytes', () => {
		const {privateKey, publicKey} = generateKeyPairSync('ed25519')
		const privatePem = privateKey.export({type: 'pkcs8', format: 'pem'}).toString()
		const publicPem = publicKey.export({type: 'spki', format: 'pem'}).toString()
		const escapedPem = privatePem.trim().replaceAll('\n', '\\n')
		const payload = '{"schemaVersion":1}\n'

		const signature = signRuntimeIndexPayload(payload, normalizePrivateKeyPem(escapedPem))

		expect(verifyRuntimeIndexPayloadSignature(payload, signature, publicPem)).toBe(true)
		expect(verifyRuntimeIndexPayloadSignature(`${payload} `, signature, publicPem)).toBe(false)
	})

	it('routes generated artifact downloads through the shared verified cache downloader', () => {
		const source = readFileSync('scripts/build/runtimeBinaryManifest.ts', 'utf8')

		expect(source).toContain('downloadArtifactToCache')
		expect(source).not.toContain('downloadFile(')
	})

	it('materializes only current-host entries for current smoke validation', () => {
		const linux = baseEntry
		const macos: RuntimeBinaryManifestEntry = {...baseEntry, platform: 'darwin', url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.13.234541/yt-dlp_macos', sha256: 'b'.repeat(64), executablePath: 'yt-dlp_macos'}
		const windowsArm: RuntimeBinaryManifestEntry = {...baseEntry, platform: 'win32', arch: 'arm64', url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.13.234541/yt-dlp.exe', sha256: 'c'.repeat(64), executablePath: 'yt-dlp.exe'}
		const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-14T00:00:00.000Z', entries: [macos, linux, windowsArm]}

		expect(entriesForRuntimeBinaryValidation(index, 'current', 'linux', 'x64')).toEqual([linux])
		expect(entriesForRuntimeBinaryValidation(index, 'none', 'linux', 'x64')).toEqual([macos, linux, windowsArm])
	})
})
