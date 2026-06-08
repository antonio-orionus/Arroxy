#!/usr/bin/env node
// Clears the electron-log dev log before starting the app.
// Reads userData path the same way Electron does at runtime.
import {rmSync, existsSync} from 'fs'
import {join} from 'path'
import {homedir, platform} from 'os'

const APP_NAME = 'arroxy'

function userDataPath() {
	switch (platform()) {
		case 'win32':
			return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), APP_NAME)
		case 'darwin':
			return join(homedir(), 'Library', 'Application Support', APP_NAME)
		default:
			return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), APP_NAME)
	}
}

const logFile = join(userDataPath(), 'logs', 'main.log')

if (existsSync(logFile)) {
	rmSync(logFile)
	console.log(`cleared ${logFile}`)
} else {
	console.log(`no log at ${logFile}`)
}
