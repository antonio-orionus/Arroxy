import {createHash} from 'node:crypto'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {pipeline} from 'node:stream/promises'
import {constants as zlibConstants, createBrotliDecompress} from 'node:zlib'
import log from 'electron-log/main.js'
import tarStream from 'tar-stream'
import {ffmpegPackageCacheKey, normalizeRuntimeExecutablePath} from '@shared/runtimeBinaryManifest.js'
import type {FfmpegPackageEntry} from '@shared/types.js'
import {abortError, ArtifactMaterializeError, downloadErrorToArtifactError, pathInside, withArtifactLock} from './ArtifactInstall.js'
import {downloadArtifactToCache, readCachedArtifact, removeCachedArtifact, type CachedArtifactResult, type DownloadProgressCallback} from './BinaryDownloader.js'

export interface FfmpegPackageMaterializeOptions {
	cacheRoot: string
	signal?: AbortSignal
	onDownloadProgress?: DownloadProgressCallback
	onExtracting?: () => void
	lockTimeoutMs?: number
}

export interface FfmpegPackageInstall {
	entry: FfmpegPackageEntry
	cacheKey: string
	rootDir: string
	ffmpegPath: string
	ffprobePath: string
}

// The cache key covers the archive's SHA-256, so it fixes the package
// contents; URLs and mirrors may move without forcing a reinstall.
interface FfmpegPackageMetadata {
	cacheKey: string
	installedAt: string
}

// Each approved version installs into its own directory and is never written to
// again: a running ffmpeg keeps its DLLs locked on Windows, so replacing files
// in place could break a job mid-run or leave a half-updated install.
const PACKAGES_DIR = 'packages'
const METADATA_FILE = '.arroxy-package.json'
// The active version plus one previous one, so an approved rollback or an
// offline launch after a failed update still has a working install on disk.
const KEEP_PREVIOUS_VERSIONS = 1

const logger = log.scope('ffmpeg-package')

function sha256Text(value: string): string {
	return createHash('sha256').update(value).digest('hex')
}

function ffmpegPackageCacheKeyHash(entry: FfmpegPackageEntry): string {
	return sha256Text(ffmpegPackageCacheKey(entry))
}

