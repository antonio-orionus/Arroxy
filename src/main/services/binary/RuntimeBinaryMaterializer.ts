import {createHash} from 'node:crypto'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {Transform} from 'node:stream'
import {pipeline} from 'node:stream/promises'
import {createInflateRaw} from 'node:zlib'
import log from 'electron-log/main.js'
import * as yauzl from 'yauzl'
import {normalizeRuntimeExecutablePath, runtimeBinaryCacheKey} from '@shared/runtimeBinaryManifest.js'
import type {RuntimeBinaryManifestEntry} from '@shared/types.js'
import {DownloadIntegrityError, DownloadSizeMismatchError, DownloadStalledError, copyCachedArtifactToFile, downloadArtifactToCache, sha256ForFile, type CachedArtifactResult, type DownloadProgressCallback} from './BinaryDownloader.js'

export type ArtifactErrorCode = 'UNSUPPORTED_PLATFORM' | 'NETWORK' | 'TIMEOUT' | 'CANCELLED' | 'CHECKSUM' | 'SIZE_MISMATCH' | 'EXTRACTION' | 'ARCHIVE_SECURITY' | 'EXECUTABLE_MISSING' | 'PERMISSION' | 'DISK' | 'LOCK' | 'INTERNAL'

export class ArtifactMaterializeError extends Error {
	constructor(
		readonly code: ArtifactErrorCode,
		message: string,
		readonly cause?: unknown
	) {
		super(message)
		this.name = 'ArtifactMaterializeError'
	}
}

export interface RuntimeBinaryMaterializeOptions {
	cacheRoot: string
	signal?: AbortSignal
	onDownloadProgress?: DownloadProgressCallback
	onExtracting?: () => void
	lockTimeoutMs?: number
}

export interface RuntimeBinaryMaterializeResult {
	executablePath: string
	cacheKey: string
	metadataPath: string
	manifest: RuntimeBinaryManifestEntry
}

export interface RuntimeBinaryInstallMetadata {
	cacheKey: string
	manifest: RuntimeBinaryManifestEntry
	manifestHash: string
	executablePath: string
	executableSize: number
	executableSha256: string
	installedAt: string
}

const LOCK_POLL_MS = 200
const DEFAULT_LOCK_TIMEOUT_MS = 120_000
const OWNERLESS_LOCK_STALE_MS = 5_000
const MAX_ZIP_ENTRIES = 4096
const MAX_EXTRACTED_BYTES = 512 * 1024 * 1024
const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50
const ZIP_LOCAL_FILE_HEADER_SIZE = 30
const ZIP_COMPRESSION_STORED = 0
const ZIP_COMPRESSION_DEFLATED = 8
const ZIP_UNIX_MODE_MASK = 0o170000
const ZIP_UNIX_SYMLINK = 0o120000
const ZIP_UNIX_REGULAR = 0o100000

const logger = log.scope('runtime-binary-materializer')

interface LockOwner {
	pid: number
	createdAt?: string
}

export function runtimeBinaryManifestHash(entry: RuntimeBinaryManifestEntry): string {
	return createHash('sha256').update(JSON.stringify(entry)).digest('hex')
}

export function runtimeBinaryCacheKeyHash(entry: RuntimeBinaryManifestEntry): string {
	return createHash('sha256').update(runtimeBinaryCacheKey(entry)).digest('hex')
}

function abortError(signal: AbortSignal | undefined): ArtifactMaterializeError {
	const message = signal?.reason instanceof Error ? signal.reason.message : 'Cancelled'
	return new ArtifactMaterializeError('CANCELLED', message, signal?.reason)
}

function parseLockOwner(raw: string): LockOwner | null {
	try {
		const parsed = JSON.parse(raw) as Partial<LockOwner>
		const pid = parsed.pid
		if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) return null
		return {pid, createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : undefined}
	} catch {
		return null
	}
}

function processExists(pid: number): boolean {
	try {
		process.kill(pid, 0)
		return true
	} catch (err) {
		const code = (err as NodeJS.ErrnoException).code
		return code !== 'ESRCH'
	}
}

