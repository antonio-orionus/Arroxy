import {IPC_CHANNELS} from '@shared/ipc.js'
import {mainT} from '@main/i18n.js'
import log from 'electron-log/main.js'
import type {HotkeyOutcome, HotkeyOutcomePayload, SupportedLang} from '@shared/schemas.js'
import type {HotkeyWindow} from './HotkeyService.js'

// Feedback routing for hotkey outcomes. Exactly one channel per attempt
// (OmniGet #198: no silent paths; never both channels at once):
// - the outcome event always reaches the renderer, which shows a sonner toast
//   when its window is focused;
// - when the window is hidden or unfocused, main additionally fires an OS
//   notification (the toast would be invisible).

export interface HotkeyOsNotifier {
	show(body: string): void
}

// Module-private: exercised via routeHotkeyOutcome in tests (repo rule —
// exports land together with their consumers).
function copyForOutcome(outcome: HotkeyOutcome, lang: SupportedLang): string {
	switch (outcome) {
		case 'queued':
			return mainT(lang, 'notifications.hotkey.queued')
		case 'already-queued':
			return mainT(lang, 'notifications.hotkey.alreadyQueued')
		case 'invalid-clipboard':
			return mainT(lang, 'notifications.hotkey.invalidClipboard')
		case 'multiple-urls':
			return mainT(lang, 'notifications.hotkey.multipleUrls')
		case 'needs-review':
			return mainT(lang, 'notifications.hotkey.needsReview')
		case 'busy':
			return mainT(lang, 'notifications.hotkey.busy')
		case 'submission-failed':
			return mainT(lang, 'notifications.hotkey.submissionFailed')
	}
}

export function routeHotkeyOutcome(event: HotkeyOutcomePayload, deps: {lang: SupportedLang; window: HotkeyWindow; osNotifier: HotkeyOsNotifier | null}): void {
	if (deps.window.isDestroyed()) {
		log.warn('[hotkey] outcome dropped — window destroyed', {outcome: event.outcome})
		return
	}
	// Main owns the windows, so main owns the verdict — the plan's either/or
	// rule: focused AND on-screen → toast, anything else → OS notification
	// (OmniGet #198). A visible-but-unfocused window cannot show the user a
	// toast (they are in another app), and a hidden window never fires a DOM
	// blur, so all three signals are sampled here, when the probe finishes.
	const toast = deps.window.isVisible() && !deps.window.isMinimized() && deps.window.isFocused()
	deps.window.send(IPC_CHANNELS.eventsHotkeyOutcome, {...event, toast})
	if (toast) return
	log.info('[hotkey] firing OS notification', {outcome: event.outcome, hasNotifier: deps.osNotifier !== null})
	deps.osNotifier?.show(copyForOutcome(event.outcome, deps.lang))
}
