import type {CookiesMode} from '@shared/schemas.js'
import type {SelectedFormat} from './downloadSmokeOutput.js'
import type {YtDlpInvocationSummary} from './services/YtDlp.js'

export const DOWNLOAD_SMOKE_RESULT_PREFIX = 'ARROXY_DOWNLOAD_SMOKE_RESULT '

// Exit code reports whether the tool worked (a format was selected), never the
// resulting quality — quality is read from `selection`.
export type DownloadSmokeOutcome = 'format-selected' | 'ytdlp-error' | 'timeout' | 'setup-error'

export interface DownloadSmokeReport {
	downloadSmoke: true
	ok: boolean
	outcome: DownloadSmokeOutcome
	appVersion: string
	platform: NodeJS.Platform
	arch: string
	url: string
	// `cookies` is a redacted label (settings / off / browser:<name> / file), never a path.
	inputs: {cookies: string; proxy: 'settings' | 'off' | 'set'; profileId: string; youtubePlayerClients: string[] | 'production-default'}
	effective: {cookiesMode: CookiesMode; proxyConfigured: boolean; formatSelector: string | null; formatSort: string | null}
	selection: {selectedFormat: string | null; formats: SelectedFormat[] | null; maxHeight: number | null}
	observed: {playerApiClients: string[]; sabrSkippedClients: string[]; warnings: string[]}
	attempts: YtDlpInvocationSummary[]
	error: string | null
	durationMs: number
}

export function serializeDownloadSmokeReport(report: DownloadSmokeReport): string {
	return `${DOWNLOAD_SMOKE_RESULT_PREFIX}${JSON.stringify(report)}`
}
