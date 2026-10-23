// The yt-dlp commit the message catalogue is built from
// (scripts/ytdlp-catalogue/pin.ts): the first yt-dlp entry of the signed runtime
// manifest, which is what the app tries first, resolved to the commit it was
// built from. Every network answer here is a fixture.

import {generateKeyPairSync, sign} from 'node:crypto'
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {resolvePin} from '../../scripts/ytdlp-catalogue/pin.js'

const {publicKey, privateKey} = generateKeyPairSync('ed25519')
const PUBLIC_KEY_PEM = publicKey.export({type: 'spki', format: 'pem'}).toString()
const COMMIT = '43a45ae37419b2a90db710c9fd06cd250ef524d3'
const TAG_OBJECT = 'c'.repeat(40)
const INDEX_URL = 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v2.json'
const SIG_URL = 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v2.sig'

function entry(channel: 'nightly' | 'stable', version: string) {
	const repo = channel === 'nightly' ? 'yt-dlp/yt-dlp-nightly-builds' : 'yt-dlp/yt-dlp'
	return {id: 'yt-dlp', channel, provider: 'github', version, platform: 'linux', arch: 'x64', url: `https://github.com/${repo}/releases/download/${version}/yt-dlp_linux`, mirrors: [], format: 'raw', executablePath: 'yt-dlp_linux', size: 1000, sha256: 'a'.repeat(64)}
}

function manifest(entries: unknown[]): string {
	return JSON.stringify({schemaVersion: 2, generatedAt: '2026-10-22T13:00:31.439Z', entries})
}

function signed(raw: string): string {
	return sign(null, Buffer.from(raw), privateKey).toString('base64')
}

// One fetch per URL; anything else is a failure the test should see.
function network(responses: Record<string, string>) {
	return async (url: string): Promise<string> => {
		const body = responses[url]
		if (body === undefined) throw new Error(`unexpected fetch ${url}`)
		return body
	}
}

const NIGHTLY_RELEASE = 'https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds/releases/tags/2026.10.21.233146'
const COMMIT_URL = `https://api.github.com/repos/yt-dlp/yt-dlp/commits/${COMMIT}`

function nightlyNetwork(overrides: Record<string, string> = {}) {
	const raw = manifest([entry('nightly', '2026.10.21.233146'), entry('stable', '2026.10.21')])
	return network({[INDEX_URL]: raw, [SIG_URL]: signed(raw), [NIGHTLY_RELEASE]: JSON.stringify({tag_name: '2026.10.21.233146', body: `Generated from: https://github.com/yt-dlp/yt-dlp/commit/${COMMIT}\n\n[![Installation]…`}), [COMMIT_URL]: JSON.stringify({sha: COMMIT}), ...overrides})
}

describe('resolvePin', () => {
	it('resolves the first yt-dlp entry, a nightly, to the commit its release names', async () => {
		await expect(resolvePin({fetchText: nightlyNetwork(), publicKeyPem: PUBLIC_KEY_PEM})).resolves.toEqual({commit: COMMIT, version: '2026.10.21.233146', channel: 'nightly', manifestGeneratedAt: '2026-10-22T13:00:31.439Z'})
	})

	it('refuses a manifest whose signature does not verify', async () => {
		const raw = manifest([entry('nightly', '2026.10.21.233146')])
		const fetchText = nightlyNetwork({[INDEX_URL]: raw, [SIG_URL]: signed(manifest([entry('nightly', '2026.10.20.000000')]))})
		await expect(resolvePin({fetchText, publicKeyPem: PUBLIC_KEY_PEM})).rejects.toThrow(/signature/)
	})

	it('refuses a nightly release that names no commit, or a commit yt-dlp does not have', async () => {
		await expect(resolvePin({fetchText: nightlyNetwork({[NIGHTLY_RELEASE]: JSON.stringify({tag_name: '2026.10.21.233146', body: 'Generated from: somewhere else'})}), publicKeyPem: PUBLIC_KEY_PEM})).rejects.toThrow(/commit/)
		await expect(resolvePin({fetchText: nightlyNetwork({[COMMIT_URL]: JSON.stringify({sha: 'd'.repeat(40)})}), publicKeyPem: PUBLIC_KEY_PEM})).rejects.toThrow(/commit/)
	})

	it('resolves a stable tag through its annotated tag object', async () => {
		const raw = manifest([entry('stable', '2026.10.21')])
		const fetchText = network({
			[INDEX_URL]: raw,
			[SIG_URL]: signed(raw),
			'https://api.github.com/repos/yt-dlp/yt-dlp/git/ref/tags/2026.10.21': JSON.stringify({object: {sha: TAG_OBJECT, type: 'tag'}}),
			[`https://api.github.com/repos/yt-dlp/yt-dlp/git/tags/${TAG_OBJECT}`]: JSON.stringify({object: {sha: COMMIT, type: 'commit'}})
		})
		await expect(resolvePin({fetchText, publicKeyPem: PUBLIC_KEY_PEM})).resolves.toMatchObject({commit: COMMIT, version: '2026.10.21', channel: 'stable'})
	})

	it('refuses a manifest with no yt-dlp entry', async () => {
		// Valid for this machine through its FFmpeg package alone.
		const ffmpeg: unknown = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../fixtures/ytdlp-catalogue/ffmpeg-linux-x64-entry.json'), 'utf8'))
		const raw = manifest([ffmpeg])
		await expect(resolvePin({fetchText: network({[INDEX_URL]: raw, [SIG_URL]: signed(raw)}), publicKeyPem: PUBLIC_KEY_PEM})).rejects.toThrow(/no yt-dlp entry/)
	})
})
