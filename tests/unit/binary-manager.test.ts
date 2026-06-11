import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {binaryInternals} from '@main/services/BinaryManager.js'
import {parseSourceForgeLatestYtDlpVersion} from '@main/services/binary/YtDlpBinarySource.js'

describe('binaryInternals', () => {
	it('parses SHA lines', () => {
		const sha = binaryInternals.parseShaLine('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  yt-dlp.exe', 'yt-dlp.exe')

		expect(sha).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
	})

	it('parses the resumed offset from Content-Range', () => {
		expect(binaryInternals.parseContentRangeStart('bytes 1024-2047/4096')).toBe(1024)
		expect(binaryInternals.parseContentRangeStart('bytes */4096')).toBeNull()
	})

	it('discards stale partials on 416 and range mismatches', () => {
		expect(binaryInternals.resolvePartialResponseMode(2048, 416, 'bytes */1024')).toBe('discard-and-retry')
		expect(binaryInternals.resolvePartialResponseMode(2048, 206, 'bytes 0-1023/1024')).toBe('discard-and-retry')
	})

	it('appends only when the resumed range matches the partial size', () => {
		expect(binaryInternals.resolvePartialResponseMode(2048, 206, 'bytes 2048-4095/8192')).toBe('append')
		expect(binaryInternals.resolvePartialResponseMode(2048, 200, undefined)).toBe('fresh')
	})

	it('computes file sha256', async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sha-test-'))
		const filePath = path.join(tempDir, 'test.bin')
		await fs.writeFile(filePath, 'hello world', 'utf-8')

		const digest = await binaryInternals.sha256ForFile(filePath)
		expect(digest).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
	})

	it('parses a raw SHA-256 body', () => {
		const sha = binaryInternals.parseStandaloneSha256('6f58ce889f59c311410f7d2b18895b33c03456463486f3b1ebc93d97a0f54541\n')

		expect(sha).toBe('6f58ce889f59c311410f7d2b18895b33c03456463486f3b1ebc93d97a0f54541')
	})

	it('parses a labelled SHA-256 line if upstream changes the format', () => {
		const sha = binaryInternals.parseStandaloneSha256('SHA256: 6f58ce889f59c311410f7d2b18895b33c03456463486f3b1ebc93d97a0f54541\n')
		expect(sha).toBe('6f58ce889f59c311410f7d2b18895b33c03456463486f3b1ebc93d97a0f54541')
	})

	it('parses the "<hash>  filename.zip" SHA-256 body', () => {
		const sha = binaryInternals.parseStandaloneSha256('6f58ce889f59c311410f7d2b18895b33c03456463486f3b1ebc93d97a0f54541  ffmpeg-release-essentials.zip')
		expect(sha).toBe('6f58ce889f59c311410f7d2b18895b33c03456463486f3b1ebc93d97a0f54541')
	})

	it('returns null when the body has no 64-hex token at all', () => {
		expect(binaryInternals.parseStandaloneSha256('not a hash')).toBeNull()
		expect(binaryInternals.parseStandaloneSha256('')).toBeNull()
	})

	it('parses the PowerShell Get-FileHash format used by deno Windows .sha256sum', () => {
		const content = '\nAlgorithm : SHA256\nHash      : 25F9871F5C1D9E999D60071F8069767134495FD601D2E2C7CE1E8C641487BDA0\nPath      : C:\\a\\deno\\deno\\target\\release\\deno-x86_64-pc-windows-msvc.zip\n'
		const sha = binaryInternals.parsePowerShellFileHash(content)

		expect(sha).toBe('25f9871f5c1d9e999d60071f8069767134495fd601d2e2c7ce1e8c641487bda0')
	})

	it('returns null for sha sources that lack a Hash line', () => {
		expect(binaryInternals.parsePowerShellFileHash('Algorithm : SHA256\nHash      : nothex\n')).toBeNull()
		expect(binaryInternals.parsePowerShellFileHash('')).toBeNull()
	})

	it('parses the latest SourceForge yt-dlp mirror version from file links', () => {
		const html = '<a href="/projects/yt-dlp.mirror/files/2026.06.09/yt-dlp.exe/download">yt-dlp.exe</a><a href="/projects/yt-dlp.mirror/files/2026.03.17/yt-dlp.exe/download">older</a>'

		expect(parseSourceForgeLatestYtDlpVersion(html)).toBe('2026.06.09')
		expect(parseSourceForgeLatestYtDlpVersion('no versions')).toBeNull()
	})
})
