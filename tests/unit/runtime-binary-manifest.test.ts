import {describe, expect, it} from 'vite-plus/test'
import {BUNDLED_RUNTIME_BINARY_INDEX} from '@main/services/binary/BundledRuntimeBinaryIndex.js'
import {runtimeBinaryCacheKey, runtimeEntriesForCurrentTarget, validateRuntimeBinaryIndex, validateRuntimeBinaryManifestEntry} from '@shared/runtimeBinaryManifest.js'
import type {RuntimeBinaryIndex, RuntimeBinaryManifestEntry} from '@shared/types.js'

const baseEntry: RuntimeBinaryManifestEntry = {
	id: 'yt-dlp',
	channel: 'nightly',
	provider: 'github',
	version: '2026.06.12',
	platform: 'linux',
	arch: 'x64',
	url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux',
	mirrors: [],
	size: 123,
	sha256: 'a'.repeat(64),
	format: 'raw',
	executablePath: 'yt-dlp'
}

describe('runtime binary manifest validation', () => {
	it('accepts immutable approved binary entries', () => {
		expect(validateRuntimeBinaryManifestEntry(baseEntry)).toEqual({ok: true, value: baseEntry})
	})

	it('rejects floating latest URLs', () => {
		const result = validateRuntimeBinaryManifestEntry({...baseEntry, url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux'})
		expect(result.ok).toBe(false)
		expect(result.ok ? [] : result.issues).toContainEqual(expect.stringContaining('/latest'))
	})

	it('rejects provider hosts outside the allowlist', () => {
		const result = validateRuntimeBinaryManifestEntry({...baseEntry, url: 'https://example.com/yt-dlp_linux'})
		expect(result.ok).toBe(false)
		expect(result.ok ? [] : result.issues).toContainEqual(expect.stringContaining('yt-dlp release'))
	})

	it('accepts every yt-dlp release location the generator publishes', () => {
		for (const [provider, url] of [
			['github', 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.10/yt-dlp_linux'],
			['github', 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux'],
			['sourceforge', 'https://sourceforge.net/projects/yt-dlp.mirror/files/2026.06.10/yt-dlp_linux/download'],
			['sourceforge', 'https://downloads.sourceforge.net/project/yt-dlp.mirror/2026.06.10/yt-dlp_linux']
		] as const) {
			expect(validateRuntimeBinaryManifestEntry({...baseEntry, provider, url}).ok, url).toBe(true)
		}
	})

	// The host alone is not an approval: anyone can publish a GitHub release or a
	// SourceForge project.
	it('rejects allowlisted hosts outside the yt-dlp release paths', () => {
		for (const [provider, url] of [
			['github', 'https://github.com/someone/yt-dlp/releases/download/2026.06.10/yt-dlp_linux'],
			['github', 'https://github.com/yt-dlp/yt-dlp/raw/master/yt-dlp_linux'],
			['github', 'https://github.com/yt-dlp/yt-dlp/releases/download/'],
			['github', 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.10'],
			['github', 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/'],
			['sourceforge', 'https://downloads.sourceforge.net/project/yt-dlp.mirror/2026.06.10'],
			['github', 'https://github.com/yt-dlp/yt-dlp/releases/download/../../../someone/evil/releases/download/x/yt-dlp_linux'],
			['sourceforge', 'https://sourceforge.net/projects/not-yt-dlp/files/2026.06.10/yt-dlp_linux/download'],
			['sourceforge', 'https://downloads.sourceforge.net/project/not-yt-dlp/2026.06.10/yt-dlp_linux']
		] as const) {
			const result = validateRuntimeBinaryManifestEntry({...baseEntry, provider, url})
			expect(result.ok ? [] : result.issues, url).toContainEqual(expect.stringContaining('yt-dlp release'))
		}
		const mirrored = validateRuntimeBinaryManifestEntry({...baseEntry, mirrors: ['https://github.com/someone/fork/releases/download/x/yt-dlp_linux']})
		expect(mirrored.ok ? [] : mirrored.issues).toContainEqual(expect.stringContaining('someone/fork'))
	})

	it('rejects invalid hashes and empty size', () => {
		const result = validateRuntimeBinaryManifestEntry({...baseEntry, size: 0, sha256: 'deadbeef'})
		expect(result.ok).toBe(false)
		const issues = result.ok ? [] : result.issues.join('\n')
		expect(issues).toContain('Invalid string')
		expect(issues).toContain('Too small')
	})

	it('rejects unsafe executable paths', () => {
		const result = validateRuntimeBinaryManifestEntry({...baseEntry, executablePath: '../yt-dlp'})
		expect(result.ok).toBe(false)
		const issues = result.ok ? [] : result.issues.join('\n')
		expect(issues).toContain('executablePath')
	})

	it('filters entries for the current target without reordering manifest candidates', () => {
		const stable: RuntimeBinaryManifestEntry = {...baseEntry, channel: 'stable', version: '2026.06.10', sha256: 'b'.repeat(64), url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.10/yt-dlp_linux'}
		const index: RuntimeBinaryIndex = {schemaVersion: 2, generatedAt: '2026-06-12T00:00:00.000Z', entries: [baseEntry, stable, {...baseEntry, platform: 'darwin', sha256: 'c'.repeat(64)}]}
		expect(runtimeEntriesForCurrentTarget(index, 'yt-dlp', 'linux', 'x64')).toEqual([baseEntry, stable])
	})

	it('derives distinct cache keys for changed immutable artifact identities', () => {
		expect(runtimeBinaryCacheKey(baseEntry)).not.toBe(runtimeBinaryCacheKey({...baseEntry, sha256: 'b'.repeat(64)}))
	})

	it('validates a full index with semantic entry checks', () => {
		const result = validateRuntimeBinaryIndex({schemaVersion: 2, generatedAt: '2026-06-12T00:00:00.000Z', entries: [baseEntry]})
		expect(result.ok).toBe(true)
	})

	it('ships an immutable bundled fallback index: stable yt-dlp plus the pinned FFmpeg packages', () => {
		const result = validateRuntimeBinaryIndex(BUNDLED_RUNTIME_BINARY_INDEX)
		expect(result.ok ? result.value.entries : result.issues).toHaveLength(11)
		expect(result.ok).toBe(true)
		expect(BUNDLED_RUNTIME_BINARY_INDEX.entries.map(entry => `${entry.id}:${entry.platform}:${entry.arch}`)).toEqual([
			'yt-dlp:win32:x64',
			'yt-dlp:win32:arm64',
			'yt-dlp:darwin:x64',
			'yt-dlp:darwin:arm64',
			'yt-dlp:linux:x64',
			'yt-dlp:linux:arm64',
			'ffmpeg:win32:x64',
			'ffmpeg:darwin:x64',
			'ffmpeg:darwin:arm64',
			'ffmpeg:linux:x64',
			'ffmpeg:linux:arm64'
		])
		expect(BUNDLED_RUNTIME_BINARY_INDEX.entries.every(entry => entry.id === 'ffmpeg' || entry.channel === 'stable')).toBe(true)
		expect(BUNDLED_RUNTIME_BINARY_INDEX.entries.map(entry => entry.id)).not.toContain('deno')
		expect(BUNDLED_RUNTIME_BINARY_INDEX.entries.every(entry => !entry.url.includes('/latest/'))).toBe(true)
	})
})
