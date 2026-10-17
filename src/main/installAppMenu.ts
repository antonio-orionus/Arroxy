import {app, Menu, shell, type BrowserWindow} from 'electron'
import {DEFAULTS, DISCORD_URL} from '@shared/constants.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {MenuAction} from '@shared/schemas.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {mainT} from '@main/i18n.js'
import {buildAppMenuTemplate} from '@main/appMenu.js'

interface AppMenuInstallDeps {
	settingsStore: SettingsStore
	languageRef: {current: SupportedLang}
	getWindow: () => BrowserWindow
}

// Installs the macOS application menu and returns a `refresh` that rebuilds it
// from current settings; call it when the language, style, or theme changes so
// the radio groups and labels follow. Other platforms keep Electron's default
// menu, which the footer already covers.
export function installAppMenu({settingsStore, languageRef, getWindow}: AppMenuInstallDeps): {refresh: () => void} {
	function send(action: MenuAction): void {
		const window = getWindow()
		if (window.isDestroyed()) return
		// A menu pick while the window is hidden in the tray must still be seen.
		if (!window.isVisible()) window.show()
		window.webContents.send(IPC_CHANNELS.eventsMenuAction, action)
	}

	function refresh(): void {
		if (process.platform !== 'darwin') return
		const {common} = settingsStore.getSync()
		const template = buildAppMenuTemplate({appName: app.getName(), t: key => mainT(languageRef.current, key), style: common.uiStyle ?? DEFAULTS.uiStyle, theme: common.uiTheme ?? DEFAULTS.uiTheme, send, openDiscord: () => void shell.openExternal(DISCORD_URL)})
		Menu.setApplicationMenu(Menu.buildFromTemplate(template))
	}

	refresh()
	return {refresh}
}
