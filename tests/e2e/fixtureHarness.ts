import {spawn, execFile} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import {createRequire} from 'node:module'
import {promisify} from 'node:util'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {defaultAppSettings} from '../../src/shared/constants.js'
import {downloadFile, downloadText, parseShaLine, sha256ForFile} from '../../src/main/services/binary/BinaryDownloader.js'
import type {ExploreCookie} from '../../src/shared/sites/types.js'
import type {AppSettings} from '../../src/shared/types.js'
import {FIXTURE_MEDIA_CATALOG_PATH, FIXTURE_MEDIA_FORMAT_IDS, FIXTURE_OVERLAP_PLAYLIST_ID, FIXTURE_PLAYLIST_ID, FIXTURE_REPEATED_PLAYLIST_ID, fixtureMediaContentType, fixtureMediaKind} from './fixtureMediaCatalog.js'
export {
	AWKWARD_TITLE_VIDEO_ID,
	FIXTURE_OVERLAP_PLAYLIST_TITLE,
	FIXTURE_OVERLAP_PLAYLIST_VIDEO_IDS,
	FIXTURE_PLAYLIST_ID,
	FIXTURE_PLAYLIST_VIDEO_IDS,
	FIXTURE_REPEATED_PLAYLIST_TITLE,
	FIXTURE_REPEATED_PLAYLIST_UNIQUE_VIDEO_IDS,
	FIXTURE_REPEATED_PLAYLIST_VIDEO_IDS,
	FIXTURE_VIDEO_IDS,
	SPLIT_MEDIA_VIDEO_ID
} from './fixtureMediaCatalog.js'

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
	// Lets a held slow download finish: its held bytes go out at once, and later
	// requests for that video are served at full speed. No id releases them all.
	releaseSlowMedia: (videoId?: string) => void
	// Lets a held probe answer (metadataHeldIds), now and from then on. No id
	// releases them all.
	releaseMetadata: (videoId?: string) => void
	telemetry: () => FixtureServerTelemetry
	resetTelemetry: () => void
	close: () => Promise<void>
}

export interface FixtureServerBehavior {
	metadataDelayMs?: number | Record<string, number>
	metadataFailureIds?: readonly string[]
	// Probes for these videos stay open until the test calls releaseMetadata,
	// however slow the host: no delay to outrun. Any metadataDelayMs and
	// metadataFailureIds apply once released.
	metadataHeldIds?: readonly string[]
	// Media for these videos trickles, then holds its last bytes until the test
	// calls releaseSlowMedia: the download stays running however slow the host.
	mediaSlowIds?: readonly string[]
	mediaFailureIds?: readonly string[]
	mediaFailuresBeforeSuccess?: Record<string, number>
	mediaFormatFailuresBeforeSuccess?: Record<string, number>
	mediaFormatTruncateIds?: readonly string[]
	subtitleFailureIds?: readonly string[]
	// Per video, what each successive extraction reports, in order; once the
	// list runs out, extractions behave normally. Lets a scenario reproduce
	// YouTube's warnings and refusals with yt-dlp's own wording.
	extractionScript?: Record<string, readonly FixtureExtractionStep[]>
}

export interface FixtureExtractionStep {
	// Printed as yt-dlp warnings; the extraction still succeeds.
	warnings?: readonly string[]
	// Raised as an expected ExtractorError: yt-dlp prints `ERROR: [youtube] <id>: <error>`.
	error?: string
}

// What yt-dlp actually parsed from --extractor-args for the youtube extractor,
// read inside the extraction. Presence only for the token and visitor data:
// the values never leave the extractor.
export interface FixtureParsedExtractorArgs {
	poToken: boolean
	visitorData: boolean
	playerClient: string[] | null
}

