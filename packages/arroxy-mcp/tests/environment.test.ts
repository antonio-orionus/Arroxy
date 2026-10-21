import {describe, expect, it} from 'vite-plus/test'
import {bridgeConfigDir, userDataCandidates} from '../src/environment'

describe('userDataCandidates', () => {
	it('uses only ARROXY_USER_DATA when it is set', () => {
		expect(userDataCandidates({platform: 'linux', homedir: '/home/a', env: {ARROXY_USER_DATA: '/tmp/dev-profile'}})).toEqual(['/tmp/dev-profile'])
	})

	it('looks in Application Support on macOS, under the lowercase package name', () => {
		expect(userDataCandidates({platform: 'darwin', homedir: '/Users/a', env: {}})).toEqual(['/Users/a/Library/Application Support/arroxy'])
	})

	it('looks in APPDATA on Windows', () => {
		expect(userDataCandidates({platform: 'win32', homedir: 'C:\\Users\\a', env: {APPDATA: 'C:\\Users\\a\\AppData\\Roaming'}})).toEqual(['C:\\Users\\a\\AppData\\Roaming\\arroxy'])
		expect(userDataCandidates({platform: 'win32', homedir: 'C:\\Users\\a', env: {}})).toEqual(['C:\\Users\\a\\AppData\\Roaming\\arroxy'])
	})

	it('looks in the XDG config folder and the Flatpak one on Linux, lowercase first, then capitalised', () => {
		const flatpak = '/home/a/.var/app/io.github.antonio_orionus.Arroxy/config'
		expect(userDataCandidates({platform: 'linux', homedir: '/home/a', env: {}})).toEqual(['/home/a/.config/arroxy', '/home/a/.config/Arroxy', `${flatpak}/arroxy`, `${flatpak}/Arroxy`])
		expect(userDataCandidates({platform: 'linux', homedir: '/home/a', env: {XDG_CONFIG_HOME: '/xdg'}})).toEqual(['/xdg/arroxy', '/xdg/Arroxy', `${flatpak}/arroxy`, `${flatpak}/Arroxy`])
	})
})

describe('bridgeConfigDir', () => {
	it('honours ARROXY_MCP_CONFIG_DIR', () => {
		expect(bridgeConfigDir({platform: 'darwin', homedir: '/Users/a', env: {ARROXY_MCP_CONFIG_DIR: '/tmp/cfg'}})).toBe('/tmp/cfg')
	})

	it('uses each OS config folder', () => {
		expect(bridgeConfigDir({platform: 'darwin', homedir: '/Users/a', env: {}})).toBe('/Users/a/Library/Application Support/arroxy-mcp')
		expect(bridgeConfigDir({platform: 'win32', homedir: 'C:\\Users\\a', env: {APPDATA: 'D:\\Roaming'}})).toBe('D:\\Roaming\\arroxy-mcp')
		expect(bridgeConfigDir({platform: 'linux', homedir: '/home/a', env: {}})).toBe('/home/a/.config/arroxy-mcp')
		expect(bridgeConfigDir({platform: 'linux', homedir: '/home/a', env: {XDG_CONFIG_HOME: '/xdg'}})).toBe('/xdg/arroxy-mcp')
	})
})
