import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {handleRaw} from './utils.js'

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
	handleRaw(IPC_CHANNELS.windowMinimize, () => {
		mainWindow.minimize()
	})
	handleRaw(IPC_CHANNELS.windowMaximize, () => {
		if (mainWindow.isMaximized()) mainWindow.unmaximize()
		else mainWindow.maximize()
	})
	handleRaw(IPC_CHANNELS.windowClose, () => {
		mainWindow.close()
	})
	// eslint-disable-next-line @typescript-eslint/require-await -- preload calls invoke() and awaits a Promise; explicit async pins the contract so a future sync refactor is a compile error rather than a silent typing drift.
	handleRaw(IPC_CHANNELS.windowIsMaximized, async () => mainWindow.isMaximized())
}
