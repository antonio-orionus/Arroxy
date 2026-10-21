import {parseBulkUrls} from './bulkUrls.js'

export type ClipboardLinks = {kind: 'none'} | {kind: 'single'; url: string} | {kind: 'bulk'; urls: string[]}

const BARE_WEB_LINK_RE = /^https?:\/\/\S+$/i

function isWebUrl(text: string): boolean {
	try {
		const {protocol} = new URL(text)
		return protocol === 'http:' || protocol === 'https:'
	} catch {
		return false
	}
}

// A link handed over as a value rather than as copied text, such as an
// arroxy:// link's `url`: one whole http(s) URL, kept exactly as given. The
// copied-text rule below would cut it at a comma or a semicolon.
export function singleWebLink(text: string): string | null {
	return BARE_WEB_LINK_RE.test(text) && isWebUrl(text) ? text : null
}

// What the clipboard watcher may act on. A single link counts only when it is
// the whole clipboard (surrounding whitespace aside): a link inside a sentence
// is not definitely meant for Arroxy. Several links in any text form a bulk
// list. Both sides of the watcher use this one rule.
export function classifyClipboardText(raw: string): ClipboardLinks {
	const text = raw.trim()
	if (!text) return {kind: 'none'}
	const urls = parseBulkUrls(text).accepted.map(item => item.url)
	if (urls.length > 1) return {kind: 'bulk', urls}
	const [url] = urls
	return url && BARE_WEB_LINK_RE.test(text) && isWebUrl(url) ? {kind: 'single', url} : {kind: 'none'}
}

export type PastedLinks = {kind: 'none'} | {kind: 'single'; url: string} | {kind: 'bulk'; raw: string}

// What the Paste button acts on. A click is an explicit ask, so unlike the
// watcher it takes a link out of any text. Several links go to Bulk URLs with
// the text as copied.
export function classifyPastedText(raw: string): PastedLinks {
	const urls = parseBulkUrls(raw).accepted.map(item => item.url)
	if (urls.length > 1) return {kind: 'bulk', raw}
	const [url] = urls
	return url ? {kind: 'single', url} : {kind: 'none'}
}
