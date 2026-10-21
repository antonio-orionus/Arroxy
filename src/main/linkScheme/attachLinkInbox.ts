import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {ok} from '@shared/result.js'
import {handleRaw} from '@main/ipc/utils.js'
import type {LinkInbox} from './LinkInbox.js'
import {createLinkDelivery, type LinkClipboard} from './linkDelivery.js'

// Connects the inbox to the main window: a link brings the window forward and
// goes to the renderer, which puts it in the URL field through the copied
// link. The renderer says when it listens; a reload or a crash makes links
// wait again.
export function attachLinkInbox(inbox: LinkInbox, window: BrowserWindow, {clipboard, headless}: {clipboard: LinkClipboard; headless: boolean}): void {
	handleRaw(IPC_CHANNELS.linksRendererReady, async () => {
		inbox.rendererReady()
		return Promise.resolve(ok(undefined))
	})
	window.webContents.on('did-start-navigation', details => {
		if (details.isMainFrame && !details.isSameDocument) inbox.rendererGone()
	})
	window.webContents.on('render-process-gone', () => inbox.rendererGone())
	const deliver = createLinkDelivery({
		window: {isDestroyed: () => window.isDestroyed(), isMinimized: () => window.isMinimized(), isVisible: () => window.isVisible(), restore: () => window.restore(), show: () => window.show(), focus: () => window.focus(), sendLink: url => window.webContents.send(IPC_CHANNELS.eventsOpenedLink, url)},
		clipboard,
		headless
	})
	inbox.attach({deliver})
}
