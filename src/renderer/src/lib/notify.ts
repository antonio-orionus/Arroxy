// Adapter for non-fatal renderer-side failures. Every method writes a console
// line for diagnostics and offers a user-facing message to a registered sink.
//
// The sink is injected rather than imported so this module stays free of any UI
// dependency: it is reached from `outputTemplates.ts`, which node-project tests
// exercise without a DOM. Importing a toast library here would drag one in.

export type NotificationLevel = 'error' | 'warning' | 'info'

export type NotificationSink = (level: NotificationLevel, message: string, id: string) => void

let sink: NotificationSink | null = null

/** Register the UI that renders notifications. `null` unregisters (tests). */
export function setNotificationSink(next: NotificationSink | null): void {
	sink = next
}

/**
 * `id` collapses repeats: warmup retries and repeated save failures fire the
 * same call many times, and a stack of identical toasts is noise, not signal.
 */
function emit(level: NotificationLevel, message: string, id: string): void {
	sink?.(level, message, id)
}

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
		emit('error', 'Could not open the folder picker.', 'folder-select')
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
