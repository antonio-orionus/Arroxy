import {parseBulkUrls} from './bulkUrls.js'
import {cleanUrl} from './cleanUrl.js'

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
// watcher it takes a link out of any text. A link that is the whole clipboard
// is kept as copied, since the bulk tokenizer splits at `,` and `;` that a URL
// may hold. Several links go to Bulk URLs with the text as copied.
export function classifyPastedText(raw: string): PastedLinks {
	const text = raw.trim()
	const urls = parseBulkUrls(text)
		.accepted.map(item => item.url)
		.filter(isWebUrl)
	if (urls.length > 1) return {kind: 'bulk', raw}
	const [url] = urls
	if (!url) return {kind: 'none'}
	return {kind: 'single', url: BARE_WEB_LINK_RE.test(text) && isWebUrl(text) ? cleanUrl(text) : url}
}
