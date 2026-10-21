// What intake tells the caller that took a link in. Main runs intake; the
// window turns these into toasts, and the hotkey into its notifications.

import type {BudgetFailure} from '@shared/nameBudget.js'
import type {IntakeOriginKind} from './intakeSchemas.js'
import type {QueueChoice} from '@shared/schemas.js'
import type {ProbeError} from '@shared/types.js'

// What the user hears about. Rows the event names are already in the queue.
export type QuickDownloadEvent =
	// `intakeId` names the link's intake, as every later outcome of it does.
	| {kind: 'added'; itemId: string; title: string; intakeId: string}
	| {kind: 'already-queued'; itemId: string | null}
	| {kind: 'not-added'}
	| {kind: 'queued'; itemId: string; skippedAlreadyQueued: number}
	| {kind: 'nothing-new'; skippedAlreadyQueued: number}
	// `overRowLimit`: the rows were refused as more than the caller may add
	// from one link, which the same link would make again.
	| {kind: 'failed'; itemId: string; title: string; probeError: ProbeError | null; overRowLimit?: true}
	| {kind: 'needs-choice'; itemId: string; choice: QueueChoice; capped: boolean}

// Where a link landed the moment it was taken in, before its probe answers.
export type IntakePlacement = Extract<QuickDownloadEvent, {kind: 'added' | 'already-queued' | 'not-added'}>

// `requestId` is the call that caused the outcome (taking the link in, a
// Retry, a choice), so the caller can tell its own outcomes apart.
export type IntakeEvent =
	| {kind: 'outcome'; requestId: string; intakeId: string | null; origin: IntakeOriginKind; outcome: QuickDownloadEvent}
	// A job's name could not fit and fell back to the built-in template.
	| {kind: 'filename-budget-failed'; reason: BudgetFailure; outputDir: string}
