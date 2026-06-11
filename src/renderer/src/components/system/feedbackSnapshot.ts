import type {AppSettings, ProbeError, QueueItem, SupportedLang} from '@shared/types.js'

type FeedbackSettings = Pick<AppSettings, 'common'> | {common?: Pick<AppSettings['common'], 'cookiesMode' | 'language'>} | null

export interface FeedbackHiddenFieldsInput {
	appMode: string
	appVersion: string
	language: SupportedLang
	platform: string
	queue: QueueItem[]
	reportId: string
	settings: FeedbackSettings
	wizardError: ProbeError | null
	wizardExtractor: string
	wizardStep: string
}

export function buildFeedbackHiddenFields({appMode, appVersion, language, platform, queue, reportId, settings, wizardError, wizardExtractor, wizardStep}: FeedbackHiddenFieldsInput): Record<string, string> {
	return {
		app_version: hiddenValue(appVersion, 'unknown'),
		platform: hiddenValue(platform, 'unknown'),
		operating_system: hiddenValue(platform, 'unknown'),
		app_locale: hiddenValue(settings?.common?.language ?? language, 'unknown'),
		cookies_mode: hiddenValue(settings?.common?.cookiesMode, 'unknown'),
		extractor: hiddenValue(wizardExtractor, 'none'),
		wizard_step: hiddenValue(wizardStep, 'unknown'),
		queue_status: summarizeQueueStatus(queue),
		app_mode: hiddenValue(appMode, 'unknown'),
		source: 'app-footer',
		report_id: reportId,
		diagnostic_mode: 'automatic',
		yt_dlp_error_kind: wizardError?.kind === 'ytdlp' ? hiddenValue(wizardError.error.kind, 'unknown') : 'none',
		error_code: wizardError?.kind === 'other' ? hiddenValue(wizardError.code, 'unknown') : 'none'
	}
}

function hiddenValue(value: string | undefined | null, fallback: string): string {
	const normalized = value?.trim() ?? ''
	return normalized.length > 0 ? normalized : fallback
}

function summarizeQueueStatus(queue: QueueItem[]): string {
	if (queue.length === 0) return 'empty'
	const counts = new Map<string, number>()
	for (const item of queue) {
		counts.set(item.status, (counts.get(item.status) ?? 0) + 1)
	}
	return [...counts.entries()].map(([status, count]) => `${status}:${count}`).join(',')
}
