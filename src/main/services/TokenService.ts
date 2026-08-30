import log from 'electron-log/main.js'
import {nonEmpty} from '@shared/format.js'
import {unknownToMessage} from '@main/utils/errorFactory.js'
import type {TokenProvider} from '@main/token/TokenProvider.js'

const logger = log.scope('token')

// Inline YT video-ID extractor — only call site that ever needed url.ts. The
// PoT scrape only runs against YouTube URLs (gated by isYouTubeExtractor at
// download-time), so this function only ever sees youtube.com / youtu.be hosts.
function parseYouTubeVideoId(url: string): string | null {
	try {
		const parsed = new URL(url)
		const host = parsed.hostname.toLowerCase()
		if (host === 'youtu.be') return parsed.pathname.slice(1).split('?')[0] || null
		if (host.endsWith('youtube.com')) return parsed.searchParams.get('v')
		return null
	} catch {
		return null
	}
}

const TTL_MS = 5 * 60 * 60 * 1_000 // 5 hours — within ~6 h token lifetime

// Distinguishes "the caller gave up" from a provider failure, so an abort is not
// reported as an error the user could act on.
class WarmUpAborted extends Error {}

// None of the provider's stages take an AbortSignal, and `ensureReady` in
// particular awaits `did-finish-load` with no timer — a page that connects but
// never finishes leaves it pending forever. Checking `signal.aborted` between
// awaits therefore does nothing in the one case a budget exists for. Racing the
// signal lets warmUp settle anyway; returning disposes the hidden window, and
// destroying that window is what actually ends the work.
function untilAborted<T>(work: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
	if (!signal) return work
	// An already-aborted signal never emits 'abort', so a listener added now would
	// never fire. Without this the hang simply moves one stage later: abort during
	// stage one, and stage two races something that can never settle.
	if (signal.aborted) return Promise.reject(new WarmUpAborted())
	return Promise.race([
		work,
		new Promise<never>((_, reject) => {
			signal.addEventListener('abort', () => reject(new WarmUpAborted()), {once: true})
		})
	])
}

interface TokenCache {
	token: string
	visitorData: string
	mintedAt: number
}

export class TokenService {
	private cache: TokenCache | null = null

	constructor(private readonly provider: TokenProvider) {}

	// Both entrypoints below drive the same hidden window, and both used to
	// destroy it on the way out regardless of who else was still mid-scrape. That
	// needs no user cancel to go wrong: the fire-and-forget startup warm-up racing
	// a queue item's on-demand mint is enough, and the loser lands on a destroyed
	// webContents. The lease makes the teardown belong to whoever leaves last.
	private lease(): Disposable {
		this.provider.acquireWindow()
		return {[Symbol.dispose]: () => this.provider.releaseWindow()}
	}

	async warmUp(signal?: AbortSignal): Promise<{ready: boolean; reason?: string}> {
		if (signal?.aborted) return {ready: false, reason: 'cancelled'}
		using _window = this.lease()
		try {
			await untilAborted(this.provider.ensureReady(), signal)
			const visitorData = await untilAborted(this.provider.getVisitorData(), signal)
			if (!visitorData) return {ready: false, reason: 'no-visitor-data'}
			const token = await untilAborted(this.provider.mintToken(visitorData), signal)
			this.cache = {token, visitorData, mintedAt: Date.now()}
			logger.info('PO token pre-warmed')
			return {ready: true}
		} catch (err) {
			if (err instanceof WarmUpAborted) return {ready: false, reason: 'cancelled'}
			const reason = unknownToMessage(err)
			logger.warn('Token warm-up failed (non-fatal)', {error: reason})
			return {ready: false, reason}
		}
	}

	invalidateCache(): void {
		this.cache = null
	}

	async mintTokenForUrl(url: string): Promise<{token: string; visitorData: string; fromCache: boolean}> {
		if (this.cache && Date.now() - this.cache.mintedAt < TTL_MS) {
			return {token: this.cache.token, visitorData: this.cache.visitorData, fromCache: true}
		}
		using _window = this.lease()
		await this.provider.ensureReady()
		const visitorData = await this.provider.getVisitorData()
		const binding = nonEmpty(visitorData) ?? parseYouTubeVideoId(url) ?? url
		logger.info('Minting PO token', {bindingLength: binding.length})
		const token = await this.provider.mintToken(binding)
		this.cache = {token, visitorData, mintedAt: Date.now()}
		return {token, visitorData, fromCache: false}
	}

	dispose(): void {
		this.cache = null
		this.provider.dispose()
	}
}
