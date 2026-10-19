// Adapter for non-fatal renderer-side failures. Every method writes a console
// line for diagnostics and offers a user-facing message to a registered sink.
//
// The sink is injected rather than imported so this module stays free of any UI
// dependency: it is reached from `outputTemplates.ts`, which node-project tests
// exercise without a DOM. Importing a toast library here would drag one in.

import i18next from 'i18next'
import type {HotkeyOutcome} from '@shared/types.js'
import type {QueueChoice} from '@shared/schemas.js'
import {HOTKEY_OUTCOME_COPY} from '@shared/hotkeyOutcomes.js'
import {toastItemName} from './toastItemName.js'

export type NotificationLevel = 'error' | 'warning' | 'info'

// A button on the toast. `onClick` is the caller's command; this module only
// carries it, so it stays free of the store as well as of the UI.
export interface NotificationAction {
	label: string
	onClick: () => void
}

// Sonner draws one primary action and one secondary button, so a toast offers at most two.
export type NotificationActions = readonly [NotificationAction] | readonly [NotificationAction, NotificationAction]

export type NotificationSink = (level: NotificationLevel, message: string, id: string, actions?: NotificationActions) => void

// The failed preparation's main way forward: probe again, sign in first
// (`sign-in`: in Explore; `explore-offer`: switch to Explore, retry once signed
// in), or retry with the Explore sign-in the user already has.
export interface QuickDownloadFailureAction {
	kind: 'retry' | 'sign-in' | 'explore-offer' | 'explore-reuse'
	run: () => void
}

const FAILURE_ACTION_LABEL = {retry: 'common.retry', 'sign-in': 'wizard.formats.cookiesError.exploreSignIn.cta', 'explore-offer': 'wizard.formats.cookiesError.exploreOffer.cta', 'explore-reuse': 'wizard.formats.cookiesError.exploreReuse.cta'} as const satisfies Record<QuickDownloadFailureAction['kind'], string>

let sink: NotificationSink | null = null

/** Register the UI that renders notifications. `null` unregisters (tests). */
export function setNotificationSink(next: NotificationSink | null): void {
	sink = next
}

/**
 * `id` collapses repeats: warmup retries and repeated save failures fire the
 * same call many times, and a stack of identical toasts is noise, not signal.
 */
function emit(level: NotificationLevel, message: string, id: string, actions?: NotificationActions): void {
	if (actions) sink?.(level, message, id, actions)
	else sink?.(level, message, id)
}

function viewAction(onView: () => void): NotificationAction {
	return {label: i18next.t('notifications.quickDownload.view'), onClick: onView}
}

// View is left out when the caller has nowhere to send the user (a wizard run is open).
function viewOnly(onView: (() => void) | undefined): NotificationActions | undefined {
	return onView ? [viewAction(onView)] : undefined
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
	// Explore reported the sign-in "Sign in with Explore" waited for; the failed items probe again.
	exploreSignInRetrying(count: number): void {
		emit('info', i18next.t('notifications.exploreSignInRetrying', {count}), 'explore-sign-in-retry')
	},
	exploreSignOutFailed(error: unknown): void {
		console.error('[explore] sign-out failed', error)
		emit('error', i18next.t('notifications.exploreSignOutFailed'), 'explore-sign-out')
	},
	folderSelectFailed(error: unknown): void {
		console.error('[dialog] folder selection failed', error)
		emit('error', i18next.t('notifications.folderSelectFailed'), 'folder-select')
	},
	// After a single-video download with edits: keeping them is one click away.
	offerSaveEdits(onSave: () => void): void {
		emit('info', i18next.t('wizard.review.nextTime.title'), 'save-edits', [{label: i18next.t('wizard.review.nextTime.action'), onClick: onSave}])
	},
	profileSaved(name: string): void {
		emit('info', i18next.t('wizard.review.save.saved', {name}), 'profile-saved')
	},
	profileSaveFailed(error: unknown): void {
		console.error('[profiles] save failed', error)
		emit('error', i18next.t('wizard.review.save.failed'), 'profile-saved')
	},
	playlistFolderRejected(dir: string): void {
		console.warn('[playlist] picked folder is not usable as base + subfolder', dir)
		emit('warning', i18next.t('notifications.playlistFolderRejected'), 'playlist-folder')
	},
	// One method for every clipboard-intake toast: the callers pass their own
	// localized message and the distinction lives in their t() keys, not here.
	// Same surface and dedupe id as the autofill toast.
	clipboard(message: string, actions?: NotificationActions): void {
		console.info('[clipboard]', message)
		emit('info', message, 'clipboard', actions)
	},
	hotkeyOutcome(outcome: HotkeyOutcome): void {
		// Localized here (not by the caller) because main routes the same
		// outcome through mainT for OS notifications; the key table is shared
		// so both processes can never drift apart.
		const {key, level} = HOTKEY_OUTCOME_COPY[outcome]
		emit(level, i18next.t(key), 'hotkey')
	},
	// A batch that overlaps what is already live in the queue is trimmed rather
	// than rejected (see `withoutAlreadyQueued`). Not an error: the rest queued,
	// or there was nothing new to queue. One id, so repeats collapse.
	queueSkippedAlreadyQueued(count: number): void {
		console.info(`[queue] skipped ${count} video(s) already in the queue`)
		emit('info', i18next.t('notifications.queue.skippedAlreadyQueued', {count}), 'queue-skipped-already-queued')
	},
	// A quick download is placed as a row in Downloads before its probe runs.
	// One id: a burst of adds keeps one toast, showing the latest.
	quickDownloadAdded(title: string, onView?: () => void): void {
		emit('info', i18next.t('notifications.quickDownload.added', {title: toastItemName(title)}), 'quick-download-added', viewOnly(onView))
	},
	quickDownloadAlreadyQueued(onView?: () => void): void {
		emit('info', i18next.t('notifications.quickDownload.alreadyQueued'), 'quick-download-already-queued', viewOnly(onView))
	},
	// The link could not even be placed in Downloads (main refused the row).
	quickDownloadNotAdded(): void {
		emit('error', i18next.t('notifications.quickDownload.notAdded'), 'quick-download-not-added')
	},
	// One toast per row: a retry that fails again replaces its own toast.
	quickDownloadFailed(itemId: string, title: string, action: QuickDownloadFailureAction, onView?: () => void): void {
		const main: NotificationAction = {label: i18next.t(FAILURE_ACTION_LABEL[action.kind]), onClick: action.run}
		emit('error', i18next.t('notifications.quickDownload.failed', {title: toastItemName(title)}), `quick-download-failed-${itemId}`, onView ? [main, viewAction(onView)] : [main])
	},
	// `capped`: the probe stopped at the load limit, so `count` is a lower bound.
	// A playlist over the limit asks how many; a link that turned out to be a
	// list asks for a review.
	quickDownloadNeedsChoice(itemId: string, choice: {kind: QueueChoice['kind']; count: number; capped: boolean}, onView?: () => void): void {
		const key = choice.kind === 'playlist-cap' ? 'notifications.quickDownload.chooseHowMany' : choice.capped ? 'notifications.quickDownload.reviewCapped' : 'notifications.quickDownload.review'
		emit('info', i18next.t(key, {count: choice.count}), `quick-download-choice-${itemId}`, viewOnly(onView))
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