async function ownerlessLockIsOld(lockDir: string): Promise<boolean> {
	try {
		const stat = await fsPromises.stat(lockDir)
		return Date.now() - stat.mtimeMs > OWNERLESS_LOCK_STALE_MS
	} catch {
		return true
	}
}

async function staleLockReason(lockDir: string): Promise<string | null> {
	const ownerPath = path.join(lockDir, 'owner.json')
	try {
		const owner = parseLockOwner(await fsPromises.readFile(ownerPath, 'utf8'))
		if (!owner) return (await ownerlessLockIsOld(lockDir)) ? 'invalid-owner' : null
		return processExists(owner.pid) ? null : `dead-owner:${owner.pid}`
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') return (await ownerlessLockIsOld(lockDir)) ? 'missing-owner' : null
		throw err
	}
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(abortError(signal))
			return
		}
		const timer = setTimeout(resolve, ms)
		const abort = (): void => {
			clearTimeout(timer)
			reject(abortError(signal))
		}
		signal?.addEventListener('abort', abort, {once: true})
	})
}

function pathInside(root: string, target: string): boolean {
	const relative = path.relative(root, target)
	return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function zipEntryUnixKind(entry: yauzl.Entry): number {
	return (entry.externalFileAttributes >>> 16) & ZIP_UNIX_MODE_MASK
}

function zipEntryIsSymlink(entry: yauzl.Entry): boolean {
	return zipEntryUnixKind(entry) === ZIP_UNIX_SYMLINK
}

function zipEntryIsFile(entry: yauzl.Entry): boolean {
	if (entry.fileName.endsWith('/')) return false
	const kind = zipEntryUnixKind(entry)
	return kind === 0 || kind === ZIP_UNIX_REGULAR
}

function normalizeZipEntryName(fileName: string): string | null {
	return normalizeRuntimeExecutablePath(fileName)
}

function openZip(zipPath: string): Promise<yauzl.ZipFile> {
	return new Promise((resolve, reject) => {
		yauzl.open(zipPath, {lazyEntries: true, validateEntrySizes: true}, (err, zipFile) => {
			if (err) {
				reject(err)
				return
			}
			resolve(zipFile)
		})
	})
}

async function assertRegularExecutable(executablePath: string): Promise<void> {
	const stat = await fsPromises.lstat(executablePath)
	if (!stat.isFile()) throw new ArtifactMaterializeError('EXECUTABLE_MISSING', `Materialized executable is not a regular file: ${executablePath}`)
}

function countBytes(onBytes: (bytes: number) => void): Transform {
	return new Transform({
		transform(chunk: Buffer, _encoding, callback) {
			onBytes(chunk.length)
			callback(null, chunk)
		}
	})
}

async function zipEntryDataStart(archivePath: string, entry: yauzl.Entry): Promise<number> {
	const handle = await fsPromises.open(archivePath, 'r')
	try {
		const header = Buffer.alloc(ZIP_LOCAL_FILE_HEADER_SIZE)
		await handle.read(header, 0, header.length, entry.relativeOffsetOfLocalHeader)
		if (header.readUInt32LE(0) !== ZIP_LOCAL_FILE_HEADER_SIGNATURE) {
			throw new ArtifactMaterializeError('EXTRACTION', `Invalid ZIP local header for ${entry.fileName}`)
		}
		return entry.relativeOffsetOfLocalHeader + ZIP_LOCAL_FILE_HEADER_SIZE + header.readUInt16LE(26) + header.readUInt16LE(28)
	} finally {
		await handle.close()
	}
}

async function extractZipEntryToFile(archivePath: string, entry: yauzl.Entry, destination: string): Promise<number> {
	const dataStart = await zipEntryDataStart(archivePath, entry)
	const compressedStream = fs.createReadStream(archivePath, {start: dataStart, end: dataStart + entry.compressedSize - 1})
	let bytes = 0
	const counter = countBytes(chunkBytes => {
		bytes += chunkBytes
	})

	switch (entry.compressionMethod) {
		case ZIP_COMPRESSION_STORED:
			await pipeline(compressedStream, counter, fs.createWriteStream(destination, {mode: 0o755}))
			break
		case ZIP_COMPRESSION_DEFLATED:
			await pipeline(compressedStream, createInflateRaw(), counter, fs.createWriteStream(destination, {mode: 0o755}))
			break
		default:
			throw new ArtifactMaterializeError('EXTRACTION', `Unsupported ZIP compression method ${entry.compressionMethod} for ${entry.fileName}`)
	}

	if (bytes !== entry.uncompressedSize) {
		throw new ArtifactMaterializeError('EXTRACTION', `ZIP entry size mismatch for ${entry.fileName}: expected ${entry.uncompressedSize}, extracted ${bytes}`)
	}
	return bytes
}

export function artifactErrorToDependencyFailureKind(err: unknown): 'download_failed' | 'extract_failed' | 'hash_failed' | 'spawn_failed' | 'permission_denied' | 'blocked_or_quarantined' | 'bad_exit_code' | 'timeout' | 'pair_incomplete' {
	if (!(err instanceof ArtifactMaterializeError)) return 'download_failed'
	switch (err.code) {
		case 'CHECKSUM':
		case 'SIZE_MISMATCH':
			return 'hash_failed'
		case 'EXTRACTION':
		case 'ARCHIVE_SECURITY':
		case 'EXECUTABLE_MISSING':
			return 'extract_failed'
		case 'PERMISSION':
			return 'permission_denied'
		case 'TIMEOUT':
		case 'LOCK':
			return 'timeout'
		case 'CANCELLED':
		case 'NETWORK':
		case 'DISK':
		case 'UNSUPPORTED_PLATFORM':
		case 'INTERNAL':
			return 'download_failed'
	}
}

export class RuntimeBinaryMaterializer {
	async materialize(entry: RuntimeBinaryManifestEntry, options: RuntimeBinaryMaterializeOptions): Promise<RuntimeBinaryMaterializeResult> {
		const executablePath = normalizeRuntimeExecutablePath(entry.executablePath)
		if (!executablePath) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unsafe executable path: ${entry.executablePath}`)
		const cacheKey = runtimeBinaryCacheKeyHash(entry)
		const finalDir = path.join(options.cacheRoot, 'artifacts', cacheKey)
		const metadataPath = path.join(finalDir, 'metadata.json')
		const finalExecutablePath = path.join(finalDir, executablePath)

		await fsPromises.mkdir(options.cacheRoot, {recursive: true})
		return this.withLock(options.cacheRoot, cacheKey, options.signal, options.lockTimeoutMs, async () => {
			if (await this.existingInstall(entry, cacheKey, metadataPath, finalExecutablePath)) {
				return {executablePath: finalExecutablePath, cacheKey, metadataPath, manifest: entry}
			}

			const tempDir = await fsPromises.mkdtemp(path.join(options.cacheRoot, 'stage-'))
			try {
				const archivePath = path.join(tempDir, `download-${entry.id}`)
				const artifact = await this.downloadVerified(entry, cacheKey, options)
				options.onExtracting?.()
				try {
					await copyCachedArtifactToFile(artifact.cacheRoot, artifact.key, archivePath, {integrity: artifact.integrity, size: entry.size})
				} catch (err) {
					throw this.toArtifactError(entry, err, options.signal)
				}
				const stageDir = path.join(tempDir, 'install')
				await fsPromises.mkdir(stageDir, {recursive: true})
				await this.stage(entry, archivePath, stageDir)
				const stagedExecutablePath = path.join(stageDir, executablePath)
				await assertRegularExecutable(stagedExecutablePath)
				if (process.platform !== 'win32') await fsPromises.chmod(stagedExecutablePath, 0o755)
				const [executableStat, executableSha256] = await Promise.all([fsPromises.stat(stagedExecutablePath), sha256ForFile(stagedExecutablePath)])

				const metadata: RuntimeBinaryInstallMetadata = {cacheKey, manifest: entry, manifestHash: runtimeBinaryManifestHash(entry), executablePath, executableSize: executableStat.size, executableSha256, installedAt: new Date().toISOString()}
				await fsPromises.writeFile(path.join(stageDir, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
				await fsPromises.mkdir(path.dirname(finalDir), {recursive: true})
				await fsPromises.rm(finalDir, {recursive: true, force: true})
				await fsPromises.rename(stageDir, finalDir)
				return {executablePath: finalExecutablePath, cacheKey, metadataPath, manifest: entry}
			} catch (err) {
				if (err instanceof ArtifactMaterializeError) throw err
				throw new ArtifactMaterializeError('INTERNAL', err instanceof Error ? err.message : String(err), err)
			} finally {
				await fsPromises.rm(tempDir, {recursive: true, force: true})
			}
		})
	}

	private async existingInstall(entry: RuntimeBinaryManifestEntry, cacheKey: string, metadataPath: string, executablePath: string): Promise<boolean> {
		try {
			const [metadataRaw, stat] = await Promise.all([fsPromises.readFile(metadataPath, 'utf8'), fsPromises.lstat(executablePath)])
			const metadata = JSON.parse(metadataRaw) as Partial<RuntimeBinaryInstallMetadata>
			if (metadata.cacheKey !== cacheKey || metadata.manifestHash !== runtimeBinaryManifestHash(entry) || metadata.executablePath !== normalizeRuntimeExecutablePath(entry.executablePath)) return false
			if (!stat.isFile() || stat.size !== metadata.executableSize || typeof metadata.executableSha256 !== 'string') return false
			if (process.platform !== 'win32') await fsPromises.access(executablePath, fs.constants.X_OK)
			return (await sha256ForFile(executablePath)) === metadata.executableSha256
		} catch {
			return false
		}
	}

	private async withLock<T>(cacheRoot: string, cacheKey: string, signal: AbortSignal | undefined, lockTimeoutMs: number | undefined, run: () => Promise<T>): Promise<T> {
		const lockDir = path.join(cacheRoot, 'locks', cacheKey)
		const startedAt = Date.now()
		await fsPromises.mkdir(path.dirname(lockDir), {recursive: true})
		while (true) {
			if (signal?.aborted) throw abortError(signal)
			try {
				await fsPromises.mkdir(lockDir)
				await fsPromises.writeFile(path.join(lockDir, 'owner.json'), JSON.stringify({pid: process.pid, createdAt: new Date().toISOString()}))
				break
			} catch (err) {
				if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw new ArtifactMaterializeError('LOCK', `Could not acquire artifact lock: ${String(err)}`, err)
				const reason = await staleLockReason(lockDir)
				if (reason) {
					logger.warn('Removing stale artifact lock', {cacheKey, reason})
					await fsPromises.rm(lockDir, {recursive: true, force: true})
					continue
				}
				if (Date.now() - startedAt > (lockTimeoutMs ?? DEFAULT_LOCK_TIMEOUT_MS)) throw new ArtifactMaterializeError('LOCK', `Timed out waiting for artifact lock ${cacheKey}`)
				await delay(LOCK_POLL_MS, signal)
			}
		}

		try {
			return await run()
		} finally {
			await fsPromises.rm(lockDir, {recursive: true, force: true})
		}
	}

	private async downloadVerified(entry: RuntimeBinaryManifestEntry, cacheKey: string, options: RuntimeBinaryMaterializeOptions): Promise<CachedArtifactResult> {
		try {
			return await downloadArtifactToCache({
				urls: [entry.url, ...entry.mirrors],
				cacheRoot: path.join(options.cacheRoot, 'blobs'),
				key: cacheKey,
				sha256: entry.sha256,
				size: entry.size,
				metadata: {id: entry.id, version: entry.version, provider: entry.provider, platform: entry.platform, arch: entry.arch},
				onProgress: options.onDownloadProgress,
				signal: options.signal
			})
		} catch (err) {
			throw this.toArtifactError(entry, err, options.signal)
		}
	}

	private toArtifactError(entry: RuntimeBinaryManifestEntry, err: unknown, signal?: AbortSignal): ArtifactMaterializeError {
		if (err instanceof ArtifactMaterializeError) return err
		if (signal?.aborted) return abortError(signal)
		if (err instanceof DownloadIntegrityError) return new ArtifactMaterializeError('CHECKSUM', `${entry.id} checksum mismatch`, err)
		if (err instanceof DownloadSizeMismatchError) return new ArtifactMaterializeError('SIZE_MISMATCH', `${entry.id} size mismatch. Expected ${entry.size}, got ${err.actualSize ?? 'unknown'}`, err)
		if (err instanceof DownloadStalledError) return new ArtifactMaterializeError('TIMEOUT', err.message, err)
		return new ArtifactMaterializeError('NETWORK', `All artifact URLs failed for ${entry.id}`, err)
	}

	private async stage(entry: RuntimeBinaryManifestEntry, archivePath: string, stageDir: string): Promise<void> {
		switch (entry.format) {
			case 'raw':
				return this.stageRaw(entry, archivePath, stageDir)
			case 'zip':
				return this.stageZip(entry, archivePath, stageDir)
		}
	}

	private async stageRaw(entry: RuntimeBinaryManifestEntry, archivePath: string, stageDir: string): Promise<void> {
		const executablePath = normalizeRuntimeExecutablePath(entry.executablePath)
		if (!executablePath) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unsafe executable path: ${entry.executablePath}`)
		const destination = path.join(stageDir, executablePath)
		if (!pathInside(stageDir, destination)) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Executable path escapes stage dir: ${entry.executablePath}`)
		await fsPromises.mkdir(path.dirname(destination), {recursive: true})
		await fsPromises.copyFile(archivePath, destination)
	}

	private async stageZip(entry: RuntimeBinaryManifestEntry, archivePath: string, stageDir: string): Promise<void> {
		const expectedPath = normalizeRuntimeExecutablePath(entry.executablePath)
		if (!expectedPath) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unsafe executable path: ${entry.executablePath}`)
		const zipFile = await openZip(archivePath)
		let entryCount = 0
		let extractedBytes = 0
		let found = false

		try {
			await new Promise<void>((resolve, reject) => {
				let settled = false
				const finish = (err?: unknown): void => {
					if (settled) return
					settled = true
					zipFile.close()
					if (err) reject(err)
					else resolve()
				}
				zipFile.once('error', finish)
				zipFile.once('end', () => finish(found ? undefined : new ArtifactMaterializeError('EXECUTABLE_MISSING', `Archive did not contain ${expectedPath}`)))
				zipFile.on('entry', (entryInfo: yauzl.Entry) => {
					void (async (): Promise<void> => {
						entryCount++
						if (entryCount > MAX_ZIP_ENTRIES) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Archive exceeded ${MAX_ZIP_ENTRIES} entries`)
						const normalized = normalizeZipEntryName(entryInfo.fileName)
						if (!normalized) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unsafe archive entry: ${entryInfo.fileName}`)
						if (zipEntryIsSymlink(entryInfo)) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Archive entry is a symlink: ${entryInfo.fileName}`)
						if (normalized !== expectedPath) {
							zipFile.readEntry()
							return
						}
						if (!zipEntryIsFile(entryInfo)) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Archive executable entry is not a regular file: ${entryInfo.fileName}`)
						extractedBytes += entryInfo.uncompressedSize
						if (extractedBytes > MAX_EXTRACTED_BYTES) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Archive extracted size exceeds ${MAX_EXTRACTED_BYTES}`)
						const destination = path.join(stageDir, expectedPath)
						if (!pathInside(stageDir, destination)) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Executable path escapes stage dir: ${expectedPath}`)
						await fsPromises.mkdir(path.dirname(destination), {recursive: true})
						await extractZipEntryToFile(archivePath, entryInfo, destination)
						found = true
						zipFile.readEntry()
					})().catch(finish)
				})
				zipFile.readEntry()
			})
		} catch (err) {
			if (err instanceof ArtifactMaterializeError) throw err
			throw new ArtifactMaterializeError('EXTRACTION', err instanceof Error ? err.message : String(err), err)
		}
	}
}
