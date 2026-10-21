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
export function createLinkDelivery({window, clipboard, headless}: {window: LinkWindow; clipboard: LinkClipboard; headless: boolean}): (url: string) => Promise<void> {
	return async url => {
		if (window.isDestroyed()) return
		await clipboard.ignoreCurrentClipboard()
		if (window.isDestroyed()) return
		if (window.isMinimized()) window.restore()
		// Hidden to the tray, the window must show; a headless E2E window never does.
		if (!headless && !window.isVisible()) window.show()
		window.focus()
		window.sendLink(url)
	}
}
