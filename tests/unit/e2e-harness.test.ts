// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'
import {defaultAppSettings} from '@shared/constants.js'
import {resolveE2eHarnessMode} from '@main/e2eHarness.js'

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
		expect(mode.downloadRetryPolicy).toEqual({retries: 1, fragmentRetries: 1, retrySleep: 'fragment:0'})
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

	it('keeps clipboard watching disabled in E2E unless explicitly opted in', () => {
		const root = makePluginRoot()
		const disabled = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: root}, {isPackaged: false})
		const enabled = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_ENABLE_CLIPBOARD_WATCH: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: root}, {isPackaged: false})

		expect(disabled.applyAppSettingsDefaults(defaultAppSettings('/downloads')).common.clipboardWatchEnabled).toBe(false)
		expect(enabled.allowClipboardWatch).toBe(true)
		expect(enabled.applyAppSettingsDefaults(defaultAppSettings('/downloads')).common.clipboardWatchEnabled).toBe(true)
	})
})
