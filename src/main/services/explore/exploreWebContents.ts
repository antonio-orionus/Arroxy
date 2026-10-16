import type {WebContents} from 'electron'
import type {ExploreViewError} from '@shared/schemas.js'
import {parseProxySetting} from '@main/utils/proxyUrl.js'

// Chromium's net::ERR_ABORTED: YouTube's first load re-navigates itself to
// `?themeRefresh=1`, aborting the original request; the replacement load finishes normally.
const ERR_ABORTED = -3

// Chromium's proxy failures, by name (did-fail-load's description): the
// ERR_PROXY_* family (connection, auth, certificate, HTTP/1.1 required, ...),
// a CONNECT tunnel the proxy refused, a SOCKS proxy that would not connect, and
// a mandatory PAC script that failed. The page cannot fix these; the setting can.
const PROXY_FAILURE = /^ERR_(?:PROXY_\w+|TUNNEL_CONNECTION_FAILED|SOCKS_CONNECTION_FAILED|MANDATORY_PROXY_CONFIGURATION_FAILED)$/

// What a did-fail-load means for the view: null for a subframe or the benign
// abort above, `proxy` when the proxy is at fault, `load` otherwise.
export function pageLoadFailure(errorCode: number, errorDescription: string, isMainFrame: boolean): ExploreViewError | null {
	if (!isMainFrame || errorCode === ERR_ABORTED) return null
	return PROXY_FAILURE.test(errorDescription) ? 'proxy' : 'load'
}

// Chromium's proxy rules carry no credentials, so an authenticated proxy
// challenges the page. Only proxy challenges are answered, with the credentials
// of the proxy setting as it reads now — a site asking for a login is not ours to satisfy.
export function answerProxyLogins(webContents: WebContents, readProxyUrl: () => string | undefined): void {
	webContents.on('login', (event, _details, authInfo, callback) => {
		const proxy = parseProxySetting(readProxyUrl())
		if (!authInfo.isProxy || proxy.kind !== 'proxy' || !proxy.credentials) return
		event.preventDefault()
		callback(proxy.credentials.username, proxy.credentials.password)
	})
}

const BLANK_PAGE = 'about:blank'

// Stops the page and replaces it with a blank one, so nothing keeps running
// (or reaching the network) behind an error screen.
export function blankPage(webContents: WebContents): void {
	webContents.stop()
	webContents.loadURL(BLANK_PAGE).catch(() => undefined)
}

// Once a real page has replaced it, the blank page left by blankPage() is no
// history entry to go Back to.
export function dropBlankEntryBehind(webContents: WebContents): void {
	const history = webContents.navigationHistory
	const previous = history.getActiveIndex() - 1
	if (previous >= 0 && history.getEntryAtIndex(previous).url === BLANK_PAGE) history.removeEntryAtIndex(previous)
}
