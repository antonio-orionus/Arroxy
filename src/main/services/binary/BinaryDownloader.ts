import {createHash} from 'node:crypto'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {pipeline} from 'node:stream/promises'
import cacache from 'cacache'
import fetch from 'make-fetch-happen'
import log from 'electron-log/main.js'
import type {DependencyFailureKind, WarmupProgressEvent} from '@shared/types.js'
import {cancelError, isAbortError} from './BinaryProbe.js'

const logger = log.scope('binary-downloader')

export type DownloadProgressCallback = (downloaded: number, total: number | undefined) => void
export type ProgressEmitter = (event: WarmupProgressEvent) => void

type PartialResponseMode = 'fresh' | 'append' | 'discard-and-retry'

const DOWNLOAD_STALL_TIMEOUT_MS = 60_000

export class DownloadStalledError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'DownloadStalledError'
	}
}

export class DownloadIntegrityError extends Error {
	constructor(
		message: string,
		readonly cause?: unknown
	) {
		super(message)
		this.name = 'DownloadIntegrityError'
	}
}

export class DownloadSizeMismatchError extends Error {
	constructor(
		message: string,
		readonly expectedSize?: number,
		readonly actualSize?: number,
		readonly cause?: unknown
	) {
		super(message)
		this.name = 'DownloadSizeMismatchError'
	}
}

// Distinguishable error class so the resume path can tell "stale partial,
// re-download from byte 0" apart from a network failure.
class RestartFreshDownloadError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'RestartFreshDownloadError'
	}
}

// Adapter for callers that still hand us a raw byte-progress callback.
// Used by BinaryManager.ensureYtDlp / ensureFFmpeg for back-compat.
export function wrapDownloadProgressEmitter(cb: DownloadProgressCallback | undefined): ProgressEmitter | undefined {
	if (!cb) return undefined
	return (event): void => {
		if (event.phase === 'downloading' && typeof event.bytesDownloaded === 'number') {
			cb(event.bytesDownloaded, event.totalBytes)
		}
	}
}

// SHA-256 parsers — three formats observed in the wild.

// Multi-line "<sha>  <filename>" format (yt-dlp SHA2-256SUMS).
export function parseShaLine(content: string, fileName: string): string | null {
	const lines = content.split(/\r?\n/)
	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed) continue
		const parts = trimmed.split(/\s+/)
		const shaCandidate = parts[0]
		const assetCandidate = parts[parts.length - 1]
		if (assetCandidate === fileName && /^[a-fA-F0-9]{64}$/.test(shaCandidate)) {
			return shaCandidate.toLowerCase()
		}
	}
	return null
}

// Single-line plain-hex SHA used by upstream checksum sidecars.
// Falls back to any 64-hex token in the body (covers labelled forms).
export function parseStandaloneSha256(content: string): string | null {
	const firstToken = content.trim().split(/\s+/)[0] ?? ''
	if (/^[a-fA-F0-9]{64}$/.test(firstToken)) return firstToken.toLowerCase()
	const labelled = /\b([a-fA-F0-9]{64})\b/.exec(content)
	return labelled ? labelled[1].toLowerCase() : null
}

// Some Windows checksum sidecars use multi-line "Hash : <64-hex>" PowerShell
// format instead of the usual "<hash>  file" GNU format.
export function parsePowerShellFileHash(content: string): string | null {
	const match = /^\s*Hash\s*:\s*([a-fA-F0-9]{64})\s*$/m.exec(content)
	return match ? match[1].toLowerCase() : null
}

export async function sha256ForFile(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const hash = createHash('sha256')
		const stream = fs.createReadStream(filePath)
		stream.on('data', chunk => hash.update(chunk))
		stream.on('error', reject)
		stream.on('end', () => resolve(hash.digest('hex').toLowerCase()))
	})
}

export function sha256HexToSri(sha256Hex: string): string {
	if (!/^[a-fA-F0-9]{64}$/.test(sha256Hex)) throw new DownloadIntegrityError(`Invalid SHA-256 digest: ${sha256Hex}`)
	return `sha256-${Buffer.from(sha256Hex, 'hex').toString('base64')}`
}

// Network plumbing handled by `make-fetch-happen`: redirects, proxy support,
// timeout support, and HTTP-semantics-aware request retry. Stream truncation is
// still handled by Arroxy because the app owns partial-file and range policy.
const HTTP_HEADERS: Record<string, string> = {'user-agent': 'arroxy/1.0'}
const HTTP_RETRY = {retries: 5, factor: 2, minTimeout: 1_000, maxTimeout: 60_000, randomize: true}
const HTTP_TIMEOUT = {request: 600_000}

