// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {defaultAppSettings} from '@shared/constants.js'
import {isHeadlessWindowRequested, resolveE2eHarnessMode} from '@main/e2eHarness.js'

const tempRoots: string[] = []

function makePluginRoot(): string {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-plugin-parent-'))
	const root = path.join(parent, 'yt-dlp-plugins')
	tempRoots.push(parent)
	fs.mkdirSync(path.join(root, 'yt_dlp_plugins'), {recursive: true})
	return root
}

afterEach(() => {
	for (const root of tempRoots.splice(0)) {
		fs.rmSync(root, {recursive: true, force: true})
	}
})

describe('resolveE2eHarnessMode', () => {
	it('returns a disabled mode when the gated harness is not active', () => {
		const mode = resolveE2eHarnessMode({ARROXY_E2E_YTDLP_PLUGIN_DIR: '/tmp/anything'}, {isPackaged: false})

		expect(mode.enabled).toBe(false)
		expect(mode.disableAnalytics).toBe(false)
		expect(mode.disableUpdater).toBe(false)
		expect(mode.allowClipboardWatch).toBe(true)
		expect(mode.useMockTokenProvider).toBe(false)
		expect(mode.commandLineSwitches).toEqual([])
		expect(mode.ytDlpArgs({isProbe: false})).toEqual([])
		expect(mode.downloadRetryPolicy).toBeUndefined()
	})

	it('does not enable in packaged builds unless the explicit harness override is set', () => {
		expect(resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: '/tmp/anything'}, {isPackaged: true}).enabled).toBe(false)
		expect(resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_ENABLE_E2E_HARNESS: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot()}, {isPackaged: true}).enabled).toBe(true)
	})

	it('requires an absolute plugin root in active E2E mode', () => {
		expect(() => resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: 'tests/e2e/yt-dlp-plugins'}, {isPackaged: false})).toThrow(/absolute/)
	})

	it('requires the plugin root to contain yt_dlp_plugins', () => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-bad-plugin-'))
		tempRoots.push(root)
		expect(() => resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: root}, {isPackaged: false})).toThrow(/yt_dlp_plugins/)
	})

	it('adds deterministic plugin args and newline only for download runs', () => {
		const root = makePluginRoot()
		const mode = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: root}, {isPackaged: false})
		const probeArgs = mode.ytDlpArgs({isProbe: true})
		const downloadArgs = mode.ytDlpArgs({isProbe: false})

		expect(probeArgs).toEqual(['--ignore-config', '--plugin-dirs', path.dirname(root), '--no-cache-dir'])
		expect(downloadArgs).toEqual(['--ignore-config', '--plugin-dirs', path.dirname(root), '--no-cache-dir', '--newline'])
		expect(mode.downloadRetryPolicy).toEqual({retries: 1, fragmentRetries: 1, retrySleep: 'fragment:0', socketTimeout: 5})
	})

	it('centralizes app defaults, network switches, proxy env, and mode policy', () => {
		const root = makePluginRoot()
		const mode = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: root, ARROXY_E2E_DENY_PROXY_URL: 'http://127.0.0.1:1234'}, {isPackaged: false})
		const defaults = mode.applyAppSettingsDefaults(defaultAppSettings('/downloads'))
		const spawnEnv = mode.applySpawnEnv({PATH: '/bin'})

		expect(mode.enabled).toBe(true)
		expect(mode.disableAnalytics).toBe(true)
		expect(mode.disableUpdater).toBe(true)
		expect(mode.allowClipboardWatch).toBe(false)
		expect(mode.useMockTokenProvider).toBe(true)
		expect(mode.commandLineSwitches).toEqual(['disable-background-networking', 'disable-component-update', 'disable-domain-reliability', 'no-pings'])
		expect(defaults.common.clipboardWatchEnabled).toBe(false)
		expect(defaults.common.analyticsEnabled).toBe(false)
		expect(defaults.common.defaultOutputDir).toBe('/downloads')
		expect(spawnEnv.HTTP_PROXY).toBe('http://127.0.0.1:1234')
		expect(spawnEnv.NO_PROXY).toBe('127.0.0.1,localhost,::1')
	})

	it('leaves signed-in spawn pacing to production defaults outside the harness', () => {
		expect(resolveE2eHarnessMode({}, {isPackaged: false}).exploreSpawnSpacingMs).toBeUndefined()
	})

	it('removes the spacing between signed-in spawns in E2E mode', () => {
		expect(resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot()}, {isPackaged: false}).exploreSpawnSpacingMs).toBe(0)
	})

	it('keeps clipboard watching disabled in E2E unless explicitly opted in', () => {
		const root = makePluginRoot()
		const disabled = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: root}, {isPackaged: false})
		const enabled = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_ENABLE_CLIPBOARD_WATCH: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: root}, {isPackaged: false})

		expect(disabled.applyAppSettingsDefaults(defaultAppSettings('/downloads')).common.clipboardWatchEnabled).toBe(false)
		expect(enabled.allowClipboardWatch).toBe(true)
		expect(enabled.applyAppSettingsDefaults(defaultAppSettings('/downloads')).common.clipboardWatchEnabled).toBe(true)
	})
})

