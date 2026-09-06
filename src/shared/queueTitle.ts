// Backfill helpers for fabricated playlist row titles (`Untitled · #N`).
// Both backfill layers (deferred probe, artifact derivation) set a real title
// through withBackfilledTitle so the clearing rule lives in exactly one place.

import {DEFAULT_FILENAME_TEMPLATE} from './filenameTemplate.js'
import type {QueueItem} from './types.js'

const TITLE_ONLY_TEMPLATE = '{title}'

// Bound-id variant of the default template. bindFilenameTemplate replaces a
// known video id while leaving a placeholder `{title}` late-bound, so the job
// carries `{title} [abc123]` rather than the literal default. The brackets
// must hold a plain literal — any surviving `{token}` is another shape.
function isBoundDefaultTemplate(template: string): boolean {
	if (!template.startsWith('{title} [') || !template.endsWith(']')) return false
	const inner = template.slice('{title} ['.length, -1)
	return inner.length > 0 && !inner.includes('{') && !inner.includes('}')
}

// Trailing `[···]` group (the id suffix) on a default-shape filename stem.
// Greedy so a title that itself contains brackets keeps them.
const ID_SUFFIX_PATTERN = /^(?<title>.+) \[[^\]]+\]$/

function stemOf(fileName: string): string {
	const base = fileName.split(/[\\/]/).filter(Boolean).at(-1) ?? ''
	const dot = base.lastIndexOf('.')
	if (dot < 0) return base
	if (dot === 0) return ''
	return base.slice(0, dot)
}

/**
 * Derive a row title from a landed artifact filename, gated on the job's
 * filename template. Returns the title, or null when the template shape
 * cannot prove the title portion — never guess.
 *
 * Accepted shapes: the default `{title} [{id}]` (strip trailing ` [···]` plus
 * extension, bound-id variant included) and exactly `{title}` (strip
 * extension). Any other template, a missing filename, or an empty derivation
 * yields null.
 */
export function deriveTitleFromArtifact(fileName: string, filenameTemplate: string | undefined): string | null {
	if (filenameTemplate === TITLE_ONLY_TEMPLATE) {
		const title = stemOf(fileName).trim()
		return title === '' ? null : title
	}
	if (filenameTemplate !== DEFAULT_FILENAME_TEMPLATE && !isBoundDefaultTemplate(filenameTemplate ?? '')) return null
	const title = ID_SUFFIX_PATTERN.exec(stemOf(fileName))?.groups?.title?.trim() ?? ''
	return title === '' ? null : title
}

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