interface DownloadFileOptions {
	allowPartialRetry?: boolean
	signal?: AbortSignal
	stallTimeoutMs?: number
	maxDurationMs?: number
	partialRetryLimit?: number
	partialRetryAttempt?: number
}

interface NormalizedDownloadFileOptions {
	allowPartialRetry: boolean
	signal?: AbortSignal
	stallTimeoutMs: number
	maxDurationMs: number
	partialRetryLimit: number
	partialRetryAttempt: number
}

export interface DownloadArtifactToCacheOptions {
	urls: readonly string[]
	cacheRoot: string
	key: string
	sha256: string
	size?: number
	metadata?: Record<string, unknown>
	onProgress?: DownloadProgressCallback
	signal?: AbortSignal
	stallTimeoutMs?: number
	maxDurationMs?: number
	partialRetryLimit?: number
}

export interface CachedArtifactResult {
	cacheRoot: string
	key: string
	integrity: string
	size: number
}

export interface CopyCachedArtifactOptions {
	integrity?: string
	size?: number
}

type FetchOptions = fetch.FetchOptions & {signal?: AbortSignal}

export async function downloadText(url: string, signal?: AbortSignal): Promise<string> {
	const res = await fetch(url, {headers: HTTP_HEADERS, retry: HTTP_RETRY, timeout: HTTP_TIMEOUT.request, redirect: 'follow', signal} as FetchOptions)
	if (!res.ok) throw new Error(`HTTP ${res.status} while downloading ${url}`)
	return res.text()
}

function stringifyHeader(header: string | string[] | undefined | null): string | null {
	if (!header) return null
	return Array.isArray(header) ? (header[0] ?? null) : header
}

function numericHeader(header: string | null): number | undefined {
	if (!header) return undefined
	const value = Number.parseInt(header, 10)
	return Number.isFinite(value) && value >= 0 ? value : undefined
}

export function parseContentRangeStart(header: string | string[] | undefined): number | null {
	const value = Array.isArray(header) ? header[0] : header
	if (!value) return null
	const match = /^bytes\s+(\d+)-\d+\/(?:\d+|\*)$/i.exec(value.trim())
	return match ? Number(match[1]) : null
}

export function resolvePartialResponseMode(startByte: number, statusCode: number | undefined, contentRange: string | string[] | undefined): PartialResponseMode {
	if (startByte === 0) return 'fresh'
	if (statusCode === 416) return 'discard-and-retry'
	if (statusCode !== 206) return 'fresh'

	const resumedFrom = parseContentRangeStart(contentRange)
	if (resumedFrom !== startByte) {
		return 'discard-and-retry'
	}

	return 'append'
}

function positiveIntegerEnv(name: string): number | undefined {
	const raw = process.env[name]
	if (!raw) return undefined
	const value = Number.parseInt(raw, 10)
	return Number.isFinite(value) && value > 0 ? value : undefined
}

function downloadMaxDurationMs(): number {
	return positiveIntegerEnv('ARROXY_BINARY_DOWNLOAD_MAX_MS') ?? HTTP_TIMEOUT.request
}

function normalizeDownloadFileOptions(allowPartialRetryOrOptions: boolean | DownloadFileOptions, signal?: AbortSignal): NormalizedDownloadFileOptions {
	if (typeof allowPartialRetryOrOptions === 'object') {
		return {
			allowPartialRetry: allowPartialRetryOrOptions.allowPartialRetry ?? true,
			signal: allowPartialRetryOrOptions.signal ?? signal,
			stallTimeoutMs: allowPartialRetryOrOptions.stallTimeoutMs ?? DOWNLOAD_STALL_TIMEOUT_MS,
			maxDurationMs: allowPartialRetryOrOptions.maxDurationMs ?? downloadMaxDurationMs(),
			partialRetryLimit: allowPartialRetryOrOptions.partialRetryLimit ?? 5,
			partialRetryAttempt: allowPartialRetryOrOptions.partialRetryAttempt ?? 0
		}
	}
	return {allowPartialRetry: allowPartialRetryOrOptions, signal, stallTimeoutMs: DOWNLOAD_STALL_TIMEOUT_MS, maxDurationMs: downloadMaxDurationMs(), partialRetryLimit: 5, partialRetryAttempt: 0}
}

async function fileSize(filePath: string): Promise<number> {
	try {
		const stat = await fsPromises.stat(filePath)
		return stat.isFile() ? stat.size : 0
	} catch {
		return 0
	}
}

