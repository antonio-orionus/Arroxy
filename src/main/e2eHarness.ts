import fs from 'node:fs'
import path from 'node:path'
import type {AppSettings} from '@shared/types.js'

interface HarnessGate {
	isPackaged: boolean
}

interface YtDlpHarnessArgsOptions {
	isProbe: boolean
}

export interface DownloadRetryPolicy {
	retries: number
	fragmentRetries: number
	retrySleep: string
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
	downloadRetryPolicy?: DownloadRetryPolicy
}

const E2E_COMMAND_LINE_SWITCHES = ['disable-background-networking', 'disable-component-update', 'disable-domain-reliability', 'no-pings'] as const

function isE2eHarnessEnabled(env: NodeJS.ProcessEnv, gate: HarnessGate): boolean {
	return env.ARROXY_E2E === '1' && (!gate.isPackaged || env.ARROXY_ENABLE_E2E_HARNESS === '1')
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

export function resolveE2eHarnessMode(env: NodeJS.ProcessEnv = process.env, gate: HarnessGate): E2eHarnessMode {
	if (!isE2eHarnessEnabled(env, gate)) {
		return {enabled: false, disableAnalytics: false, disableUpdater: false, allowClipboardWatch: true, useMockTokenProvider: false, commandLineSwitches: [], applyAppSettingsDefaults: defaults => defaults, applySpawnEnv: baseEnv => ({...baseEnv}), ytDlpArgs: () => [], downloadRetryPolicy: undefined}
	}

	const pluginRoot = validatePluginRoot(env.ARROXY_E2E_YTDLP_PLUGIN_DIR)
	const allowClipboardWatch = env.ARROXY_E2E_ENABLE_CLIPBOARD_WATCH === '1'
	// yt-dlp's --plugin-dirs iterates DIR/* and looks for yt_dlp_plugins inside
	// each child. The env var names the trusted plugin root, so pass its parent.
	const pluginContainer = path.dirname(pluginRoot)
	const denyProxyUrl = env.ARROXY_E2E_DENY_PROXY_URL

	return {
		enabled: true,
		disableAnalytics: true,
		disableUpdater: true,
		allowClipboardWatch,
		useMockTokenProvider: true,
		commandLineSwitches: E2E_COMMAND_LINE_SWITCHES,
		applyAppSettingsDefaults: defaults => applyE2eAppSettingsDefaults(defaults, allowClipboardWatch),
		applySpawnEnv: baseEnv => applyProxyEnv(baseEnv, denyProxyUrl),
		ytDlpArgs: ({isProbe}) => {
			const args = ['--ignore-config', '--plugin-dirs', pluginContainer, '--no-cache-dir']
			if (!isProbe) args.push('--newline')
			return args
		},
		downloadRetryPolicy: {retries: 1, fragmentRetries: 1, retrySleep: 'fragment:0'}
	}
}