function packageRelativePath(value: string): string {
	const normalized = normalizeRuntimeExecutablePath(value)
	if (!normalized) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unsafe package path: ${value}`)
	return normalized
}

function installFor(entry: FfmpegPackageEntry, cacheKey: string, rootDir: string): FfmpegPackageInstall {
	return {entry, cacheKey, rootDir, ffmpegPath: path.join(rootDir, packageRelativePath(entry.ffmpegPath)), ffprobePath: path.join(rootDir, packageRelativePath(entry.ffprobePath))}
}

function parseMetadata(raw: string): FfmpegPackageMetadata | null {
	const parsed = JSON.parse(raw) as unknown
	if (typeof parsed !== 'object' || parsed === null) return null
	const record = parsed as Record<string, unknown>
	const {cacheKey, installedAt} = record
	if (typeof cacheKey !== 'string' || typeof installedAt !== 'string') return null
	return {cacheKey, installedAt}
}

async function readMetadata(rootDir: string): Promise<FfmpegPackageMetadata | null> {
	try {
		return parseMetadata(await fsPromises.readFile(path.join(rootDir, METADATA_FILE), 'utf8'))
	} catch {
		return null
	}
}

function isFileSystemError(err: unknown): err is NodeJS.ErrnoException {
	return err instanceof Error && 'code' in err
}

export class FfmpegPackageMaterializer {
	async materialize(entry: FfmpegPackageEntry, options: FfmpegPackageMaterializeOptions): Promise<FfmpegPackageInstall> {
		const cacheKey = ffmpegPackageCacheKeyHash(entry)
		const rootDir = path.join(options.cacheRoot, PACKAGES_DIR, cacheKey)
		await fsPromises.mkdir(options.cacheRoot, {recursive: true})
		return withArtifactLock(options.cacheRoot, cacheKey, options.signal, options.lockTimeoutMs, async () => {
			if (await this.isInstalled(entry, cacheKey, rootDir)) return installFor(entry, cacheKey, rootDir)

			const artifact = await this.download(entry, cacheKey, options)
			options.onExtracting?.()
			const stageRoot = await fsPromises.mkdtemp(path.join(options.cacheRoot, 'stage-'))
			try {
				const stageDir = path.join(stageRoot, 'install')
				await fsPromises.mkdir(stageDir)
				await this.extract(entry, artifact, stageDir, options.signal)
				if (process.platform !== 'win32') {
					await Promise.all([entry.ffmpegPath, entry.ffprobePath].map(executable => fsPromises.chmod(path.join(stageDir, packageRelativePath(executable)), 0o755)))
				}
				const metadata: FfmpegPackageMetadata = {cacheKey, installedAt: new Date().toISOString()}
				await fsPromises.writeFile(path.join(stageDir, METADATA_FILE), `${JSON.stringify(metadata, null, 2)}\n`)
				await fsPromises.mkdir(path.dirname(rootDir), {recursive: true})
				// Only reached when the directory failed validation, so nothing
				// can be running from it.
				await fsPromises.rm(rootDir, {recursive: true, force: true})
				await fsPromises.rename(stageDir, rootDir)
			} catch (err) {
				if (err instanceof ArtifactMaterializeError) throw err
				if (options.signal?.aborted) throw abortError(options.signal)
				throw new ArtifactMaterializeError(isFileSystemError(err) && (err.code === 'EACCES' || err.code === 'EPERM') ? 'PERMISSION' : 'INTERNAL', err instanceof Error ? err.message : String(err), err)
			} finally {
				await fsPromises.rm(stageRoot, {recursive: true, force: true})
			}
			// The archive is only needed until it is unpacked; keeping it would
			// store every package on disk twice.
			await removeCachedArtifact(artifact.cacheRoot, artifact.key).catch((err: unknown) => logger.warn('Could not drop the downloaded FFmpeg archive', {error: err instanceof Error ? err.message : String(err)}))
			logger.info('FFmpeg package installed', {version: entry.version, platform: entry.platform, arch: entry.arch, rootDir})
			return installFor(entry, cacheKey, rootDir)
		})
	}

	// Removes installed versions other than `active` and the newest previous
	// one. A directory still in use (Windows keeps loaded DLLs locked) is left
	// for a later launch.
	async prune(active: FfmpegPackageEntry, options: {cacheRoot: string}): Promise<string[]> {
		const packagesDir = path.join(options.cacheRoot, PACKAGES_DIR)
		let names: string[]
		try {
			names = await fsPromises.readdir(packagesDir)
		} catch (err) {
			if (isFileSystemError(err) && err.code === 'ENOENT') return []
			throw err
		}
		const activeKey = ffmpegPackageCacheKeyHash(active)
		const others = await Promise.all(
			names
				.filter(name => name !== activeKey)
				.map(async name => {
					const rootDir = path.join(packagesDir, name)
					return {rootDir, installedAt: (await readMetadata(rootDir))?.installedAt ?? ''}
				})
		)
		const stale = others.sort((a, b) => b.installedAt.localeCompare(a.installedAt)).slice(KEEP_PREVIOUS_VERSIONS)
		const removed: string[] = []
		for (const {rootDir} of stale) {
			try {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- one directory at a time keeps a locked one from failing the rest
				await fsPromises.rm(rootDir, {recursive: true})
				removed.push(rootDir)
			} catch (err) {
				logger.warn('Could not remove an old FFmpeg package yet', {rootDir, error: err instanceof Error ? err.message : String(err)})
			}
		}
		return removed
	}

	// Sizes and link targets come from the signed manifest and were checked
	// against the archive's SHA-256 when it was installed, so a size check per
	// launch catches a damaged install without re-hashing ~170 MB every start.
	private async isInstalled(entry: FfmpegPackageEntry, cacheKey: string, rootDir: string): Promise<boolean> {
		const metadata = await readMetadata(rootDir)
		if (metadata?.cacheKey !== cacheKey) return false
		try {
			for (const file of entry.files) {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- stops at the first damaged file
				const stat = await fsPromises.lstat(path.join(rootDir, packageRelativePath(file.path)))
				if (!stat.isFile() || stat.size !== file.size) return false
			}
			for (const link of entry.links) {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- stops at the first damaged link
				if ((await fsPromises.readlink(path.join(rootDir, packageRelativePath(link.path)))) !== link.target) return false
			}
			if (process.platform !== 'win32') {
				await Promise.all([entry.ffmpegPath, entry.ffprobePath].map(executable => fsPromises.access(path.join(rootDir, packageRelativePath(executable)), fs.constants.X_OK)))
			}
			return true
		} catch {
			return false
		}
	}

	private async download(entry: FfmpegPackageEntry, cacheKey: string, options: FfmpegPackageMaterializeOptions): Promise<CachedArtifactResult> {
		try {
			return await downloadArtifactToCache({
				urls: [entry.url, ...entry.mirrors],
				cacheRoot: path.join(options.cacheRoot, 'blobs'),
				key: cacheKey,
				sha256: entry.sha256,
				size: entry.size,
				metadata: {id: entry.id, version: entry.version, platform: entry.platform, arch: entry.arch},
				onProgress: options.onDownloadProgress,
				signal: options.signal
			})
		} catch (err) {
			throw downloadErrorToArtifactError(`${entry.id} ${entry.version}`, entry.size, err, options.signal)
		}
	}

	// Accepts exactly the files and links the signed manifest lists, each once,
	// with the listed size or link target. Anything else fails the install.
	private async extract(entry: FfmpegPackageEntry, artifact: CachedArtifactResult, stageDir: string, signal?: AbortSignal): Promise<void> {
		const expectedFiles = new Map(entry.files.map(file => [packageRelativePath(file.path), file.size]))
		const expectedLinks = new Map(entry.links.map(link => [packageRelativePath(link.path), link.target]))
		const seen = new Set<string>()

		const source = readCachedArtifact(artifact.cacheRoot, artifact.key, artifact.integrity)
		const brotli = createBrotliDecompress({params: {[zlibConstants.BROTLI_DECODER_PARAM_LARGE_WINDOW]: 1}})
		const extract = tarStream.extract()
		const fail = (err: unknown): void => {
			extract.destroy(err instanceof ArtifactMaterializeError ? err : new ArtifactMaterializeError('EXTRACTION', err instanceof Error ? err.message : String(err), err))
		}
		source.on('error', fail)
		brotli.on('error', fail)
		source.pipe(brotli).pipe(extract)

		try {
			for await (const item of extract) {
				if (signal?.aborted) throw abortError(signal)
				const {name, type, size, linkname} = item.header
				const relative = normalizeRuntimeExecutablePath(name)
				if (!relative) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unsafe archive entry: ${name}`)
				const destination = path.join(stageDir, relative)
				if (!pathInside(stageDir, destination) || seen.has(relative)) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Unexpected archive entry: ${name}`)
				seen.add(relative)

				if (type === 'file' && expectedFiles.has(relative)) {
					const expectedSize = expectedFiles.get(relative)
					if (size !== expectedSize) throw new ArtifactMaterializeError('EXTRACTION', `${name} is ${String(size)} bytes, expected ${String(expectedSize)}`)
					await fsPromises.mkdir(path.dirname(destination), {recursive: true})
					await pipeline(item, fs.createWriteStream(destination, {flags: 'wx', mode: 0o755}))
					continue
				}
				if (type === 'symlink' && expectedLinks.has(relative)) {
					if (linkname !== expectedLinks.get(relative)) throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Archive link ${name} points to ${String(linkname)}, not the approved target`)
					item.resume()
					await fsPromises.mkdir(path.dirname(destination), {recursive: true})
					await fsPromises.symlink(linkname, destination)
					continue
				}
				throw new ArtifactMaterializeError('ARCHIVE_SECURITY', `Archive entry ${name} (${String(type)}) is not part of the approved package`)
			}
		} catch (err) {
			source.unpipe(brotli)
			brotli.destroy()
			if (signal?.aborted) throw abortError(signal)
			if (err instanceof ArtifactMaterializeError) throw err
			throw new ArtifactMaterializeError('EXTRACTION', err instanceof Error ? err.message : String(err), err)
		}

		const missing = [...expectedFiles.keys(), ...expectedLinks.keys()].filter(relative => !seen.has(relative))
		if (missing.length > 0) throw new ArtifactMaterializeError('EXECUTABLE_MISSING', `Package is missing ${missing.join(', ')}`)
	}
}
