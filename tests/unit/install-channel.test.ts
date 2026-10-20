import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const ORIGINAL_PLATFORM = Object.getOwnPropertyDescriptor(process, 'platform')!
const ORIGINAL_EXEC_PATH = Object.getOwnPropertyDescriptor(process, 'execPath')!
const ORIGINAL_PORTABLE_ENV = process.env.PORTABLE_EXECUTABLE_FILE
const ORIGINAL_APPIMAGE_ENV = process.env.APPIMAGE

function setPlatform(value: NodeJS.Platform): void {
	Object.defineProperty(process, 'platform', {value, configurable: true})
}

function setExecPath(value: string): void {
	Object.defineProperty(process, 'execPath', {value, configurable: true})
}

describe('detectInstallChannel', () => {
	beforeEach(() => {
		vi.resetModules()
		delete process.env.PORTABLE_EXECUTABLE_FILE
		delete process.env.APPIMAGE
	})

	afterEach(() => {
		Object.defineProperty(process, 'platform', ORIGINAL_PLATFORM)
		Object.defineProperty(process, 'execPath', ORIGINAL_EXEC_PATH)
		if (ORIGINAL_PORTABLE_ENV === undefined) {
			delete process.env.PORTABLE_EXECUTABLE_FILE
		} else {
			process.env.PORTABLE_EXECUTABLE_FILE = ORIGINAL_PORTABLE_ENV
		}
		if (ORIGINAL_APPIMAGE_ENV === undefined) {
			delete process.env.APPIMAGE
		} else {
			process.env.APPIMAGE = ORIGINAL_APPIMAGE_ENV
		}
		vi.restoreAllMocks()
	})

	it('detects scoop from a user-scope execPath on win32', async () => {
		setPlatform('win32')
		setExecPath('C:\\Users\\tester\\scoop\\apps\\arroxy\\current\\Arroxy.exe')
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('scoop')
	})

	it('detects scoop from a global-scope execPath on win32', async () => {
		setPlatform('win32')
		setExecPath('C:\\ProgramData\\scoop\\apps\\arroxy\\current\\Arroxy.exe')
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('scoop')
	})

	it('falls back to direct on win32 when execPath is a normal NSIS install', async () => {
		setPlatform('win32')
		setExecPath('C:\\Users\\tester\\AppData\\Local\\Programs\\Arroxy\\Arroxy.exe')
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('direct')
	})

	it('detects portable on win32 when PORTABLE_EXECUTABLE_FILE is set', async () => {
		setPlatform('win32')
		setExecPath('C:\\Users\\tester\\Downloads\\Arroxy-portable.exe')
		process.env.PORTABLE_EXECUTABLE_FILE = 'C:\\Users\\tester\\Downloads\\Arroxy-portable.exe'
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('portable')
	})

	it('scoop wins over portable detection (scoop installs do not set PORTABLE_EXECUTABLE_FILE in practice)', async () => {
		setPlatform('win32')
		setExecPath('C:\\Users\\tester\\scoop\\apps\\arroxy\\current\\Arroxy.exe')
		process.env.PORTABLE_EXECUTABLE_FILE = 'whatever'
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('scoop')
	})

	it('detects winget on win32 when the installer left its marker beside the executable', async () => {
		setPlatform('win32')
		setExecPath('C:\\Users\\tester\\AppData\\Local\\Programs\\Arroxy\\Arroxy.exe')
		vi.doMock('node:fs', () => ({default: {existsSync: (p: string) => p === 'C:\\Users\\tester\\AppData\\Local\\Programs\\Arroxy\\installed-by-winget'}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('winget')
		vi.doUnmock('node:fs')
	})

	it('scoop and portable win over a winget marker', async () => {
		setPlatform('win32')
		vi.doMock('node:fs', () => ({default: {existsSync: (p: string) => p.endsWith('installed-by-winget')}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		setExecPath('C:\\Users\\tester\\scoop\\apps\\arroxy\\current\\Arroxy.exe')
		expect(detectInstallChannel('arroxy')).toBe('scoop')
		setExecPath('C:\\Users\\tester\\Downloads\\Arroxy-portable.exe')
		process.env.PORTABLE_EXECUTABLE_FILE = 'C:\\Users\\tester\\Downloads\\Arroxy-portable.exe'
		expect(detectInstallChannel('arroxy')).toBe('portable')
		vi.doUnmock('node:fs')
	})

	it('detects homebrew on darwin when Caskroom directory exists for the given app name', async () => {
		setPlatform('darwin')
		vi.doMock('node:fs', () => ({default: {existsSync: (p: string) => p === '/opt/homebrew/Caskroom/arroxy'}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('homebrew')
		vi.doUnmock('node:fs')
	})

	it('uses the supplied app name (not a hardcoded brand) for darwin Caskroom lookup', async () => {
		setPlatform('darwin')
		vi.doMock('node:fs', () => ({default: {existsSync: (p: string) => p === '/opt/homebrew/Caskroom/foobar'}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('foobar')).toBe('homebrew')
		expect(detectInstallChannel('arroxy')).toBe('direct')
		vi.doUnmock('node:fs')
	})

	it('falls back to direct on darwin when no Caskroom directory exists', async () => {
		setPlatform('darwin')
		vi.doMock('node:fs', () => ({default: {existsSync: () => false}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('direct')
		vi.doUnmock('node:fs')
	})

	it('detects an AppImage on linux when the runtime sets APPIMAGE', async () => {
		setPlatform('linux')
		process.env.APPIMAGE = '/home/tester/Arroxy-linux-x64.AppImage'
		vi.doMock('node:fs', () => ({default: {existsSync: () => false}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('appimage')
		vi.doUnmock('node:fs')
	})

	it('treats a linux install that is neither Flatpak nor an AppImage as the tarball', async () => {
		setPlatform('linux')
		vi.doMock('node:fs', () => ({default: {existsSync: () => false}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('tarball')
		vi.doUnmock('node:fs')
	})

	it('ignores an empty APPIMAGE value', async () => {
		setPlatform('linux')
		process.env.APPIMAGE = ''
		vi.doMock('node:fs', () => ({default: {existsSync: () => false}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('tarball')
		vi.doUnmock('node:fs')
	})

	it('flatpak wins over APPIMAGE', async () => {
		setPlatform('linux')
		process.env.APPIMAGE = '/home/tester/Arroxy-linux-x64.AppImage'
		vi.doMock('node:fs', () => ({default: {existsSync: (p: string) => p === '/.flatpak-info'}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('flatpak')
		vi.doUnmock('node:fs')
	})

	it('detects flatpak on linux when /.flatpak-info exists', async () => {
		setPlatform('linux')
		vi.doMock('node:fs', () => ({default: {existsSync: (p: string) => p === '/.flatpak-info'}}))
		const {detectInstallChannel} = await import('@main/installChannel.js')
		expect(detectInstallChannel('arroxy')).toBe('flatpak')
		vi.doUnmock('node:fs')
	})
})
