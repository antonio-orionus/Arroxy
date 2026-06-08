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

interface TokenCache {
	token: string
	visitorData: string
	mintedAt: number
}

export class TokenService {
	private cache: TokenCache | null = null

	constructor(private readonly provider: TokenProvider) {}

	async warmUp(signal?: AbortSignal): Promise<{ready: boolean; reason?: string}> {
		if (signal?.aborted) return {ready: false, reason: 'cancelled'}
		using _window = {[Symbol.dispose]: () => this.provider.releaseWindow()}
		try {
			await this.provider.ensureReady()
			if (signal?.aborted) return {ready: false, reason: 'cancelled'}
			const visitorData = await this.provider.getVisitorData()
			if (signal?.aborted) return {ready: false, reason: 'cancelled'}
			if (!visitorData) return {ready: false, reason: 'no-visitor-data'}
			const token = await this.provider.mintToken(visitorData)
			if (signal?.aborted) return {ready: false, reason: 'cancelled'}
			this.cache = {token, visitorData, mintedAt: Date.now()}
			logger.info('PO token pre-warmed')
			return {ready: true}
		} catch (err) {
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
		using _window = {[Symbol.dispose]: () => this.provider.releaseWindow()}
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
