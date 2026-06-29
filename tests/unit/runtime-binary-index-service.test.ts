import {generateKeyPairSync, sign} from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi} from 'vitest'
import {RuntimeBinaryIndexService, verifyRuntimeBinaryIndexSignature} from '@main/services/binary/RuntimeBinaryIndexService.js'
import {runtimeBinaryArchFor, runtimeBinaryPlatformFor} from '@shared/runtimeBinaryManifest.js'
import type {RuntimeBinaryIndex, RuntimeBinaryManifestEntry} from '@shared/types.js'

const currentPlatform = runtimeBinaryPlatformFor()
const currentArch = runtimeBinaryArchFor()
if (!currentPlatform || !currentArch) throw new Error(`Unsupported runtime binary test target: ${process.platform}/${process.arch}`)

const entry: RuntimeBinaryManifestEntry = {
	id: 'yt-dlp',
	channel: 'nightly',
	provider: 'github',
	version: '2026.06.12',
	platform: currentPlatform,
	arch: currentArch,
	url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux',
	mirrors: [],
	size: 10,
	sha256: 'a'.repeat(64),
	format: 'raw',
	executablePath: 'yt-dlp'
}

function keyPair(): {publicKeyPem: string; privateKeyPem: string} {
	const {publicKey, privateKey} = generateKeyPairSync('ed25519')
	return {publicKeyPem: publicKey.export({type: 'spki', format: 'pem'}).toString(), privateKeyPem: privateKey.export({type: 'pkcs8', format: 'pem'}).toString()}
}

function signed(index: RuntimeBinaryIndex, privateKeyPem: string): {raw: string; signature: string} {
	const raw = JSON.stringify(index)
	return {raw, signature: sign(null, Buffer.from(raw), privateKeyPem).toString('base64')}
}

async function tempDir(): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), 'runtime-index-'))
}

function makeLogger() {
	return {debug: vi.fn(), info: vi.fn(), warn: vi.fn()}
}

