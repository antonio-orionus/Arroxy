import os from 'node:os'
import path from 'node:path'

// Where the bridge looks. Passed in rather than read from `process`, so tests
// can point it at temp folders and pretend to be another OS.
export interface BridgeEnvironment {
	readonly platform: NodeJS.Platform
	readonly homedir: string
	readonly env: Readonly<Record<string, string | undefined>>
}

export function processEnvironment(): BridgeEnvironment {
	return {platform: process.platform, homedir: os.homedir(), env: process.env}
}

// Electron names the userData folder after package.json `name`; `productName`
// lives only in the electron-builder config, so it never reaches the app.
const APP_DIR_NAME = 'arroxy'
// Linux paths are case-sensitive: a cheap second try in case a build ever
// takes the productName.
const APP_DIR_NAME_FALLBACK = 'Arroxy'
const BRIDGE_DIR_NAME = 'arroxy-mcp'
const FLATPAK_APP_ID = 'io.github.antonio_orionus.Arroxy'

function pathsFor(platform: NodeJS.Platform): typeof path.posix {
	return platform === 'win32' ? path.win32 : path.posix
}

function nonEmpty(value: string | undefined): string | undefined {
	return value === undefined || value === '' ? undefined : value
}

function windowsAppData(environment: BridgeEnvironment): string {
	return nonEmpty(environment.env.APPDATA) ?? path.win32.join(environment.homedir, 'AppData', 'Roaming')
}

function xdgConfigHome(environment: BridgeEnvironment): string {
	return nonEmpty(environment.env.XDG_CONFIG_HOME) ?? path.posix.join(environment.homedir, '.config')
}

// The userData folders Arroxy may have written control.json into, in the order
// they are tried. On Linux both the native and the Flatpak install are checked,
// each as `arroxy` then `Arroxy`; the one whose socket answers wins. macOS and
// Windows folders are case-insensitive, so one name covers both there.
export function userDataCandidates(environment: BridgeEnvironment): string[] {
	const override = nonEmpty(environment.env.ARROXY_USER_DATA)
	if (override !== undefined) return [override]
	const paths = pathsFor(environment.platform)
	switch (environment.platform) {
		case 'darwin':
			return [paths.join(environment.homedir, 'Library', 'Application Support', APP_DIR_NAME)]
		case 'win32':
			return [paths.join(windowsAppData(environment), APP_DIR_NAME)]
		default: {
			const parents = [xdgConfigHome(environment), paths.join(environment.homedir, '.var', 'app', FLATPAK_APP_ID, 'config')]
			return parents.flatMap(parent => [paths.join(parent, APP_DIR_NAME), paths.join(parent, APP_DIR_NAME_FALLBACK)])
		}
	}
}

// The bridge's own folder, which holds the client secrets Arroxy issued it.
export function bridgeConfigDir(environment: BridgeEnvironment): string {
	const override = nonEmpty(environment.env.ARROXY_MCP_CONFIG_DIR)
	if (override !== undefined) return override
	const paths = pathsFor(environment.platform)
	switch (environment.platform) {
		case 'darwin':
			return paths.join(environment.homedir, 'Library', 'Application Support', BRIDGE_DIR_NAME)
		case 'win32':
			return paths.join(windowsAppData(environment), BRIDGE_DIR_NAME)
		default:
			return paths.join(xdgConfigHome(environment), BRIDGE_DIR_NAME)
	}
}
