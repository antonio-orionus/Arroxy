import {describe, expect, it} from 'vite-plus/test'
import {ffmpegPackageCacheKey, runtimeEntriesForCurrentTarget, validateRuntimeBinaryIndex, validateRuntimeBinaryIndexV1} from '@shared/runtimeBinaryManifest.js'
import type {FfmpegPackageEntry, RuntimeBinaryManifestEntry} from '@shared/types.js'

const ytDlp: RuntimeBinaryManifestEntry = {
	id: 'yt-dlp',
	channel: 'stable',
	provider: 'github',
	version: '2026.06.09',
	platform: 'win32',
	arch: 'x64',
	url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.09/yt-dlp.exe',
	mirrors: [],
	size: 123,
	sha256: 'a'.repeat(64),
	format: 'raw',
	executablePath: 'yt-dlp.exe'
}

const ffmpeg: FfmpegPackageEntry = {
	id: 'ffmpeg',
	version: 'N-126342-gf88b741dbf-20260831',
	platform: 'win32',
	arch: 'x64',
	url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-n126342-1/arroxy-ffmpeg-win32-x64.tar.br',
	mirrors: [],
	size: 42_310_337,
	sha256: 'b'.repeat(64),
	format: 'tar.br',
	ffmpegPath: 'ffmpeg.exe',
	ffprobePath: 'ffprobe.exe',
	files: [
		{path: 'ffmpeg.exe', size: 548_352},
		{path: 'ffprobe.exe', size: 227_328},
		{path: 'avcodec-63.dll', size: 98_877_440}
	],
	links: []
}

const linuxFfmpeg: FfmpegPackageEntry = {
	...ffmpeg,
	platform: 'linux',
	url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-n126342-1/arroxy-ffmpeg-linux-x64.tar.br',
	ffmpegPath: 'ffmpeg',
	ffprobePath: 'ffprobe',
	files: [
		{path: 'ffmpeg', size: 1},
		{path: 'ffprobe', size: 1},
		{path: 'libavcodec.so.63.8.101', size: 1}
	],
	links: [
		{path: 'libavcodec.so.63', target: 'libavcodec.so.63.8.101'},
		{path: 'libavcodec.so', target: 'libavcodec.so.63'}
	]
}

function index(entries: unknown[]): unknown {
	return {schemaVersion: 2, generatedAt: '2026-10-19T00:00:00.000Z', entries}
}

function issues(input: unknown): string {
	const result = validateRuntimeBinaryIndex(input)
	return result.ok ? '' : result.issues.join('\n')
}

describe('runtime binary index v2', () => {
	it('accepts yt-dlp executables and FFmpeg packages side by side', () => {
		const result = validateRuntimeBinaryIndex(index([ytDlp, ffmpeg, linuxFfmpeg]))
		expect(result.ok ? result.value.entries : result.issues).toEqual([ytDlp, ffmpeg, linuxFfmpeg])
	})

	it('skips entry kinds it does not know, so adding one later never breaks this client', () => {
		const result = validateRuntimeBinaryIndex(index([{id: 'some-future-tool', anything: true}, ytDlp]))
		expect(result.ok ? result.value.entries : result.issues).toEqual([ytDlp])
	})

	it('rejects a malformed entry of a known kind', () => {
		expect(issues(index([{...ffmpeg, size: 0}]))).toContain('entries[0]')
	})

	it('only trusts FFmpeg packages released from the Arroxy runtime repository', () => {
		expect(issues(index([{...ffmpeg, url: 'https://github.com/BtbN/FFmpeg-Builds/releases/download/x/ffmpeg.zip'}]))).toContain('arroxy-runtime-binaries')
		expect(issues(index([{...ffmpeg, url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/arroxy-ffmpeg-win32-x64.tar.br'}]))).toContain('/latest')
	})

	it('requires both executables to be regular files listed in the package', () => {
		expect(issues(index([{...ffmpeg, ffprobePath: 'missing.exe'}]))).toContain('ffprobePath')
		expect(issues(index([{...linuxFfmpeg, ffmpegPath: 'libavcodec.so'}]))).toContain('ffmpegPath')
	})

	it('rejects unsafe or duplicate package paths', () => {
		expect(issues(index([{...ffmpeg, files: [...ffmpeg.files, {path: '../evil.dll', size: 1}]}]))).toContain('../evil.dll')
		expect(issues(index([{...ffmpeg, files: [...ffmpeg.files, {path: 'ffmpeg.exe', size: 1}]}]))).toContain('duplicate')
	})

	it('only allows links that resolve to a file inside the package', () => {
		expect(issues(index([{...linuxFfmpeg, links: [{path: 'libx.so', target: '/usr/lib/libx.so'}]}]))).toContain('libx.so')
		expect(issues(index([{...linuxFfmpeg, links: [{path: 'libx.so', target: '../outside.so'}]}]))).toContain('libx.so')
		expect(issues(index([{...linuxFfmpeg, links: [{path: 'libx.so', target: 'not-listed.so'}]}]))).toContain('libx.so')
		expect(
			issues(
				index([
					{
						...linuxFfmpeg,
						links: [
							{path: 'a.so', target: 'b.so'},
							{path: 'b.so', target: 'a.so'}
						]
					}
				])
			)
		).toContain('a.so')
	})

	it('filters FFmpeg packages for the current target', () => {
		const result = validateRuntimeBinaryIndex(index([ytDlp, ffmpeg, linuxFfmpeg]))
		if (!result.ok) throw new Error(result.issues.join('\n'))
		expect(runtimeEntriesForCurrentTarget(result.value, 'ffmpeg', 'linux', 'x64')).toEqual([linuxFfmpeg])
		expect(runtimeEntriesForCurrentTarget(result.value, 'yt-dlp', 'win32', 'x64')).toEqual([ytDlp])
	})

	it('derives distinct cache keys per approved package identity', () => {
		expect(ffmpegPackageCacheKey(ffmpeg)).not.toBe(ffmpegPackageCacheKey({...ffmpeg, sha256: 'c'.repeat(64)}))
		expect(ffmpegPackageCacheKey(ffmpeg)).not.toBe(ffmpegPackageCacheKey({...ffmpeg, version: 'other'}))
	})
})

describe('runtime binary index v1 (read by Arroxy 0.6.2 and earlier)', () => {
	it('still accepts yt-dlp-only indexes', () => {
		expect(validateRuntimeBinaryIndexV1({schemaVersion: 1, generatedAt: '2026-10-19T00:00:00.000Z', entries: [ytDlp]}).ok).toBe(true)
	})

	it('rejects the whole index when it carries an FFmpeg package, which is why FFmpeg lives only in v2', () => {
		expect(validateRuntimeBinaryIndexV1({schemaVersion: 1, generatedAt: '2026-10-19T00:00:00.000Z', entries: [ytDlp, ffmpeg]}).ok).toBe(false)
	})
})