function hashText(value: string): string {
	return createHash('sha256').update(value).digest('hex')
}

function errorCode(err: unknown): string | undefined {
	return err instanceof Error ? (err as NodeJS.ErrnoException).code : undefined
}

function isRetryablePartialDownloadError(err: unknown): boolean {
	if (err instanceof DownloadStalledError) return true
	if (!(err instanceof Error)) return false
	const message = err.message.toLowerCase()
	const code = errorCode(err)
	return message.includes('content-length mismatch') || message.includes('premature close') || message.includes('aborted') || code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'EPIPE' || code === 'ERR_STREAM_PREMATURE_CLOSE' || code === 'request-timeout'
}

function mapCacheError(err: unknown, expectedSize?: number): never {
	const code = errorCode(err)
	if (code === 'EINTEGRITY') throw new DownloadIntegrityError('Artifact checksum did not match manifest SHA-256', err)
	if (code === 'EBADSIZE') throw new DownloadSizeMismatchError('Artifact size did not match manifest size', expectedSize, undefined, err)
	throw err
}

function bodyStream(response: {body: unknown}): NodeJS.ReadableStream {
	if (!response.body) throw new Error('HTTP response did not include a body stream')
	return response.body as NodeJS.ReadableStream
}

async function waitForDrain(stream: fs.WriteStream): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const cleanup = (): void => {
			stream.off('drain', onDrain)
			stream.off('error', onError)
		}
		const onDrain = (): void => {
			cleanup()
			resolve()
		}
		const onError = (err: Error): void => {
			cleanup()
			reject(err)
		}
		stream.once('drain', onDrain)
		stream.once('error', onError)
	})
}

async function closeWriteStream(stream: fs.WriteStream): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const cleanup = (): void => {
			stream.off('finish', onFinish)
			stream.off('error', onError)
		}
		const onFinish = (): void => {
			cleanup()
			resolve()
		}
		const onError = (err: Error): void => {
			cleanup()
			reject(err)
		}
		stream.once('finish', onFinish)
		stream.once('error', onError)
		stream.end()
	})
}

async function writeResponseBodyToFile(responseBody: NodeJS.ReadableStream, destination: string, flags: 'a' | 'w', baseByte: number, contentLength: number | undefined, signal: AbortSignal, onProgress: DownloadProgressCallback | undefined, onData: (bytes: number) => void): Promise<number> {
	let transferred = 0
	const out = fs.createWriteStream(destination, {flags})
	try {
		for await (const rawChunk of responseBody as AsyncIterable<Buffer | Uint8Array | string>) {
			if (signal.aborted) throw cancelError()
			const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk)
			transferred += chunk.length
			onData(transferred)
			onProgress?.(baseByte + transferred, contentLength === undefined ? undefined : baseByte + contentLength)
			if (!out.write(chunk)) await waitForDrain(out)
		}
		await closeWriteStream(out)
		return transferred
	} catch (err) {
		await new Promise<void>(resolve => out.end(() => resolve()))
		throw err
	}
}

