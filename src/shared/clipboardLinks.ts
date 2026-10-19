import {parseBulkUrls} from './bulkUrls.js'

export type ClipboardLinks = {kind: 'none'} | {kind: 'single'; url: string} | {kind: 'bulk'; urls: string[]}

const BARE_WEB_LINK_RE = /^https?:\/\/\S+$/i

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
	return url && BARE_WEB_LINK_RE.test(text) ? {kind: 'single', url} : {kind: 'none'}
}