describe('resolveE2eHarnessMode Explore cookies', () => {
	function cookiesFile(content: string): string {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-cookies-'))
		tempRoots.push(dir)
		const file = path.join(dir, 'cookies.json')
		fs.writeFileSync(file, content)
		return file
	}
	const goodCookie = {name: 'SAPISID', value: 'x', domain: '.youtube.com', hostOnly: false, path: '/', secure: true, httpOnly: false, session: false, expirationDate: 2_000_000_000}

	it('parses the seed file into Explore cookies', () => {
		const file = cookiesFile(JSON.stringify([goodCookie]))
		const mode = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ARROXY_E2E_EXPLORE_COOKIES: file}, {isPackaged: false})
		expect(mode.exploreCookies).toEqual([goodCookie])
	})

	it('has no cookies when the variable is unset', () => {
		expect(resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot()}, {isPackaged: false}).exploreCookies).toBeUndefined()
	})

	it('ignores the variable outside the gated harness', () => {
		const file = cookiesFile(JSON.stringify([goodCookie]))
		expect(resolveE2eHarnessMode({ARROXY_E2E_EXPLORE_COOKIES: file}, {isPackaged: false}).exploreCookies).toBeUndefined()
	})

	it('requires an absolute path', () => {
		expect(() => resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ARROXY_E2E_EXPLORE_COOKIES: 'cookies.json'}, {isPackaged: false})).toThrow(/ARROXY_E2E_EXPLORE_COOKIES.*absolute/)
	})

	it('fails loudly when the file is missing', () => {
		expect(() => resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ARROXY_E2E_EXPLORE_COOKIES: path.join(os.tmpdir(), 'arroxy-no-such-cookies.json')}, {isPackaged: false})).toThrow(/ARROXY_E2E_EXPLORE_COOKIES/)
	})

	it('fails loudly on invalid JSON', () => {
		const file = cookiesFile('{not json')
		expect(() => resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ARROXY_E2E_EXPLORE_COOKIES: file}, {isPackaged: false})).toThrow(/ARROXY_E2E_EXPLORE_COOKIES/)
	})

	it('fails loudly when a cookie has the wrong shape', () => {
		const file = cookiesFile(JSON.stringify([{...goodCookie, secure: 'yes'}]))
		expect(() => resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ARROXY_E2E_EXPLORE_COOKIES: file}, {isPackaged: false})).toThrow(/ARROXY_E2E_EXPLORE_COOKIES/)
	})
})

describe('resolveE2eHarnessMode Explore home override', () => {
	const enabled = (extra: NodeJS.ProcessEnv): NodeJS.ProcessEnv => ({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ...extra})

	it('exposes an absolute http(s) URL', () => {
		expect(resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_HOME: 'http://127.0.0.1:4567/explore/home'}), {isPackaged: false}).exploreHomeUrl).toBe('http://127.0.0.1:4567/explore/home')
		expect(resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_HOME: 'https://localhost:8443/'}), {isPackaged: false}).exploreHomeUrl).toBe('https://localhost:8443/')
	})

	it('has no override when the variable is unset', () => {
		expect(resolveE2eHarnessMode(enabled({}), {isPackaged: false}).exploreHomeUrl).toBeUndefined()
	})

	it('ignores the variable outside the gated harness', () => {
		expect(resolveE2eHarnessMode({ARROXY_E2E_EXPLORE_HOME: 'http://127.0.0.1:4567/'}, {isPackaged: false}).exploreHomeUrl).toBeUndefined()
		expect(resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_EXPLORE_HOME: 'http://127.0.0.1:4567/', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot()}, {isPackaged: true}).exploreHomeUrl).toBeUndefined()
	})

	it.each(['127.0.0.1:4567/home', '/explore/home', 'file:///tmp/home.html', 'javascript:alert(1)', 'data:text/html,x', 'not a url', ''])('fails loudly on %j', value => {
		expect(() => resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_HOME: value}), {isPackaged: false})).toThrow(/ARROXY_E2E_EXPLORE_HOME/)
	})
})