// Range-resume: if `${destination}.part` exists from a previous interrupted
// attempt, resume via `Range: bytes=<size>-`. If the server responds 200
// (no range support) instead of 206, truncate and start fresh.
export async function downloadFile(url: string, destination: string, onProgress?: DownloadProgressCallback, allowPartialRetryOrOptions: boolean | DownloadFileOptions = true, signal?: AbortSignal): Promise<void> {
	const options = normalizeDownloadFileOptions(allowPartialRetryOrOptions, signal)
	const {allowPartialRetry, stallTimeoutMs, maxDurationMs, partialRetryLimit, partialRetryAttempt} = options
	signal = options.signal
	if (signal?.aborted) throw cancelError()
	await fsPromises.mkdir(path.dirname(destination), {recursive: true})

	const partPath = `${destination}.part`
	const startByte = await fileSize(partPath)
	const headers: Record<string, string> = {...HTTP_HEADERS}
	if (startByte > 0) headers.range = `bytes=${startByte}-`

	const stallController = new AbortController()
	const combinedSignal = signal ? AbortSignal.any([signal, stallController.signal]) : stallController.signal
	let timeoutReason: 'duration' | 'stall' | null = null
	const startedAt = Date.now()
	let lastProgressAt = Date.now()
	let lastDownloaded = startByte
	let stallTimer: NodeJS.Timeout | null = null
	let maxDurationTimer: NodeJS.Timeout | null = null
	const armStallTimer = (): void => {
		if (stallTimer) clearTimeout(stallTimer)
		stallTimer = setTimeout(() => {
			timeoutReason = 'stall'
			stallController.abort()
		}, stallTimeoutMs)
	}
	const clearStallTimer = (): void => {
		if (!stallTimer) return
		clearTimeout(stallTimer)
		stallTimer = null
	}
	const clearMaxDurationTimer = (): void => {
		if (!maxDurationTimer) return
		clearTimeout(maxDurationTimer)
		maxDurationTimer = null
	}

	armStallTimer()
	try {
		maxDurationTimer = setTimeout(() => {
			timeoutReason = 'duration'
			stallController.abort()
		}, maxDurationMs)

		const response = await fetch(url, {headers, retry: HTTP_RETRY, timeout: maxDurationMs, redirect: 'follow', signal: combinedSignal} as FetchOptions)
		const contentLength = numericHeader(response.headers.get('content-length'))
		const contentRange = response.headers.get('content-range') ?? undefined
		logger.debug('Binary download response', {url, statusCode: response.status, startByte, contentLength: stringifyHeader(response.headers.get('content-length'))})

		const mode = resolvePartialResponseMode(startByte, response.status, contentRange)
		if (mode === 'discard-and-retry') throw new RestartFreshDownloadError(`Discarding stale partial for ${path.basename(destination)}`)
		if (!response.ok) throw new Error(`HTTP ${response.status} while downloading ${url}`)

		const baseByte = mode === 'append' ? startByte : 0
		lastDownloaded = baseByte
		armStallTimer()
		const transferred = await writeResponseBodyToFile(bodyStream(response), partPath, mode === 'append' ? 'a' : 'w', baseByte, contentLength, combinedSignal, onProgress, bytes => {
			lastDownloaded = baseByte + bytes
			lastProgressAt = Date.now()
			armStallTimer()
		})
		if (contentLength !== undefined && transferred !== contentLength) {
			throw new Error(`Content-Length mismatch: expected ${contentLength} bytes, received ${transferred} bytes`)
		}
	} catch (err) {
		let retryableError = err
		if ((timeoutReason === 'stall' || timeoutReason === 'duration') && !signal?.aborted) {
			retryableError = new DownloadStalledError(timeoutReason === 'stall' ? `No download progress for ${stallTimeoutMs}ms` : `Download exceeded ${maxDurationMs}ms`)
			logger.warn('Binary download timed out', {url, destination, reason: timeoutReason, startByte, lastDownloaded, lastProgressAgeMs: Date.now() - lastProgressAt, stallTimeoutMs, maxDurationMs})
		}
		if (allowPartialRetry && retryableError instanceof RestartFreshDownloadError) {
			logger.warn('Stale partial detected, retrying binary download from byte 0', {destination, startByte})
			await fsPromises.rm(partPath, {force: true})
			return downloadFile(url, destination, onProgress, {...options, allowPartialRetry: false})
		}
		const partialSize = await fileSize(partPath)
		if (allowPartialRetry && !signal?.aborted && partialRetryAttempt < partialRetryLimit && partialSize >= startByte && isRetryablePartialDownloadError(retryableError)) {
			logger.warn('Partial binary download failed, retrying with range resume', {url, destination, startByte, partialSize, attempt: partialRetryAttempt + 1, limit: partialRetryLimit, error: retryableError instanceof Error ? retryableError.message : String(retryableError)})
			return downloadFile(url, destination, onProgress, {...options, partialRetryAttempt: partialRetryAttempt + 1})
		}
		if (retryableError instanceof DownloadStalledError) throw retryableError
		throw err
	} finally {
		clearStallTimer()
		clearMaxDurationTimer()
	}

	await fsPromises.rename(partPath, destination)
	logger.debug('Binary download completed', {url, destination, bytesDownloaded: lastDownloaded, elapsedMs: Date.now() - startedAt})
}

