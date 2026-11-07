// @vitest-environment jsdom

import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const PAGE_DIR = join(__dirname, '../../workers/feedback-viewer/public/arroxy/admin/feedback')
const REPORT_ID = '0f7559ce-10de-4122-801a-97d39a366fa4'

const REPORT = {
	reportId: REPORT_ID,
	log: null,
	logProblem: 'too_large',
	answers: {
		key: `feedback/by-report/${REPORT_ID}.answers.json`,
		submission: {
			submissionId: 'OQqzjXk',
			formName: 'Arroxy feedback or bug report',
			submittedAt: '2026-10-23T09:38:55.000Z',
			answers: [
				{label: 'app_version', type: 'HIDDEN_FIELDS', value: '0.7.4'},
				{label: 'What are you sending?', type: 'MULTIPLE_CHOICE', value: ['I have an idea']},
				{label: 'Screenshot', type: 'FILE_UPLOAD', value: [{name: 'shot.jpg', url: 'https://storage.tally.so/private/shot.jpg', mimeType: 'image/jpeg', size: 1}]},
				{label: 'Your email', type: 'INPUT_EMAIL', value: null}
			]
		}
	},
	answersProblem: null,
	access: {email: null}
}

async function loadPage(): Promise<void> {
	const html = readFileSync(join(PAGE_DIR, 'index.html'), 'utf8')
	document.documentElement.innerHTML = html.replace(/^<!doctype html>/i, '')
	vi.resetModules()
	await import('../../workers/feedback-viewer/src/viewer.js')
}

const byId = (id: string) => document.getElementById(id)!

describe('feedback viewer page', () => {
	beforeEach(() => {
		vi.unstubAllGlobals()
	})

	it('is private and asks for a report id', async () => {
		await loadPage()
		expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,nofollow')
		expect(document.querySelector('h1')?.textContent).toBe('Feedback logs')
		expect(byId('report-id').getAttribute('pattern')).toContain('0-9a-fA-F')
		expect(byId('fetch-feedback-log').textContent).toBe('Fetch log')
	})

	it('shows a report’s Tally answers and says why its log is missing', async () => {
		const fetchMock = vi.fn(async () => new Response(JSON.stringify(REPORT), {headers: {'content-type': 'application/json'}}))
		vi.stubGlobal('fetch', fetchMock)
		await loadPage()

		;(byId('report-id') as HTMLInputElement).value = REPORT_ID
		byId('feedback-log-form').dispatchEvent(new Event('submit', {cancelable: true}))
		await vi.waitFor(() => expect(byId('feedback-log-status').textContent).toBe('Answers loaded.'))

		expect(fetchMock).toHaveBeenCalledWith(`/arroxy/api/admin/feedback-log?report_id=${REPORT_ID}`, expect.anything())
		const answers = byId('feedback-answers-list')
		expect(answers.textContent).toContain('I have an idea')
		expect(answers.querySelector('a')?.getAttribute('href')).toBe('https://storage.tally.so/private/shot.jpg')
		expect(answers.textContent).toContain('—')
		expect(byId('feedback-answers-context').textContent).toContain('0.7.4')
		expect(byId('feedback-log-missing').textContent).toContain('over the 20 MB viewing cap')
		expect(byId('feedback-log-result').hidden).toBe(true)
	})

	it('explains a response that is not JSON, as when Access redirects the API call', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('<html>login</html>', {status: 302, headers: {'content-type': 'text/html'}}))
		)
		await loadPage()

		;(byId('report-id') as HTMLInputElement).value = REPORT_ID
		byId('feedback-log-form').dispatchEvent(new Event('submit', {cancelable: true}))
		await vi.waitFor(() => expect(byId('feedback-log-status').dataset.tone).toBe('error'))
		expect(byId('feedback-log-status').textContent).toContain('Cloudflare Access may be redirecting')
	})
})
