import {app, ipcMain, type BrowserWindow} from 'electron'
import electronUpdater from 'electron-updater'

const {autoUpdater} = electronUpdater
import log from 'electron-log/main.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {detectInstallChannel} from '@main/installChannel.js'
import {resolveUpdateFeed} from '@main/updateFeed.js'
import {canMoveUnderHomebrew, installArroxyWithHomebrew, upgradeArroxyWithHomebrew} from '@main/services/binary/HomebrewRepair.js'
import type {InstallChannel, UpdateAvailablePayload, UpdateInstallResult} from '@shared/types.js'

// Channels where the in-app installer should not run — either because an
// external package manager owns updates (scoop/flatpak), because the
// install layout can't accept an NSIS overwrite (portable), or because
// electron-updater is inactive there (tarball). Where a check still runs, the
// renderer gets a banner with a command or download link instead. Homebrew is
// handled separately: the app runs `brew upgrade` itself, then relaunches.
const NON_INSTALLABLE: ReadonlySet<InstallChannel> = new Set(['scoop', 'portable', 'flatpak', 'tarball'])

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

	// Decided by the main process, never by the renderer: only a stable direct
	// install in /Applications with brew on the Mac may be moved under Homebrew.
	// Prereleases are excluded because the cask is stable-only: the force-install
	// would downgrade a beta user to the previous stable release.
	let homebrewOnMac = false
	// The version the banner announced. Homebrew runs must reach it before the app
	// relaunches: a stale tap or an already-current cask also exits 0.
	let announcedVersion = ''

	async function announceUpdate(version: string): Promise<void> {
		announcedVersion = version
		// A failed probe only withholds the offer; it must never swallow the update notice.
		if (installChannel === 'direct' && !allowPrerelease) homebrewOnMac = await canMoveUnderHomebrew().catch(() => false)
		if (mainWindow.isDestroyed()) return
		const payload: UpdateAvailablePayload = {version, currentVersion: app.getVersion(), installChannel, homebrewAvailable: homebrewOnMac}
		mainWindow.webContents.send(IPC_CHANNELS.updaterAvailable, payload)
	}

	autoUpdater.on('update-available', info => {
		void announceUpdate(info.version)
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

	// The cask upgrade swaps the .app bundle in place; relaunching starts the new
	// version from the same path. A second invoke mid-upgrade must not start a
	// second `brew`, which would just fight over Homebrew's lock.
	let homebrewUpgradeRunning = false
	async function updateWithHomebrew(runBrew: (expectedVersion: string) => Promise<void>): Promise<UpdateInstallResult> {
		if (!announcedVersion) return {ok: false, error: 'No update has been announced.'}
		if (homebrewUpgradeRunning) return {ok: false, error: 'An upgrade is already running.'}
		homebrewUpgradeRunning = true
		try {
			await runBrew(announcedVersion)
		} catch (err) {
			homebrewUpgradeRunning = false
			const message = err instanceof Error ? err.message : String(err)
			log.error('[updater] brew update failed', message)
			return {ok: false, error: message}
		}
		app.relaunch()
		// quit(), not exit(): exit() skips `before-quit`, which cancels running
		// downloads and disposes the tray, hotkeys and token service. With running
		// downloads quit() finishes asynchronously, and the renderer re-enables its
		// button as soon as this resolves, so the guard stays set after a success.
		app.quit()
		return {ok: true}
	}

	ipcMain.removeHandler(IPC_CHANNELS.updaterInstall)
	ipcMain.handle(IPC_CHANNELS.updaterInstall, async (): Promise<UpdateInstallResult> => {
		// Defense-in-depth: the renderer never exposes the install button on these
		// channels, but a stray invoke must not clobber the external install.
		if (NON_INSTALLABLE.has(installChannel)) {
			return {ok: false, error: `install not supported for channel: ${installChannel}`}
		}

		if (installChannel === 'homebrew') return updateWithHomebrew(upgradeArroxyWithHomebrew)
		if (installChannel === 'direct' && homebrewOnMac) return updateWithHomebrew(installArroxyWithHomebrew)

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
