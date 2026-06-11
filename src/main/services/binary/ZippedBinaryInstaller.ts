import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type {Readable} from 'node:stream'
import {promisify} from 'node:util'
import {inflateRaw} from 'node:zlib'
import * as yauzl from 'yauzl'
import log from 'electron-log/main.js'
import type {StatusKey} from '@shared/types.js'
import {downloadFile, type DownloadProgressCallback, sha256ForFile} from './BinaryDownloader.js'
import {ManagedSetupError, withManagedSetupStep} from './ManagedSetup.js'

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void
const logger = log.scope('zipped-binary-installer')

export interface EnsureZippedBinaryConfig {
	name: string
	downloadUrl: string
	archiveFileName: string
	innerExecutableName: string
	destinationPath: string
	expectedSha256?: string
	onStatus?: StatusReporter
	onDownloadProgress?: DownloadProgressCallback
	signal?: AbortSignal
}

const ZIP_INSTALL_STEP_TIMEOUT_MS = 120_000
const ZIP_METHOD_STORE = 0
const ZIP_METHOD_DEFLATE = 8
const inflateRawAsync = promisify(inflateRaw)

function positiveIntegerEnv(name: string): number | undefined {
	const raw = process.env[name]
	if (!raw) return undefined
	const value = Number.parseInt(raw, 10)
	return Number.isFinite(value) && value > 0 ? value : undefined
}

function zipInstallStepTimeoutMs(): number {
	return positiveIntegerEnv('ARROXY_ZIP_INSTALL_STEP_MAX_MS') ?? ZIP_INSTALL_STEP_TIMEOUT_MS
}

function abortReason(signal: AbortSignal): Error {
	return signal.reason instanceof Error ? signal.reason : new DOMException('Cancelled', 'AbortError')
}

async function withStepTimeout<T>(label: string, signal: AbortSignal | undefined, run: (timeoutSignal: AbortSignal) => Promise<T>): Promise<T> {
	if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')

	const timeoutMs = zipInstallStepTimeoutMs()
	let timer: NodeJS.Timeout | null = null
	let abortHandler: (() => void) | null = null
	const timeoutController = new AbortController()
	try {
		return await Promise.race([
			run(timeoutController.signal),
			new Promise<never>((_resolve, reject) => {
				timer = setTimeout(() => {
					const err = new Error(`${label} exceeded ${timeoutMs}ms`)
					timeoutController.abort(err)
					reject(err)
				}, timeoutMs)
				if (signal) {
					abortHandler = () => {
						const err = abortReason(signal)
						timeoutController.abort(err)
						reject(err)
					}
					signal.addEventListener('abort', abortHandler, {once: true})
				}
			})
		])
	} finally {
		if (timer) clearTimeout(timer)
		if (signal && abortHandler) signal.removeEventListener('abort', abortHandler)
	}
}

function zipEntryBaseName(fileName: string): string {
	const normalized = fileName.replaceAll('\\', '/')
	const parts = normalized.split('/').filter(Boolean)
	return parts[parts.length - 1] ?? ''
}

function zipEntryIsFile(entry: yauzl.Entry): boolean {
	return !entry.fileName.endsWith('/')
}

function zipEntryMatchesExecutable(entry: yauzl.Entry, executableName: string): boolean {
	return zipEntryIsFile(entry) && zipEntryBaseName(entry.fileName) === executableName
}

function openZipFile(zipPath: string): Promise<yauzl.ZipFile> {
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

function openZipReadStream(zipFile: yauzl.ZipFile, entry: yauzl.Entry): Promise<Readable> {
	return new Promise((resolve, reject) => {
		const callback = (err: Error | null, readStream: Readable): void => {
			if (err) {
				reject(err)
				return
			}
			resolve(readStream)
		}
		if (entry.compressionMethod === ZIP_METHOD_DEFLATE) {
			zipFile.openReadStream(entry, {decompress: false, decrypt: null, start: null, end: null}, callback)
			return
		}
		zipFile.openReadStream(entry, callback)
	})
}

function readStreamToBuffer(stream: Readable, signal: AbortSignal): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = []
		let settled = false

		const cleanup = (): void => {
			signal.removeEventListener('abort', abortHandler)
			stream.removeListener('data', onData)
			stream.removeListener('end', onEnd)
			stream.removeListener('error', onError)
		}
		const finish = (err?: unknown): void => {
			if (settled) return
			settled = true
			cleanup()
			if (err) {
				reject(err)
				return
			}
			resolve(Buffer.concat(chunks))
		}
		const abortHandler = (): void => {
			const err = abortReason(signal)
			stream.destroy(err)
			finish(err)
		}
		const onData = (chunk: Buffer | string): void => {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
		}
		const onEnd = (): void => finish()
		const onError = (err: Error): void => finish(err)

		if (signal.aborted) {
			abortHandler()
			return
		}

		signal.addEventListener('abort', abortHandler, {once: true})
		stream.on('data', onData)
		stream.once('end', onEnd)
		stream.once('error', onError)
	})
}

