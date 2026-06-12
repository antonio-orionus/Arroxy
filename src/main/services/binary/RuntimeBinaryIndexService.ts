import {verify as verifySignature} from 'node:crypto'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import log from 'electron-log/main.js'
import {runtimeBinaryCacheKey, runtimeEntriesForCurrentTarget, validateRuntimeBinaryIndex} from '@shared/runtimeBinaryManifest.js'
import type {RuntimeBinaryId, RuntimeBinaryIndex, RuntimeBinaryManifestEntry} from '@shared/types.js'
import {downloadText} from './BinaryDownloader.js'
import {BUNDLED_RUNTIME_BINARY_INDEX} from './BundledRuntimeBinaryIndex.js'
import {RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM, RUNTIME_BINARY_INDEX_SIGNATURE_URL, RUNTIME_BINARY_INDEX_URL} from './RuntimeBinaryTrust.js'

const logger = log.scope('runtime-binary-index')

type FetchText = (url: string, signal?: AbortSignal) => Promise<string>

interface LoadedIndexes {
	primary: RuntimeBinaryIndex
	fallbacks: RuntimeBinaryIndex[]
	source: 'local' | 'remote' | 'last-known-good' | 'bundled'
}

export interface RuntimeBinaryIndexProvider {
	candidatesFor(id: RuntimeBinaryId, signal?: AbortSignal): Promise<RuntimeBinaryManifestEntry[]>
}

export interface RuntimeBinaryIndexServiceOptions {
	localIndexPath?: string | null
	localSignaturePath?: string | null
	localPublicKeyPath?: string | null
	remoteIndexUrl?: string | null
	remoteSignatureUrl?: string | null
	publicKeyPem?: string
	bundledIndex?: RuntimeBinaryIndex
	fetchText?: FetchText
}

function envUrl(name: string, fallback: string): string | null {
	const raw = process.env[name]?.trim()
	if (raw === 'off' || raw === '0') return null
	return raw && raw.length > 0 ? raw : fallback
}

function envPath(name: string): string | null {
	const raw = process.env[name]?.trim()
	return raw && raw.length > 0 ? raw : null
}

function parseSignedIndex(raw: string): RuntimeBinaryIndex {
	const parsed = JSON.parse(raw) as unknown
	const validation = validateRuntimeBinaryIndex(parsed)
	if (!validation.ok) throw new Error(`Runtime binary index validation failed: ${validation.issues.join('; ')}`)
	return validation.value
}

export function verifyRuntimeBinaryIndexSignature(payload: string, signatureBase64: string, publicKeyPem: string): boolean {
	const signature = Buffer.from(signatureBase64.trim(), 'base64')
	return verifySignature(null, Buffer.from(payload), publicKeyPem, signature)
}

export class RuntimeBinaryIndexService implements RuntimeBinaryIndexProvider {
	private readonly manifestDir: string
	private readonly localIndexPath: string | null
	private readonly localSignaturePath: string | null
	private readonly localPublicKeyPath: string | null
	private readonly remoteIndexUrl: string | null
	private readonly remoteSignatureUrl: string | null
	private readonly publicKeyPem: string
	private readonly bundledIndex: RuntimeBinaryIndex
	private readonly fetchText: FetchText
	private loaded: Promise<LoadedIndexes> | null = null

	constructor(userDataPath: string, options: RuntimeBinaryIndexServiceOptions = {}) {
		this.manifestDir = path.join(userDataPath, 'runtime-cache', 'manifests')
		this.localIndexPath = options.localIndexPath === undefined ? envPath('ARROXY_RUNTIME_INDEX_FILE') : options.localIndexPath
		this.localSignaturePath = options.localSignaturePath === undefined ? envPath('ARROXY_RUNTIME_INDEX_SIG_FILE') : options.localSignaturePath
		this.localPublicKeyPath = options.localPublicKeyPath === undefined ? envPath('ARROXY_RUNTIME_INDEX_PUBLIC_KEY_FILE') : options.localPublicKeyPath
		this.remoteIndexUrl = options.remoteIndexUrl === undefined ? envUrl('ARROXY_RUNTIME_INDEX_URL', RUNTIME_BINARY_INDEX_URL) : options.remoteIndexUrl
		this.remoteSignatureUrl = options.remoteSignatureUrl === undefined ? envUrl('ARROXY_RUNTIME_INDEX_SIG_URL', RUNTIME_BINARY_INDEX_SIGNATURE_URL) : options.remoteSignatureUrl
		this.publicKeyPem = options.publicKeyPem ?? RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM
		this.bundledIndex = options.bundledIndex ?? BUNDLED_RUNTIME_BINARY_INDEX
		this.fetchText = options.fetchText ?? downloadText
	}

