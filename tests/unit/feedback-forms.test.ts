import {describe, expect, it} from 'vite-plus/test'
import {feedbackFormId} from '@renderer/components/system/feedbackForms.js'
import {SUPPORTED_LANGS} from '@shared/schemas.js'

describe('feedbackFormId', () => {
	it('opens the English master form for English', () => {
		expect(feedbackFormId('en')).toBe('Ek6M8B')
	})

	it('opens the translated form for the app language', () => {
		expect(feedbackFormId('es')).toBe('dbqgxD')
		expect(feedbackFormId('zh-Hant')).toBe('yXZg66')
	})

	it('opens the English master for a language with no translated form yet', () => {
		expect(feedbackFormId('nl')).toBe('Ek6M8B')
		expect(feedbackFormId('he')).toBe('Ek6M8B')
	})

	it('never shares a translated form between two languages', () => {
		const translated = SUPPORTED_LANGS.map(feedbackFormId).filter(id => id !== 'Ek6M8B')
		expect(new Set(translated).size).toBe(translated.length)
	})
})
