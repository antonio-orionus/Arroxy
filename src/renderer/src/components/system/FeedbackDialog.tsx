import {useEffect, useRef} from 'react'
import log from 'electron-log/renderer.js'
import {openTallyPopup} from '../../lib/tallyWidget.js'
import {useAppStore} from '../../store/useAppStore.js'
import {feedbackFormId} from './feedbackForms.js'
import {buildFeedbackHiddenFields} from './feedbackSnapshot.js'

const logger = log.scope('feedback')

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
		logger.info('Opening Tally feedback popup', {reportId, source: 'footer'})

		void openTallyPopup(feedbackFormId(state.language), {
			key: `arroxy-feedback-${reportId}`,
			layout: 'modal',
			width: 720,
			overlay: true,
			autoClose: 3000,
			hiddenFields: buildFeedbackHiddenFields({appMode: import.meta.env.MODE, appVersion: window.appVersion, language: state.language, platform: window.platform, queue: state.queue, reportId, runtime: window.runtimeInfo, settings: state.settings, wizardError: state.wizardError, wizardExtractor: state.wizardExtractor}),
			onSubmit: () => {
				void uploadDiagnostic(reportId)
			}
		})
			.catch(error => {
				logger.warn('Tally feedback popup failed to open', {reportId, message: errorMessage(error)})
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
			logger.info('Feedback diagnostic uploaded', {reportId, rawBytes: result.data.rawBytes, compressedBytes: result.data.compressedBytes, truncated: result.data.truncated})
			return
		}
		logger.warn('Feedback diagnostic upload failed', {reportId, message: result.error.message})
	} catch (error) {
		logger.warn('Feedback diagnostic upload failed', {reportId, message: errorMessage(error)})
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
