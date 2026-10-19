import {verify as verifySignature} from 'node:crypto'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import log from 'electron-log/main.js'
import {ffmpegPackageCacheKey, readRuntimeBinaryIndex, runtimeBinaryCacheKey, runtimeEntriesForCurrentTarget} from '@shared/runtimeBinaryManifest.js'
import type {FfmpegPackageEntry, RuntimeBinaryId, RuntimeBinaryIndex, RuntimeBinaryIndexEntry, RuntimeBinaryManifestEntry} from '@shared/types.js'
import {downloadText} from './BinaryDownloader.js'
import {BUNDLED_RUNTIME_BINARY_INDEX} from './BundledRuntimeBinaryIndex.js'
import {RUNTIME_BINARY_INDEX_FILE_NAME, RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM, RUNTIME_BINARY_INDEX_SIGNATURE_FILE_NAME, RUNTIME_BINARY_INDEX_SIGNATURE_URL, RUNTIME_BINARY_INDEX_URL} from './RuntimeBinaryTrust.js'

const defaultLogger = log.scope('runtime-binary-index')

type FetchText = (url: string, signal?: AbortSignal) => Promise<string>
type LogFields = Record<string, unknown>

export interface RuntimeBinaryIndexLogger {
	debug(message: string, fields?: LogFields): void
	info(message: string, fields?: LogFields): void
	warn(message: string, fields?: LogFields): void
}

interface LoadedIndexes {
	primary: RuntimeBinaryIndex
	fallbacks: RuntimeBinaryIndex[]
	source: 'local' | 'remote' | 'last-known-good' | 'bundled'
}

export interface RuntimeBinaryIndexProvider {
	candidatesFor(id: RuntimeBinaryId, signal?: AbortSignal): Promise<RuntimeBinaryManifestEntry[]>
	ffmpegPackageCandidates(signal?: AbortSignal): Promise<FfmpegPackageEntry[]>
	// Forget the index this session settled on, so the next caller reads it again.
	invalidate(): void
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
	logger?: RuntimeBinaryIndexLogger
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

type IndexSource = Exclude<LoadedIndexes['source'], 'bundled'>

function parseSignedIndex(raw: string, source: IndexSource, logger: RuntimeBinaryIndexLogger): RuntimeBinaryIndex {
	const parsed = JSON.parse(raw) as unknown
	const read = readRuntimeBinaryIndex(parsed)
	for (const dropped of read.dropped) logger.warn('Runtime binary index entry dropped', {source, ...dropped})
	if (!read.ok) throw new Error(`Runtime binary index validation failed: ${read.issues.join('; ')}`)
	return read.value
}

function repoFromGitHubUrl(rawUrl: string | null): string | null {
	if (!rawUrl) return null
	try {
		const url = new URL(rawUrl)
		if (url.hostname !== 'github.com') return null
		const [owner, repo] = url.pathname.split('/').filter(Boolean)
		return owner && repo ? `${owner}/${repo}` : null
	} catch {
		return null
	}
}

function candidateSummary(entry: RuntimeBinaryIndexEntry): Record<string, string> {
	return entry.id === 'ffmpeg' ? {version: entry.version, platform: entry.platform, arch: entry.arch, format: entry.format} : {channel: entry.channel, provider: entry.provider, version: entry.version, platform: entry.platform, arch: entry.arch, format: entry.format}
}

function remoteIndexSourceFields(source: LoadedIndexes['source'], remoteIndexUrl: string | null): {indexUrl: string | null; sourceRepo: string | null} {
	if (source !== 'remote') return {indexUrl: null, sourceRepo: null}
	return {indexUrl: remoteIndexUrl, sourceRepo: repoFromGitHubUrl(remoteIndexUrl)}
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
	private readonly logger: RuntimeBinaryIndexLogger
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
		this.logger = options.logger ?? defaultLogger
	}

	async candidatesFor(id: RuntimeBinaryId, signal?: AbortSignal): Promise<RuntimeBinaryManifestEntry[]> {
		return this.collect(id, runtimeBinaryCacheKey, signal)
	}

