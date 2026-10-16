import {hostMatches} from '@shared/sites/hostRules.js'
import type {HostRule} from '@shared/sites/types.js'

// What the Explore view does with one navigation. `block` carries the host only:
// the full URL of a sign-in hop can carry session material, so it is never logged.
export type NavigationDecision = {kind: 'allow'} | {kind: 'openExternal'; url: string} | {kind: 'block'; host: string}

export interface NavigationRequest {
	url: string
	// A user's click or key press started it, not the page on its own.
	userGesture: boolean
	// A server-side redirect inside a navigation already under way.
	isRedirect: boolean
	mainFrame: boolean
	hosts: readonly HostRule[]
	// The E2E home override's origin, allowed in addition to the site's hosts.
	extraAllowedOrigin?: string
}

const WEB_PROTOCOLS = new Set(['http:', 'https:'])

// Allowlisted hosts load in the view. Anywhere else reaches the system browser
// only from a user's own top-level click; a redirect, a script, or a frame is
// blocked, so a sign-in redirect's URL is never handed to another program.
export function decideNavigation(request: NavigationRequest): NavigationDecision {
	let url: URL
	try {
		url = new URL(request.url)
	} catch {
		return {kind: 'block', host: ''}
	}
	if (!WEB_PROTOCOLS.has(url.protocol)) return {kind: 'block', host: url.hostname}
	if (hostMatches(url.hostname, request.hosts) || url.origin === request.extraAllowedOrigin) return {kind: 'allow'}
	if (request.mainFrame && request.userGesture && !request.isRedirect) return {kind: 'openExternal', url: url.href}
	return {kind: 'block', host: url.hostname}
}
