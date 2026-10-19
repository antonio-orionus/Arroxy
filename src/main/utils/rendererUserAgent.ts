import {app} from 'electron'

let electronDefault: string | undefined

// Electron's own default UA (naming Electron and the app), as it was before
// setRendererDefaultUserAgent replaced it: the input every bland UA is
// derived from, so a bland UA is never derived from another one.
export function electronDefaultUserAgent(): string {
	electronDefault ??= app.userAgentFallback
	return electronDefault
}

// The UA a renderer starts with when nothing overrides it. A session or page
// UA does not reach out-of-process frames (a cross-site iframe runs in its own
// renderer, which only knows this default), so the Explore UA is set here too:
// otherwise a cross-site iframe's navigator.userAgent and requests name
// Electron and the app while its page does not. See dev-docs/in-app-browser-spec.md.
export function setRendererDefaultUserAgent(userAgent: string): void {
	electronDefaultUserAgent()
	app.userAgentFallback = userAgent
}