	async ffmpegPackageCandidates(signal?: AbortSignal): Promise<FfmpegPackageEntry[]> {
		return this.collect('ffmpeg', ffmpegPackageCacheKey, signal)
	}

	// Entries for this machine from every loaded index, primary first, each
	// approved artifact once.
	private async collect<Id extends RuntimeBinaryIndexEntry['id']>(id: Id, cacheKey: (entry: Extract<RuntimeBinaryIndexEntry, {id: Id}>) => string, signal?: AbortSignal): Promise<Array<Extract<RuntimeBinaryIndexEntry, {id: Id}>>> {
		const loaded = await this.load(signal)
		const seen = new Set<string>()
		const candidates: Array<Extract<RuntimeBinaryIndexEntry, {id: Id}>> = []
		for (const index of [loaded.primary, ...loaded.fallbacks]) {
			for (const entry of runtimeEntriesForCurrentTarget(index, id)) {
				const key = cacheKey(entry)
				if (seen.has(key)) continue
				seen.add(key)
				candidates.push(entry)
			}
		}
		this.logger.debug('Runtime binary candidates loaded', {id, source: loaded.source, ...remoteIndexSourceFields(loaded.source, this.remoteIndexUrl), count: candidates.length, candidates: candidates.map(candidateSummary)})
		return candidates
	}

	invalidate(): void {
		this.loaded = null
	}

	// The settled index is kept for the session, fallbacks included, so an
	// offline machine does not pay a fetch timeout on every resolve; invalidate()
	// is what retries the network. A fallback picked because the first caller
	// cancelled says nothing about the network, so it is not kept.
	private load(signal?: AbortSignal): Promise<LoadedIndexes> {
		if (this.loaded) return this.loaded
		const loading = this.loadFresh(signal)
		this.loaded = loading
		const forgetIf = (keep: boolean): void => {
			if (!keep && this.loaded === loading) this.loaded = null
		}
		void loading.then(
			loaded => forgetIf(!signal?.aborted || loaded.source === 'remote' || loaded.source === 'local'),
			() => forgetIf(false)
		)
		return loading
	}

	private async loadFresh(signal?: AbortSignal): Promise<LoadedIndexes> {
		const [previous, local] = await Promise.all([this.readLastKnownGood(), this.readLocal()])
		if (local) return this.selectIndexes({primary: local.index, fallbacks: [previous?.index, this.bundledIndex].filter((index): index is RuntimeBinaryIndex => Boolean(index)), source: 'local'})
		const remote = await this.fetchRemote(signal)
		if (remote) {
			try {
				await this.writeLastKnownGood(remote.raw, remote.signature)
				this.logger.info('Persisted last-known-good runtime binary index', {manifestDir: this.manifestDir, generatedAt: remote.index.generatedAt, entryCount: remote.index.entries.length})
			} catch (err) {
				this.logger.warn('Failed to persist last-known-good runtime index', {manifestDir: this.manifestDir, generatedAt: remote.index.generatedAt, entryCount: remote.index.entries.length, error: err instanceof Error ? err.message : String(err)})
			}
			return this.selectIndexes({primary: remote.index, fallbacks: [previous?.index, this.bundledIndex].filter((index): index is RuntimeBinaryIndex => Boolean(index)), source: 'remote'})
		}
		if (previous) return this.selectIndexes({primary: previous.index, fallbacks: [this.bundledIndex], source: 'last-known-good'})
		return this.selectIndexes({primary: this.bundledIndex, fallbacks: [], source: 'bundled'})
	}

	private selectIndexes(loaded: LoadedIndexes): LoadedIndexes {
		this.logger.info('Runtime binary index selected', {source: loaded.source, generatedAt: loaded.primary.generatedAt, entryCount: loaded.primary.entries.length, fallbackCount: loaded.fallbacks.length})
		return loaded
	}

