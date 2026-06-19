import {spawn, execFile} from 'node:child_process'
import {promisify} from 'node:util'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {defaultAppSettings} from '../../src/shared/constants.js'
import {downloadFile, downloadText, parseShaLine, sha256ForFile} from '../../src/main/services/binary/BinaryDownloader.js'
import type {AppSettings} from '../../src/shared/types.js'
import {FIXTURE_MEDIA_CATALOG_PATH, FIXTURE_MEDIA_FORMAT_IDS, FIXTURE_PLAYLIST_ID, fixtureMediaContentType, fixtureMediaFileSize, fixtureMediaKind, type FixtureMediaKind} from './fixtureMediaCatalog.js'
export {FIXTURE_PLAYLIST_ID, FIXTURE_PLAYLIST_VIDEO_IDS, FIXTURE_VIDEO_IDS, SPLIT_MEDIA_VIDEO_ID} from './fixtureMediaCatalog.js'

const execFileAsync = promisify(execFile)

const FIXTURE_PLUGIN_ROOT = path.join(process.cwd(), 'tests', 'e2e', 'yt-dlp-plugins')
export const FIXTURE_PLUGIN_DIR_ARG = path.dirname(FIXTURE_PLUGIN_ROOT)
const FIXTURE_MEDIA_ROUTE = new RegExp(`^/media/([^/]+)/(${FIXTURE_MEDIA_FORMAT_IDS.join('|')})\\.(?:mp4|m4a)$`)

const JPEG_1X1 = Buffer.from(
	'/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z',
	'base64'
)

export interface FixtureServer {
	baseUrl: string
	setBehavior: (behavior: FixtureServerBehavior) => void
	telemetry: () => FixtureServerTelemetry
	resetTelemetry: () => void
	close: () => Promise<void>
}

export interface FixtureServerBehavior {
	metadataDelayMs?: number | Record<string, number>
	metadataFailureIds?: readonly string[]
	mediaSlowIds?: readonly string[]
	mediaFailureIds?: readonly string[]
	mediaFailuresBeforeSuccess?: Record<string, number>
	mediaFormatFailuresBeforeSuccess?: Record<string, number>
	mediaFormatTruncateIds?: readonly string[]
	subtitleFailureIds?: readonly string[]
}

export type FixtureServerRequest =
	| {kind: 'probe-start'; videoId: string; at: number; activeProbeCount: number}
	| {kind: 'probe-end'; videoId: string; at: number; activeProbeCount: number; status: number}
	| {kind: 'media'; videoId: string; formatId: string; method: string; at: number; status: number}
	| {kind: 'subtitle'; videoId: string; at: number; status: number}
	| {kind: 'thumbnail'; videoId: string; at: number; status: number}

export interface FixtureServerTelemetry {
	requests: FixtureServerRequest[]
	activeProbes: number
	maxActiveProbes: number
	mediaRequestsById: Record<string, number>
}

interface NormalizedFixtureBehavior {
	metadataDelayMs: number | Record<string, number>
	metadataFailureIds: Set<string>
	mediaSlowIds: Set<string>
	mediaFailureIds: Set<string>
	mediaFailuresBeforeSuccess: Map<string, number>
	mediaFormatFailuresBeforeSuccess: Map<string, number>
	mediaFormatTruncateIds: Set<string>
	subtitleFailureIds: Set<string>
}

export interface DenyProxy {
	proxyUrl: string
	requests: DeniedNetworkRequest[]
	close: () => Promise<void>
}

export interface DeniedNetworkRequest {
	method: string
	target: string
}

export interface ProcessResult {
	exitCode: number | null
	stdout: string
	stderr: string
}

function listen(server: http.Server): Promise<number> {
	return new Promise((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', () => {
			server.off('error', reject)
			const address = server.address()
			if (!address || typeof address === 'string') {
				reject(new Error('Server did not bind to a TCP port'))
				return
			}
			resolve(address.port)
		})
	})
}

function closeServer(server: http.Server): Promise<void> {
	return new Promise((resolve, reject) => {
		server.close(err => {
			if (err) reject(err)
			else resolve()
		})
	})
}

