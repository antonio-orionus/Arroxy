const TOKEN = /^[A-Za-z][A-Za-z0-9._-]*\/[A-Za-z0-9._-]+$/

// Substrings (case-insensitive) a product name may not contain: every browser,
// engine and platform marker a site's UA sniffing reads as "this is a browser".
const BROWSER_MARKERS = ['chrome', 'chromium', 'firefox', 'safari', 'webkit', 'gecko', 'edg', 'edge', 'opr', 'opera', 'brave', 'vivaldi', 'crios', 'fxios', 'headless', 'electron', 'arroxy', 'mozilla', 'version', 'mobile'] as const

// The Explore UA token: one bland `Name/version` product that claims no browser.
// Anything else (a pasted full UA, a browser or engine name) is refused, not stored.
export function validateUaToken(raw: unknown): string | null {
	if (typeof raw !== 'string' || !TOKEN.test(raw)) return null
	const name = (raw.split('/')[0] ?? '').toLowerCase()
	return BROWSER_MARKERS.some(marker => name.includes(marker)) ? null : raw
}
