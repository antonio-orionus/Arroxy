import {effectiveExtractorArgs} from 'yt-dlp-bridge'
import type {CookiesMode} from '@shared/schemas.js'
import type {SelectedFormat} from './services/download/formatLimitSignals.js'
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
	inputs: {cookies: string; proxy: 'settings' | 'off' | 'set'; profileId: string; youtubePlayerClients: string[] | 'production-default'; poToken: boolean; verbose: boolean}
	effective: {cookiesMode: CookiesMode; proxyConfigured: boolean; formatSelector: string | null; formatSort: string | null}
	// availableMaxHeight: the tallest video format the info-json offered, before the profile's cap.
	selection: {selectedFormat: string | null; formats: SelectedFormat[] | null; maxHeight: number | null; availableMaxHeight: number | null}
	// The poToken* fields are filled only by a verbose run.
	observed: {playerApiClients: string[]; sabrSkippedClients: string[]; warnings: string[]; poTokenFromConfigClients: string[]; poTokenDebug: string[]}
	// What the last spawn actually passed, read back from its argv — proof that
	// an override reached yt-dlp rather than just the settings overlay.
	spawned: SpawnArgsSummary | null
	attempts: YtDlpInvocationSummary[]
	error: string | null
	durationMs: number
}

export interface SpawnArgsSummary {
	cookies: 'none' | 'file' | 'browser'
	proxy: boolean
	poToken: boolean
	// null when no player_client was passed and yt-dlp chose its own.
	playerClients: string[] | null
}

// Works on redacted argv: secret values are hidden but their flags remain.
// The extractor args are read as yt-dlp reads them, where a later youtube block
// replaces an earlier one: the summary reports what the run used, not what the
// argv mentions.
export function summarizeSpawnArgs(args: readonly string[]): SpawnArgsSummary {
	const youtube = effectiveExtractorArgs(args).youtube
	const playerClients = youtube?.player_client
	return {cookies: args.includes('--cookies-from-browser') ? 'browser' : args.includes('--cookies') ? 'file' : 'none', proxy: args.includes('--proxy'), poToken: youtube?.po_token !== undefined, playerClients: playerClients === undefined ? null : [...playerClients]}
}

export function serializeDownloadSmokeReport(report: DownloadSmokeReport): string {
	return `${DOWNLOAD_SMOKE_RESULT_PREFIX}${JSON.stringify(report)}`
}