function mediaBuffer(videoId: string, formatId: string): Buffer {
	const size = fixtureMediaFileSize(formatId)
	const header = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32])
	const buffer = Buffer.alloc(size)
	header.copy(buffer)
	for (let i = header.length; i < buffer.length; i += 1) {
		buffer[i] = (videoId.charCodeAt(i % videoId.length) + formatId.charCodeAt(0) + i) % 251
	}
	return buffer
}

interface SplitMediaBuffers {
	video: Buffer
	audio: Buffer
}

let splitMediaBuffersPromise: Promise<SplitMediaBuffers> | null = null

function bundledFfmpegPath(): string {
	const ext = process.platform === 'win32' ? '.exe' : ''
	const arch = process.arch === 'arm64' ? 'arm64' : 'x64'
	const bundled = path.join(process.cwd(), 'build', 'embedded', `${process.platform}-${arch}`, `ffmpeg${ext}`)
	if (fs.existsSync(bundled)) return bundled
	return process.env.ARROXY_FFMPEG_PATH ?? 'ffmpeg'
}

function ffmpegEnv(ffmpegPath: string): NodeJS.ProcessEnv {
	const ffmpegDir = path.dirname(ffmpegPath)
	const env = {...process.env}
	env.PATH = `${ffmpegDir}${path.delimiter}${env.PATH ?? ''}`
	if (process.platform === 'linux') env.LD_LIBRARY_PATH = `${ffmpegDir}${path.delimiter}${env.LD_LIBRARY_PATH ?? ''}`
	if (process.platform === 'darwin') env.DYLD_LIBRARY_PATH = `${ffmpegDir}${path.delimiter}${env.DYLD_LIBRARY_PATH ?? ''}`
	return env
}

async function generateSplitMediaBuffers(): Promise<SplitMediaBuffers> {
	const dir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'arroxy-fixture-split-media-'))
	const videoPath = path.join(dir, 'video.mp4')
	const audioPath = path.join(dir, 'audio.m4a')
	const ffmpegPath = bundledFfmpegPath()
	const env = ffmpegEnv(ffmpegPath)
	try {
		await execFileAsync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc=size=64x64:rate=1', '-t', '1', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', videoPath], {env, timeout: 30_000})
		await execFileAsync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100', '-t', '1', '-vn', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', audioPath], {env, timeout: 30_000})
		return {video: await fsPromises.readFile(videoPath), audio: await fsPromises.readFile(audioPath)}
	} finally {
		await fsPromises.rm(dir, {recursive: true, force: true})
	}
}

function splitMediaBuffers(): Promise<SplitMediaBuffers> {
	splitMediaBuffersPromise ??= generateSplitMediaBuffers().catch(error => {
		splitMediaBuffersPromise = null
		throw error
	})
	return splitMediaBuffersPromise
}

function vtt(videoId: string): Buffer {
	return Buffer.from(`WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nFixture subtitle for ${videoId}\n`, 'utf8')
}

function parseRange(range: string | undefined, size: number): {start: number; end: number} | null {
	if (!range) return null
	const match = /^bytes=(\d*)-(\d*)$/.exec(range)
	if (!match) return null
	const start = match[1] ? Number.parseInt(match[1], 10) : 0
	const end = match[2] ? Number.parseInt(match[2], 10) : size - 1
	if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return null
	return {start, end: Math.min(end, size - 1)}
}

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function streamSlowly(res: http.ServerResponse, body: Buffer): void {
	let offset = 0
	const timer = setInterval(() => {
		if (offset >= body.length) {
			clearInterval(timer)
			res.end()
			return
		}
		const next = Math.min(offset + 8_192, body.length)
		res.write(body.subarray(offset, next))
		offset = next
	}, 75)
	res.on('close', () => clearInterval(timer))
}

function serveBuffer(req: http.IncomingMessage, res: http.ServerResponse, body: Buffer, contentType: string, slow: boolean): void {
	const range = parseRange(req.headers.range, body.length)
	const start = range?.start ?? 0
	const end = range?.end ?? body.length - 1
	const chunk = body.subarray(start, end + 1)
	const headers: http.OutgoingHttpHeaders = {'Accept-Ranges': 'bytes', 'Content-Type': contentType, 'Content-Length': chunk.length}
	if (range) {
		headers['Content-Range'] = `bytes ${start}-${end}/${body.length}`
		res.writeHead(206, headers)
	} else {
		res.writeHead(200, headers)
	}
	if (req.method === 'HEAD') {
		res.end()
		return
	}
	if (slow) {
		streamSlowly(res, chunk)
		return
	}
	res.end(chunk)
}

