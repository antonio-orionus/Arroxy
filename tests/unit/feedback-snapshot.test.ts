import {describe, expect, it} from 'vitest'
import {buildFeedbackHiddenFields} from '@renderer/components/system/feedbackSnapshot.js'
import {makeItem} from '../shared/fixtures.js'

describe('FeedbackSnapshot', () => {
	it('summarizes queue status and classified yt-dlp probe errors', () => {
		const fields = buildFeedbackHiddenFields({
			appMode: 'test',
			appVersion: '0.0.0-test',
			language: 'en',
			platform: 'linux',
			queue: [makeItem({id: 'q1', status: 'running'}), makeItem({id: 'q2', status: 'running'}), makeItem({id: 'q3', status: 'error'})],
			reportId: 'report-1',
			settings: {common: {language: 'uk', cookiesMode: 'browser'}},
			wizardError: {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'blocked'}},
			wizardExtractor: 'youtube',
			wizardStep: 'formats'
		})

		expect(fields).toMatchObject({app_locale: 'uk', cookies_mode: 'browser', extractor: 'youtube', queue_status: 'running:2,error:1', report_id: 'report-1', yt_dlp_error_kind: 'botBlock', error_code: 'none'})
	})

	it('falls back for empty queue and non-yt-dlp probe errors', () => {
		const fields = buildFeedbackHiddenFields({appMode: 'test', appVersion: '', language: 'en', platform: '', queue: [], reportId: 'report-2', settings: null, wizardError: {kind: 'other', code: 'unknown', message: 'probe unavailable'}, wizardExtractor: '', wizardStep: ''})

		expect(fields).toMatchObject({app_version: 'unknown', platform: 'unknown', queue_status: 'empty', extractor: 'none', wizard_step: 'unknown', yt_dlp_error_kind: 'none', error_code: 'unknown'})
	})
})
