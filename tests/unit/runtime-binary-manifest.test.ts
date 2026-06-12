import {describe, expect, it} from 'vitest'
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
		expect(result.ok ? [] : result.issues).toContainEqual(expect.stringContaining('not allowlisted'))
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
		const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [baseEntry, stable, {...baseEntry, platform: 'darwin', sha256: 'c'.repeat(64)}]}
		expect(runtimeEntriesForCurrentTarget(index, 'yt-dlp', 'linux', 'x64')).toEqual([baseEntry, stable])
	})

	it('derives distinct cache keys for changed immutable artifact identities', () => {
		expect(runtimeBinaryCacheKey(baseEntry)).not.toBe(runtimeBinaryCacheKey({...baseEntry, sha256: 'b'.repeat(64)}))
	})

	it('validates a full index with semantic entry checks', () => {
		const result = validateRuntimeBinaryIndex({schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [baseEntry]})
		expect(result.ok).toBe(true)
	})
})
