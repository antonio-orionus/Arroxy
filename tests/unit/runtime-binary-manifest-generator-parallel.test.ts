import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'

interface ArtifactDownloadOptions {
	urls: readonly string[]
	cacheRoot: string
	key: string
}

const mockRuntime = vi.hoisted(() => {
	const ytDlpShaByAsset = new Map([
		['yt-dlp.exe', '1'.repeat(64)],
		['yt-dlp_macos', '2'.repeat(64)],
		['yt-dlp_linux', '3'.repeat(64)],
		['yt-dlp_linux_aarch64', '4'.repeat(64)]
	])
	const ytDlpSums = [...ytDlpShaByAsset.entries()].map(([asset, sha]) => `${sha}  ${asset}`).join('\n')

	return {
		activeDownloads: 0,
		maxActiveDownloads: 0,
		downloadCalls: [] as string[],
		reset(): void {
			this.activeDownloads = 0
			this.maxActiveDownloads = 0
			this.downloadCalls = []
		},
		async downloadText(url: string): Promise<string> {
			if (url.includes('rss?path=/')) return '<rss><item><link>https://sourceforge.net/projects/yt-dlp.mirror/files/2026.06.09/</link></item></rss>'
			if (url.endsWith('/SHA2-256SUMS') || url.includes('/SHA2-256SUMS/download')) return ytDlpSums
			throw new Error(`Unexpected text download URL: ${url}`)
		},
		parseShaLine(content: string, filename: string): string | null {
			const line = content.split(/\r?\n/).find(candidate => candidate.trim().endsWith(filename))
			return /\b([a-f0-9]{64})\b/.exec(line ?? '')?.[1] ?? null
		},
		async downloadArtifactToCache(options: ArtifactDownloadOptions): Promise<{cacheRoot: string; key: string; integrity: string; size: number}> {
			const url = options.urls[0]
			if (!url) throw new Error('Expected artifact URL')
			this.downloadCalls.push(url)
			this.activeDownloads++
			this.maxActiveDownloads = Math.max(this.maxActiveDownloads, this.activeDownloads)
			await new Promise(resolve => setTimeout(resolve, 20))
			this.activeDownloads--
			return {cacheRoot: options.cacheRoot, key: options.key, integrity: 'sha256-test', size: url.length}
		}
	}
})

vi.mock('../../src/main/services/binary/BinaryDownloader.js', () => ({downloadArtifactToCache: mockRuntime.downloadArtifactToCache.bind(mockRuntime), downloadText: mockRuntime.downloadText.bind(mockRuntime), parseShaLine: mockRuntime.parseShaLine.bind(mockRuntime)}))

function releasePayload(channel: 'nightly' | 'stable'): Response {
	const version = channel === 'nightly' ? '2026.06.11.235628' : '2026.06.09'
	const repo = channel === 'nightly' ? 'yt-dlp-nightly-builds' : 'yt-dlp'
	const base = `https://github.com/yt-dlp/${repo}/releases/download/${version}`
	const assets = ['yt-dlp.exe', 'yt-dlp_macos', 'yt-dlp_linux', 'yt-dlp_linux_aarch64', 'SHA2-256SUMS'].map(name => ({name, browser_download_url: `${base}/${name}`, size: 1}))
	return new Response(JSON.stringify({tag_name: version, assets}), {status: 200})
}

function requestUrl(input: Parameters<typeof fetch>[0]): string {
	if (typeof input === 'string') return input
	if (input instanceof URL) return input.href
	return input.url
}

describe('runtime binary manifest generator parallel downloads', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('downloads every unique manifest artifact in parallel while preserving entry order', async () => {
		mockRuntime.reset()
		vi.resetModules()
		vi.stubGlobal(
			'fetch',
			vi.fn(async (input: Parameters<typeof fetch>[0]) => {
				const url = requestUrl(input)
				if (url.includes('yt-dlp-nightly-builds')) return releasePayload('nightly')
				if (url.includes('repos/yt-dlp/yt-dlp')) return releasePayload('stable')
				throw new Error(`Unexpected GitHub API URL: ${url}`)
			})
		)
		const cacheRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'runtime-manifest-parallel-'))

		try {
			const {generateRuntimeBinaryIndex} = await import('../../scripts/build/runtimeBinaryManifest.js')
			const index = await generateRuntimeBinaryIndex({cacheRoot})

			expect(index.entries).toHaveLength(18)
			expect(new Set(mockRuntime.downloadCalls)).toHaveLength(12)
			expect(mockRuntime.downloadCalls).toHaveLength(12)
			expect(mockRuntime.maxActiveDownloads).toBe(12)
			expect(index.entries.map(entry => `${entry.id}:${entry.provider}:${entry.channel}`)).toEqual([...Array.from({length: 6}, () => 'yt-dlp:github:nightly'), ...Array.from({length: 6}, () => 'yt-dlp:github:stable'), ...Array.from({length: 6}, () => 'yt-dlp:sourceforge:stable')])
		} finally {
			await fs.rm(cacheRoot, {recursive: true, force: true})
		}
	})
})
