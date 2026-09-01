// Single copy table for hotkey outcomes, shared by both feedback surfaces:
// main's OS notifications (hotkeyFeedback.ts) and the renderer's focused-window
// toast (lib/notify.ts). One entry per HotkeyOutcome — adding an outcome to
// the schema without a row here is a type error in both processes at once
// (enforced by the `satisfies` clause). The i18n keys live under
// `notifications.hotkey.*` in every locale.
import type {HotkeyOutcome} from './schemas.js'

export const HOTKEY_OUTCOME_COPY = {
	queued: {key: 'notifications.hotkey.queued', level: 'info'},
	'already-queued': {key: 'notifications.hotkey.alreadyQueued', level: 'info'},
	'invalid-clipboard': {key: 'notifications.hotkey.invalidClipboard', level: 'error'},
	'multiple-urls': {key: 'notifications.hotkey.multipleUrls', level: 'info'},
	'needs-review': {key: 'notifications.hotkey.needsReview', level: 'info'},
	busy: {key: 'notifications.hotkey.busy', level: 'info'},
	'submission-failed': {key: 'notifications.hotkey.submissionFailed', level: 'error'}
} as const satisfies Record<HotkeyOutcome, {key: string; level: 'error' | 'info'}>