function serveTruncatedBuffer(req: http.IncomingMessage, res: http.ServerResponse, body: Buffer, contentType: string): void {
	const range = parseRange(req.headers.range, body.length)
	const start = range?.start ?? 0
	const end = range?.end ?? body.length - 1
	const chunk = body.subarray(start, end + 1)
	const headers: http.OutgoingHttpHeaders = {'Accept-Ranges': 'bytes', 'Content-Type': contentType, 'Content-Length': chunk.length}
	if (range) {
		headers['Content-Range'] = `bytes ${start}-${end}/${body.length}`
		res.writeHead(206, headers)
	} else {
		res.writeHead(200, headers)
	}
	if (req.method === 'HEAD') {
		res.end()
		return
	}
	if (range) {
		res.destroy()
		return
	}
	res.end(chunk.subarray(0, Math.max(1, Math.floor(chunk.length / 4))))
}

function normalizeBehavior(input: FixtureServerBehavior = {}): NormalizedFixtureBehavior {
	return {
		metadataDelayMs: input.metadataDelayMs ?? 0,
		metadataFailureIds: new Set(input.metadataFailureIds ?? []),
		mediaSlowIds: new Set(input.mediaSlowIds ?? []),
		mediaFailureIds: new Set(input.mediaFailureIds ?? []),
		mediaFailuresBeforeSuccess: new Map(Object.entries(input.mediaFailuresBeforeSuccess ?? {})),
		mediaFormatFailuresBeforeSuccess: new Map(Object.entries(input.mediaFormatFailuresBeforeSuccess ?? {})),
		mediaFormatTruncateIds: new Set(input.mediaFormatTruncateIds ?? []),
		subtitleFailureIds: new Set(input.subtitleFailureIds ?? [])
	}
}

function metadataDelayFor(behavior: NormalizedFixtureBehavior, videoId: string): number {
	if (typeof behavior.metadataDelayMs === 'number') return behavior.metadataDelayMs
	return behavior.metadataDelayMs[videoId] ?? 0
}

