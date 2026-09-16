import {z} from 'zod'
import {nonEmpty} from '@shared/format.js'
import {cookiesBrowserSchema, type CookiesBrowser} from '@shared/schemas.js'
import {siteForUrl} from '@shared/sites/index.js'
import type {AppSettings} from '@shared/types.js'

export type SmokeCookiesOverride = {kind: 'settings'} | {kind: 'off'} | {kind: 'browser'; browser: CookiesBrowser} | {kind: 'file'; path: string}
export type SmokeProxyOverride = {kind: 'settings'} | {kind: 'off'} | {kind: 'url'; url: string}

export interface DownloadSmokeConfig {
	url: string
	cookies: SmokeCookiesOverride
	proxy: SmokeProxyOverride
	profileId: string | null
	// null = the production player clients; [] = pass none and let yt-dlp choose.
	youtubePlayerClients: readonly string[] | null
	timeoutMs: number
}

export type DownloadSmokeConfigResult = {ok: true; config: DownloadSmokeConfig} | {ok: false; error: string}

const DEFAULT_TIMEOUT_MS = 180_000
const BROWSER_PREFIX = 'browser:'
const FILE_PREFIX = 'file:'

function trimmed(value: string | undefined): string | undefined {
	return nonEmpty(value?.trim())
}

function parseCookies(raw: string | undefined): SmokeCookiesOverride | string {
	if (raw === undefined) return {kind: 'settings'}
	if (raw === 'off') return {kind: 'off'}
	if (raw.startsWith(BROWSER_PREFIX)) {
		const name = raw.slice(BROWSER_PREFIX.length)
		const browser = cookiesBrowserSchema.safeParse(name)
		return browser.success ? {kind: 'browser', browser: browser.data} : `ARROXY_SMOKE_COOKIES: unknown browser "${name}" (expected one of ${cookiesBrowserSchema.options.join(', ')})`
	}
	if (raw.startsWith(FILE_PREFIX)) {
		const path = raw.slice(FILE_PREFIX.length).trim()
		return path ? {kind: 'file', path} : 'ARROXY_SMOKE_COOKIES: file: needs a path'
	}
	return `ARROXY_SMOKE_COOKIES: expected off, browser:<name> or file:<path>, got "${raw}"`
}

function parsePlayerClients(raw: string | undefined): readonly string[] | null | string {
	if (raw === undefined) return null
	if (raw === 'none') return []
	const clients = raw
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
	return clients.length > 0 ? clients : 'ARROXY_SMOKE_PLAYER_CLIENTS: expected a comma list of clients or "none"'
}

// Env is an untrusted boundary: every value is parsed here into the typed config
// the runner consumes. Returns null when download smoke was not requested.
export function readDownloadSmokeConfig(env: NodeJS.ProcessEnv): DownloadSmokeConfigResult | null {
	if (trimmed(env.ARROXY_SMOKE_KIND) !== 'download') return null
	const url = trimmed(env.ARROXY_SMOKE_URL)
	if (!url || !z.url().safeParse(url).success) return {ok: false, error: 'ARROXY_SMOKE_URL must be a valid URL'}
	if (siteForUrl(url).id !== 'youtube') return {ok: false, error: 'ARROXY_SMOKE_URL must be a YouTube URL'}
	const cookies = parseCookies(trimmed(env.ARROXY_SMOKE_COOKIES))
	if (typeof cookies === 'string') return {ok: false, error: cookies}
	const proxyRaw = trimmed(env.ARROXY_SMOKE_PROXY)
	const proxy: SmokeProxyOverride = proxyRaw === undefined ? {kind: 'settings'} : proxyRaw === 'off' ? {kind: 'off'} : {kind: 'url', url: proxyRaw}
	const youtubePlayerClients = parsePlayerClients(trimmed(env.ARROXY_SMOKE_PLAYER_CLIENTS))
	if (typeof youtubePlayerClients === 'string') return {ok: false, error: youtubePlayerClients}
	const timeoutRaw = trimmed(env.ARROXY_SMOKE_TIMEOUT_MS)
	const timeout = z.coerce
		.number()
		.int()
		.positive()
		.safeParse(timeoutRaw ?? DEFAULT_TIMEOUT_MS)
	if (!timeout.success) return {ok: false, error: `ARROXY_SMOKE_TIMEOUT_MS must be a positive integer, got "${timeoutRaw}"`}
	return {ok: true, config: {url, cookies, proxy, profileId: trimmed(env.ARROXY_SMOKE_PROFILE) ?? null, youtubePlayerClients, timeoutMs: timeout.data}}
}

function cookiesPatch(cookies: SmokeCookiesOverride): Partial<AppSettings['common']> {
	switch (cookies.kind) {
		case 'settings':
			return {}
		case 'off':
			return {cookiesMode: 'off'}
		case 'browser':
			return {cookiesMode: 'browser', cookiesBrowser: cookies.browser}
		case 'file':
			return {cookiesMode: 'file', cookiesPath: cookies.path}
	}
}

function proxyPatch(proxy: SmokeProxyOverride): Partial<AppSettings['common']> {
	switch (proxy.kind) {
		case 'settings':
			return {}
		case 'off':
			return {proxyUrl: ''}
		case 'url':
			return {proxyUrl: proxy.url}
	}
}

// In-memory only: the smoke never persists these, so a run cannot change the
// user's real cookie or proxy configuration.
export function applyDownloadSmokeOverrides(settings: AppSettings, config: DownloadSmokeConfig): AppSettings {
	return {...settings, common: {...settings.common, ...cookiesPatch(config.cookies), ...proxyPatch(config.proxy)}}
}
