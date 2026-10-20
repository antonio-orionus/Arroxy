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
		expect(feedbackFormId('nl')).toBe('xVXJZd')
		expect(feedbackFormId('he')).toBe('GexRLe')
		expect(feedbackFormId('gl')).toBe('VpLzVj')
	})

	it('gives every app language a form of its own', () => {
		const ids = SUPPORTED_LANGS.map(feedbackFormId)
		expect(ids.every(id => /^[A-Za-z0-9]{6}$/.test(id))).toBe(true)
		expect(new Set(ids).size).toBe(SUPPORTED_LANGS.length)
	})
})