export async function startFixtureServer(initialBehavior: FixtureServerBehavior = {}): Promise<FixtureServer> {
	let behavior = normalizeBehavior(initialBehavior)
	let requests: FixtureServerRequest[] = []
	let activeProbes = 0
	let maxActiveProbes = 0

	function record(request: FixtureServerRequest): void {
		requests.push(request)
	}

	async function handleProbe(videoId: string, res: http.ServerResponse): Promise<void> {
		activeProbes += 1
		maxActiveProbes = Math.max(maxActiveProbes, activeProbes)
		record({kind: 'probe-start', videoId, activeProbeCount: activeProbes, at: Date.now()})
		const delayMs = metadataDelayFor(behavior, videoId)
		if (delayMs > 0) await delay(delayMs)
		const status = behavior.metadataFailureIds.has(videoId) ? 503 : 204
		res.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8'})
		res.end(status >= 400 ? `metadata failure for ${videoId}` : '')
		activeProbes -= 1
		record({kind: 'probe-end', videoId, activeProbeCount: activeProbes, status, at: Date.now()})
	}

	function shouldFailMedia(videoId: string): boolean {
		const remaining = behavior.mediaFailuresBeforeSuccess.get(videoId) ?? 0
		if (remaining > 0) {
			if (remaining === 1) behavior.mediaFailuresBeforeSuccess.delete(videoId)
			else behavior.mediaFailuresBeforeSuccess.set(videoId, remaining - 1)
			return true
		}
		return behavior.mediaFailureIds.has(videoId)
	}

	function shouldTruncateMedia(videoId: string, formatId: string, method: string | undefined): boolean {
		if (method === 'HEAD') return false
		const key = `${videoId}:${formatId}`
		if (behavior.mediaFormatTruncateIds.has(key)) return true
		const remaining = behavior.mediaFormatFailuresBeforeSuccess.get(key) ?? 0
		if (remaining <= 0) return false
		if (remaining === 1) behavior.mediaFormatFailuresBeforeSuccess.delete(key)
		else behavior.mediaFormatFailuresBeforeSuccess.set(key, remaining - 1)
		return true
	}

	async function bodyForMedia(videoId: string, formatId: string): Promise<{body: Buffer; contentType: string}> {
		const kind: FixtureMediaKind = fixtureMediaKind(formatId)
		if (kind === 'generated-split-video' || kind === 'generated-split-audio') {
			const buffers = await splitMediaBuffers()
			return kind === 'generated-split-video' ? {body: buffers.video, contentType: fixtureMediaContentType(formatId)} : {body: buffers.audio, contentType: fixtureMediaContentType(formatId)}
		}
		return {body: mediaBuffer(videoId, formatId), contentType: fixtureMediaContentType(formatId)}
	}

	const server = http.createServer((req, res) => {
		void (async () => {
			const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1')
			const probeMatch = /^\/probe\/([^/]+)$/.exec(requestUrl.pathname)
			if (probeMatch) {
				await handleProbe(probeMatch[1], res)
				return
			}
			const mediaMatch = FIXTURE_MEDIA_ROUTE.exec(requestUrl.pathname)
			if (mediaMatch) {
				const [, videoId, formatId] = mediaMatch
				const method = req.method ?? 'GET'
				if (shouldFailMedia(videoId)) {
					record({kind: 'media', videoId, formatId, method, status: 503, at: Date.now()})
					res.writeHead(503, {'Content-Type': 'text/plain; charset=utf-8'})
					res.end(`media failure for ${videoId}`)
					return
				}
				const {body, contentType} = await bodyForMedia(videoId, formatId)
				if (shouldTruncateMedia(videoId, formatId, method)) {
					record({kind: 'media', videoId, formatId, method, status: 599, at: Date.now()})
					serveTruncatedBuffer(req, res, body, contentType)
					return
				}
				record({kind: 'media', videoId, formatId, method, status: 200, at: Date.now()})
				serveBuffer(req, res, body, contentType, formatId === 'slow' || behavior.mediaSlowIds.has(videoId))
				return
			}
			const thumbMatch = /^\/thumbnails\/([^/]+)\.jpg$/.exec(requestUrl.pathname)
			if (thumbMatch) {
				record({kind: 'thumbnail', videoId: thumbMatch[1], status: 200, at: Date.now()})
				serveBuffer(req, res, JPEG_1X1, 'image/jpeg', false)
				return
			}
			const subtitleMatch = /^\/subtitles\/([^/]+)\/en\.vtt$/.exec(requestUrl.pathname)
			if (subtitleMatch) {
				const videoId = subtitleMatch[1]
				if (behavior.subtitleFailureIds.has(videoId)) {
					record({kind: 'subtitle', videoId, status: 503, at: Date.now()})
					res.writeHead(503, {'Content-Type': 'text/plain; charset=utf-8'})
					res.end(`subtitle failure for ${videoId}`)
					return
				}
				record({kind: 'subtitle', videoId, status: 200, at: Date.now()})
				serveBuffer(req, res, vtt(videoId), 'text/vtt; charset=utf-8', false)
				return
			}
			res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'})
			res.end('not found')
		})().catch(error => {
			res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'})
			res.end(error instanceof Error ? error.message : String(error))
		})
	})
	const port = await listen(server)
	return {
		baseUrl: `http://127.0.0.1:${port}`,
		setBehavior: next => {
			behavior = normalizeBehavior(next)
		},
		telemetry: () => {
			const mediaRequestsById: Record<string, number> = {}
			for (const request of requests) {
				if (request.kind === 'media') mediaRequestsById[request.videoId] = (mediaRequestsById[request.videoId] ?? 0) + 1
			}
			return {requests: [...requests], activeProbes, maxActiveProbes, mediaRequestsById}
		},
		resetTelemetry: () => {
			requests = []
			activeProbes = 0
			maxActiveProbes = 0
		},
		close: () => closeServer(server)
	}
}

