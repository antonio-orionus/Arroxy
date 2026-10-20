// Backfill helpers for fabricated playlist row titles (`Untitled · #N`).
// Both backfill layers (deferred probe, artifact backstop) set a real title
// through withBackfilledTitle so the clearing rule lives in exactly one place.

import type {QueueItem} from './types.js'

/**
 * Spread-in for the placeholder flag. The field is optional-`true` rather than
 * `boolean`, so every seam that forwards a row has to omit it instead of
 * writing `false`; this keeps that conditional-spread in one place.
 */
export function placeholderTitleFlag(isPlaceholder: boolean | undefined): {titleIsPlaceholder?: true} {
	return isPlaceholder === true ? {titleIsPlaceholder: true} : {}
}

/**
 * Set a real title from any source and drop the placeholder flag, so layers
 * never fight and reruns are idempotent.
 */
export function withBackfilledTitle(item: QueueItem, title: string): QueueItem {
	const {titleIsPlaceholder: _titleIsPlaceholder, ...rest} = item
	return {...rest, title}
}
