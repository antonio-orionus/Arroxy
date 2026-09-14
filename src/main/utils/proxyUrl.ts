// The user's proxy setting, read once into the forms each consumer needs.
//
// yt-dlp takes the value as typed, but Chromium does not: its proxy rules carry
// no credentials and no scheme defaulting, and a value is only safe to log once
// the credentials are masked. Every reader goes through here so the hidden token
// window and yt-dlp agree on what the setting means.
export type ProxySetting =
	| {kind: 'none'}
	| {kind: 'invalid'}
	| {
			kind: 'proxy'
			/** Normalized value, credentials included — for yt-dlp's `--proxy`. */
			url: string
			/** `scheme://host[:port]` for `session.setProxy({proxyRules})`. */
			chromiumRules: string
			/** Decoded, for answering a proxy authentication challenge. */
			credentials: {username: string; password: string} | null
			/** Credentials masked — the only form that may reach a log. */
			redacted: string
	  }

// socks5h is yt-dlp's spelling for "resolve hostnames on the proxy". Chromium
// has no such scheme and always resolves through a SOCKS5 proxy anyway.
const CHROMIUM_SCHEME: Readonly<Record<string, string>> = {'http:': 'http', 'https:': 'https', 'socks4:': 'socks4', 'socks5:': 'socks5', 'socks5h:': 'socks5'}

// Same rule yt-dlp applies (utils/networking.py clean_proxies): a value with no
// scheme is an HTTP proxy.
const HAS_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i

export function parseProxySetting(raw: string | undefined): ProxySetting {
	const value = raw?.trim() ?? ''
	if (!value) return {kind: 'none'}

	let url: URL
	try {
		url = new URL(HAS_SCHEME.test(value) ? value : `http://${value}`)
	} catch {
		return {kind: 'invalid'}
	}
	const scheme = CHROMIUM_SCHEME[url.protocol]
	if (!scheme || !url.hostname) return {kind: 'invalid'}

	const credentials = url.username ? {username: decodeURIComponent(url.username), password: decodeURIComponent(url.password)} : null
	const redactedUrl = new URL(url.href)
	if (redactedUrl.username) redactedUrl.username = '***'
	if (redactedUrl.password) redactedUrl.password = '***'

	return {kind: 'proxy', url: withoutTrailingSlash(url.href), chromiumRules: `${scheme}://${url.host}`, credentials, redacted: withoutTrailingSlash(redactedUrl.href)}
}

// The one form of the setting that may reach a log: nothing when unset, a
// marker when unusable, and never the credentials.
export function proxyForLog(proxy: ProxySetting): string | null {
	if (proxy.kind === 'none') return null
	return proxy.kind === 'proxy' ? proxy.redacted : '<invalid>'
}

// URL serialization appends "/" to an empty path; a proxy address has none.
function withoutTrailingSlash(href: string): string {
	return href.endsWith('/') ? href.slice(0, -1) : href
}