export async function startDenyProxy(): Promise<DenyProxy> {
	const requests: DeniedNetworkRequest[] = []
	const server = http.createServer((req, res) => {
		requests.push({method: req.method ?? 'GET', target: req.url ?? ''})
		res.writeHead(502, {'Content-Type': 'text/plain; charset=utf-8'})
		res.end('External network is disabled for Arroxy fixture E2E')
	})
	server.on('connect', (req, socket) => {
		requests.push({method: 'CONNECT', target: req.url ?? ''})
		socket.write('HTTP/1.1 502 Bad Gateway\r\nContent-Length: 0\r\n\r\n')
		socket.destroy()
	})
	const port = await listen(server)
	return {proxyUrl: `http://127.0.0.1:${port}`, requests, close: () => closeServer(server)}
}

export function fixtureUrl(videoId: string): string {
	return `https://www.youtube.com/watch?v=${videoId}`
}

export function fixturePlaylistUrl(): string {
	return `https://www.youtube.com/playlist?list=${FIXTURE_PLAYLIST_ID}`
}

async function canRunYtDlp(candidate: string): Promise<boolean> {
	try {
		const result = await runProcess(candidate, ['--version'], {timeoutMs: 20_000})
		return result.exitCode === 0 && result.stdout.trim().length > 0
	} catch {
		return false
	}
}

async function pathCandidate(): Promise<string | null> {
	const command = process.platform === 'win32' ? 'where' : 'which'
	try {
		const {stdout} = await execFileAsync(command, ['yt-dlp'], {timeout: 10_000})
		return (
			stdout
				.split(/\r?\n/)
				.map(line => line.trim())
				.find(Boolean) ?? null
		)
	} catch {
		return null
	}
}

function appCacheCandidates(): string[] {
	const exe = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
	if (process.platform === 'win32') {
		return [process.env.LOCALAPPDATA, process.env.APPDATA].filter((value): value is string => !!value).map(root => path.join(root, 'arroxy', 'runtime-cache', 'binaries', exe))
	}
	if (process.platform === 'darwin') {
		return [path.join(os.homedir(), 'Library', 'Application Support', 'arroxy', 'runtime-cache', 'binaries', exe)]
	}
	const configRoot = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config')
	return [path.join(configRoot, 'arroxy', 'runtime-cache', 'binaries', exe)]
}

function ytDlpAssetName(): string {
	if (process.platform === 'win32') return 'yt-dlp.exe'
	if (process.platform === 'darwin') return 'yt-dlp_macos'
	if (process.arch === 'arm64') return 'yt-dlp_linux_aarch64'
	return 'yt-dlp_linux'
}

async function downloadYtDlp(destination: string): Promise<void> {
	const asset = ytDlpAssetName()
	const baseUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download'
	const sums = await downloadText(`${baseUrl}/SHA2-256SUMS`)
	const expectedSha = parseShaLine(sums, asset)
	if (!expectedSha) throw new Error(`Could not find ${asset} in yt-dlp SHA2-256SUMS`)
	await downloadFile(`${baseUrl}/${asset}`, destination)
	const actualSha = await sha256ForFile(destination)
	if (actualSha !== expectedSha) {
		await fsPromises.rm(destination, {force: true})
		throw new Error(`yt-dlp checksum mismatch. Expected ${expectedSha}, got ${actualSha}`)
	}
	if (process.platform !== 'win32') {
		await fsPromises.chmod(destination, 0o755)
	}
}

export async function ensureYtDlpPath(): Promise<string> {
	const envCandidates = [process.env.ARROXY_YT_DLP_PATH, process.env.YT_DLP_PATH].filter((value): value is string => !!value)
	const pathFromPath = await pathCandidate()
	const candidates = [...envCandidates, ...(pathFromPath ? [pathFromPath] : []), ...appCacheCandidates()]
	for (const candidate of candidates) {
		if (await canRunYtDlp(candidate)) return candidate
	}

	const exe = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
	const destination = path.join(os.tmpdir(), 'arroxy-e2e-runtime-cache', exe)
	if (await canRunYtDlp(destination)) return destination
	await downloadYtDlp(destination)
	if (await canRunYtDlp(destination)) return destination
	throw new Error(`Downloaded yt-dlp is not runnable: ${destination}`)
}

export async function ensureHostEmbeddedBinaries(): Promise<void> {
	const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
	const result = await runProcess('bun', ['run', 'embed:fetch:host'], {env, cwd: process.cwd(), timeoutMs: 10 * 60_000})
	if (result.exitCode !== 0) {
		throw new Error(`embed:fetch:host failed with code ${result.exitCode}\n${result.stdout}\n${result.stderr}`)
	}
}

