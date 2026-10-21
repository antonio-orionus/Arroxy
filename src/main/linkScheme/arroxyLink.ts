import {classifyClipboardText} from '@shared/clipboardLinks.js'

// An `arroxy://` link is an untrusted caller: any web page or app can open one.
// The one form it may take is `arroxy://open?url=<percent-encoded http(s) link>`,
// and all it can do is put that link in the URL field (see LinkInbox).
const ARROXY_LINK_SCHEME = 'arroxy'
const OPEN_ACTION = 'open'
// Far longer than any link a person clicks, short enough to keep a page from
// handing main a megabyte to parse.
const MAX_LINK_LENGTH = 8192

export type ArroxyLinkRejection = 'tooLong' | 'notAUrl' | 'wrongScheme' | 'wrongAction' | 'extraParts' | 'wrongParams' | 'notAWebLink'

export type ArroxyLinkParse = {ok: true; url: string} | {ok: false; reason: ArroxyLinkRejection}

function reject(reason: ArroxyLinkRejection): ArroxyLinkParse {
	return {ok: false, reason}
}

export function buildArroxyLink(url: string): string {
	return `${ARROXY_LINK_SCHEME}://${OPEN_ACTION}?url=${encodeURIComponent(url)}`
}

export function parseArroxyLink(raw: string): ArroxyLinkParse {
	if (raw.length > MAX_LINK_LENGTH) return reject('tooLong')
	let link: URL
	try {
		link = new URL(raw)
	} catch {
		return reject('notAUrl')
	}
	if (link.protocol !== `${ARROXY_LINK_SCHEME}:`) return reject('wrongScheme')
	// A custom scheme's host is opaque, so URL keeps its case; shells and
	// browsers may add a trailing slash.
	if (link.hostname.toLowerCase() !== OPEN_ACTION || (link.pathname !== '' && link.pathname !== '/')) return reject('wrongAction')
	if (link.username || link.password || link.port || link.hash) return reject('extraParts')
	const params = [...link.searchParams]
	if (params.length !== 1 || params[0]?.[0] !== 'url') return reject('wrongParams')
	// The same rule as a copied link: one web link and nothing else.
	const links = classifyClipboardText(params[0][1])
	return links.kind === 'single' ? {ok: true, url: links.url} : reject('notAWebLink')
}

// Windows and Linux pass the link as a command-line argument; Chromium may
// move its own switches around it, so it is found by its scheme.
export function arroxyLinkArgs(argv: readonly string[]): string[] {
	const prefix = `${ARROXY_LINK_SCHEME}:`
	return argv.filter(arg => arg.slice(0, prefix.length).toLowerCase() === prefix)
}
