import type {YtDlpFormat} from 'yt-dlp-bridge/info'

// yt-dlp reports no size for some plain files (Instagram's and Facebook's
// combined MP4s, DASH streams of a site that gives no duration), though their
// server states it in one HEAD request. Asked only for plain http(s) files, a
// few at a time, within a short budget: a format whose server does not answer
// keeps no size, as before.

// The file's length in bytes, or null when the server does not say.
export type HeadLength = (url: string, headers: Readonly<Record<string, string>>, signal: AbortSignal) => Promise<number | null>

export const SIZE_LOOKUP_MAX = 8
const SIZE_LOOKUP_BUDGET_MS = 4_000
// A manifest (HLS, DASH segments) answers with its own length, not the media's.
const PLAIN_PROTOCOLS: ReadonlySet<string> = new Set(['http', 'https'])

export function needsSizeLookup(format: YtDlpFormat): boolean {
	return format.filesize === undefined && format.filesize_approx === undefined && typeof format.url === 'string' && PLAIN_PROTOCOLS.has(format.protocol ?? '')
}

export async function lookUpMissingSizes(formats: readonly YtDlpFormat[], headLength: HeadLength, signal: AbortSignal, budgetMs: number = SIZE_LOOKUP_BUDGET_MS): Promise<YtDlpFormat[]> {
	const wanted = signal.aborted ? [] : formats.filter(needsSizeLookup).slice(0, SIZE_LOOKUP_MAX)
	if (wanted.length === 0) return [...formats]
	const budget = AbortSignal.any([signal, AbortSignal.timeout(budgetMs)])
	const sizes = new Map<YtDlpFormat, number>()
	await Promise.all(
		wanted.map(async format => {
			const length = await headLength(format.url ?? '', format.http_headers ?? {}, budget).catch(() => null)
			if (length !== null && length > 0) sizes.set(format, length)
		})
	)
	return formats.map(format => {
		const filesize = sizes.get(format)
		return filesize === undefined ? format : {...format, filesize}
	})
}

// One HEAD request; redirects followed, as a download would.
export const fetchHeadLength: HeadLength = async (url, headers, signal) => {
	const response = await fetch(url, {method: 'HEAD', headers: {...headers}, signal, redirect: 'follow'})
	if (!response.ok) return null
	const length = Number(response.headers.get('content-length'))
	return Number.isSafeInteger(length) && length > 0 ? length : null
}
