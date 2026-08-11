// Adapter for non-fatal renderer-side failures. Today logs to console;
// future toast UI integration plugs in here without touching call sites.
export const notify = {
	settingsSaveFailed(field: string, error: unknown): void {
		console.error(`[settings] ${field} save failed`, error)
	},
	warmupFailed(reason: string, error: unknown): void {
		console.error(`[warmup] ${reason}`, error)
	},
	shellActionFailed(action: string, error: unknown): void {
		console.error(`[shell] ${action} failed`, error)
	},
	folderSelectFailed(error: unknown): void {
		console.error('[dialog] folder selection failed', error)
	},
	playlistFolderRejected(dir: string): void {
		console.warn('[playlist] picked folder is not usable as base + subfolder', dir)
	},
	clipboardAutofilled(message: string): void {
		console.info('[clipboard]', message)
	},
	filenameShortened(title: string, tokens: readonly string[]): void {
		console.info(`[filename] shortened ${tokens.join(', ')} to fit the filesystem limit`, title)
	},
	filenameBudgetFailed(reason: 'path-too-deep' | 'template-cannot-fit', outputDir: string): void {
		// Both reasons fall back to the built-in template, matching how main
		// already degrades an unparseable template rather than failing a download.
		console.warn(`[filename] ${reason}; falling back to the default template`, outputDir)
	}
}