describe('RuntimeBinaryIndexService', () => {
	it('verifies Ed25519 signatures', () => {
		const keys = keyPair()
		const payload = JSON.stringify({ok: true})
		const signature = sign(null, Buffer.from(payload), keys.privateKeyPem).toString('base64')
		expect(verifyRuntimeBinaryIndexSignature(payload, signature, keys.publicKeyPem)).toBe(true)
		expect(verifyRuntimeBinaryIndexSignature(`${payload} `, signature, keys.publicKeyPem)).toBe(false)
	})

	it('loads a valid remote index and persists it as last-known-good', async () => {
		const keys = keyPair()
		const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [entry]}
		const payload = signed(index, keys.privateKeyPem)
		const userData = await tempDir()
		const logger = makeLogger()
		const remoteIndexUrl = 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v1.json'
		const remoteSignatureUrl = 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v1.sig'
		const svc = new RuntimeBinaryIndexService(userData, {publicKeyPem: keys.publicKeyPem, remoteIndexUrl, remoteSignatureUrl, bundledIndex: {...index, entries: [] as RuntimeBinaryManifestEntry[]}, fetchText: async url => (url.endsWith('.sig') ? payload.signature : payload.raw), logger})

		await expect(svc.candidatesFor('yt-dlp')).resolves.toEqual([entry])
		await expect(fs.readFile(path.join(userData, 'runtime-cache', 'manifests', 'runtime-index-v1.json'), 'utf8')).resolves.toBe(payload.raw)
		expect(logger.info).toHaveBeenCalledWith('Remote runtime binary index verified', {indexUrl: remoteIndexUrl, signatureUrl: remoteSignatureUrl, sourceRepo: 'antonio-orionus/arroxy-runtime-binaries', generatedAt: index.generatedAt, entryCount: 1, elapsedMs: expect.any(Number)})
		expect(logger.info).toHaveBeenCalledWith('Persisted last-known-good runtime binary index', {manifestDir: path.join(userData, 'runtime-cache', 'manifests'), generatedAt: index.generatedAt, entryCount: 1})
		expect(logger.info).toHaveBeenCalledWith('Runtime binary index selected', {source: 'remote', generatedAt: index.generatedAt, entryCount: 1, fallbackCount: 1})
		expect(logger.debug).toHaveBeenCalledWith('Runtime binary candidates loaded', {
			id: 'yt-dlp',
			source: 'remote',
			indexUrl: remoteIndexUrl,
			sourceRepo: 'antonio-orionus/arroxy-runtime-binaries',
			count: 1,
			candidates: [{channel: 'nightly', provider: 'github', version: '2026.06.12', platform: entry.platform, arch: entry.arch, format: 'raw'}]
		})
	})

	it('uses a verified remote index even when last-known-good persistence fails', async () => {
		const keys = keyPair()
		const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [entry]}
		const payload = signed(index, keys.privateKeyPem)
		const userData = await tempDir()
		await fs.writeFile(path.join(userData, 'runtime-cache'), 'not a directory')
		const svc = new RuntimeBinaryIndexService(userData, {
			publicKeyPem: keys.publicKeyPem,
			remoteIndexUrl: 'https://updates.example/runtime-index-v1.json',
			remoteSignatureUrl: 'https://updates.example/runtime-index-v1.sig',
			bundledIndex: {...index, entries: [] as RuntimeBinaryManifestEntry[]},
			fetchText: async url => (url.endsWith('.sig') ? payload.signature : payload.raw)
		})

		await expect(svc.candidatesFor('yt-dlp')).resolves.toEqual([entry])
	})

	it('loads a signed local index before remote or bundled fallbacks', async () => {
		const keys = keyPair()
		const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [entry]}
		const payload = signed(index, keys.privateKeyPem)
		const userData = await tempDir()
		const localDir = path.join(userData, 'local-manifest')
		await fs.mkdir(localDir, {recursive: true})
		const manifestPath = path.join(localDir, 'runtime-index-v1.json')
		const signaturePath = path.join(localDir, 'runtime-index-v1.sig')
		const publicKeyPath = path.join(localDir, 'runtime-index.public.pem')
		await Promise.all([fs.writeFile(manifestPath, payload.raw), fs.writeFile(signaturePath, payload.signature), fs.writeFile(publicKeyPath, keys.publicKeyPem)])
		const fetchText = vi.fn(async () => {
			throw new Error('remote should not be fetched')
		})
		const svc = new RuntimeBinaryIndexService(userData, {
			localIndexPath: manifestPath,
			localSignaturePath: signaturePath,
			localPublicKeyPath: publicKeyPath,
			remoteIndexUrl: 'https://updates.example/runtime-index-v1.json',
			remoteSignatureUrl: 'https://updates.example/runtime-index-v1.sig',
			bundledIndex: {...index, entries: [] as RuntimeBinaryManifestEntry[]},
			fetchText
		})

		await expect(svc.candidatesFor('yt-dlp')).resolves.toEqual([entry])
		expect(fetchText).not.toHaveBeenCalled()
	})

	it('rejects a tampered remote index and falls back to bundled entries', async () => {
		const keys = keyPair()
		const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [entry]}
		const payload = signed(index, keys.privateKeyPem)
		const bundled: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [{...entry, version: 'bundled', sha256: 'b'.repeat(64)}]}
		const logger = makeLogger()
		const svc = new RuntimeBinaryIndexService(await tempDir(), {
			publicKeyPem: keys.publicKeyPem,
			remoteIndexUrl: 'https://updates.example/runtime-index-v1.json',
			remoteSignatureUrl: 'https://updates.example/runtime-index-v1.sig',
			bundledIndex: bundled,
			fetchText: async url => (url.endsWith('.sig') ? payload.signature : JSON.stringify({...index, generatedAt: '2026-06-13T00:00:00.000Z'})),
			logger
		})

		await expect(svc.candidatesFor('yt-dlp')).resolves.toEqual(bundled.entries)
		expect(logger.warn).toHaveBeenCalledWith('Remote runtime binary index unavailable', {indexUrl: 'https://updates.example/runtime-index-v1.json', signatureUrl: 'https://updates.example/runtime-index-v1.sig', sourceRepo: null, error: 'Runtime binary index signature verification failed'})
		expect(logger.info).toHaveBeenCalledWith('Runtime binary index selected', {source: 'bundled', generatedAt: bundled.generatedAt, entryCount: 1, fallbackCount: 0})
		expect(logger.debug).toHaveBeenCalledWith('Runtime binary candidates loaded', expect.objectContaining({source: 'bundled', indexUrl: null, sourceRepo: null}))
	})

	it('uses last-known-good when remote fetch fails', async () => {
		const keys = keyPair()
		const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: '2026-06-12T00:00:00.000Z', entries: [entry]}
		const payload = signed(index, keys.privateKeyPem)
		const userData = await tempDir()
		const manifestDir = path.join(userData, 'runtime-cache', 'manifests')
		await fs.mkdir(manifestDir, {recursive: true})
		await fs.writeFile(path.join(manifestDir, 'runtime-index-v1.json'), payload.raw)
		await fs.writeFile(path.join(manifestDir, 'runtime-index-v1.sig'), payload.signature)
		const svc = new RuntimeBinaryIndexService(userData, {
			publicKeyPem: keys.publicKeyPem,
			remoteIndexUrl: 'https://updates.example/runtime-index-v1.json',
			remoteSignatureUrl: 'https://updates.example/runtime-index-v1.sig',
			bundledIndex: {...index, entries: [] as RuntimeBinaryManifestEntry[]},
			fetchText: async () => {
				throw new Error('offline')
			}
		})

		await expect(svc.candidatesFor('yt-dlp')).resolves.toEqual([entry])
	})
})
