import {classifyUrlIntent, type UrlIntent} from '@shared/urlIntent.js'

export type WizardCollectionKind = Extract<UrlIntent, {kind: 'obvious-collection'}>['collection']

export function collectionKindForWizard(url: string): WizardCollectionKind | null {
	const intent = classifyUrlIntent(url)
	return intent.kind === 'obvious-collection' ? intent.collection : null
}

export function collectionKindForWizardUrls(wizardUrl: string, wizardWebpageUrl: string): WizardCollectionKind | null {
	return collectionKindForWizard(wizardUrl) ?? collectionKindForWizard(wizardWebpageUrl)
}
