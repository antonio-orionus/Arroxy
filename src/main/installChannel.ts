import fs from 'node:fs'
import path from 'node:path'
import type {InstallChannel} from '@shared/types.js'

// WinGet runs the same NSIS installer as a direct download, into the same
// folder. Its manifest passes --winget, and build/installer.nsh then leaves
// this file beside the executable on that install and on every later update,
// in-app ones included, until the app is uninstalled.
export const WINGET_MARKER_FILE = 'installed-by-winget'

// Detect at runtime; appName is a parameter so the module is testable without
// electron and so the app name lives in one place (package.json via app.getName()).
export function detectInstallChannel(appName: string): InstallChannel {
	const exec = process.execPath

	if (process.platform === 'linux' && fs.existsSync('/.flatpak-info')) {
		return 'flatpak'
	}

	if (process.platform === 'win32') {
		if (exec.includes('\\scoop\\apps\\') || exec.includes('\\ProgramData\\scoop\\apps\\')) {
			return 'scoop'
		}
		// electron-builder's portable target sets PORTABLE_EXECUTABLE_FILE in the
		// child process env; portable installs cannot self-update via NSIS.
		if (process.env.PORTABLE_EXECUTABLE_FILE) {
			return 'portable'
		}
		if (fs.existsSync(path.win32.join(path.win32.dirname(exec), WINGET_MARKER_FILE))) {
			return 'winget'
		}
		return 'direct'
	}

	if (process.platform === 'darwin') {
		if (fs.existsSync(`/opt/homebrew/Caskroom/${appName}`) || fs.existsSync(`/usr/local/Caskroom/${appName}`)) {
			return 'homebrew'
		}
		return 'direct'
	}

	// Linux, past the Flatpak check. The AppImage runtime sets APPIMAGE (the same
	// signal electron-updater gates on); a Linux install without it is the tar.gz.
	return process.env.APPIMAGE ? 'appimage' : 'tarball'
}
