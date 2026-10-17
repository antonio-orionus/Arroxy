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

	it('gives every app language its own form', () => {
		const ids = SUPPORTED_LANGS.map(feedbackFormId)
		expect(new Set(ids).size).toBe(SUPPORTED_LANGS.length)
	})
})
