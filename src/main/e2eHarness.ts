import fs from 'node:fs'
import path from 'node:path'
import type {DownloadRetryPolicy} from 'yt-dlp-bridge'
import {z} from 'zod'
import type {AppSettings} from '@shared/types.js'
import type {ExploreCookie} from '@shared/sites/types.js'
import type {SiteSignIn} from '@shared/sites/siteKeys.js'

interface HarnessGate {
	isPackaged: boolean
}

interface YtDlpHarnessArgsOptions {
	isProbe: boolean
}

export interface E2eHarnessMode {
	enabled: boolean
	disableAnalytics: boolean
	disableUpdater: boolean
	allowClipboardWatch: boolean
	useMockTokenProvider: boolean
	commandLineSwitches: readonly string[]
	applyAppSettingsDefaults: (defaults: AppSettings) => AppSettings
	applySpawnEnv: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
	ytDlpArgs: (opts: YtDlpHarnessArgsOptions) => string[]
	// The only yt-dlp plugin directories a run loads; production loads none.
	ytDlpPluginDirs: readonly string[]
	downloadRetryPolicy?: DownloadRetryPolicy
	// Fixture cookies seeded into the Explore partition (ARROXY_E2E_EXPLORE_COOKIES).
	exploreCookies?: ExploreCookie[]
	// Start spacing for signed-in spawns; unset keeps the production pacing.
	exploreSpawnSpacingMs?: number
	// Where the Explore view opens instead of YouTube (ARROXY_E2E_EXPLORE_HOME), so tests never reach the internet.
	exploreHomeUrl?: string
	// A filter list the Explore ad blocker is built from instead of the prebuilt
	// lists (ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS), so tests never fetch them.
	// Never in a packaged build, even with the harness enabled there.
	exploreAdBlockFilters?: string
	// How long Explore waits after the user leaves the tab before releasing the
	// page (ARROXY_E2E_EXPLORE_IDLE_MS), so a test does not wait minutes.
	exploreIdleUnloadMs?: number
	// Sign-in rows added to the known sites' (ARROXY_E2E_SIGN_IN_FIRST): the
	// fixture YouTube starts signed in, by the marker cookie its extractor reads.
	extraSignIns?: Readonly<Record<string, SiteSignIn>>
}

const E2E_COMMAND_LINE_SWITCHES = ['disable-background-networking', 'disable-component-update', 'disable-domain-reliability', 'no-pings'] as const

function isE2eHarnessEnabled(env: NodeJS.ProcessEnv, gate: HarnessGate): boolean {
	return env.ARROXY_E2E === '1' && (!gate.isPackaged || env.ARROXY_ENABLE_E2E_HARNESS === '1')
}

/**
 * Opt-in hidden-window mode for E2E runs. Double-gated on an E2E launch marker
 * (ARROXY_E2E for the fixture harness, MOCK_BACKEND for the smoke and startup
 * specs) so a stray ARROXY_E2E_HEADLESS in a user's shell can never launch the
 * real app with an invisible window.
 */
export function isHeadlessWindowRequested(env: NodeJS.ProcessEnv): boolean {
	const isE2eLaunch = env.ARROXY_E2E === '1' || env.MOCK_BACKEND === '1'
	return isE2eLaunch && env.ARROXY_E2E_HEADLESS === '1'
}

function applyE2eAppSettingsDefaults(defaults: AppSettings, allowClipboardWatch: boolean): AppSettings {
	return {...defaults, common: {...defaults.common, clipboardWatchEnabled: allowClipboardWatch ? defaults.common.clipboardWatchEnabled : false, analyticsEnabled: false}}
}

function applyProxyEnv(env: NodeJS.ProcessEnv, proxyUrl: string | undefined): NodeJS.ProcessEnv {
	if (!proxyUrl) return {...env}
	return {...env, HTTP_PROXY: proxyUrl, HTTPS_PROXY: proxyUrl, ALL_PROXY: proxyUrl, http_proxy: proxyUrl, https_proxy: proxyUrl, all_proxy: proxyUrl, NO_PROXY: '127.0.0.1,localhost,::1', no_proxy: '127.0.0.1,localhost,::1'}
}

function validatePluginRoot(pluginRoot: string | undefined): string {
	if (!pluginRoot) {
		throw new Error('ARROXY_E2E_YTDLP_PLUGIN_DIR is required when ARROXY_E2E=1')
	}
	if (!path.isAbsolute(pluginRoot)) {
		throw new Error('ARROXY_E2E_YTDLP_PLUGIN_DIR must be an absolute path')
	}
	if (!fs.existsSync(pluginRoot) || !fs.statSync(pluginRoot).isDirectory()) {
		throw new Error(`ARROXY_E2E_YTDLP_PLUGIN_DIR does not exist or is not a directory: ${pluginRoot}`)
	}
	const namespaceRoot = path.join(pluginRoot, 'yt_dlp_plugins')
	if (!fs.existsSync(namespaceRoot) || !fs.statSync(namespaceRoot).isDirectory()) {
		throw new Error(`ARROXY_E2E_YTDLP_PLUGIN_DIR must contain yt_dlp_plugins/: ${pluginRoot}`)
	}
	return pluginRoot
}

const exploreCookieSchema = z.object({name: z.string(), value: z.string(), domain: z.string(), hostOnly: z.boolean(), path: z.string(), secure: z.boolean(), httpOnly: z.boolean(), session: z.boolean(), expirationDate: z.number().optional()})

const EXPLORE_COOKIES_VAR = 'ARROXY_E2E_EXPLORE_COOKIES'