export type FixtureServerRequest =
	// signedIn: whether yt-dlp ran this extraction with cookies. marker: the
	// seeded Explore session's fixture cookie, null for any other run.
	// cookieDomains: the domains of every cookie yt-dlp held (never values).
	| {kind: 'probe-start'; videoId: string; at: number; activeProbeCount: number; signedIn: boolean; marker: string | null; cookieDomains: string[]; extractorArgs: FixtureParsedExtractorArgs}
	| {kind: 'probe-end'; videoId: string; at: number; activeProbeCount: number; status: number}
	| {kind: 'media'; videoId: string; formatId: string; method: string; at: number; status: number}
	| {kind: 'subtitle'; videoId: string; lang: string; track: 'manual' | 'auto'; at: number; status: number}
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
	metadataHeldIds: Set<string>
	mediaSlowIds: Set<string>
	mediaFailureIds: Set<string>
	mediaFailuresBeforeSuccess: Map<string, number>
	mediaFormatFailuresBeforeSuccess: Map<string, number>
	mediaFormatTruncateIds: Set<string>
	subtitleFailureIds: Set<string>
	extractionScript: Map<string, FixtureExtractionStep[]>
}

function parsedExtractorArgs(query: URLSearchParams): FixtureParsedExtractorArgs {
	const clients = query.get('playerClient')
	return {poToken: query.get('poToken') === '1', visitorData: query.get('visitorData') === '1', playerClient: clients === null ? null : clients.split(',')}
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

interface SplitMediaBuffers {
	video: Buffer
	audio: Buffer
}

// Both fixture media shapes are produced by spawning ffmpeg, which is slow
// enough to memoize across the whole test process but must retry on failure
// (a crashed ffmpeg must not poison later downloads). One helper owns that
// lazily-generated, process-lifetime contract so the two call sites stay a
// one-liner and cannot drift into two bespoke caches.
function memoized<T>(factory: () => Promise<T>): () => Promise<T> {
	let promise: Promise<T> | null = null
	return () => {
		promise ??= factory().catch(error => {
			promise = null
			throw error
		})
		return promise
	}
}

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

const splitMediaBuffers = memoized(generateSplitMediaBuffers)

// `generated-muxed` formats are served a real, ffmpeg-muxed MP4 because
// yt-dlp's --add-metadata / --embed-chapters postprocessor remuxes the
// container and rejects a header-only fake MP4 with "moov atom not found".
async function generateMuxedMediaBuffer(): Promise<Buffer> {
	const dir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'arroxy-fixture-muxed-media-'))
	const outPath = path.join(dir, 'muxed.mp4')
	const ffmpegPath = bundledFfmpegPath()
	const env = ffmpegEnv(ffmpegPath)
	try {
		// Sized to clear the >200KB plausibility oracle in expectMp4Count: 8s of
		// 400kbps 640x360 video + 96kbps audio lands ~324KB regardless of build.
		// A keyframe every second, like real streams, so a part of the video cut
		// on keyframes still holds roughly the range asked for.
		await execFileAsync(
			ffmpegPath,
			['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc=size=640x360:rate=30', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100', '-t', '8', '-c:v', 'libx264', '-b:v', '400k', '-g', '30', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', '-shortest', outPath],
			{env, timeout: 30_000}
		)
		return await fsPromises.readFile(outPath)
	} finally {
		await fsPromises.rm(dir, {recursive: true, force: true})
	}
}

const muxedMediaBuffer = memoized(generateMuxedMediaBuffer)

