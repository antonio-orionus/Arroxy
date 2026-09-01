import {Notification, app, type BrowserWindow} from 'electron'
import {spawn} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import log from 'electron-log/main.js'

import type {HotkeyOsNotifier} from './hotkeyFeedback.js'

// Production: the packaged Arroxy.app has its own bundle ID, so Electron's
// Notification is properly attributed, appears in System Settings, and the
// click reveals the queue.
function electronNotifier(win: BrowserWindow): HotkeyOsNotifier {
	return {
		show: body => {
			const notification = new Notification({title: 'Arroxy', body, silent: false})
			notification.on('click', () => {
				if (!win.isDestroyed()) {
					win.show()
					win.focus()
				}
			})
			notification.show()
		}
	}
}

// Dev shell: the unsigned Electron.app (com.github.Electron) is permanently
// unauthorized to post notifications on modern macOS — the OS silently drops
// every post and no entry ever appears in Notification Center. terminal-notifier
// is a properly signed helper built for exactly this; its one-time permission
// prompt actually appears and sticks. Clicking its banner raises the dev app.
function terminalNotifier(): HotkeyOsNotifier {
	return {
		show: body => {
			const child = spawn('terminal-notifier', ['-title', 'Arroxy', '-message', body, '-group', 'arroxy-hotkey', '-execute', 'open -a Electron'], {stdio: 'ignore', detached: true})
			child.on('error', err => {
				log.warn('[hotkey] terminal-notifier unavailable — notification silently dropped (install: brew install terminal-notifier)', err)
			})
			child.unref()
		}
	}
}

// E2E assertion point: under the fixture harness there is no OS to observe,
// so notifications are appended as lines to a sink file the spec reads. Each
// body lands on exactly one line (newlines flattened) so assertions stay
// per-line. Gated to ARROXY_E2E by the factory below.
export function createSinkNotifier(sinkPath: string): HotkeyOsNotifier {
	return {
		show: body => {
			fs.mkdirSync(path.dirname(sinkPath), {recursive: true})
			fs.appendFileSync(sinkPath, `${body.replace(/\s+/g, ' ').trim()}\n`, 'utf8')
		}
	}
}

export function createHotkeyOsNotifier(win: BrowserWindow): HotkeyOsNotifier {
	const sinkPath = process.env.ARROXY_E2E === '1' ? process.env.ARROXY_E2E_OS_NOTIFIER_SINK_PATH : undefined
	if (sinkPath) {
		log.info('[hotkey] E2E build — OS notifications routed to sink file', {sinkPath})
		return createSinkNotifier(sinkPath)
	}
	if (!app.isPackaged) {
		log.info('[hotkey] dev build — OS notifications routed through terminal-notifier')
		return terminalNotifier()
	}
	return electronNotifier(win)
}