// The seed file is untrusted input: parse it into ExploreCookie[] or fail the
// launch, the same way a bad plugin dir does.
function readExploreCookies(file: string | undefined): ExploreCookie[] | undefined {
	if (file === undefined) return undefined
	if (!path.isAbsolute(file)) {
		throw new Error(`${EXPLORE_COOKIES_VAR} must be an absolute path`)
	}
	let raw: unknown
	try {
		raw = JSON.parse(fs.readFileSync(file, 'utf8'))
	} catch (err) {
		throw new Error(`${EXPLORE_COOKIES_VAR} could not be read as JSON: ${file}`, {cause: err})
	}
	const parsed = z.array(exploreCookieSchema).safeParse(raw)
	if (!parsed.success) {
		throw new Error(`${EXPLORE_COOKIES_VAR} is not a valid cookie array: ${file}`, {cause: parsed.error})
	}
	return parsed.data
}

const EXPLORE_HOME_VAR = 'ARROXY_E2E_EXPLORE_HOME'
const exploreHomeSchema = z.url({protocol: /^https?$/})

// An absolute http(s) URL or the launch fails; the view's allowlist widens to its origin.
function readExploreHome(value: string | undefined): string | undefined {
	if (value === undefined) return undefined
	const parsed = exploreHomeSchema.safeParse(value)
	if (!parsed.success) {
		throw new Error(`${EXPLORE_HOME_VAR} must be an absolute http(s) URL`, {cause: parsed.error})
	}
	return new URL(parsed.data).href
}

const EXPLORE_ADBLOCK_FILTERS_VAR = 'ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS'

function readExploreAdBlockFilters(file: string | undefined, gate: HarnessGate): string | undefined {
	if (file === undefined || gate.isPackaged) return undefined
	if (!path.isAbsolute(file)) {
		throw new Error(`${EXPLORE_ADBLOCK_FILTERS_VAR} must be an absolute path`)
	}
	try {
		return fs.readFileSync(file, 'utf8')
	} catch (err) {
		throw new Error(`${EXPLORE_ADBLOCK_FILTERS_VAR} could not be read: ${file}`, {cause: err})
	}
}

const EXPLORE_IDLE_MS_VAR = 'ARROXY_E2E_EXPLORE_IDLE_MS'

// A positive whole number of milliseconds, or the launch fails.
function readExploreIdleUnloadMs(value: string | undefined): number | undefined {
	if (value === undefined) return undefined
	if (!/^[1-9]\d*$/.test(value)) throw new Error(`${EXPLORE_IDLE_MS_VAR} must be a positive whole number of milliseconds`)
	return Number(value)
}

const FIXTURE_SIGN_IN_FIRST: Readonly<Record<string, SiteSignIn>> = {youtube: {policy: 'first', cookies: ['ARROXY_FIXTURE_AUTH'], host: 'www.youtube.com', page: 'https://www.youtube.com/'}}

export function resolveE2eHarnessMode(env: NodeJS.ProcessEnv = process.env, gate: HarnessGate): E2eHarnessMode {
	if (!isE2eHarnessEnabled(env, gate)) {
		return {enabled: false, disableAnalytics: false, disableUpdater: false, allowClipboardWatch: true, useMockTokenProvider: false, commandLineSwitches: [], applyAppSettingsDefaults: defaults => defaults, applySpawnEnv: baseEnv => ({...baseEnv}), ytDlpArgs: () => [], ytDlpPluginDirs: [], downloadRetryPolicy: undefined}
	}

	const pluginRoot = validatePluginRoot(env.ARROXY_E2E_YTDLP_PLUGIN_DIR)
	const allowClipboardWatch = env.ARROXY_E2E_ENABLE_CLIPBOARD_WATCH === '1'
	// yt-dlp's --plugin-dirs iterates DIR/* and looks for yt_dlp_plugins inside
	// each child. The env var names the trusted plugin root, so pass its parent.
	const pluginContainer = path.dirname(pluginRoot)
	const denyProxyUrl = env.ARROXY_E2E_DENY_PROXY_URL
	const exploreCookies = readExploreCookies(env[EXPLORE_COOKIES_VAR])
	const exploreHomeUrl = readExploreHome(env[EXPLORE_HOME_VAR])
	const exploreAdBlockFilters = readExploreAdBlockFilters(env[EXPLORE_ADBLOCK_FILTERS_VAR], gate)
	const exploreIdleUnloadMs = readExploreIdleUnloadMs(env[EXPLORE_IDLE_MS_VAR])

	return {
		enabled: true,
		disableAnalytics: true,
		disableUpdater: true,
		allowClipboardWatch,
		useMockTokenProvider: true,
		commandLineSwitches: E2E_COMMAND_LINE_SWITCHES,
		applyAppSettingsDefaults: defaults => applyE2eAppSettingsDefaults(defaults, allowClipboardWatch),
		applySpawnEnv: baseEnv => applyProxyEnv(baseEnv, denyProxyUrl),
		ytDlpArgs: ({isProbe}) => (isProbe ? ['--no-cache-dir'] : ['--no-cache-dir', '--newline']),
		ytDlpPluginDirs: [pluginContainer],
		downloadRetryPolicy: {retries: 1, fragmentRetries: 1, retrySleep: 'fragment:0', socketTimeout: 5},
		exploreCookies,
		// The fixture site is local: pacing protects a real account, and here it only slows the suite.
		exploreSpawnSpacingMs: 0,
		exploreHomeUrl,
		exploreAdBlockFilters,
		exploreIdleUnloadMs,
		...(env.ARROXY_E2E_SIGN_IN_FIRST === '1' ? {extraSignIns: FIXTURE_SIGN_IN_FIRST} : {})
	}
}
