import {useEffect, useRef} from 'react'
import type {SupportedLang} from '@shared/i18n/index.js'
import type {AppSettings, ProbeError, QueueItem} from '@shared/types.js'
import {openTallyPopup} from '../../lib/tallyWidget.js'

const TALLY_FEEDBACK_FORM_ID = 'Ek6M8B'

interface FeedbackDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	settings: AppSettings | null
	language: SupportedLang
	wizardStep: string
	wizardExtractor: string
	wizardError: ProbeError | null
	queue: QueueItem[]
}

export function FeedbackDialog({open, onOpenChange, settings, language, wizardStep, wizardExtractor, wizardError, queue}: FeedbackDialogProps): null {
	const openingRef = useRef(false)

	useEffect(() => {
		if (!open || openingRef.current) return
		openingRef.current = true
		const reportId = createReportId()

		void openTallyPopup(TALLY_FEEDBACK_FORM_ID, {
			layout: 'modal',
			width: 720,
			overlay: true,
			hiddenFields: buildHiddenFields({settings, language, wizardStep, wizardExtractor, wizardError, queue, reportId}),
			onSubmit: () => {
				window.appApi.analytics.track('feedback_submitted', {report_id: reportId, diagnostic_report_created: true})
				void uploadDiagnostic(reportId)
			}
		})
			.catch(error => {
				window.appApi.analytics.track('feedback_open_failed', {report_id: reportId, message: errorMessage(error).slice(0, 160)})
			})
			.finally(() => {
				openingRef.current = false
				onOpenChange(false)
			})
	}, [language, onOpenChange, open, queue, settings, wizardError, wizardExtractor, wizardStep])

	return null
}

async function uploadDiagnostic(reportId: string): Promise<void> {
	try {
		const result = await window.appApi.logs.uploadFeedbackDiagnostic({reportId})
		if (result.ok) {
			window.appApi.analytics.track('feedback_diagnostic_uploaded', {report_id: reportId, raw_bytes: result.data.rawBytes, compressed_bytes: result.data.compressedBytes, truncated: result.data.truncated})
			return
		}
		window.appApi.analytics.track('feedback_diagnostic_upload_failed', {report_id: reportId, message: result.error.message.slice(0, 160)})
	} catch (error) {
		window.appApi.analytics.track('feedback_diagnostic_upload_failed', {report_id: reportId, message: errorMessage(error).slice(0, 160)})
	}
}

interface HiddenFieldsInput {
	settings: AppSettings | null
	language: SupportedLang
	wizardStep: string
	wizardExtractor: string
	wizardError: ProbeError | null
	queue: QueueItem[]
	reportId: string
}

function buildHiddenFields({settings, language, wizardStep, wizardExtractor, wizardError, queue, reportId}: HiddenFieldsInput): Record<string, string> {
	return {
		app_version: hiddenValue(window.appVersion, 'unknown'),
		platform: hiddenValue(window.platform, 'unknown'),
		operating_system: hiddenValue(window.platform, 'unknown'),
		app_locale: hiddenValue(settings?.common?.language ?? language ?? navigator.language, 'unknown'),
		cookies_mode: hiddenValue(settings?.common?.cookiesMode, 'unknown'),
		extractor: hiddenValue(wizardExtractor, 'none'),
		wizard_step: hiddenValue(wizardStep, 'unknown'),
		queue_status: summarizeQueueStatus(queue),
		app_mode: hiddenValue(import.meta.env.MODE, 'unknown'),
		source: 'app-footer',
		report_id: reportId,
		diagnostic_report_created: 'true',
		diagnostic_upload_status: 'requested',
		diagnostic_raw_bytes: 'pending',
		diagnostic_compressed_bytes: 'pending',
		diagnostic_truncated: 'pending',
		diagnostic_sha256: 'pending',
		yt_dlp_error_kind: wizardError?.kind === 'ytdlp' ? hiddenValue(wizardError.error.kind, 'unknown') : 'none',
		error_code: wizardError?.kind === 'other' ? hiddenValue(wizardError.message, 'unknown') : 'none'
	}
}

function hiddenValue(value: string | undefined | null, fallback: string): string {
	const normalized = value?.trim() ?? ''
	return normalized.length > 0 ? normalized : fallback
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

function summarizeQueueStatus(queue: QueueItem[]): string {
	if (queue.length === 0) return 'empty'
	const counts = new Map<string, number>()
	for (const item of queue) {
		counts.set(item.status, (counts.get(item.status) ?? 0) + 1)
	}
	return [...counts.entries()].map(([status, count]) => `${status}:${count}`).join(',')
}

function createReportId(): string {
	if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
	const bytes = new Uint8Array(16)
	globalThis.crypto.getRandomValues(bytes)
	bytes[6] = (bytes[6] & 0x0f) | 0x40
	bytes[8] = (bytes[8] & 0x3f) | 0x80
	const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
