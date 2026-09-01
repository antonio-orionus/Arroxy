import {parseBulkUrls} from '@shared/bulkUrls.js'

export type ClipboardCandidateKind = 'single' | 'bulk'

export interface ClipboardCandidate {
	raw: string
	acceptedUrls: string[]
	count: number
	kind: ClipboardCandidateKind
}

export type ClipboardIntakeAction = {kind: 'ignore'} | {kind: 'fill-single'; candidate: ClipboardCandidate; url: string} | {kind: 'hint-bulk'; candidate: ClipboardCandidate} | {kind: 'store-pending'; candidate: ClipboardCandidate}

export interface ClipboardIntakeContext {
	candidate: ClipboardCandidate | null
	hasInput: boolean
	formatsLoading: boolean
	quickPreparing: boolean
	bulkOpen: boolean
}

export function buildClipboardCandidate(raw: string): ClipboardCandidate | null {
	const trimmed = raw.trim()
	if (!trimmed) return null

	const parsed = parseBulkUrls(trimmed)
	if (parsed.accepted.length < 1) return null

	const acceptedUrls = parsed.accepted.map(item => item.url)
	return {raw: trimmed, acceptedUrls, count: acceptedUrls.length, kind: acceptedUrls.length > 1 ? 'bulk' : 'single'}
}

// Intake contract: automation never opens dialogs. One link autofills the omnibox;
// many links only produce a hint pointing at the manual Bulk paste button; single
// links park as pending while the home surface is busy. Multi-URL candidates never
// pend — nothing may later fall through to filling the first URL silently.
export function resolveClipboardIntake({bulkOpen, candidate, formatsLoading, hasInput, quickPreparing}: ClipboardIntakeContext): ClipboardIntakeAction {
	if (!candidate) return {kind: 'ignore'}
	if (candidate.kind === 'bulk') return {kind: 'hint-bulk', candidate}
	if (bulkOpen || hasInput || formatsLoading || quickPreparing) return {kind: 'store-pending', candidate}

	const url = candidate.acceptedUrls[0]
	return url ? {kind: 'fill-single', candidate, url} : {kind: 'ignore'}
}
