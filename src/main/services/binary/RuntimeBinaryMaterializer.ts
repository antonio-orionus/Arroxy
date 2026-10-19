import {createHash} from 'node:crypto'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {Transform} from 'node:stream'
import {pipeline} from 'node:stream/promises'
import {createInflateRaw} from 'node:zlib'
import * as yauzl from 'yauzl'
import {normalizeRuntimeExecutablePath, runtimeBinaryCacheKey} from '@shared/runtimeBinaryManifest.js'
import type {RuntimeBinaryManifestEntry} from '@shared/types.js'
import {ArtifactMaterializeError, downloadErrorToArtifactError, pathInside, withArtifactLock} from './ArtifactInstall.js'
import {copyCachedArtifactToFile, downloadArtifactToCache, sha256ForFile, type CachedArtifactResult, type DownloadProgressCallback} from './BinaryDownloader.js'

export interface RuntimeBinaryMaterializeOptions {
	cacheRoot: string
	signal?: AbortSignal
	// Called once a download actually begins, never for a reused install.
	onDownloadStart?: () => void
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

const MAX_ZIP_ENTRIES = 4096
const MAX_EXTRACTED_BYTES = 512 * 1024 * 1024
const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50
const ZIP_LOCAL_FILE_HEADER_SIZE = 30
const ZIP_COMPRESSION_STORED = 0
const ZIP_COMPRESSION_DEFLATED = 8
const ZIP_UNIX_MODE_MASK = 0o170000
const ZIP_UNIX_SYMLINK = 0o120000
const ZIP_UNIX_REGULAR = 0o100000

export function runtimeBinaryManifestHash(entry: RuntimeBinaryManifestEntry): string {
	return createHash('sha256').update(JSON.stringify(entry)).digest('hex')
}

export function runtimeBinaryCacheKeyHash(entry: RuntimeBinaryManifestEntry): string {
	return createHash('sha256').update(runtimeBinaryCacheKey(entry)).digest('hex')
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

export class RuntimeBinaryMaterializer {
	async materialize(entry: RuntimeBinaryManifestEntry, options: RuntimeBinaryMaterializeOptions): Promise<RuntimeBinaryMaterializeResult> {
		const executablePath = normalizeRuntimeExecutablePath(entry.executablePath)
		if (!executablePath) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unsafe executable path: ${entry.executablePath}`)
		const cacheKey = runtimeBinaryCacheKeyHash(entry)
		const finalDir = path.join(options.cacheRoot, 'artifacts', cacheKey)
		const metadataPath = path.join(finalDir, 'metadata.json')
		const finalExecutablePath = path.join(finalDir, executablePath)

		await fsPromises.mkdir(options.cacheRoot, {recursive: true})
		return withArtifactLock(options.cacheRoot, cacheKey, options.signal, options.lockTimeoutMs, async () => {
			if (await this.existingInstall(entry, cacheKey, metadataPath, finalExecutablePath)) {
				return {executablePath: finalExecutablePath, cacheKey, metadataPath, manifest: entry}
			}

			const tempDir = await fsPromises.mkdtemp(path.join(options.cacheRoot, 'stage-'))
			try {
				const archivePath = path.join(tempDir, `download-${entry.id}`)
				options.onDownloadStart?.()
				const artifact = await this.downloadVerified(entry, cacheKey, options)
				options.onExtracting?.()
				try {
					await copyCachedArtifactToFile(artifact.cacheRoot, artifact.key, archivePath, {integrity: artifact.integrity, size: entry.size})
				} catch (err) {
					throw downloadErrorToArtifactError(entry.id, entry.size, err, options.signal)
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
			throw downloadErrorToArtifactError(entry.id, entry.size, err, options.signal)
		}
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