// The manual and automatic tracks carry different text so a downloaded file
// shows which track yt-dlp actually fetched.
function vtt(videoId: string, lang: string, track: 'manual' | 'auto'): Buffer {
	const cue = track === 'auto' ? `Fixture auto caption for ${videoId}` : lang === 'en' ? `Fixture subtitle for ${videoId}` : `Fixture ${lang} subtitle for ${videoId}`
	return Buffer.from(`WEBVTT\n\n00:00:00.000 --> 00:00:02.000\n${cue}\n`, 'utf8')
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

const SLOW_CHUNK_BYTES = 8_192
const SLOW_CHUNK_INTERVAL_MS = 75
// The held tail goes out one byte a second, inside the E2E socket timeout
// (5 s), so yt-dlp keeps waiting instead of retrying; 4 KB outlasts any test.
const HELD_TAIL_BYTES = 4_096
const HELD_BYTE_INTERVAL_MS = 1_000

// Registers the release that finishes a held response; returns its unregister.
type HoldSlowMedia = (release: () => void) => () => void

function streamSlowly(res: http.ServerResponse, body: Buffer, hold: HoldSlowMedia): void {
	const heldFrom = Math.max(0, body.length - HELD_TAIL_BYTES)
	let offset = 0
	let timer: NodeJS.Timeout | undefined
	const send = (bytes: number): void => {
		const next = Math.min(offset + bytes, body.length)
		res.write(body.subarray(offset, next))
		offset = next
	}
	const tick = (): void => {
		if (offset >= body.length) {
			res.end()
			return
		}
		if (offset < heldFrom) {
			send(Math.min(SLOW_CHUNK_BYTES, heldFrom - offset))
			timer = setTimeout(tick, SLOW_CHUNK_INTERVAL_MS)
		} else {
			send(1)
			timer = setTimeout(tick, HELD_BYTE_INTERVAL_MS)
		}
	}
	const unregister = hold(() => {
		clearTimeout(timer)
		res.end(body.subarray(offset))
		offset = body.length
	})
	res.on('close', () => {
		clearTimeout(timer)
		unregister()
	})
	tick()
}

function serveBuffer(req: http.IncomingMessage, res: http.ServerResponse, body: Buffer, contentType: string, hold?: HoldSlowMedia): void {
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
	if (hold) {
		streamSlowly(res, chunk, hold)
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
		metadataHeldIds: new Set(input.metadataHeldIds ?? []),
		mediaSlowIds: new Set(input.mediaSlowIds ?? []),
		mediaFailureIds: new Set(input.mediaFailureIds ?? []),
		mediaFailuresBeforeSuccess: new Map(Object.entries(input.mediaFailuresBeforeSuccess ?? {})),
		mediaFormatFailuresBeforeSuccess: new Map(Object.entries(input.mediaFormatFailuresBeforeSuccess ?? {})),
		mediaFormatTruncateIds: new Set(input.mediaFormatTruncateIds ?? []),
		subtitleFailureIds: new Set(input.subtitleFailureIds ?? []),
		extractionScript: new Map(Object.entries(input.extractionScript ?? {}).map(([videoId, steps]) => [videoId, [...steps]]))
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
	// Release callbacks of the slow responses still held, by video.
	const heldSlowMedia = new Map<string, Set<() => void>>()
	// Release callbacks of the probes still held, by video.
	const heldMetadata = new Map<string, Set<() => void>>()

	function holdMetadata(videoId: string): Promise<void> {
		return new Promise(resolve => {
			const held = heldMetadata.get(videoId) ?? new Set()
			heldMetadata.set(videoId, held)
			held.add(resolve)
		})
	}

	function releaseMetadata(videoId?: string): void {
		const videoIds = videoId === undefined ? new Set([...behavior.metadataHeldIds, ...heldMetadata.keys()]) : new Set([videoId])
		for (const id of videoIds) {
			behavior.metadataHeldIds.delete(id)
			const held = heldMetadata.get(id)
			heldMetadata.delete(id)
			for (const release of held ?? []) release()
		}
	}

	function holdSlowMedia(videoId: string): HoldSlowMedia {
		return release => {
			const held = heldSlowMedia.get(videoId) ?? new Set()
			heldSlowMedia.set(videoId, held)
			held.add(release)
			return () => held.delete(release)
		}
	}

	function releaseSlowMedia(videoId?: string): void {
		const videoIds = videoId === undefined ? new Set([...behavior.mediaSlowIds, ...heldSlowMedia.keys()]) : new Set([videoId])
		for (const id of videoIds) {
			behavior.mediaSlowIds.delete(id)
			const held = heldSlowMedia.get(id)
			heldSlowMedia.delete(id)
			for (const release of held ?? []) release()
		}
	}

	function record(request: FixtureServerRequest): void {
		requests.push(request)
	}

	async function handleProbe(videoId: string, query: URLSearchParams, res: http.ServerResponse): Promise<void> {
		activeProbes += 1
		maxActiveProbes = Math.max(maxActiveProbes, activeProbes)
		const cookieDomains = (query.get('domains') ?? '').split(',').filter(domain => domain !== '')
		record({kind: 'probe-start', videoId, activeProbeCount: activeProbes, signedIn: query.get('signedIn') === '1', marker: query.get('marker'), cookieDomains, extractorArgs: parsedExtractorArgs(query), at: Date.now()})
		if (behavior.metadataHeldIds.has(videoId)) await holdMetadata(videoId)
		const delayMs = metadataDelayFor(behavior, videoId)
		if (delayMs > 0) await delay(delayMs)
		const step = behavior.extractionScript.get(videoId)?.shift()
		const status = behavior.metadataFailureIds.has(videoId) ? 503 : step ? 200 : 204
		if (status === 200) {
			res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'})
			res.end(JSON.stringify(step))
		} else {
			res.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8'})
			res.end(status >= 400 ? `metadata failure for ${videoId}` : '')
		}
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

	async function bodyForMedia(formatId: string): Promise<{body: Buffer; contentType: string}> {
		const contentType = fixtureMediaContentType(formatId)
		switch (fixtureMediaKind(formatId)) {
			case 'generated-split-video':
				return {body: (await splitMediaBuffers()).video, contentType}
			case 'generated-split-audio':
				return {body: (await splitMediaBuffers()).audio, contentType}
			case 'generated-muxed':
				return {body: await muxedMediaBuffer(), contentType}
		}
	}

	const server = http.createServer((req, res) => {
		void (async () => {
			const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1')
			const probeMatch = /^\/probe\/([^/]+)$/.exec(requestUrl.pathname)
			if (probeMatch) {
				await handleProbe(probeMatch[1], requestUrl.searchParams, res)
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
				const {body, contentType} = await bodyForMedia(formatId)
				if (shouldTruncateMedia(videoId, formatId, method)) {
					record({kind: 'media', videoId, formatId, method, status: 599, at: Date.now()})
					serveTruncatedBuffer(req, res, body, contentType)
					return
				}
				record({kind: 'media', videoId, formatId, method, status: 200, at: Date.now()})
				serveBuffer(req, res, body, contentType, behavior.mediaSlowIds.has(videoId) ? holdSlowMedia(videoId) : undefined)
				return
			}
			const thumbMatch = /^\/thumbnails\/([^/]+)\.jpg$/.exec(requestUrl.pathname)
			if (thumbMatch) {
				record({kind: 'thumbnail', videoId: thumbMatch[1], status: 200, at: Date.now()})
				serveBuffer(req, res, JPEG_1X1, 'image/jpeg')
				return
			}
			const subtitleMatch = /^\/subtitles\/([^/]+)\/(en|es|de)(\.auto)?\.vtt$/.exec(requestUrl.pathname)
			if (subtitleMatch) {
				const videoId = subtitleMatch[1]
				const lang = subtitleMatch[2]
				const track = subtitleMatch[3] ? 'auto' : 'manual'
				if (behavior.subtitleFailureIds.has(videoId)) {
					record({kind: 'subtitle', videoId, lang, track, status: 503, at: Date.now()})
					res.writeHead(503, {'Content-Type': 'text/plain; charset=utf-8'})
					res.end(`subtitle failure for ${videoId}`)
					return
				}
				record({kind: 'subtitle', videoId, lang, track, status: 200, at: Date.now()})
				serveBuffer(req, res, vtt(videoId, lang, track), 'text/vtt; charset=utf-8')
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
			for (const videoId of heldSlowMedia.keys()) if (!behavior.mediaSlowIds.has(videoId)) releaseSlowMedia(videoId)
			for (const videoId of heldMetadata.keys()) if (!behavior.metadataHeldIds.has(videoId)) releaseMetadata(videoId)
		},
		releaseSlowMedia,
		releaseMetadata,
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
		close: () => {
			// A held probe would keep its connection, and so the server, open.
			releaseMetadata()
			return closeServer(server)
		}
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

// A video opened from inside the fixture playlist: YouTube's `watch?v=…&list=…`.
export function fixtureVideoInPlaylistUrl(videoId: string): string {
	return `https://www.youtube.com/watch?v=${videoId}&list=${FIXTURE_PLAYLIST_ID}`
}

export function fixturePlaylistUrl(): string {
	return `https://www.youtube.com/playlist?list=${FIXTURE_PLAYLIST_ID}`
}

export function fixtureRepeatedPlaylistUrl(): string {
	return `https://www.youtube.com/playlist?list=${FIXTURE_REPEATED_PLAYLIST_ID}`
}

export function fixtureOverlapPlaylistUrl(): string {
	return `https://www.youtube.com/playlist?list=${FIXTURE_OVERLAP_PLAYLIST_ID}`
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

/**
 * Produce a file at `destination` without ever exposing a partial one.
 *
 * The runtime cache lives at a fixed path shared by every Playwright worker,
 * and workers are separate processes — so the per-process memo in
 * prepareFixtureRuntime does not serialize them. On a cold cache several
 * workers reach this path at once. Writing in place lets one worker read a
 * half-written binary, or delete the file another is still verifying.
 *
 * Each caller writes to a private staging path and renames into place. Rename
 * is atomic within a directory, so a concurrent reader sees either no file or
 * the whole file. Last writer wins, and every candidate is byte-identical.
 */
// Windows refuses to rename over a file another process has open, which is
// exactly what a parallel worker that just won the same race looks like. POSIX
// renames over it silently, so this only ever fires on Windows.
const WINDOWS_RENAME_COLLISION_CODES = new Set(['EPERM', 'EEXIST', 'EACCES', 'EBUSY'])

async function installedByAnotherWorker(destination: string): Promise<boolean> {
	if (process.platform !== 'win32') return false
	// Existence alone is not enough: the whole point of staging is that a
	// half-written file must never be mistaken for a finished one. A rename that
	// lost the race leaves a complete, non-empty file behind, so require that
	// before treating the collision as success.
	const stat = await fsPromises.stat(destination).catch(() => null)
	return stat?.isFile() === true && stat.size > 0
}

export async function installAtomically(destination: string, produce: (staging: string) => Promise<void>): Promise<void> {
	await fsPromises.mkdir(path.dirname(destination), {recursive: true})
	const staging = `${destination}.${process.pid}.${randomUUID()}.part`
	try {
		await produce(staging)
		try {
			await fsPromises.rename(staging, destination)
		} catch (renameError) {
			const code = (renameError as {code?: string}).code ?? ''
			if (!WINDOWS_RENAME_COLLISION_CODES.has(code) || !(await installedByAnotherWorker(destination))) throw renameError
			await fsPromises.rm(staging, {force: true})
		}
	} catch (error) {
		// Debris here would be mistaken for a cached binary by a later run.
		await fsPromises.rm(staging, {force: true})
		throw error
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
	try {
		await installAtomically(destination, staging => downloadYtDlp(staging))
	} catch (error) {
		// A worker that lost the race still wins if the winner's file is good.
		if (await canRunYtDlp(destination)) return destination
		throw error
	}
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

export interface FixtureEnvInput {
	userDataDir: string
	fixtureServer: FixtureServer
	denyProxy: DenyProxy
	ytDlpPath: string
	// Seed file for the Explore partition, written by writeExploreCookies.
	exploreCookiesPath?: string
	// A local page the Explore view opens instead of YouTube (ARROXY_E2E_EXPLORE_HOME).
	exploreHomeUrl?: string
	// A filter list file the Explore ad blocker is built from (ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS).
	exploreAdBlockFiltersPath?: string
	// How long Explore waits after the tab is left before releasing the page (ARROXY_E2E_EXPLORE_IDLE_MS).
	exploreIdleUnloadMs?: number
}

export function buildFixtureEnv(input: FixtureEnvInput): Record<string, string> {
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
	// Hotkey OS notifications post into a sink file instead of the OS so the
	// hotkey spec can assert them deterministically (see fixture-hotkey.spec).
	env.ARROXY_E2E_OS_NOTIFIER_SINK_PATH = path.join(input.userDataDir, 'hotkey-os-notifications.log')
	if (input.exploreCookiesPath) env.ARROXY_E2E_EXPLORE_COOKIES = input.exploreCookiesPath
	else delete env.ARROXY_E2E_EXPLORE_COOKIES
	if (input.exploreHomeUrl) env.ARROXY_E2E_EXPLORE_HOME = input.exploreHomeUrl
	else delete env.ARROXY_E2E_EXPLORE_HOME
	if (input.exploreAdBlockFiltersPath) env.ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS = input.exploreAdBlockFiltersPath
	else delete env.ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS
	if (input.exploreIdleUnloadMs !== undefined) env.ARROXY_E2E_EXPLORE_IDLE_MS = String(input.exploreIdleUnloadMs)
	else delete env.ARROXY_E2E_EXPLORE_IDLE_MS
	delete env.MOCK_BACKEND
	delete env.ELECTRON_RUN_AS_NODE
	return env
}

export function buildFixtureElectronEnv(input: FixtureEnvInput): Record<string, string> {
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
	// Keep unrelated product workflows from claiming the OS-level global chord.
	settings.common.hotkeyEnabled = false
	settings.common.analyticsEnabled = false
	settings.common.networkPacingPreset = 'custom'
	settings.common.embedChapters = false
	settings.common.embedMetadata = false
	settings.common.embedThumbnail = false
	settings.common.writeDescription = false
	settings.common.writeThumbnail = false
	settings.common.firstRunCompleted = true
	// Suppress the "What's new in Arroxy <version>" dialog. shouldShowWhatsNew()
	// fires whenever lastReleaseNotesVersionShown is unset and launchCount > 1,
	// and its modal overlay covers the tab strip — which blocks every workflow
	// test that clicks a tab. A sentinel above any real version keeps this from
	// silently re-breaking on the next release.
	settings.common.lastReleaseNotesVersionShown = '999.0.0'
	settings.common.launchCount = 3
	configure?.(settings)
	fs.writeFileSync(path.join(userDataDir, 'settings.json'), JSON.stringify(settings), 'utf8')
}

/**
 * Writes the cookies the app seeds into its Explore partition at startup
 * (ARROXY_E2E_EXPLORE_COOKIES). The file lives in the run's own userData dir,
 * so a seeded session never outlives its scenario.
 */
export function writeExploreCookies(userDataDir: string, cookies: readonly ExploreCookie[]): string {
	fs.mkdirSync(userDataDir, {recursive: true})
	const file = path.join(userDataDir, 'e2e-explore-cookies.json')
	fs.writeFileSync(file, JSON.stringify(cookies), 'utf8')
	return file
}

export function assertNoExternalRequests(proxy: DenyProxy): void {
	if (proxy.requests.length > 0) {
		throw new Error(`Fixture E2E attempted external network through deny proxy: ${JSON.stringify(proxy.requests, null, 2)}`)
	}
}

// The Electron binary the fixture specs launch the built app with.
export function electronExecutable(): string {
	const resolved: unknown = createRequire(path.join(process.cwd(), 'package.json'))('electron')
	if (typeof resolved !== 'string') throw new Error('electron package did not resolve to an executable path')
	return resolved
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