	private async fetchRemote(signal?: AbortSignal): Promise<{index: RuntimeBinaryIndex; raw: string; signature: string} | null> {
		if (!this.remoteIndexUrl || !this.remoteSignatureUrl) return null
		const startedAt = Date.now()
		try {
			const [raw, signature] = await Promise.all([this.fetchText(this.remoteIndexUrl, signal), this.fetchText(this.remoteSignatureUrl, signal)])
			if (!verifyRuntimeBinaryIndexSignature(raw, signature, this.publicKeyPem)) throw new Error('Runtime binary index signature verification failed')
			const index = parseSignedIndex(raw, 'remote', this.logger)
			this.logger.info('Remote runtime binary index verified', {indexUrl: this.remoteIndexUrl, signatureUrl: this.remoteSignatureUrl, sourceRepo: repoFromGitHubUrl(this.remoteIndexUrl), generatedAt: index.generatedAt, entryCount: index.entries.length, elapsedMs: Date.now() - startedAt})
			return {index, raw, signature}
		} catch (err) {
			this.logger.warn('Remote runtime binary index unavailable', {indexUrl: this.remoteIndexUrl, signatureUrl: this.remoteSignatureUrl, sourceRepo: repoFromGitHubUrl(this.remoteIndexUrl), error: err instanceof Error ? err.message : String(err)})
			return null
		}
	}

	private async readLocal(): Promise<{index: RuntimeBinaryIndex; raw: string; signature: string} | null> {
		if (!this.localIndexPath && !this.localSignaturePath) return null
		if (!this.localIndexPath || !this.localSignaturePath) {
			this.logger.warn('Local runtime binary index ignored because JSON and signature paths must both be set', {localIndexPath: this.localIndexPath, localSignaturePath: this.localSignaturePath})
			return null
		}
		try {
			const [raw, signature, publicKeyPem] = await Promise.all([fsPromises.readFile(this.localIndexPath, 'utf8'), fsPromises.readFile(this.localSignaturePath, 'utf8'), this.readLocalPublicKey()])
			if (!verifyRuntimeBinaryIndexSignature(raw, signature, publicKeyPem)) throw new Error('local runtime binary index signature verification failed')
			return {index: parseSignedIndex(raw, 'local', this.logger), raw, signature}
		} catch (err) {
			this.logger.warn('Local runtime binary index unavailable', {error: err instanceof Error ? err.message : String(err), localIndexPath: this.localIndexPath})
			return null
		}
	}

	private async readLocalPublicKey(): Promise<string> {
		if (!this.localPublicKeyPath) return this.publicKeyPem
		return fsPromises.readFile(this.localPublicKeyPath, 'utf8')
	}

	private async readLastKnownGood(): Promise<{index: RuntimeBinaryIndex; raw: string; signature: string} | null> {
		try {
			const [raw, signature] = await Promise.all([fsPromises.readFile(path.join(this.manifestDir, RUNTIME_BINARY_INDEX_FILE_NAME), 'utf8'), fsPromises.readFile(path.join(this.manifestDir, RUNTIME_BINARY_INDEX_SIGNATURE_FILE_NAME), 'utf8')])
			if (!verifyRuntimeBinaryIndexSignature(raw, signature, this.publicKeyPem)) throw new Error('last-known-good signature verification failed')
			return {index: parseSignedIndex(raw, 'last-known-good', this.logger), raw, signature}
		} catch (err) {
			this.logger.debug('Last-known-good runtime binary index unavailable', {error: err instanceof Error ? err.message : String(err)})
			return null
		}
	}

	private async writeLastKnownGood(raw: string, signature: string): Promise<void> {
		await fsPromises.mkdir(this.manifestDir, {recursive: true})
		const jsonPath = path.join(this.manifestDir, RUNTIME_BINARY_INDEX_FILE_NAME)
		const sigPath = path.join(this.manifestDir, RUNTIME_BINARY_INDEX_SIGNATURE_FILE_NAME)
		await Promise.all([fsPromises.writeFile(`${jsonPath}.tmp`, raw), fsPromises.writeFile(`${sigPath}.tmp`, signature)])
		await Promise.all([fsPromises.rename(`${jsonPath}.tmp`, jsonPath), fsPromises.rename(`${sigPath}.tmp`, sigPath)])
	}
}
