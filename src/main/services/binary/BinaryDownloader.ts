import {createHash} from 'node:crypto'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import got, {type Method} from 'got'
import log from 'electron-log/main.js'
import type {DependencyFailureKind, WarmupProgressEvent} from '@shared/types.js'
import {cancelError, isAbortError} from './BinaryProbe.js'

const logger = log.scope('binary-downloader')

export type DownloadProgressCallback = (downloaded: number, total: number | undefined) => void
export type ProgressEmitter = (event: WarmupProgressEvent) => void

type PartialResponseMode = 'fresh' | 'append' | 'discard-and-retry'

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

// Single-line plain-hex SHA used by deno's Linux/Mac sha256sum sibling.
// Falls back to any 64-hex token in the body (covers labelled forms).
export function parseStandaloneSha256(content: string): string | null {
	const firstToken = content.trim().split(/\s+/)[0] ?? ''
	if (/^[a-fA-F0-9]{64}$/.test(firstToken)) return firstToken.toLowerCase()
	const labelled = /\b([a-fA-F0-9]{64})\b/.exec(content)
	return labelled ? labelled[1].toLowerCase() : null
}

// Deno Windows .sha256sum uses multi-line "Hash : <64-hex>" PowerShell
// format. Linux/Mac use parseStandaloneSha256 instead.
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

// Network plumbing handled by `got`: per-phase timeouts, jittered exponential
// backoff, automatic redirect handling with retry on transient HTTP errors
// (408/429/5xx) and network errors.
export const HTTP_HEADERS: Record<string, string> = {'user-agent': 'arroxy/1.0'}
export const HTTP_RETRY = {
	limit: 5,
	methods: ['GET'] as Method[],
	statusCodes: [408, 413, 429, 500, 502, 503, 504],
	errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN'],
	calculateDelay: ({computedValue}: {computedValue: number}): number => (computedValue === 0 ? 0 : Math.min(60_000, computedValue) + Math.floor(Math.random() * 500))
}
export const HTTP_TIMEOUT = {lookup: 5_000, connect: 10_000, secureConnect: 10_000, socket: 60_000, response: 30_000, send: 60_000, request: 600_000}

export async function downloadText(url: string, signal?: AbortSignal): Promise<string> {
	const res = await got(url, {headers: HTTP_HEADERS, retry: HTTP_RETRY, timeout: HTTP_TIMEOUT, followRedirect: true, signal})
	return res.body
}

function stringifyHeader(header: string | string[] | undefined): string | null {
	if (!header) return null
	return Array.isArray(header) ? (header[0] ?? null) : header
}

const RELEASE_TAG_LOCATION = /\/releases\/tag\/([^/?#]+)/

export function parseTagFromLocation(location: string | string[] | undefined): string | null {
	const value = stringifyHeader(location)
	if (!value) return null
	const match = RELEASE_TAG_LOCATION.exec(value)
	return match ? decodeURIComponent(match[1]) : null
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
	if (resumedFrom !== null && resumedFrom !== startByte) {
		return 'discard-and-retry'
	}

	return 'append'
}

// Range-resume: if `${destination}.part` exists from a previous interrupted
// attempt, resume via `Range: bytes=<size>-`. If the server responds 200
// (no range support) instead of 206, truncate and start fresh.
export async function downloadFile(url: string, destination: string, onProgress?: DownloadProgressCallback, allowPartialRetry = true, signal?: AbortSignal): Promise<void> {
	if (signal?.aborted) throw cancelError()
	await fsPromises.mkdir(path.dirname(destination), {recursive: true})

	const partPath = `${destination}.part`
	let startByte = 0
	try {
		const stat = await fsPromises.stat(partPath)
		if (stat.isFile() && stat.size > 0) startByte = stat.size
	} catch {
		// no partial file
	}

	const headers: Record<string, string> = {...HTTP_HEADERS}
	if (startByte > 0) headers.range = `bytes=${startByte}-`

	const stream = got.stream(url, {headers, retry: HTTP_RETRY, timeout: HTTP_TIMEOUT, followRedirect: true, signal})

	try {
		await new Promise<void>((resolve, reject) => {
			let out: fs.WriteStream | null = null
			let settled = false
			const finish = (err?: Error): void => {
				if (settled) return
				settled = true
				if (err) reject(err)
				else resolve()
			}

			stream.once('response', (res: {statusCode?: number; headers: Record<string, string | string[] | undefined>}) => {
				const mode = resolvePartialResponseMode(startByte, res.statusCode, res.headers['content-range'])
				if (mode === 'discard-and-retry') {
					stream.destroy(new RestartFreshDownloadError(`Discarding stale partial for ${path.basename(destination)}`))
					return
				}

				out = fs.createWriteStream(partPath, {flags: mode === 'append' ? 'a' : 'w'})
				out.on('error', finish)
				stream.pipe(out)
				out.on('finish', () => finish())
			})
			stream.on('downloadProgress', ({transferred, total}: {transferred: number; total: number}) => {
				onProgress?.(startByte + transferred, total > 0 ? startByte + total : undefined)
			})
			stream.once('error', (err: Error) => finish(err))
		})
	} catch (err) {
		if (allowPartialRetry && err instanceof RestartFreshDownloadError) {
			logger.warn('Stale partial detected, retrying binary download from byte 0', {destination, startByte})
			await fsPromises.rm(partPath, {force: true})
			return downloadFile(url, destination, onProgress, false, signal)
		}
		throw err
	}

	await fsPromises.rename(partPath, destination)
}

// Extract structured diagnostic fields from a got/network error for analytics.
export function downloadErrorDetails(err: unknown): {error_code?: string; status_code?: number} {
	if (!(err instanceof Error)) return {}
	const result: {error_code?: string; status_code?: number} = {}
	const code = (err as NodeJS.ErrnoException).code
	if (typeof code === 'string') result.error_code = code.slice(0, 32)
	const statusCode = (err as {response?: {statusCode?: unknown}}).response?.statusCode
	if (typeof statusCode === 'number') result.status_code = statusCode
	return result
}

// Map an arbitrary download-pipeline failure to a `DependencyFailureKind`.
// Used by `BinaryResolver` to record `attempts[]` entries on its strategy chain.
export function classifyDownloadError(err: unknown): DependencyFailureKind {
	if (isAbortError(err)) return 'timeout'
	const msg = err instanceof Error ? err.message.toLowerCase() : ''
	if (msg.includes('checksum')) return 'hash_failed'
	if (msg.includes('archive') || msg.includes('did not contain') || msg.includes('extract')) return 'extract_failed'
	return 'download_failed'
}
