import type {NavigationEntry} from 'electron'
import {restorablePage, type LastPageScope} from './exploreLastPage.js'

// Idle unload: after the user has been away from the Explore tab for a while,
// the page is released and its memory with it. Coming back reloads it at the
// same place in its history, in the same Explore session. Only pages nothing
// is typed into qualify (the site's home and search results): a reload loses
// whatever the page held that its URL does not.

// Chromium keeps no more per tab; more never arrives, but a snapshot is bounded anyway.
export const IDLE_UNLOAD_MAX_ENTRIES = 50
// A page state can carry form values: past this a snapshot is not kept, rather than cut.
export const IDLE_UNLOAD_MAX_BYTES = 1024 * 1024

// Which pages may go: the site's own pages (the last-page scope) on these paths.
export interface IdleUnloadRule {
	scope: LastPageScope
	paths: readonly string[]
}

// The page as the view sees it when the user has been away long enough.
export interface IdleUnloadPage {
	url: string
	loading: boolean
	error: boolean
	proxyRefused: boolean
	mediaPlaying: boolean
}

export type IdleUnloadKeepReason = 'route' | 'loading' | 'error' | 'proxy' | 'media' | 'too-large'

// The history a released page comes back with. Main-process memory only:
// a page state can hold form values, so it is never logged, sent or stored.
export interface IdleUnloadSnapshot {
	entries: NavigationEntry[]
	index: number
}

export type IdleUnloadSnapshotResult = {kind: 'ok'; snapshot: IdleUnloadSnapshot; dropped: number} | {kind: 'keep'; reason: Extract<IdleUnloadKeepReason, 'route' | 'too-large'>}

function onUnloadablePath(raw: string, rule: IdleUnloadRule): boolean {
	const page = restorablePage(raw, rule.scope)
	return page !== null && rule.paths.includes(new URL(page).pathname)
}

// Why the page stays, or null when it may be released.
export function idleUnloadKeepReason(page: IdleUnloadPage, rule: IdleUnloadRule): IdleUnloadKeepReason | null {
	if (!onUnloadablePath(page.url, rule)) return 'route'
	if (page.loading) return 'loading'
	if (page.error) return 'error'
	if (page.proxyRefused) return 'proxy'
	if (page.mediaPlaying) return 'media'
	return null
}

// The history to bring the page back with: every entry that is no page to
// come back to (a sign-in or consent hop, an interstitial, a blank page) is
// dropped whole, so no page state is ever rewritten.
export function buildIdleUnloadSnapshot(entries: readonly NavigationEntry[], index: number, scope: LastPageScope): IdleUnloadSnapshotResult {
	const active = entries[index]
	if (active === undefined || restorablePage(active.url, scope) === null) return {kind: 'keep', reason: 'route'}
	const kept = entries.filter(entry => restorablePage(entry.url, scope) !== null)
	const keptIndex = kept.indexOf(active)
	// The entries nearest the active one, as many behind it as fit.
	const start = Math.max(0, Math.min(keptIndex - Math.floor(IDLE_UNLOAD_MAX_ENTRIES / 2), kept.length - IDLE_UNLOAD_MAX_ENTRIES))
	const windowed = kept.slice(start, start + IDLE_UNLOAD_MAX_ENTRIES)
	if (Buffer.byteLength(JSON.stringify(windowed), 'utf8') > IDLE_UNLOAD_MAX_BYTES) return {kind: 'keep', reason: 'too-large'}
	return {kind: 'ok', snapshot: {entries: windowed, index: keptIndex - start}, dropped: entries.length - kept.length}
}
