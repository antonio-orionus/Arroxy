import type {WizardStep} from '../../store/types.js'

export type CopiedLinkAction = {kind: 'none'} | {kind: 'fill'; url: string} | {kind: 'replace'; url: string; previous: string}

export interface CopiedLinkContext {
	downloadTabActive: boolean
	bulkOpen: boolean
	formatsLoading: boolean
}

// One rule: on the idle Download tab, a copied link goes into the URL field.
// Anything in flight (a probe, the bulk dialog) or another tab makes it wait;
// the latest copied link is taken afterwards.
export function canApplyCopiedLink({bulkOpen, downloadTabActive, formatsLoading}: CopiedLinkContext): boolean {
	return downloadTabActive && !bulkOpen && !formatsLoading
}

export interface CopiedLinkUndoContext {
	wizardStep: WizardStep
	wizardUrl: string
	formatsLoading: boolean
}

// Undo puts back only the field's text, so it is safe only while nothing took
// the copied link yet: still on the URL step, no probe started from it, and
// the field not edited since (a quick download clears the field).
export function canUndoCopiedLink({formatsLoading, wizardStep, wizardUrl}: CopiedLinkUndoContext, link: string): boolean {
	return wizardStep === 'url' && !formatsLoading && wizardUrl === link
}

// The field only holds a link not yet submitted, so it is replaced without
// asking; `previous` lets the toast undo it.
export function resolveCopiedLink(link: string, currentUrl: string): CopiedLinkAction {
	const current = currentUrl.trim()
	if (current === link) return {kind: 'none'}
	return current ? {kind: 'replace', url: link, previous: currentUrl} : {kind: 'fill', url: link}
}