async function inflateZipEntry(raw: Buffer, entry: yauzl.Entry): Promise<Buffer> {
	if (entry.compressionMethod === ZIP_METHOD_STORE) return raw
	if (entry.compressionMethod === ZIP_METHOD_DEFLATE) return inflateRawAsync(raw)
	throw new Error(`Unsupported ZIP compression method ${entry.compressionMethod} for ${entry.fileName}`)
}

async function extractExecutableEntry(zipPath: string, executableName: string, destinationPath: string, signal?: AbortSignal): Promise<string> {
	const zipFile = await openZipFile(zipPath)
	let settled = false

	return new Promise<string>((resolve, reject) => {
		let abortHandler: (() => void) | null = null
		const finish = (err: unknown, entryName?: string): void => {
			if (settled) return
			settled = true
			if (signal && abortHandler) signal.removeEventListener('abort', abortHandler)
			zipFile.close()
			if (err) {
				reject(err)
				return
			}
			resolve(entryName ?? executableName)
		}

		abortHandler = () => finish(new DOMException('Cancelled', 'AbortError'))
		signal?.addEventListener('abort', abortHandler, {once: true})

		zipFile.once('error', finish)
		zipFile.once('end', () => finish(new Error(`Archive did not contain ${executableName}`)))
		zipFile.on('entry', (entry: yauzl.Entry) => {
			if (settled) return
			if (!zipEntryMatchesExecutable(entry, executableName)) {
				zipFile.readEntry()
				return
			}
			void (async () => {
				const readStream = await openZipReadStream(zipFile, entry)
				const raw = await readStreamToBuffer(readStream, signal ?? new AbortController().signal)
				const body = await inflateZipEntry(raw, entry)
				if (body.length !== entry.uncompressedSize) {
					throw new Error(`Archive entry ${entry.fileName} had ${body.length} bytes after extraction; expected ${entry.uncompressedSize}`)
				}
				await fsPromises.writeFile(destinationPath, body, {mode: 0o755})
				finish(null, entry.fileName)
			})().catch(finish)
		})

		zipFile.readEntry()
	})
}

export class ZippedBinaryInstaller {
	private readonly inProgress = new Map<string, Promise<void>>()

	async ensure(config: EnsureZippedBinaryConfig): Promise<void> {
		const {destinationPath, name, onStatus, onDownloadProgress, signal} = config

		const existing = this.inProgress.get(destinationPath)
		if (existing) return existing

		const promise = (async (): Promise<void> => {
			if (signal?.aborted) throw new ManagedSetupError('preflight', new DOMException('Cancelled', 'AbortError'))
			const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), `arroxy-${name}-`))
			await using _cleanup = {[Symbol.asyncDispose]: () => fsPromises.rm(tempDir, {recursive: true, force: true})}
			const zipPath = path.join(tempDir, config.archiveFileName)

			onStatus?.('downloadingBinary', {name})
			await withManagedSetupStep('download', () => downloadFile(config.downloadUrl, zipPath, onDownloadProgress, true, signal))

			const expected = config.expectedSha256
			if (expected) {
				const startedAt = Date.now()
				const actual = await withManagedSetupStep('checksum_verify', () => withStepTimeout(`${name} checksum verification`, signal, () => sha256ForFile(zipPath)))
				if (actual !== expected) {
					throw new ManagedSetupError('checksum_verify', new Error(`${name} checksum mismatch. Expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...`))
				}
				logger.debug('Zipped binary checksum verified', {name, archiveFileName: config.archiveFileName, elapsedMs: Date.now() - startedAt})
			}

			const innerPath = path.join(tempDir, config.innerExecutableName)
			const extractStartedAt = Date.now()
			const entryName = await withManagedSetupStep('extract', () => withStepTimeout(`${name} archive extraction`, signal, timeoutSignal => extractExecutableEntry(zipPath, config.innerExecutableName, innerPath, timeoutSignal)))
			logger.debug('Zipped binary extracted', {name, archiveFileName: config.archiveFileName, entryName, elapsedMs: Date.now() - extractStartedAt})

			const installStartedAt = Date.now()
			await withManagedSetupStep('install', async () => {
				await withStepTimeout(`${name} binary install`, signal, async () => {
					await fsPromises.mkdir(path.dirname(destinationPath), {recursive: true})
					await fsPromises.copyFile(innerPath, destinationPath)
					if (process.platform !== 'win32') {
						await fsPromises.chmod(destinationPath, 0o755)
					}
				})
			})
			logger.info('Zipped binary installed', {name, destinationPath, elapsedMs: Date.now() - installStartedAt})
		})().finally(() => {
			this.inProgress.delete(destinationPath)
		})

		this.inProgress.set(destinationPath, promise)
		return promise
	}
}
