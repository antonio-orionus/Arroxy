import type {TFunction} from 'i18next'

export type TranslationPort = (key: string, params?: Record<string, unknown>) => string

export function createTranslationPort(t: TFunction): TranslationPort {
	// Projection keys are runtime strings; own the generated-key type mismatch here.
	const translate = t as TranslationPort
	return (key, params) => translate(key, params)
}
