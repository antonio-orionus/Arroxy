import {describe, expect, it, vi, beforeEach, afterEach} from 'vite-plus/test'

// Must mock electron and electron-updater before importing the module under test
vi.mock('electron', () => ({app: {getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy'), relaunch: vi.fn(), quit: vi.fn(), exit: vi.fn()}, ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))

vi.mock('electron-updater', () => {
	const au = {autoDownload: true, autoInstallOnAppQuit: true, on: vi.fn(), removeAllListeners: vi.fn(), setFeedURL: vi.fn(), checkForUpdates: vi.fn().mockResolvedValue(undefined), downloadUpdate: vi.fn().mockResolvedValue(undefined), quitAndInstall: vi.fn()}
	return {default: {autoUpdater: au}, autoUpdater: au}
})

vi.mock('@main/installChannel', () => ({detectInstallChannel: vi.fn().mockReturnValue('direct')}))

vi.mock('@main/services/binary/HomebrewRepair.js', () => ({canMoveUnderHomebrew: vi.fn().mockResolvedValue(false), upgradeArroxyWithHomebrew: vi.fn(), installArroxyWithHomebrew: vi.fn()}))

import {app, ipcMain} from 'electron'
import {canMoveUnderHomebrew, installArroxyWithHomebrew} from '@main/services/binary/HomebrewRepair.js'
import {autoUpdater} from 'electron-updater'
import {registerUpdaterHandlers} from '@main/ipc/registerUpdaterHandlers.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import log from 'electron-log/main.js'

type EventName = 'update-available' | 'update-downloaded' | 'error'
type HandlerMap = Partial<Record<EventName, (...args: unknown[]) => void>>

function makeWindow(isDestroyed = false) {
	return {isDestroyed: vi.fn().mockReturnValue(isDestroyed), webContents: {send: vi.fn()}} as unknown as Electron.BrowserWindow
}

function captureUpdaterHandlers(): HandlerMap {
	const handlers: HandlerMap = {}
	vi.mocked(autoUpdater.on).mockImplementation((event: string, fn: any) => {
		handlers[event as EventName] = fn
		return autoUpdater
	})
	return handlers
}

// The listener is fire-and-forget (it probes for brew before notifying), so
// flush the microtask queue instead of awaiting its return value.
async function fireUpdateAvailable(handlers: HandlerMap, info: {version: string}): Promise<void> {
	handlers['update-available']!(info)
	await vi.advanceTimersByTimeAsync(0)
}

describe('registerUpdaterHandlers', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('disables autoDownload and autoInstallOnAppQuit', () => {
		captureUpdaterHandlers()
		registerUpdaterHandlers(makeWindow())
		expect(autoUpdater.autoDownload).toBe(false)
		expect(autoUpdater.autoInstallOnAppQuit).toBe(false)
	})

	it('registers handlers for update-available, update-downloaded, and error', () => {
		registerUpdaterHandlers(makeWindow())
		const registeredEvents = vi.mocked(autoUpdater.on).mock.calls.map(c => c[0])
		expect(registeredEvents).toContain('update-available')
		expect(registeredEvents).toContain('update-downloaded')
		expect(registeredEvents).toContain('error')
	})

	it('sends updater:available IPC with correct payload on update-available', async () => {
		const handlers = captureUpdaterHandlers()
		const win = makeWindow()
		registerUpdaterHandlers(win)

		await fireUpdateAvailable(handlers, {version: '2.0.0'})

		expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, expect.objectContaining({version: '2.0.0', currentVersion: '1.0.0', installChannel: expect.any(String)}))
	})

	it('forwards installChannel from runtime detection', async () => {
		vi.resetModules()
		vi.doMock('@main/installChannel', () => ({detectInstallChannel: vi.fn().mockReturnValue('scoop')}))
		vi.doMock('electron', () => ({app: {getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy')}, ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))
		vi.doMock('electron-updater', () => {
			const au = {autoDownload: true, autoInstallOnAppQuit: true, on: vi.fn(), removeAllListeners: vi.fn(), setFeedURL: vi.fn(), checkForUpdates: vi.fn().mockResolvedValue(undefined), downloadUpdate: vi.fn().mockResolvedValue(undefined), quitAndInstall: vi.fn()}
			return {default: {autoUpdater: au}, autoUpdater: au}
		})
		const {registerUpdaterHandlers: registerWithScoop} = await import('@main/ipc/registerUpdaterHandlers.js')
		const {autoUpdater: scopedAutoUpdater} = await import('electron-updater')

		const handlers: HandlerMap = {}
		vi.mocked(scopedAutoUpdater.on).mockImplementation((event: string, fn: any) => {
			handlers[event as EventName] = fn
			return scopedAutoUpdater
		})
		const win = makeWindow()
		registerWithScoop(win)
		await fireUpdateAvailable(handlers, {version: '2.0.0'})

		expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, expect.objectContaining({installChannel: 'scoop'}))

		vi.doUnmock('@main/installChannel')
		vi.doUnmock('electron')
		vi.doUnmock('electron-updater')
		vi.resetModules()
	})

	it('checks for updates under Flatpak and reports them with the flatpak channel', async () => {
		vi.resetModules()
		vi.doMock('@main/installChannel', () => ({detectInstallChannel: vi.fn().mockReturnValue('flatpak')}))
		vi.doMock('electron', () => ({app: {getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy')}, ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))
		vi.doMock('electron-updater', () => {
			const au = {autoDownload: true, autoInstallOnAppQuit: true, forceDevUpdateConfig: false, on: vi.fn(), removeAllListeners: vi.fn(), setFeedURL: vi.fn(), checkForUpdates: vi.fn().mockResolvedValue(undefined), downloadUpdate: vi.fn().mockResolvedValue(undefined), quitAndInstall: vi.fn()}
			return {default: {autoUpdater: au}, autoUpdater: au}
		})
		const {registerUpdaterHandlers: registerWithFlatpak} = await import('@main/ipc/registerUpdaterHandlers.js')
		const {autoUpdater: scopedAutoUpdater} = await import('electron-updater')
		const handlers: HandlerMap = {}
		vi.mocked(scopedAutoUpdater.on).mockImplementation((event: string, fn: any) => {
			handlers[event as EventName] = fn
			return scopedAutoUpdater
		})

		const win = makeWindow()
		registerWithFlatpak(win)
		vi.runAllTimers()
		await fireUpdateAvailable(handlers, {version: '2.0.0'})

		// The Linux updater refuses to check without $APPIMAGE; Flatpak has none.
		expect(scopedAutoUpdater.forceDevUpdateConfig).toBe(true)
		expect(scopedAutoUpdater.checkForUpdates).toHaveBeenCalledOnce()
		expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, expect.objectContaining({version: '2.0.0', installChannel: 'flatpak'}))

		vi.doUnmock('@main/installChannel')
		vi.doUnmock('electron')
		vi.doUnmock('electron-updater')
		vi.resetModules()
	})

	it('leaves the updater dev override off outside Flatpak', () => {
		registerUpdaterHandlers(makeWindow())
		expect(vi.mocked(autoUpdater).forceDevUpdateConfig).not.toBe(true)
	})

	it('reads releases from GitHub by default', () => {
		registerUpdaterHandlers(makeWindow())
		expect(autoUpdater.setFeedURL).toHaveBeenCalledWith({provider: 'github', owner: 'antonio-orionus', repo: 'Arroxy', channel: 'latest'})
	})

	it('reads releases from a loopback ARROXY_UPDATE_FEED_URL', () => {
		vi.stubEnv('ARROXY_UPDATE_FEED_URL', 'http://127.0.0.1:8765/')
		try {
			registerUpdaterHandlers(makeWindow())
			expect(autoUpdater.setFeedURL).toHaveBeenCalledWith({provider: 'generic', url: 'http://127.0.0.1:8765/', channel: 'latest'})
		} finally {
			vi.unstubAllEnvs()
		}
	})

	it('ignores a non-loopback ARROXY_UPDATE_FEED_URL and logs the rejection without the URL', () => {
		// A rejected value may carry credentials; it must not reach the log.
		vi.stubEnv('ARROXY_UPDATE_FEED_URL', 'https://user:s3cret@example.com/feed/')
		const warn = vi.spyOn(log, 'warn').mockImplementation(() => {})
		try {
			registerUpdaterHandlers(makeWindow())
			expect(autoUpdater.setFeedURL).toHaveBeenCalledWith({provider: 'github', owner: 'antonio-orionus', repo: 'Arroxy', channel: 'latest'})
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('ARROXY_UPDATE_FEED_URL'))
			expect(JSON.stringify(warn.mock.calls)).not.toContain('s3cret')
		} finally {
			warn.mockRestore()
			vi.unstubAllEnvs()
		}
	})

	it('does not send IPC if window is destroyed', async () => {
		const handlers = captureUpdaterHandlers()
		const win = makeWindow(true)
		registerUpdaterHandlers(win)

		await fireUpdateAvailable(handlers, {version: '2.0.0'})

		expect(win.webContents.send).not.toHaveBeenCalled()
	})

	it('calls quitAndInstall when update-downloaded fires', () => {
		const handlers = captureUpdaterHandlers()
		registerUpdaterHandlers(makeWindow())

		handlers['update-downloaded']!()

		expect(autoUpdater.quitAndInstall).toHaveBeenCalledWith(false, true)
	})

	it('logs errors silently when error fires', () => {
		const handlers = captureUpdaterHandlers()
		registerUpdaterHandlers(makeWindow())

		const err = new Error('network failure')
		handlers.error!(err)

		expect(log.error).toHaveBeenCalledWith('[updater]', 'network failure')
	})

	it('registers updater:install IPC handler', () => {
		const ipcHandlerNames: string[] = []
		vi.mocked(ipcMain.handle).mockImplementation((name: string, _fn: any) => {
			ipcHandlerNames.push(name)
		})
		registerUpdaterHandlers(makeWindow())
		expect(ipcHandlerNames).toContain(IPC_CHANNELS.updaterInstall)
	})

	it('updater:install handler calls downloadUpdate()', async () => {
		let installHandler: (() => Promise<unknown>) | null = null
		vi.mocked(ipcMain.handle).mockImplementation((name: string, fn: any) => {
			if (name === IPC_CHANNELS.updaterInstall) installHandler = fn
		})
		captureUpdaterHandlers()
		registerUpdaterHandlers(makeWindow())

		expect(installHandler).not.toBeNull()
		// The handler returns a Promise that resolves only when update-downloaded
		// (or error) fires, so kick it off without awaiting and assert the
		// download was started.
		void installHandler!()
		await Promise.resolve()
		expect(autoUpdater.downloadUpdate).toHaveBeenCalledOnce()
	})

	it('updater:install resolves with ok:true when update-downloaded fires', async () => {
		let installHandler: (() => Promise<unknown>) | null = null
		vi.mocked(ipcMain.handle).mockImplementation((name: string, fn: any) => {
			if (name === IPC_CHANNELS.updaterInstall) installHandler = fn
		})
		const handlers = captureUpdaterHandlers()
		registerUpdaterHandlers(makeWindow())

		const promise = installHandler!()
		handlers['update-downloaded']!()
		await expect(promise).resolves.toEqual({ok: true})
	})

	it('updater:install resolves with ok:false when error fires mid-download', async () => {
		let installHandler: (() => Promise<unknown>) | null = null
		vi.mocked(ipcMain.handle).mockImplementation((name: string, fn: any) => {
			if (name === IPC_CHANNELS.updaterInstall) installHandler = fn
		})
		const handlers = captureUpdaterHandlers()
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		registerUpdaterHandlers(makeWindow())

		const promise = installHandler!()
		handlers.error!(new Error('checksum mismatch'))
		await expect(promise).resolves.toEqual({ok: false, error: 'checksum mismatch'})
	})

	it('updater:install resolves with ok:false when downloadUpdate rejects', async () => {
		let installHandler: (() => Promise<unknown>) | null = null
		vi.mocked(ipcMain.handle).mockImplementation((name: string, fn: any) => {
			if (name === IPC_CHANNELS.updaterInstall) installHandler = fn
		})
		captureUpdaterHandlers()
		vi.mocked(autoUpdater.downloadUpdate).mockRejectedValueOnce(new Error('no network'))
		registerUpdaterHandlers(makeWindow())

		await expect(installHandler!()).resolves.toEqual({ok: false, error: 'no network'})
	})

	it('updater:install rejects with ok:false on non-installable channels', async () => {
		for (const channel of ['scoop', 'portable', 'flatpak', 'tarball'] as const) {
			vi.resetModules()
			vi.doMock('@main/installChannel', () => ({detectInstallChannel: vi.fn().mockReturnValue(channel)}))
			vi.doMock('electron', () => ({app: {getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy')}, ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))
			vi.doMock('electron-updater', () => {
				const au = {autoDownload: true, autoInstallOnAppQuit: true, on: vi.fn(), removeAllListeners: vi.fn(), setFeedURL: vi.fn(), checkForUpdates: vi.fn().mockResolvedValue(undefined), downloadUpdate: vi.fn().mockResolvedValue(undefined), quitAndInstall: vi.fn()}
				return {default: {autoUpdater: au}, autoUpdater: au}
			})
			const {registerUpdaterHandlers: register} = await import('@main/ipc/registerUpdaterHandlers.js')
			const {autoUpdater: scopedAutoUpdater} = await import('electron-updater')
			const {ipcMain: scopedIpcMain} = await import('electron')

			let installHandler: (() => Promise<unknown>) | null = null
			vi.mocked(scopedIpcMain.handle).mockImplementation((name: string, fn: any) => {
				if (name === IPC_CHANNELS.updaterInstall) installHandler = fn
			})
			register(makeWindow())

			const result = await installHandler!()
			expect(result).toMatchObject({ok: false})
			expect(scopedAutoUpdater.downloadUpdate).not.toHaveBeenCalled()

			vi.doUnmock('@main/installChannel')
			vi.doUnmock('electron')
			vi.doUnmock('electron-updater')
		}
		vi.resetModules()
	})

	describe('direct install on a Mac with Homebrew', () => {
		async function announceUpdate(): Promise<{install: () => Promise<unknown>; win: Electron.BrowserWindow}> {
			let installHandler: (() => Promise<unknown>) | null = null
			vi.mocked(ipcMain.handle).mockImplementation((name: string, fn: any) => {
				if (name === IPC_CHANNELS.updaterInstall) installHandler = fn
			})
			const handlers = captureUpdaterHandlers()
			const win = makeWindow()
			registerUpdaterHandlers(win)
			await fireUpdateAvailable(handlers, {version: '2.0.0'})
			return {install: installHandler!, win}
		}

		it('tells the renderer Homebrew is available, so it can offer the switch', async () => {
			vi.mocked(canMoveUnderHomebrew).mockResolvedValueOnce(true)
			const {win} = await announceUpdate()

			expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, expect.objectContaining({installChannel: 'direct', homebrewAvailable: true}))
		})

		it('tells the renderer Homebrew is not available when brew is missing', async () => {
			const {win} = await announceUpdate()

			expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, expect.objectContaining({installChannel: 'direct', homebrewAvailable: false}))
		})

		it('updater:install force-installs the cask through Homebrew, then relaunches', async () => {
			vi.mocked(canMoveUnderHomebrew).mockResolvedValueOnce(true)
			const {install} = await announceUpdate()

			await expect(install()).resolves.toEqual({ok: true})

			// The announced version rides along so main can refuse to relaunch into an
			// older cask when Homebrew's tap lags the release.
			expect(installArroxyWithHomebrew).toHaveBeenCalledExactlyOnceWith('2.0.0')
			expect(app.relaunch).toHaveBeenCalledOnce()
			// quit(), not exit(): exit() skips `before-quit`, which cancels running
			// downloads and disposes the tray, hotkeys and token service.
			expect(app.quit).toHaveBeenCalledOnce()
			expect(app.exit).not.toHaveBeenCalled()
			expect(autoUpdater.downloadUpdate).not.toHaveBeenCalled()
		})

		it('updater:install reports a failed brew install and keeps the app running', async () => {
			vi.mocked(canMoveUnderHomebrew).mockResolvedValueOnce(true)
			vi.mocked(installArroxyWithHomebrew).mockRejectedValueOnce(new Error('Error: Cask arroxy exited with 1'))
			const {install} = await announceUpdate()

			await expect(install()).resolves.toEqual({ok: false, error: 'Error: Cask arroxy exited with 1'})

			expect(app.relaunch).not.toHaveBeenCalled()
			expect(app.quit).not.toHaveBeenCalled()
		})

		// Betas are never published to Homebrew (the cask is stable-only), so the
		// force-install would downgrade a beta user to the previous stable release.
		it('does not offer the Homebrew switch to a prerelease build', async () => {
			vi.mocked(app.getVersion).mockReturnValue('1.1.0-beta.2')
			try {
				vi.mocked(canMoveUnderHomebrew).mockResolvedValue(true)
				const {install, win} = await announceUpdate()

				expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, expect.objectContaining({installChannel: 'direct', homebrewAvailable: false}))
				void install()
				await vi.waitFor(() => expect(autoUpdater.downloadUpdate).toHaveBeenCalledOnce())
				expect(installArroxyWithHomebrew).not.toHaveBeenCalled()
			} finally {
				vi.mocked(app.getVersion).mockReturnValue('1.0.0')
				vi.mocked(canMoveUnderHomebrew).mockResolvedValue(false)
			}
		})

		it('updater:install keeps the electron-updater download when brew is missing', async () => {
			const {install} = await announceUpdate()

			void install()
			await vi.waitFor(() => expect(autoUpdater.downloadUpdate).toHaveBeenCalledOnce())
			expect(installArroxyWithHomebrew).not.toHaveBeenCalled()
		})
	})

	describe('homebrew channel', () => {
		async function registerForHomebrew(upgrade: () => Promise<void>) {
			vi.resetModules()
			vi.doMock('@main/installChannel', () => ({detectInstallChannel: vi.fn().mockReturnValue('homebrew')}))
			vi.doMock('electron', () => ({app: {getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy'), relaunch: vi.fn(), quit: vi.fn(), exit: vi.fn()}, ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))
			vi.doMock('electron-updater', () => {
				const au = {autoDownload: true, autoInstallOnAppQuit: true, on: vi.fn(), removeAllListeners: vi.fn(), setFeedURL: vi.fn(), checkForUpdates: vi.fn().mockResolvedValue(undefined), downloadUpdate: vi.fn().mockResolvedValue(undefined), quitAndInstall: vi.fn()}
				return {default: {autoUpdater: au}, autoUpdater: au}
			})
			const upgradeArroxyWithHomebrew = vi.fn(upgrade)
			vi.doMock('@main/services/binary/HomebrewRepair.js', () => ({upgradeArroxyWithHomebrew, canMoveUnderHomebrew: vi.fn().mockResolvedValue(false), installArroxyWithHomebrew: vi.fn()}))
			const {registerUpdaterHandlers: register} = await import('@main/ipc/registerUpdaterHandlers.js')
			const {autoUpdater: scopedAutoUpdater} = await import('electron-updater')
			const {app: scopedApp, ipcMain: scopedIpcMain} = await import('electron')

			let installHandler: (() => Promise<unknown>) | null = null
			vi.mocked(scopedIpcMain.handle).mockImplementation((name: string, fn: any) => {
				if (name === IPC_CHANNELS.updaterInstall) installHandler = fn
			})
			const handlers: HandlerMap = {}
			vi.mocked(scopedAutoUpdater.on).mockImplementation((event: string, fn: any) => {
				handlers[event as EventName] = fn
				return scopedAutoUpdater
			})
			register(makeWindow())
			// The banner only exists once an update was announced; install acts on that version.
			await fireUpdateAvailable(handlers, {version: '2.0.0'})
			return {install: installHandler!, upgradeArroxyWithHomebrew, scopedApp, scopedAutoUpdater}
		}

		afterEach(() => {
			vi.doUnmock('@main/installChannel')
			vi.doUnmock('electron')
			vi.doUnmock('electron-updater')
			vi.doUnmock('@main/services/binary/HomebrewRepair.js')
			vi.resetModules()
		})

		it('updater:install upgrades through Homebrew, then relaunches into the new bundle', async () => {
			const {install, upgradeArroxyWithHomebrew, scopedApp, scopedAutoUpdater} = await registerForHomebrew(async () => undefined)

			await expect(install()).resolves.toEqual({ok: true})

			expect(upgradeArroxyWithHomebrew).toHaveBeenCalledExactlyOnceWith('2.0.0')
			expect(scopedApp.relaunch).toHaveBeenCalledOnce()
			expect(scopedApp.quit).toHaveBeenCalledOnce()
			expect(scopedApp.exit).not.toHaveBeenCalled()
			expect(scopedAutoUpdater.downloadUpdate).not.toHaveBeenCalled()
		})

		it('updater:install reports the failure and stays running when the upgrade fails', async () => {
			const {install, scopedApp} = await registerForHomebrew(async () => {
				throw new Error('Homebrew was not found.')
			})

			await expect(install()).resolves.toEqual({ok: false, error: 'Homebrew was not found.'})

			expect(scopedApp.relaunch).not.toHaveBeenCalled()
			expect(scopedApp.quit).not.toHaveBeenCalled()
		})

		// With running downloads quit() cancels them asynchronously and the app lives
		// on for a moment; the renderer re-enables the button the instant the IPC
		// resolves, so a clearing guard would let a second brew start mid-shutdown.
		it('updater:install stays refused after a successful upgrade, while the app shuts down', async () => {
			const {install, upgradeArroxyWithHomebrew} = await registerForHomebrew(async () => undefined)

			await expect(install()).resolves.toEqual({ok: true})
			await expect(install()).resolves.toMatchObject({ok: false})

			expect(upgradeArroxyWithHomebrew).toHaveBeenCalledOnce()
		})

		it('updater:install allows a retry after a failed upgrade', async () => {
			let attempts = 0
			const {install, upgradeArroxyWithHomebrew} = await registerForHomebrew(async () => {
				if (attempts++ === 0) throw new Error('Homebrew has 0.5.2 but 2.0.0 was announced.')
			})

			await expect(install()).resolves.toMatchObject({ok: false})
			await expect(install()).resolves.toEqual({ok: true})

			expect(upgradeArroxyWithHomebrew).toHaveBeenCalledTimes(2)
		})

		it('updater:install ignores a second invoke while an upgrade is already running', async () => {
			const {promise: gate, resolve: release} = Promise.withResolvers<void>()
			const {install, upgradeArroxyWithHomebrew} = await registerForHomebrew(() => gate)

			const first = install()
			await expect(install()).resolves.toMatchObject({ok: false})
			release()
			await expect(first).resolves.toEqual({ok: true})

			expect(upgradeArroxyWithHomebrew).toHaveBeenCalledOnce()
		})
	})

	it('calls checkForUpdates after 5 second delay', () => {
		captureUpdaterHandlers()
		registerUpdaterHandlers(makeWindow())

		expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled()
		vi.advanceTimersByTime(5_001)
		expect(autoUpdater.checkForUpdates).toHaveBeenCalledOnce()
	})

	it('does not call checkForUpdates before 5 seconds', () => {
		captureUpdaterHandlers()
		registerUpdaterHandlers(makeWindow())

		vi.advanceTimersByTime(4_999)
		expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled()
	})

	it('includes currentVersion from app.getVersion()', async () => {
		vi.mocked(app.getVersion).mockReturnValue('0.5.3')
		const handlers = captureUpdaterHandlers()
		const win = makeWindow()
		registerUpdaterHandlers(win)

		await fireUpdateAvailable(handlers, {version: '1.0.0'})

		expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.updaterAvailable, expect.objectContaining({currentVersion: '0.5.3'}))
	})
})
