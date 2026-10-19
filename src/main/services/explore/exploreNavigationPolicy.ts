// What the Explore view does with one main-frame navigation. `block` carries the
// host only: a URL's path and query can carry session material, so it is never logged.
export type NavigationDecision = {kind: 'allow'} | {kind: 'block'; host: string}

const WEB_PROTOCOLS = new Set(['http:', 'https:'])

// Explore browses the open web: any web page loads in the view. Anything else
// (javascript:, file:, an app's own protocol) is blocked, never handed to
// another program.
export function decideNavigation(raw: string): NavigationDecision {
	let url: URL
	try {
		url = new URL(raw)
	} catch {
		return {kind: 'block', host: ''}
	}
	return WEB_PROTOCOLS.has(url.protocol) ? {kind: 'allow'} : {kind: 'block', host: url.hostname}
}
