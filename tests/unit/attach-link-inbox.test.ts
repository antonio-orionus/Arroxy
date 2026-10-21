import {EventEmitter} from 'node:events'
import {describe, expect, it, vi} from 'vite-plus/test'
import type {BrowserWindow} from 'electron'

type RawHandler = () => Promise<unknown>
const handlers = new Map<string, RawHandler>()
vi.mock('@main/ipc/utils.js', () => ({
	handleRaw: (channel: string, handler: RawHandler) => {
		handlers.set(channel, handler)
	}
}))

import {IPC_CHANNELS} from '@shared/ipc.js'
import {buildArroxyLink} from '@main/linkScheme/arroxyLink.js'
import {LinkInbox} from '@main/linkScheme/LinkInbox.js'
import {attachLinkInbox} from '@main/linkScheme/attachLinkInbox.js'

const FIRST = 'https://www.youtube.com/watch?v=first'
const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

function setup(): {inbox: LinkInbox; webContents: EventEmitter & {send: ReturnType<typeof vi.fn>}; rendererReady: () => Promise<unknown>} {
	const webContents = Object.assign(new EventEmitter(), {send: vi.fn()})
	const window = {isDestroyed: () => false, isMinimized: () => false, isVisible: () => true, restore: vi.fn(), show: vi.fn(), focus: vi.fn(), webContents}
	const inbox = new LinkInbox({info: vi.fn(), warn: vi.fn()})
	attachLinkInbox(inbox, window as unknown as BrowserWindow, {clipboard: {ignoreCurrentClipboard: () => Promise.resolve()}, headless: false})
	return {inbox, webContents, rendererReady: () => handlers.get(IPC_CHANNELS.linksRendererReady)!()}
}

// A link received now is sent only if the renderer is listening.
async function linkIsSent(inbox: LinkInbox, webContents: {send: ReturnType<typeof vi.fn>}): Promise<boolean> {
	inbox.receive(buildArroxyLink(FIRST), 'open-url')
	await settle()
	return webContents.send.mock.calls.some(call => call[0] === IPC_CHANNELS.eventsOpenedLink && call[1] === FIRST)
}

describe('attachLinkInbox', () => {
	it('waits for the renderer to say it listens, then sends the link to it', async () => {
		const {inbox, webContents, rendererReady} = setup()
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		await settle()
		expect(webContents.send).not.toHaveBeenCalled()
		await rendererReady()
		await settle()
		expect(webContents.send).toHaveBeenCalledExactlyOnceWith(IPC_CHANNELS.eventsOpenedLink, FIRST)
	})

	it('makes links wait again when the main frame navigates to another page', async () => {
		const {inbox, webContents, rendererReady} = setup()
		await rendererReady()
		webContents.emit('did-start-navigation', {isMainFrame: true, isSameDocument: false})
		expect(await linkIsSent(inbox, webContents)).toBe(false)
		await rendererReady()
		await settle()
		expect(webContents.send).toHaveBeenCalledExactlyOnceWith(IPC_CHANNELS.eventsOpenedLink, FIRST)
	})

	it.each([
		['a subframe navigates', {isMainFrame: false, isSameDocument: false}],
		['the page only changes its hash or history entry', {isMainFrame: true, isSameDocument: true}]
	])('keeps links flowing when %s', async (_name, details) => {
		const {inbox, webContents, rendererReady} = setup()
		await rendererReady()
		webContents.emit('did-start-navigation', details)
		expect(await linkIsSent(inbox, webContents)).toBe(true)
	})

	it('makes links wait again when the renderer process is gone', async () => {
		const {inbox, webContents, rendererReady} = setup()
		await rendererReady()
		webContents.emit('render-process-gone')
		expect(await linkIsSent(inbox, webContents)).toBe(false)
	})
})
