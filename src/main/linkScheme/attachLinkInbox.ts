import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {ok} from '@shared/result.js'
import {handleRaw} from '@main/ipc/utils.js'
import type {LinkInbox} from './LinkInbox.js'

// Connects the inbox to the main window: a link brings the window forward and
// goes to the renderer, which puts it in the URL field through the copied
// link. The renderer says when it listens; a reload makes links wait again.
export function attachLinkInbox(inbox: LinkInbox, window: BrowserWindow, {headless}: {headless: boolean}): void {
	handleRaw(IPC_CHANNELS.linksRendererReady, async () => {
		inbox.rendererReady()
		return Promise.resolve(ok(undefined))
	})
	window.webContents.on('did-start-loading', () => inbox.rendererGone())
	inbox.attach({
		deliver: url => {
			if (window.isDestroyed()) return
			if (window.isMinimized()) window.restore()
			// Hidden to the tray, the window must show; a headless E2E window never does.
			if (!headless && !window.isVisible()) window.show()
			window.focus()
			window.webContents.send(IPC_CHANNELS.eventsOpenedLink, url)
		}
	})
}