describe('resolveE2eHarnessMode Explore idle unload delay', () => {
	const enabled = (extra: NodeJS.ProcessEnv): NodeJS.ProcessEnv => ({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ...extra})

	it('exposes a positive whole number of milliseconds', () => {
		expect(resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_IDLE_MS: '1500'}), {isPackaged: false}).exploreIdleUnloadMs).toBe(1500)
	})

	it('keeps the production delay when the variable is unset', () => {
		expect(resolveE2eHarnessMode(enabled({}), {isPackaged: false}).exploreIdleUnloadMs).toBeUndefined()
	})

	it('ignores the variable outside the gated harness', () => {
		expect(resolveE2eHarnessMode({ARROXY_E2E_EXPLORE_IDLE_MS: '1500'}, {isPackaged: false}).exploreIdleUnloadMs).toBeUndefined()
		expect(resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_EXPLORE_IDLE_MS: '1500', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot()}, {isPackaged: true}).exploreIdleUnloadMs).toBeUndefined()
	})

	it.each(['0', '-5', '1.5', '1e3', 'soon', ' 100', ''])('fails loudly on %j', value => {
		expect(() => resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_IDLE_MS: value}), {isPackaged: false})).toThrow(/ARROXY_E2E_EXPLORE_IDLE_MS/)
	})
})

describe('isHeadlessWindowRequested', () => {
	it('enables the hidden window only when both E2E flags are set', () => {
		expect(isHeadlessWindowRequested({ARROXY_E2E: '1', ARROXY_E2E_HEADLESS: '1'})).toBe(true)
	})

	it('ignores ARROXY_E2E_HEADLESS outside an E2E run', () => {
		// A stray export in a developer's shell must never launch the real app
		// with an invisible window.
		expect(isHeadlessWindowRequested({ARROXY_E2E_HEADLESS: '1'})).toBe(false)
		expect(isHeadlessWindowRequested({ARROXY_E2E: '0', ARROXY_E2E_HEADLESS: '1'})).toBe(false)
	})

	it('keeps E2E runs visible by default', () => {
		expect(isHeadlessWindowRequested({ARROXY_E2E: '1'})).toBe(false)
	})
})

describe('resolveE2eHarnessMode Explore ad blocker filter seed', () => {
	const enabled = (extra: NodeJS.ProcessEnv): NodeJS.ProcessEnv => ({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot(), ...extra})

	function filtersFile(text: string): string {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-adblock-'))
		tempRoots.push(dir)
		const file = path.join(dir, 'filters.txt')
		fs.writeFileSync(file, text)
		return file
	}

	it('reads the filter list the engine is built from instead of fetching one', () => {
		expect(resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS: filtersFile('/fixture-ad.js\n')}), {isPackaged: false}).exploreAdBlockFilters).toBe('/fixture-ad.js\n')
	})

	it('is absent unless set, outside the gated harness, and in any packaged build', () => {
		const file = filtersFile('/fixture-ad.js')
		expect(resolveE2eHarnessMode(enabled({}), {isPackaged: false}).exploreAdBlockFilters).toBeUndefined()
		expect(resolveE2eHarnessMode({ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS: file}, {isPackaged: false}).exploreAdBlockFilters).toBeUndefined()
		expect(resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS: file, ARROXY_ENABLE_E2E_HARNESS: '1'}), {isPackaged: true}).exploreAdBlockFilters).toBeUndefined()
	})

	it.each(['relative/filters.txt', '/no/such/filters.txt'])('fails loudly on %j', value => {
		expect(() => resolveE2eHarnessMode(enabled({ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS: value}), {isPackaged: false})).toThrow(/ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS/)
	})
})
