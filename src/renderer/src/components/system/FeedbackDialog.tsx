import {useEffect, useRef} from 'react'
import {openTallyPopup} from '../../lib/tallyWidget.js'
import {useAppStore} from '../../store/useAppStore.js'
import {buildFeedbackHiddenFields} from './feedbackSnapshot.js'

const TALLY_FEEDBACK_FORM_ID = 'Ek6M8B'

interface FeedbackDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({open, onOpenChange}: FeedbackDialogProps): null {
	const openingRef = useRef(false)

	useEffect(() => {
		if (!open || openingRef.current) return
		openingRef.current = true
		const reportId = createReportId()
		const state = useAppStore.getState()

		void openTallyPopup(TALLY_FEEDBACK_FORM_ID, {
			layout: 'modal',
			width: 720,
			overlay: true,
			hiddenFields: buildFeedbackHiddenFields({
				appMode: import.meta.env.MODE,
				appVersion: window.appVersion,
				language: state.language,
				platform: window.platform,
				queue: state.queue,
				reportId,
				settings: state.settings,
				wizardError: state.wizardError,
				wizardExtractor: state.wizardExtractor,
				wizardStep: state.wizardStep
			}),
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
	}, [onOpenChange, open])

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

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
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