export function buildFixtureEnv(input: {userDataDir: string; fixtureServer: FixtureServer; denyProxy: DenyProxy; ytDlpPath: string}): Record<string, string> {
	const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
	env.ARROXY_E2E = '1'
	env.ELECTRON_USER_DATA = input.userDataDir
	env.ARROXY_E2E_YTDLP_PLUGIN_DIR = FIXTURE_PLUGIN_ROOT
	env.ARROXY_E2E_FIXTURE_BASE_URL = input.fixtureServer.baseUrl
	env.ARROXY_E2E_FIXTURE_CATALOG_PATH = FIXTURE_MEDIA_CATALOG_PATH
	env.ARROXY_YT_DLP_PATH = input.ytDlpPath
	env.ARROXY_E2E_DENY_PROXY_URL = input.denyProxy.proxyUrl
	env.HTTP_PROXY = input.denyProxy.proxyUrl
	env.HTTPS_PROXY = input.denyProxy.proxyUrl
	env.ALL_PROXY = input.denyProxy.proxyUrl
	env.http_proxy = input.denyProxy.proxyUrl
	env.https_proxy = input.denyProxy.proxyUrl
	env.all_proxy = input.denyProxy.proxyUrl
	env.NO_PROXY = '127.0.0.1,localhost,::1'
	env.no_proxy = env.NO_PROXY
	delete env.MOCK_BACKEND
	delete env.ELECTRON_RUN_AS_NODE
	return env
}

export function buildFixtureElectronEnv(input: {userDataDir: string; fixtureServer: FixtureServer; denyProxy: DenyProxy; ytDlpPath: string}): Record<string, string> {
	const env = buildFixtureEnv(input)
	for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy']) {
		delete env[key]
	}
	return env
}

export function writeE2eSettings(userDataDir: string, outputDir: string, configure?: (settings: AppSettings) => void): void {
	fs.mkdirSync(userDataDir, {recursive: true})
	const settings = defaultAppSettings(outputDir)
	settings.common.defaultOutputDir = outputDir
	settings.common.rememberLastOutputDir = false
	settings.common.clipboardWatchEnabled = false
	settings.common.analyticsEnabled = false
	settings.common.networkPacingPreset = 'custom'
	settings.common.embedChapters = false
	settings.common.embedMetadata = false
	settings.common.embedThumbnail = false
	settings.common.writeDescription = false
	settings.common.writeThumbnail = false
	settings.common.firstRunCompleted = true
	settings.common.launchCount = 3
	configure?.(settings)
	fs.writeFileSync(path.join(userDataDir, 'settings.json'), JSON.stringify(settings), 'utf8')
}

export function assertNoExternalRequests(proxy: DenyProxy): void {
	if (proxy.requests.length > 0) {
		throw new Error(`Fixture E2E attempted external network through deny proxy: ${JSON.stringify(proxy.requests, null, 2)}`)
	}
}

export function runProcess(file: string, args: string[], opts: {env?: Record<string, string>; cwd?: string; timeoutMs?: number} = {}): Promise<ProcessResult> {
	return new Promise((resolve, reject) => {
		const child = spawn(file, args, {cwd: opts.cwd, env: opts.env, stdio: ['ignore', 'pipe', 'pipe']})
		let stdout = ''
		let stderr = ''
		let settled = false
		const timer = opts.timeoutMs
			? setTimeout(() => {
					child.kill('SIGKILL')
					if (!settled) {
						settled = true
						reject(new Error(`Process timed out after ${opts.timeoutMs}ms: ${file} ${args.join(' ')}`))
					}
				}, opts.timeoutMs)
			: null
		child.stdout.on('data', (chunk: Buffer) => {
			stdout += chunk.toString()
		})
		child.stderr.on('data', (chunk: Buffer) => {
			stderr += chunk.toString()
		})
		child.on('error', err => {
			if (timer) clearTimeout(timer)
			if (!settled) {
				settled = true
				reject(err)
			}
		})
		child.on('close', exitCode => {
			if (timer) clearTimeout(timer)
			if (!settled) {
				settled = true
				resolve({exitCode, stdout, stderr})
			}
		})
	})
}
