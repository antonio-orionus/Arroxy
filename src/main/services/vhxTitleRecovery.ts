// Recovery for VHX (Vimeo OTT) "Untitled" video titles.
//
// Sites built on Vimeo OTT (vhx.tv — e.g. trilogyplus.com) embed their player
// from embed.vhx.tv. yt-dlp's VHXEmbedIE reads the VHX player config, whose
// video.title is often unset, and falls back to the literal sentinel 'Untitled'
// (codified in VHXEmbedIE's own tests). Because GenericIE merges the parent
// page's metadata *under* the embed result (merge_dicts keeps the embed's
// non-empty fields), the real page title — present in the parent page's
// og:title — is discarded.
//
// Arroxy-side recovery: when a probe resolves through the VHX embed extractor
// with the sentinel title, fetch the parent page (the referer yt-dlp smuggles
// into webpage_url) and read its curated preview title (og:title /
// twitter:title). Deliberately NOT a plain <title> fallback: logged-out fetches
// of paywalled VHX pages can return generic marketing titles there, while
// og:* meta has been observed to stay video-specific.
//
// Failure is always non-fatal: any miss keeps the sentinel and the download
// proceeds exactly as before.

import fetch from 'make-fetch-happen'

const VHX_UNTITLED_SENTINEL = 'Untitled'

/** Extractor keys/ids under which yt-dlp surfaces VHX embed extraction. */
const VHX_EXTRACTOR_KEYS = new Set(['VHXEmbed'])
const VHX_EXTRACTOR_IDS = ['vhx:']
const VHX_EMBED_HOST_RE = /(^|\.)embed\.vhx\.tv$/i
const FETCH_TIMEOUT_MS = 10_000
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

/** Returns the page HTML, or null when the fetch fails or the response is not usable. Never throws. */
export type VhxTitleFetcher = (url: string, signal: AbortSignal) => Promise<string | null>

export interface VhxPageTitleMeta {
	title: string | null
	siteName: string | null
}

export function isVhxSentinelTitle(title: string): boolean {
	return title === VHX_UNTITLED_SENTINEL
}

export function isVhxEmbedExtractor(extractor: string | undefined, extractorKey: string | undefined): boolean {
	if (extractorKey !== undefined && VHX_EXTRACTOR_KEYS.has(extractorKey)) return true
	return extractor !== undefined && VHX_EXTRACTOR_IDS.some(prefix => extractor.startsWith(prefix))
}

function decodeHtmlEntities(input: string): string {
	return input.replace(/&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|([a-zA-Z]+));/g, (match: string, hex: string | undefined, dec: string | undefined, named: string | undefined): string => {
		if (hex) {
			const code = Number.parseInt(hex, 16)
			return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : match
		}
		if (dec) {
			const code = Number.parseInt(dec, 10)
			return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : match
		}
		const entity = named !== undefined ? NAMED_ENTITIES[named.toLowerCase()] : undefined
		return entity ?? match
	})
}

const NAMED_ENTITIES: Record<string, string> = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '}

// Content-before-name order is handled by matching the whole <meta> tag first,
// then pulling the content attribute out of it.
function metaContent(html: string, key: 'og:title' | 'twitter:title' | 'og:site_name'): string | null {
	for (const tag of html.matchAll(META_TAG_PATTERNS[key])) {
		const content = /content=["']([^"']*)["']/i.exec(tag[0])
		if (content?.[1]) return decodeHtmlEntities(content[1]).trim() || null
	}
	return null
}

// Literal, precompiled pattern per key — keys are a closed set, so no dynamic
// RegExp construction is needed (and oxlint's non-literal-RegExp rule stays
// satisfied). Regexes carry the `g` flag for matchAll and are stateless because
// matchAll does not mutate lastIndex.
const META_TAG_PATTERNS: Record<'og:title' | 'twitter:title' | 'og:site_name', RegExp> = {'og:title': /<meta[^>]+(?:property|name)=["']og:title["'][^>]*>/gi, 'twitter:title': /<meta[^>]+(?:property|name)=["']twitter:title["'][^>]*>/gi, 'og:site_name': /<meta[^>]+(?:property|name)=["']og:site_name["'][^>]*>/gi}

/**
 * Curated preview title from the parent page. og:title and twitter:title only —
 * see the module comment for why <title> is intentionally not a source.
 */
export function extractPageTitleMeta(html: string): VhxPageTitleMeta {
	return {title: metaContent(html, 'og:title') ?? metaContent(html, 'twitter:title'), siteName: metaContent(html, 'og:site_name')}
}

