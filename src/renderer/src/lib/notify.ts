// Adapter for non-fatal renderer-side failures. Every method writes a console
// line for diagnostics and offers a user-facing message to a registered sink.
//
// The sink is injected rather than imported so this module stays free of any UI
// dependency: it is reached from `outputTemplates.ts`, which node-project tests
// exercise without a DOM. Importing a toast library here would drag one in.

import i18next from 'i18next'
import type {HotkeyOutcome} from '@shared/types.js'
import {HOTKEY_OUTCOME_COPY} from '@shared/hotkeyOutcomes.js'

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
		emit('error', i18next.t('notifications.settingsSaveFailed'), 'settings-save')
	},
	warmupFailed(reason: string, error: unknown): void {
		// `reason` is a diagnostic string ('post-homebrew repair threw'); the user
		// gets one generic message, and one id so retries collapse.
		console.error(`[warmup] ${reason}`, error)
		emit('error', i18next.t('notifications.warmupFailed'), 'warmup')
	},
	shellActionFailed(action: string, error: unknown): void {
		console.error(`[shell] ${action} failed`, error)
		emit('error', i18next.t('notifications.shellActionFailed'), `shell-${action}`)
	},
	folderSelectFailed(error: unknown): void {
		console.error('[dialog] folder selection failed', error)
		emit('error', i18next.t('notifications.folderSelectFailed'), 'folder-select')
	},
	playlistFolderRejected(dir: string): void {
		console.warn('[playlist] picked folder is not usable as base + subfolder', dir)
		emit('warning', i18next.t('notifications.playlistFolderRejected'), 'playlist-folder')
	},
	// One method for every clipboard-intake toast: the callers pass their own
	// localized message and the distinction lives in their t() keys, not here.
	// Same surface and dedupe id as the autofill toast.
	clipboard(message: string): void {
		console.info('[clipboard]', message)
		emit('info', message, 'clipboard')
	},
	hotkeyOutcome(outcome: HotkeyOutcome): void {
		// Localized here (not by the caller) because main routes the same
		// outcome through mainT for OS notifications; the key table is shared
		// so both processes can never drift apart.
		const {key, level} = HOTKEY_OUTCOME_COPY[outcome]
		emit(level, i18next.t(key), 'hotkey')
	},
	filenameShortened(title: string, tokens: readonly string[]): void {
		// Deliberately console-only. Trimming a long title to fit is routine and
		// happens on a large share of downloads; surfacing it every time would
		// teach users to ignore the surface.
		console.info(`[filename] shortened ${tokens.join(', ')} to fit the filesystem limit`, title)
	},
	filenameBudgetFailed(reason: 'path-too-deep' | 'template-cannot-fit', outputDir: string): void {
		// Both reasons fall back to the built-in template, matching how main
		// already degrades an unparseable template rather than failing a download.
		// The fallback rescues most `path-too-deep` cases but not all, so that one
		// warns that the download may still fail and names the fix.
		console.warn(`[filename] ${reason}; falling back to the default template`, outputDir)
		const key = reason === 'path-too-deep' ? 'notifications.filenameFolderTooDeep' : 'notifications.filenameTemplateCannotFit'
		emit(reason === 'path-too-deep' ? 'warning' : 'info', i18next.t(key), `filename-${reason}`)
	}
}
