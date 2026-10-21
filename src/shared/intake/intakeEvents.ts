// What intake tells the caller that took a link in. Main runs intake; the
// window turns these into toasts, and the hotkey into its notifications.

import type {BudgetFailure} from '@shared/nameBudget.js'
import type {IntakeOriginKind, QueueChoice} from '@shared/schemas.js'
import type {ProbeError} from '@shared/types.js'

// What the user hears about. Rows the event names are already in the queue.
export type QuickDownloadEvent =
	| {kind: 'added'; itemId: string; title: string}
	| {kind: 'already-queued'; itemId: string | null}
	| {kind: 'not-added'}
	| {kind: 'queued'; itemId: string; skippedAlreadyQueued: number}
	| {kind: 'nothing-new'; skippedAlreadyQueued: number}
	| {kind: 'failed'; itemId: string; title: string; probeError: ProbeError | null}
	| {kind: 'needs-choice'; itemId: string; choice: QueueChoice; capped: boolean}

// Where a link landed the moment it was taken in, before its probe answers.
export type IntakePlacement = Extract<QuickDownloadEvent, {kind: 'added' | 'already-queued' | 'not-added'}>

// `requestId` is the call that caused the outcome (taking the link in, a
// Retry, a choice), so the caller can tell its own outcomes apart.
export type IntakeEvent =
	| {kind: 'outcome'; requestId: string; intakeId: string | null; origin: IntakeOriginKind; outcome: QuickDownloadEvent}
	// A job's name could not fit and fell back to the built-in template.
	| {kind: 'filename-budget-failed'; reason: BudgetFailure; outputDir: string}