/**
 * yt-dlp smuggles the delegating page's referer into the embed URL's
 * `#__youtubedl_smuggle=` fragment — either as `{referer}` or
 * `{http_headers: {Referer}}`. Returns null when absent, unparseable, or when
 * the referer is the VHX embed host itself (a direct embed hit has no parent
 * page to consult).
 */
export function smuggledRefererOf(url: string | undefined): string | null {
	if (!url) return null
	const marker = '#__youtubedl_smuggle='
	const at = url.indexOf(marker)
	if (at === -1) return null
	try {
		const data = JSON.parse(decodeURIComponent(url.slice(at + marker.length))) as {referer?: unknown; http_headers?: {Referer?: unknown}}
		const candidate = typeof data.referer === 'string' ? data.referer : typeof data.http_headers?.Referer === 'string' ? data.http_headers.Referer : null
		if (!candidate || !/^https?:\/\//i.test(candidate)) return null
		let host: string | null = null
		try {
			host = new URL(candidate).hostname
		} catch {
			return null
		}
		return VHX_EMBED_HOST_RE.test(host) ? null : candidate
	} catch {
		return null
	}
}

/** True when the URL is a page (not the VHX embed itself) worth consulting for a title. */
export function isLikelyParentPage(url: string | undefined): boolean {
	if (!url || !/^https?:\/\//i.test(url)) return false
	try {
		return !VHX_EMBED_HOST_RE.test(new URL(url).hostname)
	} catch {
		return false
	}
}

/**
 * Pages suffix their preview titles with branding ("Video Title - Free Videos
 * - Trilogy Plus", "Video Title (Site)"). Trim a trailing site-name segment so
 * the recovered title stays filename-friendly. No-op when the site name is not
 * a suffix.
 */
export function trimSiteSuffix(title: string, siteName: string): string {
	return trimTrailingKnownSegments(title, [siteName])
}

/**
 * VHX preview titles follow "{video} - {collection} - {site}". The site name
 * comes from og:site_name and the collection is identifiable from the parent
 * URL path (e.g. /free-videos/videos/slug → "free videos"). Trim trailing
 * "- Segment" / "(Segment)" parts that match any known name, normalized
 * (case-insensitive, hyphen/underscore ≈ space). Never empties the title.
 */
function trimTrailingKnownSegments(title: string, knownNames: readonly string[]): string {
	let current = title.trim()
	const known = knownNames.map(normalizeName).filter(name => name.length > 0)
	for (let i = 0; i < 3; i++) {
		const dashMatch = /\s*[-–]\s*([^-–()]+)$/.exec(current)
		const parenMatch = /\s*\(\s*([^()]+?)\s*\)\s*$/.exec(current)
		const match = dashMatch ?? parenMatch
		if (!match) break
		const segment = match[1].trim()
		if (segment.length === 0 || !known.includes(normalizeName(segment))) break
		const remaining = current.slice(0, match.index).trim()
		if (remaining.length === 0) break
		current = remaining
	}
	return current
}

function normalizeName(input: string): string {
	return input
		.toLowerCase()
		.replace(/[-_]+/g, ' ')
		.replace(/[''.,:;!?]+/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

/** Path slugs of a page URL, e.g. /free-videos/videos/x → ["free videos", "videos", "x"]. */
function parentPathSlugs(url: string): string[] {
	try {
		const segments = new URL(url).pathname.split('/').filter(Boolean)
		return segments.map(segment => normalizeName(decodeURIComponent(segment))).filter(name => name.length > 0)
	} catch {
		return []
	}
}

/**
 * Full recovery pipeline: curated preview title → site-suffix + URL-anchored
 * collection-segment trim. Returns null when the page yields no usable title.
 */
export function deriveRecoveredTitle(meta: VhxPageTitleMeta | null, parentUrl: string): string | null {
	const raw = meta?.title ?? null
	if (!raw || raw.length === 0) return null
	const trimmed = trimTrailingKnownSegments(raw, [meta?.siteName ?? '', ...parentPathSlugs(parentUrl)])
	return trimmed.length > 0 ? trimmed : null
}

/** Production fetcher: browser-ish UA (VHX serves og:* meta to logged-out crawlers), short timeout, no retry fan-out. */
export const defaultVhxTitleFetcher: VhxTitleFetcher = async (url, signal) => {
	try {
		const res = await fetch(url, {headers: {'user-agent': BROWSER_UA, accept: 'text/html'}, timeout: FETCH_TIMEOUT_MS, redirect: 'follow', retry: 1, signal} as fetch.FetchOptions)
		if (!res.ok) return null
		return await res.text()
	} catch {
		return null
	}
}