export async function downloadArtifactToCache(options: DownloadArtifactToCacheOptions): Promise<CachedArtifactResult> {
	if (options.urls.length === 0) throw new Error('No artifact URLs provided')
	const integrity = sha256HexToSri(options.sha256)
	await fsPromises.mkdir(options.cacheRoot, {recursive: true})

	const existingEntry = await cacache.get.info(options.cacheRoot, options.key, {memoize: false}).catch(() => null)
	const existingEntrySize = existingEntry?.size ?? options.size
	if (existingEntry?.integrity.includes(integrity) && existingEntrySize !== undefined && (options.size === undefined || existingEntrySize === options.size)) {
		return {cacheRoot: options.cacheRoot, key: options.key, integrity, size: existingEntrySize}
	}

	const existingContent = await cacache.get.hasContent(options.cacheRoot, integrity).catch(() => false)
	const existingSize = typeof existingContent === 'object' && existingContent ? existingContent.size : undefined
	if (existingSize !== undefined && (options.size === undefined || existingSize === options.size)) {
		await cacache.index.insert(options.cacheRoot, options.key, integrity, {metadata: options.metadata, size: existingSize})
		return {cacheRoot: options.cacheRoot, key: options.key, integrity, size: existingSize}
	}
	if (existingSize !== undefined && options.size !== undefined && existingSize !== options.size) {
		throw new DownloadSizeMismatchError(`Cached artifact size mismatch. Expected ${options.size}, got ${existingSize}`, options.size, existingSize)
	}

	const partialDir = path.join(options.cacheRoot, 'partials')
	const downloadPath = path.join(partialDir, `${hashText(options.key)}.bin`)
	let lastError: unknown = null
	for (const url of options.urls) {
		try {
			await downloadFile(url, downloadPath, options.onProgress, {allowPartialRetry: true, signal: options.signal, stallTimeoutMs: options.stallTimeoutMs, maxDurationMs: options.maxDurationMs, partialRetryLimit: options.partialRetryLimit})
			const stat = await fsPromises.stat(downloadPath)
			if (options.size !== undefined && stat.size !== options.size) {
				throw new DownloadSizeMismatchError(`Artifact size mismatch. Expected ${options.size}, got ${stat.size}`, options.size, stat.size)
			}
			try {
				await pipeline(fs.createReadStream(downloadPath), cacache.put.stream(options.cacheRoot, options.key, {integrity, size: options.size ?? stat.size, metadata: options.metadata, memoize: false}))
			} catch (err) {
				mapCacheError(err, options.size)
			}
			await fsPromises.rm(downloadPath, {force: true})
			await fsPromises.rm(`${downloadPath}.part`, {force: true})
			const info = await cacache.get.info(options.cacheRoot, options.key, {memoize: false})
			return {cacheRoot: options.cacheRoot, key: options.key, integrity, size: info?.size ?? stat.size}
		} catch (err) {
			lastError = err
			await fsPromises.rm(downloadPath, {force: true})
			await fsPromises.rm(`${downloadPath}.part`, {force: true})
			if (options.signal?.aborted) throw err
		}
	}
	if (lastError instanceof Error) throw lastError
	throw new Error(typeof lastError === 'string' ? lastError : 'Artifact download failed')
}

export async function copyCachedArtifactToFile(cacheRoot: string, key: string, destination: string, options: CopyCachedArtifactOptions = {}): Promise<void> {
	await fsPromises.mkdir(path.dirname(destination), {recursive: true})
	try {
		await cacache.get.copy(cacheRoot, key, destination, {integrity: options.integrity, size: options.size, memoize: false})
	} catch (err) {
		mapCacheError(err, options.size)
	}
}

// Extract structured diagnostic fields from a network/cache error for analytics.
export function downloadErrorDetails(err: unknown): {error_code?: string; status_code?: number} {
	if (!(err instanceof Error)) return {}
	const result: {error_code?: string; status_code?: number} = {}
	const code = errorCode(err)
	if (typeof code === 'string') result.error_code = code.slice(0, 32)
	const statusCode = (err as {response?: {statusCode?: unknown}; status?: unknown}).response?.statusCode ?? (err as {status?: unknown}).status
	if (typeof statusCode === 'number') result.status_code = statusCode
	return result
}

// Map an arbitrary download-pipeline failure to a `DependencyFailureKind`.
// Used by `BinaryResolver` to record `attempts[]` entries on its strategy chain.
export function classifyDownloadError(err: unknown): DependencyFailureKind {
	if (err instanceof DownloadStalledError) return 'timeout'
	if (err instanceof DownloadIntegrityError || err instanceof DownloadSizeMismatchError) return 'hash_failed'
	if (isAbortError(err)) return 'timeout'
	const msg = err instanceof Error ? err.message.toLowerCase() : ''
	if (msg.includes('checksum') || msg.includes('integrity')) return 'hash_failed'
	if (msg.includes('no download progress') || msg.includes('stalled')) return 'timeout'
	if (msg.includes('archive') || msg.includes('did not contain') || msg.includes('extract')) return 'extract_failed'
	return 'download_failed'
}
