// Google treats a client that claims to be a browser it cannot prove it is as
// an impersonator: a UA naming Chrome, Firefox or Safari that contradicts the
// client hints Chromium sends is the detectable lie. Electron's default UA is
// truthful about the platform and the Chromium version, so keep those and swap
// only the tokens that name the embedder (the app and Electron) for a bland
// token that asserts nothing checkable. See dev-docs/in-app-browser-spec.md.
export const BLAND_UA_TOKEN = 'Desktop/1.0'

// A whitespace-led `name/version` product token outside the parenthesised
// comments, e.g. ` Electron/43.7.7` or ` Arroxy/0.4.25`.
const PRODUCT_TOKEN = /\s([^\s/()]+)\/[^\s()]+/g

export function blandUserAgent(defaultUserAgent: string, appName: string, token: string = BLAND_UA_TOKEN): string {
	const embedderNames = new Set(['electron', appName.toLowerCase()])
	const stripped = defaultUserAgent.replace(PRODUCT_TOKEN, (match, name: string) => (embedderNames.has(name.toLowerCase()) ? '' : match))
	return /\sSafari\//.test(stripped) ? stripped.replace(/\sSafari\//, ` ${token} Safari/`) : `${stripped} ${token}`
}