	async candidatesFor(id: RuntimeBinaryId, signal?: AbortSignal): Promise<RuntimeBinaryManifestEntry[]> {
		const loaded = await this.load(signal)
		const seen = new Set<string>()
		const candidates: RuntimeBinaryManifestEntry[] = []
		for (const index of [loaded.primary, ...loaded.fallbacks]) {
			for (const entry of runtimeEntriesForCurrentTarget(index, id)) {
				const key = runtimeBinaryCacheKey(entry)
				if (seen.has(key)) continue
				seen.add(key)
				candidates.push(entry)
			}
		}
		logger.debug('Runtime binary candidates loaded', {id, source: loaded.source, count: candidates.length})
		return candidates
	}

	private load(signal?: AbortSignal): Promise<LoadedIndexes> {
		this.loaded ??= this.loadFresh(signal)
		return this.loaded
	}

	private async loadFresh(signal?: AbortSignal): Promise<LoadedIndexes> {
		const previous = await this.readLastKnownGood()
		const local = await this.readLocal()
		if (local) return {primary: local.index, fallbacks: [previous?.index, this.bundledIndex].filter((index): index is RuntimeBinaryIndex => Boolean(index)), source: 'local'}
		const remote = await this.fetchRemote(signal)
		if (remote) {
			try {
				await this.writeLastKnownGood(remote.raw, remote.signature)
			} catch (err) {
				logger.warn('Failed to persist last-known-good runtime index', {error: err instanceof Error ? err.message : String(err)})
			}
			return {primary: remote.index, fallbacks: [previous?.index, this.bundledIndex].filter((index): index is RuntimeBinaryIndex => Boolean(index)), source: 'remote'}
		}
		if (previous) return {primary: previous.index, fallbacks: [this.bundledIndex], source: 'last-known-good'}
		return {primary: this.bundledIndex, fallbacks: [], source: 'bundled'}
	}

	private async fetchRemote(signal?: AbortSignal): Promise<{index: RuntimeBinaryIndex; raw: string; signature: string} | null> {
		if (!this.remoteIndexUrl || !this.remoteSignatureUrl) return null
		try {
			const [raw, signature] = await Promise.all([this.fetchText(this.remoteIndexUrl, signal), this.fetchText(this.remoteSignatureUrl, signal)])
			if (!verifyRuntimeBinaryIndexSignature(raw, signature, this.publicKeyPem)) throw new Error('Runtime binary index signature verification failed')
			return {index: parseSignedIndex(raw), raw, signature}
		} catch (err) {
			logger.warn('Remote runtime binary index unavailable', {error: err instanceof Error ? err.message : String(err)})
			return null
		}
	}

	private async readLocal(): Promise<{index: RuntimeBinaryIndex; raw: string; signature: string} | null> {
		if (!this.localIndexPath && !this.localSignaturePath) return null
		if (!this.localIndexPath || !this.localSignaturePath) {
			logger.warn('Local runtime binary index ignored because JSON and signature paths must both be set', {localIndexPath: this.localIndexPath, localSignaturePath: this.localSignaturePath})
			return null
		}
		try {
			const [raw, signature, publicKeyPem] = await Promise.all([fsPromises.readFile(this.localIndexPath, 'utf8'), fsPromises.readFile(this.localSignaturePath, 'utf8'), this.readLocalPublicKey()])
			if (!verifyRuntimeBinaryIndexSignature(raw, signature, publicKeyPem)) throw new Error('local runtime binary index signature verification failed')
			return {index: parseSignedIndex(raw), raw, signature}
		} catch (err) {
			logger.warn('Local runtime binary index unavailable', {error: err instanceof Error ? err.message : String(err), localIndexPath: this.localIndexPath})
			return null
		}
	}

	private async readLocalPublicKey(): Promise<string> {
		if (!this.localPublicKeyPath) return this.publicKeyPem
		return fsPromises.readFile(this.localPublicKeyPath, 'utf8')
	}

	private async readLastKnownGood(): Promise<{index: RuntimeBinaryIndex; raw: string; signature: string} | null> {
		try {
			const [raw, signature] = await Promise.all([fsPromises.readFile(path.join(this.manifestDir, 'runtime-index-v1.json'), 'utf8'), fsPromises.readFile(path.join(this.manifestDir, 'runtime-index-v1.sig'), 'utf8')])
			if (!verifyRuntimeBinaryIndexSignature(raw, signature, this.publicKeyPem)) throw new Error('last-known-good signature verification failed')
			return {index: parseSignedIndex(raw), raw, signature}
		} catch (err) {
			logger.debug('Last-known-good runtime binary index unavailable', {error: err instanceof Error ? err.message : String(err)})
			return null
		}
	}

	private async writeLastKnownGood(raw: string, signature: string): Promise<void> {
		await fsPromises.mkdir(this.manifestDir, {recursive: true})
		const jsonPath = path.join(this.manifestDir, 'runtime-index-v1.json')
		const sigPath = path.join(this.manifestDir, 'runtime-index-v1.sig')
		await Promise.all([fsPromises.writeFile(`${jsonPath}.tmp`, raw), fsPromises.writeFile(`${sigPath}.tmp`, signature)])
		await Promise.all([fsPromises.rename(`${jsonPath}.tmp`, jsonPath), fsPromises.rename(`${sigPath}.tmp`, sigPath)])
	}
}
