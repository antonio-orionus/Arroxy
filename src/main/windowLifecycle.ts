// Pure decision functions for main-window lifecycle events.
// No electron imports — all side effects stay in index.ts.

export type CloseAction =
	| 'allow' // let the window close normally (no downloads running)
	| 'hide' // minimize to tray
	| 'quit-direct' // quit immediately (no active downloads to warn about)
	| 'warn-and-quit' // show "active downloads" warning before quitting
	| 'ask-tray' // show first-time "close to tray?" dialog

export interface DecideCloseOpts {
	platform: NodeJS.Platform
	hasTray: boolean
	closeBehavior: string
	runningCount: number
}

export function decideCloseAction({platform, hasTray, closeBehavior, runningCount}: DecideCloseOpts): CloseAction {
	// No tray (darwin, or tray init failed) — close means quit.
	if (platform === 'darwin' || !hasTray) {
		return runningCount === 0 ? 'allow' : 'warn-and-quit'
	}

	// Tray mode: intercept every close and route by persisted preference.
	if (closeBehavior === 'tray') return 'hide'

	if (closeBehavior === 'quit') {
		return runningCount === 0 ? 'quit-direct' : 'warn-and-quit'
	}

	// 'ask' (default): no active downloads → just quit, else offer the tray dialog.
	return runningCount === 0 ? 'quit-direct' : 'ask-tray'
}

export type RendererCrashAction = 'reload' | 'quit' | 'ignore'

export interface DecideRendererCrashOpts {
	reason: string
	isMainWindow: boolean
	dialogResponse: number
}

export function decideRendererCrashAction({reason, isMainWindow, dialogResponse}: DecideRendererCrashOpts): RendererCrashAction {
	if (reason === 'clean-exit') return 'ignore'
	if (!isMainWindow) return 'ignore'
	return dialogResponse === 0 ? 'reload' : 'quit'
}
