import {app, ipcMain, type BrowserWindow} from 'electron'
import electronUpdater from 'electron-updater'

const {autoUpdater} = electronUpdater
import log from 'electron-log/main.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {detectInstallChannel} from '@main/installChannel.js'
import {resolveUpdateFeed} from '@main/updateFeed.js'
import type {InstallChannel, UpdateAvailablePayload, UpdateInstallResult} from '@shared/types.js'

// Channels where the in-app installer should not run — either because an
// external package manager owns updates (scoop/homebrew/flatpak) or because the
// install layout can't accept an NSIS overwrite (portable). The renderer
// still gets a banner so the user can copy the upgrade command.
const NON_INSTALLABLE: ReadonlySet<InstallChannel> = new Set(['scoop', 'homebrew', 'portable', 'flatpak'])

// Map the running version's semver prerelease tag to an electron-updater
// release channel. Stable versions follow `latest` and must never see beta
// releases; prerelease builds follow their own channel so a v0.3.1-beta.3
// install upgrades along beta.yml, not latest.yml.
function resolveUpdateChannel(version: string): {channel: string; allowPrerelease: boolean} {
	const dashIdx = version.indexOf('-')
	if (dashIdx === -1) return {channel: 'latest', allowPrerelease: false}
	const tag = version
		.slice(dashIdx + 1)
		.split('.', 1)[0]
		.toLowerCase()
	if (tag === 'beta' || tag === 'alpha' || tag === 'rc') {
		return {channel: tag, allowPrerelease: true}
	}
	return {channel: 'latest', allowPrerelease: false}
}

export function registerUpdaterHandlers(mainWindow: BrowserWindow): void {
	const installChannel = detectInstallChannel(app.getName())

	// Flatpak installs update from Arroxy's own Flatpak repo (`flatpak update`,
	// GNOME Software). The banner still matters: many users never open a software
	// centre, and a terminal-only user would otherwise never hear of an update.
	// On Linux electron-updater only checks inside an AppImage ($APPIMAGE set);
	// forceDevUpdateConfig is its one switch past that gate, and only the check
	// runs here — flatpak is NON_INSTALLABLE, so nothing is ever downloaded.
	if (installChannel === 'flatpak') autoUpdater.forceDevUpdateConfig = true

	// Portable and scoop targets ship a portable .exe that extracts to %TEMP% —
	// app-update.yml is absent from that extracted bundle, causing ENOENT when
	// electron-updater tries to read the feed. setFeedURL is authoritative and
	// overrides the missing file on all targets (no-op cost on NSIS/DMG/AppImage).
	// The channel must match the running version's semver tag so a beta install
	// queries beta.yml (not latest.yml — which 404s on prerelease releases).
	const {channel, allowPrerelease} = resolveUpdateChannel(app.getVersion())
	const resolvedFeed = resolveUpdateFeed(process.env, channel)
	if (resolvedFeed.kind === 'override') log.warn('[updater] reading releases from ARROXY_UPDATE_FEED_URL', resolvedFeed.feed)
	if (resolvedFeed.kind === 'rejected') log.warn('[updater] ignoring ARROXY_UPDATE_FEED_URL: only loopback http(s) URLs without credentials are allowed')
	autoUpdater.setFeedURL(resolvedFeed.feed)
	autoUpdater.channel = channel
	autoUpdater.allowDowngrade = false // channel setter silently sets allowDowngrade=true; override it
	autoUpdater.allowPrerelease = allowPrerelease

	autoUpdater.autoDownload = false
	autoUpdater.autoInstallOnAppQuit = false

	autoUpdater.removeAllListeners('update-available')
	autoUpdater.removeAllListeners('update-downloaded')
	autoUpdater.removeAllListeners('error')

	// Track the install request so an `error` event can resolve the in-flight
	// IPC call instead of leaving the renderer spinner hanging forever.
	let pendingInstall: ((result: UpdateInstallResult) => void) | null = null

	autoUpdater.on('update-available', info => {
		if (mainWindow.isDestroyed()) return
		const payload: UpdateAvailablePayload = {version: info.version, currentVersion: app.getVersion(), installChannel}
		mainWindow.webContents.send(IPC_CHANNELS.updaterAvailable, payload)
	})

	autoUpdater.on('update-downloaded', () => {
		if (pendingInstall) {
			pendingInstall({ok: true})
			pendingInstall = null
		}
		autoUpdater.quitAndInstall(false, true)
	})

	autoUpdater.on('error', err => {
		log.error('[updater]', err.message)
		if (pendingInstall) {
			pendingInstall({ok: false, error: err.message})
			pendingInstall = null
		}
	})

	ipcMain.removeHandler(IPC_CHANNELS.updaterInstall)
	ipcMain.handle(IPC_CHANNELS.updaterInstall, async (): Promise<UpdateInstallResult> => {
		// Defense-in-depth: the renderer never exposes the install button on these
		// channels, but a stray invoke must not clobber the external install.
		if (NON_INSTALLABLE.has(installChannel)) {
			return {ok: false, error: `install not supported for channel: ${installChannel}`}
		}

		const {promise, resolve} = Promise.withResolvers<UpdateInstallResult>()
		pendingInstall = resolve
		autoUpdater.downloadUpdate().catch((err: Error) => {
			if (pendingInstall) {
				pendingInstall({ok: false, error: err.message})
				pendingInstall = null
			}
		})
		return promise
	})

	setTimeout(() => {
		autoUpdater.checkForUpdates().catch((err: Error) => {
			log.error('[updater] checkForUpdates failed', err.message)
		})
	}, 5_000)
}
