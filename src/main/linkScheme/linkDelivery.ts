export interface LinkWindow {
	isDestroyed(): boolean
	isMinimized(): boolean
	isVisible(): boolean
	restore(): void
	show(): void
	focus(): void
	sendLink(url: string): void
}

export interface LinkClipboard {
	ignoreCurrentClipboard(): Promise<void>
}

// Brings the window forward and hands it the link. The clipboard's current
// text is marked seen first: the opened link is newer than any earlier copy.
// That wait can outlast the renderer's listener (a reload or a crash), so the
// link goes out only if `rendererListening` still holds afterwards; false
// means it was not sent and the caller keeps it for the next listener. A
// window destroyed meanwhile drops the link and counts as handled.
export function createLinkDelivery({window, clipboard, headless}: {window: LinkWindow; clipboard: LinkClipboard; headless: boolean}): (url: string, rendererListening: () => boolean) => Promise<boolean> {
	return async (url, rendererListening) => {
		if (window.isDestroyed()) return true
		await clipboard.ignoreCurrentClipboard()
		if (window.isDestroyed()) return true
		if (!rendererListening()) return false
		if (window.isMinimized()) window.restore()
		// Hidden to the tray, the window must show; a headless E2E window never does.
		if (!headless && !window.isVisible()) window.show()
		window.focus()
		window.sendLink(url)
		return true
	}
}
