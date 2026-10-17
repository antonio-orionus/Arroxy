import {describe, expect, it} from 'vite-plus/test'
import {buildFeedbackHiddenFields} from '@renderer/components/system/feedbackSnapshot.js'
import {makeItem} from '../shared/fixtures.js'

const RUNTIME = {arch: 'x64', osVersion: '10.0.26200', installChannel: 'portable' as const}

describe('FeedbackSnapshot', () => {
	it('summarizes queue status and classified yt-dlp probe errors', () => {
		const fields = buildFeedbackHiddenFields({
			appMode: 'test',
			appVersion: '0.0.0-test',
			language: 'en',
			platform: 'linux',
			queue: [makeItem({id: 'q1', status: 'running'}), makeItem({id: 'q2', status: 'running'}), makeItem({id: 'q3', status: 'error'})],
			reportId: 'report-1',
			runtime: RUNTIME,
			settings: {common: {language: 'uk', cookiesMode: 'browser'}},
			wizardError: {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'blocked'}},
			wizardExtractor: 'youtube'
		})

		expect(fields).toMatchObject({app_locale: 'uk', cookies_mode: 'browser', extractor: 'youtube', queue_status: 'running:2,error:1', report_id: 'report-1', yt_dlp_error_kind: 'botBlock', error_code: 'none'})
	})

	it('reports the architecture, OS version and install channel', () => {
		const fields = buildFeedbackHiddenFields({appMode: 'test', appVersion: '0.0.0-test', language: 'en', platform: 'win32', queue: [], reportId: 'report-4', runtime: RUNTIME, settings: null, wizardError: null, wizardExtractor: ''})

		expect(fields).toMatchObject({platform: 'win32', architecture: 'x64', system_version: '10.0.26200', install_channel: 'portable'})
	})

	it('falls back for empty queue, unknown runtime facts and non-yt-dlp probe errors', () => {
		const fields = buildFeedbackHiddenFields({appMode: 'test', appVersion: '', language: 'en', platform: '', queue: [], reportId: 'report-2', runtime: {arch: '', osVersion: '', installChannel: null}, settings: null, wizardError: {kind: 'other', code: 'unknown', message: 'probe unavailable'}, wizardExtractor: ''})

		expect(fields).toMatchObject({app_version: 'unknown', platform: 'unknown', architecture: 'unknown', system_version: 'unknown', install_channel: 'unknown', queue_status: 'empty', extractor: 'none', yt_dlp_error_kind: 'none', error_code: 'unknown'})
	})

	it('sends only fields the Tally form declares', () => {
		const fields = buildFeedbackHiddenFields({appMode: 'test', appVersion: '0.0.0-test', language: 'en', platform: 'linux', queue: [], reportId: 'report-3', runtime: RUNTIME, settings: null, wizardError: null, wizardExtractor: ''})

		expect(Object.keys(fields).sort()).toEqual(['app_locale', 'app_mode', 'app_version', 'architecture', 'cookies_mode', 'error_code', 'extractor', 'install_channel', 'platform', 'queue_status', 'report_id', 'source', 'system_version', 'yt_dlp_error_kind'])
	})
})
