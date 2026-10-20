import type {YtDlpFormat} from 'yt-dlp-bridge/info'
import {isPrivateHostname} from './privateHostname.js'

// yt-dlp reports no size for some plain files (Instagram's and Facebook's
// combined MP4s, DASH streams of a site that gives no duration), though their
// server states it in one HEAD request. Asked only for plain http(s) files, a
// few at a time, within a short budget: a format whose server does not answer
// keeps no size, as before. The sizes come back apart from the formats, keyed
// by format id: they are for showing, and yt-dlp's own sort never sees them.

// Bytes per format id, for the formats whose server stated a length.
export type LookedUpSizes = ReadonlyMap<string, number>

// The file's length in bytes, or null when the server does not say.
export type HeadLength = (url: string, headers: Readonly<Record<string, string>>, signal: AbortSignal) => Promise<number | null>

export const SIZE_LOOKUP_MAX = 8
const SIZE_LOOKUP_BUDGET_MS = 4_000
// A manifest (HLS, DASH segments) answers with its own length, not the media's.
const PLAIN_PROTOCOLS: ReadonlySet<string> = new Set(['http', 'https'])

export function needsSizeLookup(format: YtDlpFormat): boolean {
	return format.filesize === undefined && format.filesize_approx === undefined && typeof format.url === 'string' && PLAIN_PROTOCOLS.has(format.protocol ?? '')
}

export async function lookUpMissingSizes(formats: readonly YtDlpFormat[], headLength: HeadLength, signal: AbortSignal, budgetMs: number = SIZE_LOOKUP_BUDGET_MS): Promise<LookedUpSizes> {
	const sizes = new Map<string, number>()
	const wanted = signal.aborted ? [] : formats.filter(format => needsSizeLookup(format) && format.format_id !== undefined).slice(0, SIZE_LOOKUP_MAX)
	if (wanted.length === 0) return sizes
	const budget = AbortSignal.any([signal, AbortSignal.timeout(budgetMs)])
	await Promise.all(
		wanted.map(async format => {
			const length = await headLength(format.url ?? '', format.http_headers ?? {}, budget).catch(() => null)
			if (length !== null && length > 0 && format.format_id !== undefined) sizes.set(format.format_id, length)
		})
	)
	return sizes
}

const MAX_REDIRECTS = 5

// A format URL comes from the site, not the user: one that points into the
// user's machine or network is never asked. Name-level check only (a public
// name resolving to a private address is not caught), as for the VHX title fetch.
function isAskable(url: string): boolean {
	try {
		const parsed = new URL(url)
		return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && !isPrivateHostname(parsed.hostname)
	} catch {
		return false
	}
}

// One HEAD request, redirects followed as a download would, each hop checked before it is asked.
export const fetchHeadLength: HeadLength = async (url, headers, signal) => {
	let current = url
	for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
		if (!isAskable(current)) return null
		const response = await fetch(current, {method: 'HEAD', headers: {...headers}, signal, redirect: 'manual'})
		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get('location')
			if (!location) return null
			current = new URL(location, current).toString()
			continue
		}
		if (!response.ok) return null
		const length = Number(response.headers.get('content-length'))
		return Number.isSafeInteger(length) && length > 0 ? length : null
	}
	return null
}
